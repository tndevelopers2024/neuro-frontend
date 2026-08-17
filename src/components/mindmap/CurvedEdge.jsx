import React from 'react';
import { BaseEdge } from '@xyflow/react';

export default function CurvedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}) {
  // Calculate midpoint
  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;
  
  // Calculate vector from source to target
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  // Create a slight perpendicular offset to form a subtle curve
  // 10% of the total length creates a gentle arc
  const offset = length * 0.10; 
  
  // Perpendicular normalized vector
  const perpX = -dy / length;
  const perpY = dx / length;
  
  // Control point
  const cpX = midX + perpX * offset;
  const cpY = midY + perpY * offset;
  
  // SVG Quadratic bezier path
  const edgePath = `M ${sourceX} ${sourceY} Q ${cpX} ${cpY} ${targetX} ${targetY}`;
  
  return (
    <BaseEdge path={edgePath} style={style} markerEnd={markerEnd} id={id} />
  );
}
