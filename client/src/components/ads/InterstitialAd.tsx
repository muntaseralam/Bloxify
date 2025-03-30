import React, { useEffect, useState } from 'react';
import { useAdProvider, SimulatedAdNotice } from '@/context/AdProviderContext';
import { AD_CONFIG } from '@/lib/adConfig';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface InterstitialAdProps {
  onClose: () => void;
  autoCloseDelay?: number; // Auto close delay in milliseconds
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({ onClose, autoCloseDelay = 10000 }) => {
  const { config } = useAdProvider();
  const [progress, setProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState(autoCloseDelay / 1000);
  
  // Auto-close countdown timer
  useEffect(() => {
    // In development mode, reduce the time for better testing
    const actualDelay = config.isProduction ? autoCloseDelay : Math.min(autoCloseDelay, 5000);
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(100, (elapsed / actualDelay) * 100);
      setProgress(newProgress);
      
      const remaining = Math.max(0, Math.ceil((actualDelay - elapsed) / 1000));
      setRemainingTime(remaining);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        onClose();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [autoCloseDelay, config.isProduction, onClose]);
  
  // In real production environment, this would be an Adsterra interstitial
  // For now, we'll show a simulated ad
  return (
    <SimulatedAdNotice>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div className="bg-white rounded-lg overflow-hidden max-w-md w-full mx-4">
          <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
            <h3 className="text-lg font-bold">Full-Screen Advertisement</h3>
            {remainingTime === 0 && (
              <button 
                onClick={onClose}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="w-full h-60 bg-gradient-to-br from-blue-100 to-blue-300 rounded flex items-center justify-center mb-4">
                <div className="text-blue-800 text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="font-bold">Ad Content Would Appear Here</p>
                  <p className="text-sm mt-2">In production, this would be a real advertisement</p>
                </div>
              </div>
              
              <div className="mb-4">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  {remainingTime > 0 ? `Ad will close in ${remainingTime} seconds...` : 'You can close this ad now'}
                </p>
              </div>
              
              {remainingTime === 0 && (
                <Button onClick={onClose} className="bg-blue-600 text-white">
                  Continue to Content
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimulatedAdNotice>
  );
};

export default InterstitialAd;