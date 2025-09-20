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
      // Only initialize if container is empty
      if (adRef.current.children.length > 0) {
        console.log('Ad already exists for slot:', getSlotId());
        return;
      }

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
          console.log('AdSense element created:', adElement);
          console.log('AdSense push array before:', window.adsbygoogle?.length || 0);
          
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          
          console.log('AdSense push array after:', window.adsbygoogle?.length || 0);
          
          // Check if ad was rendered after a delay
          setTimeout(() => {
            if (adElement && adElement.innerHTML.trim() === '') {
              console.warn('AdSense ad not rendered after 3 seconds for slot:', getSlotId());
              console.log('Possible reasons: Account not approved, no ads available, policy violations, or ad blockers');
            } else {
              console.log('AdSense ad appears to be rendered for slot:', getSlotId());
            }
          }, 3000);
          
        } catch (error) {
          console.error('AdSense error:', error);
          // If error, clear the element and try again once
          if (adRef.current) {
            adRef.current.innerHTML = '';
          }
        }
      }, 100);
    }

    // Cleanup function to prevent memory leaks
    return () => {
      if (adRef.current) {
        // Remove ads when component unmounts
        const adsElements = adRef.current.querySelectorAll('.adsbygoogle');
        adsElements.forEach(ad => {
          try {
            if (ad.parentNode === adRef.current) {
              adRef.current.removeChild(ad);
            }
          } catch (e) {
            // Ignore removal errors
          }
        });
      }
    };
  }, [position, scriptLoaded]);

  return (
    <div 
      ref={adRef}
      className={`ad-container adsense-${position} ${className}`}
      style={{
        minHeight: '90px',
        width: '100%',
        textAlign: 'center',
        backgroundColor: '#f8f9fa',
        border: '1px solid #e0e0e0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      {!scriptLoaded && (
        <div style={{ 
          padding: '20px',
          color: '#666',
          fontSize: '14px'
        }}>
          AdSense Loading... ({position})
        </div>
      )}
      {scriptLoaded && (
        <div 
          style={{ 
            position: 'absolute',
            top: '5px',
            left: '5px',
            fontSize: '10px',
            color: '#999',
            zIndex: 1
          }}
        >
          AdSense {position} slot: {getSlotId()}
        </div>
      )}
    </div>
  );
};

export default GoogleAdSense;