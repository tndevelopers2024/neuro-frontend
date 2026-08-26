import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XCircle, CheckCircle2 } from 'lucide-react';

const MatrixMatchInteractive = ({ currentQ, selectedAnswers, currentIdx, isSubmitted, onMatrixSelect }) => {
  const containerRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [activeLine, setActiveLine] = useState(null);
  const [leftNodePositions, setLeftNodePositions] = useState({});
  const [rightNodePositions, setRightNodePositions] = useState({});

  const matches = selectedAnswers[currentIdx] || {};

  // Re-calculate node positions on mount and window resize
  const updatePositions = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const leftPositions = {};
    const rightPositions = {};

    currentQ.matrixLeft?.forEach(left => {
      const el = document.getElementById(`node-left-${left.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        leftPositions[left.id] = {
          x: rect.right - containerRect.left,
          y: rect.top - containerRect.top + rect.height / 2
        };
      }
    });

    currentQ.matrixRight?.forEach(right => {
      const el = document.getElementById(`node-right-${right.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        rightPositions[right.id] = {
          x: rect.left - containerRect.left,
          y: rect.top - containerRect.top + rect.height / 2
        };
      }
    });

    setLeftNodePositions(leftPositions);
    setRightNodePositions(rightPositions);
  }, [currentQ]);

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    // Slight delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(updatePositions, 100);
    return () => {
      window.removeEventListener('resize', updatePositions);
      clearTimeout(timeoutId);
    };
  }, [updatePositions]);

  // Update lines based on current matches
  useEffect(() => {
    const newLines = [];
    Object.entries(matches).forEach(([leftId, rightId]) => {
      if (leftNodePositions[leftId] && rightNodePositions[rightId]) {
        newLines.push({
          id: `${leftId}-${rightId}`,
          leftId,
          rightId,
          start: leftNodePositions[leftId],
          end: rightNodePositions[rightId],
        });
      }
    });
    setLines(newLines);
  }, [matches, leftNodePositions, rightNodePositions]);

  // Pointer event handlers
  const handlePointerDown = (e, leftId) => {
    if (isSubmitted) return;
    e.preventDefault();
    e.stopPropagation();

    const startPos = leftNodePositions[leftId];
    if (!startPos) return;

    setActiveLine({
      leftId,
      start: startPos,
      current: startPos
    });

    const handlePointerMove = (moveEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      setActiveLine(prev => ({
        ...prev,
        current: {
          x: moveEvent.clientX - containerRect.left,
          y: moveEvent.clientY - containerRect.top
        }
      }));
    };

    const handlePointerUp = (upEvent) => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      
      // Check if dropped on a right node
      const elementBelow = document.elementFromPoint(upEvent.clientX, upEvent.clientY);
      const rightNodeId = elementBelow?.closest('[data-right-node]')?.getAttribute('data-right-node');
      
      if (rightNodeId) {
        onMatrixSelect(leftId, rightNodeId);
      }
      
      setActiveLine(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const getBezierPath = (start, end) => {
    const dx = Math.abs(end.x - start.x) * 0.5;
    return `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
  };

  return (
    <div className="relative bg-secondaryBg/30 p-6 rounded-xl border border-borderLine select-none touch-none" ref={containerRef}>
      
      {/* SVG Overlay for Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible">
        {lines.map(line => {
          const isCorrectMatch = isSubmitted && currentQ.matrixMatches?.find(m => m.leftId === line.leftId)?.rightId === line.rightId;
          const strokeColor = isSubmitted ? (isCorrectMatch ? '#10B981' : '#EF4444') : '#3B82F6';
          return (
            <path
              key={line.id}
              d={getBezierPath(line.start, line.end)}
              fill="none"
              stroke={strokeColor}
              strokeWidth="3"
              className="animate-fadeIn"
            />
          );
        })}
        {activeLine && (
          <path
            d={getBezierPath(activeLine.start, activeLine.current)}
            fill="none"
            stroke="#93C5FD"
            strokeWidth="3"
            strokeDasharray="5,5"
          />
        )}
      </svg>

      <div className="grid grid-cols-2 gap-16 relative z-20">
        {/* Left List */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-navy uppercase tracking-wider mb-2">List I</h4>
          {currentQ.matrixLeft?.map(left => {
            const hasMatch = !!matches[left.id];
            const correctMatchId = currentQ.matrixMatches?.find(m => m.leftId === left.id)?.rightId;
            const currentMatchId = matches[left.id];
            
            let statusIcon = null;
            if (isSubmitted) {
              if (currentMatchId === correctMatchId) {
                statusIcon = <CheckCircle2 className="w-5 h-5 text-medicalGreen" />;
              } else {
                statusIcon = <XCircle className="w-5 h-5 text-red-500" />;
              }
            }

            return (
              <div key={left.id} className="relative flex items-center justify-between p-4 bg-white border border-borderLine rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-500 bg-gray-100 w-8 h-8 flex items-center justify-center rounded-md">{left.id}</span>
                  <span className="text-sm font-medium text-navy">{left.text}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {statusIcon}
                  {/* Connection Node */}
                  <div
                    id={`node-left-${left.id}`}
                    onPointerDown={(e) => handlePointerDown(e, left.id)}
                    className={`w-4 h-4 rounded-full border-2 cursor-crosshair transition-colors relative right-[-24px] ${
                      hasMatch ? 'bg-primaryBlue border-primaryBlue' : 'bg-white border-primaryBlue hover:bg-blue-50'
                    }`}
                    style={{ zIndex: 30 }}
                  />
                </div>

                {/* Show correct answer label if submitted and wrong */}
                {isSubmitted && currentMatchId !== correctMatchId && (
                  <div className="absolute -bottom-6 left-0 text-[10px] font-bold text-red-500">
                    Correct match: {correctMatchId}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right List */}
        <div className="space-y-6">
          <h4 className="text-sm font-bold text-navy uppercase tracking-wider mb-2 pl-6">List II</h4>
          {currentQ.matrixRight?.map(right => (
            <div 
              key={right.id} 
              data-right-node={right.id}
              className="relative flex items-center p-4 bg-white border border-borderLine rounded-lg shadow-sm transition-colors hover:border-primaryBlue/50"
            >
              {/* Connection Node */}
              <div
                id={`node-right-${right.id}`}
                className="w-4 h-4 rounded-full border-2 border-primaryBlue bg-white absolute left-[-24px]"
                style={{ zIndex: 30 }}
              />
              <div className="flex items-center gap-3">
                <span className="font-bold text-primaryBlue bg-blue-50 w-8 h-8 flex items-center justify-center rounded-md">{right.id}</span>
                <span className="text-sm font-medium text-navy">{right.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatrixMatchInteractive;
