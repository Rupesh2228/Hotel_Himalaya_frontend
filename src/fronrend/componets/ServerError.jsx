import './ServerError.css'
import Components from './componets'
import LastComponents from './LastComponents'

const ServerError = () => {
  return (
    <div className="error-500-page">
      <Components />
      
      <div className="error-500-container">
        <div className="error-500-animation">
          <div className="digit-glow">5</div>
          <div className="gold-gear-container">
            <div className="gear-outer"></div>
            <div className="gear-inner"></div>
          </div>
          <div className="gold-gear-container secondary">
            <div className="gear-outer"></div>
            <div className="gear-inner"></div>
          </div>
        </div>
        
        <h1 className="error-500-title">Peak Interruption (500)</h1>
        <p className="error-500-message">
          Our system encountered an unexpected error while navigating these high paths. 
          Let us guide you safely back or refresh the page to try again.
        </p>
        
        <button className="error-500-btn" onClick={() => window.location.reload()}>
          Refresh Page
        </button>
      </div>

      <LastComponents />
    </div>
  )
}

export default ServerError
