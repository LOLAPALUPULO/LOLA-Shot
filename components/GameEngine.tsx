import React, { useEffect, useRef, useState, useCallback } from 'react';
import { IMAGES, GAME_CONFIG } from '../constants';
import { Player, Enemy, Projectile, Particle, GameState, Entity, EnemyType } from '../types';
import { playSound } from '../utils/audio';
import Controls from './Controls';

// Helper to check collision
const isColliding = (r1: {x: number, y: number, width: number, height: number}, r2: {x: number, y: number, width: number, height: number}) => {
  return !(
    r1.x + r1.width < r2.x ||
    r1.x > r2.x + r2.width ||
    r1.y + r1.height < r2.y ||
    r1.y > r2.y + r2.height
  );
};

interface GameEngineProps {
  onGameOver: (score: number) => void;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const GameEngine: React.FC<GameEngineProps> = ({ onGameOver, gameState, setGameState }) => {
  // Container refs for dimensions
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mutable game state (Ref based for performance)
  const stateRef = useRef({
    playerY: 0,
    playerRotation: 0,
    movingUp: false,
    movingDown: false,
    enemies: [] as Enemy[],
    bonuses: [] as Entity[],
    clouds: [] as Entity[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    frameCount: 0,
    score: 0,
    shotPower: 0,
    enemySpeed: GAME_CONFIG.INITIAL_ENEMY_SPEED,
    lastScoreIncrease: 0,
    lastBonusScore: 0,
    gameActive: true
  });

  // Force render just for the loop to reflect visual changes if needed
  const [, setTick] = useState(0);

  // Initialize positions
  useEffect(() => {
    if (containerRef.current) {
      const { height } = containerRef.current.getBoundingClientRect();
      stateRef.current.playerY = height / 2 - 30; // Center player
      stateRef.current.gameActive = true;
    }
  }, []);

  // --- CONTROLS HANDLERS ---
  const handleUpStart = useCallback(() => { stateRef.current.movingUp = true; }, []);
  const handleUpEnd = useCallback(() => { stateRef.current.movingUp = false; }, []);
  const handleDownStart = useCallback(() => { stateRef.current.movingDown = true; }, []);
  const handleDownEnd = useCallback(() => { stateRef.current.movingDown = false; }, []);

  const handleFire = useCallback(() => {
    if (!stateRef.current.gameActive) return;
    
    const s = stateRef.current;
    playSound('disparo');
    
    // Recoil logic
    // Add a tiny bit of backwards rotation on fire for visual feedback
    s.playerRotation = -5;
    setTimeout(() => { if(stateRef.current) s.playerRotation = 0; }, 100);

    const laserWidth = 10 + (s.shotPower * 5);
    const playerX = 60; // Approximate visual width of player
    const playerY = s.playerY + 20; // Center of player height

    const spawnLaser = (angle: number) => {
      s.projectiles.push({
        id: Math.random().toString(),
        x: playerX,
        y: playerY,
        width: laserWidth,
        height: 6, // Slightly thicker
        type: 'laser',
        angle: angle,
        vx: Math.cos(angle * Math.PI / 180) * GAME_CONFIG.LASER_SPEED,
        vy: Math.sin(angle * Math.PI / 180) * GAME_CONFIG.LASER_SPEED,
        isEnemy: false
      });
    };

    if (s.shotPower === 0) {
      spawnLaser(0);
    } else if (s.shotPower === 1) {
      spawnLaser(0);
      spawnLaser(15);
    } else if (s.shotPower >= 2) {
      spawnLaser(0);
      spawnLaser(-15);
      spawnLaser(15);
    }

    if (s.shotPower >= 3) {
      playSound('bomba');
      s.projectiles.push({
        id: Math.random().toString(),
        x: playerX + 20,
        y: playerY + 20,
        width: 30,
        height: 30,
        type: 'bomb',
        angle: 0,
        vx: 0,
        vy: GAME_CONFIG.BOMB_SPEED,
        isEnemy: false
      });
    }

  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handleUpStart();
      if (e.key === 'ArrowDown') handleDownStart();
      if (e.key === ' ') { handleFire(); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') handleUpEnd();
      if (e.key === 'ArrowDown') handleDownEnd();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleUpStart, handleUpEnd, handleDownStart, handleDownEnd, handleFire]);


  // --- MAIN GAME LOOP ---
  useEffect(() => {
    let animationFrameId: number;

    const loop = () => {
      if (!containerRef.current || !stateRef.current.gameActive) {
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      const s = stateRef.current;
      const { width: gameWidth, height: gameHeight } = containerRef.current.getBoundingClientRect();

      s.frameCount++;

      // 1. Player Movement
      if (s.movingUp) {
        s.playerY = Math.max(0, s.playerY - GAME_CONFIG.PLAYER_SPEED);
        s.playerRotation = -10; // Tilt up
      } else if (s.movingDown) {
        s.playerY = Math.min(gameHeight - 50, s.playerY + GAME_CONFIG.PLAYER_SPEED);
        s.playerRotation = 10; // Tilt down
      } else {
        // Return to neutral if not shooting/rotating
        s.playerRotation = s.playerRotation * 0.9; 
      }

      // 2. Spawning
      // Clouds (Obstacles - distinct from bg)
      if (s.frameCount % GAME_CONFIG.SPAWN_RATES.CLOUD === 0 && s.clouds.length < 3) {
        s.clouds.push({
          id: Math.random().toString(),
          x: gameWidth,
          y: Math.random() * (gameHeight - 100),
          width: 150,
          height: 80
        });
      }

      // Enemies
      const enemiesToSpawn = s.shotPower >= 3 ? 2 : 1; // Slightly reduced max spawn count for balance with new types
      if (s.frameCount % GAME_CONFIG.SPAWN_RATES.ENEMY === 0) {
        for(let i=0; i<enemiesToSpawn; i++) {
            const rand = Math.random();
            let type: EnemyType = 'standard';
            let health = 1;
            let width = 50;
            let height = 50;
            let imgIndex = 0; // Default Standard

            // Difficulty Logic: Increases complexity every 5 points
            
            // Score 20+: Shooters appear (Most dangerous)
            if (s.score >= 20 && rand > 0.7) {
              type = 'shooter';
              health = 2;
              imgIndex = 3; 
              width = 55; height = 55;
            } 
            // Score 15+: Shield enemies appear
            else if (s.score >= 15 && rand > 0.6) {
              type = 'shield';
              health = 3;
              imgIndex = 2; 
              width = 60; height = 60;
            } 
            // Score 10+: Sine wave enemies
            else if (s.score >= 10 && rand > 0.5) {
              type = 'sine';
              health = 1;
              imgIndex = 1; 
            } 
            // Score 5+: Fast enemies
            else if (s.score >= 5 && rand > 0.3) {
              type = 'fast';
              health = 1;
              width = 40; height = 40;
              imgIndex = 0; // Fast shares standard image but smaller
            }
            // 0-5 Points: Standard enemies only

            s.enemies.push({
              id: Math.random().toString(),
              x: gameWidth + (i * 60),
              y: Math.random() * (gameHeight - 60),
              originalX: gameWidth + (i * 60),
              originalY: Math.random() * (gameHeight - 60),
              width: width,
              height: height,
              src: IMAGES.enemies[imgIndex % IMAGES.enemies.length],
              type: type,
              health: health,
              maxHealth: health,
              shootTimer: Math.floor(Math.random() * 60) + 60, // Random initial delay
              isRed: type === 'shooter', // Visual flag helper
            });
        }
      }

      // Bonus (Lupulo) - Every 15 points
      if (s.score >= 15 && s.score % 15 === 0 && s.score > s.lastBonusScore && s.bonuses.length === 0) {
        s.bonuses.push({
          id: Math.random().toString(),
          x: gameWidth,
          y: Math.random() * (gameHeight - 50),
          width: 45,
          height: 45
        });
        s.lastBonusScore = s.score;
      }

      // 3. Updates & Physics

      // Update Clouds (Front layer obstacles)
      s.clouds.forEach(c => c.x -= 2); 
      s.clouds = s.clouds.filter(c => c.x > -200);

      // Update Projectiles
      s.projectiles.forEach(p => {
        if (p.vx !== undefined && p.vy !== undefined) {
          p.x += p.vx;
          p.y += p.vy;
        } else if (p.type === 'laser') {
          // Fallback for old simple lasers
          p.x += Math.cos(p.angle * Math.PI / 180) * GAME_CONFIG.LASER_SPEED;
          p.y += Math.sin(p.angle * Math.PI / 180) * GAME_CONFIG.LASER_SPEED;
        } else {
          // Bomb falls down
          p.y += GAME_CONFIG.BOMB_SPEED;
        }
      });
      s.projectiles = s.projectiles.filter(p => 
        p.x < gameWidth + 50 && p.x > -50 && p.y < gameHeight + 50 && p.y > -50
      );

      // Update Particles
      s.particles.forEach(p => p.life--);
      s.particles = s.particles.filter(p => p.life > 0);

      // Update Bonuses
      s.bonuses.forEach(b => b.x -= 3);
      s.bonuses = s.bonuses.filter(b => b.x > -50);

      // Update Enemies
      s.enemies.forEach(e => {
        let speed = s.enemySpeed;
        
        // Type specific movement
        if (e.type === 'fast') speed *= 1.5;
        if (e.type === 'shield') speed *= 0.6;
        if (e.type === 'shooter') speed *= 0.8;

        e.x -= speed;

        if (e.type === 'sine') {
          // Sine wave movement
          e.y = e.originalY + Math.sin((gameWidth - e.x) * 0.02) * 60;
        }

        // Shooter Logic
        if (e.type === 'shooter') {
          e.shootTimer--;
          if (e.shootTimer <= 0) {
            // FIRE!
            const dx = 60 - e.x; // Player X is approx 60
            const dy = s.playerY - e.y;
            const angle = Math.atan2(dy, dx);
            
            s.projectiles.push({
              id: 'enemy-proj-' + Math.random(),
              x: e.x,
              y: e.y + e.height/2,
              width: 15,
              height: 15,
              type: 'enemyLaser',
              isEnemy: true,
              angle: angle * 180 / Math.PI,
              vx: Math.cos(angle) * 6, // Fast projectile
              vy: Math.sin(angle) * 6
            });
            e.shootTimer = 180; // Reset cooldown (3 seconds)
          }
        }
        
        // Power Tracking Logic (only for fast/standard enemies when powered up)
        if (s.shotPower >= 2 && (e.type === 'standard' || e.type === 'fast')) {
          const dx = 60 - e.x; 
          const dy = s.playerY - e.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist > 1) {
            e.x += (dx / dist) * 0.5;
            e.y += (dy / dist) * 0.5;
          }
        }
      });
      s.enemies = s.enemies.filter(e => e.x > -100);

      // 4. Collisions

      // Helper for particle spawn
      const spawnSparks = (x: number, y: number, color: string = '#fcd34d') => {
        for(let i=0; i<8; i++) {
          s.particles.push({
            id: Math.random().toString(),
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            width: Math.random() * 6 + 2, 
            height: Math.random() * 6 + 2,
            life: 25,
            color: color
          });
        }
      };

      const playerRect = { x: 10, y: s.playerY + 5, width: 50, height: 30 }; // Slightly smaller hitbox than visual

      // Player vs Enemy
      for (const enemy of s.enemies) {
        const enemyRect = { x: enemy.x + 5, y: enemy.y + 5, width: enemy.width - 10, height: enemy.height - 10 };
        if (isColliding(playerRect, enemyRect)) {
          playSound('gameOver');
          s.gameActive = false;
          onGameOver(s.score);
          return; 
        }
      }

      // Player vs Enemy Projectile
      for (const p of s.projectiles) {
        if (p.isEnemy) {
          if (isColliding(playerRect, p)) {
            playSound('gameOver');
            s.gameActive = false;
            onGameOver(s.score);
            return;
          }
        }
      }

      // Player vs Bonus
      for (let i = s.bonuses.length - 1; i >= 0; i--) {
        if (isColliding(playerRect, s.bonuses[i])) {
          s.bonuses.splice(i, 1);
          playSound('bonus');
          s.shotPower++;
          s.enemySpeed += 0.5; // Slight speed increase on power up
          spawnSparks(playerRect.x + 20, playerRect.y + 20, '#4ade80');
          s.playerRotation = 360;
        }
      }

      // Player Projectiles vs Enemies
      for (let pIndex = s.projectiles.length - 1; pIndex >= 0; pIndex--) {
        const p = s.projectiles[pIndex];
        if (p.isEnemy) continue; // Skip enemy projectiles here

        let projectileHit = false;

        for (let eIndex = s.enemies.length - 1; eIndex >= 0; eIndex--) {
          const e = s.enemies[eIndex];
          if (isColliding(p, e)) {
            // Hit!
            e.health--;
            
            if (e.health <= 0) {
              spawnSparks(e.x + e.width/2, e.y + e.height/2, e.type === 'shooter' ? '#ef4444' : '#fcd34d');
              playSound('explosion');
              s.enemies.splice(eIndex, 1);
              s.score++;
              
              // Update difficulty: Every 5 points, increase speed
              if (s.score > 0 && s.score % 5 === 0 && s.score > s.lastScoreIncrease) {
                s.enemySpeed += 0.3;
                s.lastScoreIncrease = s.score;
              }
            } else {
              // Damaged but alive
              spawnSparks(e.x, e.y, '#fff'); // White sparks for shield hit
              e.x += 15; // Knockback
            }

            projectileHit = true;
            break; 
          }
        }
        if (projectileHit) {
          s.projectiles.splice(pIndex, 1);
        }
      }


      if (gameState.score !== s.score) {
        setGameState(prev => ({ ...prev, score: s.score, shotPower: s.shotPower }));
      }
      
      setTick(t => t + 1);
      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [onGameOver, gameState.score, setGameState]);

  // --- RENDER ---
  return (
    <>
      <div 
        ref={containerRef}
        className="absolute inset-0 w-full h-full overflow-hidden"
      >
        {/* Clouds (Foreground Obstacles) */}
        {stateRef.current.clouds.map(c => (
           <img 
            key={c.id} 
            src={IMAGES.cloud} 
            alt="cloud" 
            className="absolute opacity-90 drop-shadow-lg" 
            style={{ 
              transform: `translate(${c.x}px, ${c.y}px)`, 
              width: c.width, 
              zIndex: 5 
            }} 
          />
        ))}

        {/* Player */}
        <div 
          className="absolute z-20 transition-transform duration-75 ease-out"
          style={{ 
            transform: `translate(10vw, ${stateRef.current.playerY}px) rotate(${stateRef.current.playerRotation}deg)`,
            width: '8vw',
            maxWidth: '65px',
            minWidth: '45px'
          }}
        >
          <img src={IMAGES.player} alt="Lola" className="w-full h-auto drop-shadow-2xl filter brightness-110" />
        </div>

        {/* Enemies */}
        {stateRef.current.enemies.map(e => {
           let filterStyle = '';
           if (e.type === 'shield') filterStyle = 'brightness(0.7) sepia(1) hue-rotate(180deg) saturate(2)'; // Blueish metallic
           if (e.type === 'shooter') filterStyle = 'hue-rotate(-50deg) saturate(3)'; // Purple/Red
           if (e.type === 'fast') filterStyle = 'saturate(0) brightness(1.2)'; // Silver
           
           return (
            <div key={e.id} 
                 className="absolute z-10"
                 style={{
                   transform: `translate(${e.x}px, ${e.y}px)`,
                   width: e.width,
                   height: e.height
                 }}
            >
              <img 
                src={e.src}
                alt="enemy"
                className="w-full h-full drop-shadow-md"
                style={{ filter: filterStyle }}
              />
              {/* Shield/Health Indicator */}
              {e.maxHealth > 1 && (
                 <div className="absolute -top-2 left-0 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${(e.health / e.maxHealth) * 100}%` }} />
                 </div>
              )}
            </div>
          );
        })}

        {/* Bonuses */}
        {stateRef.current.bonuses.map(b => (
          <div
            key={b.id}
            className="absolute z-10"
            style={{
              transform: `translate(${b.x}px, ${b.y}px)`,
              width: b.width,
            }}
          >
             <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-50 animate-pulse"></div>
             <img 
               src={IMAGES.bonus}
               alt="bonus"
               className="relative animate-bounce drop-shadow-md"
               style={{ width: '100%' }}
             />
          </div>
        ))}

        {/* Projectiles */}
        {stateRef.current.projectiles.map(p => {
            if (p.isEnemy) {
              return (
                <div
                  key={p.id}
                  className="absolute z-20 rounded-full shadow-[0_0_10px_#ef4444] animate-pulse"
                  style={{
                    transform: `translate(${p.x}px, ${p.y}px)`,
                    width: p.width,
                    height: p.height,
                    backgroundColor: '#ef4444',
                    border: '2px solid white'
                  }}
                />
              );
            }

            return p.type === 'laser' ? (
              <div 
                key={p.id}
                className="absolute bg-gradient-to-r from-emerald-300 to-white z-10 shadow-[0_0_15px_#4ade80]"
                style={{
                  transform: `translate(${p.x}px, ${p.y}px) rotate(${p.angle}deg)`,
                  width: p.width,
                  height: p.height,
                  borderRadius: '999px',
                  border: '1px solid #fff'
                }}
              />
            ) : (
              <img 
                key={p.id}
                src={IMAGES.bomb}
                alt="bomb"
                className="absolute z-20 drop-shadow-lg"
                style={{
                  transform: `translate(${p.x}px, ${p.y}px)`,
                  width: p.width,
                  height: p.height
                }}
              />
            );
        })}

        {/* Particles */}
        {stateRef.current.particles.map(p => (
          <div 
            key={p.id}
            className="absolute rounded-sm z-30"
            style={{
              transform: `translate(${p.x}px, ${p.y}px) rotate(${Math.random() * 90}deg)`,
              width: p.width,
              height: p.height,
              opacity: p.life / 20,
              backgroundColor: p.color || 'orange',
              boxShadow: `0 0 5px ${p.color || 'orange'}`
            }}
          />
        ))}
        
      </div>

      {/* Controls Overlay */}
      <Controls 
        onUpStart={handleUpStart}
        onUpEnd={handleUpEnd}
        onDownStart={handleDownStart}
        onDownEnd={handleDownEnd}
        onFire={handleFire}
      />
    </>
  );
};

export default GameEngine;