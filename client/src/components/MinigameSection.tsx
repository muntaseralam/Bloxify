import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useGameLogic } from "@/lib/gameLogic";

interface MinigameSectionProps {
  onGameComplete: () => void;
}

const MinigameSection = ({ onGameComplete }: MinigameSectionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
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
  
  const handleStartGame = () => {
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
        
        <div className="bg-black rounded-lg overflow-hidden mx-auto max-w-2xl">
          <canvas 
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-auto"
          />
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            onClick={handleStartGame}
            disabled={gameActive || gameCompleted}
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
                <><i className="fas fa-play mr-2"></i> Start Game</>
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
    </div>
  );
};

export default MinigameSection;
