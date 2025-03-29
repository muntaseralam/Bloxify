import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface InterstitialAdProps {
  onClose: () => void;
  autoCloseDelay?: number; // Auto close delay in milliseconds
}

const InterstitialAd = ({ onClose, autoCloseDelay = 5000 }: InterstitialAdProps) => {
  const [countdown, setCountdown] = useState(Math.ceil(autoCloseDelay / 1000));
  
  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Auto close after delay
    const closeTimer = setTimeout(() => {
      onClose();
    }, autoCloseDelay);
    
    return () => {
      clearInterval(timer);
      clearTimeout(closeTimer);
    };
  }, [autoCloseDelay, onClose]);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <div className="text-lg font-bold text-gray-800">Advertisement</div>
          {countdown === 0 && (
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        
        <div className="bg-gray-100 aspect-video flex items-center justify-center p-4 border-4 border-gray-200">
          <div className="text-center">
            <div className="text-5xl text-blue-500 mb-4"><i className="fas fa-ad"></i></div>
            <h3 className="text-xl font-bold mb-2">Interstitial Advertisement</h3>
            <p className="text-sm text-gray-600 mb-4">Watch this ad before starting the game!</p>
            <div className="animate-pulse text-blue-600 font-bold">
              Content loading...
            </div>
          </div>
        </div>
        
        <div className="p-4 text-center">
          {countdown > 0 ? (
            <div className="text-sm text-gray-600">
              You can skip this ad in <span className="font-bold">{countdown}</span> seconds
            </div>
          ) : (
            <Button 
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              Continue to Game
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterstitialAd;