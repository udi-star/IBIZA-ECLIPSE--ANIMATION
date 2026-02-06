
import React from 'react';

interface EclipseVisualProps {
  progress: number; // 0 to 1
}

const EclipseVisual: React.FC<EclipseVisualProps> = ({ progress }) => {
  // progress 0: Moon is far right
  // progress 0.5: Moon is centered (totality)
  // progress 1: Moon is far left
  
  const moonOffset = (0.5 - progress) * 120; // range from 60 to -60
  const glowOpacity = progress > 0.4 && progress < 0.6 ? 0.8 : 0.1;
  const coronaSize = progress > 0.45 && progress < 0.55 ? 1.4 : 1;

  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center transition-all duration-1000 ease-out">
      {/* Corona / Glow */}
      <div 
        className="absolute w-48 h-48 md:w-56 md:h-56 rounded-full blur-3xl transition-all duration-700 bg-white"
        style={{ 
          opacity: glowOpacity * 0.5,
          transform: `scale(${coronaSize})`
        }}
      />
      
      {/* The Sun */}
      <div className="absolute w-40 h-40 md:w-48 md:h-48 rounded-full bg-white shadow-[0_0_60px_rgba(255,255,255,0.4)]" />

      {/* The Moon */}
      <div 
        className="absolute w-[40.5rem] h-[40.5rem] md:w-[48.5rem] h-[48.5rem] rounded-full bg-[#050505] transition-transform duration-75"
        style={{ 
          transform: `translateX(${moonOffset}%) scale(0.1)`, // Scale down to match sun size, offset creates overlap
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Totality Flare (Baily's Beads / Diamond Ring effect simulation) */}
      <div 
        className="absolute w-2 h-2 bg-white rounded-full blur-[1px] transition-opacity duration-300"
        style={{ 
          opacity: progress > 0.48 && progress < 0.52 ? 1 : 0,
          top: '20%',
          right: '25%'
        }}
      />
    </div>
  );
};

export default EclipseVisual;
