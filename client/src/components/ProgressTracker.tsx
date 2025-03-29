interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  gameCompleted: boolean;
  adsWatched: number;
  totalAds: number;
  hasToken: boolean;
}

const ProgressTracker = ({ 
  currentStep, 
  totalSteps, 
  gameCompleted, 
  adsWatched, 
  totalAds,
  hasToken
}: ProgressTrackerProps) => {
  const progressWidth = `${(currentStep / totalSteps) * 100}%`;
  
  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-3 text-[#1A1A1A]">Your Quest Progress</h3>
      <div className="bg-[#F2F2F2] p-4 rounded-lg border-6 border-[#1A1A1A] shadow-inner">
        <div className="flex justify-between mb-2">
          <span className="font-bold">Quest Progress</span>
          <span className="font-bold">{currentStep}/{totalSteps}</span>
        </div>
        <div className="h-6 bg-white rounded-full overflow-hidden border-2 border-[#1A1A1A]">
          <div 
            className="h-full bg-gradient-to-r from-[#FF4500] to-[#FFD800] transition-all duration-500 ease-in-out" 
            style={{ width: progressWidth }}
          ></div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Minigame */}
          <div className={`bg-white p-4 rounded-lg border-2 border-[#1A1A1A] relative ${currentStep < 1 ? 'opacity-50' : ''}`}>
            <div className="absolute -top-3 -right-3 bg-[#1A1A1A] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
            <h4 className="font-bold mb-2">
              <i className="fas fa-gamepad text-[#00A2FF] mr-1"></i> Mini-Game
            </h4>
            <p className="text-sm text-gray-600">Complete the coin collection game</p>
            <div className={`mt-2 font-bold ${gameCompleted ? 'text-[#4CAF50]' : 'text-[#F44336]'}`}>
              {gameCompleted ? (
                <><i className="fas fa-check-circle mr-1"></i> Completed!</>
              ) : (
                currentStep === 1 ? (
                  <><i className="fas fa-circle-notch fa-spin mr-1"></i> In Progress</>
                ) : (
                  <><i className="fas fa-times-circle mr-1"></i> Not Started</>
                )
              )}
            </div>
          </div>
          
          {/* Step 2: Ad Viewing */}
          <div className={`bg-white p-4 rounded-lg border-2 border-[#1A1A1A] relative ${currentStep < 2 ? 'opacity-50' : ''}`}>
            <div className="absolute -top-3 -right-3 bg-[#1A1A1A] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold mb-2">
              <i className="fas fa-ad text-[#00A2FF] mr-1"></i> Watch Ads
            </h4>
            <p className="text-sm text-gray-600">Watch {totalAds} ads to continue</p>
            <div className={`mt-2 font-bold ${
              adsWatched >= totalAds 
                ? 'text-[#4CAF50]' 
                : currentStep === 2 
                  ? 'text-[#00A2FF]' 
                  : 'text-gray-500'
            }`}>
              {adsWatched >= totalAds ? (
                <><i className="fas fa-check-circle mr-1"></i> Completed!</>
              ) : currentStep === 2 ? (
                <><i className="fas fa-circle-notch fa-spin mr-1"></i> {adsWatched}/{totalAds} Watched</>
              ) : (
                <><i className="fas fa-lock mr-1"></i> Locked</>
              )}
            </div>
          </div>
          
          {/* Step 3: Token Generation */}
          <div className={`bg-white p-4 rounded-lg border-2 border-[#1A1A1A] relative ${currentStep < 3 ? 'opacity-50' : ''}`}>
            <div className="absolute -top-3 -right-3 bg-[#1A1A1A] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold mb-2">
              <i className="fas fa-ticket-alt text-[#00A2FF] mr-1"></i> Get Token
            </h4>
            <p className="text-sm text-gray-600">Generate your unique access token</p>
            <div className={`mt-2 font-bold ${
              hasToken 
                ? 'text-[#4CAF50]' 
                : currentStep === 3 
                  ? 'text-[#00A2FF]' 
                  : 'text-gray-500'
            }`}>
              {hasToken ? (
                <><i className="fas fa-check-circle mr-1"></i> Completed!</>
              ) : currentStep === 3 ? (
                <><i className="fas fa-circle-notch fa-spin mr-1"></i> In Progress</>
              ) : (
                <><i className="fas fa-lock mr-1"></i> Locked</>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
