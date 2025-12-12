import React, { useState, useMemo } from 'react';
import { IMAGES } from './constants';
import GameEngine from './components/GameEngine';
import { GameState } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isPlaying: false,
    isGameOver: false,
    shotPower: 0,
    highScore: 0
  });

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      isGameOver: false,
      score: 0,
      shotPower: 0
    }));
  };

  const handleGameOver = (finalScore: number) => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: true,
      score: finalScore,
      highScore: Math.max(prev.highScore, finalScore)
    }));
  };

  // Generate background clouds with random positions/sizes
  const bgClouds = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      id: i,
      top: Math.floor(Math.random() * 60) + 5 + '%', // Keep in upper 70%
      delay: -(Math.random() * 50) + 's', // Start at different positions
      opacity: Math.random() * 0.4 + 0.3,
      scale: Math.random() * 0.8 + 0.5,
      speedClass: i % 3 === 0 ? 'animate-float-fast' : (i % 2 === 0 ? 'animate-float-medium' : 'animate-float-slow'),
      zIndex: i % 2 === 0 ? 0 : 2 // Some behind, some in front
    }));
  }, []);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-[#4facfe] to-[#00f2fe] overflow-hidden flex flex-col items-center justify-center select-none">
      
      {/* --- ANIMATED SKY BACKGROUND --- */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {bgClouds.map((cloud) => (
          <img
            key={cloud.id}
            src={IMAGES.cloud}
            alt=""
            className={`cloud-layer ${cloud.speedClass}`}
            style={{
              top: cloud.top,
              opacity: cloud.opacity,
              transform: `scale(${cloud.scale})`,
              animationDelay: cloud.delay,
              left: 0, // Animation handles X translation
              width: '200px', // Base size
              filter: 'brightness(1.1)' 
            }}
          />
        ))}
        {/* Sun Glow */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-yellow-300 rounded-full blur-[80px] opacity-40 mix-blend-screen pointer-events-none" />
      </div>

      {/* GAME SCORE HUD (Only when playing) */}
      {gameState.isPlaying && (
        <div className="absolute top-4 left-0 w-full px-4 z-30 flex justify-between items-start pointer-events-none">
           <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-2xl border-2 border-sky-400 shadow-[0_8px_0_rgba(14,165,233,0.2)] transform -rotate-1">
              <span className="text-2xl font-black text-sky-600 tracking-wide drop-shadow-sm">
                SCORE: <span className="text-3xl text-orange-500">{gameState.score}</span>
              </span>
           </div>
           
           {gameState.shotPower > 0 && (
              <div className="flex flex-col items-end animate-bounce">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-1 rounded-xl shadow-lg border-2 border-white transform rotate-2">
                    <span className="text-sm font-black text-white drop-shadow-md uppercase">
                      Power Level
                    </span>
                  </div>
                  <div className="flex mt-1 gap-1">
                    {[...Array(gameState.shotPower)].map((_, i) => (
                      <div key={i} className="w-4 h-4 bg-yellow-300 rounded-full border-2 border-orange-600 shadow-sm" />
                    ))}
                  </div>
              </div>
           )}
        </div>
      )}

      {/* START SCREEN */}
      {!gameState.isPlaying && !gameState.isGameOver && (
        <div className="z-40 flex flex-col items-center justify-center p-8 bg-white/40 backdrop-blur-lg rounded-[2rem] border-4 border-white/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] max-w-sm w-full mx-4 transition-all animate-fade-in-up">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-sky-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            <img src={IMAGES.player} alt="Logo" className="relative w-32 h-32 drop-shadow-2xl hover:scale-110 transition-transform duration-300" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black text-white mb-8 game-text-outline tracking-tighter text-center transform -rotate-2">
            LOLA <br/> SHOT
          </h1>
          
          <button 
            onClick={startGame}
            className="group relative w-full py-4 bg-gradient-to-b from-green-400 to-green-600 rounded-2xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
          >
            <span className="text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
              Start Game
            </span>
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState.isGameOver && (
        <div className="z-50 flex flex-col items-center justify-center p-8 bg-red-500/80 backdrop-blur-xl rounded-[2.5rem] border-4 border-red-300 shadow-2xl max-w-sm w-full mx-4 animate-bounce-in">
          <h1 className="text-6xl font-black text-white mb-4 game-text-outline tracking-tighter transform rotate-2">
            OOPS!
          </h1>
          
          <div className="flex flex-col items-center gap-1 mb-8 bg-white/90 p-6 rounded-3xl w-full border-4 border-red-200 shadow-inner">
            <div className="text-red-400 font-bold text-sm uppercase tracking-widest">Final Score</div>
            <div className="text-7xl font-black text-slate-800">{gameState.score}</div>
            {gameState.highScore > 0 && (
                <div className="text-yellow-600 font-bold text-sm mt-2 bg-yellow-200 px-3 py-1 rounded-full">
                  BEST: {gameState.highScore}
                </div>
            )}
          </div>
          
          <button 
            onClick={startGame}
            className="w-full py-4 bg-gradient-to-b from-sky-400 to-blue-600 rounded-2xl border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 transition-all shadow-xl"
          >
            <span className="text-xl font-black text-white uppercase tracking-wider">Try Again</span>
          </button>
        </div>
      )}

      {/* GAME LAYER */}
      <div className="absolute inset-0 z-10">
        {gameState.isPlaying && (
          <GameEngine 
            onGameOver={handleGameOver} 
            gameState={gameState} 
            setGameState={setGameState} 
          />
        )}
      </div>

    </div>
  );
}

export default App;