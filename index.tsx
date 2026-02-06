import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

const PHASES = ['before', 'first_contact', 'during_peak', 'totality', 'return_of_light', 'afterglow'];
const PHASE_LABELS: Record<string, string> = {
  before: 'Anticipation',
  first_contact: 'The Arc',
  during_peak: 'Ascension',
  totality: 'Silence',
  return_of_light: 'Renewal',
  afterglow: 'Eternal'
};

const DEFAULT_STORYLINE = {
  before: { sentence: "The Ibiza shoreline waits in sun-drenched silence.", feeling: "Quiet, Gold", reflection: "What are you leaving behind in the day?" },
  first_contact: { sentence: "A gentle shadow claims its first cosmic breath.", feeling: "Shift, Cool", reflection: "Can you feel the weight of the air changing?" },
  during_peak: { sentence: "The familiar turns surreal as silver light descends.", feeling: "Ethereal, Pure", reflection: "In this half-light, who do you see beside you?" },
  totality: { sentence: "Infinity reveals itself in a ring of fire.", feeling: "Absolute, Awe", reflection: "When the sun vanishes, what light remains within?" },
  return_of_light: { sentence: "A single diamond spark restores the world.", feeling: "Birth, Clarity", reflection: "What will you build with this second dawn?" },
  afterglow: { sentence: "The shadow leaves a mark the light cannot erase.", feeling: "Awake, Presence", reflection: "How will you speak of this to the stars?" }
};

const EclipseVisual: React.FC<{ progress: number }> = ({ progress }) => {
  const moonOffset = (0.5 - progress) * 115;
  const isTotality = progress > 0.485 && progress < 0.515;
  const isNearTotality = progress > 0.43 && progress < 0.57;
  
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center pointer-events-none select-none">
      <div 
        className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full transition-all duration-1000 ease-out"
        style={{ 
          background: isNearTotality 
            ? 'radial-gradient(circle, #fff 0%, #FFD700 30%, transparent 70%)'
            : 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          filter: `blur(${isTotality ? '45px' : '20px'})`,
          opacity: isNearTotality ? 1 : 0.05,
          transform: `scale(${isTotality ? 2.5 : 1.1})`
        }}
      />
      <div className={`absolute w-36 h-36 md:w-48 md:h-48 rounded-full bg-white transition-all duration-1000 ${isTotality ? 'gold-glow scale-105' : 'shadow-[0_0_50px_rgba(255,255,255,0.3)]'}`} />
      <div 
        className="absolute w-36 h-36 md:w-48 md:h-48 rounded-full bg-black transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${moonOffset}%) scale(1.002)` }}
      />
      <div 
        className="absolute w-10 h-10 transition-opacity duration-700"
        style={{ 
          opacity: (progress > 0.475 && progress < 0.485) || (progress > 0.515 && progress < 0.525) ? 1 : 0,
          top: '20%', right: '28%'
        }}
      >
        <div className="absolute inset-0 bg-white rounded-full blur-md animate-pulse" />
        <div className="absolute inset-0 bg-yellow-200 rounded-full scale-150 blur-xl opacity-40" />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [storyline, setStoryline] = useState<any>(DEFAULT_STORYLINE);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  
  const stars = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, size: `${Math.random() * 2 + 1}px`, delay: `${Math.random() * 5}s`
  })), []);

  useEffect(() => {
    const index = Math.min(Math.floor(progress * PHASES.length), PHASES.length - 1);
    if (index !== currentPhaseIndex) setCurrentPhaseIndex(index);
  }, [progress]);

  useEffect(() => {
    let lastTime = performance.now();
    let frame: number;
    const animate = (time: number) => {
      if (isPlaying) {
        const delta = time - lastTime;
        const speed = (progress > 0.46 && progress < 0.54) ? 0.00002 : 0.00005;
        setProgress(p => {
          const next = p + delta * speed;
          return next > 1 ? 0 : next;
        });
      }
      lastTime = time;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, progress]);

  useEffect(() => {
    const fetchAI = async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'Poetic narrative for Ibiza Total Solar.',
          config: {
            systemInstruction: 'Luxury experience designer. 6 phases: Anticipation, Shift, Ascension, Totality, Renewal, Afterglow. Sentence (White, 12 words max), Feeling (Gold, 2 words), Reflection (Yellow, 1 question).',
            responseMimeType: "application/json"
          }
        });
        if (response.text) setStoryline(JSON.parse(response.text));
      } catch (e) { console.debug("Using fallback narrative"); }
    };
    fetchAI();
  }, []);

  return (
    <div className="h-screen w-full flex flex-col justify-between overflow-hidden relative">
      <div className="stars-container">
        {stars.map((s, i) => (
          <div key={i} className="star animate-pulse" style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }} />
        ))}
      </div>

      <header className="p-8 md:p-12 flex justify-between items-center z-20">
        <div className="flex flex-col">
          <h1 className="serif text-white text-xl tracking-[0.5em] uppercase font-light">Ibiza</h1>
          <span className="text-[9px] tracking-[0.8em] text-yellow-500 uppercase font-bold mt-1">Total Solar</span>
        </div>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center space-x-3 text-[10px] uppercase tracking-[0.4em] text-white/40 hover:text-white transition-all group"
        >
          <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/30">
            {isPlaying ? <span className="block w-2 h-2 bg-white" /> : <div className="ml-1 w-0 h-0 border-t-4 border-t-transparent border-l-8 border-l-white border-b-4 border-b-transparent" />}
          </div>
          <span className="hidden sm:inline">{isPlaying ? 'Autoplay On' : 'Autoplay Off'}</span>
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="mb-8 transition-transform duration-[1500ms]" style={{ transform: `scale(${1 + (progress > 0.45 && progress < 0.55 ? 0.15 : 0)})` }}>
          <EclipseVisual progress={progress} />
        </div>

        <div className="relative w-full max-w-2xl text-center min-h-[300px] flex items-center justify-center">
          {PHASES.map((key, index) => (
            <div 
              key={key} 
              className={`absolute transition-text flex flex-col items-center pointer-events-none ${index === currentPhaseIndex ? 'opacity-100 translate-y-0 scale-100 filter-none' : 'opacity-0 translate-y-8 scale-95 blur-xl'}`}
            >
              <h2 className="serif text-white text-3xl md:text-5xl mb-6 leading-tight tracking-wide font-light drop-shadow-2xl">
                {storyline[key].sentence}
              </h2>
              <div className="flex items-center space-x-6 mb-8">
                {storyline[key].feeling.split(',').map((f: string, i: number) => (
                  <span key={i} className="text-[10px] uppercase tracking-[0.5em] text-yellow-500 font-bold px-3 py-1 border border-yellow-500/20 rounded-full">
                    {f.trim()}
                  </span>
                ))}
              </div>
              <p className="text-yellow-100/60 italic font-light text-lg md:text-xl max-w-sm mx-auto leading-relaxed border-t border-white/5 pt-6">
                {storyline[key].reflection}
              </p>
            </div>
          ))}
        </div>
      </div>

      <footer className="p-8 md:p-12 z-20 w-full max-w-5xl mx-auto">
        <div className="flex justify-between mb-8 px-2 overflow-x-auto no-scrollbar space-x-4">
          {PHASES.map((key, index) => (
            <button 
              key={key}
              onClick={() => { setProgress(index / (PHASES.length - 1)); setIsPlaying(false); }}
              className={`text-[9px] uppercase tracking-[0.5em] transition-all duration-700 whitespace-nowrap ${index === currentPhaseIndex ? 'text-white font-bold' : 'text-white/20'}`}
            >
              {PHASE_LABELS[key]}
            </button>
          ))}
        </div>
        <div className="relative h-[1px] w-full bg-white/10 group">
          <input 
            type="range" min="0" max="1" step="0.0001" value={progress} 
            onInput={(e) => { setProgress(parseFloat((e.target as HTMLInputElement).value)); setIsPlaying(false); }}
            className="absolute -top-5 w-full h-10 opacity-0 cursor-pointer z-50"
          />
          <div className="absolute h-full bg-yellow-500 transition-all duration-300 shadow-[0_0_10px_#f59e0b]" style={{ width: `${progress * 100}%` }} />
          <div className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none shadow-[0_0_15px_#fff]" style={{ left: `${progress * 100}%` }} />
        </div>
        <div className="mt-8 flex justify-between items-center opacity-20 text-[7px] uppercase tracking-[1em]">
          <span>Witness the alignment</span>
          <span>Infinity Loop</span>
        </div>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) { ReactDOM.createRoot(rootElement).render(<App />); }
