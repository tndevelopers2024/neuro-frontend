import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, ArrowLeft, CheckCircle2, Bookmark as BookmarkIcon, Printer, Sparkles, Maximize2, BookOpen, X, PenTool, Hand, Eraser, Trash2, Undo2, Redo2 } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import PDFFlipbook from '../../components/common/PDFFlipbook.jsx';
import PDFStandardReader from '../../components/common/PDFStandardReader.jsx';
import NeonBrainLoader from '../../components/common/NeonBrainLoader.jsx';

const COLORS = [
  { id: 'yellow', value: '#FCD34D' },
  { id: 'green', value: '#86EFAC' },
  { id: 'pink', value: '#F9A8D4' },
  { id: 'blue', value: '#93C5FD' },
];

const getFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('/uploads')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${baseUrl.replace('/api', '')}${url}`;
  }
  return url;
};

const NoteReader = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const [fullscreenMode, setFullscreenMode] = useState(null); // 'standard' | 'flipbook' | null
  
  // Drawing States
  const [drawings, setDrawings] = useState({});
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [activeColor, setActiveColor] = useState(COLORS[0].value);
  const [activeWidth, setActiveWidth] = useState(12);
  const [activeOpacity, setActiveOpacity] = useState(0.4);
  const [activeTool, setActiveTool] = useState('marker'); // 'marker' | 'eraser'
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [hasLoadedAnnotations, setHasLoadedAnnotations] = useState(false);
  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);

  // Load annotations from backend
  useEffect(() => {
    if (!id) return;
    const fetchAnnotations = async () => {
      try {
        // Find the actual material ID if it's different from params.id, or use id directly
        // The URL param `id` is the material ID.
        const data = await api.get(`/annotations/${id}`);
        if (data && data.drawings) {
          setDrawings(data.drawings);
        }
      } catch (err) {
        console.error('Failed to load annotations:', err);
      } finally {
        setHasLoadedAnnotations(true);
      }
    };
    fetchAnnotations();
  }, [id]);

  const handleDrawingsUpdate = (updater) => {
    const updated = typeof updater === 'function' ? updater(drawings) : updater;
    
    setPast(p => [...p, drawings]);
    setFuture([]);
    setDrawings(updated);
    
    // Save to server immediately on change
    if (id) {
      api.post(`/annotations/${id}`, { drawings: updated }).catch(err => {
        console.error('Failed to save annotations:', err);
      });
    }
  };

  const handleUndo = () => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    
    setPast(p => p.slice(0, -1));
    setFuture(f => [drawings, ...f]);
    setDrawings(prev);
    
    if (id) {
      api.post(`/annotations/${id}`, { drawings: prev }).catch(console.error);
    }
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    
    setFuture(f => f.slice(1));
    setPast(p => [...p, drawings]);
    setDrawings(next);
    
    if (id) {
      api.post(`/annotations/${id}`, { drawings: next }).catch(console.error);
    }
  };

  useEffect(() => {
    const checkFullscreen = () => {
      const isFull = !!(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      );
      if (!isFull) {
        setFullscreenMode(null);
      }
    };
    
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    
    // Primary event listeners
    events.forEach(evt => document.addEventListener(evt, checkFullscreen));
    
    // Fallback polling for buggy browsers that drop the exit event (e.g. Safari / F11 edge cases)
    const interval = setInterval(checkFullscreen, 500);

    return () => {
      events.forEach(evt => document.removeEventListener(evt, checkFullscreen));
      clearInterval(interval);
    };
  }, []);

  const toggleFullScreen = (mode = null) => {
    const isFull = !!(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement
    );
    
    if (!isFull && mode) {
      setFullscreenMode(mode);
      const el = viewerRef.current;
      if (!el) return;
      
      const requestFS = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
      if (requestFS) {
        requestFS.call(el).catch(err => {
          if (err) toast.error(`Error enabling full-screen: ${err.message}`);
        });
      }
    } else {
      const exitFS = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
      if (exitFS) {
        exitFS.call(document);
      }
      setFullscreenMode(null);
    }
  };

  // Fetch note material details from backend
  const { data: resData, isLoading } = useQuery({
    queryKey: ['materialNote', id],
    queryFn: () => api.get(`/materials/${id}`),
    staleTime: 10 * 60 * 1000,
  });

  const material = resData?.material;

  const handleMarkDone = async () => {
    try {
      await api.post('/progress/update', {
        topicId: material.topic?._id || material.topic,
        materialId: material._id || id,
        materialType: 'NOTES',
        progressPercentage: 100,
      });
      toast.success('📖 Clinical reading marked as Mastered!', { icon: '🏆' });
    } catch (e) {
      toast.success('📖 Clinical reading completed!');
    }
  };

  if (isLoading) {
    return <NeonBrainLoader text="Loading Clinical Note Synthesis..." />;
  }

  if (!material) {
    return (
      <div className="p-8 text-center font-bold text-navy flex flex-col items-center gap-3">
        <span>Clinical note not found.</span>
        <button onClick={() => navigate(-1)} className="text-primaryBlue hover:underline">Return to Curriculum</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-semibold text-primaryBlue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Lesson Overview
        </button>

        <div className="flex items-center gap-2.5">

          <button
            onClick={handleMarkDone}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-medicalGreen hover:bg-[#1C8D3C] text-white font-bold text-xs shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <CheckCircle2 className="w-4 h-4" /> Mark as Mastered
          </button>
        </div>
      </div>

      <div className="bg-white border border-borderLine rounded-xl p-8 md:p-12 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#E9F2FF] text-primaryBlue text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Comprehensive Lecture Synthesis
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-bold text-navy tracking-tight mb-4">{material.title}</h1>
        <div className="w-full h-[1px] bg-borderLine my-6" />

        {/* Render Uploaded PDF/Image or Structured HTML Reading Content */}
        {(material.type === 'PDF' || material.type === 'NOTES') && material.fileUrl ? (
          <div ref={viewerRef} className={`w-full transition-all ${fullscreenMode ? 'h-screen bg-secondaryBg' : ''}`}>
            {material.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? (
              <div className="w-full h-[85vh] flex justify-center items-center p-4 bg-white relative rounded-lg overflow-hidden border border-borderLine shadow-inner">
                <button 
                  onClick={() => toggleFullScreen('standard')}
                  className="absolute top-4 right-8 z-10 bg-white/90 hover:bg-white text-navy p-2.5 rounded-xl shadow-md border border-borderLine/50 transition-opacity backdrop-blur-sm"
                  title="Toggle Fullscreen"
                >
                  <Maximize2 className="w-5 h-5 text-primaryBlue" />
                </button>
                <img 
                  src={getFileUrl(material.fileUrl)} 
                  alt={material.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                />
              </div>
            ) : !fullscreenMode ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 bg-secondaryBg rounded-2xl border border-dashed border-borderLine shadow-sm">
                <div className="w-20 h-20 bg-white shadow-soft text-primaryBlue rounded-full flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 border-2 border-primaryBlue/20 rounded-full animate-ping opacity-20"></div>
                  <FileText className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-navy mb-3">Clinical Document Reader</h3>
                <p className="text-sm text-muted mb-8 text-center max-w-md leading-relaxed">
                  Choose your preferred reading mode. Both options provide an immersive, distraction-free full-screen environment.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <button 
                    onClick={() => toggleFullScreen('standard')} 
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-primaryBlue hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
                  >
                    <Maximize2 className="w-4 h-4" /> Open Standard Reader
                  </button>
                  <button 
                    onClick={() => toggleFullScreen('flipbook')} 
                    className="flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white hover:bg-slate-50 text-navy font-bold text-sm rounded-xl border border-borderLine shadow-sm transition-all transform hover:-translate-y-0.5 w-full sm:w-auto"
                  >
                    <BookOpen className="w-4 h-4 text-primaryBlue" /> Open Interactive Flipbook
                  </button>
                </div>
              </div>
            ) : fullscreenMode === 'flipbook' ? (
              <PDFFlipbook 
                fileUrl={getFileUrl(material.fileUrl)} 
                toggleFullScreen={() => toggleFullScreen()}
                drawings={drawings}
                setDrawings={handleDrawingsUpdate}
                isDrawingMode={isDrawingMode}
                activeTool={activeTool}
                activeColor={activeColor}
                activeWidth={activeWidth}
                activeOpacity={activeOpacity}
              />
            ) : (
              <div className="w-full h-full relative bg-secondaryBg">
                <PDFStandardReader 
                  fileUrl={getFileUrl(material.fileUrl)}
                  toggleFullScreen={() => toggleFullScreen()}
                  drawings={drawings}
                  setDrawings={handleDrawingsUpdate}
                  isDrawingMode={isDrawingMode}
                  activeTool={activeTool}
                  activeColor={activeColor}
                  activeWidth={activeWidth}
                  activeOpacity={activeOpacity}
                />
              </div>
            )}
            
            {/* Drawing Toolbar Overlay in Fullscreen */}
            {fullscreenMode && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center">
                
                {/* Settings Dropdown Popover */}
                {showSettingsDropdown && isDrawingMode && (
                  <div className="absolute bottom-[calc(100%+12px)] bg-white p-4 rounded-xl shadow-elevated border border-borderLine flex flex-col gap-5 w-52 z-50">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-navy uppercase">Size</span>
                        <span className="text-xs text-muted font-medium">{activeWidth}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="2" max="40" 
                        value={activeWidth} 
                        onChange={e => setActiveWidth(Number(e.target.value))}
                        className="w-full h-1.5 bg-borderLine rounded-lg appearance-none cursor-pointer accent-primaryBlue"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-navy uppercase">Opacity</span>
                        <span className="text-xs text-muted font-medium">{Math.round(activeOpacity * 100)}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" max="1" step="0.1" 
                        value={activeOpacity} 
                        onChange={e => setActiveOpacity(Number(e.target.value))}
                        className="w-full h-1.5 bg-borderLine rounded-lg appearance-none cursor-pointer accent-primaryBlue"
                      />
                    </div>
                  </div>
                )}

                {/* Toolbar */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-elevated border border-borderLine p-2 flex items-center gap-3 w-[95vw] md:w-auto overflow-x-auto no-scrollbar relative">
                  <div className="flex bg-secondaryBg p-1 rounded-xl shrink-0">
                  <button 
                    onClick={() => { setIsDrawingMode(false); setActiveTool('marker'); setShowSettingsDropdown(false); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${!isDrawingMode ? 'bg-white shadow-sm text-primaryBlue' : 'text-muted hover:text-navy'}`}
                  >
                    <Hand className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Pan / Turn</span>
                  </button>
                  <button 
                    onClick={() => { 
                      if (isDrawingMode && activeTool === 'marker') {
                        setShowSettingsDropdown(prev => !prev);
                      } else {
                        setIsDrawingMode(true); 
                        setActiveTool('marker'); 
                        setShowSettingsDropdown(false);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isDrawingMode && activeTool === 'marker' ? 'bg-white shadow-sm text-primaryBlue' : 'text-muted hover:text-navy'}`}
                    title="Click again for settings"
                  >
                    <PenTool className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Marker</span>
                  </button>
                  <button 
                    onClick={() => { 
                      if (isDrawingMode && activeTool === 'eraser') {
                        setShowSettingsDropdown(prev => !prev);
                      } else {
                        setIsDrawingMode(true); 
                        setActiveTool('eraser');
                        setShowSettingsDropdown(false);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isDrawingMode && activeTool === 'eraser' ? 'bg-white shadow-sm text-primaryBlue' : 'text-muted hover:text-navy'}`}
                    title="Click again for settings"
                  >
                    <Eraser className="w-4 h-4" /> 
                    <span className="hidden sm:inline">Eraser</span>
                  </button>
                </div>
                
                <div className="hidden md:flex items-center gap-1 shrink-0">
                  <button 
                    onClick={handleUndo}
                    disabled={past.length === 0}
                    className={`p-2 rounded-lg transition-colors ${past.length > 0 ? 'text-primaryBlue hover:bg-blue-50' : 'text-slate-300'}`}
                    title="Undo"
                  >
                    <Undo2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleRedo}
                    disabled={future.length === 0}
                    className={`p-2 rounded-lg transition-colors ${future.length > 0 ? 'text-primaryBlue hover:bg-blue-50' : 'text-slate-300'}`}
                    title="Redo"
                  >
                    <Redo2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="w-[1px] h-8 bg-borderLine shrink-0 mx-1" />
                
                <div className="flex items-center gap-1.5 px-2 shrink-0">
                  {COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setActiveColor(c.value);
                        setIsDrawingMode(true);
                        setActiveTool('marker');
                        setShowSettingsDropdown(false);
                      }}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${activeColor === c.value && isDrawingMode && activeTool === 'marker' ? 'scale-110 border-primaryBlue shadow-md' : 'border-transparent hover:scale-110'}`}
                      style={{ backgroundColor: c.value }}
                      title={`Highlight ${c.id}`}
                    />
                  ))}
                </div>
                
                <div className="w-[1px] h-8 bg-borderLine shrink-0 mx-1" />
                
                <button 
                  onClick={() => {
                    if (window.confirm('Clear all highlights on the current page?')) {
                      handleDrawingsUpdate({});
                      toast.success('All highlights cleared');
                    }
                  }}
                  className="flex flex-col items-center justify-center p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-[10px] font-bold mt-0.5">Clear All</span>
                </button>
              </div>
             </div>
            )}
          </div>
        ) : (
          <div
            className="prose max-w-none text-navy"
            dangerouslySetInnerHTML={{ __html: material.richTextContent || '<p>Structured study content is loading...</p>' }}
          />
        )}
      </div>
    </div>
  );
};

export default NoteReader;
