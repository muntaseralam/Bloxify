import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, X, Film } from "lucide-react";

interface RewardedVideoAdProps {
  onComplete: () => void;
  onCancel?: () => void;
  duration?: number; // Duration in milliseconds
}

const RewardedVideoAd = ({ 
  onComplete, 
  onCancel = () => {}, 
  duration = 5000 
}: RewardedVideoAdProps) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 100);
    
    // Simulate random failures (10% chance)
    const failChance = Math.random();
    if (failChance > 0.9) {
      setTimeout(() => {
        clearInterval(interval);
        setIsError(true);
      }, duration * 0.3);
    }
    
    return () => clearInterval(interval);
  }, [duration]);
  
  const handleClaim = () => {
    onComplete();
  };
  
  const handleCancel = () => {
    onCancel();
  };
  
  const handleRetry = () => {
    setIsError(false);
    setProgress(0);
    
    // Restart the video
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setIsComplete(true);
      }
    }, 100);
    
    return () => clearInterval(interval);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="text-lg font-bold text-gray-800">
            {isError ? "Video Error" : isComplete ? "Video Complete" : "Rewarded Video"}
          </div>
          <button 
            onClick={handleCancel}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="bg-gray-100 aspect-video flex items-center justify-center relative overflow-hidden">
          {isError ? (
            <div className="text-center p-4">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Video Failed to Load</h3>
              <p className="text-sm text-gray-600 mb-4">
                There was an error loading the video advertisement.
              </p>
            </div>
          ) : isComplete ? (
            <div className="text-center p-4">
              <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Video Complete!</h3>
              <p className="text-sm text-gray-600 mb-4">
                You've earned a reward for watching this advertisement.
              </p>
            </div>
          ) : (
            <>
              <div className="absolute top-0 left-0 h-1 bg-blue-500" style={{ width: `${progress}%` }}></div>
              <div className="text-center">
                <Film className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Video Playing</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please watch the full video to claim your reward.
                </p>
                <div className="text-blue-600 font-bold">
                  Loading content...
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 text-center">
          {isError ? (
            <div className="space-x-2">
              <Button 
                onClick={handleRetry}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Try Again
              </Button>
              <Button 
                onClick={handleCancel}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          ) : isComplete ? (
            <Button 
              onClick={handleClaim}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              Claim Reward
            </Button>
          ) : (
            <div className="text-sm text-gray-600">
              Please watch the entire video ({Math.round(progress)}% complete)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardedVideoAd;