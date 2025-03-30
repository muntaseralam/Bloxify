import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAdProvider } from "@/context/AdProviderContext";
import RewardedVideoAd from "./ads/RewardedVideoAd";
import GoogleAdSense from "./ads/GoogleAdSense";
import EzoicAd from "./ads/EzoicAd";
import BannerAd from "./ads/BannerAd";

interface AdViewingSectionProps {
  adsWatched: number;
  totalAds: number;
  onAdWatched: () => void;
}

const AdViewingSection = ({ adsWatched, totalAds, onAdWatched }: AdViewingSectionProps) => {
  const [isWatching, setIsWatching] = useState(false);
  const [allCompleted, setAllCompleted] = useState(adsWatched >= totalAds);
  const { config } = useAdProvider();
  
  const progressWidth = `${(adsWatched / totalAds) * 100}%`;
  
  const handleWatchAd = () => {
    if (adsWatched >= totalAds) {
      setAllCompleted(true);
      return;
    }
    
    // Start watching rewarded video ad
    setIsWatching(true);
  };
  
  const handleAdComplete = () => {
    // Ad completed successfully, give the reward
    onAdWatched();
    setIsWatching(false);
    
    if (adsWatched + 1 >= totalAds) {
      setAllCompleted(true);
    }
  };
  
  const handleAdCancel = () => {
    // User canceled the ad, don't give a reward
    setIsWatching(false);
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
        
        {/* Banner ad at the top */}
        <div className="mb-4">
          {config.provider === 'adsense' ? (
            <GoogleAdSense position="top" format="horizontal" />
          ) : config.provider === 'ezoic' ? (
            <EzoicAd id={101} /> // Unique ID for this ad position
          ) : (
            <BannerAd variant="horizontal" />
          )}
        </div>
        
        <div className="bg-black relative min-h-[250px] mb-4 flex items-center justify-center border-4 border-[#1A1A1A] shadow-inner">
          {!isWatching && (
            <div className="text-center text-white p-4">
              <div className="text-5xl mb-4"><i className="fas fa-film"></i></div>
              <p className="text-lg font-bold">Rewarded Video</p>
              <p className="text-sm opacity-70">Watch video ads to earn tokens!</p>
              <div className="mt-4 bg-blue-500 bg-opacity-20 p-3 rounded-lg">
                <p className="text-sm flex items-center">
                  <i className="fas fa-info-circle mr-2"></i>
                  Watch all {totalAds} ads to complete this quest and earn 1 token
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Second banner/Ezoic ad at the bottom */}
        <div className="mb-4">
          {config.provider === 'ezoic' ? (
            <EzoicAd id={102} /> // Unique ID for this ad position
          ) : (
            <BannerAd variant="horizontal" />
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
                <><i className="fas fa-play mr-2"></i> Watch Video Ad ({adsWatched+1}/{totalAds})</>
              )
            )}
          </Button>
          
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {Array.from({ length: totalAds }).map((_, index) => (
              <div 
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${index < adsWatched 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
                  }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          
          <p className="mt-3 text-sm text-gray-600">
            {allCompleted 
              ? 'Great job! You\'ve completed all the ads for this quest.' 
              : `Watch ${totalAds - adsWatched} more ads to complete this quest!`
            }
          </p>
        </div>
      </div>
      
      {/* Rewarded Video Ad Overlay */}
      {isWatching && (
        <RewardedVideoAd 
          onComplete={handleAdComplete}
          onCancel={handleAdCancel}
          duration={3000} // 3 seconds for testing, would be longer in production
        />
      )}
    </div>
  );
};

export default AdViewingSection;
