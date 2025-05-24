import Link from 'next/link';
import { getAllGames } from '@/lib/games';
import { Game } from '@/types/game';

function GameCard({ game }: { game: Game }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Link href={game.path} className="group">
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 group-hover:border-blue-300 group-hover:scale-105">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {game.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
            {game.difficulty}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">
          {game.description}
        </p>
        
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <span className="font-medium">Players:</span>
            <span className="ml-2">{game.players}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium">Time:</span>
            <span className="ml-2">{game.estimatedTime}</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
            Play Now →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function GamesPage() {
  const games = getAllGames();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            All Games
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our complete collection of games. Each game is designed to be fun, 
            engaging, and playable directly in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
