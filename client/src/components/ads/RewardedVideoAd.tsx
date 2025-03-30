import React, { useEffect, useState } from 'react';
import { useAdProvider, SimulatedAdNotice } from '@/context/AdProviderContext';
import { AD_CONFIG } from '@/lib/adConfig';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import GoogleAdMob from './GoogleAdMob';

interface RewardedVideoAdProps {
  onComplete: () => void;
  onCancel?: () => void;
  duration?: number; // Duration in milliseconds
}

const RewardedVideoAd: React.FC<RewardedVideoAdProps> = ({
  onComplete,
  onCancel,
  duration = 15000 // 15 seconds by default
}) => {
  const { config } = useAdProvider();
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  
  // If we're in production and using AdMob, use the real GoogleAdMob component
  if (config.isProduction && config.provider === 'admob' && AD_CONFIG.enabled && AD_CONFIG.admobRewardedVideoId) {
    return <GoogleAdMob onComplete={onComplete} onCancel={onCancel} />;
  }
  
  // Simulate ad playback
  useEffect(() => {
    if (!isPlaying) return;
    
    // In development mode, shorten the duration for easier testing
    const actualDuration = config.isProduction ? duration : Math.min(duration, 3000);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / actualDuration) * 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setIsPlaying(false);
        // Wait a bit before calling onComplete to allow the user to see the completion state
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying, duration, config.isProduction, onComplete]);
  
  const handleCancel = () => {
    setIsPlaying(false);
    if (onCancel) onCancel();
  };
  
  // Simulated rewarded video ad
  return (
    <SimulatedAdNotice>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
        <div className="bg-white rounded-lg overflow-hidden max-w-lg w-full mx-4">
          <div className="p-4 bg-green-600 text-white flex justify-between items-center">
            <h3 className="text-lg font-bold">Rewarded Video Ad</h3>
            {progress < 100 && (
              <button 
                onClick={handleCancel}
                className="text-white hover:text-gray-200"
              >
                Skip
              </button>
            )}
          </div>
          
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="w-full aspect-video bg-black rounded flex items-center justify-center mb-4">
                {progress < 100 ? (
                  <div className="flex flex-col items-center">
                    <div className="text-white text-5xl animate-pulse mb-2">▶️</div>
                    <p className="text-white opacity-80 text-sm">Video playing...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="text-green-500 text-5xl mb-2">✅</div>
                    <p className="text-white font-bold">Reward Earned!</p>
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Ad: {Math.floor(progress)}% complete</span>
                  <span>{progress < 100 ? 'Watch to earn reward' : 'Completed!'}</span>
                </div>
              </div>
              
              {progress < 100 ? (
                <p className="text-sm text-gray-600 mb-2">
                  Please watch the entire video to receive your reward.
                </p>
              ) : (
                <Button
                  onClick={onComplete}
                  className="bg-green-600 text-white"
                >
                  Claim Reward
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimulatedAdNotice>
  );
};

export default RewardedVideoAd;