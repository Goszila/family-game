'use client';

import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '@/components/GameLayout';

interface Character {
  name: string;
  level: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  inventory: Item[];
}

interface Monster {
  name: string;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  gold: number;
  image: string;
}

interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion';
  value: number;
  price: number;
  description: string;
}

interface AudioManager {
  soundEffects: { [key: string]: HTMLAudioElement };
}

const RPGGame: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'adventure' | 'battle' | 'shop' | 'inventory'>('menu');
  const [character, setCharacter] = useState<Character>({
    name: 'Hero',
    level: 1,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    attack: 15,
    defense: 5,
    experience: 0,
    gold: 100,
    inventory: []
  });

  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const audioRef = useRef<AudioManager>({
    soundEffects: {}
  });

  const monsters: Monster[] = [
    {
      name: 'Goblin',
      health: 30,
      maxHealth: 30,
      attack: 8,
      defense: 2,
      experience: 15,
      gold: 10,
      image: '👹'
    },
    {
      name: 'Orc',
      health: 50,
      maxHealth: 50,
      attack: 12,
      defense: 4,
      experience: 25,
      gold: 20,
      image: '👺'
    },
    {
      name: 'Dragon',
      health: 100,
      maxHealth: 100,
      attack: 20,
      defense: 8,
      experience: 50,
      gold: 50,
      image: '🐉'
    }
  ];

  const shopItems: Item[] = [
    {
      id: 'health_potion',
      name: 'Health Potion',
      type: 'potion',
      value: 30,
      price: 25,
      description: 'Restores 30 health points'
    },
    {
      id: 'mana_potion',
      name: 'Mana Potion',
      type: 'potion',
      value: 20,
      price: 20,
      description: 'Restores 20 mana points'
    },
    {
      id: 'iron_sword',
      name: 'Iron Sword',
      type: 'weapon',
      value: 10,
      price: 50,
      description: 'Increases attack by 10'
    },
    {
      id: 'steel_armor',
      name: 'Steel Armor',
      type: 'armor',
      value: 8,
      price: 75,
      description: 'Increases defense by 8'
    }
  ];

  // Audio setup
  useEffect(() => {
    const setupAudio = () => {
      try {
        audioRef.current.soundEffects = {
          attack: createSoundEffect([440, 330, 220], 0.3),
          victory: createSoundEffect([523, 659, 784], 0.5),
          defeat: createSoundEffect([220, 185, 147], 0.8),
          levelUp: createSoundEffect([523, 659, 784, 1047], 0.6),
          purchase: createSoundEffect([659, 784], 0.3),
          heal: createSoundEffect([784, 880, 988], 0.4)
        };

        function createSoundEffect(frequencies: number[], duration: number): HTMLAudioElement {
          const audio = new Audio();
          audio.volume = 0.3;
          
          // Generate a simple beep using data URL
          const sampleRate = 44100;
          const samples = Math.floor(sampleRate * duration);
          const buffer = new ArrayBuffer(44 + samples * 2);
          const view = new DataView(buffer);
          
          // WAV header
          const writeString = (offset: number, str: string) => {
            for (let i = 0; i < str.length; i++) {
              view.setUint8(offset + i, str.charCodeAt(i));
            }
          };
          
          writeString(0, 'RIFF');
          view.setUint32(4, 36 + samples * 2, true);
          writeString(8, 'WAVE');
          writeString(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, 1, true);
          view.setUint32(24, sampleRate, true);
          view.setUint32(28, sampleRate * 2, true);
          view.setUint16(32, 2, true);
          view.setUint16(34, 16, true);
          writeString(36, 'data');
          view.setUint32(40, samples * 2, true);
          
          // Generate sound data
          for (let i = 0; i < samples; i++) {
            const t = i / sampleRate;
            let sample = 0;
            
            frequencies.forEach((freq) => {
              const envelope = Math.exp(-t * 3); // Decay envelope
              sample += Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
            });
            
            const intSample = Math.max(-32767, Math.min(32767, sample * 32767));
            view.setInt16(44 + i * 2, intSample, true);
          }
          
          const blob = new Blob([buffer], { type: 'audio/wav' });
          audio.src = URL.createObjectURL(blob);
          
          return audio;
        }
      } catch {
        // Fallback for browsers that don't support Web Audio API
        audioRef.current.soundEffects = {
          attack: new Audio(),
          victory: new Audio(),
          defeat: new Audio(),
          levelUp: new Audio(),
          purchase: new Audio(),
          heal: new Audio()
        };
      }
    };

    setupAudio();
  }, []);

  const playSound = (soundName: string) => {
    try {
      const sound = audioRef.current.soundEffects[soundName];
      if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {
          // Ignore audio play errors (user hasn't interacted yet)
        });
      }
    } catch {
      // Ignore audio errors
    }
  };

  const startAdventure = () => {
    setGameState('adventure');
  };

  const exploreArea = () => {
    const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
    setCurrentMonster({ ...randomMonster });
    setGameState('battle');
    setBattleLog([`A wild ${randomMonster.name} appears!`]);
    setIsPlayerTurn(true);
  };

  const attack = () => {
    if (!currentMonster || !isPlayerTurn) return;

    playSound('attack');
    
    const damage = Math.max(1, character.attack - currentMonster.defense + Math.floor(Math.random() * 10) - 5);
    const newMonsterHealth = Math.max(0, currentMonster.health - damage);
    
    setCurrentMonster(prev => prev ? { ...prev, health: newMonsterHealth } : null);
    setBattleLog(prev => [...prev, `You attack for ${damage} damage!`]);
    
    if (newMonsterHealth <= 0) {
      // Monster defeated
      setTimeout(() => {
        playSound('victory');
        const expGained = currentMonster.experience;
        const goldGained = currentMonster.gold;
        
        setCharacter(prev => {
          const newExp = prev.experience + expGained;
          const newLevel = Math.floor(newExp / 100) + 1;
          const leveledUp = newLevel > prev.level;
          
          if (leveledUp) {
            playSound('levelUp');
          }
          
          return {
            ...prev,
            experience: newExp,
            level: newLevel,
            gold: prev.gold + goldGained,
            maxHealth: leveledUp ? prev.maxHealth + 20 : prev.maxHealth,
            health: leveledUp ? prev.maxHealth + 20 : prev.health,
            attack: leveledUp ? prev.attack + 5 : prev.attack,
            defense: leveledUp ? prev.defense + 2 : prev.defense
          };
        });
        
        setBattleLog(prev => [
          ...prev,
          `${currentMonster.name} defeated!`,
          `You gained ${expGained} experience and ${goldGained} gold!`
        ]);
        
        setTimeout(() => {
          setGameState('adventure');
          setCurrentMonster(null);
          setBattleLog([]);
        }, 2000);
      }, 1000);
    } else {
      // Monster's turn
      setIsPlayerTurn(false);
      setTimeout(() => {
        const monsterDamage = Math.max(1, currentMonster.attack - character.defense + Math.floor(Math.random() * 6) - 3);
        const newPlayerHealth = Math.max(0, character.health - monsterDamage);
        
        setCharacter(prev => ({ ...prev, health: newPlayerHealth }));
        setBattleLog(prev => [...prev, `${currentMonster.name} attacks for ${monsterDamage} damage!`]);
        
        if (newPlayerHealth <= 0) {
          playSound('defeat');
          setBattleLog(prev => [...prev, 'You have been defeated!']);
          setTimeout(() => {
            setCharacter(prev => ({ ...prev, health: prev.maxHealth, gold: Math.max(0, prev.gold - 20) }));
            setGameState('adventure');
            setCurrentMonster(null);
            setBattleLog([]);
          }, 2000);
        } else {
          setIsPlayerTurn(true);
        }
      }, 1500);
    }
  };

  const consumePotion = (potionType: 'health' | 'mana') => {
    const potion = character.inventory.find(item => 
      item.type === 'potion' && 
      (potionType === 'health' ? item.name.includes('Health') : item.name.includes('Mana'))
    );
    
    if (!potion) return;
    
    playSound('heal');
    
    setCharacter(prev => {
      const newInventory = [...prev.inventory];
      const potionIndex = newInventory.findIndex(item => item.id === potion.id);
      newInventory.splice(potionIndex, 1);
      
      return {
        ...prev,
        inventory: newInventory,
        health: potionType === 'health' ? Math.min(prev.maxHealth, prev.health + potion.value) : prev.health,
        mana: potionType === 'mana' ? Math.min(prev.maxMana, prev.mana + potion.value) : prev.mana
      };
    });
    
    setBattleLog(prev => [...prev, `You used ${potion.name}!`]);
  };

  const buyItem = (item: Item) => {
    if (character.gold < item.price) return;
    
    playSound('purchase');
    
    setCharacter(prev => ({
      ...prev,
      gold: prev.gold - item.price,
      inventory: [...prev.inventory, item],
      attack: item.type === 'weapon' ? prev.attack + item.value : prev.attack,
      defense: item.type === 'armor' ? prev.defense + item.value : prev.defense
    }));
  };

  const renderMenu = () => (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold text-purple-400 mb-8">🏰 Fantasy RPG</h1>
      <div className="bg-gray-800 p-6 rounded-lg">
        <h2 className="text-2xl mb-4">Welcome, Hero!</h2>
        <p className="text-gray-300 mb-6">
          Embark on an epic adventure filled with monsters, treasures, and glory!
        </p>
        <button
          onClick={startAdventure}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
        >
          Start Adventure
        </button>
      </div>
    </div>
  );

  const renderCharacterStats = () => (
    <div className="bg-gray-800 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-bold text-purple-400 mb-2">{character.name} (Level {character.level})</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>Health: {character.health}/{character.maxHealth}</div>
        <div>Mana: {character.mana}/{character.maxMana}</div>
        <div>Attack: {character.attack}</div>
        <div>Defense: {character.defense}</div>
        <div>Experience: {character.experience}</div>
        <div>Gold: {character.gold} 💰</div>
      </div>
      <div className="mt-2">
        <div className="bg-gray-700 h-2 rounded">
          <div 
            className="bg-red-600 h-2 rounded" 
            style={{ width: `${(character.health / character.maxHealth) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderAdventure = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-purple-400">Adventure Zone</h2>
        <div className="space-x-2">
          <button
            onClick={() => setGameState('shop')}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            🏪 Shop
          </button>
          <button
            onClick={() => setGameState('inventory')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            🎒 Inventory
          </button>
        </div>
      </div>
      
      {renderCharacterStats()}
      
      <div className="bg-gray-800 p-6 rounded-lg text-center">
        <p className="text-gray-300 mb-6">You stand at the edge of a dark forest...</p>
        <button
          onClick={exploreArea}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          🗡️ Explore & Fight
        </button>
      </div>
    </div>
  );

  const renderBattle = () => (
    <div className="space-y-4">
      {renderCharacterStats()}
      
      {currentMonster && (
        <div className="bg-red-900 p-4 rounded-lg">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">{currentMonster.image}</div>
            <h3 className="text-xl font-bold">{currentMonster.name}</h3>
            <div className="bg-gray-700 h-2 rounded mt-2">
              <div 
                className="bg-red-600 h-2 rounded" 
                style={{ width: `${(currentMonster.health / currentMonster.maxHealth) * 100}%` }}
              />
            </div>
            <div className="text-sm mt-1">{currentMonster.health}/{currentMonster.maxHealth} HP</div>
          </div>
        </div>
      )}
      
      <div className="bg-gray-800 p-4 rounded-lg h-32 overflow-y-auto">
        {battleLog.map((message, index) => (
          <div key={index} className="text-sm mb-1">{message}</div>
        ))}
      </div>
      
      {isPlayerTurn && currentMonster && currentMonster.health > 0 && (
        <div className="flex space-x-2">
          <button
            onClick={attack}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
          >
            ⚔️ Attack
          </button>
          {character.inventory.some(item => item.name.includes('Health')) && (
            <button
              onClick={() => consumePotion('health')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
            >
              🧪 Heal
            </button>
          )}
          {character.inventory.some(item => item.name.includes('Mana')) && (
            <button
              onClick={() => consumePotion('mana')}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
            >
              🔵 Mana
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderShop = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-400">🏪 Shop</h2>
        <button
          onClick={() => setGameState('adventure')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          Back to Adventure
        </button>
      </div>
      
      {renderCharacterStats()}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shopItems.map(item => (
          <div key={item.id} className="bg-gray-800 p-4 rounded-lg">
            <h3 className="font-bold text-yellow-400">{item.name}</h3>
            <p className="text-sm text-gray-300">{item.description}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-green-400">💰 {item.price} gold</span>
              <button
                onClick={() => buyItem(item)}
                disabled={character.gold < item.price}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded transition-colors text-sm"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-purple-400">🎒 Inventory</h2>
        <button
          onClick={() => setGameState('adventure')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          Back to Adventure
        </button>
      </div>
      
      {renderCharacterStats()}
      
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="font-bold mb-4">Your Items:</h3>
        {character.inventory.length === 0 ? (
          <p className="text-gray-400">Your inventory is empty.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {character.inventory.map((item, index) => (
              <div key={index} className="bg-gray-700 p-2 rounded">
                <div className="font-semibold text-yellow-400">{item.name}</div>
                <div className="text-sm text-gray-300">{item.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <GameLayout gameTitle="Fantasy RPG">
      <div className="max-w-4xl mx-auto p-4">
        {gameState === 'menu' && renderMenu()}
        {gameState === 'adventure' && renderAdventure()}
        {gameState === 'battle' && renderBattle()}
        {gameState === 'shop' && renderShop()}
        {gameState === 'inventory' && renderInventory()}
      </div>
    </GameLayout>
  );
};

export default RPGGame;
