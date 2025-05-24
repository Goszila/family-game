# 🎮 Family Game Platform

A modern web game platform built with Next.js 15, TypeScript, and Tailwind CSS. Play classic games directly in your browser!

## 🌟 Features

- **Modern Tech Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **App Router**: Uses Next.js 15's new app directory structure
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Client-Side Games**: All games run entirely in the browser
- **Extensible Architecture**: Easy to add new games
- **8 Different Games**: Strategy, arcade, memory, and word games
- **Mobile Controls**: Touch-friendly controls for mobile devices
- **Score Tracking**: Local high scores and progress tracking
- **Keyboard Support**: Full keyboard controls for desktop users

## 🎲 Available Games

### Strategy Games
1. **Tic-Tac-Toe** - Classic 3x3 grid game for 2 players
2. **2048** - Slide tiles to combine numbers and reach the 2048 tile!

### Arcade Games
3. **Rock Paper Scissors** - Challenge the computer in this timeless game
4. **Snake Game** - Classic arcade game! Eat food and grow without hitting walls

### Memory Games
5. **Memory Matching** - Test your memory by finding matching pairs
6. **Simon Says** - Remember and repeat the color sequence

### Word & Number Games
7. **Word Scramble** - Unscramble letters to form the correct word
8. **Number Guessing** - Guess the secret number between 1-100 with hints

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Goszila/family-game.git
   cd family-game
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Development

### Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── games/             # Game routes
│   │   ├── tictactoe/     # Tic-Tac-Toe game
│   │   ├── rockpaperscissors/ # Rock Paper Scissors game
│   │   ├── memory/        # Memory matching game
│   │   ├── simon/         # Simon Says memory game
│   │   ├── snake/         # Snake arcade game
│   │   ├── numberguessing/ # Number guessing game
│   │   ├── wordscramble/  # Word scramble game
│   │   └── 2048/          # 2048 sliding puzzle game
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Homepage
├── components/            # Reusable components
│   ├── GameLayout.tsx    # Game page layout
│   └── Navbar.tsx        # Navigation component
├── lib/                  # Utility functions
│   └── games.ts         # Game registry and utilities
└── types/               # TypeScript type definitions
    └── game.ts         # Game-related types
```

### Adding a New Game

1. **Create the game directory**:
   ```bash
   mkdir src/app/games/[game-name]
   ```

2. **Create the game page**:
   ```tsx
   // src/app/games/[game-name]/page.tsx
   'use client';
   
   import GameLayout from '@/components/GameLayout';
   
   export default function YourGamePage() {
     return (
       <GameLayout gameTitle="Your Game" onReset={resetFunction}>
         {/* Your game implementation */}
       </GameLayout>
     );
   }
   ```

3. **Register the game**:
   ```tsx
   // Add to src/lib/games.ts
   {
     id: 'yourgame',
     name: 'Your Game',
     description: 'Description of your game',
     difficulty: 'Easy',
     players: '1 Player',
     estimatedTime: '5 minutes',
     path: '/games/yourgame'
   }
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Styling

This project uses Tailwind CSS for styling. The design features:

- Modern gradient backgrounds
- Card-based layout
- Hover animations and transitions
- Responsive grid layouts
- Accessible color schemes

## 🎮 Game Features

Each game includes:

- **Responsive Design**: Optimized for desktop and mobile
- **Intuitive Controls**: Mouse, touch, and keyboard support
- **Score Systems**: Points, streaks, and local high scores
- **Visual Feedback**: Animations and state indicators
- **Accessibility**: Clear instructions and keyboard navigation
- **Difficulty Options**: Multiple levels where applicable

### Game-Specific Features:

- **Snake**: Real-time movement with WASD/arrow controls
- **2048**: Smooth tile animations with merge effects  
- **Simon Says**: Audio-visual patterns with increasing difficulty
- **Word Scramble**: 3 difficulty levels with hints system
- **Number Guessing**: Smart hint system with proximity indicators
- **Memory Matching**: Card flip animations with move counting

## 🧩 Game Implementation Guidelines

- All games should be client-side only (`'use client'`)
- Use React hooks for state management
- Implement proper TypeScript typing
- Follow the existing game structure for consistency
- Include game rules and instructions
- Add reset functionality
- Make games responsive and accessible

## 📱 Responsive Design

The platform is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔧 Technologies Used

- **Next.js 15** - React framework with app router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React** - Component-based UI library
- **ESLint** - Code linting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your game following the guidelines above
4. Test your implementation
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Future Enhancements

- Score tracking and leaderboards
- Multiplayer games with real-time sync
- More game categories (puzzles, strategy, arcade)
- User accounts and progress saving
- Game statistics and analytics
- Social features and sharing
