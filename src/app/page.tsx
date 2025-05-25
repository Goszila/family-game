import Link from 'next/link';
import { getAllGames } from '@/lib/games';
import { Game } from '@/types/game';
import AnimatedBackground from '@/components/AnimatedBackground';
import FloatingParticles from '@/components/FloatingParticles';

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
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200/50 group-hover:border-blue-300 group-hover:scale-105 group-hover:bg-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
            {game.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
            {game.difficulty}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
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
          <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors flex items-center">
            Play Now 
            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const games = getAllGames();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Floating Particles Background */}
      <FloatingParticles />
      
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-indigo-100/80 to-purple-50/90 z-10"></div>
      
      {/* Main Content */}
      <div className="relative z-20 pt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4 animate-fade-in animate-pulse-glow">
              🎮 Family Game Platform
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto animate-fade-in-delay">
              Welcome to our free web game platform! Choose from our collection of classic games 
              and start playing instantly in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {games.map((game, index) => (
              <div 
                key={game.id} 
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <GameCard game={game} />
              </div>
            ))}
          </div>

          <div className="text-center mt-12 p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg max-w-2xl mx-auto animate-fade-in-delay-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              More Games Coming Soon!
            </h2>
            <p className="text-gray-600">
              We&apos;re constantly adding new games to our platform. Check back regularly for updates 
              or suggest a game you&apos;d like to see added.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
