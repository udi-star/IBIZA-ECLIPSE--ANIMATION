
import React from 'react';
import { PhaseData } from '../types';

interface PhaseContentProps {
  data: PhaseData;
  active: boolean;
}

const PhaseContent: React.FC<PhaseContentProps> = ({ data, active }) => {
  return (
    <div className={`transition-all duration-1000 transform ${active ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="max-w-xl mx-auto text-center px-6">
        <h2 className="serif text-3xl md:text-4xl lg:text-5xl mb-6 leading-tight tracking-wide font-light">
          {data.sentence}
        </h2>
        
        <div className="flex justify-center space-x-4 mb-8">
          {data.feeling.split(',').map((f, i) => (
            <span key={i} className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-medium">
              {f.trim()}
            </span>
          ))}
        </div>
        
        <p className="text-zinc-400 italic font-light text-lg md:text-xl max-w-sm mx-auto">
          {data.reflection}
        </p>
      </div>
    </div>
  );
};

export default PhaseContent;
