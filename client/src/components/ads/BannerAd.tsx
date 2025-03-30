import React from 'react';
import { useAdProvider, SimulatedAdNotice } from '../../context/AdProviderContext';

interface BannerAdProps {
  className?: string;
  variant?: "horizontal" | "vertical";
}

const BannerAd = ({ 
  className = "", 
  variant = "horizontal" 
}: BannerAdProps) => {
  const { config } = useAdProvider();
  
  // Default styles based on variant
  const containerStyle: React.CSSProperties = {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: variant === 'horizontal' ? '90px' : '250px',
    maxHeight: variant === 'horizontal' ? '90px' : '600px',
  };
  
  // For production implementations, you would use your chosen ad network here
  if (config.isProduction) {
    // Depending on which ad network is configured, render the appropriate component
    switch (config.provider) {
      case 'adsense':
        // Use Google AdSense in production
        return (
          <div className={`banner-ad ${className}`} style={containerStyle}>
            {/* This would be replaced with actual AdSense code in production */}
            <div id="adsense-banner" style={containerStyle}></div>
          </div>
        );
        
      case 'adsterra':
        // Use Adsterra in production
        return (
          <div className={`banner-ad ${className}`} style={containerStyle}>
            {/* This would be replaced with actual Adsterra code in production */}
            <div id="adsterra-banner" style={containerStyle}></div>
          </div>
        );
        
      case 'ezoic':
        // Use Ezoic in production
        return (
          <div className={`banner-ad ${className}`} style={containerStyle}>
            {/* This would be replaced with actual Ezoic code in production */}
            <div id="ezoic-pub-ad-placeholder-banner" style={containerStyle}></div>
          </div>
        );
        
      default:
        // Fallback to simulated ad
        return renderSimulatedAd();
    }
  }
  
  // In development, show simulated banner ad
  return renderSimulatedAd();
  
  function renderSimulatedAd() {
    return (
      <div className={`banner-ad ${className}`} style={containerStyle}>
        <SimulatedAdNotice>
          <div 
            className="simulated-banner bg-gray-100 border border-gray-200 rounded p-2 w-full"
            style={{
              height: variant === 'horizontal' ? '90px' : '250px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: variant === 'horizontal' ? 'row' : 'column',
              padding: '0.5rem',
            }}
          >
            <div className="text-xs text-gray-500 font-bold mb-1">
              {variant === 'horizontal' ? 'BANNER' : 'SKYSCRAPER'} ADVERTISEMENT
            </div>
            
            {variant === 'horizontal' ? (
              <div className="flex items-center w-full">
                <div className="w-1/4 bg-gray-200 rounded h-12"></div>
                <div className="flex-1 pl-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : (
              <div className="w-full flex-1 flex flex-col items-center justify-center">
                <div className="w-full h-24 bg-gray-200 rounded mb-2"></div>
                <div className="w-4/5 h-3 bg-gray-200 rounded mb-2"></div>
                <div className="w-3/5 h-3 bg-gray-200 rounded mb-2"></div>
                <div className="w-2/3 h-6 bg-gray-300 rounded mt-2"></div>
              </div>
            )}
          </div>
        </SimulatedAdNotice>
      </div>
    );
  }
};

export default BannerAd;