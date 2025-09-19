import React, { useEffect, useRef, useState } from 'react';
import { loadAdSenseScript } from '@/lib/adConfig';

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
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const getSlotId = () => {
    return position === 'top' ? '8073659347' : '5489564891';
  };

  // Load AdSense script on component mount
  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (existingScript) {
      console.log('AdSense script already loaded');
      setScriptLoaded(true);
      return;
    }

    console.log('Loading AdSense script...');
    loadAdSenseScript();
    
    // Wait for script to load
    const checkScript = setInterval(() => {
      if (window.adsbygoogle) {
        console.log('AdSense script loaded successfully');
        setScriptLoaded(true);
        clearInterval(checkScript);
      }
    }, 100);

    // Clear interval after 10 seconds if script doesn't load
    setTimeout(() => {
      clearInterval(checkScript);
      if (!window.adsbygoogle) {
        console.error('AdSense script failed to load');
      }
    }, 10000);

    return () => clearInterval(checkScript);
  }, []);

  // Initialize ads once script is loaded
  useEffect(() => {
    if (scriptLoaded && adRef.current) {
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
  }, [position, scriptLoaded]);

  return (
    <div 
      ref={adRef}
      className={`ad-container adsense-${position} ${className}`}
      style={{
        minHeight: '90px',
        width: '100%',
        textAlign: 'center',
        backgroundColor: scriptLoaded ? 'transparent' : '#f0f0f0',
        border: scriptLoaded ? 'none' : '1px dashed #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {!scriptLoaded && (
        <span style={{ color: '#666', fontSize: '12px' }}>Loading AdSense...</span>
      )}
    </div>
  );
};

export default GoogleAdSense;