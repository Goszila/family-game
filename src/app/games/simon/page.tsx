'use client';

import { useState, useCallback, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';

type Color = 'red' | 'blue' | 'green' | 'yellow';
type GameState = 'waiting' | 'showing' | 'playing' | 'gameOver';

const COLORS: Color[] = ['red', 'blue', 'green', 'yellow'];

const COLOR_CLASSES = {
  red: 'bg-red-500 hover:bg-red-600 active:bg-red-700',
  blue: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
  green: 'bg-green-500 hover:bg-green-600 active:bg-green-700',
  yellow: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700',
};

const BRIGHT_CLASSES = {
  red: 'bg-red-300 shadow-lg shadow-red-400',
  blue: 'bg-blue-300 shadow-lg shadow-blue-400',
  green: 'bg-green-300 shadow-lg shadow-green-400',
  yellow: 'bg-yellow-300 shadow-lg shadow-yellow-400',
};

export default function SimonPage() {
  const [sequence, setSequence] = useState<Color[]>([]);
  const [playerSequence, setPlayerSequence] = useState<Color[]>([]);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [activeColor, setActiveColor] = useState<Color | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);

  const resetGame = useCallback(() => {
    setSequence([]);
    setPlayerSequence([]);
    setGameState('waiting');
    setCurrentStep(0);
    setScore(0);
    setActiveColor(null);
    setIsShowingSequence(false);
  }, []);

  const addToSequence = useCallback(() => {
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence(prev => [...prev, randomColor]);
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    const firstColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    setSequence([firstColor]);
    setGameState('showing');
  }, [resetGame]);

  const showSequence = useCallback(async () => {
    setIsShowingSequence(true);
    setGameState('showing');
    
    for (let i = 0; i < sequence.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveColor(sequence[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveColor(null);
    }
    
    setIsShowingSequence(false);
    setGameState('playing');
    setPlayerSequence([]);
    setCurrentStep(0);
  }, [sequence]);

  const handleColorClick = useCallback((color: Color) => {
    if (gameState !== 'playing' || isShowingSequence) return;

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    // Check if the player's choice is correct
    if (color !== sequence[currentStep]) {
      setGameState('gameOver');
      return;
    }

    const newStep = currentStep + 1;
    setCurrentStep(newStep);

    // Check if player completed the sequence
    if (newStep === sequence.length) {
      setScore(prev => prev + 1);
      setCurrentStep(0);
      setPlayerSequence([]);
      
      // Add new color to sequence and show it
      setTimeout(() => {
        addToSequence();
      }, 1000);
    }
  }, [gameState, isShowingSequence, playerSequence, currentStep, sequence, addToSequence]);

  // Show sequence when it changes
  useEffect(() => {
    if (sequence.length > 0 && gameState === 'showing') {
      showSequence();
    }
  }, [sequence, showSequence, gameState]);

  // Add new color after score increases
  useEffect(() => {
    if (score > 0 && sequence.length > 0) {
      setTimeout(() => {
        addToSequence();
      }, 500);
    }
  }, [score, addToSequence, sequence.length]);

  const getScoreMessage = () => {
    if (score === 0) return "Let's start!";
    if (score < 5) return "Getting warmed up!";
    if (score < 10) return "Good memory!";
    if (score < 15) return "Excellent!";
    if (score < 20) return "Amazing!";
    return "Memory master!";
  };

  return (
    <GameLayout gameTitle="Simon Says" onReset={resetGame}>
      <div className="max-w-lg mx-auto">
        {/* Game Instructions */}
        <div className="bg-purple-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-purple-800 mb-2">How to Play:</h3>
          <p className="text-purple-700 text-sm">
            Watch the sequence of colors, then repeat it by clicking the colors in the same order.
            Each round adds one more color to remember!
          </p>
        </div>

        {/* Score and Status */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-gray-800 mb-2">Score: {score}</div>
          <div className="text-lg text-gray-600">{getScoreMessage()}</div>
          
          {gameState === 'waiting' && (
            <button
              onClick={startGame}
              className="mt-4 px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold text-lg"
            >
              Start Game
            </button>
          )}
          
          {gameState === 'showing' && (
            <div className="mt-4 text-purple-600 font-semibold">
              Watch the sequence... ({sequence.length} colors)
            </div>
          )}
          
          {gameState === 'playing' && (
            <div className="mt-4 text-green-600 font-semibold">
              Your turn! ({currentStep + 1}/{sequence.length})
            </div>
          )}
        </div>

        {/* Color Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              disabled={gameState !== 'playing'}
              className={`
                w-full h-32 rounded-lg transition-all duration-150 transform
                ${activeColor === color ? BRIGHT_CLASSES[color] : COLOR_CLASSES[color]}
                ${gameState === 'playing' ? 'hover:scale-105 active:scale-95' : ''}
                disabled:cursor-not-allowed
              `}
            >
              <span className="text-white font-bold text-lg capitalize">
                {color}
              </span>
            </button>
          ))}
        </div>

        {/* Game Over */}
        {gameState === 'gameOver' && (
          <div className="bg-red-100 p-6 rounded-lg text-center">
            <div className="text-6xl mb-2">💥</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Game Over!</h3>
            <p className="text-red-700 mb-2">
              You made it to level <span className="font-bold">{score}</span>!
            </p>
            <p className="text-red-600 text-sm mb-4">
              {score === 0 && "Don't give up! Try again!"}
              {score > 0 && score < 5 && "Good start! You can do better!"}
              {score >= 5 && score < 10 && "Nice work! Your memory is improving!"}
              {score >= 10 && score < 15 && "Great job! That's impressive!"}
              {score >= 15 && "Outstanding! You have an excellent memory!"}
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Sequence Display */}
        {sequence.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Current Sequence ({sequence.length} colors):</h3>
            <div className="flex flex-wrap gap-2">
              {sequence.map((color, index) => (
                <div
                  key={index}
                  className={`w-6 h-6 rounded-full ${COLOR_CLASSES[color].split(' ')[0]} 
                    ${index < currentStep ? 'opacity-50' : ''}
                    ${index === currentStep && gameState === 'playing' ? 'ring-2 ring-gray-400' : ''}
                  `}
                  title={`${index + 1}: ${color}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
