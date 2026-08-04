import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import * as Icons from 'lucide-react';

const CenterNode = ({ data }) => {
  const IconComponent = Icons[data.icon || 'Brain'] || Icons.Brain;
  const themeColor = data.color || '#126BEE';
  const isPsychiatry = data.label?.toUpperCase() === 'PSYCHIATRY' || data.label?.toUpperCase() === 'PSYCHIATRY KNOWLEDGE MAP';

  return (
    <div className="w-60 h-60 md:w-64 md:h-64 rounded-full bg-white shadow-[0_10px_45px_rgba(18,107,238,0.15)] border-2 border-dashed border-slate-300 flex items-center justify-center p-3 relative z-20 select-none cursor-default group hover:scale-102 transition-transform duration-300">
      {/* Invisible connection handles on all four cardinal points */}
      <Handle type="target" position={Position.Top} className="!w-1 !h-1 !bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} className="!w-1 !h-1 !bg-transparent !border-0" />
      <Handle type="source" position={Position.Left} className="!w-1 !h-1 !bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!w-1 !h-1 !bg-transparent !border-0" />
      <Handle type="target" position={Position.Bottom} id="target-bottom" className="!w-1 !h-1 !bg-transparent !border-0" />
      <Handle type="target" position={Position.Left} id="target-left" className="!w-1 !h-1 !bg-transparent !border-0" />
      <Handle type="target" position={Position.Right} id="target-right" className="!w-1 !h-1 !bg-transparent !border-0" />
      <Handle type="source" position={Position.Top} id="source-top" className="!w-1 !h-1 !bg-transparent !border-0" />

      {/* Decorative colored satellite dots around the rim */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primaryBlue" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-medicalGreen" />
      <div className="absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-medicalPink" />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-medicalOrange" />
      <div className="absolute top-8 left-11 w-2 h-2 rounded-full bg-cyan" />
      <div className="absolute top-8 right-11 w-2 h-2 rounded-full bg-medicalPurple" />
      <div className="absolute bottom-8 left-11 w-2 h-2 rounded-full bg-yellow-500" />
      <div className="absolute bottom-8 right-11 w-2 h-2 rounded-full bg-indigo-500" />

      {/* Inner white circular core with clean typography */}
      <div className="w-full h-full rounded-full bg-gradient-to-b from-white to-[#F8FAFF] border border-slate-100 shadow-inner flex flex-col items-center justify-center p-4 text-center">
        {isPsychiatry ? (
          <div className="w-14 h-14 rounded-2xl bg-[#E9F2FF] border border-blue-100 flex items-center justify-center mb-2 shadow-sm">
            <span className="font-serif text-3xl font-black text-primaryBlue leading-none">Ψ</span>
          </div>
        ) : (
          <div 
            style={{ backgroundColor: `${themeColor}15`, color: themeColor, borderColor: `${themeColor}30` }}
            className="w-14 h-14 rounded-2xl border flex items-center justify-center mb-2 shadow-sm"
          >
            <IconComponent className="w-8 h-8 animate-pulse" />
          </div>
        )}

        <div className="font-black text-lg md:text-xl text-navy uppercase tracking-tight line-clamp-1">
          {data.label || 'PSYCHIATRY'}
        </div>
        
        <div className="font-extrabold text-[11px] uppercase tracking-wider mt-1 text-primaryBlue">
          {data.subLabel || 'KNOWLEDGE MAP'}
        </div>

        <div className="text-[10px] font-semibold text-slate-400 italic mt-1.5 leading-tight">
          {data.slogan || 'Explore. Connect. Understand.'}
        </div>
      </div>
    </div>
  );
};

export default memo(CenterNode);
