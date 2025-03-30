import React, { useEffect, useState } from 'react';
import { useAdProvider, SimulatedAdNotice } from '@/context/AdProviderContext';
import { AD_CONFIG } from '@/lib/adConfig';
import { Button } from '@/components/ui/button';

interface AdsterraAdProps {
  type: 'interstitial' | 'popup' | 'banner' | 'native';
  zoneId: string; // Your Adsterra zone ID
  onClose?: () => void;
  className?: string;
}

/**
 * Adsterra Ad component for interstitial and popup ads
 * 
 * To use this with real Adsterra ads:
 * 1. Sign up for Adsterra (https://adsterra.com)
 * 2. Create ad zones and get your zone IDs
 * 3. Replace YOUR_ZONE_ID with your actual Adsterra zone ID when publishing
 */
const AdsterraAd: React.FC<AdsterraAdProps> = ({ type, zoneId, onClose, className = '' }) => {
  const { config } = useAdProvider();
  const [showAd, setShowAd] = useState(type !== 'popup'); // Interstitials show immediately, popups controlled by Adsterra
  const [adDismissed, setAdDismissed] = useState(false);
  
  // For development, we'll auto-close interstitials after some time
  useEffect(() => {
    if (!config.isProduction && type === 'interstitial' && showAd && !adDismissed) {
      const timeout = setTimeout(() => {
        handleClose();
      }, 5000); // Auto close after 5 seconds in development
      
      return () => clearTimeout(timeout);
    }
  }, [config.isProduction, type, showAd, adDismissed]);
  
  // In production, this would load the Adsterra script
  useEffect(() => {
    if (config.isProduction && AD_CONFIG.enabled && zoneId) {
      // In real implementation, Adsterra provides custom scripts for each ad unit
      // You would typically add these scripts to the page when needed
      
      // For popup ads, Adsterra script handles when to show them
      // For interstitial ads, we need to show them ourselves when triggered
      
      // This is just a placeholder for the actual implementation
      console.log(`Loading Adsterra ${type} ad with zone ID ${zoneId}`);
      
      // Cleanup function
      return () => {
        // Remove any Adsterra scripts or elements when component unmounts
      };
    }
  }, [config.isProduction, type, zoneId]);
  
  const handleClose = () => {
    setAdDismissed(true);
    setShowAd(false);
    if (onClose) onClose();
  };
  
  // Don't render anything for popups in production (handled by Adsterra script)
  if (config.isProduction && type === 'popup') {
    return null;
  }
  
  // Don't render anything if ad is dismissed or not showing
  if (adDismissed || !showAd) {
    return null;
  }
  
  // Simulated ad in development mode or missing credentials
  if (!config.isProduction || !AD_CONFIG.enabled) {
    if (type === 'interstitial') {
      return (
        <SimulatedAdNotice>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
            <div className="bg-white rounded-lg overflow-hidden max-w-lg w-full mx-4">
              <div className="p-4 bg-purple-600 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold">Adsterra {type.charAt(0).toUpperCase() + type.slice(1)} Ad</h3>
                <button 
                  onClick={handleClose}
                  className="text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-6 text-center">
                  <div className="w-full h-60 bg-gradient-to-br from-purple-100 to-purple-300 rounded flex items-center justify-center mb-4">
                    <div className="text-purple-800 text-center">
                      <div className="text-4xl mb-2">🎯</div>
                      <p className="font-bold">Sponsored Content</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    This is a simulated Adsterra {type} ad. In production, this would be replaced with a real advertisement.
                  </p>
                  
                  <Button onClick={handleClose} className="bg-purple-600 text-white">
                    Continue to Content
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SimulatedAdNotice>
      );
    } else if (type === 'popup') {
      // For popup simulation in dev mode, we'll show a simplified version
      return (
        <SimulatedAdNotice>
          <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-3 bg-purple-600 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold">Adsterra Popup</h3>
              <button 
                onClick={handleClose}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm">This is a simulated Adsterra popup ad.</p>
              <div className="mt-2 flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleClose}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </SimulatedAdNotice>
      );
    } else if (type === 'banner') {
      return (
        <SimulatedAdNotice>
          <div 
            className="w-full bg-gradient-to-r from-purple-100 to-purple-300 rounded p-4 flex items-center justify-center"
            style={{ height: '120px' }}
          >
            <div className="text-center">
              <p className="font-bold text-purple-800">Adsterra Banner Ad</p>
              <p className="text-xs text-purple-600 mt-1">Zone ID: {zoneId}</p>
            </div>
          </div>
        </SimulatedAdNotice>
      );
    } else {
      return (
        <SimulatedAdNotice>
          <div className="bg-purple-100 border-2 border-purple-200 p-4 rounded-lg">
            <p className="font-bold text-purple-800 mb-1">Adsterra Native Ad</p>
            <p className="text-sm text-purple-600">Native ad content would appear here...</p>
          </div>
        </SimulatedAdNotice>
      );
    }
  }
  
  // Real ad in production - this div would be filled by Adsterra's script
  return (
    <div 
      id={`adsterra-${type}-${zoneId}`} 
      className={`adsterra-ad adsterra-${type} ${className}`}
      data-atzone={zoneId}
    >
      {/* Adsterra script will populate this element */}
    </div>
  );
};

export default AdsterraAd;