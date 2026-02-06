
import React, { useState, useEffect, useCallback } from 'react';
import { fetchEclipseStoryline } from './services/gemini';
import { EclipseStoryline, PHASES, PhaseKey, PHASE_LABELS } from './types';
import EclipseVisual from './components/EclipseVisual';
import PhaseContent from './components/PhaseContent';

const App: React.FC = () => {
  const [storyline, setStoryline] = useState<EclipseStoryline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // 0 to 1
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEclipseStoryline();
      setStoryline(data);
    } catch (err) {
      setError('The light is still obscured. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync progress with currentPhaseIndex for categorical jumps, or handle free-flowing slider
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    
    // Divide [0, 1] into 4 segments
    const index = Math.min(Math.floor(val * PHASES.length), PHASES.length - 1);
    if (index !== currentPhaseIndex) {
      setCurrentPhaseIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500 tracking-[0.3em] uppercase text-xs">Awaiting the alignment</p>
        </div>
      </div>
    );
  }

  if (error || !storyline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
        <div className="text-center max-w-md">
          <p className="text-zinc-400 mb-6">{error || 'An unexpected darkness has occurred.'}</p>
          <button 
            onClick={loadContent}
            className="px-6 py-2 border border-zinc-700 text-zinc-300 uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentPhaseKey = PHASES[currentPhaseIndex];
  const activeData = storyline[currentPhaseKey];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] selection:bg-white selection:text-black">
      {/* Header */}
      <header className="fixed top-0 w-full p-8 flex justify-between items-center z-50">
        <div className="flex flex-col">
          <h1 className="serif text-xl tracking-widest uppercase font-light">Ibiza</h1>
          <span className="text-[10px] tracking-[0.4em] text-zinc-500 uppercase">Total Solar Glasses</span>
        </div>
        <div className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
          Souvenir of Totality
        </div>
      </header>

      {/* Main Experience */}
      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden pt-20 pb-40">
        <div className="mb-12">
          <EclipseVisual progress={progress} />
        </div>

        <div className="relative min-h-[300px] w-full flex items-center justify-center">
          {PHASES.map((key, index) => (
            <div 
              key={key} 
              className={`absolute w-full flex justify-center transition-all duration-700 pointer-events-none ${index === currentPhaseIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <PhaseContent data={storyline[key]} active={index === currentPhaseIndex} />
            </div>
          ))}
        </div>
      </main>

      {/* Footer / Slider Controls */}
      <footer className="fixed bottom-0 w-full p-8 md:p-12 z-50">
        <div className="max-w-4xl mx-auto">
          {/* Phase Labels */}
          <div className="flex justify-between mb-4 px-1">
            {PHASES.map((key, index) => (
              <button 
                key={key}
                onClick={() => {
                    const targetProgress = index / (PHASES.length - 1);
                    setProgress(targetProgress);
                    setCurrentPhaseIndex(index);
                }}
                className={`text-[10px] uppercase tracking-[0.25em] transition-colors duration-500 ${index === currentPhaseIndex ? 'text-white' : 'text-zinc-600'}`}
              >
                {PHASE_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Range Slider */}
          <div className="relative h-1 w-full bg-zinc-900 rounded-full group">
            <input 
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={progress}
              onChange={handleSliderChange}
              className="absolute top-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Custom Track Fill */}
            <div 
              className="absolute h-full bg-white transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress * 100}%` }}
            />
            {/* Custom Thumb Simulation */}
            <div 
              className="absolute w-3 h-3 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-200 group-hover:scale-125 shadow-[0_0_10px_rgba(255,255,255,0.5)]"
              style={{ left: `${progress * 100}%` }}
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-[9px] uppercase tracking-[0.5em] text-zinc-700">
              Drag to witness the shift
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
