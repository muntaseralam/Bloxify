import React, { useEffect, useState } from 'react';
import { useAdProvider, SimulatedAdNotice } from '../../context/AdProviderContext';
import GoogleAdMob from './GoogleAdMob';

interface RewardedVideoAdProps {
  onComplete: () => void;
  onCancel?: () => void;
  duration?: number; // Duration in milliseconds
}

const RewardedVideoAd = ({ 
  onComplete, 
  onCancel,
  duration = 15000 // Default 15 seconds for simulated ads
}: RewardedVideoAdProps) => {
  const { config } = useAdProvider();
  const [progress, setProgress] = useState(0);
  const [showSimulatedAd, setShowSimulatedAd] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // For simulated ads in development, we show a progress bar
  useEffect(() => {
    // Only run the simulation in development mode
    if (config.isProduction) return;
    
    let startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(100, (elapsed / duration) * 100);
      setProgress(progressPercent);
      
      if (progressPercent >= 100) {
        setIsCompleted(true);
        clearInterval(interval);
        // Small delay before calling onComplete
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [config.isProduction, duration, onComplete]);
  
  const handleCancel = () => {
    setShowSimulatedAd(false);
    if (onCancel) onCancel();
  };
  
  // If in production and using AdMob, use the real component
  if (config.isProduction && config.admobAppId) {
    return <GoogleAdMob onComplete={onComplete} onCancel={onCancel} />;
  }
  
  // In development, show a simulated video ad
  if (!showSimulatedAd) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <SimulatedAdNotice>
        <div className="bg-white rounded-lg overflow-hidden max-w-xl w-full relative">
          <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
            <div className="font-bold">Rewarded Video Ad</div>
            {!isCompleted && (
              <button 
                onClick={handleCancel} 
                className="text-white hover:bg-purple-700 px-2 py-1 rounded"
              >
                Skip Ad
              </button>
            )}
          </div>
          
          <div className="p-4">
            <div className="aspect-video bg-gray-800 rounded overflow-hidden">
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-white text-center mb-4">
                  {isCompleted ? (
                    <>
                      <div className="text-green-500 text-xl mb-2">✓ Video Complete!</div>
                      <p className="text-green-300">You've earned your reward</p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl mb-2">Simulated Video Ad</div>
                      <p className="text-gray-400">Watch to earn rewards</p>
                    </>
                  )}
                </div>
                
                {!isCompleted && (
                  <div className="w-3/4 bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-purple-500 h-full transition-all duration-300 ease-linear"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex justify-center">
              {isCompleted ? (
                <button 
                  onClick={onComplete}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded"
                >
                  Claim Reward
                </button>
              ) : (
                <div className="text-gray-500 text-sm">
                  Please watch the entire video to earn your reward
                </div>
              )}
            </div>
          </div>
        </div>
      </SimulatedAdNotice>
    </div>
  );
};

export default RewardedVideoAd;