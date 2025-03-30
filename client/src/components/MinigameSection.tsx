import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameLogic } from "@/lib/gameLogic";
import { useAdProvider } from '../context/AdProviderContext';
import AdsterraAd from "./ads/AdsterraAd";
import BannerAd from "./ads/BannerAd";
import EzoicAd from "./ads/EzoicAd";

interface MinigameSectionProps {
  onGameComplete: () => void;
}

const MinigameSection = ({ onGameComplete }: MinigameSectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const { config } = useAdProvider();
  
  const { initGame, startGame, updateScore } = useGameLogic(canvasRef, {
    onScoreChange: (newScore) => {
      setScore(newScore);
      if (newScore >= 20 && !gameCompleted) {
        setGameCompleted(true);
        setGameActive(false);
        onGameComplete();
      }
    }
  });
  
  useEffect(() => {
    if (canvasRef.current) {
      initGame();
    }
  }, [initGame]);
  
  useEffect(() => {
    // Display Adsterra popup ad when component mounts (in production mode)
    if (config.isProduction && config.adsterraAccountId) {
      // The Adsterra popup will be handled by the script
      // No need to show anything visually
    }
  }, [config.isProduction, config.adsterraAccountId]);
  
  const handleStartGame = () => {
    // Show interstitial ad before starting the game
    setShowInterstitial(true);
  };
  
  const handleInterstitialClose = () => {
    setShowInterstitial(false);
    // Start the game after the interstitial closes
    setGameActive(true);
    startGame();
  };
  
  return (
    <div className="mb-8">
      <div className="bg-[#1A1A1A] p-4 rounded-lg border-6 border-[#1A1A1A] shadow-inner">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            <i className="fas fa-gamepad mr-2"></i> Coin Collection Challenge
          </h3>
          <div className="bg-white px-3 py-1 rounded-full text-[#1A1A1A] font-bold">
            Score: <span>{score}</span>
          </div>
        </div>
        
        {/* Ezoic ad placement above the game */}
        <div className="mb-4">
          <EzoicAd id={101} />
        </div>
        
        <div className="bg-black rounded-lg overflow-hidden mx-auto max-w-2xl">
          <canvas 
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-auto"
          />
        </div>
        
        {/* Banner ad below the game */}
        <div className="mt-2">
          <BannerAd variant="horizontal" />
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            onClick={handleStartGame}
            disabled={gameActive || gameCompleted || showInterstitial}
            className={`game-button font-bold py-2 px-6 rounded-lg border-b-4 border-[#1A1A1A] inline-flex items-center justify-center transition-all ${
              gameCompleted 
                ? 'bg-[#4CAF50] text-white hover:bg-green-500' 
                : 'bg-[#FFD800] text-[#1A1A1A] hover:bg-yellow-400'
            }`}
          >
            {gameCompleted ? (
              <><i className="fas fa-check-circle mr-2"></i> Game Completed!</>
            ) : (
              gameActive ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i> Playing...</>
              ) : (
                showInterstitial ? (
                  <><i className="fas fa-spinner fa-spin mr-2"></i> Ad Playing...</>
                ) : (
                  <><i className="fas fa-play mr-2"></i> Start Game</>
                )
              )
            )}
          </Button>
          
          <div className="text-white mt-4 bg-black bg-opacity-50 p-3 rounded-lg text-left max-w-2xl mx-auto">
            <p className="font-bold mb-2"><i className="fas fa-info-circle mr-1"></i> How to Play:</p>
            <ul className="list-disc pl-5 text-sm space-y-1">
              <li>Use arrow keys or WASD to move your character</li>
              <li>Collect 20 coins to complete the challenge</li>
              <li>Avoid enemies (red blocks) that will reduce your score</li>
              <li>Complete within 60 seconds to succeed</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Adsterra Popup Ad - No visual component needed, handled by Adsterra script */}
      {config.isProduction && config.adsterraAccountId && (
        <AdsterraAd 
          type="popup"
          zoneId="YOUR_ADSTERRA_POPUP_ZONE_ID" // Replace when publishing
        />
      )}
      
      {/* Interstitial ad overlay */}
      {showInterstitial && (
        config.isProduction && config.adsterraAccountId ? (
          // Use Adsterra Interstitial in production
          <AdsterraAd 
            type="interstitial"
            zoneId="YOUR_ADSTERRA_INTERSTITIAL_ZONE_ID" // Replace when publishing
            onClose={handleInterstitialClose}
          />
        ) : (
          // Use simulated interstitial in development
          <AdsterraAd
            type="interstitial"
            zoneId="dev-mode"
            onClose={handleInterstitialClose}
          />
        )
      )}
    </div>
  );
};

export default MinigameSection;
