import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

const SubtopicNode = ({ data }) => {
  const themeColor = data.color || '#126BEE';
  const alignRight = data.alignRight; // Determines if line attaches on left or right

  const handleClick = (e) => {
    e.stopPropagation();
    if (data.onNodeClick) {
      data.onNodeClick(data);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm hover:border-primaryBlue hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer select-none group z-10 min-w-[140px] max-w-[240px]"
    >
      {/* Target handle connecting from parent Category Orbit */}
      <Handle
        type="target"
        position={alignRight ? Position.Left : Position.Right}
        className="!w-2 !h-2 !rounded-full !border !border-white"
        style={{ backgroundColor: themeColor }}
      />
      <Handle
        type="source"
        position={alignRight ? Position.Right : Position.Left}
        className="!w-2 !h-2 !rounded-full !border !border-white opacity-0"
        style={{ backgroundColor: themeColor }}
      />

      <span
        style={{ backgroundColor: themeColor }}
        className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform"
      />
      <span className="text-xs font-bold text-slate-700 group-hover:text-primaryBlue truncate transition-colors">
        {data.label}
      </span>
    </div>
  );
};

export default memo(SubtopicNode);
