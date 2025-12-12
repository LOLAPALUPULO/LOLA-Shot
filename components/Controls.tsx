import React from 'react';
import { IMAGES } from '../constants';

interface ControlsProps {
  onUpStart: () => void;
  onUpEnd: () => void;
  onDownStart: () => void;
  onDownEnd: () => void;
  onFire: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  onUpStart,
  onUpEnd,
  onDownStart,
  onDownEnd,
  onFire,
}) => {
  return (
    <div className="absolute bottom-0 left-0 w-full h-auto z-20 px-6 pb-6 pt-2 flex justify-between items-end bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
      
      {/* Left Controls (Movement) */}
      <div className="flex flex-col gap-4 pointer-events-auto">
        <button
          className="w-16 h-16 md:w-20 md:h-20 bg-blue-500/80 backdrop-blur-sm rounded-full border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 active:bg-blue-600 transition-all shadow-lg flex items-center justify-center group"
          onMouseDown={(e) => { e.preventDefault(); onUpStart(); }}
          onMouseUp={(e) => { e.preventDefault(); onUpEnd(); }}
          onMouseLeave={onUpEnd}
          onTouchStart={(e) => { e.preventDefault(); onUpStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onUpEnd(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          className="w-16 h-16 md:w-20 md:h-20 bg-blue-500/80 backdrop-blur-sm rounded-full border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 active:bg-blue-600 transition-all shadow-lg flex items-center justify-center group"
          onMouseDown={(e) => { e.preventDefault(); onDownStart(); }}
          onMouseUp={(e) => { e.preventDefault(); onDownEnd(); }}
          onMouseLeave={onDownEnd}
          onTouchStart={(e) => { e.preventDefault(); onDownStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onDownEnd(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 md:w-10 md:h-10 text-white drop-shadow-md group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Center Info (Hidden on very small screens, shown on md) */}
      <div className="hidden md:flex flex-col items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white text-xs text-center mx-4 shadow-xl">
        <div className="mb-2 font-bold text-yellow-300 uppercase tracking-widest text-[10px]">Targets</div>
        <div className="flex gap-2 mb-2">
            {IMAGES.enemies.map((src, i) => (
                <img key={i} src={src} className="w-6 h-6 object-contain" alt="target" />
            ))}
        </div>
        <div className="mb-1 font-bold text-green-300 uppercase tracking-widest text-[10px]">Bonus</div>
        <img src={IMAGES.bonus} className="w-6 h-6 object-contain" alt="bonus" />
      </div>

      {/* Right Controls (Fire) */}
      <div className="pointer-events-auto pb-2">
        <button
          className="w-20 h-20 md:w-24 md:h-24 bg-red-500/90 backdrop-blur-sm rounded-full border-b-4 border-red-800 active:border-b-0 active:translate-y-1 active:bg-red-600 transition-all shadow-lg flex items-center justify-center group"
          onClick={(e) => { e.preventDefault(); onFire(); }}
          onTouchStart={(e) => { e.preventDefault(); onFire(); }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 md:w-12 md:h-12 text-white drop-shadow-md group-active:scale-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Controls;