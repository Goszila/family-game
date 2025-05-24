'use client';

import { useState } from 'react';
import GameLayout from '@/components/GameLayout';

type CellValue = 'X' | 'O' | null;

export default function TicTacToePage() {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);

  const checkWinner = (squares: CellValue[]): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setGameOver(true);
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('Tie');
      setGameOver(true);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameOver(false);
  };

  const getCellStyle = (index: number) => {
    let baseStyle = "w-20 h-20 border-2 border-gray-400 flex items-center justify-center text-4xl font-bold cursor-pointer transition-all duration-200 ";
    
    if (board[index]) {
      baseStyle += board[index] === 'X' ? 'text-blue-600 ' : 'text-red-600 ';
    }
    
    if (!board[index] && !gameOver) {
      baseStyle += 'hover:bg-gray-100 ';
    }
    
    return baseStyle;
  };

  return (
    <GameLayout gameTitle="Tic-Tac-Toe" onReset={resetGame}>
      <div className="flex flex-col items-center space-y-8">
        {/* Game Status */}
        <div className="text-center">
          {!gameOver ? (
            <div className="text-2xl font-semibold text-gray-800">
              Player <span className={currentPlayer === 'X' ? 'text-blue-600' : 'text-red-600'}>{currentPlayer}</span> turn
            </div>
          ) : (
            <div className="text-2xl font-semibold">
              {winner === 'Tie' ? (
                <span className="text-yellow-600">It&apos;s a Tie!</span>
              ) : (
                <span>
                  Player <span className={winner === 'X' ? 'text-blue-600' : 'text-red-600'}>{winner}</span> Wins! 🎉
                </span>
              )}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-3 gap-2">
            {board.map((cell, index) => (
              <button
                key={index}
                className={getCellStyle(index)}
                onClick={() => handleClick(index)}
                disabled={gameOver || !!board[index]}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>

        {/* Game Rules */}
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">How to Play</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Players take turns placing X&apos;s and O&apos;s</li>
            <li>• Get three in a row (horizontal, vertical, or diagonal) to win</li>
            <li>• If the board fills up without a winner, it&apos;s a tie</li>
          </ul>
        </div>
      </div>
    </GameLayout>
  );
}
