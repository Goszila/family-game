# 🎮 Family Game Platform

A modern web game platform built with Next.js 15, TypeScript, and Tailwind CSS. Play classic games directly in your browser!

## 🌟 Features

- **Modern Tech Stack**: Built with Next.js 15, TypeScript, and Tailwind CSS
- **App Router**: Uses Next.js 15's new app directory structure
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Client-Side Games**: All games run entirely in the browser
- **Extensible Architecture**: Easy to add new games

## 🎲 Available Games

1. **Tic-Tac-Toe** - Classic 3x3 grid game for 2 players
2. **Rock Paper Scissors** - Challenge the computer in this timeless game
3. **Memory Matching** - Test your memory by finding matching pairs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
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
│   │   └── memory/        # Memory matching game
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
