import React, { useState, useEffect, useMemo, useCallback } from 'https://esm.sh/react@19.0.0';
import { createRoot } from 'https://esm.sh/react-dom@19.0.0/client';
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@1.40.0";

// --- Configuration ---
const PHASES = ['before', 'first_contact', 'during_peak', 'totality', 'return_of_light', 'afterglow'];
const PHASE_LABELS: Record<string, string> = {
  before: 'Anticipation',
  first_contact: 'Transformation',
  during_peak: 'Ascension',
  totality: 'Totality',
  return_of_light: 'Renewal',
  afterglow: 'Eternal'
};

const DEFAULT_STORYLINE: any = {
  before: { sentence: "Ibiza pulses with a warm, expectant glow.", feeling: "Quiet, Solar", reflection: "What intentions are you carrying into the shadow?" },
  first_contact: { sentence: "A cosmic bite begins the silent transformation.", feeling: "Shift, Breath", reflection: "Can you feel the air cooling on your skin?" },
  during_peak: { sentence: "Surreal silver light washes over the Mediterranean.", feeling: "Ethereal, Gold", reflection: "Who is sharing this half-lit world with you?" },
  totality: { sentence: "The universe holds its breath in a ring of fire.", feeling: "Infinite, Absolute", reflection: "When the sun vanishes, what truth remains?" },
  return_of_light: { sentence: "A diamond spark heralds the second dawn.", feeling: "Birth, Clarity", reflection: "What will you build with this restored light?" },
  afterglow: { sentence: "The shadow leaves a golden mark upon the soul.", feeling: "Presence, Awake", reflection: "How will you speak of this to the future?" }
};

// --- Sub-Component: Visual ---
const EclipseVisual: React.FC<{ progress: number }> = ({ progress }) => {
  const moonOffset = (0.5 - progress) * 115;
  const isTotality = progress > 0.496 && progress < 0.504;
  const isNearTotality = progress > 0.44 && progress < 0.56;
  
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center pointer-events-none select-none">
      <div 
        className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full transition-all duration-1000 ease-out"
        style={{ 
          background: isNearTotality 
            ? 'radial-gradient(circle, #fff 0%, #FFD700 35%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
          filter: `blur(${isTotality ? '65px' : '20px'})`,
          opacity: isNearTotality ? 1 : 0.05,
          transform: `scale(${isTotality ? 2.8 : 1.15})`
        }}
      />
      <div className={`absolute w-40 h-40 md:w-56 md:h-56 rounded-full bg-white transition-all duration-1000 ${isTotality ? 'totality-glow scale-105 shadow-[0_0_100px_#fff]' : 'shadow-[0_0_60px_rgba(255,255,255,0.3)]'}`} />
      <div 
        className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full bg-black transition-transform duration-150 ease-out border border-white/5"
        style={{ transform: `translateX(${moonOffset}%) scale(1.005)` }}
      />
      <div 
        className="absolute w-14 h-14 transition-opacity duration-700"
        style={{ 
          opacity: (progress > 0.488 && progress < 0.493) || (progress > 0.507 && progress < 0.512) ? 1 : 0,
          top: '15%', right: '25%'
        }}
      >
        <div className="absolute inset-0 bg-white rounded-full blur-md animate-pulse" />
        <div className="absolute inset-0 bg-yellow-100 rounded-full scale-150 blur-2xl opacity-50" />
      </div>
    </div>
  );
};

// --- Main App Component ---
const App: React.FC = () => {
  const [storyline, setStoryline] = useState<any>(DEFAULT_STORYLINE);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  
  const stars = useMemo(() => Array.from({ length: 80 }).map((_, i) => ({
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, size: `${Math.random() * 1.5 + 0.5}px`, delay: `${Math.random() * 5}s`
  })), []);

  useEffect(() => {
    const index = Math.min(Math.floor(progress * PHASES.length), PHASES.length - 1);
    if (index !== currentPhaseIndex) setCurrentPhaseIndex(index);
  }, [progress, currentPhaseIndex]);

  useEffect(() => {
    let lastTime = performance.now();
    let frame: number;
    const animate = (time: number) => {
      if (isPlaying) {
        const delta = time - lastTime;
        const proximity = Math.abs(0.5 - progress);
        const speedMultiplier = proximity < 0.05 ? 0.35 : 1;
        const baseSpeed = 0.000045;
        
        setProgress(p => {
          const next = p + delta * baseSpeed * speedMultiplier;
          return next > 1 ? 0 : next;
        });
      }
      lastTime = time;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, progress]);

  const fetchAI = useCallback(async () => {
    try {
      const apiKey = (window as any).process?.env?.API_KEY;
      if (!apiKey) return;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: 'Generate 6 poetic phases for Ibiza Total Solar glasses experience.',
        config: {
          systemInstruction: 'Luxury experience designer. Minimal, poetic. 6 phases: before, first_contact, during_peak, totality, return_of_light, afterglow. JSON output.',
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              before: { type: Type.OBJECT, properties: { sentence: {type: Type.STRING}, feeling: {type: Type.STRING}, reflection: {type: Type.STRING} } },
              first_contact: { type: Type.OBJECT, properties: { sentence: {type: Type.STRING}, feeling: {type: Type.STRING}, reflection: {type: Type.STRING} } },
              during_peak: { type: Type.OBJECT, properties: { sentence: {type: Type.STRING}, feeling: {type: Type.STRING}, reflection: {type: Type.STRING} } },
              totality: { type: Type.OBJECT, properties: { sentence: {type: Type.STRING}, feeling: {type: Type.STRING}, reflection: {type: Type.STRING} } },
              return_of_light: { type: Type.OBJECT, properties: { sentence: {type: Type.STRING}, feeling: {type: Type.STRING}, reflection: {type: Type.STRING} } },
              afterglow: { type: Type.OBJECT, properties: { sentence: {type: Type.STRING}, feeling: {type: Type.STRING}, reflection: {type: Type.STRING} } }
            }
          }
        }
      });
      if (response.text) setStoryline(JSON.parse(response.text));
    } catch (e) { console.warn("AI narrative fetch failed, using poetic defaults."); }
  }, []);

  useEffect(() => { fetchAI(); }, [fetchAI]);

  return (
    <div className="h-screen w-full flex flex-col justify-between overflow-hidden relative select-none bg-black">
      <div className="stars-container">
        {stars.map((s, i) => (
          <div key={i} className="star animate-pulse" style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }} />
        ))}
      </div>

      <header className="p-8 md:p-12 flex justify-between items-center z-20">
        <div className="flex flex-col">
          <h1 className="serif text-white text-2xl tracking-[0.4em] uppercase font-light">Ibiza</h1>
          <span className="text-[10px] tracking-[0.8em] text-yellow-500 uppercase font-bold mt-1">Total Solar</span>
        </div>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center space-x-4 text-[11px] uppercase tracking-[0.4em] text-white hover:text-yellow-400 transition-all group"
        >
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-yellow-500/50 group-hover:bg-yellow-500/5 transition-all">
            {isPlaying ? (
              <div className="flex space-x-1"><div className="w-1 h-3 bg-white" /><div className="w-1 h-3 bg-white" /></div>
            ) : (
              <div className="ml-1 w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent" />
            )}
          </div>
          <span className="hidden sm:inline font-semibold tracking-[0.4em]">{isPlaying ? 'Autoplay' : 'Manual'}</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="mb-6 transition-transform duration-[2000ms]" style={{ transform: `scale(${1 + (progress > 0.46 && progress < 0.54 ? 0.15 : 0)})` }}>
          <EclipseVisual progress={progress} />
        </div>

        <div className="relative w-full max-w-2xl text-center min-h-[300px] flex items-center justify-center px-10">
          {PHASES.map((key, index) => {
            const data = storyline[key] || DEFAULT_STORYLINE[key];
            return (
              <div 
                key={key} 
                className={`absolute phase-transition flex flex-col items-center pointer-events-none ${index === currentPhaseIndex ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90 blur-xl'}`}
              >
                <h2 className="serif text-white text-3xl md:text-5xl mb-8 leading-tight tracking-wide font-light drop-shadow-2xl">
                  {data.sentence}
                </h2>
                <div className="flex items-center space-x-5 mb-10">
                  {data.feeling.split(',').map((f: string, i: number) => (
                    <span key={i} className="text-[9px] uppercase tracking-[0.5em] text-yellow-500 font-bold px-4 py-1.5 border border-yellow-500/20 rounded-full bg-yellow-500/5">
                      {f.trim()}
                    </span>
                  ))}
                </div>
                <p className="text-yellow-100/60 italic font-light text-lg md:text-xl max-w-sm mx-auto border-t border-white/5 pt-8 leading-relaxed">
                  {data.reflection}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <footer className="p-10 md:p-16 z-20 w-full max-w-5xl mx-auto">
        <div className="flex justify-between mb-10 px-4 overflow-x-auto no-scrollbar space-x-6">
          {PHASES.map((key, index) => (
            <button 
              key={key}
              onClick={() => { setProgress(index / (PHASES.length - 1)); setIsPlaying(false); }}
              className={`text-[9px] uppercase tracking-[0.5em] transition-all duration-700 whitespace-nowrap ${index === currentPhaseIndex ? 'text-white font-bold scale-110 translate-y-[-2px]' : 'text-white/20 hover:text-white/50'}`}
            >
              {PHASE_LABELS[key]}
            </button>
          ))}
        </div>
        
        <div className="relative h-[2px] w-full bg-white/10 group">
          <input 
            type="range" min="0" max="1" step="0.0001" value={progress} 
            onInput={(e) => { setProgress(parseFloat((e.target as HTMLInputElement).value)); setIsPlaying(false); }}
            className="absolute -top-6 w-full h-12 opacity-0 cursor-pointer z-50"
          />
          <div className="absolute h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_20px_#f59e0b]" style={{ width: `${progress * 100}%` }} />
          <div className="absolute w-4 h-4 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none shadow-[0_0_15px_#fff]" style={{ left: `${progress * 100}%` }} />
        </div>
        
        <div className="mt-10 flex justify-center opacity-20 text-[7px] uppercase tracking-[1.5em] font-medium text-center text-white">
          <span>Synchronization Complete</span>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
