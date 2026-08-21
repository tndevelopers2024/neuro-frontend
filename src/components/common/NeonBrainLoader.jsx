import React from 'react';
import { Brain, Plus } from 'lucide-react';

const NeonBrainLoader = ({ text = "Loading...", fullScreen = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      {/* Glowing Brain Container */}
      <div className="relative flex justify-center items-center w-32 h-32">
        {/* Outer glow rings */}
        <div className="absolute inset-0 rounded-full border-[3px] border-[#126BEE] opacity-20 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute -inset-4 rounded-full border-[1px] border-[#13A7B5] opacity-30 animate-pulse"></div>
        
        {/* The glowing brain SVG */}
        <div className="relative z-10 filter drop-shadow-[0_0_20px_rgba(18,107,238,1)] text-[#126BEE] animate-pulse" style={{ animationDuration: '3s' }}>
          <Brain className="w-24 h-24" strokeWidth={1.2} />
          {/* Medical cross in the center, glowing white */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Plus className="w-8 h-8 text-white filter drop-shadow-[0_0_15px_rgba(255,255,255,1)]" strokeWidth={4} />
          </div>
        </div>
      </div>

      {/* Glowing Text */}
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-lg md:text-xl font-black tracking-[0.25em] text-[#13A7B5] uppercase filter drop-shadow-[0_0_10px_rgba(19,167,181,0.8)]">
          Neuro Mind Scholars
        </h2>
        <p className="text-xs text-blue-200/70 tracking-[0.2em] font-bold uppercase animate-pulse">
          {text}
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070B14]/95 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#070B14] rounded-2xl shadow-elevated">
      {content}
    </div>
  );
};

export default NeonBrainLoader;
