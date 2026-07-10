import React from 'react'
import './Loader.css'

const Loader = ({ fullScreen = false, message = "Loading..." }) => {
  return (
    <div className={`premium-loader-container ${fullScreen ? 'fullscreen' : 'inline'}`}>
      <div className="premium-loader-content">
        <div className="gold-spinner">
          <div className="inner-ring ring-1"></div>
          <div className="inner-ring ring-2"></div>
          <div className="inner-ring ring-3"></div>
          <div className="center-dot"></div>
        </div>
        {message && <p className="loader-text">{message}</p>}
      </div>
    </div>
  )
}

export default Loader
