import { useCallback, RefObject } from "react";

interface GameEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  type: 'player' | 'coin' | 'enemy';
  id?: number;
  dx?: number;
  dy?: number;
  speed?: number;
}

interface GameOptions {
  onScoreChange: (score: number) => void;
}

export function useGameLogic(canvasRef: RefObject<HTMLCanvasElement>, options: GameOptions) {
  let player: GameEntity | null = null;
  let coins: GameEntity[] = [];
  let enemies: GameEntity[] = [];
  let score = 0;
  let gameInterval: number | null = null;
  let keys: Record<string, boolean> = {};
  
  const { onScoreChange } = options;
  
  // Initialize the game
  const initGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with dark background
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Initialize player in the center
    player = {
      x: canvas.width / 2 - 15,
      y: canvas.height / 2 - 15,
      width: 30,
      height: 30,
      color: '#00A2FF',
      type: 'player'
    };
    
    // Draw player
    drawEntity(ctx, player);
    
    // Add event listeners for keyboard
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Initial message
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Nunito, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Press "Start Game" to begin!', canvas.width / 2, canvas.height / 2 + 80);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (gameInterval) window.clearInterval(gameInterval);
    };
  }, [canvasRef]);
  
  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent) => {
    keys[e.key.toLowerCase()] = true;
  };
  
  const handleKeyUp = (e: KeyboardEvent) => {
    keys[e.key.toLowerCase()] = false;
  };
  
  // Draw a game entity
  const drawEntity = (ctx: CanvasRenderingContext2D, entity: GameEntity) => {
    ctx.fillStyle = entity.color;
    
    if (entity.type === 'coin') {
      // Draw a circle for coins
      ctx.beginPath();
      ctx.arc(
        entity.x + entity.width / 2, 
        entity.y + entity.height / 2, 
        entity.width / 2, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
    } else {
      // Draw rectangle for player and enemies
      ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    }
  };
  
  // Check collision between two entities
  const checkCollision = (a: GameEntity, b: GameEntity) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };
  
  // Create a coin at random position
  const createCoin = (canvas: HTMLCanvasElement): GameEntity => {
    return {
      x: Math.random() * (canvas.width - 20),
      y: Math.random() * (canvas.height - 20),
      width: 16,
      height: 16,
      color: '#FFD800',
      type: 'coin',
      id: Date.now() + Math.random()
    };
  };
  
  // Create an enemy at random position with random direction
  const createEnemy = (canvas: HTMLCanvasElement): GameEntity => {
    const speed = 1 + Math.random() * 2;
    return {
      x: Math.random() * (canvas.width - 40),
      y: Math.random() * (canvas.height - 40),
      width: 20,
      height: 20,
      color: '#FF4500',
      type: 'enemy',
      dx: Math.random() > 0.5 ? speed : -speed,
      dy: Math.random() > 0.5 ? speed : -speed,
      speed,
      id: Date.now() + Math.random()
    };
  };
  
  // Game loop
  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas || !player) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Move player based on keyboard input
    const playerSpeed = 5;
    if (keys['w'] || keys['arrowup']) player.y = Math.max(0, player.y - playerSpeed);
    if (keys['s'] || keys['arrowdown']) player.y = Math.min(canvas.height - player.height, player.y + playerSpeed);
    if (keys['a'] || keys['arrowleft']) player.x = Math.max(0, player.x - playerSpeed);
    if (keys['d'] || keys['arrowright']) player.x = Math.min(canvas.width - player.width, player.x + playerSpeed);
    
    // Draw player
    drawEntity(ctx, player);
    
    // Check if we need more coins
    if (coins.length < 5) {
      coins.push(createCoin(canvas));
    }
    
    // Check if we need more enemies
    if (enemies.length < 3) {
      enemies.push(createEnemy(canvas));
    }
    
    // Update and draw coins
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      drawEntity(ctx, coin);
      
      // Check collision with player
      if (checkCollision(player, coin)) {
        // Remove coin and increase score
        coins.splice(i, 1);
        score++;
        onScoreChange(score);
        i--; // Adjust loop counter
      }
    }
    
    // Update and draw enemies
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      
      // Move enemy
      if (enemy.dx !== undefined && enemy.dy !== undefined) {
        enemy.x += enemy.dx;
        enemy.y += enemy.dy;
        
        // Bounce off walls
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvas.width) {
          enemy.dx = -enemy.dx;
        }
        if (enemy.y <= 0 || enemy.y + enemy.height >= canvas.height) {
          enemy.dy = -enemy.dy;
        }
        
        drawEntity(ctx, enemy);
        
        // Check collision with player
        if (checkCollision(player, enemy)) {
          // Reduce score on enemy hit
          if (score > 0) {
            score--;
            onScoreChange(score);
            
            // Reset enemy position
            enemy.x = Math.random() * (canvas.width - enemy.width);
            enemy.y = Math.random() * (canvas.height - enemy.height);
          }
        }
      }
    }
    
    // Draw score
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '14px Nunito, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Collect 20 coins to win! Current: ${score}`, 10, 20);
  };
  
  // Start the game
  const startGame = useCallback(() => {
    if (gameInterval) window.clearInterval(gameInterval);
    
    // Reset game state
    score = 0;
    onScoreChange(0);
    coins = [];
    enemies = [];
    
    // Start game loop
    gameInterval = window.setInterval(gameLoop, 1000 / 60); // 60 FPS
    
    return () => {
      if (gameInterval) window.clearInterval(gameInterval);
    };
  }, []);
  
  // Update score externally
  const updateScore = useCallback((newScore: number) => {
    score = newScore;
    onScoreChange(score);
  }, [onScoreChange]);
  
  return {
    initGame,
    startGame,
    updateScore
  };
}
