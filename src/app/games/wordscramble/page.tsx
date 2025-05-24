'use client';

import { useState, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';

type Difficulty = 'easy' | 'medium' | 'hard';

const WORD_LISTS = {
  easy: [
    { word: 'CAT', hint: 'A furry pet that meows' },
    { word: 'DOG', hint: 'A loyal pet that barks' },
    { word: 'SUN', hint: 'Bright star in our sky' },
    { word: 'BOOK', hint: 'You read this' },
    { word: 'TREE', hint: 'Tall plant with leaves' },
    { word: 'FISH', hint: 'Swims in water' },
    { word: 'BIRD', hint: 'Flies in the sky' },
    { word: 'CAKE', hint: 'Sweet dessert' },
    { word: 'BALL', hint: 'Round toy to play with' },
    { word: 'STAR', hint: 'Twinkles in the night sky' },
  ],
  medium: [
    { word: 'COMPUTER', hint: 'Electronic device for work and games' },
    { word: 'ELEPHANT', hint: 'Large animal with a trunk' },
    { word: 'RAINBOW', hint: 'Colorful arc in the sky after rain' },
    { word: 'BICYCLE', hint: 'Two-wheeled vehicle you pedal' },
    { word: 'KITCHEN', hint: 'Room where you cook food' },
    { word: 'MOUNTAIN', hint: 'Very tall natural elevation' },
    { word: 'PENCIL', hint: 'Writing tool made of wood and graphite' },
    { word: 'FLOWER', hint: 'Colorful part of a plant' },
    { word: 'GUITAR', hint: 'Musical instrument with strings' },
    { word: 'THUNDER', hint: 'Loud sound during a storm' },
  ],
  hard: [
    { word: 'BUTTERFLY', hint: 'Insect with colorful wings' },
    { word: 'CHOCOLATE', hint: 'Sweet treat made from cocoa' },
    { word: 'ADVENTURE', hint: 'Exciting journey or experience' },
    { word: 'STRAWBERRY', hint: 'Red fruit with seeds on the outside' },
    { word: 'TELESCOPE', hint: 'Device for looking at distant objects' },
    { word: 'DEMOCRACY', hint: 'Government by the people' },
    { word: 'MYSTERIOUS', hint: 'Hard to understand or explain' },
    { word: 'YESTERDAY', hint: 'The day before today' },
    { word: 'PHOTOGRAPH', hint: 'Captured image or picture' },
    { word: 'PLAYGROUND', hint: 'Area where children play' },
  ],
};

export default function WordScramblePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentWord, setCurrentWord] = useState('');
  const [scrambledWord, setScrambledWord] = useState('');
  const [hint, setHint] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [usedWords, setUsedWords] = useState<string[]>([]);

  const scrambleWord = (word: string): string => {
    const letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join('');
  };

  const getNewWord = useCallback(() => {
    const wordList = WORD_LISTS[difficulty];
    const availableWords = wordList.filter(item => !usedWords.includes(item.word));
    
    if (availableWords.length === 0) {
      // Reset used words if we've used them all
      setUsedWords([]);
      const randomItem = wordList[Math.floor(Math.random() * wordList.length)];
      return randomItem;
    }
    
    const randomItem = availableWords[Math.floor(Math.random() * availableWords.length)];
    return randomItem;
  }, [difficulty, usedWords]);

  const startNewRound = useCallback(() => {
    const wordItem = getNewWord();
    setCurrentWord(wordItem.word);
    setHint(wordItem.hint);
    
    // Make sure scrambled word is different from original
    let scrambled = scrambleWord(wordItem.word);
    while (scrambled === wordItem.word && wordItem.word.length > 1) {
      scrambled = scrambleWord(wordItem.word);
    }
    
    setScrambledWord(scrambled);
    setGuess('');
    setShowHint(false);
    setIsCorrect(null);
    setUsedWords(prev => [...prev, wordItem.word]);
  }, [getNewWord]);

  const resetGame = useCallback(() => {
    setScore(0);
    setStreak(0);
    setGameStarted(false);
    setGuess('');
    setShowHint(false);
    setIsCorrect(null);
    setUsedWords([]);
  }, []);

  const startGame = useCallback(() => {
    setGameStarted(true);
    startNewRound();
  }, [startNewRound]);

  const checkAnswer = useCallback(() => {
    const isGuessCorrect = guess.toUpperCase() === currentWord;
    setIsCorrect(isGuessCorrect);
    
    if (isGuessCorrect) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      const bonusPoints = showHint ? 0 : 5; // Bonus for not using hint
      setScore(prev => prev + points + bonusPoints);
      setStreak(prev => prev + 1);
      
      setTimeout(() => {
        startNewRound();
      }, 2000);
    } else {
      setStreak(0);
      setTimeout(() => {
        setIsCorrect(null);
        setGuess('');
      }, 2000);
    }
  }, [guess, currentWord, difficulty, showHint, startNewRound]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && guess.length > 0) {
      checkAnswer();
    }
  };

  const getStreakMessage = () => {
    if (streak === 0) return '';
    if (streak < 3) return 'Good start!';
    if (streak < 5) return 'Nice streak! 🔥';
    if (streak < 8) return 'Amazing! 🚀';
    return 'Unstoppable! 🏆';
  };

  const getDifficultyColor = (diff: Difficulty) => {
    switch (diff) {
      case 'easy': return 'bg-green-500 hover:bg-green-600';
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'hard': return 'bg-red-500 hover:bg-red-600';
    }
  };

  return (
    <GameLayout gameTitle="Word Scramble" onReset={resetGame}>
      <div className="max-w-md mx-auto">
        {!gameStarted ? (
          <div>
            {/* Game Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">How to Play:</h3>
              <p className="text-blue-700 text-sm mb-3">
                Unscramble the letters to form the correct word. Use the hint if you get stuck!
              </p>
              <div className="text-blue-700 text-sm">
                <strong>Scoring:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Easy: 10 points (+5 bonus without hint)</li>
                  <li>Medium: 20 points (+5 bonus without hint)</li>
                  <li>Hard: 30 points (+5 bonus without hint)</li>
                </ul>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Choose Difficulty:</h3>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-3 rounded-lg font-semibold text-white transition-colors capitalize ${
                      difficulty === diff 
                        ? getDifficultyColor(diff)
                        : 'bg-gray-400 hover:bg-gray-500'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div>
            {/* Game Stats */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{score}</div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{streak}</div>
                <div className="text-sm text-gray-600">Streak</div>
              </div>
              <div className="text-center">
                <div className={`text-sm font-semibold px-2 py-1 rounded text-white ${getDifficultyColor(difficulty).split(' ')[0]}`}>
                  {difficulty.toUpperCase()}
                </div>
              </div>
            </div>

            {streak > 0 && (
              <div className="text-center text-green-600 font-semibold mb-4">
                {getStreakMessage()}
              </div>
            )}

            {/* Scrambled Word */}
            <div className="bg-gray-100 p-6 rounded-lg mb-6 text-center">
              <h3 className="text-sm text-gray-600 mb-2">Unscramble this word:</h3>
              <div className="text-3xl font-bold text-gray-800 tracking-wider mb-4">
                {scrambledWord}
              </div>
              
              {/* Hint Button and Display */}
              {!showHint ? (
                <button
                  onClick={() => setShowHint(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                >
                  Show Hint (-5 points)
                </button>
              ) : (
                <div className="bg-yellow-100 p-3 rounded border-l-4 border-yellow-500">
                  <div className="text-yellow-800 font-semibold">💡 Hint:</div>
                  <div className="text-yellow-700">{hint}</div>
                </div>
              )}
            </div>

            {/* Input and Submit */}
            <div className="mb-6">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter your guess..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg uppercase"
                disabled={isCorrect !== null}
              />
              
              <button
                onClick={checkAnswer}
                disabled={!guess || isCorrect !== null}
                className="w-full mt-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                Submit Answer
              </button>
            </div>

            {/* Result Display */}
            {isCorrect !== null && (
              <div className={`p-4 rounded-lg text-center ${
                isCorrect ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isCorrect ? (
                  <div>
                    <div className="text-4xl mb-2">🎉</div>
                    <div className="text-green-800 font-bold">Correct!</div>
                    <div className="text-green-700 text-sm">
                      The word was: <span className="font-semibold">{currentWord}</span>
                    </div>
                    <div className="text-green-600 text-sm mt-1">
                      +{difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30}
                      {!showHint && ' +5 bonus'} points
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-2">❌</div>
                    <div className="text-red-800 font-bold">Try Again!</div>
                    <div className="text-red-700 text-sm">
                      The correct word was: <span className="font-semibold">{currentWord}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </GameLayout>
  );
}
