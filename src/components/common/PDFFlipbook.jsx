import React, { useState, forwardRef, useRef, useEffect } from 'react';
import { Document, Page as ReactPdfPage, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import { Maximize2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import DrawingCanvas from './DrawingCanvas.jsx';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Page = forwardRef(({ pageNumber, drawings, isDrawingMode, activeColor, activeWidth, activeOpacity, activeTool, handleLinesChange }, ref) => {
  const [pdfDim, setPdfDim] = useState({ width: 1000, height: 1414 });

  return (
    <div 
      ref={ref} 
      className="bg-white overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.1)] flex items-center justify-center relative w-full h-full page-wrapper-fix"
    >
      <ReactPdfPage 
        pageNumber={pageNumber} 
        scale={2}
        className="!w-full !h-full flex items-center justify-center [&>.react-pdf__Page__canvas]:!w-full [&>.react-pdf__Page__canvas]:!h-full [&>.react-pdf__Page__canvas]:!object-contain"
        renderTextLayer={false} 
        renderAnnotationLayer={false} 
        loading={<div className="flex items-center justify-center w-full h-full"><Loader2 className="w-8 h-8 text-primaryBlue animate-spin" /></div>}
        onLoadSuccess={(page) => {
          const viewport = page.getViewport({ scale: 1 });
          setPdfDim({ width: viewport.width, height: viewport.height });
        }}
      />
      <div 
        className="absolute inset-0"
        style={{ pointerEvents: isDrawingMode ? 'auto' : 'none' }}
      >
        <DrawingCanvas 
          width={pdfDim.width}
          height={pdfDim.height}
          isDrawingMode={isDrawingMode}
          activeColor={activeColor}
          activeWidth={activeWidth}
          activeOpacity={activeOpacity}
          activeTool={activeTool}
          lines={drawings[pageNumber] || []}
          onLinesChange={(newLines) => handleLinesChange(pageNumber, newLines)}
        />
      </div>
    </div>
  );
});

const PDFFlipbook = ({ fileUrl, toggleFullScreen, drawings, setDrawings, isDrawingMode, activeColor, activeWidth, activeOpacity, activeTool }) => {
  const [numPages, setNumPages] = useState(null);
  const [dimensions, setDimensions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  const [showBottomBar, setShowBottomBar] = useState(false);
  const bookRef = useRef();
  const containerRef = useRef();

  const handleLinesChange = (pageNum, newLines) => {
    setDrawings(prev => ({
      ...prev,
      [pageNum]: newLines
    }));
  };

  // Sync input with actual page when flipping
  useEffect(() => {
    setPageInput(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        // Add a 50px buffer to account for sub-pixel rendering or slamming mouse to edge of screen
        const isInsideX = e.clientX >= (rect.left - 50) && e.clientX <= (rect.right + 50);
        const distanceFromBottom = rect.bottom - e.clientY;
        
        // Show if mouse is within 150px above the bottom, or up to 50px below the bottom edge
        const isNearBottom = distanceFromBottom >= -50 && distanceFromBottom <= 150;
        const isBelowTop = e.clientY >= rect.top;
        
        setShowBottomBar(isInsideX && isNearBottom && isBelowTop);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, true);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove, true);
  }, []);

  const handlePageSubmit = (e) => {
    e.preventDefault();
    const targetPage = parseInt(pageInput);
    if (targetPage >= 1 && targetPage <= numPages) {
      bookRef.current?.pageFlip()?.turnToPage(targetPage - 1);
    } else {
      setPageInput(currentPage.toString());
    }
  };

  function onDocumentLoadSuccess(pdf) {
    setNumPages(pdf.numPages);
    // Extract actual PDF page dimensions to ensure perfect aspect ratio scaling
    pdf.getPage(1).then((page) => {
      const viewport = page.getViewport({ scale: 1 });
      const aspectRatio = viewport.height / viewport.width;
      // Normalize to a base width of 500, letting size="stretch" scale it
      setDimensions({ width: 500, height: 500 * aspectRatio });
    });
  }

  const onFlip = (e) => {
    setCurrentPage(e.data + 1); // e.data is the 0-indexed current page
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-[#E9F2FF] flex flex-col items-center justify-center rounded-xl overflow-hidden"
    >
      <style>{`
        .page-wrapper-fix {
          padding: 2% !important;
          box-sizing: border-box !important;
        }
        
        .page-wrapper-fix .react-pdf__Page {
          width: 100% !important;
          height: 100% !important;
          min-width: 0 !important;
          min-height: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .page-wrapper-fix .react-pdf__Page canvas {
          width: 100% !important;
          height: 100% !important;
          object-fit: contain !important;
          max-width: 100% !important;
          max-height: 100% !important;
        }
      `}</style>
      {toggleFullScreen && (
        <button 
          onClick={toggleFullScreen}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-navy p-2.5 rounded-xl shadow-md border border-borderLine/50 transition-all backdrop-blur-sm group-hover:opacity-100"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-5 h-5 text-primaryBlue" />
        </button>
      )}

      <div className="w-full h-full flex items-center justify-center drop-shadow-2xl relative z-10 p-4 md:p-8">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="w-full h-full flex items-center justify-center"
          loading={
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-primaryBlue animate-spin" />
              <p className="text-navy font-bold text-sm">Loading Interactive Flipbook...</p>
            </div>
          }
          error={
            <div className="text-red-500 font-bold p-8 bg-white rounded-xl shadow-md border border-red-100">
              Failed to load PDF document. Please try again.
            </div>
          }
        >
          {numPages && dimensions && (
            <HTMLFlipBook
              width={dimensions.width}
              height={dimensions.height}
              size="stretch"
              minWidth={200}
              maxWidth={4000}
              minHeight={200}
              maxHeight={6000}
              maxShadowOpacity={0.5}
              showCover={true}
              mobileScrollSupport={true}
              usePortrait={true}
              useMouseEvents={true}
              onFlip={onFlip}
              className="flipbook-wrapper"
              ref={bookRef}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page 
                  key={`page_${index + 1}`} 
                  pageNumber={index + 1} 
                  drawings={drawings}
                  isDrawingMode={isDrawingMode}
                  activeColor={activeColor}
                  activeWidth={activeWidth}
                  activeOpacity={activeOpacity}
                  activeTool={activeTool}
                  handleLinesChange={handleLinesChange}
                />
              ))}
            </HTMLFlipBook>
          )}
        </Document>
      </div>
      
      {/* Navigation Controls */}
      {numPages && (
        <div 
          className={`absolute bottom-28 z-20 flex items-center gap-4 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-lg shadow-elevated border border-borderLine transition-all duration-300 ${showBottomBar ? 'translate-y-0 opacity-100 visible' : 'translate-y-8 opacity-0 invisible'}`}
        >
          <button 
            onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
            className="p-2 bg-secondaryBg hover:bg-[#E9F2FF] rounded-xl transition-colors text-primaryBlue"
            title="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
            <span className="text-sm font-semibold text-textLight">Page</span>
            <input 
              type="number"
              min={1}
              max={numPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageSubmit}
              className="w-16 text-center py-1 px-2 border border-borderLine rounded-lg bg-secondaryBg text-sm font-bold text-navy focus:outline-none focus:ring-2 focus:ring-primaryBlue/50"
            />
            <span className="text-sm font-semibold text-textLight">of {numPages}</span>
          </form>

          <button 
            onClick={() => bookRef.current?.pageFlip()?.flipNext()}
            className="p-2 bg-secondaryBg hover:bg-[#E9F2FF] rounded-xl transition-colors text-primaryBlue"
            title="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFFlipbook;
