interface ProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
  gameCompleted: boolean;
  adsWatched: number;
  totalAds: number;
  tokenCount: number; 
  hasToken: boolean;
  dailyQuestCount?: number;
}

const ProgressTracker = ({ 
  currentStep, 
  totalSteps, 
  gameCompleted, 
  adsWatched, 
  totalAds,
  tokenCount,
  hasToken,
  dailyQuestCount = 0
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
        
        {/* Daily Quest Counter */}
        <div className="mt-3 mb-3 bg-green-100 p-3 rounded-lg border-2 border-green-500">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <i className="fas fa-calendar-check text-green-600 mr-2 text-xl"></i>
              <span className="font-bold">Daily Quests:</span>
            </div>
            <div className="bg-green-600 text-white font-bold py-1 px-3 rounded-full">
              {dailyQuestCount} / 5
            </div>
          </div>
          <p className="text-xs mt-2 text-gray-700">
            {dailyQuestCount >= 5 
              ? "You've completed all your quests for today! Come back tomorrow for more."
              : `You can complete ${5 - dailyQuestCount} more quest${5 - dailyQuestCount === 1 ? '' : 's'} today to earn tokens!`}
          </p>
        </div>
        
        {/* Token Counter Display */}
        <div className="flex justify-between items-center mt-3 mb-3 bg-blue-100 p-3 rounded-lg border-2 border-blue-500">
          <div className="flex items-center">
            <i className="fas fa-coins text-yellow-500 mr-2 text-xl"></i>
            <span className="font-bold">Your Tokens:</span>
          </div>
          <div className="bg-blue-600 text-white font-bold py-1 px-3 rounded-full">
            {tokenCount} / 10
          </div>
        </div>
        
        {/* Redemption Progress */}
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Redemption Progress</span>
            <span className="text-sm font-medium">{tokenCount >= 10 ? "Ready!" : `${tokenCount}/10`}</span>
          </div>
          <div className="h-4 bg-white rounded-full overflow-hidden border-2 border-[#1A1A1A]">
            <div 
              className={`h-full ${tokenCount >= 10 ? 'bg-green-500' : 'bg-blue-500'} transition-all duration-500 ease-in-out`}
              style={{ width: `${Math.min((tokenCount / 10) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs mt-1 text-gray-600">
            {tokenCount >= 10 
              ? "You can now redeem your tokens for a Blux code!" 
              : `Collect ${10 - tokenCount} more tokens to redeem for Blux.`}
          </p>
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
