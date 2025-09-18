import React, { useEffect, useRef } from 'react';

interface GoogleAdSenseProps {
  position: 'top' | 'bottom';
  className?: string;
  style?: React.CSSProperties;
}

export const GoogleAdSense = ({ 
  position = 'top',
  className = '',
  style = {}
}: GoogleAdSenseProps) => {
  const adRef = useRef<HTMLDivElement>(null);

  const getSlotId = () => {
    return position === 'top' ? '8073659347' : '5489564891';
  };

  useEffect(() => {
    if (adRef.current) {
      // Clear any existing content
      adRef.current.innerHTML = '';

      // Create the ad element
      const adElement = document.createElement('ins');
      adElement.className = 'adsbygoogle';
      adElement.style.display = 'inline-block';
      adElement.style.width = '728px';
      adElement.style.height = '90px';
      adElement.setAttribute('data-ad-client', 'ca-pub-6381797008244610');
      adElement.setAttribute('data-ad-slot', getSlotId());

      adRef.current.appendChild(adElement);

      // Wait a bit for DOM to settle, then initialize the ad
      setTimeout(() => {
        try {
          console.log('Initializing AdSense ad:', getSlotId());
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (error) {
          console.error('AdSense error:', error);
        }
      }, 100);
    }
  }, [position]);

  return (
    <div 
      ref={adRef}
      className={`ad-container adsense-${position} ${className}`}
      style={{
        minHeight: '90px',
        width: '100%',
        textAlign: 'center',
        ...style
      }}
    />
  );
};

export default GoogleAdSense;