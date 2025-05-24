'use client';

import { useState, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';

type GameState = 'playing' | 'won' | 'lost';

export default function NumberGuessingPage() {
  const [secretNumber, setSecretNumber] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(10);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [hints, setHints] = useState<string[]>([]);

  const resetGame = useCallback(() => {
    setSecretNumber(Math.floor(Math.random() * 100) + 1);
    setGuess('');
    setAttempts(0);
    setGameState('playing');
    setHints([]);
  }, []);

  const makeGuess = () => {
    const guessNumber = parseInt(guess);
    
    if (isNaN(guessNumber) || guessNumber < 1 || guessNumber > 100) {
      alert('Please enter a valid number between 1 and 100');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guessNumber === secretNumber) {
      setGameState('won');
      setHints(prev => [...prev, `🎉 Correct! You won in ${newAttempts} attempts!`]);
    } else if (newAttempts >= maxAttempts) {
      setGameState('lost');
      setHints(prev => [...prev, `💥 Game over! The number was ${secretNumber}`]);
    } else {
      const difference = Math.abs(guessNumber - secretNumber);
      let hint = '';
      
      if (guessNumber < secretNumber) {
        hint = '📈 Too low! ';
      } else {
        hint = '📉 Too high! ';
      }

      if (difference <= 5) {
        hint += 'Very close! 🔥';
      } else if (difference <= 15) {
        hint += 'Getting warmer! 🌡️';
      } else if (difference <= 30) {
        hint += 'You&apos;re in the right area! 🎯';
      } else {
        hint += 'Way off! 🌨️';
      }

      setHints(prev => [...prev, hint]);
    }

    setGuess('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && gameState === 'playing') {
      makeGuess();
    }
  };

  const getScoreColor = () => {
    if (gameState === 'won') {
      if (attempts <= 3) return 'text-green-600';
      if (attempts <= 6) return 'text-yellow-600';
      return 'text-orange-600';
    }
    return 'text-gray-600';
  };

  return (
    <GameLayout gameTitle="Number Guessing Game" onReset={resetGame}>
      <div className="max-w-md mx-auto">
        {/* Game Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
          <p className="text-blue-700 text-sm">
            I&apos;m thinking of a number between 1 and 100. You have {maxAttempts} attempts to guess it!
            I&apos;ll give you hints after each guess.
          </p>
        </div>

        {/* Game Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{attempts}</div>
            <div className="text-sm text-gray-600">Attempts</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{maxAttempts - attempts}</div>
            <div className="text-sm text-gray-600">Remaining</div>
          </div>
        </div>

        {/* Input Section */}
        {gameState === 'playing' && (
          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your guess (1-100)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg"
              />
              <button
                onClick={makeGuess}
                disabled={!guess}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Guess!
              </button>
            </div>
          </div>
        )}

        {/* Game Result */}
        {gameState !== 'playing' && (
          <div className="text-center mb-6">
            {gameState === 'won' ? (
              <div className="bg-green-100 p-6 rounded-lg">
                <div className="text-6xl mb-2">🎉</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Congratulations!</h3>
                <p className="text-green-700">
                  You guessed the number <span className="font-bold">{secretNumber}</span> in{' '}
                  <span className={`font-bold ${getScoreColor()}`}>{attempts}</span> attempts!
                </p>
                <div className="mt-2 text-sm text-green-600">
                  {attempts <= 3 && '🏆 Excellent! You&apos;re a mind reader!'}
                  {attempts > 3 && attempts <= 6 && '🎯 Great job! Nice guessing skills!'}
                  {attempts > 6 && '👍 Good work! You got there in the end!'}
                </div>
              </div>
            ) : (
              <div className="bg-red-100 p-6 rounded-lg">
                <div className="text-6xl mb-2">💥</div>
                <h3 className="text-xl font-bold text-red-800 mb-2">Game Over!</h3>
                <p className="text-red-700">
                  The secret number was <span className="font-bold">{secretNumber}</span>.
                </p>
                <p className="text-red-600 text-sm mt-1">Better luck next time!</p>
              </div>
            )}
            
            <button
              onClick={resetGame}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Hints History */}
        {hints.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Hints:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {hints.map((hint, index) => (
                <div
                  key={index}
                  className="text-sm p-2 bg-white rounded border-l-4 border-blue-400"
                >
                  <span className="text-gray-600">#{index + 1}</span> {hint}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
