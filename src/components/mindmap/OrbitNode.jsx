import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import * as Icons from 'lucide-react';

const OrbitNode = ({ data }) => {
  const IconComponent = Icons[data.icon || 'Compass'] || Icons.Compass;
  const themeColor = data.color || '#126BEE';

  const handleClick = (e) => {
    e.stopPropagation();
    if (data.onNodeClick) {
      data.onNodeClick(data);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        borderColor: themeColor,
        boxShadow: `0 8px 30px rgba(0,0,0,0.06), 0 0 25px ${themeColor}25`,
      }}
      className="w-40 h-40 rounded-full bg-white border-[3px] flex flex-col items-center justify-center p-3 text-center shadow-md hover:scale-108 transition-all duration-300 cursor-pointer select-none relative group z-10"
    >
      {/* Target and Source connection handles on all 4 boundaries */}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-white !border-2" style={{ borderColor: themeColor }} />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-white !border-2" style={{ borderColor: themeColor }} />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-white !border-2" style={{ borderColor: themeColor }} />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-white !border-2" style={{ borderColor: themeColor }} />
      <Handle type="source" position={Position.Top} id="source-top" className="!w-2 !h-2 !bg-white !border-2" style={{ borderColor: themeColor }} />
      <Handle type="target" position={Position.Bottom} id="target-bottom" className="!w-2 !h-2 !bg-white !border-2" style={{ borderColor: themeColor }} />
      <Handle type="source" position={Position.Left} id="source-left" className="!w-2 !h-2 !bg-white !border-2" style={{ borderColor: themeColor }} />
      <Handle type="target" position={Position.Right} id="target-right" className="!w-2 !h-2 !bg-white !border-2" style={{ borderColor: themeColor }} />

      {/* Optional Top Rim Numbered Badge (for Screen 3 16 lesson starburst nodes) */}
      {(data.badgeNumber || data.numberBadge) && (
        <div
          style={{ backgroundColor: themeColor }}
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-white group-hover:scale-110 transition-transform"
        >
          {data.badgeNumber || data.numberBadge}
        </div>
      )}

      {/* Centered Colored Icon */}
      <div
        style={{ color: themeColor }}
        className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5 shrink-0 group-hover:scale-115 transition-transform duration-300"
      >
        <IconComponent className="w-8 h-8 stroke-[2.2]" />
      </div>

      {/* Uppercase colored typography matching screenshot language */}
      <div
        style={{ color: themeColor }}
        className="font-black text-xs md:text-sm tracking-tight leading-tight uppercase px-1 line-clamp-3 font-sans drop-shadow-[0_1px_1px_rgba(0,0,0,0.02)]"
      >
        {data.label}
      </div>
    </div>
  );
};

export default memo(OrbitNode);
