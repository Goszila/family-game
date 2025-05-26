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

export interface RPGCharacter {
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  inventory: RPGItem[];
}

export interface RPGMonster {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  image: string;
}

export interface RPGItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion';
  value: number;
  price: number;
  description: string;
}

export interface RPGGameState extends GameState {
  gameState: 'menu' | 'adventure' | 'battle' | 'shop' | 'inventory';
  character: RPGCharacter;
  currentMonster: RPGMonster | null;
  battleLog: string[];
}
