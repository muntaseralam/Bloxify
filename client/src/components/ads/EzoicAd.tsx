import React, { useEffect, useRef } from 'react';
import { useAdProvider, SimulatedAdNotice } from '@/context/AdProviderContext';
import { AD_CONFIG } from '@/lib/adConfig';

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
const EzoicAd: React.FC<EzoicAdProps> = ({ id, className = '', style = {} }) => {
  const { config } = useAdProvider();
  const adRef = useRef<HTMLDivElement>(null);
  
  // Initialize the Ezoic ad when in production mode
  useEffect(() => {
    if (config.isProduction && AD_CONFIG.enabled && AD_CONFIG.ezoicSiteId && adRef.current) {
      // In a real implementation, Ezoic would automatically detect and fill
      // elements with the 'ezoic-ad' class and 'data-ezoic-ad' attribute
      
      // You would need to add the Ezoic initialization script to your index.html
      // and follow their integration guides
      
      // This is just a placeholder for the real implementation
    }
  }, [config.isProduction, id]);
  
  // Simulated ad in development mode
  if (!config.isProduction || !AD_CONFIG.enabled || !AD_CONFIG.ezoicSiteId) {
    return (
      <SimulatedAdNotice>
        <div
          className={`ezoic-ad ${className}`}
          style={{
            padding: '15px',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            border: '1px solid #ddd',
            borderRadius: '5px',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            ...style
          }}
        >
          <div>
            <p className="text-sm font-bold">Ezoic AI-Optimized Ad</p>
            <p className="text-xs">Ad ID: {id}</p>
            <p className="text-xs mt-2">Ezoic uses AI to optimize ad placements</p>
          </div>
        </div>
      </SimulatedAdNotice>
    );
  }
  
  // Real Ezoic ad container in production
  return (
    <div
      ref={adRef}
      id={`ezoic-pub-ad-placeholder-${id}`}
      className={`ezoic-ad ${className}`}
      data-ezoic-ad={id.toString()}
      style={{
        minHeight: '100px',
        width: '100%',
        ...style
      }}
    />
  );
};

export default EzoicAd;