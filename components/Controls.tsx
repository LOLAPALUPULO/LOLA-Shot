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
    <div className="absolute bottom-0 left-0 w-full h-auto z-20 px-4 pb-4 pt-2 flex justify-between items-end bg-gradient-to-t from-black/60 to-transparent pointer-events-none">
      
      {/* Left Controls (Movement) */}
      <div className="flex flex-col gap-4 pointer-events-auto">
        <button
          className="active:scale-95 transition-transform"
          onMouseDown={(e) => { e.preventDefault(); onUpStart(); }}
          onMouseUp={(e) => { e.preventDefault(); onUpEnd(); }}
          onMouseLeave={onUpEnd}
          onTouchStart={(e) => { e.preventDefault(); onUpStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onUpEnd(); }}
        >
          <img src={IMAGES.buttons.up} alt="Arriba" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />
        </button>
        <button
          className="active:scale-95 transition-transform"
          onMouseDown={(e) => { e.preventDefault(); onDownStart(); }}
          onMouseUp={(e) => { e.preventDefault(); onDownEnd(); }}
          onMouseLeave={onDownEnd}
          onTouchStart={(e) => { e.preventDefault(); onDownStart(); }}
          onTouchEnd={(e) => { e.preventDefault(); onDownEnd(); }}
        >
          <img src={IMAGES.buttons.down} alt="Abajo" className="w-16 h-16 md:w-20 md:h-20 drop-shadow-lg" />
        </button>
      </div>

      {/* Center Info (Hidden on very small screens, shown on md) */}
      <div className="hidden md:flex flex-col items-center justify-center pointer-events-auto bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/10 text-white text-xs text-center mx-4">
        <div className="mb-2 font-bold text-yellow-300 uppercase tracking-widest">Targets</div>
        <div className="flex gap-2 mb-2">
            {IMAGES.enemies.map((src, i) => (
                <img key={i} src={src} className="w-6 h-6 object-contain" alt="target" />
            ))}
        </div>
        <div className="mb-1 font-bold text-green-300 uppercase tracking-widest">Bonus</div>
        <img src={IMAGES.bonus} className="w-6 h-6 object-contain" alt="bonus" />
      </div>

      {/* Right Controls (Fire) */}
      <div className="pointer-events-auto pb-4">
        <button
          className="active:scale-90 transition-transform"
          onClick={(e) => { e.preventDefault(); onFire(); }}
          onTouchStart={(e) => { e.preventDefault(); onFire(); }}
        >
          <img src={IMAGES.buttons.fire} alt="Disparar" className="w-20 h-20 md:w-24 md:h-24 drop-shadow-lg filter hue-rotate-15" />
        </button>
      </div>
    </div>
  );
};

export default Controls;