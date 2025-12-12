export interface Entity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Entity {
  width: number;
  height: number;
}

export type EnemyType = 'standard' | 'fast' | 'sine' | 'shield' | 'shooter';

export interface Enemy extends Entity {
  src: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  shootTimer: number; // For shooters
  originalY: number;
  originalX: number;
  // visual flags
  isRed: boolean;
}

export interface Projectile extends Entity {
  type: 'laser' | 'bomb' | 'enemyLaser';
  angle: number; // For lasers
  width: number; // Laser width increases with power
  vx?: number;
  vy?: number;
  isEnemy?: boolean;
}

export interface Particle extends Entity {
  life: number; // Frames remaining
  color?: string;
}

export interface GameState {
  score: number;
  isPlaying: boolean;
  isGameOver: boolean;
  shotPower: number;
  highScore: number;
}