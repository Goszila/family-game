'use client';

import { useEffect, useRef } from 'react';

interface FloatingElement {
  x: number;
  y: number;
  size: number;
  speed: number;
  emoji: string;
  rotation: number;
  rotationSpeed: number;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const elementsRef = useRef<FloatingElement[]>([]);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    // Game-themed emojis for floating elements
    const gameEmojis = ['🎮', '🎯', '🎲', '🃏', '🎊', '⭐', '💎', '🏆', '🎪', '🎨'];
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Initialize floating elements
    const initElements = () => {
      elementsRef.current = [];
      const elementCount = Math.floor((canvas.width * canvas.height) / 25000); // Responsive count
      
      for (let i = 0; i < elementCount; i++) {
        elementsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 20 + Math.random() * 30,
          speed: 0.5 + Math.random() * 1.5,
          emoji: gameEmojis[Math.floor(Math.random() * gameEmojis.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
        });
      }
    };

    initElements();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw floating elements
      elementsRef.current.forEach((element) => {
        // Update position
        element.y -= element.speed;
        element.rotation += element.rotationSpeed;

        // Reset position when element goes off screen
        if (element.y + element.size < 0) {
          element.y = canvas.height + element.size;
          element.x = Math.random() * canvas.width;
        }

        // Draw element
        ctx.save();
        ctx.translate(element.x, element.y);
        ctx.rotate(element.rotation);
        ctx.font = `${element.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add subtle glow effect
        ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        ctx.shadowBlur = 10;
        
        ctx.fillText(element.emoji, 0, 0);
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60"
      style={{ zIndex: -1 }}
    />
  );
}
