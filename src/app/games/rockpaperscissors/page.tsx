'use client';

import { useState } from 'react';
import GameLayout from '@/components/GameLayout';

type Choice = 'rock' | 'paper' | 'scissors';
type Result = 'win' | 'lose' | 'tie';

interface GameResult {
  playerChoice: Choice;
  computerChoice: Choice;
  result: Result;
}

export default function RockPaperScissorsPage() {
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [currentRound, setCurrentRound] = useState<GameResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const choices: Choice[] = ['rock', 'paper', 'scissors'];
  
  const getChoiceEmoji = (choice: Choice) => {
    switch (choice) {
      case 'rock': return '🪨';
      case 'paper': return '📄';
      case 'scissors': return '✂️';
    }
  };

  const getChoiceDisplay = (choice: Choice) => {
    switch (choice) {
      case 'rock': return 'Rock';
      case 'paper': return 'Paper';
      case 'scissors': return 'Scissors';
    }
  };

  const determineWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return 'tie';
    
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }
    
    return 'lose';
  };

  const playRound = (playerChoice: Choice) => {
    setIsPlaying(true);
    
    // Add delay for dramatic effect
    setTimeout(() => {
      const computerChoice = choices[Math.floor(Math.random() * choices.length)];
      const result = determineWinner(playerChoice, computerChoice);
      
      setCurrentRound({ playerChoice, computerChoice, result });
      
      if (result === 'win') {
        setPlayerScore(prev => prev + 1);
      } else if (result === 'lose') {
        setComputerScore(prev => prev + 1);
      }
      
      setIsPlaying(false);
    }, 1000);
  };

  const resetGame = () => {
    setPlayerScore(0);
    setComputerScore(0);
    setCurrentRound(null);
    setIsPlaying(false);
  };

  const getResultMessage = (result: Result) => {
    switch (result) {
      case 'win': return '🎉 You Win!';
      case 'lose': return '😔 You Lose!';
      case 'tie': return '🤝 It\'s a Tie!';
    }
  };

  const getResultColor = (result: Result) => {
    switch (result) {
      case 'win': return 'text-green-600';
      case 'lose': return 'text-red-600';
      case 'tie': return 'text-yellow-600';
    }
  };

  return (
    <GameLayout gameTitle="Rock Paper Scissors" onReset={resetGame}>
      <div className="flex flex-col items-center space-y-8">
        {/* Score Board */}
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{playerScore}</div>
              <div className="text-sm text-gray-600">You</div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-lg font-medium text-gray-400">VS</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{computerScore}</div>
              <div className="text-sm text-gray-600">Computer</div>
            </div>
          </div>
        </div>

        {/* Game Result */}
        {currentRound && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="grid grid-cols-3 gap-6 items-center mb-4">
              <div>
                <div className="text-4xl mb-2">{getChoiceEmoji(currentRound.playerChoice)}</div>
                <div className="text-sm text-gray-600">You played</div>
                <div className="font-medium">{getChoiceDisplay(currentRound.playerChoice)}</div>
              </div>
              <div className="text-2xl">VS</div>
              <div>
                <div className="text-4xl mb-2">{getChoiceEmoji(currentRound.computerChoice)}</div>
                <div className="text-sm text-gray-600">Computer played</div>
                <div className="font-medium">{getChoiceDisplay(currentRound.computerChoice)}</div>
              </div>
            </div>
            <div className={`text-xl font-bold ${getResultColor(currentRound.result)}`}>
              {getResultMessage(currentRound.result)}
            </div>
          </div>
        )}

        {/* Choice Buttons */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            {isPlaying ? 'Playing...' : 'Choose your weapon!'}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {choices.map((choice) => (
              <button
                key={choice}
                onClick={() => playRound(choice)}
                disabled={isPlaying}
                className="flex flex-col items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-4xl mb-2">{getChoiceEmoji(choice)}</div>
                <div className="font-medium text-gray-700">{getChoiceDisplay(choice)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Rules</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Rock crushes Scissors</li>
            <li>• Paper covers Rock</li>
            <li>• Scissors cuts Paper</li>
            <li>• First to score wins the round!</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
