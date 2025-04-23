import React, { useEffect, useState, useRef } from 'react';

const MetalPricesCandlestickChart = ({ data }) => {
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);
  const canvasRef = useRef(null);
  const [activeMetalType, setActiveMetalType] = useState('all'); // 'all', 'TIN', 'LME-TIN', 'TIN3M'
  const [hoveredCandle, setHoveredCandle] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Metal-specific colors
  const metalColors = {
    'TIN': '#FFA500',      // Orange
    'LME-TIN': '#2196F3',  // Blue
    'TIN3M': '#FF4444'     // Red
  };

  // Set up hover effects and tooltip functionality
  useEffect(() => {
    if (!tooltipRef.current) {
      const tooltip = document.createElement('div');
      tooltip.className = 'candlestick-tooltip';
      tooltip.style.position = 'absolute';
      tooltip.style.display = 'none';
      tooltip.style.backgroundColor = '#222';
      tooltip.style.color = '#fff';
      tooltip.style.padding = '8px 12px';
      tooltip.style.borderRadius = '4px';
      tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.3)';
      tooltip.style.zIndex = '1000';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.fontSize = '12px';
      tooltip.style.transition = 'opacity 0.2s';
      
      document.body.appendChild(tooltip);
      tooltipRef.current = tooltip;
    }
    
    return () => {
      if (tooltipRef.current) {
        document.body.removeChild(tooltipRef.current);
        tooltipRef.current = null;
      }
    };
  }, []);

  // Detect data changes and set loading state
  useEffect(() => {
    setLoading(true);
    
    // If data exists, delay a bit for animation smoothness then draw chart
    if (data) {
      const timer = setTimeout(() => {
        drawChart();
        setLoading(false);
      }, 800); // Slight delay for smoother transition
      return () => clearTimeout(timer);
    } else {
      setLoading(false);
    }
  }, [data]);

  // Handle changes to activeMetalType
  useEffect(() => {
    if (!loading) {
      drawChart();
    }
    
    // Handle window resize
    const handleResize = () => {
      if (chartRef.current && !loading) {
        drawChart();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeMetalType, loading]);

  // Process data for rendering - support both API response formats
  const processData = () => {
    if (!data) return { processedData: {}, sortedDates: [] };
    
    // Check if data has the right structure
    let metalData;
    if (data.data && data.data.data) {
      metalData = data.data.data;
    } else if (data.data) {
      metalData = data.data;
    } else {
      console.log("Unexpected data format:", data);
      return { processedData: {}, sortedDates: [] };
    }
    
    const allDates = new Set();
    const metalTypes = ['TIN', 'LME-TIN', 'TIN3M'];
    const processedData = {};
    
    // Collect all unique dates from all metal types
    metalTypes.forEach(type => {
      if (metalData[type]) {
        Object.keys(metalData[type]).forEach(date => allDates.add(date));
      }
    });
    
    // Sort dates chronologically
    const sortedDates = Array.from(allDates).sort();
    
    // Process data for each metal type
    metalTypes.forEach(type => {
      processedData[type] = [];
      
      sortedDates.forEach(date => {
        let value;
        
        // Handle both API response formats
        if (metalData[type][date]) {
          if (metalData[type][date][`USD${type}`]) {
            // Format 1: { USDTIN: value }
            value = metalData[type][date][`USD${type}`];
          } else if (metalData[type][date][type]) {
            // Format 2: { TIN: value }
            value = metalData[type][date][type];
          }
        }
        
        if (value !== undefined) {
          // Create OHLC data by simulating realistic price movements
          // For visualization purposes, we'll establish patterns based on sequential price changes
          
          // Find previous day to determine trend direction
          const prevDay = processedData[type].length > 0 ? 
            processedData[type][processedData[type].length - 1] : null;
            
          let open, high, low, close;
          
          if (prevDay) {
            // Determine if this is a continuation or reversal from previous day
            const prevTrend = prevDay.close >= prevDay.open;
            const randomFactor = Math.random();
            
            // 80% chance to continue previous trend, 20% to reverse
            if (randomFactor < 0.8) {
              if (prevTrend) {
                // Continuing uptrend
                open = prevDay.close * (0.997 + 0.003 * Math.random());
                close = value;
                high = Math.max(open, close) * (1 + 0.005 * Math.random());
                low = Math.min(open, close) * (1 - 0.003 * Math.random());
              } else {
                // Continuing downtrend
                open = prevDay.close * (1.003 - 0.003 * Math.random());
                close = value;
                high = Math.max(open, close) * (1 + 0.003 * Math.random());
                low = Math.min(open, close) * (1 - 0.005 * Math.random());
              }
            } else {
              // Trend reversal
              if (prevTrend) {
                // Reversal from up to down
                open = prevDay.close * (1 + 0.002 * Math.random());
                close = value;
                high = open * (1 + 0.004 * Math.random());
                low = close * (1 - 0.002 * Math.random());
              } else {
                // Reversal from down to up
                open = prevDay.close * (1 - 0.002 * Math.random());
                close = value;
                high = close * (1 + 0.002 * Math.random());
                low = open * (1 - 0.004 * Math.random());
              }
            }
          } else {
            // First day in the series - no previous trend
            open = value * (1 - 0.01 + 0.02 * Math.random());
            close = value;
            high = Math.max(open, close) * (1 + 0.005 * Math.random());
            low = Math.min(open, close) * (1 - 0.005 * Math.random());
          }
          
          processedData[type].push({
            date: new Date(date),
            open,
            high,
            close,
            low,
            formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            isUp: close >= open,
            metalType: type
          });
        }
      });
    });
    
    return { processedData, sortedDates };
  };

  // Draw the chart
  const drawChart = () => {
    if (!chartRef.current) return;
    
    // Clear previous chart
    while (chartRef.current.firstChild) {
      chartRef.current.removeChild(chartRef.current.firstChild);
    }
    
    const { processedData, sortedDates } = processData();
    if (sortedDates.length === 0) {
      // Display a message if no data is available
      const noDataMessage = document.createElement('div');
      noDataMessage.style.textAlign = 'center';
      noDataMessage.style.padding = '50px';
      noDataMessage.style.color = '#999';
      noDataMessage.innerHTML = '<h5>No data available</h5><p>Please check API response format.</p>';
      chartRef.current.appendChild(noDataMessage);
      console.log("No dates found in the data");
      return;
    }
    
    // Set up the canvas
    const canvas = document.createElement('canvas');
    canvasRef.current = canvas;
    const container = chartRef.current;
    canvas.width = container.clientWidth;
    canvas.height = 350;
    container.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1E2130'; // Dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Check if we have any data points to display
    let totalDataPoints = 0;
    Object.values(processedData).forEach(points => {
      totalDataPoints += points.length;
    });
    
    if (totalDataPoints === 0) {
      // Display a message if no data points are available
      ctx.fillStyle = '#999';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No data available for the selected metals', canvas.width / 2, canvas.height / 2);
      console.log("No data points found in the processed data");
      return;
    }
    
    // Chart settings
    const padding = { top: 20, right: 40, bottom: 50, left: 60 };
    const chartWidth = canvas.width - padding.left - padding.right;
    const chartHeight = canvas.height - padding.top - padding.bottom;
    
    // Find global min/max values across all metal types for consistent scaling
    let minValue = Infinity;
    let maxValue = -Infinity;
    
    Object.values(processedData).forEach(dataPoints => {
      dataPoints.forEach(point => {
        minValue = Math.min(minValue, point.low);
        maxValue = Math.max(maxValue, point.high);
      });
    });
    
    // Add padding to the value range for visual clarity
    const valueRange = maxValue - minValue;
    minValue -= valueRange * 0.05;
    maxValue += valueRange * 0.05;
    
    // Draw grid
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 0.5;
    ctx.setLineDash([3, 3]);
    
    // Horizontal grid lines
    const yGridCount = 5;
    for (let i = 0; i <= yGridCount; i++) {
      const y = padding.top + chartHeight - (i / yGridCount) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
      
      // Y-axis labels
      const value = minValue + (i / yGridCount) * (maxValue - minValue);
      ctx.fillStyle = '#999';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`$${Math.round(value).toLocaleString()}`, padding.left - 10, y + 4);
    }
    
    // Vertical grid lines
    const xGridCount = Math.min(10, sortedDates.length);
    for (let i = 0; i <= xGridCount; i++) {
      const x = padding.left + (i / xGridCount) * chartWidth;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, padding.top + chartHeight);
      ctx.stroke();
    }
    
    // Draw x-axis dates
    const dateInterval = Math.ceil(sortedDates.length / 10);
    sortedDates.forEach((date, index) => {
      if (index % dateInterval === 0) {
        const x = padding.left + (index / (sortedDates.length - 1)) * chartWidth;
        ctx.fillStyle = '#999';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        ctx.fillText(formattedDate, x, canvas.height - 15);
      }
    });
    
    // Reset line dash
    ctx.setLineDash([]);
    
    // Store candle positions for interactivity
    const candlePositions = [];
    
    // Draw candlesticks for each metal type
    Object.entries(processedData).forEach(([type, dataPoints]) => {
      // Skip if filtering is active and this is not the selected type
      if (activeMetalType !== 'all' && activeMetalType !== type) return;
      
      const color = metalColors[type];
      const candleWidth = chartWidth / (sortedDates.length * 4); // Adjust width based on number of dates
      
      dataPoints.forEach((point, index) => {
        const dateIndex = sortedDates.indexOf(point.date.toISOString().split('T')[0]);
        if (dateIndex === -1) return;
        
        // Position calculation
        const x = padding.left + (dateIndex / (sortedDates.length - 1)) * chartWidth;
        
        // Scale values to chart height
        const scaleY = value => padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
        
        const openY = scaleY(point.open);
        const closeY = scaleY(point.close);
        const highY = scaleY(point.high);
        const lowY = scaleY(point.low);
        
        // Apply offset for each metal type to avoid overlap
        const typeOffset = (Object.keys(metalColors).indexOf(type) - 1) * candleWidth * 1.5;
        const adjustedX = x + typeOffset;
        
        // Store candle position for interactivity
        candlePositions.push({
          x: adjustedX,
          y: Math.min(openY, closeY),
          width: candleWidth,
          height: Math.abs(closeY - openY),
          data: point,
          metalType: type
        });
        
        // Draw wick (high-low line)
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(adjustedX, highY);
        ctx.lineTo(adjustedX, lowY);
        ctx.stroke();
        
        // Draw body (open-close rectangle)
        const candleHeight = Math.abs(closeY - openY);
        const candleY = Math.min(openY, closeY);
        
        // Use green for up candles, red for down candles, but tint them based on metal type
        const baseColor = point.isUp ? '#4CAF50' : '#F44336';
        // Apply a subtle tint of the metal color
        ctx.fillStyle = baseColor;
        ctx.fillRect(adjustedX - candleWidth / 2, candleY, candleWidth, Math.max(1, candleHeight));
        
        // Add a colored border with the metal color
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(adjustedX - candleWidth / 2, candleY, candleWidth, Math.max(1, candleHeight));
      });
    });
    
    // Add mousemove event for interactivity
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Check if mouse is over any candle
      let found = false;
      for (const candle of candlePositions) {
        if (
          mouseX >= candle.x - candle.width / 2 &&
          mouseX <= candle.x + candle.width / 2 &&
          mouseY >= candle.y &&
          mouseY <= candle.y + candle.height
        ) {
          setHoveredCandle(candle);
          found = true;
          
          // Show tooltip
          if (tooltipRef.current) {
            const tooltip = tooltipRef.current;
            tooltip.style.display = 'block';
            tooltip.style.left = `${e.clientX + 15}px`;
            tooltip.style.top = `${e.clientY + 15}px`;
            
            const { data, metalType } = candle;
            tooltip.innerHTML = `
              <div style="font-weight: bold; color: ${metalColors[metalType]}; margin-bottom: 5px;">
                ${metalType} - ${data.formattedDate}
              </div>
              <div>Open: <span style="color: #ddd">$${Math.round(data.open).toLocaleString()}</span></div>
              <div>High: <span style="color: #ddd">$${Math.round(data.high).toLocaleString()}</span></div>
              <div>Low: <span style="color: #ddd">$${Math.round(data.low).toLocaleString()}</span></div>
              <div>Close: <span style="color: #ddd">${Math.round(data.close).toLocaleString()}</span></div>
            `;
          }
          
          break;
        }
      }
      
      if (!found) {
        setHoveredCandle(null);
        if (tooltipRef.current) {
          tooltipRef.current.style.display = 'none';
        }
      }
    });
    
    canvas.addEventListener('mouseleave', () => {
      setHoveredCandle(null);
      if (tooltipRef.current) {
        tooltipRef.current.style.display = 'none';
      }
    });
    
    // Draw legend
    const legendItems = [
      { label: 'LME TIN', color: metalColors['LME-TIN'], type: 'LME-TIN' },
      { label: 'TIN 3M', color: metalColors['TIN3M'], type: 'TIN3M' },
      { label: 'TIN', color: metalColors['TIN'], type: 'TIN' }
    ];
    
    const legendY = canvas.height - 20;
    let legendX = padding.left;
    
    legendItems.forEach(item => {
      // Color box
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, legendY, 12, 12);
      
      // Label
      ctx.fillStyle = activeMetalType === item.type || activeMetalType === 'all' ? '#fff' : '#777';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, legendX + 18, legendY + 10);
      
      // Make legend items clickable
      const labelWidth = ctx.measureText(item.label).width;
      const legendItemWidth = 18 + labelWidth + 20;
      
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        if (
          mouseX >= legendX &&
          mouseX <= legendX + legendItemWidth &&
          mouseY >= legendY - 5 &&
          mouseY <= legendY + 15
        ) {
          // Toggle filter
          if (activeMetalType === item.type) {
            setActiveMetalType('all');
          } else {
            setActiveMetalType(item.type);
          }
        }
      });
      
      legendX += legendItemWidth;
    });
    
    // Add "All" option to legend
    ctx.fillStyle = '#fff';
    ctx.font = activeMetalType === 'all' ? 'bold 12px Arial' : '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('All', legendX + 18, legendY + 10);
    
    // Add border around selected filter
    if (activeMetalType !== 'all') {
      const selectedItem = legendItems.find(item => item.type === activeMetalType);
      if (selectedItem) {
        const index = legendItems.indexOf(selectedItem);
        const startX = padding.left;
        let selectedX = startX;
        
        for (let i = 0; i < index; i++) {
          const labelWidth = ctx.measureText(legendItems[i].label).width;
          selectedX += 18 + labelWidth + 20;
        }
        
        const labelWidth = ctx.measureText(selectedItem.label).width;
        
        ctx.strokeStyle = selectedItem.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(selectedX - 2, legendY - 4, labelWidth + 24, 20);
      }
    }
    
    // Add Reset button if filtering is active
    if (activeMetalType !== 'all') {
      const resetX = canvas.width - padding.right - 60;
      
      ctx.fillStyle = '#444';
      ctx.fillRect(resetX, legendY - 4, 60, 20);
      
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Reset', resetX + 30, legendY + 10);
      
      canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        if (
          mouseX >= resetX &&
          mouseX <= resetX + 60 &&
          mouseY >= legendY - 4 &&
          mouseY <= legendY + 16
        ) {
          setActiveMetalType('all');
        }
      });
    }
  };

  // Handle legend click
  const handleLegendClick = (type) => {
    setActiveMetalType(type === activeMetalType ? 'all' : type);
  };

  // Add buttons for each metal type
  const renderControls = () => {
    return (
      <div className="candlestick-controls mb-2 d-flex flex-wrap">
        {Object.entries(metalColors).map(([type, color]) => (
          <button
            key={type}
            className="btn btn-sm mr-2 mb-1"
            style={{
              backgroundColor: activeMetalType === type ? color : '#333',
              color: '#fff',
              borderColor: color,
              marginRight: '8px'
            }}
            onClick={() => handleLegendClick(type)}
          >
            {type}
          </button>
        ))}
        <button
          className="btn btn-sm btn-outline-secondary mr-2 mb-1"
          style={{
            backgroundColor: activeMetalType === 'all' ? '#555' : 'transparent',
            marginRight: '8px'
          }}
          onClick={() => setActiveMetalType('all')}
        >
          Show All
        </button>
      </div>
    );
  };

  // Render loading skeleton or chart
  const renderChartContent = () => {
    if (loading) {
      return (
        <div className="chart-loading-container" style={{ 
          height: '350px', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          backgroundColor: '#1E2130',
          borderRadius: '4px'
        }}>
          {/* CSS for loading animation */}
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 0.8; }
                100% { opacity: 0.6; }
              }
              .pulse-animation {
                animation: pulse 1.5s infinite ease-in-out;
              }
              
              @keyframes chartBarLoad {
                0% { height: 20%; }
                50% { height: 60%; }
                100% { height: 40%; }
              }
              
              .chart-bar {
                animation: chartBarLoad 1.5s infinite ease-in-out;
                background-color: #333;
                width: 18px;
                border-radius: 3px;
                margin: 0 5px;
              }
              
              .chart-bar-1 { animation-delay: 0s; height: 30%; }
              .chart-bar-2 { animation-delay: 0.2s; height: 50%; }
              .chart-bar-3 { animation-delay: 0.4s; height: 70%; }
              .chart-bar-4 { animation-delay: 0.6s; height: 40%; }
              .chart-bar-5 { animation-delay: 0.8s; height: 60%; }
            `}
          </style>
          
          {/* Loading indicator */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            height: '100px', 
            marginBottom: '20px' 
          }}>
            <div className="chart-bar chart-bar-1" style={{ borderTop: `3px solid ${metalColors['TIN']}` }}></div>
            <div className="chart-bar chart-bar-2" style={{ borderTop: `3px solid ${metalColors['LME-TIN']}` }}></div>
            <div className="chart-bar chart-bar-3" style={{ borderTop: `3px solid ${metalColors['TIN3M']}` }}></div>
            <div className="chart-bar chart-bar-4" style={{ borderTop: `3px solid ${metalColors['TIN']}` }}></div>
            <div className="chart-bar chart-bar-5" style={{ borderTop: `3px solid ${metalColors['LME-TIN']}` }}></div>
          </div>
          
          <div className="text-muted">Loading market data...</div>
          
          {/* Skeleton legend */}
          <div style={{ 
            position: 'absolute', 
            bottom: '20px', 
            left: '60px',
            display: 'flex'
          }}>
            {Object.entries(metalColors).map(([type, color], index) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', marginRight: '30px' }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: color,
                  marginRight: '8px'
                }}></div>
                <div className="pulse-animation" style={{ 
                  width: `${40 + index * 10}px`, 
                  height: '12px', 
                  backgroundColor: '#333',
                  borderRadius: '4px'
                }}></div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div 
        ref={chartRef} 
        className="chart-container"
        style={{ width: '100%', height: '350px', position: 'relative' }}
      ></div>
    );
  };

  return (
    <div className="metal-prices-chart">
      {renderControls()}
      {renderChartContent()}
      {/* <div className="chart-info mt-2 text-center">
        <small className="text-muted">Click on legend items to filter by metal type</small>
      </div> */}
    </div>
  );
};

export default MetalPricesCandlestickChart;