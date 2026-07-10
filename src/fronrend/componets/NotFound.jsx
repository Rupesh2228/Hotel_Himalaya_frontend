import React from 'react'
import { useNavigate } from 'react-router-dom'
import './NotFound.css'
import Components from './componets'
import LastComponents from './LastComponents'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="not-found-page">
      <Components />
      
      <div className="not-found-container">
        <div className="not-found-animation">
          <div className="digit-glow">4</div>
          <div className="gold-zero">
            <div className="zero-inner"></div>
          </div>
          <div className="digit-glow">4</div>
        </div>
        
        <h1 className="not-found-title">Lost in the Mountains?</h1>
        <p className="not-found-message">
          The page you are looking for has wandered off, or never existed.
          Let us guide you back to comfort and luxury.
        </p>
        
        <button className="not-found-btn" onClick={() => navigate('/')}>
          Return to Home
        </button>
      </div>

      <LastComponents />
    </div>
  )
}

export default NotFound
