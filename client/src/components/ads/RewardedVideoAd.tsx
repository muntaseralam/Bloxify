
import React, { useState, useEffect } from 'react';
import { useAdProvider, SimulatedAdNotice } from '@/context/AdProviderContext';
import { AD_CONFIG } from '@/lib/adConfig';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface RewardedVideoAdProps {
  onComplete: () => void;
  onCancel?: () => void;
  duration?: number;
}

const RewardedVideoAd: React.FC<RewardedVideoAdProps> = ({
  onComplete,
  onCancel,
  duration = 15000
}) => {
  const { config } = useAdProvider();
  const [progress, setProgress] = useState(0);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    if (config.isProduction && AD_CONFIG.enabled && AD_CONFIG.adsterraInterstitialZoneId) {
      // Load Adsterra script
      const script = document.createElement('script');
      script.src = `//www.adsterra.com/rewarded/${AD_CONFIG.adsterraInterstitialZoneId}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => setAdLoaded(true);

      return () => {
        document.head.removeChild(script);
      };
    } else {
      setAdLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!adLoaded) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + (100 / (duration / 1000));
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [adLoaded, duration]);

  const handleCancel = () => {
    if (onCancel) onCancel();
  };

  // Simulated ad in development or if Adsterra is not configured
  if (!config.isProduction || !AD_CONFIG.enabled || !AD_CONFIG.adsterraInterstitialZoneId) {
    return (
      <SimulatedAdNotice>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="bg-white rounded-lg overflow-hidden max-w-lg w-full mx-4">
            <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">Adsterra Rewarded Video</h3>
              {progress < 100 && (
                <button onClick={handleCancel} className="text-white hover:text-gray-200">
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
                
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Ad: {Math.floor(progress)}% complete</span>
                  <span>{progress < 100 ? 'Watch to earn reward' : 'Completed!'}</span>
                </div>
                
                {progress < 100 ? (
                  <p className="text-sm text-gray-600 mb-2">
                    Please watch the entire video to receive your reward.
                  </p>
                ) : (
                  <Button onClick={onComplete} className="bg-blue-600 text-white">
                    Claim Reward
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SimulatedAdNotice>
    );
  }

  // Production Adsterra ad
  return (
    <div id="adsterra-rewarded-container" className="fixed inset-0 z-50 bg-black">
      {/* Adsterra script will populate this container */}
    </div>
  );
};

export default RewardedVideoAd;
