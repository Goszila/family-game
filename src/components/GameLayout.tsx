import Link from 'next/link';

interface GameLayoutProps {
  children: React.ReactNode;
  gameTitle: string;
  onReset?: () => void;
}

export default function GameLayout({ children, gameTitle, onReset }: GameLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
              >
                ← Back to Games
              </Link>
              <h1 className="text-3xl font-bold text-gray-800">{gameTitle}</h1>
            </div>
            {onReset && (
              <button
                onClick={onReset}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                New Game
              </button>
            )}
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
