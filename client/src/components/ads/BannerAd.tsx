import React from 'react';
import { useAdProvider, SimulatedAdNotice } from '../../context/AdProviderContext';
import GoogleAdSense from './GoogleAdSense';

interface BannerAdProps {
  className?: string;
  variant?: "horizontal" | "vertical";
}

/**
 * BannerAd component - wraps different ad providers based on configuration
 * 
 * This is a convenience component that renders the appropriate banner ad
 * based on the selected ad provider in the configuration.
 */
const BannerAd: React.FC<BannerAdProps> = ({
  className = '',
  variant = "horizontal",
}) => {
  const { config } = useAdProvider();
  
  // Choose the appropriate ad component based on provider
  if (config.isProduction) {
    switch (config.provider) {
      case 'adsense':
        return <GoogleAdSense position="custom" className={className} />;
      case 'ezoic':
        const ezoicId = variant === "horizontal" ? 1 : 2; // Different placeholders for different sizes
        const EzoicAd = React.lazy(() => import('./EzoicAd'));
        return (
          <React.Suspense fallback={<div className={`h-16 bg-gray-200 animate-pulse ${className}`}></div>}>
            <EzoicAd id={ezoicId} className={className} />
          </React.Suspense>
        );
      case 'adsterra':
        const AdsterraAd = React.lazy(() => import('./AdsterraAd'));
        return (
          <React.Suspense fallback={<div className={`h-16 bg-gray-200 animate-pulse ${className}`}></div>}>
            <AdsterraAd type="banner" zoneId="YOUR_ADSTERRA_BANNER_ZONE_ID" />
          </React.Suspense>
        );
      default:
        // Default to simulated ad if provider not recognized
        return renderSimulatedAd();
    }
  }
  
  // In development, show simulated ad
  return renderSimulatedAd();
  
  function renderSimulatedAd() {
    const isHorizontal = variant === "horizontal";
    const height = isHorizontal ? 'h-20' : 'h-60';
    const width = isHorizontal ? 'w-full' : 'w-[300px]';
    
    return (
      <div className={`banner-ad ${width} ${className}`}>
        <SimulatedAdNotice>
          <div className={`${height} bg-gradient-to-r from-gray-200 to-gray-300 rounded flex flex-col items-center justify-center p-2`}>
            <div className="text-xs font-bold text-gray-500 mb-1">ADVERTISEMENT</div>
            <div className="flex w-full h-full">
              {isHorizontal ? (
                <>
                  <div className="w-1/4 bg-gray-100 rounded mr-2 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gray-400 rounded-full"></div>
                  </div>
                  <div className="w-3/4 flex flex-col justify-center">
                    <div className="h-3 bg-gray-400 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-400 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-blue-400 rounded w-32 flex items-center justify-center">
                      <span className="text-xs text-white">Learn More</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col w-full">
                  <div className="h-32 bg-gray-100 rounded mb-2"></div>
                  <div className="h-3 bg-gray-400 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-400 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-blue-400 rounded w-32 mt-auto flex items-center justify-center">
                    <span className="text-xs text-white">Learn More</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SimulatedAdNotice>
      </div>
    );
  }
};

export default BannerAd;