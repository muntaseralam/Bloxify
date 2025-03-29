import { useState } from "react";
import { Button } from "@/components/ui/button";

interface AdViewingSectionProps {
  adsWatched: number;
  totalAds: number;
  onAdWatched: () => void;
}

const AdViewingSection = ({ adsWatched, totalAds, onAdWatched }: AdViewingSectionProps) => {
  const [isWatching, setIsWatching] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);
  
  const progressWidth = `${(adsWatched / totalAds) * 100}%`;
  
  const handleWatchAd = () => {
    if (adsWatched >= totalAds) {
      setAllCompleted(true);
      return;
    }
    
    setIsWatching(true);
    
    // Simulate ad watching with a delay
    setTimeout(() => {
      onAdWatched();
      setIsWatching(false);
      
      if (adsWatched + 1 >= totalAds) {
        setAllCompleted(true);
      }
    }, 2000);
  };
  
  return (
    <div className="mb-8">
      <div className="bg-white p-4 rounded-lg border-6 border-[#1A1A1A] shadow-inner">
        <h3 className="text-xl font-bold mb-3 text-[#1A1A1A]">
          <i className="fas fa-ad mr-2"></i> Ad Viewing Challenge
        </h3>
        
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-bold">Ads Viewed</span>
            <span className="font-bold">{adsWatched}/{totalAds}</span>
          </div>
          <div className="h-6 bg-[#F2F2F2] rounded-full overflow-hidden border-2 border-[#1A1A1A]">
            <div 
              className="h-full bg-gradient-to-r from-[#00A2FF] to-[#FFD800] transition-all duration-500 ease-in-out" 
              style={{ width: progressWidth }}
            ></div>
          </div>
        </div>
        
        <div className="bg-black relative min-h-[250px] mb-4 flex items-center justify-center border-4 border-[#1A1A1A] shadow-inner">
          {isWatching ? (
            <div className="text-center text-white p-4 animate-pulse">
              <div className="text-5xl mb-4"><i className="fas fa-tv"></i></div>
              <p className="text-lg font-bold">Ad Playing...</p>
              <p className="text-sm opacity-70">Please wait while the advertisement is displayed</p>
            </div>
          ) : (
            <div className="text-center text-white p-4">
              <div className="text-5xl mb-4"><i className="fas fa-tv"></i></div>
              <p className="text-lg font-bold">Ad Ready</p>
              <p className="text-sm opacity-70">Click the button below to watch the next advertisement</p>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <Button 
            onClick={handleWatchAd}
            disabled={isWatching || allCompleted}
            className={`game-button font-bold py-2 px-6 rounded-lg border-b-4 border-[#1A1A1A] inline-flex items-center justify-center transition-all ${
              allCompleted 
                ? 'bg-[#4CAF50] text-white hover:bg-green-500' 
                : 'bg-[#00A2FF] text-white hover:bg-blue-500'
            }`}
          >
            {allCompleted ? (
              <><i className="fas fa-check-circle mr-2"></i> All Ads Completed!</>
            ) : (
              isWatching ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i> Watching...</>
              ) : (
                <><i className="fas fa-play mr-2"></i> Watch Next Ad</>
              )
            )}
          </Button>
          
          <p className="mt-3 text-sm text-gray-600">Watch all {totalAds} ads to continue your quest!</p>
        </div>
      </div>
    </div>
  );
};

export default AdViewingSection;
