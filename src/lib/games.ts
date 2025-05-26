import { Game } from '@/types/game';

export const GAMES: Game[] = [
  {
    id: 'tictactoe',
    name: 'Tic-Tac-Toe',
    description: 'Classic 3x3 grid game. Get three in a row to win!',
    difficulty: 'Easy',
    players: '2 Players',
    estimatedTime: '2-5 minutes',
    path: '/games/tictactoe'
  },
  {
    id: 'rockpaperscissors',
    name: 'Rock Paper Scissors',
    description: 'Challenge the computer in this timeless game of chance and strategy.',
    difficulty: 'Easy',
    players: '1 Player vs Computer',
    estimatedTime: '1-3 minutes',
    path: '/games/rockpaperscissors'
  },
  {
    id: 'memory',
    name: 'Memory Matching',
    description: 'Flip cards to find matching pairs. Test your memory skills!',
    difficulty: 'Medium',
    players: '1 Player',
    estimatedTime: '3-10 minutes',
    path: '/games/memory'
  },
  {
    id: 'numberguessing',
    name: 'Number Guessing',
    description: 'Guess the secret number between 1-100 with hints!',
    difficulty: 'Easy',
    players: '1 Player',
    estimatedTime: '2-5 minutes',
    path: '/games/numberguessing'
  },
  {
    id: 'simon',
    name: 'Simon Says',
    description: 'Remember and repeat the color sequence. How long can you go?',
    difficulty: 'Medium',
    players: '1 Player',
    estimatedTime: '5-15 minutes',
    path: '/games/simon'
  },
  {
    id: 'snake',
    name: 'Snake Game',
    description: 'Classic arcade game! Eat food and grow your snake without hitting walls.',
    difficulty: 'Medium',
    players: '1 Player',
    estimatedTime: '5-20 minutes',
    path: '/games/snake'
  },
  {
    id: 'wordscramble',
    name: 'Word Scramble',
    description: 'Unscramble the letters to form the correct word!',
    difficulty: 'Medium',
    players: '1 Player',
    estimatedTime: '3-8 minutes',
    path: '/games/wordscramble'
  },
  {
    id: '2048',
    name: '2048',
    description: 'Slide tiles to combine numbers and reach the 2048 tile!',
    difficulty: 'Hard',
    players: '1 Player',
    estimatedTime: '10-30 minutes',
    path: '/games/2048'
  },
  {
    id: 'asteroids',
    name: 'Asteroids',
    description: 'Pilot your spaceship through space, destroying asteroids while avoiding collisions!',
    difficulty: 'Hard',
    players: '1 Player',
    estimatedTime: '5-20 minutes',
    path: '/games/asteroids'
  },
  {
    id: 'rpg',
    name: 'Fantasy RPG',
    description: 'Embark on an epic adventure! Battle monsters, collect loot, and level up your hero.',
    difficulty: 'Medium',
    players: '1 Player',
    estimatedTime: '10-30 minutes',
    path: '/games/rpg'
  }
];

export const getGameById = (id: string): Game | undefined => {
  return GAMES.find(game => game.id === id);
};

export const getAllGames = (): Game[] => {
  return GAMES;
};
