import './SplashScreen.css';

const SplashScreen = () => {
  return (
    <div className="splash-container">
      <div className="splash-content">
        {/* Loading Spinner */}
        <div className="loading-spinner">
          <div className="spinner-bar"></div>
          <div className="spinner-bar"></div>
          <div className="spinner-bar"></div>
          <div className="spinner-bar"></div>
          <div className="spinner-bar"></div>
          <div className="spinner-bar"></div>
          <div className="spinner-bar"></div>
          <div className="spinner-bar"></div>
        </div>
        
        {/* App Name */}
        <h1 className="app-title">FitFormal</h1>
        
        {/* Status Message */}
        <p className="status-message">Preparing your experience...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
