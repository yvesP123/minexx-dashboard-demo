import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../../../services/AxiosInstance';
import { baseURL_ } from '../../../config';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { Logout } from '../../../store/actions/AuthActions';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

const TinPredictionChart = ({ language, refreshInterval = 300000 }) => { // 5 minutes default refresh
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [countdown, setCountdown] = useState(refreshInterval / 1000);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const refreshTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const t = (key) => {
    return key; // Replace with your translation function if needed
  };

  // Function to fetch forecast data
  const fetchForecast = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`${baseURL_}metals-api/tin-forecast-30days`);
      if (response.data.success) {
        setForecast(response.data.data);
        setLastRefreshed(new Date());
        setCountdown(refreshInterval / 1000);
      }
    } catch (err) {
      try {
        if (err.response && err.response.code === 403) {
          dispatch(Logout(navigate));
        } else {
          toast.warn(err.response ? err.response.message : err.message);
        }
      } catch (e) {
        console.log(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchForecast();
    
    // Setup auto-refresh
    refreshTimerRef.current = setInterval(() => {
      fetchForecast();
    }, refreshInterval);
    
    // Countdown timer
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : refreshInterval / 1000));
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [refreshInterval, dispatch, navigate]);

  // Chart creation effect
  useEffect(() => {
    if (!loading && forecast && chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Format data for the chart
      const predictions = forecast.predictions || [];
      const labels = predictions.map(pred => {
        const date = new Date(pred.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      
      const prices = predictions.map(pred => pred.price);
      const confidences = predictions.map(pred => pred.confidence);
      
      // Define colors based on confidence levels
      const pointColors = predictions.map(pred => {
        switch (pred.confidence) {
          case 'very high':
          case 'high':
            return 'rgba(46, 202, 234, 1)';  // Bright blue
          case 'medium':
            return 'rgba(241, 180, 76, 1)';  // Orange
          case 'low':
            return 'rgba(246, 145, 94, 1)';  // Light orange
          case 'very low':
            return 'rgba(249, 110, 87, 1)';  // Red
          default:
            return 'rgba(46, 202, 234, 1)';  // Default blue
        }
      });
      
      // Create gradient for line
      const ctx = chartRef.current.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(46, 202, 234, 0.5)');
      gradient.addColorStop(1, 'rgba(46, 202, 234, 0)');

      // Create the chart
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'TIN Price ($)',
            data: prices,
            borderColor: 'rgba(46, 202, 234, 1)',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: pointColors,
            pointRadius: 5,
            pointHoverRadius: 7,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animations: {
            tension: {
              duration: 1000,
              easing: 'linear',
              from: 0.8,
              to: 0.4,
              loop: false
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)',
                callback: function(value) {
                  return '$' + value.toLocaleString();
                }
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              },
              ticks: {
                color: 'rgba(255, 255, 255, 0.7)'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: function(tooltipItems) {
                  const idx = tooltipItems[0].dataIndex;
                  return predictions[idx].date;
                },
                label: function(context) {
                  const idx = context.dataIndex;
                  const pred = predictions[idx];
                  return [
                    `Price: $${pred.price.toLocaleString()}`,
                    `Change: ${pred.percentageChange}`,
                    `Confidence: ${pred.confidence.charAt(0).toUpperCase() + pred.confidence.slice(1)}`
                  ];
                },
                afterLabel: function(context) {
                  const idx = context.dataIndex;
                  const pred = predictions[idx];
                  return pred.confidenceExplanation ? 
                    `Explanation: ${pred.confidenceExplanation.substring(0, 100)}${pred.confidenceExplanation.length > 100 ? '...' : ''}` : 
                    '';
                }
              }
            },
            legend: {
              display: false
            }
          },
          onClick: (e, elements) => {
            if (elements.length > 0) {
              const index = elements[0].index;
              setSelectedPoint(predictions[index]);
            } else {
              setSelectedPoint(null);
            }
          }
        }
      });
    }
  }, [loading, forecast]);

  // Manual refresh handler
  const handleManualRefresh = () => {
    fetchForecast();
  };

  // Helper function to format the confidence badge
  const renderConfidenceBadge = (confidence) => {
    let badgeClass = 'badge badge-';
    
    switch (confidence) {
      case 'very high':
      case 'high':
        badgeClass += 'success';
        break;
      case 'medium':
        badgeClass += 'warning';
        break;
      case 'low':
      case 'very low':
        badgeClass += 'danger';
        break;
      default:
        badgeClass += 'primary';
    }
    
    return (
      <span className={badgeClass}>
        {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
      </span>
    );
  };

  // Format time remaining to next refresh
  const formatTimeRemaining = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  // Loading skeleton for the chart
  const renderLoadingSkeleton = () => {
    return (
      <div className="chart-skeleton-loading">
        <style jsx>{`
          @keyframes pulse {
            0% { opacity: 0.6; }
            50% { opacity: 0.8; }
            100% { opacity: 0.6; }
          }
          .chart-skeleton {
            background-color: #333;
            border-radius: 4px;
            height: 400px;
            width: 100%;
            animation: pulse 1.5s infinite ease-in-out;
          }
        `}</style>
        <div className="chart-skeleton"></div>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header d-sm-flex d-block pb-0 border-0">
        <div>
          <h4 className="fs-20 text-white">{t('Tin Price Prediction for the next 30 days')}</h4>
          <p className="mb-0 fs-12 text-white-50">{t('Price forecast based on market analysis')}</p>
        </div>
        {/* <div className="d-flex mt-sm-0 mt-3 align-items-center ml-auto">
          {!loading && forecast && (
            <>
              <small className="fs-13 text-white-50 mr-3">
                {t('Next refresh')}: {formatTimeRemaining(countdown)}
              </small>
              <small className="fs-13 text-white-50 mr-3">
                {t('Last updated')}: {lastRefreshed.toLocaleTimeString()}
              </small>
              <button 
                className="btn btn-sm btn-outline-info" 
                onClick={handleManualRefresh}
                disabled={loading}
              >
                <i className="fa fa-refresh mr-1"></i> {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </>
          )}
        </div> */}
      </div>
      <div className="card-body p-3">
        {loading ? (
          <div className="py-4">
            {renderLoadingSkeleton()}
          </div>
        ) : (
          <>
            <div style={{ height: '400px', position: 'relative' }}>
              <canvas ref={chartRef}></canvas>
            </div>
            
            {selectedPoint && (
              <div className="selected-point-details mt-4 p-3 bg-dark rounded">
                <h5 className="text-white">{new Date(selectedPoint.date).toDateString()}</h5>
                <div className="row">
                  <div className="col-md-4 mb-2">
                    <div className="text-white-50">Price:</div>
                    <div className="text-white fs-18">${selectedPoint.price.toLocaleString()}</div>
                  </div>
                  <div className="col-md-4 mb-2">
                    <div className="text-white-50">Change:</div>
                    <div className={`fs-18 ${parseFloat(selectedPoint.percentageChange) >= 0 ? 'text-success' : 'text-danger'}`}>
                      <i className={`fa fa-long-arrow-${parseFloat(selectedPoint.percentageChange) >= 0 ? 'up' : 'down'} me-1`}></i>
                      {selectedPoint.percentageChange}
                    </div>
                  </div>
                  <div className="col-md-4 mb-2">
                    <div className="text-white-50">Confidence:</div>
                    <div>{renderConfidenceBadge(selectedPoint.confidence)}</div>
                  </div>
                </div>
                {selectedPoint.confidenceExplanation && (
                  <div className="mt-2">
                    <div className="text-white-50">Explanation:</div>
                    <p className="text-white-50 mb-0">{selectedPoint.confidenceExplanation}</p>
                  </div>
                )}
                {selectedPoint.weeklyInsight && (
                  <div className="mt-2">
                    <div className="text-white-50">Weekly Trend:</div>
                    <p className="text-white-50 mb-0">{selectedPoint.weeklyInsight}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        <div className="card-footer border-0 pt-0 bg-transparent">
          <div className="row align-items-center mt-3">
            <div className="col-md-8">
              <p className="card-text mb-0">
                <small className="text-white-50">
                  {forecast?.method === 'ai_enhanced_deterministic' ? 
                    t('AI-enhanced prediction based on historical and market data') : 
                    t('Statistical prediction based on market trends and seasonal patterns')}
                </small>
              </p>
            </div>
            <div className="col-md-4 text-md-end">
              <div className="d-flex justify-content-md-end">
                <div className="me-3">
                  <span className="badge badge-success me-1"></span>
                  <small className="text-white-50">High confidence</small>
                </div>
                <div>
                  <span className="badge badge-danger me-1"></span>
                  <small className="text-white-50">Low confidence</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TinPredictionChart;