import React, { useState, useEffect, useMemo } from 'https://esm.sh/react@19.0.0';
import { createRoot } from 'https://esm.sh/react-dom@19.0.0/client';
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@1.40.0";

// --- Configuration & Defaults ---
const PHASES = ['before', 'first_contact', 'during_peak', 'totality', 'return_of_light', 'afterglow'] as const;
type Phase = typeof PHASES[number];

const PHASE_LABELS: Record<Phase, string> = {
  before: 'Anticipation',
  first_contact: 'Transformation',
  during_peak: 'Ascension',
  totality: 'Totality',
  return_of_light: 'Renewal',
  afterglow: 'Presence'
};

const DEFAULT_STORY: Record<Phase, { sentence: string, feeling: string, reflection: string }> = {
  before: { sentence: "Ibiza pulses with a warm, expectant glow.", feeling: "Quiet, Solar", reflection: "What intentions are you carrying into the shadow?" },
  first_contact: { sentence: "A cosmic bite begins the silent transformation.", feeling: "Shift, Breath", reflection: "Can you feel the air cooling on your skin?" },
  during_peak: { sentence: "Surreal silver light washes over the Mediterranean.", feeling: "Ethereal, Gold", reflection: "Who is sharing this half-lit world with you?" },
  totality: { sentence: "The universe holds its breath in a ring of fire.", feeling: "Infinite, Absolute", reflection: "When the sun vanishes, what truth remains?" },
  return_of_light: { sentence: "A diamond spark heralds the second dawn.", feeling: "Birth, Clarity", reflection: "What will you build with this restored light?" },
  afterglow: { sentence: "The shadow leaves a golden mark upon the soul.", feeling: "Presence, Awake", reflection: "How will you speak of this to the future?" }
};

// --- Visual Component ---
const EclipseVisual = ({ progress }: { progress: number }) => {
  const moonOffset = (0.5 - progress) * 115;
  const isTotality = progress > 0.498 && progress < 0.502;
  const isNear = progress > 0.40 && progress < 0.60;
  
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center pointer-events-none transition-transform duration-[2000ms] cubic-bezier(0.2, 0.8, 0.2, 1)">
      {/* Corona / Atmosphere Glow */}
      <div 
        className="absolute w-full h-full rounded-full transition-all duration-[1500ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
        style={{ 
          background: isNear ? 'radial-gradient(circle, #fff 0%, #FFD700 35%, transparent 75%)' : 'transparent',
          filter: `blur(${isTotality ? '60px' : '20px'})`,
          opacity: isNear ? 1 : 0.05,
          transform: `scale(${isTotality ? 2.4 : 1})`
        }}
      />
      
      {/* The Sun Base */}
      <div className={`absolute w-44 h-44 md:w-56 md:h-56 rounded-full bg-white transition-all duration-[1800ms] cubic-bezier(0.2, 0.8, 0.2, 1) ${isTotality ? 'totality-glow shadow-[0_0_80px_#fff]' : 'shadow-[0_0_40px_rgba(255,255,255,0.25)]'}`} />
      
      {/* The Moon shadow */}
      <div 
        className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full bg-black border border-white/10 transition-transform duration-500 cubic-bezier(0.2, 0.8, 0.2, 1)" 
        style={{ transform: `translateX(${moonOffset}%)` }} 
      />
    </div>
  );
};

// --- Main Application ---
const App = () => {
  const [story, setStory] = useState(DEFAULT_STORY);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  
  const stars = useMemo(() => Array.from({ length: 120 }).map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 1.8 + 0.5}px`,
    delay: `${Math.random() * 8}s`,
    duration: `${4 + Math.random() * 6}s`
  })), []);

  const currentIdx = Math.min(Math.floor(progress * PHASES.length), PHASES.length - 1);
  const currentPhase = PHASES[currentIdx];
  const activeData = story[currentPhase] || DEFAULT_STORY[currentPhase];

  // Animation Loop with high-precision time tracking
  useEffect(() => {
    let frame: number;
    let last = performance.now();
    const loop = (t: number) => {
      if (playing) {
        const dt = t - last;
        const proximity = Math.abs(0.5 - progress);
        // Extremely smooth deceleration for the "Totality" moment
        const speedMultiplier = proximity < 0.03 ? 0.3 : (proximity < 0.12 ? 0.55 : 1.0);
        const speed = 0.00003 * speedMultiplier; 
        
        setProgress(p => (p + dt * speed) % 1);
      }
      last = t;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing, progress]);

  // AI Narrative Fetch
  useEffect(() => {
    const fetchNarrative = async () => {
      const apiKey = (window as any).process?.env?.API_KEY;
      if (!apiKey) return;

      try {
        const ai = new GoogleGenAI({ apiKey });
        const phaseSchema = {
          type: Type.OBJECT,
          properties: {
            sentence: { type: Type.STRING },
            feeling: { type: Type.STRING },
            reflection: { type: Type.STRING }
          },
          required: ["sentence", "feeling", "reflection"]
        };

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Ibiza Total Solar Experience: 6 phases (before, first_contact, during_peak, totality, return_of_light, afterglow).",
          config: {
            systemInstruction: "Luxury experience designer. Minimalist. Poetic. Format: JSON mapping keys to sentence, feelings (comma separated), reflection.",
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                before: phaseSchema,
                first_contact: phaseSchema,
                during_peak: phaseSchema,
                totality: phaseSchema,
                return_of_light: phaseSchema,
                afterglow: phaseSchema
              },
              required: PHASES as any
            }
          }
        });

        if (response.text) {
          setStory(JSON.parse(response.text));
        }
      } catch (e) {
        console.warn("AI context offline. Using pre-cached poetic narrative.");
      }
    };
    fetchNarrative();
  }, []);

  return (
    <div className="h-screen w-full flex flex-col justify-between overflow-hidden relative bg-black select-none font-light">
      {/* Dynamic Cosmic Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        {stars.map((s, i) => (
          <div 
            key={i} 
            className="star animate-pulse" 
            style={{ 
              top: s.top, 
              left: s.left, 
              width: s.size, 
              height: s.size, 
              animationDelay: s.delay,
              animationDuration: s.duration
            }} 
          />
        ))}
      </div>

      {/* Luxury Header */}
      <header className="p-8 md:p-14 flex justify-between items-start z-10">
        <div className="flex flex-col group cursor-default">
          <h1 className="serif text-4xl tracking-[.5em] uppercase font-light transition-all duration-[1200ms] group-hover:tracking-[.7em] group-hover:opacity-80">Ibiza</h1>
          <span className="text-[10px] tracking-[.85em] text-yellow-500 font-bold mt-3 opacity-80 uppercase">Total Solar</span>
        </div>
        <button 
          onClick={() => setPlaying(!playing)} 
          className="w-16 h-16 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all duration-700 group active:scale-95"
          aria-label={playing ? "Pause Journey" : "Begin Journey"}
        >
          {playing ? (
            <div className="flex gap-2">
              <div className="w-1 h-5 bg-white/60 group-hover:bg-white transition-all duration-500" />
              <div className="w-1 h-5 bg-white/60 group-hover:bg-white transition-all duration-500" />
            </div>
          ) : (
            <div className="ml-1 w-0 h-0 border-y-[10px] border-y-transparent border-l-[16px] border-l-white/60 group-hover:border-l-white transition-all duration-500" />
          )}
        </button>
      </header>

      {/* Central Visual & Content */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 px-8 text-center">
        <div className="mb-10">
          <EclipseVisual progress={progress} />
        </div>
        
        {/* Transitioning Content Container */}
        <div key={currentPhase} className="min-h-[280px] flex flex-col items-center max-w-4xl mx-auto animate-content">
          <h2 className="serif text-4xl md:text-6xl lg:text-7xl mb-12 leading-[1.2] tracking-wide font-light text-white/95">
            {activeData?.sentence}
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4 mb-14">
            {(activeData?.feeling || "").split(',').filter(Boolean).map((f: string, i: number) => (
              <span key={i} className="text-[11px] uppercase tracking-[.45em] text-yellow-500/90 px-7 py-3 border border-yellow-500/10 rounded-full bg-white/5 backdrop-blur-sm whitespace-nowrap shadow-xl transition-all duration-1000 hover:border-yellow-500/40 hover:bg-yellow-500/5">
                {f.trim()}
              </span>
            ))}
          </div>
          
          <p className="text-white/20 italic text-xl md:text-2xl max-w-lg border-t border-white/5 pt-12 font-light leading-relaxed">
            {activeData?.reflection}
          </p>
        </div>
      </main>

      {/* Immersive Control Surface */}
      <footer className="p-8 md:p-20 z-10 w-full max-w-6xl mx-auto">
        <div className="flex justify-between mb-14 overflow-x-auto no-scrollbar gap-10 px-4">
          {PHASES.map((k, i) => (
            <button 
              key={k} 
              onClick={() => {setProgress(i / (PHASES.length - 1)); setPlaying(false);}} 
              className={`text-[11px] uppercase tracking-[.4em] transition-all duration-[1000ms] cubic-bezier(0.2, 0.8, 0.2, 1) whitespace-nowrap ${i === currentIdx ? 'text-white font-bold scale-110' : 'text-white/10 hover:text-white/40 hover:scale-105'}`}
            >
              {PHASE_LABELS[k]}
            </button>
          ))}
        </div>
        
        {/* High-Precision Interactive Timeline */}
        <div className="relative h-[2px] w-full bg-white/5 group cursor-pointer transition-all duration-700 hover:bg-white/10">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.000001" 
            value={progress} 
            onInput={e => {setProgress(parseFloat(e.currentTarget.value)); setPlaying(false);}} 
            className="absolute -top-10 left-0 w-full h-20 opacity-0 z-20 cursor-pointer" 
          />
          <div 
            className="absolute h-full bg-yellow-500 transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1) shadow-[0_0_35px_rgba(245,158,11,0.6)]" 
            style={{ width: `${progress * 100}%` }} 
          />
          <div 
            className="absolute w-6 h-6 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-[0_0_30px_#fff] transition-all duration-700 group-hover:scale-125" 
            style={{ left: `${progress * 100}%` }} 
          />
        </div>
      </footer>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
