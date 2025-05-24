'use client';

import { useState, useCallback, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';

type Board = number[][];
type Direction = 'up' | 'down' | 'left' | 'right';

const GRID_SIZE = 4;
const WIN_VALUE = 2048;

function initializeBoard(): Board {
  const newBoard = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  addRandomTile(newBoard);
  addRandomTile(newBoard);
  return newBoard;
}

function addRandomTile(board: Board): void {
  const emptyCells: [number, number][] = [];
  
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) {
        emptyCells.push([row, col]);
      }
    }
  }

  if (emptyCells.length > 0) {
    const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    board[row][col] = Math.random() < 0.9 ? 2 : 4;
  }
}

const moveLeft = (board: Board): { board: Board; scoreGained: number; moved: boolean } => {
  const newBoard = board.map(row => [...row]);
  let scoreGained = 0;
  let moved = false;

  for (let row = 0; row < GRID_SIZE; row++) {
    const originalRow = [...newBoard[row]];
    
    // Remove zeros
    const filteredRow = newBoard[row].filter(val => val !== 0);
    
    // Merge adjacent equal values
    for (let col = 0; col < filteredRow.length - 1; col++) {
      if (filteredRow[col] === filteredRow[col + 1]) {
        filteredRow[col] *= 2;
        scoreGained += filteredRow[col];
        filteredRow[col + 1] = 0;
      }
    }
    
    // Remove zeros again after merging
    const finalRow = filteredRow.filter(val => val !== 0);
    
    // Pad with zeros
    while (finalRow.length < GRID_SIZE) {
      finalRow.push(0);
    }
    
    newBoard[row] = finalRow;
    
    // Check if row changed
    if (JSON.stringify(originalRow) !== JSON.stringify(finalRow)) {
      moved = true;
    }
  }

  return { board: newBoard, scoreGained, moved };
};

const moveRight = (board: Board): { board: Board; scoreGained: number; moved: boolean } => {
  const reversedBoard = board.map(row => [...row].reverse());
  const result = moveLeft(reversedBoard);
  result.board = result.board.map(row => row.reverse());
  return result;
};

const moveUp = (board: Board): { board: Board; scoreGained: number; moved: boolean } => {
  // Transpose, move left, transpose back
  const transposed = board[0].map((_, colIndex) => board.map(row => row[colIndex]));
  const result = moveLeft(transposed);
  result.board = result.board[0].map((_, colIndex) => result.board.map(row => row[colIndex]));
  return result;
};

const moveDown = (board: Board): { board: Board; scoreGained: number; moved: boolean } => {
  // Transpose, move right, transpose back
  const transposed = board[0].map((_, colIndex) => board.map(row => row[colIndex]));
  const result = moveRight(transposed);
  result.board = result.board[0].map((_, colIndex) => result.board.map(row => row[colIndex]));
  return result;
};

const canMove = (board: Board): boolean => {
  // Check for empty cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] === 0) return true;
    }
  }

  // Check for possible merges
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const current = board[row][col];
      if (
        (row > 0 && board[row - 1][col] === current) ||
        (row < GRID_SIZE - 1 && board[row + 1][col] === current) ||
        (col > 0 && board[row][col - 1] === current) ||
        (col < GRID_SIZE - 1 && board[row][col + 1] === current)
      ) {
        return true;
      }
    }
  }

  return false;
};

const hasWon = (board: Board): boolean => {
  return board.some(row => row.some(cell => cell >= WIN_VALUE));
};

export default function Game2048Page() {
  const [board, setBoard] = useState<Board>(() => initializeBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('2048-best-score') || '0');
    }
    return 0;
  });
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const resetGame = useCallback(() => {
    const newBoard = initializeBoard();
    setBoard(newBoard);
    setScore(0);
    setGameWon(false);
    setGameOver(false);
  }, []);

  const move = useCallback((direction: Direction) => {
    if (gameOver || (gameWon && !gameOver)) return;

    let result;
    switch (direction) {
      case 'left':
        result = moveLeft(board);
        break;
      case 'right':
        result = moveRight(board);
        break;
      case 'up':
        result = moveUp(board);
        break;
      case 'down':
        result = moveDown(board);
        break;
    }

    if (result.moved) {
      addRandomTile(result.board);
      setBoard(result.board);
      
      const newScore = score + result.scoreGained;
      setScore(newScore);
      
      if (newScore > bestScore) {
        setBestScore(newScore);
        if (typeof window !== 'undefined') {
          localStorage.setItem('2048-best-score', newScore.toString());
        }
      }

      if (!gameWon && hasWon(result.board)) {
        setGameWon(true);
      }

      if (!canMove(result.board)) {
        setGameOver(true);
      }
    }
  }, [board, score, bestScore, gameOver, gameWon]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          move('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          move('right');
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          move('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          move('down');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [move]);

  const getTileColor = (value: number): string => {
    const colors: { [key: number]: string } = {
      0: 'bg-gray-200',
      2: 'bg-gray-100 text-gray-800',
      4: 'bg-gray-200 text-gray-800',
      8: 'bg-orange-200 text-orange-800',
      16: 'bg-orange-300 text-white',
      32: 'bg-orange-400 text-white',
      64: 'bg-orange-500 text-white',
      128: 'bg-yellow-300 text-white',
      256: 'bg-yellow-400 text-white',
      512: 'bg-yellow-500 text-white',
      1024: 'bg-red-400 text-white',
      2048: 'bg-red-500 text-white',
    };
    return colors[value] || 'bg-red-600 text-white';
  };

  const getTileSize = (value: number): string => {
    if (value >= 1000) return 'text-sm';
    if (value >= 100) return 'text-lg';
    return 'text-xl';
  };

  return (
    <GameLayout gameTitle="2048" onReset={resetGame}>
      <div className="max-w-lg mx-auto">
        {/* Game Instructions */}
        <div className="bg-orange-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-orange-800 mb-2">How to Play:</h3>
          <p className="text-orange-700 text-sm">
            Use arrow keys (or WASD) to move tiles. When two tiles with the same number touch, they merge into one! 
            Reach the <strong>2048</strong> tile to win!
          </p>
        </div>

        {/* Score Display */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-gray-200 px-4 py-2 rounded-lg text-center">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-xl font-bold text-gray-800">{score}</div>
          </div>
          <div className="bg-yellow-200 px-4 py-2 rounded-lg text-center">
            <div className="text-sm text-yellow-700">Best</div>
            <div className="text-xl font-bold text-yellow-800">{bestScore}</div>
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            New Game
          </button>
        </div>

        {/* Game Board */}
        <div className="bg-gray-400 p-3 rounded-lg mb-6 relative">
          <div className="grid grid-cols-4 gap-3">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    h-16 w-16 rounded flex items-center justify-center font-bold transition-all duration-150
                    ${getTileColor(cell)} ${getTileSize(cell)}
                  `}
                >
                  {cell !== 0 && cell}
                </div>
              ))
            )}
          </div>

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-4xl mb-2">😵</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Game Over!</h3>
                <p className="text-gray-600 mb-4">Final Score: {score}</p>
                <button
                  onClick={resetGame}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Win Overlay */}
          {gameWon && !gameOver && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="bg-white p-6 rounded-lg text-center">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">You Win!</h3>
                <p className="text-gray-600 mb-4">You reached 2048!</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setGameWon(false)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    Keep Playing
                  </button>
                  <button
                    onClick={resetGame}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                  >
                    New Game
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          <div></div>
          <button
            onClick={() => move('up')}
            className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-bold"
          >
            ↑
          </button>
          <div></div>
          <button
            onClick={() => move('left')}
            className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-bold"
          >
            ←
          </button>
          <div className="p-3 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 text-xs">
            WASD<br/>or<br/>Arrows
          </div>
          <button
            onClick={() => move('right')}
            className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-bold"
          >
            →
          </button>
          <div></div>
          <button
            onClick={() => move('down')}
            className="p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-bold"
          >
            ↓
          </button>
          <div></div>
        </div>
      </div>
    </GameLayout>
  );
}
