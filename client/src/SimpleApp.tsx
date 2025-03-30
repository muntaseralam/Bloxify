import React, { useState } from 'react';

/**
 * A simplified version of the BloxToken app without complex UI components
 */
function SimpleApp() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [adsWatched, setAdsWatched] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
  
  // Total number of ads to watch
  const totalAds = 15;
  
  // Handle login
  const handleLogin = () => {
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setGameCompleted(false);
    setAdsWatched(0);
    setCurrentStep(0);
    setToken(null);
  };
  
  // Start quest
  const startQuest = () => {
    if (isLoggedIn) {
      setCurrentStep(1);
    }
  };
  
  // Complete minigame
  const completeMinigame = () => {
    setGameCompleted(true);
    setCurrentStep(2);
  };
  
  // Watch an ad
  const watchAd = () => {
    const newCount = adsWatched + 1;
    setAdsWatched(newCount);
    
    if (newCount >= totalAds) {
      setCurrentStep(3);
      generateToken();
    }
  };
  
  // Generate token
  const generateToken = () => {
    const newToken = `BLOX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setToken(newToken);
    setTokenCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="bg-black text-white p-4 mb-6 rounded-lg">
        <h1 className="text-2xl font-bold">BloxToken</h1>
        <p>Earn tokens for Roblox games</p>
      </header>
      
      <main className="bg-white p-6 rounded-lg shadow-md">
        {/* Auth Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded">
          <h2 className="text-xl font-bold mb-2">Authentication</h2>
          
          {!isLoggedIn ? (
            <div>
              <p className="mb-2">Enter your Roblox username to get started</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your Roblox username"
                  className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button
                  onClick={handleLogin}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Login
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-2">
                Welcome, <span className="font-bold">{username}</span>!
              </p>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
        
        {/* Progress Display */}
        {isLoggedIn && currentStep > 0 && (
          <div className="mb-6 p-4 border border-gray-200 rounded">
            <h2 className="text-xl font-bold mb-2">Your Progress</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className={`p-3 rounded ${currentStep === 1 ? 'bg-yellow-100 border border-yellow-300' : gameCompleted ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}>
                <p className="font-bold">1. Minigame</p>
                <p>{gameCompleted ? 'Completed ✓' : 'Not completed'}</p>
              </div>
              
              <div className={`p-3 rounded ${currentStep === 2 ? 'bg-yellow-100 border border-yellow-300' : (adsWatched >= totalAds) ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}>
                <p className="font-bold">2. Watch Ads</p>
                <p>{adsWatched} / {totalAds} watched</p>
              </div>
              
              <div className={`p-3 rounded ${currentStep === 3 ? 'bg-yellow-100 border border-yellow-300' : token ? 'bg-green-100 border border-green-300' : 'bg-gray-100'}`}>
                <p className="font-bold">3. Get Token</p>
                <p>{token ? 'Token received ✓' : 'Not received'}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Content based on current step */}
        {isLoggedIn && (
          <>
            {currentStep === 0 && (
              <div className="mb-6 p-4 border border-gray-200 rounded">
                <h2 className="text-xl font-bold mb-4">Start Your Quest</h2>
                <p className="mb-4">
                  Complete a minigame, watch ads, and earn a token to redeem in Roblox games!
                </p>
                <button
                  onClick={startQuest}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-bold text-lg"
                >
                  Start Quest
                </button>
              </div>
            )}
            
            {currentStep === 1 && (
              <div className="mb-6 p-4 border border-gray-200 rounded">
                <h2 className="text-xl font-bold mb-4">Minigame</h2>
                <p className="mb-4">
                  Complete the simple challenge to proceed to the next step.
                </p>
                <div className="bg-gray-100 p-4 mb-4 rounded">
                  <p className="mb-2">Minigame Simulation:</p>
                  <p>Click the button below to simulate completing the minigame.</p>
                </div>
                <button
                  onClick={completeMinigame}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Complete Minigame
                </button>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="mb-6 p-4 border border-gray-200 rounded">
                <h2 className="text-xl font-bold mb-4">Watch Ads</h2>
                <p className="mb-4">
                  Watch {totalAds} ads to earn your token.
                </p>
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                    <div 
                      className="bg-blue-500 h-4 rounded-full"
                      style={{ width: `${(adsWatched / totalAds) * 100}%` }}
                    ></div>
                  </div>
                  <p>Progress: {adsWatched} / {totalAds} ads watched</p>
                </div>
                <div className="bg-gray-100 p-4 mb-4 rounded">
                  <p className="mb-2">Ad Simulation:</p>
                  <p>Click the button below to simulate watching an ad.</p>
                </div>
                <button
                  onClick={watchAd}
                  className="bg-purple-500 text-white px-4 py-2 rounded"
                >
                  Watch Ad
                </button>
              </div>
            )}
            
            {currentStep === 3 && (
              <div className="mb-6 p-4 border border-gray-200 rounded">
                <h2 className="text-xl font-bold mb-4">Token Earned!</h2>
                {token ? (
                  <div>
                    <p className="mb-4">
                      Congratulations! You've earned a BloxToken.
                    </p>
                    <div className="bg-green-100 border border-green-300 p-4 rounded mb-4">
                      <p className="font-bold mb-2">Your Token Code:</p>
                      <p className="font-mono bg-white p-2 rounded border border-gray-200 text-center text-lg">
                        {token}
                      </p>
                    </div>
                    <p className="mb-4">
                      Enter this code in the Roblox game to receive your rewards!
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      You've collected {tokenCount} token(s) so far.
                    </p>
                    <button
                      onClick={startQuest}
                      className="bg-orange-500 text-white px-4 py-2 rounded"
                    >
                      Start New Quest
                    </button>
                  </div>
                ) : (
                  <div>
                    <p>Generating your token...</p>
                    <button
                      onClick={generateToken}
                      className="bg-orange-500 text-white px-4 py-2 rounded mt-2"
                    >
                      Generate Token
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
      
      <footer className="mt-8 text-center text-gray-600 text-sm">
        <p>BloxToken - Earn Tokens for Roblox Games</p>
        <p>&copy; {new Date().getFullYear()} BloxToken</p>
      </footer>
    </div>
  );
}

export default SimpleApp;