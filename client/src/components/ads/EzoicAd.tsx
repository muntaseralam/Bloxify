import React from 'react';
import { useAdProvider, SimulatedAdNotice } from '../../context/AdProviderContext';

interface EzoicAdProps {
  id: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Ezoic Ad component for AI-based high-paying ads
 * 
 * To use this with real Ezoic:
 * 1. Sign up for Ezoic (https://www.ezoic.com)
 * 2. Follow their integration instructions
 * 3. When publishing, add the Ezoic integration script to your index.html
 * 4. Each ad placeholder needs a unique ID that corresponds to your Ezoic dashboard
 */
const EzoicAd = ({ id, className = '', style = {} }: EzoicAdProps) => {
  const { config } = useAdProvider();
  
  // Default styles
  const defaultStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '250px',
    width: '100%',
    overflow: 'hidden',
  };
  
  // Combine default styles with custom styles
  const combinedStyle = { ...defaultStyle, ...style };
  
  // In production, render the actual Ezoic ad
  if (config.isProduction && config.ezoicSiteId) {
    return (
      <div 
        id={`ezoic-pub-ad-placeholder-${id}`} 
        className={`ezoic-ad ${className}`}
        style={combinedStyle}
      />
    );
  }
  
  // In development, show simulated ad with a different style than AdSense
  return (
    <div className={`ezoic-ad-container ${className}`} style={combinedStyle}>
      <SimulatedAdNotice>
        <div className="simulated-ezoic p-4 text-center bg-blue-50 border border-blue-200 rounded" 
             style={{ width: '100%', minHeight: '250px' }}>
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-xs font-bold text-blue-500 uppercase">Ezoic Ad #{id}</span>
            <div className="mt-2 w-full">
              <div className="bg-blue-100 h-24 rounded w-full flex items-center justify-center">
                <div className="text-blue-400 text-sm">Premium AI-Optimized Content</div>
              </div>
              <div className="mt-2 flex justify-between">
                <div className="bg-blue-100 h-10 rounded w-1/3 mr-1"></div>
                <div className="bg-blue-100 h-10 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </SimulatedAdNotice>
    </div>
  );
};

export default EzoicAd;