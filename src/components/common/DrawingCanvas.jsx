import React, { useRef, useEffect, useState } from 'react';

const DrawingCanvas = ({ 
  isDrawingMode, 
  activeColor, 
  activeWidth = 12,
  activeOpacity = 0.4,
  activeTool = 'marker',
  lines = [], 
  onLinesChange,
  width,
  height
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);

  // Redraw all lines when lines array or dimensions change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing properties
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw committed lines
    lines.forEach(line => {
      if (line.points.length === 0) return;
      ctx.beginPath();
      
      if (line.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = line.width || 20;
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.width || 12; // Highlighter width
        // Add slight transparency to simulate highlighter
        ctx.globalAlpha = line.opacity !== undefined ? line.opacity : 0.4;
      }
      
      ctx.moveTo(line.points[0].x, line.points[0].y);
      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current active line being drawn
    if (currentLine && currentLine.points.length > 0) {
      ctx.beginPath();
      if (currentLine.isEraser) {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = currentLine.width || 20;
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = currentLine.color;
        ctx.lineWidth = currentLine.width || 12;
        ctx.globalAlpha = currentLine.opacity !== undefined ? currentLine.opacity : 0.4;
      }
      
      ctx.moveTo(currentLine.points[0].x, currentLine.points[0].y);
      for (let i = 1; i < currentLine.points.length; i++) {
        ctx.lineTo(currentLine.points[i].x, currentLine.points[i].y);
      }
      ctx.stroke();
    }
  }, [lines, currentLine, width, height]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Support for both mouse and touch events
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Internal resolution of canvas (matches PDF intrinsic size)
    const intrinsicWidth = canvas.width;
    const intrinsicHeight = canvas.height;
    
    // CSS layout size of canvas (may include letterboxing)
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    // Calculate actual visual size assuming object-fit: contain
    const scale = Math.min(cssWidth / intrinsicWidth, cssHeight / intrinsicHeight);
    const visualWidth = intrinsicWidth * scale;
    const visualHeight = intrinsicHeight * scale;

    // Calculate letterbox offsets (centered)
    const offsetX = (cssWidth - visualWidth) / 2;
    const offsetY = (cssHeight - visualHeight) / 2;

    // Map mouse coordinate to the intrinsic image area
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const stopNativeEvent = (e) => {
      if (!isDrawingMode) return;
      e.stopPropagation();
    };

    const handlePointerDown = (e) => {
      if (!isDrawingMode) return;
      e.stopPropagation();
      setIsDrawing(true);
      const coords = getCoordinates(e);
      setCurrentLine({
        color: activeColor,
        width: activeWidth,
        opacity: activeOpacity,
        isEraser: activeTool === 'eraser',
        points: [coords]
      });
    };

    const handlePointerMove = (e) => {
      if (!isDrawingMode) return;
      e.stopPropagation();
      if (e.cancelable && e.type && e.type.startsWith('touch')) {
        e.preventDefault();
      }
      setIsDrawing(prev => {
        if (!prev) return prev;
        const coords = getCoordinates(e);
        setCurrentLine(curr => ({
          ...curr,
          points: [...curr.points, coords]
        }));
        return prev;
      });
    };

    const handlePointerUp = (e) => {
      e.stopPropagation();
      setIsDrawing(prev => {
        if (prev) {
          setCurrentLine(curr => {
            if (curr && curr.points.length > 0) {
              onLinesChange([...lines, curr]);
            }
            return null;
          });
        }
        return false;
      });
    };

    // Attach to all possible event types react-pageflip might be listening to
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('mousedown', stopNativeEvent);
    canvas.addEventListener('mousemove', stopNativeEvent);
    canvas.addEventListener('touchstart', stopNativeEvent, { passive: false });
    canvas.addEventListener('touchmove', stopNativeEvent, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('mousedown', stopNativeEvent);
      canvas.removeEventListener('mousemove', stopNativeEvent);
      canvas.removeEventListener('touchstart', stopNativeEvent);
      canvas.removeEventListener('touchmove', stopNativeEvent);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDrawingMode, activeColor, activeWidth, activeOpacity, activeTool, lines, onLinesChange]);

  return (
    <canvas
      ref={canvasRef}
      width={width || 1000}
      height={height || 1414}
      className={`w-full h-full object-contain ${isDrawingMode ? 'cursor-crosshair' : 'cursor-default'}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: isDrawingMode ? 'auto' : 'none',
        touchAction: isDrawingMode ? 'none' : 'auto'
      }}
    />
  );
};

export default DrawingCanvas;
