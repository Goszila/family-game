import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎮</span>
            <span className="text-xl font-bold text-gray-800">Family Games</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              Home
            </Link>
            <Link 
              href="/games" 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
              All Games
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
