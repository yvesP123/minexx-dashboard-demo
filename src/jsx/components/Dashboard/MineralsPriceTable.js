import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../../../services/AxiosInstance';
import { baseURL_ } from '../../../config';

const MineralsPriceTable = ({ refreshInterval = 60000 }) => { // 1 minute default refresh
  const [mineralsData, setMineralsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [countdown, setCountdown] = useState(refreshInterval / 1000);
  const refreshTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  // Define the minerals metadata (name, symbol, color) that we'll combine with API data
  const mineralsMetadata = {
    'USDLME-TIN': { name: 'Cassiterite', symbol: 'C', color: '#3e95cd' },
    'USDTIN': { name: 'Tin', symbol: 'Ti', color: '#ff7761' },
    'USDTIN3M': { name: 'Tantalum', symbol: 'Ta', color: '#e83e8c' },
    'USDMG': { name: 'Magnesium', symbol: 'Ti', color: '#4caf50' },
    'USDXAU': { name: 'Gold', symbol: 'G', color: '#ffc107' },
    // Add any additional minerals here with their display properties
    'USDW': { name: 'Wolframite', symbol: 'Wf', color: '#9c27b0' },
    'USDBX': { name: 'Bauxite', symbol: 'Ba', color: '#00bcd4' }
  };

  // Generate random percentage change for demo purposes
  // In a real implementation, you would get this from API
  const generateRandomChange = () => {
    return (Math.random() * 20 - 5).toFixed(1);
  };

  // Function to fetch minerals data
  const fetchMineralsData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${baseURL_}metals-apiall`);
      
      if (response.data && response.data.success) {
        // Transform API data into the format we need for display
        const formattedData = Object.entries(response.data.rates).map(([key, value]) => {
          const metadata = mineralsMetadata[key] || {
            name: key.replace('USD', ''),
            symbol: key.replace('USD', '').charAt(0),
            color: '#6c757d' // default color
          };
          
          // Format the price - divide by 1000 if it's too large (like gold)
          let displayPrice = value;
          let unit = '$';
          
          if (value > 100000) {
            displayPrice = value / 1000;
            unit = '$';
          }
          
          return {
            key,
            name: metadata.name,
            symbol: metadata.symbol,
            color: metadata.color,
            price: displayPrice.toFixed(1),
            unit,
            change: generateRandomChange(),
            isPositive: Math.random() > 0.3 // Mostly positive changes for demo
          };
        });
        
        setMineralsData(formattedData);
        setLastRefreshed(new Date());
        setCountdown(refreshInterval / 1000);
        setError(null);
      } else {
        setError('Failed to fetch minerals data');
      }
    } catch (err) {
      console.error('Error fetching minerals data:', err);
      setError('Error fetching minerals data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch and setup auto-refresh
  useEffect(() => {
    fetchMineralsData();
    
    // Setup auto-refresh
    refreshTimerRef.current = setInterval(() => {
      fetchMineralsData();
    }, refreshInterval);
    
    // Countdown timer
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : refreshInterval / 1000));
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [refreshInterval]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchMineralsData();
  };

  // Format time remaining to next refresh
  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  if (loading && mineralsData.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && mineralsData.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center text-danger">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h4 className="fs-20 mb-0">Minerals Price</h4>
        <div className="d-flex align-items-center">
          {/* <small className="fs-12 text-white-50 mr-2">
            Refresh in: {formatTimeRemaining(countdown)}
          </small> */}
          {/* <button 
            className="btn btn-sm btn-outline-info" 
            onClick={handleManualRefresh}
            disabled={loading}
          > */}
            {/* <i className={`fa fa-refresh ${loading ? 'fa-spin' : ''}`}></i>
          </button> */}
        </div>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-dark table-striped mb-0">
            <thead>
              <tr>
                <th className="py-3">Asset</th>
                <th className="py-3 text-right">Price</th>
                <th className="py-3 text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {mineralsData.map((mineral) => (
                <tr key={mineral.key}>
                  <td className="py-3">
                    <div className="d-flex align-items-center">
                      <div 
                        className="mineral-icon d-flex align-items-center justify-content-center rounded mr-3" 
                        style={{ 
                          width: '28px', 
                          height: '28px', 
                          backgroundColor: mineral.color,
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        {mineral.symbol}
                      </div>
                      <span className="text-nowrap">{mineral.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    {mineral.unit}{mineral.price}
                  </td>
                  <td className="py-3 text-right">
                    <span 
                      style={{ 
                        color: mineral.isPositive ? '#4caf50' : '#f44336',
                        fontWeight: 'bold'
                      }}
                    >
                      {mineral.isPositive ? '+' : ''}{mineral.change}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer text-right">
        <small className="text-white-50">
          Last updated: {lastRefreshed.toLocaleTimeString()}
        </small>
      </div>
    </div>
  );
};

export default MineralsPriceTable;