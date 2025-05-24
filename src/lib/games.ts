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
  }
];

export const getGameById = (id: string): Game | undefined => {
  return GAMES.find(game => game.id === id);
};

export const getAllGames = (): Game[] => {
  return GAMES;
};
