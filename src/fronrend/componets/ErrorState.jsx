import React from 'react';

/**
 * Reusable Error Box component with retry button
 */
export const ApiErrorCard = ({ title = "Unable to load data", message = "We couldn't connect to the server right now.", onRetry }) => {
  return (
    <div className="api-error-card" role="alert">
      <h3 className="api-error-title">{title}</h3>
      <p className="api-error-message">{message}</p>
      {onRetry && (
        <button 
          type="button" 
          className="api-error-btn" 
          onClick={onRetry}
          aria-label={`Retry loading ${title}`}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

/**
 * Small Stale/Unable to refresh warning bar
 */
export const StaleRefreshWarning = ({ message = "⚠️ Unable to refresh latest details", onRetry }) => {
  return (
    <div className="stale-refresh-warning" role="status">
      <span>{message}</span>
      {onRetry && (
        <button 
          type="button" 
          className="stale-refresh-btn" 
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
};
