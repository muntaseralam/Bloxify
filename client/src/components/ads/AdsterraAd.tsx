import React, { useEffect, useState } from 'react';
import { useAdProvider, SimulatedAdNotice } from '../../context/AdProviderContext';

interface AdsterraAdProps {
  type: 'interstitial' | 'popup' | 'banner' | 'native';
  zoneId: string; // Your Adsterra zone ID
  onClose?: () => void;
}

/**
 * Adsterra Ad component for interstitial and popup ads
 * 
 * To use this with real Adsterra ads:
 * 1. Sign up for Adsterra (https://adsterra.com)
 * 2. Create ad zones and get your zone IDs
 * 3. Replace YOUR_ZONE_ID with your actual Adsterra zone ID when publishing
 */
const AdsterraAd = ({ type, zoneId, onClose }: AdsterraAdProps) => {
  const { config } = useAdProvider();
  const [visible, setVisible] = useState(true);
  
  // For interstitial and popup ads, we need to track visibility
  useEffect(() => {
    if (type === 'interstitial' || type === 'popup') {
      // In production mode, we'd handle this differently with actual Adsterra scripts
      if (config.isProduction) {
        // Adsterra scripts would handle ad display and closing
        // This is just a placeholder to ensure we call onClose() in production too
        
        // Usually Adsterra provides a callback for when ads are closed
        // Here we're simulating that with a timeout
        const timer = setTimeout(() => {
          if (onClose) onClose();
        }, 15000); // 15s timeout as fallback
        
        return () => clearTimeout(timer);
      } else {
        // In development mode, we'll show our simulated ad for a few seconds
        const timer = setTimeout(() => {
          setVisible(false);
          if (onClose) onClose();
        }, type === 'interstitial' ? 5000 : 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [type, config.isProduction, onClose]);
  
  // Handle manual close for simulated ads
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };
  
  // In production, we inject Adsterra's provided script for the specific zone
  if (config.isProduction && config.adsterraAccountId) {
    if (type === 'banner') {
      return (
        <div 
          id={`atbanner-${zoneId}`} 
          className="adsterra-banner"
          style={{ width: '100%', minHeight: '90px', textAlign: 'center' }}
        ></div>
      );
    }
    
    // For interstitial and popup ads, Adsterra typically provides specific script
    // that needs to be inserted. The actual implementation depends on Adsterra's
    // current implementation which may change.
    return null; // Adsterra scripts typically inject their own containers
  }
  
  // In development, show simulated ads
  if (!visible) return null;
  
  // Different styles based on ad type
  switch (type) {
    case 'interstitial':
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <SimulatedAdNotice>
            <div className="relative bg-white p-6 rounded-lg max-w-lg w-full">
              <button 
                onClick={handleClose}
                className="absolute top-2 right-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
              <div className="text-center mb-4">
                <span className="text-xs font-bold text-red-500 uppercase">Adsterra Interstitial Ad</span>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-4 text-center min-h-[300px] flex flex-col items-center justify-center">
                <div className="text-xl font-bold text-red-800 mb-2">Special Offer!</div>
                <div className="w-full h-40 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-500">Advertisement Content</span>
                </div>
                <button 
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                  onClick={handleClose}
                >
                  Close Ad
                </button>
              </div>
            </div>
          </SimulatedAdNotice>
        </div>
      );
      
    case 'popup':
      return (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full shadow-lg">
          <SimulatedAdNotice>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="flex justify-between items-center bg-red-500 text-white p-2">
                <span className="text-xs font-bold">Adsterra Popup</span>
                <button onClick={handleClose} className="text-white">✕</button>
              </div>
              <div className="p-4 bg-red-50">
                <div className="w-full h-40 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-500">Popup Ad Content</span>
                </div>
                <button 
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white w-full font-bold py-2 rounded"
                  onClick={handleClose}
                >
                  Learn More
                </button>
              </div>
            </div>
          </SimulatedAdNotice>
        </div>
      );
      
    case 'banner':
    default:
      return (
        <div className="w-full">
          <SimulatedAdNotice>
            <div className="bg-red-50 border border-red-200 p-2 rounded text-center" style={{ minHeight: '90px' }}>
              <span className="text-xs font-bold text-red-500 uppercase">Adsterra Banner</span>
              <div className="mt-1 w-full h-10 bg-red-100 rounded flex items-center justify-center">
                <span className="text-red-500 text-sm">Banner Ad Content</span>
              </div>
            </div>
          </SimulatedAdNotice>
        </div>
      );
  }
};

export default AdsterraAd;