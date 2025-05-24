export interface Game {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  players: string;
  estimatedTime: string;
  path: string;
}

export interface GameState {
  isActive: boolean;
  winner?: string | null;
  currentPlayer?: string;
}

export interface TicTacToeState extends GameState {
  board: (string | null)[];
  currentPlayer: 'X' | 'O';
}

export interface RockPaperScissorsState extends GameState {
  playerChoice?: string;
  computerChoice?: string;
  playerScore: number;
  computerScore: number;
  round: number;
}

export interface MemoryGameState extends GameState {
  cards: { id: number; value: string; isFlipped: boolean; isMatched: boolean }[];
  flippedCards: number[];
  matchedPairs: number;
  moves: number;
}
