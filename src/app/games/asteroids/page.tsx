'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  x: number;
  y: number;
}

interface GameObject extends Position {
  velocity: Velocity;
  angle: number;
}

interface Asteroid extends GameObject {
  size: 'large' | 'medium' | 'small';
  rotationSpeed: number;
}

interface Bullet extends GameObject {
  life: number;
}

interface Ship extends GameObject {
  thrust: boolean;
  lives: number;
  invulnerable: number;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const SHIP_SIZE = 15;
const BULLET_SPEED = 10;
const BULLET_LIFE = 60;
const ASTEROID_SPEEDS = { large: 1, medium: 2, small: 3 };
const ASTEROID_SIZES = { large: 40, medium: 25, small: 15 };
const MAX_ASTEROIDS = 8;

// Sound system
class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};
  private gainNode: GainNode | null = null;
  private thrustOscillator: OscillatorNode | null = null;
  private thrustGain: GainNode | null = null;
  private isMuted = false;

  async init() {
    if (typeof window === 'undefined') return;
    
    try {
      const AudioContextConstructor = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextConstructor) {
        this.audioContext = new AudioContextConstructor();
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = 0.3; // Master volume
        
        // Create sound effects
        await this.createSounds();
      }
    } catch (error) {
      console.warn('Audio not supported:', error);
    }
  }

  private async createSounds() {
    if (!this.audioContext) return;

    // Shooting sound
    this.sounds.shoot = await this.createShootSound();
    
    // Explosion sounds
    this.sounds.explosionLarge = await this.createExplosionSound(0.8, 200);
    this.sounds.explosionMedium = await this.createExplosionSound(0.6, 300);
    this.sounds.explosionSmall = await this.createExplosionSound(0.4, 400);
    
    // Ship explosion
    this.sounds.shipExplosion = await this.createShipExplosionSound();
    
    // Level complete
    this.sounds.levelComplete = await this.createLevelCompleteSound();
  }

  private async createShootSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');
    
    const duration = 0.1;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 20);
      const frequency = 800 - t * 400;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  private async createExplosionSound(intensity: number, baseFreq: number): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');
    
    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 4);
      const noise = (Math.random() - 0.5) * 2;
      const tone = Math.sin(2 * Math.PI * baseFreq * t * (1 - t));
      data[i] = (noise * 0.7 + tone * 0.3) * envelope * intensity * 0.4;
    }

    return buffer;
  }

  private async createShipExplosionSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');
    
    const duration = 1.0;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      const noise = (Math.random() - 0.5) * 2;
      const lowFreq = Math.sin(2 * Math.PI * 100 * t);
      data[i] = (noise * 0.8 + lowFreq * 0.2) * envelope * 0.6;
    }

    return buffer;
  }

  private async createLevelCompleteSound(): Promise<AudioBuffer> {
    if (!this.audioContext) throw new Error('No audio context');
    
    const duration = 1.0;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);

    const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.floor(t * 4) % notes.length;
      const frequency = notes[noteIndex];
      const envelope = Math.exp(-t * 2) * Math.sin(Math.PI * t / duration);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  playSound(soundName: string) {
    if (!this.audioContext || !this.gainNode || this.isMuted || !this.sounds[soundName]) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[soundName];
      source.connect(this.gainNode);
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  startThrust() {
    if (!this.audioContext || !this.gainNode || this.isMuted) return;

    try {
      this.stopThrust(); // Stop any existing thrust sound
      
      this.thrustOscillator = this.audioContext.createOscillator();
      this.thrustGain = this.audioContext.createGain();
      
      this.thrustOscillator.type = 'sawtooth';
      this.thrustOscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
      this.thrustOscillator.frequency.exponentialRampToValueAtTime(120, this.audioContext.currentTime + 0.1);
      
      this.thrustGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      this.thrustGain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
      
      this.thrustOscillator.connect(this.thrustGain);
      this.thrustGain.connect(this.gainNode);
      
      this.thrustOscillator.start();
    } catch (error) {
      console.warn('Error starting thrust sound:', error);
    }
  }

  stopThrust() {
    if (this.thrustOscillator && this.thrustGain && this.audioContext) {
      try {
        this.thrustGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.05);
        this.thrustOscillator.stop(this.audioContext.currentTime + 0.05);
        this.thrustOscillator = null;
        this.thrustGain = null;
      } catch (error) {
        console.warn('Error stopping thrust sound:', error);
      }
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopThrust();
    }
  }

  getMuted() {
    return this.isMuted;
  }

  isInitialized() {
    return this.audioContext !== null;
  }
}

export default function AsteroidsPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const soundManager = useRef<SoundManager>(new SoundManager());

  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('asteroids-high-score') || '0');
    }
    return 0;
  });
  const [level, setLevel] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Toggle mute function
  const toggleMute = useCallback(() => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    soundManager.current.setMute(newMuteState);
  }, [isMuted]);

  const ship = useRef<Ship>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT / 2,
    velocity: { x: 0, y: 0 },
    angle: 0,
    thrust: false,
    lives: 3,
    invulnerable: 0
  });

  const asteroids = useRef<Asteroid[]>([]);
  const bullets = useRef<Bullet[]>([]);

  const createAsteroid = useCallback((x?: number, y?: number, size: 'large' | 'medium' | 'small' = 'large'): Asteroid => {
    const posX = x ?? Math.random() * CANVAS_WIDTH;
    const posY = y ?? Math.random() * CANVAS_HEIGHT;
    const angle = Math.random() * Math.PI * 2;
    const speed = ASTEROID_SPEEDS[size];
    
    return {
      x: posX,
      y: posY,
      velocity: {
        x: Math.cos(angle) * speed,
        y: Math.sin(angle) * speed
      },
      angle: Math.random() * Math.PI * 2,
      size,
      rotationSpeed: (Math.random() - 0.5) * 0.1
    };
  }, []);

  const spawnAsteroids = useCallback((count: number) => {
    asteroids.current = [];
    for (let i = 0; i < count; i++) {
      let x, y;
      do {
        x = Math.random() * CANVAS_WIDTH;
        y = Math.random() * CANVAS_HEIGHT;
      } while (
        Math.abs(x - ship.current.x) < 100 && 
        Math.abs(y - ship.current.y) < 100
      );
      asteroids.current.push(createAsteroid(x, y, 'large'));
    }
  }, [createAsteroid]);

  const resetGame = useCallback(async () => {
    // Initialize sound system if not already done
    if (!soundManager.current.isInitialized()) {
      await soundManager.current.init();
    }
    
    ship.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      velocity: { x: 0, y: 0 },
      angle: 0,
      thrust: false,
      lives: 3,
      invulnerable: 0
    };
    bullets.current = [];
    setScore(0);
    setLevel(1);
    spawnAsteroids(4);
    setGameState('playing');
  }, [spawnAsteroids]);

  const wrapPosition = (obj: GameObject) => {
    if (obj.x < 0) obj.x = CANVAS_WIDTH;
    if (obj.x > CANVAS_WIDTH) obj.x = 0;
    if (obj.y < 0) obj.y = CANVAS_HEIGHT;
    if (obj.y > CANVAS_HEIGHT) obj.y = 0;
  };

  const updateShip = useCallback(() => {
    const s = ship.current;
    
    // Handle rotation
    if (keysRef.current.has('ArrowLeft') || keysRef.current.has('a')) {
      s.angle -= 0.2;
    }
    if (keysRef.current.has('ArrowRight') || keysRef.current.has('d')) {
      s.angle += 0.2;
    }

    // Handle thrust
    const wasThrusting = s.thrust;
    s.thrust = keysRef.current.has('ArrowUp') || keysRef.current.has('w');
    
    // Sound effects for thrust
    if (s.thrust && !wasThrusting) {
      soundManager.current.startThrust();
    } else if (!s.thrust && wasThrusting) {
      soundManager.current.stopThrust();
    }
    
    if (s.thrust) {
      s.velocity.x += Math.cos(s.angle) * 0.5;
      s.velocity.y += Math.sin(s.angle) * 0.5;
    }

    // Apply friction
    s.velocity.x *= 0.98;
    s.velocity.y *= 0.98;

    // Limit max speed
    const maxSpeed = 8;
    const speed = Math.sqrt(s.velocity.x ** 2 + s.velocity.y ** 2);
    if (speed > maxSpeed) {
      s.velocity.x = (s.velocity.x / speed) * maxSpeed;
      s.velocity.y = (s.velocity.y / speed) * maxSpeed;
    }

    // Update position
    s.x += s.velocity.x;
    s.y += s.velocity.y;
    wrapPosition(s);

    // Handle invulnerability
    if (s.invulnerable > 0) s.invulnerable--;
  }, []);

  const updateAsteroids = useCallback(() => {
    asteroids.current.forEach(asteroid => {
      asteroid.x += asteroid.velocity.x;
      asteroid.y += asteroid.velocity.y;
      asteroid.angle += asteroid.rotationSpeed;
      wrapPosition(asteroid);
    });
  }, []);

  const updateBullets = useCallback(() => {
    bullets.current = bullets.current.filter(bullet => {
      bullet.x += bullet.velocity.x;
      bullet.y += bullet.velocity.y;
      bullet.life--;
      wrapPosition(bullet);
      return bullet.life > 0;
    });
  }, []);

  const shootBullet = useCallback(() => {
    const s = ship.current;
    soundManager.current.playSound('shoot');
    bullets.current.push({
      x: s.x + Math.cos(s.angle) * SHIP_SIZE,
      y: s.y + Math.sin(s.angle) * SHIP_SIZE,
      velocity: {
        x: Math.cos(s.angle) * BULLET_SPEED + s.velocity.x,
        y: Math.sin(s.angle) * BULLET_SPEED + s.velocity.y
      },
      angle: s.angle,
      life: BULLET_LIFE
    });
  }, []);

  const checkCollisions = useCallback(() => {
    // Bullet-asteroid collisions
    bullets.current.forEach((bullet, bulletIndex) => {
      asteroids.current.forEach((asteroid, asteroidIndex) => {
        const dx = bullet.x - asteroid.x;
        const dy = bullet.y - asteroid.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (distance < ASTEROID_SIZES[asteroid.size]) {
          // Remove bullet and asteroid
          bullets.current.splice(bulletIndex, 1);
          const hitAsteroid = asteroids.current.splice(asteroidIndex, 1)[0];
          
          // Play explosion sound based on asteroid size
          if (hitAsteroid.size === 'large') {
            soundManager.current.playSound('explosionLarge');
          } else if (hitAsteroid.size === 'medium') {
            soundManager.current.playSound('explosionMedium');
          } else {
            soundManager.current.playSound('explosionSmall');
          }
          
          // Add score
          const points = asteroid.size === 'large' ? 20 : asteroid.size === 'medium' ? 50 : 100;
          setScore(prev => prev + points);
          
          // Split asteroid if not small
          if (hitAsteroid.size === 'large') {
            for (let i = 0; i < 2; i++) {
              asteroids.current.push(createAsteroid(hitAsteroid.x, hitAsteroid.y, 'medium'));
            }
          } else if (hitAsteroid.size === 'medium') {
            for (let i = 0; i < 2; i++) {
              asteroids.current.push(createAsteroid(hitAsteroid.x, hitAsteroid.y, 'small'));
            }
          }
        }
      });
    });

    // Ship-asteroid collisions
    if (ship.current.invulnerable === 0) {
      asteroids.current.forEach(asteroid => {
        const dx = ship.current.x - asteroid.x;
        const dy = ship.current.y - asteroid.y;
        const distance = Math.sqrt(dx ** 2 + dy ** 2);
        
        if (distance < ASTEROID_SIZES[asteroid.size] + SHIP_SIZE) {
          ship.current.lives--;
          ship.current.invulnerable = 120; // 2 seconds at 60fps
          ship.current.x = CANVAS_WIDTH / 2;
          ship.current.y = CANVAS_HEIGHT / 2;
          ship.current.velocity = { x: 0, y: 0 };
          
          // Stop thrust sound and play ship explosion
          soundManager.current.stopThrust();
          soundManager.current.playSound('shipExplosion');
          
          if (ship.current.lives <= 0) {
            setGameState('gameOver');
            if (score > highScore) {
              setHighScore(score);
              localStorage.setItem('asteroids-high-score', score.toString());
            }
          }
        }
      });
    }
  }, [score, highScore, createAsteroid]);

  const checkLevelComplete = useCallback(() => {
    if (asteroids.current.length === 0) {
      soundManager.current.playSound('levelComplete');
      setLevel(prev => prev + 1);
      const newAsteroidCount = Math.min(4 + level, MAX_ASTEROIDS);
      spawnAsteroids(newAsteroidCount);
    }
  }, [level, spawnAsteroids]);

  const drawShip = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = ship.current;
    
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(s.angle);
    
    // Flicker when invulnerable
    if (s.invulnerable === 0 || Math.floor(s.invulnerable / 5) % 2 === 0) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(SHIP_SIZE, 0);
      ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE / 2);
      ctx.lineTo(-SHIP_SIZE / 2, 0);
      ctx.lineTo(-SHIP_SIZE, SHIP_SIZE / 2);
      ctx.closePath();
      ctx.stroke();
      
      // Thrust flame
      if (s.thrust) {
        ctx.strokeStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(-SHIP_SIZE, -4);
        ctx.lineTo(-SHIP_SIZE * 1.5, 0);
        ctx.lineTo(-SHIP_SIZE, 4);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }, []);

  const drawAsteroids = useCallback((ctx: CanvasRenderingContext2D) => {
    asteroids.current.forEach(asteroid => {
      ctx.save();
      ctx.translate(asteroid.x, asteroid.y);
      ctx.rotate(asteroid.angle);
      
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const size = ASTEROID_SIZES[asteroid.size];
      const points = 8;
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const variance = 0.3 + Math.random() * 0.4;
        const x = Math.cos(angle) * size * variance;
        const y = Math.sin(angle) * size * variance;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    });
  }, []);

  const drawBullets = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#ffffff';
    bullets.current.forEach(bullet => {
      ctx.beginPath();
      ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') return;

    updateShip();
    updateAsteroids();
    updateBullets();
    checkCollisions();
    checkLevelComplete();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars background
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 100; i++) {
      const x = (i * 123) % CANVAS_WIDTH;
      const y = (i * 456) % CANVAS_HEIGHT;
      ctx.fillRect(x, y, 1, 1);
    }

    drawShip(ctx);
    drawAsteroids(ctx);
    drawBullets(ctx);

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, updateShip, updateAsteroids, updateBullets, checkCollisions, checkLevelComplete, drawShip, drawAsteroids, drawBullets]);

  useEffect(() => {
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      keysRef.current.add(e.key);
      
      if (gameState === 'playing' && e.key === ' ') {
        shootBullet();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, shootBullet]);

  return (
    <GameLayout gameTitle="Asteroids" onReset={resetGame}>
      <div className="max-w-4xl mx-auto">
        {/* Game Instructions */}
        <div className="bg-gray-900 text-white p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-yellow-400 mb-2">How to Play:</h3>
          <div className="text-sm space-y-1">
            <p><strong>Arrow Keys / WASD:</strong> Rotate and thrust</p>
            <p><strong>Spacebar:</strong> Shoot</p>
            <p><strong>Goal:</strong> Destroy all asteroids while avoiding collisions!</p>
          </div>
        </div>

        {/* Game Stats */}
        {gameState === 'playing' && (
          <div className="flex justify-between items-center mb-4 text-white bg-gray-800 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-400">Score</div>
              <div className="text-xl font-bold">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Level</div>
              <div className="text-xl font-bold">{level}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Lives</div>
              <div className="text-xl font-bold">{'♦'.repeat(ship.current.lives)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">High Score</div>
              <div className="text-xl font-bold text-yellow-400">{highScore}</div>
            </div>
            <button
              onClick={toggleMute}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              title={isMuted ? "Unmute sounds" : "Mute sounds"}
            >
              {isMuted ? '🔇' : '🔊'}
              <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          </div>
        )}

        {/* Game Canvas */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="block mx-auto"
          />

          {/* Game Menu Overlay */}
          {gameState === 'menu' && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-4 text-yellow-400">🚀 ASTEROIDS</h2>
                <p className="text-lg mb-6">Destroy the asteroids and survive in space!</p>
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  Start Game
                </button>
                {highScore > 0 && (
                  <p className="mt-4 text-yellow-400">High Score: {highScore}</p>
                )}
              </div>
            </div>
          )}

          {/* Game Over Overlay */}
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-4xl font-bold mb-2 text-red-400">💥 GAME OVER</h2>
                <p className="text-xl mb-2">Final Score: {score}</p>
                <p className="text-lg mb-6">Level Reached: {level}</p>
                {score === highScore && score > 0 && (
                  <p className="text-yellow-400 mb-4">🎉 New High Score!</p>
                )}
                <button
                  onClick={resetGame}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="mt-6 grid grid-cols-4 gap-2 max-w-xs mx-auto md:hidden">
          <button 
            onTouchStart={() => keysRef.current.add('ArrowLeft')}
            onTouchEnd={() => keysRef.current.delete('ArrowLeft')}
            className="p-3 bg-gray-700 text-white rounded-lg font-bold"
          >
            ↺
          </button>
          <button
            onTouchStart={() => keysRef.current.add('ArrowUp')}
            onTouchEnd={() => keysRef.current.delete('ArrowUp')}
            className="p-3 bg-gray-700 text-white rounded-lg font-bold"
          >
            🚀
          </button>
          <button
            onTouchStart={() => keysRef.current.add('ArrowRight')}
            onTouchEnd={() => keysRef.current.delete('ArrowRight')}
            className="p-3 bg-gray-700 text-white rounded-lg font-bold"
          >
            ↻
          </button>
          <button
            onTouchStart={() => {
              if (gameState === 'playing') shootBullet();
            }}
            className="p-3 bg-red-600 text-white rounded-lg font-bold"
          >
            💥
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
