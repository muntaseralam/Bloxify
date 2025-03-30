import React, { useRef, useEffect } from 'react';
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
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!config.isProduction || !adRef.current) return;
    
    // In a real implementation with Ezoic, their script would automatically
    // find the div with the corresponding ID and populate it with an ad
    // This is typically handled by Ezoic's scripts, not manually in your code
    
    // This is a placeholder - when you set up Ezoic properly,
    // they'll provide specific integration code
    if (typeof window.ezstandalone !== 'undefined') {
      // Call Ezoic's display function for this specific placeholder
      window.ezstandalone.define(id);
      window.ezstandalone.enable();
      window.ezstandalone.display();
    } else {
      console.warn('Ezoic scripts not loaded properly');
    }
  }, [config.isProduction, id]);
  
  if (config.isProduction) {
    // In production, create a div that Ezoic will target
    // They use an ID format like "ezoic-pub-ad-placeholder-ID"
    return (
      <div
        ref={adRef}
        id={`ezoic-pub-ad-placeholder-${id}`}
        className={className}
        style={style}
      />
    );
  }
  
  // In development, show a simulated ad
  return (
    <div className={`ezoic-ad ${className}`} style={style}>
      <SimulatedAdNotice>
        <div className="simulated-ezoic-ad p-4 bg-gray-100 rounded border border-gray-300 flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">Ezoic Ad #{id}</div>
          <div className="w-full flex flex-col gap-2">
            <div className="flex justify-between w-full">
              <div className="bg-gray-300 h-3 w-1/4 rounded"></div>
              <div className="bg-gray-300 h-3 w-1/4 rounded"></div>
            </div>
            <div className="bg-gray-300 h-12 w-full rounded"></div>
            <div className="flex justify-around w-full">
              <div className="bg-gray-300 h-20 w-[30%] rounded"></div>
              <div className="bg-gray-300 h-20 w-[65%] rounded"></div>
            </div>
            <div className="flex justify-between w-full">
              <div className="bg-gray-300 h-4 w-1/5 rounded"></div>
              <div className="bg-gray-300 h-4 w-2/5 rounded"></div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            AI-optimized ad placement by Ezoic
          </div>
        </div>
      </SimulatedAdNotice>
    </div>
  );
};

// Declare global Ezoic interface
declare global {
  interface Window {
    ezstandalone?: {
      define: (id: number) => void;
      enable: () => void;
      display: () => void;
    };
  }
}

export default EzoicAd;