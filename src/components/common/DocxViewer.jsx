import React, { useEffect, useState } from 'react';
import mammoth from 'mammoth';
import { Maximize2, FileText, Download } from 'lucide-react';
import NeonBrainLoader from './NeonBrainLoader.jsx';

const DocxViewer = ({ fileUrl, toggleFullScreen }) => {
  const [htmlContent, setHtmlContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchAndRenderDocx = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error('Failed to fetch the document');
        
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        
        if (isMounted) {
          setHtmlContent(result.value);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error rendering docx:', err);
          setError('Failed to render the document. You can still download it below.');
          setIsLoading(false);
        }
      }
    };

    fetchAndRenderDocx();
    
    return () => { isMounted = false; };
  }, [fileUrl]);

  if (isLoading) {
    return (
      <div className="w-full h-[85vh] flex justify-center items-center p-4 bg-white relative rounded-lg border border-borderLine shadow-inner">
        <NeonBrainLoader text="Rendering Word Document..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[85vh] flex justify-center items-center p-4 bg-white relative rounded-lg border border-borderLine shadow-inner">
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 text-red-500 rounded-xl max-w-md text-center border border-red-100 shadow-sm">
          <FileText className="w-12 h-12 mb-4 opacity-50" />
          <h3 className="font-bold text-lg mb-2">Rendering Error</h3>
          <p className="text-sm font-medium mb-6">{error}</p>
          <a 
            href={fileUrl} 
            download
            className="px-6 py-2.5 bg-primaryBlue hover:bg-navy text-white text-xs font-bold flex items-center gap-2 rounded-lg shadow-md transition-colors"
          >
            <Download className="w-4 h-4" /> Download Document Instead
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[85vh] flex flex-col bg-white relative rounded-lg overflow-hidden border border-borderLine shadow-inner">
      {toggleFullScreen && (
        <button 
          onClick={() => toggleFullScreen('standard')}
          className="absolute top-4 right-8 z-10 bg-white/90 hover:bg-white text-navy p-2.5 rounded-xl shadow-md border border-borderLine/50 transition-opacity backdrop-blur-sm"
          title="Toggle Fullscreen"
        >
          <Maximize2 className="w-5 h-5 text-primaryBlue" />
        </button>
      )}
      <div 
        className="w-full h-full overflow-y-auto p-8 md:p-12 prose prose-sm md:prose-base max-w-none text-navy bg-[#FAFCFF] font-sans docx-content-wrapper"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default DocxViewer;
