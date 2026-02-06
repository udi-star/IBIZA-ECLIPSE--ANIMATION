import React, { useState, useEffect, useMemo, useRef } from 'https://esm.sh/react@19.0.0';
import { createRoot } from 'https://esm.sh/react-dom@19.0.0/client';
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@1.40.0";

// --- Configuration ---
const PHASES = ['before', 'first_contact', 'during_peak', 'totality', 'return_of_light', 'afterglow'] as const;
type Phase = typeof PHASES[number];

const PHASE_LABELS: Record<Phase, string> = {
  before: 'Anticipation',
  first_contact: 'The Contact',
  during_peak: 'Silver Light',
  totality: 'Totality',
  return_of_light: 'Renewal',
  afterglow: 'Resonance'
};

const DEFAULT_STORY: Record<Phase, { sentence: string, feeling: string, reflection: string }> = {
  before: { sentence: "Ibiza pulses with a warm, expectant glow.", feeling: "Quiet, Solar", reflection: "What intentions are you carrying into the shadow?" },
  first_contact: { sentence: "A cosmic bite begins the silent transformation.", feeling: "Shift, Breath", reflection: "Can you feel the air cooling on your skin?" },
  during_peak: { sentence: "Surreal silver light washes over the Mediterranean.", feeling: "Ethereal, Gold", reflection: "Who is sharing this half-lit world with you?" },
  totality: { sentence: "The universe holds its breath in a ring of fire.", feeling: "Infinite, Absolute", reflection: "When the sun vanishes, what truth remains?" },
  return_of_light: { sentence: "A diamond spark heralds the second dawn.", feeling: "Birth, Clarity", reflection: "What will you build with this restored light?" },
  afterglow: { sentence: "The shadow leaves a golden mark upon the soul.", feeling: "Presence, Awake", reflection: "How will you speak of this to the future?" }
};

// --- Sub-Components ---

const EclipseVisual = ({ progress }: { progress: number }) => {
  // Moon movement: -115% to +115% for a full crossing
  const moonOffset = (0.5 - progress) * 120;
  const isTotality = progress > 0.499 && progress < 0.501;
  const isNear = progress > 0.35 && progress < 0.65;
  
  return (
    <div className="relative w-80 h-80 md:w-[460px] md:h-[460px] flex items-center justify-center pointer-events-none">
      {/* The Corona (Atmospheric Ring) */}
      <div 
        className="absolute w-full h-full rounded-full transition-all duration-[2500ms] cubic-bezier(0.2, 0.8, 0.2, 1)"
        style={{ 
          background: isNear ? 'radial-gradient(circle, #fff 0%, #FFD700 30%, transparent 70%)' : 'transparent',
          filter: `blur(${isTotality ? '90px' : '30px'})`,
          opacity: isNear ? (isTotality ? 1 : 0.4) : 0,
          transform: `scale(${isTotality ? 2.8 : 0.85})`
        }}
      />
      
      {/* The Sun (Base) */}
      <div className={`absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-white transition-all duration-[2000ms] cubic-bezier(0.2, 0.8, 0.2, 1) ${isTotality ? 'totality-glow shadow-[0_0_120px_#fff]' : 'shadow-[0_0_50px_rgba(255,255,255,0.25)]'}`} />
      
      {/* The Moon (Shadow) */}
      <div 
        className="absolute w-48 h-48 md:w-64 md:h-64 rounded-full bg-black border border-white/5 transition-transform duration-[400ms] ease-out" 
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
  const lastTimeRef = useRef<number>(performance.now());
  
  // Memoized stars for background immersion
  const stars = useMemo(() => Array.from({ length: 140 }).map(() => ({
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: `${Math.random() * 1.4 + 0.4}px`,
    delay: `${Math.random() * 12}s`,
    duration: `${6 + Math.random() * 8}s`
  })), []);

  const currentIdx = Math.min(Math.floor(progress * PHASES.length), PHASES.length - 1);
  const currentPhase = PHASES[currentIdx];
  const activeData = story[currentPhase] || DEFAULT_STORY[currentPhase];

  // Fluid Animation Loop
  useEffect(() => {
    let frame: number;
    const loop = (t: number) => {
      const dt = t - lastTimeRef.current;
      lastTimeRef.current = t;

      if (playing) {
        const proximity = Math.abs(0.5 - progress);
        // Time slows down for the Totality moment
        const speedMultiplier = proximity < 0.02 ? 0.22 : (proximity < 0.12 ? 0.5 : 1.0);
        const baseSpeed = 0.00003; 
        
        setProgress(p => (p + dt * baseSpeed * speedMultiplier) % 1);
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing, progress]);

  // AI Narrative Fetching
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
          contents: "Ibiza Total Solar: 6 phases (before, first_contact, during_peak, totality, return_of_light, afterglow).",
          config: {
            systemInstruction: "Luxury cosmic experience designer. Create poetic sentences, feeling keywords, and deep reflection questions. Output valid JSON.",
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
        console.warn("AI narrative unavailable. Using default sequence.");
      }
    };
    fetchNarrative();
  }, []);

  return (
    <div className="h-screen w-full flex flex-col justify-between overflow-hidden relative bg-black select-none font-light text-white tracking-wider">
      
      {/* Deep Space Background */}
      <div className="absolute inset-0 z-0 opacity-50">
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

      {/* Brand Header */}
      <header className="p-10 md:p-16 flex justify-between items-start z-10">
        <div className="flex flex-col group cursor-default">
          <h1 className="serif text-5xl tracking-[.45em] uppercase font-light transition-all duration-[1200ms] group-hover:tracking-[.6em]">Ibiza</h1>
          <span className="text-[10px] tracking-[1em] text-yellow-500 font-bold mt-4 uppercase opacity-80">Total Solar</span>
        </div>
        
        <button 
          onClick={() => setPlaying(!playing)} 
          className="w-20 h-20 rounded-full border border-white/5 bg-white/[0.03] backdrop-blur-xl flex items-center justify-center hover:bg-white/[0.1] transition-all duration-1000 group active:scale-95 shadow-2xl"
          aria-label={playing ? "Pause Experience" : "Play Experience"}
        >
          {playing ? (
            <div className="flex gap-2.5">
              <div className="w-1 h-6 bg-white/40 group-hover:bg-white transition-all duration-500" />
              <div className="w-1 h-6 bg-white/40 group-hover:bg-white transition-all duration-500" />
            </div>
          ) : (
            <div className="ml-1.5 w-0 h-0 border-y-[12px] border-y-transparent border-l-[22px] border-l-white/40 group-hover:border-l-white transition-all duration-500" />
          )}
        </button>
      </header>

      {/* Centerpiece Visuals */}
      <main className="flex-1 flex flex-col items-center justify-center z-10 px-10 text-center -mt-10">
        <div className="mb-10 transform scale-90 md:scale-100">
          <EclipseVisual progress={progress} />
        </div>
        
        {/* Dynamic Story Overlay */}
        <div key={currentPhase} className="min-h-[320px] flex flex-col items-center max-w-5xl mx-auto animate-content">
          <h2 className="serif text-4xl md:text-6xl lg:text-8xl mb-14 leading-[1.1] tracking-wide font-light text-white/95">
            {activeData?.sentence}
          </h2>
          
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {(activeData?.feeling || "").split(',').filter(Boolean).map((f: string, i: number) => (
              <span key={i} className="text-[11px] uppercase tracking-[.6em] text-yellow-500/90 px-8 py-3.5 border border-yellow-500/10 rounded-full bg-white/[0.04] backdrop-blur-md transition-all duration-1000 hover:border-yellow-500/40 hover:bg-yellow-500/5 cursor-default shadow-lg">
                {f.trim()}
              </span>
            ))}
          </div>
          
          <p className="text-white/20 italic text-xl md:text-3xl max-w-2xl border-t border-white/5 pt-14 font-light leading-relaxed tracking-widest">
            {activeData?.reflection}
          </p>
        </div>
      </main>

      {/* Interactive Timeline */}
      <footer className="p-10 md:p-24 z-10 w-full max-w-7xl mx-auto">
        <div className="flex justify-between mb-16 overflow-x-auto no-scrollbar gap-14 px-8 items-end">
          {PHASES.map((k, i) => (
            <button 
              key={k} 
              onClick={() => {setProgress(i / (PHASES.length - 1)); setPlaying(false);}} 
              className={`text-[11px] uppercase tracking-[.5em] transition-all duration-[1200ms] cubic-bezier(0.2, 0.8, 0.2, 1) whitespace-nowrap ${i === currentIdx ? 'text-white font-bold scale-125 mb-1' : 'text-white/10 hover:text-white/40 hover:scale-105'}`}
            >
              {PHASE_LABELS[k]}
            </button>
          ))}
        </div>
        
        {/* Precision Tracking Bar */}
        <div className="relative h-[2px] w-full bg-white/[0.06] group transition-all duration-1000 hover:bg-white/[0.12] cursor-pointer">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.000001" 
            value={progress} 
            onInput={e => {setProgress(parseFloat(e.currentTarget.value)); setPlaying(false);}} 
            className="absolute -top-12 left-0 w-full h-24 opacity-0 z-20 cursor-pointer" 
          />
          <div 
            className="absolute h-full bg-yellow-500 transition-all duration-[2000ms] cubic-bezier(0.2, 0.8, 0.2, 1) shadow-[0_0_50px_rgba(245,158,11,0.6)]" 
            style={{ width: `${progress * 100}%` }} 
          />
          <div 
            className="absolute w-8 h-8 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all duration-1000 group-hover:scale-125 group-hover:bg-yellow-500" 
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
