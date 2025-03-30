import React from 'react';
import { useAdProvider } from '@/context/AdProviderContext';
import GoogleAdSense from './GoogleAdSense';
import EzoicAd from './EzoicAd';
import AdsterraAd from './AdsterraAd';

interface BannerAdProps {
  className?: string;
  variant?: "horizontal" | "vertical";
}

const BannerAd: React.FC<BannerAdProps> = ({
  className = '',
  variant = "horizontal"
}) => {
  const { config } = useAdProvider();
  
  // Use different ad providers based on configuration
  // In a real app, you might want to rotate between providers or select based on other factors
  function renderAd() {
    if (config.provider === 'adsense') {
      return (
        <GoogleAdSense
          position="bottom"
          format={variant === "horizontal" ? "horizontal" : "vertical"}
          className={className}
        />
      );
    } else if (config.provider === 'ezoic') {
      return (
        <EzoicAd
          id={variant === "horizontal" ? 1 : 2} // Unique ID for each ad position
          className={className}
        />
      );
    } else if (config.provider === 'adsterra') {
      return (
        <AdsterraAd
          type="banner"
          zoneId="BANNER_ZONE_ID" // Replace with your Adsterra zone ID when publishing
          className={className}
        />
      );
    } else {
      // Default to simulated ad in development mode
      return renderSimulatedAd();
    }
  }
  
  // Simulated banner ad for development
  function renderSimulatedAd() {
    const isHorizontal = variant === "horizontal";
    
    return (
      <div 
        className={`banner-ad ${isHorizontal ? 'banner-horizontal' : 'banner-vertical'} ${className}`}
        style={{
          width: '100%',
          height: isHorizontal ? '90px' : '280px',
          background: 'linear-gradient(135deg, #f4f9fc 0%, #d2e3f3 100%)',
          border: '1px solid #ccc',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '10px',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div className="text-center">
          <p className="text-sm font-bold text-blue-800">Banner Ad</p>
          <p className="text-xs text-blue-600">{isHorizontal ? '728×90' : '300×600'} Ad Unit</p>
        </div>
      </div>
    );
  }
  
  return renderAd();
};

export default BannerAd;