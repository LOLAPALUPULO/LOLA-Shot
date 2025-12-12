// Audio Assets
export const SOUNDS = {
  disparo: "http://www.marcelomagni.com.ar/sound/disparo.mp3",
  explosion: "http://www.marcelomagni.com.ar/sound/explo.mp3",
  caida: "http://www.marcelomagni.com.ar/sound/caenobj.mp3", // Not heavily used in original logic but kept
  gameOver: "http://www.marcelomagni.com.ar/sound/game-over.mp3",
  bonus: "http://www.marcelomagni.com.ar/sound/bonus.mp3",
  bomba: "http://www.marcelomagni.com.ar/sound/bomba.mp3"
};

// Image Assets
export const IMAGES = {
  background: "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/nubesfondo.jpg",
  player: "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/lola.svg",
  cloud: "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/cloud2.svg",
  bonus: "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/lupulo.svg",
  bomb: "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/bomba.svg",
  buttons: {
    up: "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/Imagenes/BOTarriba.png",
    down: "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/Imagenes/BOTAbajo.png",
    fire: "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/Imagenes/BOTdisparo.png",
  },
  enemies: [
    "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/brahma.svg",
    "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/quilmes.svg",
    "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/Bud.svg",
    "https://raw.githubusercontent.com/LOLAPALUPULO/LOLA-Shot/refs/heads/main/stela.svg"
  ]
};

// Game Config
export const GAME_CONFIG = {
  PLAYER_SPEED: 10, // Adjusted for 60fps loop vs original interval
  LASER_SPEED: 10,
  BOMB_SPEED: 5,
  INITIAL_ENEMY_SPEED: 3, // Slightly adjusted for smooth animation
  SPAWN_RATES: {
    ENEMY: 120, // Frames (approx 2 sec)
    CLOUD: 180, // Frames (approx 3 sec)
  }
};