import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as docx from 'docx-preview';
import { 
  Maximize2, 
  Minimize2, 
  FileText, 
  ZoomIn, 
  ZoomOut, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import NeonBrainLoader from './NeonBrainLoader.jsx';
import DrawingCanvas from './DrawingCanvas.jsx';

const DocxViewer = ({ 
  fileUrl, 
  title = 'Clinical Document', 
  toggleFullScreen, 
  isFullscreen = false,
  drawings = {},
  setDrawings,
  isDrawingMode = false,
  activeColor = '#FCD34D',
  activeWidth = 12,
  activeOpacity = 0.4,
  activeTool = 'marker'
}) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [renderCount, setRenderCount] = useState(0);
  const [pageSections, setPageSections] = useState([]);

  // Block printing, saving, and copy keyboard shortcuts to protect clinical document
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['p', 's', 'c', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const renderDocument = async () => {
      if (!fileUrl) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setPageSections([]);

        // Fetch the docx file as arrayBuffer
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to load document (${response.status} ${response.statusText})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        if (!isMounted) return;

        // Ensure containerRef is attached to the DOM
        let targetEl = containerRef.current;
        if (!targetEl) {
          await new Promise(resolve => setTimeout(resolve, 100));
          targetEl = containerRef.current;
        }

        if (!targetEl) {
          throw new Error('Viewer container element is not available.');
        }

        // Clear previous content
        targetEl.innerHTML = '';

        // Render DOCX with docx-preview
        await docx.renderAsync(arrayBuffer, targetEl, null, {
          className: 'docx',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          useBase64URL: true,
          trimXmlDeclaration: true,
          hideWrapperOnPrint: true,
        });

        // Post-process embedded drawings and images to prevent overlapping content
        const images = targetEl.querySelectorAll('div > img');
        images.forEach((img) => {
          const wrapper = img.parentElement;
          if (!wrapper) return;

          const parentP = wrapper.closest('p');
          const isHeading = parentP && (
            parentP.className?.includes('heading') ||
            parentP.style?.borderBottom ||
            /^(\d+\.|\b[A-Z\s]{4,}\b)/.test(parentP.textContent?.trim() || '')
          );

          // If image was placed inside a heading (due to Word XML anchor position),
          // move it to the beginning of the following content paragraph so the heading title
          // and bottom border are completely unobstructed and pristine.
          if (isHeading && parentP.nextElementSibling) {
            parentP.nextElementSibling.insertBefore(wrapper, parentP.nextElementSibling.firstChild);
          }

          // Ensure proper float, margin, and responsive sizing so text wraps with generous spacing
          wrapper.style.float = 'left';
          wrapper.style.margin = '6px 20px 14px 0';
          wrapper.style.display = 'block';
          wrapper.style.clear = 'left';
          wrapper.style.zIndex = '1';
          img.style.display = 'block';
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
        });

        // Collect all page sections for DrawingCanvas portals
        const sections = targetEl.querySelectorAll('section.docx');
        sections.forEach((sec, idx) => {
          sec.style.position = 'relative';
          sec.id = `docx-page-section-${idx + 1}`;
        });

        if (isMounted) {
          setPageSections(Array.from(sections));
          setIsLoading(false);
        }
      } catch (err) {
        console.error('DocxViewer rendering error:', err);
        if (isMounted) {
          setError(err.message || 'Failed to render document format.');
          setIsLoading(false);
        }
      }
    };

    renderDocument();

    return () => {
      isMounted = false;
    };
  }, [fileUrl, renderCount]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 15, 50));
  const handleZoomReset = () => setZoom(100);

  const handleRetry = () => {
    setRenderCount(c => c + 1);
  };

  const handleLinesChange = (pageNum, newLines) => {
    if (setDrawings) {
      setDrawings(prev => ({
        ...prev,
        [pageNum]: newLines
      }));
    }
  };

  return (
    <div 
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onSelectStart={(e) => e.preventDefault()}
      className={`w-full flex flex-col bg-slate-200 rounded-xl overflow-hidden border border-borderLine shadow-sm relative select-none ${isFullscreen ? 'h-screen fixed inset-0 z-50 rounded-none' : 'h-[85vh]'}`}
    >
      
      {/* Top Floating Control Bar (No print / download) */}
      <div className="bg-white/95 backdrop-blur-md border-b border-borderLine px-4 py-2.5 flex items-center justify-between gap-4 shrink-0 shadow-xs z-20 select-none">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-primaryBlue flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-navy truncate max-w-xs md:max-w-md" title={title}>
            {title}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-primaryBlue border border-blue-100">
            DOCX
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Zoom controls */}
          <div className="flex items-center bg-secondaryBg rounded-lg p-0.5 border border-borderLine">
            <button 
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              className="p-1.5 text-muted hover:text-navy hover:bg-white rounded-md transition-colors disabled:opacity-40"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={handleZoomReset}
              className="px-2 text-[11px] font-semibold text-navy hover:text-primaryBlue transition-colors"
              title="Reset Zoom (100%)"
            >
              {zoom}%
            </button>
            <button 
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="p-1.5 text-muted hover:text-navy hover:bg-white rounded-md transition-colors disabled:opacity-40"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          {toggleFullScreen && (
            <button 
              onClick={() => toggleFullScreen('standard')}
              className="p-2 text-primaryBlue hover:bg-blue-50 rounded-lg transition-colors border border-borderLine/60 ml-1"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col justify-center items-center p-4 bg-slate-50/90 backdrop-blur-xs select-none">
          <NeonBrainLoader text="Rendering Clinical Word Document with full tables & formatting..." />
        </div>
      )}

      {/* Error View Overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 z-30 flex justify-center items-center p-4 bg-slate-50 select-none">
          <div className="flex flex-col items-center justify-center p-8 bg-white rounded-2xl max-w-md text-center border border-red-200 shadow-elevated">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-navy mb-2">Unable to Render Document</h3>
            <p className="text-xs text-muted mb-6 leading-relaxed">{error}</p>
            <button 
              onClick={handleRetry}
              className="px-5 py-2 bg-primaryBlue hover:bg-navy text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Document Scroll Area */}
      <div 
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onSelectStart={(e) => e.preventDefault()}
        className="w-full flex-1 overflow-auto bg-[#E5E9F0] p-4 md:p-8 flex justify-center items-start docx-viewer-scroll-area select-none"
      >
        <div 
          className="transition-transform duration-150 ease-out origin-top flex flex-col items-center w-full select-none"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {/* Target Element for docx-preview. Protected against selection/copy */}
          <div 
            ref={containerRef}
            className="docx-preview-root-container w-full flex flex-col items-center select-none"
          />

          {/* Render DrawingCanvas overlays for each Word document page */}
          {setDrawings && pageSections.map((sec, idx) => {
            const pageNum = idx + 1;
            const width = sec.offsetWidth || 816;
            const height = sec.offsetHeight || 1056;

            return createPortal(
              <div 
                key={`drawing-portal-${pageNum}`}
                className="absolute inset-0"
                style={{
                  zIndex: 10,
                  width: '100%',
                  height: '100%',
                  pointerEvents: isDrawingMode ? 'auto' : 'none',
                }}
              >
                <DrawingCanvas
                  width={width}
                  height={height}
                  isDrawingMode={isDrawingMode}
                  activeColor={activeColor}
                  activeWidth={activeWidth}
                  activeOpacity={activeOpacity}
                  activeTool={activeTool}
                  lines={drawings[pageNum] || []}
                  onLinesChange={(newLines) => handleLinesChange(pageNum, newLines)}
                />
              </div>,
              sec
            );
          })}
        </div>
      </div>

      {/* Styles enhancing docx table borders, colors, layout, and strict copy/select protection */}
      <style>{`
        /* Complete Selection & Copy Prevention */
        .docx-preview-root-container,
        .docx-preview-root-container *,
        .docx-viewer-scroll-area,
        .docx-viewer-scroll-area * {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
        }

        .docx-preview-root-container *::selection,
        .docx-viewer-scroll-area *::selection {
          background: transparent !important;
          color: inherit !important;
        }

        .docx-preview-root-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        .docx-preview-root-container .docx-wrapper {
          background-color: transparent !important;
          padding: 0 !important;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
        }

        .docx-preview-root-container .docx-wrapper > section.docx {
          background: #ffffff !important;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.06) !important;
          border: 1px solid #d1d5db !important;
          margin-bottom: 24px !important;
          border-radius: 4px;
          box-sizing: border-box;
          color: #1a202c;
          overflow: visible !important;
          position: relative !important;
        }

        /* Ensure Table Formatting, Borders, and Background Colors are Preserved */
        .docx-preview-root-container table {
          border-collapse: collapse !important;
          width: 100% !important;
          margin: 14px 0 !important;
        }

        .docx-preview-root-container td,
        .docx-preview-root-container th {
          padding: 8px 12px !important;
          vertical-align: top;
          box-sizing: border-box;
        }

        /* If cell has no explicit border in word, maintain a soft clean separator */
        .docx-preview-root-container table:not([border]) td {
          border: 1px solid rgba(0, 0, 0, 0.12);
        }

        /* Preserve Embedded Word Document Images, Drawings, and Shapes */
        .docx-preview-root-container img {
          max-width: 100% !important;
          object-fit: contain;
          vertical-align: middle;
          border-radius: 2px;
        }

        .docx-preview-root-container div[style*="display: inline-block"],
        .docx-preview-root-container div[style*="position: relative"],
        .docx-preview-root-container div[style*="position: absolute"] {
          box-sizing: border-box;
        }

        /* Ensure headings clear preceding floated images cleanly */
        .docx-preview-root-container p[class*="heading"],
        .docx-preview-root-container h1,
        .docx-preview-root-container h2,
        .docx-preview-root-container h3,
        .docx-preview-root-container h4 {
          clear: both !important;
          width: 100% !important;
          position: relative !important;
          z-index: 2;
        }

        /* Prevent list items and paragraphs from clipping or tucking under floats */
        .docx-preview-root-container p[class*="docx-num"] {
          overflow-wrap: break-word;
        }

        /* Block Printing Completely */
        @media print {
          body, html, * {
            display: none !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DocxViewer;
