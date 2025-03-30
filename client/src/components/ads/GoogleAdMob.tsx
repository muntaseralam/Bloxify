import React, { useState, useEffect } from 'react';
import { useAdProvider, SimulatedAdNotice } from '@/context/AdProviderContext';
import { AD_CONFIG } from '@/lib/adConfig';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
  const [adPlaying, setAdPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  
  // In a real implementation, we would use the Google AdMob SDK
  // For now, we'll simulate the ad loading and playing
  
  // Simulate ad loading
  useEffect(() => {
    if (config.isProduction && AD_CONFIG.enabled && AD_CONFIG.admobRewardedVideoId) {
      // In production, this would load the actual rewarded video ad
      // using the AdMob SDK's API
      
      // Simulating a network delay for loading the ad
      const loadingTimer = setTimeout(() => {
        const successfullyLoaded = Math.random() > 0.1; // 90% success rate
        if (successfullyLoaded) {
          setAdLoaded(true);
          setError('');
        } else {
          setError('Failed to load ad. Please try again.');
        }
      }, 1000);
      
      return () => clearTimeout(loadingTimer);
    } else {
      // In development mode, immediately "load" the ad
      setAdLoaded(true);
    }
  }, [config.isProduction]);
  
  // Play the ad (or simulate playing it)
  useEffect(() => {
    if (!adPlaying) return;
    
    let adDuration = 15000; // 15 seconds for real ad simulation
    
    // In development mode, make it shorter
    if (!config.isProduction) {
      adDuration = 3000; // 3 seconds for development
    }
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / adDuration) * 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setAdPlaying(false);
        setProgress(0);
        onComplete();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [adPlaying, config.isProduction, onComplete]);
  
  // Handle play button click
  const handlePlay = () => {
    if (!adLoaded) return;
    
    if (config.isProduction && AD_CONFIG.enabled && AD_CONFIG.admobRewardedVideoId) {
      // In production, this would show the actual rewarded video ad
      // using the AdMob SDK's API
      console.log('Playing real AdMob ad');
    }
    
    setAdPlaying(true);
  };
  
  // Handle cancel
  const handleCancel = () => {
    setAdPlaying(false);
    setProgress(0);
    if (onCancel) onCancel();
  };
  
  // In development mode or if there's an error loading the ad, show a simulated ad
  if (!config.isProduction || !AD_CONFIG.enabled || !AD_CONFIG.admobRewardedVideoId || error) {
    return (
      <SimulatedAdNotice>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-white rounded-lg overflow-hidden max-w-md w-full mx-4">
            <div className="p-4 bg-blue-600 text-white">
              <h3 className="text-lg font-bold">Rewarded Video Ad</h3>
            </div>
            
            {adPlaying ? (
              <div className="p-6">
                <div className="text-center mb-4">
                  <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center mb-4">
                    {progress < 100 ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-pulse text-2xl mb-2">▶️</div>
                        <p className="text-sm text-gray-500">Ad is playing...</p>
                      </div>
                    ) : (
                      <div className="text-green-500 text-3xl">✓</div>
                    )}
                  </div>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-sm text-gray-500 mb-4">
                    {progress < 100 ? 'Please watch the entire ad to receive your reward' : 'Ad completed!'}
                  </p>
                  
                  {progress < 100 && (
                    <Button variant="outline" onClick={handleCancel}>
                      Skip (No Reward)
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-4 text-center">
                  <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center mb-4">
                    <div className="text-4xl">🎬</div>
                  </div>
                  <p className="mb-4 text-sm">
                    Watch this ad to earn a reward in your quest! You'll need to watch the entire video.
                  </p>
                  
                  {error ? (
                    <>
                      <p className="text-red-500 text-sm mb-2">{error}</p>
                      <Button onClick={() => setError('')}>Try Again</Button>
                    </>
                  ) : (
                    <Button onClick={handlePlay} disabled={!adLoaded} className="bg-blue-600 text-white">
                      {adLoaded ? 'Watch Ad' : 'Loading Ad...'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </SimulatedAdNotice>
    );
  }
  
  // In production with actual AdMob SDK integration
  return (
    <div id="admob-rewarded-container" className="admob-container">
      {/* The actual AdMob SDK would handle the display */}
      {adPlaying ? (
        <div className="fixed inset-0 z-50 bg-black">
          {/* AdMob ad is playing, handled by the SDK */}
        </div>
      ) : (
        <Button 
          onClick={handlePlay} 
          disabled={!adLoaded}
          className="admob-play-button"
        >
          {adLoaded ? 'Watch Ad for Reward' : 'Loading Ad...'}
        </Button>
      )}
    </div>
  );
};

export default GoogleAdMob;