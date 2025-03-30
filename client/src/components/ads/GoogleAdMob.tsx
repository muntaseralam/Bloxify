import React, { useState, useEffect } from 'react';
import { useAdProvider, SimulatedAdNotice } from '../../context/AdProviderContext';

interface GoogleAdMobProps {
  onComplete: () => void;
  onCancel?: () => void;
}

/**
 * Google AdMob component for rewarded video ads
 * 
 * To use this with real AdMob ads:
 * 1. Sign up for AdMob (https://admob.google.com)
 * 2. Create a rewarded ad unit and get your App ID and Ad Unit ID
 * 3. When publishing, add the AdMob SDK script to your index.html
 * 4. Replace YOUR_ADMOB_APP_ID and YOUR_REWARDED_AD_UNIT_ID with your actual IDs
 */
const GoogleAdMob: React.FC<GoogleAdMobProps> = ({
  onComplete,
  onCancel
}) => {
  const { config } = useAdProvider();
  const [adLoaded, setAdLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Simulate or load a real ad when component mounts
  useEffect(() => {
    if (config.isProduction) {
      // In a real implementation, this would load the AdMob rewarded video
      // This is a placeholder for when you have real AdMob credentials
      if (window.AdMob && config.admobAppId) {
        try {
          // This is example code, would need to be updated with the actual AdMob API
          // when implementing with real AdMob credentials
          const admob = window.AdMob;
          if (admob) {
            admob.prepareRewardVideoAd({
              adId: 'YOUR_REWARDED_AD_UNIT_ID', // Replace with actual ad unit ID
              autoShow: false
            });
            
            // AdMob event listeners would be set up here
            document.addEventListener('onAdLoaded', () => {
              setAdLoaded(true);
              admob.showRewardVideoAd();
            });
          } else {
            throw new Error('AdMob not properly initialized');
          }
          
          document.addEventListener('onRewardVideoCompleted', () => {
            onComplete();
          });
          
          document.addEventListener('onAdDismiss', () => {
            if (onCancel) onCancel();
          });
          
          document.addEventListener('onAdFailLoad', (error: any) => {
            setError('Failed to load ad. Please try again.');
            if (onCancel) onCancel();
          });
        } catch (err) {
          console.error('Error initializing AdMob:', err);
          setError('Error initializing ad system');
          if (onCancel) onCancel();
        }
      } else {
        // Fallback if AdMob is not available
        console.warn('AdMob not available, falling back to simulated ad');
        simulateAdProgress();
      }
    } else {
      // In development, simulate the ad with a progress bar
      simulateAdProgress();
    }
    
    return () => {
      // Clean up event listeners in production
      if (config.isProduction) {
        document.removeEventListener('onAdLoaded', () => {});
        document.removeEventListener('onRewardVideoCompleted', () => {});
        document.removeEventListener('onAdDismiss', () => {});
        document.removeEventListener('onAdFailLoad', () => {});
      }
    };
  }, [config.isProduction, config.admobAppId, onComplete, onCancel]);
  
  // Simulate ad progress for development
  const simulateAdProgress = () => {
    const duration = 5000; // 5 seconds for simulated ad
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + 1;
        if (newProgress >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return newProgress;
      });
    }, duration / 100);
    
    return () => clearInterval(interval);
  };
  
  const handleCancel = () => {
    if (onCancel) onCancel();
  };
  
  // In production with real AdMob, we just show a loading state until the ad shows
  if (config.isProduction && !error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-bold mb-4">Loading Ad</h3>
          {!adLoaded && (
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error if there was a problem
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-bold mb-4 text-red-500">Error</h3>
          <p>{error}</p>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // In development or as fallback, show simulated ad
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <SimulatedAdNotice>
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Rewarded Video Ad</h3>
            <span className="text-sm bg-yellow-200 text-yellow-800 px-2 py-1 rounded">AdMob</span>
          </div>
          
          <div className="bg-gray-200 h-48 mb-4 flex items-center justify-center rounded">
            <div className="text-center">
              <div className="text-4xl mb-2">🎮</div>
              <p className="font-bold">Game Ad Demo</p>
              <p className="text-sm text-gray-600">This is where a video ad would play</p>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="w-full bg-gray-300 rounded-full h-4">
              <div 
                className="bg-blue-600 h-4 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs">{progress}% complete</span>
              <span className="text-xs">{Math.round((100-progress)*0.05)} seconds remaining</span>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Skip Ad
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded disabled:opacity-50"
              disabled={progress < 100}
            >
              {progress < 100 ? 'Please wait...' : 'Collect Reward'}
            </button>
          </div>
        </div>
      </SimulatedAdNotice>
    </div>
  );
};

// Declare global AdMob interface
declare global {
  interface Window {
    AdMob?: {
      prepareRewardVideoAd: (options: { adId: string, autoShow: boolean }) => void;
      showRewardVideoAd: () => void;
    };
  }
}

export default GoogleAdMob;