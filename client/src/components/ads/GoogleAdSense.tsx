import React, { useEffect, useRef } from 'react';
import { useAdProvider, SimulatedAdNotice } from '@/context/AdProviderContext';
import { AD_CONFIG } from '@/lib/adConfig';

/**
 * Google AdSense component for displaying banner ads
 * When publishing, replace YOUR_ADSENSE_CLIENT_ID with your actual AdSense Publisher ID
 * and YOUR_ADSENSE_SLOT_ID with your ad slot ID
 */
interface GoogleAdSenseProps {
  position: 'top' | 'bottom' | 'custom';
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
}

export const GoogleAdSense = ({ 
  position = 'top',
  className = '',
  format = 'auto',
  style = {}
}: GoogleAdSenseProps) => {
  const { config } = useAdProvider();
  const adRef = useRef<HTMLDivElement>(null);
  
  // Determine which slot ID to use based on position
  const getSlotId = () => {
    if (position === 'top' && AD_CONFIG.adsenseBannerTopId) {
      return AD_CONFIG.adsenseBannerTopId;
    }
    if (position === 'bottom' && AD_CONFIG.adsenseBannerBottomId) {
      return AD_CONFIG.adsenseBannerBottomId;
    }
    // Default slot ID
    return position === 'top' ? 'TOP_SLOT_ID' : 'BOTTOM_SLOT_ID';
  };
  
  // Initialize and display the ad when in production mode
  useEffect(() => {
    // Only attempt to load real ads in production with valid config
    if (config.isProduction && AD_CONFIG.enabled && AD_CONFIG.adsensePublisherId && adRef.current) {
      try {
        // Create an ins element for the ad
        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.style.display = 'block';
        adElement.style.overflow = 'hidden';
        adElement.setAttribute('data-ad-client', AD_CONFIG.adsensePublisherId); 
        adElement.setAttribute('data-ad-slot', getSlotId());
        adElement.setAttribute('data-ad-format', format);
        
        // Clear the ad container and append the new ad
        if (adRef.current) {
          adRef.current.innerHTML = '';
          adRef.current.appendChild(adElement);
          
          // Initialize the ad
          try {
            // This works if the AdSense script is already loaded
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (error) {
            console.error('Error initializing AdSense ad:', error);
          }
        }
      } catch (error) {
        console.error('Error creating AdSense ad:', error);
      }
    }
  }, [config.isProduction, format, position]);
  
  // Height mappings for different formats
  const getHeight = () => {
    switch(format) {
      case 'rectangle': return '250px';
      case 'vertical': return '600px';
      case 'horizontal': return '90px';
      default: return '100px';
    }
  };
  
  // Simulated ad in development mode
  if (!config.isProduction || !AD_CONFIG.enabled) {
    return (
      <SimulatedAdNotice>
        <div 
          className={`ad-container adsense-${position} ${className}`}
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #cbebff 47%, #a1dbff 100%)',
            border: '1px solid #ccc',
            borderRadius: '5px',
            textAlign: 'center',
            height: getHeight(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...style
          }}
        >
          <div>
            <p className="text-sm font-bold">Google AdSense Banner</p>
            <p className="text-xs">Format: {format}, Position: {position}</p>
            <p className="text-xs mt-2">This would be a real ad in production</p>
          </div>
        </div>
      </SimulatedAdNotice>
    );
  }
  
  // Real ad container in production
  return (
    <div 
      ref={adRef}
      className={`ad-container adsense-${position} ${className}`}
      style={{
        minHeight: getHeight(),
        width: '100%',
        overflow: 'hidden',
        ...style
      }}
    />
  );
};

export default GoogleAdSense;