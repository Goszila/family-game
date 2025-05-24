'use client';

import { useState, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';

interface Card {
  id: number;
  value: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // Card values (emojis)
  const cardValues = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

  const initializeGame = () => {
    // Create pairs of cards
    const gameCards: Card[] = [];
    cardValues.forEach((value, index) => {
      gameCards.push(
        { id: index * 2, value, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, value, isFlipped: false, isMatched: false }
      );
    });

    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setGameComplete(false);
  };

  const flipCard = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards.find(card => card.id === cardId)?.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state to show as flipped
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstId);
      const secondCard = cards.find(card => card.id === secondId);

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
          
          // Check if game is complete
          if (matchedPairs + 1 === cardValues.length) {
            setGameComplete(true);
          }
        }, 1000);
      } else {
        // No match, flip cards back
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstId || card.id === secondId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    initializeGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCardStyle = (card: Card) => {
    let baseStyle = "w-20 h-20 rounded-lg border-2 flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 transform ";
    
    if (card.isMatched) {
      baseStyle += "border-green-400 bg-green-100 scale-95 ";
    } else if (card.isFlipped || flippedCards.includes(card.id)) {
      baseStyle += "border-blue-400 bg-blue-50 ";
    } else {
      baseStyle += "border-gray-300 bg-gray-100 hover:bg-gray-200 hover:scale-105 ";
    }
    
    return baseStyle;
  };

  const getScoreGrade = () => {
    if (moves <= 12) return { grade: 'A+', color: 'text-green-600', message: 'Perfect!' };
    if (moves <= 16) return { grade: 'A', color: 'text-green-500', message: 'Excellent!' };
    if (moves <= 20) return { grade: 'B', color: 'text-blue-500', message: 'Good job!' };
    if (moves <= 25) return { grade: 'C', color: 'text-yellow-500', message: 'Not bad!' };
    return { grade: 'D', color: 'text-red-500', message: 'Keep practicing!' };
  };

  return (
    <GameLayout gameTitle="Memory Matching" onReset={initializeGame}>
      <div className="flex flex-col items-center space-y-8">
        {/* Game Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{moves}</div>
              <div className="text-sm text-gray-600">Moves</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{matchedPairs}/{cardValues.length}</div>
              <div className="text-sm text-gray-600">Pairs Found</div>
            </div>
          </div>
        </div>

        {/* Game Complete Message */}
        {gameComplete && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <div className="text-xl font-bold text-gray-800 mb-2">Congratulations!</div>
            <div className="text-lg mb-2">
              You completed the game in <span className="font-bold">{moves}</span> moves
            </div>
            <div className={`text-xl font-bold ${getScoreGrade().color}`}>
              Grade: {getScoreGrade().grade} - {getScoreGrade().message}
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-4 gap-3">
            {cards.map((card) => (
              <button
                key={card.id}
                className={getCardStyle(card)}
                onClick={() => flipCard(card.id)}
                disabled={gameComplete || flippedCards.length === 2}
              >
                {(card.isFlipped || card.isMatched || flippedCards.includes(card.id)) ? (
                  <span>{card.value}</span>
                ) : (
                  <span className="text-gray-400">?</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Play</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Click cards to flip them over</li>
            <li>• Find matching pairs of cards</li>
            <li>• Match all pairs to win the game</li>
            <li>• Try to complete in as few moves as possible!</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
