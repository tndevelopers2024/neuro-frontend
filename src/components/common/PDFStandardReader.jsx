import React, { useState, useRef } from 'react';
import { Document, Page as ReactPdfPage, pdfjs } from 'react-pdf';
import { Maximize2, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import DrawingCanvas from './DrawingCanvas.jsx';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFStandardReader = ({ 
  fileUrl, 
  toggleFullScreen, 
  drawings, 
  setDrawings, 
  isDrawingMode, 
  activeColor,
  activeWidth,
  activeOpacity,
  activeTool
}) => {
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.5); // Default scale
  const [pdfDims, setPdfDims] = useState({});
  const containerRef = useRef(null);

  function onDocumentLoadSuccess(pdf) {
    setNumPages(pdf.numPages);
  }

  const handleLinesChange = (pageNum, newLines) => {
    setDrawings(prev => ({
      ...prev,
      [pageNum]: newLines
    }));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-slate-200 flex flex-col items-center overflow-y-auto overflow-x-hidden"
    >
      {/* Top right controls */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <button 
          onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
          className="bg-white/90 hover:bg-white text-navy p-2 rounded-lg shadow-md border border-borderLine/50 transition-all backdrop-blur-sm"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setScale(s => Math.min(3, s + 0.2))}
          className="bg-white/90 hover:bg-white text-navy p-2 rounded-lg shadow-md border border-borderLine/50 transition-all backdrop-blur-sm"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        {toggleFullScreen && (
          <button 
            onClick={toggleFullScreen}
            className="bg-white/90 hover:bg-white text-navy p-2 rounded-lg shadow-md border border-borderLine/50 transition-all backdrop-blur-sm"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-5 h-5 text-primaryBlue" />
          </button>
        )}
      </div>

      <div className="w-full flex justify-center py-12 px-4">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col items-center gap-8"
          loading={
            <div className="flex flex-col items-center justify-center h-screen gap-3">
              <Loader2 className="w-12 h-12 text-primaryBlue animate-spin" />
              <p className="text-navy font-bold text-sm">Loading Standard Reader...</p>
            </div>
          }
        >
          {numPages && Array.from(new Array(numPages), (el, index) => {
            const pageNum = index + 1;
            return (
              <div 
                key={`page_${pageNum}`}
                className="relative bg-white shadow-elevated rounded-sm overflow-hidden"
              >
                <ReactPdfPage 
                  pageNumber={pageNum} 
                  scale={scale}
                  renderTextLayer={false} 
                  renderAnnotationLayer={false} 
                  loading={<div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 text-primaryBlue animate-spin" /></div>}
                  onLoadSuccess={(page) => {
                    const viewportScale = page.getViewport({ scale });
                    const viewportIntrinsic = page.getViewport({ scale: 1 });
                    const wrapper = document.getElementById(`pdf-page-wrapper-${pageNum}`);
                    if (wrapper) {
                      wrapper.style.width = `${viewportScale.width}px`;
                      wrapper.style.height = `${viewportScale.height}px`;
                    }
                    setPdfDims(prev => ({...prev, [pageNum]: { width: viewportIntrinsic.width, height: viewportIntrinsic.height }}));
                  }}
                />
                
                {/* Canvas Overlay for Drawing */}
                <div 
                  id={`pdf-page-wrapper-${pageNum}`}
                  className="absolute inset-0"
                >
                  <DrawingCanvas 
                    width={pdfDims[pageNum]?.width || 1000}
                    height={pdfDims[pageNum]?.height || 1414}
                    isDrawingMode={isDrawingMode}
                    activeColor={activeColor}
                    activeWidth={activeWidth}
                    activeOpacity={activeOpacity}
                    activeTool={activeTool}
                    lines={drawings[pageNum] || []}
                    onLinesChange={(newLines) => handleLinesChange(pageNum, newLines)}
                  />
                </div>
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
};

export default PDFStandardReader;
