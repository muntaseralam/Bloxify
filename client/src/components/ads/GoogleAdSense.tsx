import React from 'react';
import AdSense from 'react-google-adsense';
import { useAdProvider, SimulatedAdNotice } from '../../context/AdProviderContext';

interface GoogleAdSenseProps {
  position: 'top' | 'bottom' | 'custom';
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
}

/**
 * Google AdSense component for displaying banner ads
 * When publishing, replace YOUR_ADSENSE_CLIENT_ID with your actual AdSense Publisher ID
 * and YOUR_ADSENSE_SLOT_ID with your ad slot ID
 */
export const GoogleAdSense = ({ 
  position, 
  className = '', 
  format = 'auto',
  style = {}
}: GoogleAdSenseProps) => {
  const { config } = useAdProvider();
  
  // Default styles based on position
  const getDefaultStyles = () => {
    const baseStyles = {
      display: 'block',
      textAlign: 'center' as const,
      overflow: 'hidden',
    };
    
    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          minHeight: '90px',
          width: '100%',
        };
      case 'bottom':
        return {
          ...baseStyles,
          minHeight: '90px',
          width: '100%',
        };
      case 'custom':
      default:
        return baseStyles;
    }
  };
  
  // Combine default styles with custom styles
  const combinedStyles = { ...getDefaultStyles(), ...style };
  
  // In production, use real AdSense
  if (config.isProduction && config.adsenseClientId) {
    return (
      <div className={`adsense-container ${className}`} style={combinedStyles}>
        <AdSense.Google
          client={`ca-pub-${config.adsenseClientId}`}
          slot="YOUR_ADSENSE_SLOT_ID" // Replace with actual slot ID when publishing
          format={format}
          responsive="true"
          style={combinedStyles}
        />
      </div>
    );
  }
  
  // In development, show simulated ad
  return (
    <div className={`adsense-container ${className}`} style={combinedStyles}>
      <SimulatedAdNotice>
        <div className="simulated-adsense p-4 text-center bg-gray-200 rounded" 
            style={{ width: '100%', minHeight: '90px' }}>
          <div className="flex items-center justify-center h-full">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase">Advertisement</span>
              <div className="mt-1 grid grid-cols-3 gap-1">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-gray-300 h-3 rounded"></div>
                ))}
              </div>
              <div className="mt-2 bg-gray-300 h-10 rounded w-full"></div>
            </div>
          </div>
        </div>
      </SimulatedAdNotice>
    </div>
  );
};

export default GoogleAdSense;