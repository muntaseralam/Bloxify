import React, { useEffect, useState } from 'react';
import { useAdProvider, SimulatedAdNotice } from '../../context/AdProviderContext';

interface InterstitialAdProps {
  onClose: () => void;
  autoCloseDelay?: number; // Auto close delay in milliseconds
}

const InterstitialAd = ({ onClose, autoCloseDelay = 10000 }: InterstitialAdProps) => {
  const { config } = useAdProvider();
  const [timeLeft, setTimeLeft] = useState(Math.ceil(autoCloseDelay / 1000));
  const [isClosed, setIsClosed] = useState(false);
  
  // Auto close timer
  useEffect(() => {
    if (isClosed) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isClosed]);
  
  const handleClose = () => {
    setIsClosed(true);
    onClose();
  };
  
  if (isClosed) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <SimulatedAdNotice>
        <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 overflow-hidden">
          <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
            <h3 className="font-bold">Special Offer</h3>
            <div className="text-sm">
              Close in <span className="font-bold">{timeLeft}s</span>
              <button 
                onClick={handleClose}
                className="ml-4 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs"
              >
                Skip Ad
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-4">Limited Time Discount!</div>
              <div className="bg-blue-50 rounded-lg p-6 flex justify-center items-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">50% OFF</div>
                  <div className="text-gray-600">Premium Game Access</div>
                  <div className="mt-4 text-gray-500">
                    <span className="line-through">$9.99</span>
                    <span className="text-2xl text-blue-600 font-bold ml-2">$4.99</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-full font-bold transition-colors"
              >
                Claim Offer
              </button>
              <button 
                onClick={handleClose}
                className="border border-gray-300 hover:bg-gray-100 text-gray-700 py-3 px-6 rounded-full transition-colors"
              >
                No Thanks
              </button>
            </div>
            
            <div className="mt-6 text-xs text-gray-500 text-center">
              *This is a simulated ad for demonstration purposes
            </div>
          </div>
        </div>
      </SimulatedAdNotice>
    </div>
  );
};

export default InterstitialAd;