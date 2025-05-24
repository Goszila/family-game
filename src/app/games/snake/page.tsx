'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type GameState = 'waiting' | 'playing' | 'paused' | 'gameOver';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION: Direction = 'RIGHT';
const GAME_SPEED = 150;

export default function SnakePage() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('snake-high-score') || '0');
    }
    return 0;
  });

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);

  const generateFood = useCallback((snakeBody: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood({ x: 15, y: 15 });
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setGameState('waiting');
    setScore(0);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setGameState('playing');
  }, [resetGame]);

  const pauseGame = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  }, [gameState]);

  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      // Move head based on direction
      switch (directionRef.current) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        setGameState('gameOver');
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameOver');
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            if (typeof window !== 'undefined') {
              localStorage.setItem('snake-high-score', newScore.toString());
            }
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, highScore, generateFood]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, moveSnake]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          if (directionRef.current !== 'DOWN') {
            setDirection('UP');
            directionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          if (directionRef.current !== 'UP') {
            setDirection('DOWN');
            directionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          if (directionRef.current !== 'RIGHT') {
            setDirection('LEFT');
            directionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          if (directionRef.current !== 'LEFT') {
            setDirection('RIGHT');
            directionRef.current = 'RIGHT';
          }
          break;
        case ' ':
          e.preventDefault();
          pauseGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, pauseGame]);

  const getDirectionButton = (dir: Direction, label: string, keys: string) => (
    <button
      onClick={() => {
        if (gameState === 'playing') {
          const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
          if (directionRef.current !== opposites[dir]) {
            setDirection(dir);
            directionRef.current = dir;
          }
        }
      }}
      className={`p-3 rounded-lg font-semibold transition-colors ${
        direction === dir
          ? 'bg-green-600 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${gameState !== 'playing' ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={gameState !== 'playing'}
    >
      <div className="text-lg">{label}</div>
      <div className="text-xs opacity-75">{keys}</div>
    </button>
  );

  return (
    <GameLayout gameTitle="Snake Game" onReset={resetGame}>
      <div className="max-w-2xl mx-auto">
        {/* Game Instructions */}
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-green-800 mb-2">How to Play:</h3>
          <p className="text-green-700 text-sm">              Control the snake to eat food and grow longer. Don&apos;t hit the walls or yourself!
            Use arrow keys, WASD, or the buttons below to move. Press SPACE to pause.
          </p>
        </div>

        {/* Score and Controls */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{highScore}</div>
              <div className="text-sm text-gray-600">High Score</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {gameState === 'waiting' && (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Start Game
              </button>
            )}
            
            {(gameState === 'playing' || gameState === 'paused') && (
              <button
                onClick={pauseGame}
                className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold"
              >
                {gameState === 'paused' ? 'Resume' : 'Pause'}
              </button>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-gray-800 p-4 rounded-lg mb-6 relative">
          <div 
            className="grid gap-0 mx-auto"
            style={{ 
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: '400px',
              height: '400px'
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE;
              const y = Math.floor(index / GRID_SIZE);
              
              const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
              const isSnakeBody = snake.slice(1).some(segment => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;
              
              return (
                <div
                  key={index}
                  className={`border border-gray-700 ${
                    isSnakeHead ? 'bg-green-400' :
                    isSnakeBody ? 'bg-green-600' :
                    isFood ? 'bg-red-500' :
                    'bg-gray-900'
                  }`}
                >
                  {isFood && <div className="w-full h-full flex items-center justify-center text-white text-xs">🍎</div>}
                  {isSnakeHead && <div className="w-full h-full flex items-center justify-center text-white text-xs">👀</div>}
                </div>
              );
            })}
          </div>
          
          {gameState === 'paused' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-2xl font-bold">PAUSED</div>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-6">
          <div></div>
          {getDirectionButton('UP', '↑', 'W/↑')}
          <div></div>
          {getDirectionButton('LEFT', '←', 'A/←')}
          <button
            onClick={pauseGame}
            className="p-3 rounded-lg font-semibold bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
            disabled={gameState === 'waiting'}
          >
            {gameState === 'paused' ? '▶️' : '⏸️'}
          </button>
          {getDirectionButton('RIGHT', '→', 'D/→')}
          <div></div>
          {getDirectionButton('DOWN', '↓', 'S/↓')}
          <div></div>
        </div>

        {/* Game Over */}
        {gameState === 'gameOver' && (
          <div className="bg-red-100 p-6 rounded-lg text-center">
            <div className="text-6xl mb-2">💀</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Game Over!</h3>
            <p className="text-red-700 mb-2">
              Final Score: <span className="font-bold">{score}</span>
            </p>
            <p className="text-red-600 text-sm mb-4">
              Snake Length: {snake.length} segments
            </p>
            {score === highScore && score > 0 && (
              <p className="text-yellow-600 font-bold mb-4">🏆 New High Score!</p>
            )}
            <button
              onClick={startGame}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
