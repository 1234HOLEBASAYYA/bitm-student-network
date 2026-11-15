import React from 'react';

const LoadingSpinner = ({ fullScreen = false, text = 'Loading...' }) => {
  const spinnerStyle = {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#003366',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  };

  const containerStyle = fullScreen
    ? {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        gap: '16px',
        color: '#64748b'
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        gap: '12px',
        color: '#64748b'
      };

  return (
    <div style={containerStyle}>
      <style>
        {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
      </style>
      <div style={spinnerStyle}></div>
      {text && <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
