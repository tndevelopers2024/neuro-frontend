import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download, ArrowLeft, CheckCircle2, Bookmark as BookmarkIcon, Printer, Sparkles, Maximize2 } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import PDFFlipbook from '../../components/common/PDFFlipbook.jsx';

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
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const checkFullscreen = () => {
      const isFull = !!(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      );
      setIsFullscreen(isFull);
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

  const toggleFullScreen = () => {
    const isFull = !!(
      document.fullscreenElement || 
      document.webkitFullscreenElement || 
      document.mozFullScreenElement || 
      document.msFullscreenElement
    );
    
    if (!isFull) {
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
    return (
      <div className="p-16 text-center font-bold text-navy flex flex-col items-center gap-3">
        <Sparkles className="w-10 h-10 text-primaryBlue animate-spin" />
        <span>Loading Clinical Note Synthesis...</span>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="p-16 text-center font-bold text-navy flex flex-col items-center gap-3">
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
          className="flex items-center gap-2 text-sm font-extrabold text-primaryBlue hover:underline"
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

      <div className="bg-white border border-borderLine rounded-3xl p-8 md:p-12 shadow-soft">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#E9F2FF] text-primaryBlue text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Comprehensive Lecture Synthesis
          </span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-navy tracking-tight mb-4">{material.title}</h1>
        <div className="w-full h-[1px] bg-borderLine my-6" />

        {/* Render Uploaded PDF/Image or Structured HTML Reading Content */}
        {material.type === 'PDF' && material.fileUrl ? (
          <div ref={viewerRef} className="relative group w-full h-[85vh] rounded-2xl overflow-hidden border border-borderLine shadow-inner bg-secondaryBg">
            {material.fileUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i) ? (
              <div className="w-full h-full flex justify-center items-center p-4 bg-white relative">
                <button 
                  onClick={toggleFullScreen}
                  className="absolute top-4 right-8 z-10 bg-white/90 hover:bg-white text-navy p-2.5 rounded-xl shadow-md border border-borderLine/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
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
            ) : isFullscreen ? (
              <PDFFlipbook 
                fileUrl={getFileUrl(material.fileUrl)} 
                toggleFullScreen={toggleFullScreen}
              />
            ) : (
              <>
                <button 
                  onClick={toggleFullScreen}
                  className="absolute top-4 right-8 z-10 bg-white/90 hover:bg-white text-navy p-2.5 rounded-xl shadow-md border border-borderLine/50 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                  title="Open Flipbook Viewer"
                >
                  <Maximize2 className="w-5 h-5 text-primaryBlue" />
                </button>
                <iframe 
                  src={`${getFileUrl(material.fileUrl)}#toolbar=0`} 
                  className="w-full h-full"
                  title={material.title}
                ></iframe>
              </>
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
