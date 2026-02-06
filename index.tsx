import React, { useState, useEffect, useMemo, useCallback } from 'https://esm.sh/react@19.0.0';
import { createRoot } from 'https://esm.sh/react-dom@19.0.0/client';
import { GoogleGenAI, Type } from "https://esm.sh/@google/genai@1.40.0";

// --- Configuration ---
const PHASES = ['before', 'first_contact', 'during_peak', 'totality', 'return_of_light', 'afterglow'];
const PHASE_LABELS: Record<string, string> = {
  before: 'Anticipation', first_contact: 'Transformation', during_peak: 'Ascension', 
  totality: 'Totality', return_of_light: 'Renewal', afterglow: 'Presence'
};

const DEFAULT_STORY: any = {
  before: { sentence: "Ibiza pulses with a warm, expectant glow.", feeling: "Quiet, Solar", reflection: "What intentions are you carrying into the shadow?" },
  first_contact: { sentence: "A cosmic bite begins the silent transformation.", feeling: "Shift, Breath", reflection: "Can you feel the air cooling on your skin?" },
  during_peak: { sentence: "Surreal silver light washes over the Mediterranean.", feeling: "Ethereal, Gold", reflection: "Who is sharing this half-lit world with you?" },
  totality: { sentence: "The universe holds its breath in a ring of fire.", feeling: "Infinite, Absolute", reflection: "When the sun vanishes, what truth remains?" },
  return_of_light: { sentence: "A diamond spark heralds the second dawn.", feeling: "Birth, Clarity", reflection: "What will you build with this restored light?" },
  afterglow: { sentence: "The shadow leaves a golden mark upon the soul.", feeling: "Presence, Awake", reflection: "How will you speak of this to the future?" }
};

// --- Sub-Component: Visual ---
const EclipseVisual = ({ progress }: { progress: number }) => {
  const moonOffset = (0.5 - progress) * 115;
  const isTotality = progress > 0.497 && progress < 0.503;
  const isNear = progress > 0.44 && progress < 0.56;
  
  return (
    <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center pointer-events-none">
      <div 
        className="absolute w-64 h-64 md:w-80 md:h-80 rounded-full transition-all duration-1000"
        style={{ 
          background: isNear ? 'radial-gradient(circle, #fff 0%, #FFD700 40%, transparent 75%)' : 'transparent',
          filter: `blur(${isTotality ? '60px' : '20px'})`,
          opacity: isNear ? 1 : 0.05,
          transform: `scale(${isTotality ? 2.5 : 1})`
        }}
      />
      <div className={`absolute w-40 h-40 md:w-56 md:h-56 rounded-full bg-white transition-all duration-1000 ${isTotality ? 'totality-glow shadow-[0_0_80px_#fff]' : 'shadow-[0_0_40px_rgba(255,255,255,0.2)]'}`} />
      <div className="absolute w-40 h-40 md:w-56 md:h-56 rounded-full bg-black border border-white/5" style={{ transform: `translateX(${moonOffset}%)` }} />
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [story, setStory] = useState(DEFAULT_STORY);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);
  
  const stars = useMemo(() => Array.from({ length: 60 }).map(() => ({
    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, size: `${Math.random() * 2}px`, delay: `${Math.random() * 5}s`
  })), []);

  const currentIdx = Math.min(Math.floor(progress * PHASES.length), PHASES.length - 1);
  const currentKey = PHASES[currentIdx];
  const activeData = story[currentKey] || DEFAULT_STORY[currentKey];

  useEffect(() => {
    let frame: number;
    let last = performance.now();
    const loop = (t: number) => {
      if (playing) {
        const dt = t - last;
        const speed = Math.abs(0.5 - progress) < 0.05 ? 0.00002 : 0.00004;
        setProgress(p => (p + dt * speed) % 1);
      }
      last = t;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [playing, progress]);

  useEffect(() => {
    const fetchNarrative = async () => {
      const key = (window as any).process?.env?.API_KEY;
      if (!key) return;
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: 'Generate 6 poetic phases for Ibiza Total Solar. JSON format.',
          config: {
            systemInstruction: 'Luxury experience designer. Minimal, poetic. 6 phases: before, first_contact, during_peak, totality, return_of_light, afterglow.',
            responseMimeType: "application/json"
          }
        });
        if (res.text) {
          const parsed = JSON.parse(res.text);
          setStory(parsed);
        }
      } catch (e) { console.warn("AI narrative fetch failed, using poetic defaults."); }
    };
    fetchNarrative();
  }, []);

  return (
    <div className="h-screen w-full flex flex-col justify-between overflow-hidden relative bg-black select-none">
      <div className="absolute inset-0 z-0">
        {stars.map((s, i) => <div key={i} className="star animate-pulse" style={{ ...s, width: s.size, height: s.size, animationDelay: s.delay }} />)}
      </div>

      <header className="p-10 flex justify-between items-center z-10">
        <div className="flex flex-col"><h1 className="serif text-2xl tracking-[.4em] uppercase">Ibiza</h1><span className="text-[9px] tracking-[.8em] text-yellow-500 font-bold">TOTAL SOLAR</span></div>
        <button onClick={() => setPlaying(!playing)} className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all">
          {playing ? <div className="flex gap-1"><div className="w-1 h-3 bg-white" /><div className="w-1 h-3 bg-white" /></div> : <div className="ml-1 w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white" />}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center z-10 px-8 text-center">
        <EclipseVisual progress={progress} />
        <div className="mt-12 min-h-[220px] flex flex-col items-center max-w-2xl mx-auto">
          <h2 className="serif text-3xl md:text-5xl mb-6 transition-all duration-700">{activeData?.sentence}</h2>
          <div className="flex gap-4 mb-8 overflow-x-auto no-scrollbar">
            {(activeData?.feeling || "").split(',').map((f: string, i: number) => (
              <span key={i} className="text-[10px] uppercase tracking-[.4em] text-yellow-500/80 px-3 py-1 border border-yellow-500/20 rounded-full whitespace-nowrap">
                {f.trim()}
              </span>
            ))}
          </div>
          <p className="text-white/40 italic text-lg max-w-sm border-t border-white/5 pt-6">{activeData?.reflection}</p>
        </div>
      </main>

      <footer className="p-10 md:p-16 z-10 w-full max-w-4xl mx-auto">
        <div className="flex justify-between mb-8 overflow-x-auto no-scrollbar gap-4">
          {PHASES.map((k, i) => (
            <button key={k} onClick={() => {setProgress(i / (PHASES.length - 1)); setPlaying(false);}} className={`text-[10px] uppercase tracking-[.3em] transition-all whitespace-nowrap ${i === currentIdx ? 'text-white font-bold' : 'text-white/30 hover:text-white/60'}`}>
              {PHASE_LABELS[k]}
            </button>
          ))}
        </div>
        <div className="relative h-[1px] w-full bg-white/20">
          <input type="range" min="0" max="1" step="0.0001" value={progress} onInput={e => {setProgress(parseFloat(e.currentTarget.value)); setPlaying(false);}} className="absolute -top-5 left-0 w-full h-10 opacity-0 z-20" />
          <div className="absolute h-full bg-yellow-500" style={{ width: `${progress * 100}%` }} />
          <div className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ left: `${progress * 100}%` }} />
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);