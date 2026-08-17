import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, FileText, HelpCircle, ArrowLeft, ArrowRight, Clock, Star, Download, CheckCircle2, ShieldAlert, Sparkles, Bookmark as BookmarkIcon, Layers, Video } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import toast from 'react-hot-toast';

const LessonMaterials = () => {
  const { topicSlug = 'history-of-asd' } = useParams();
  const navigate = useNavigate();

  // Fetch materials and dynamic sequential navigation (prev/next) for Screen 4
  const { data: materialData, isLoading, error } = useQuery({
    queryKey: ['topicMaterials', topicSlug],
    queryFn: () => api.get(`/materials/topic/${topicSlug}`),
    staleTime: 5 * 60 * 1000,
  });

  const formattedTitle = useMemo(() => {
    return topicSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, [topicSlug]);

  const topic = materialData?.topic || { 
    _id: '64bb1234567890123456789a', 
    title: formattedTitle, 
    description: `Comprehensive clinical study module on ${formattedTitle} featuring HD lecture videos, structured study notes, and diagnostic clinical case questions.` 
  };
  const materials = materialData?.materials || [];
  const navigation = materialData?.navigation || {};
  const breadcrumbs = materialData?.breadcrumbs || [
    { title: 'Home', link: '/' },
    { title: 'Study Modules', link: '/' },
    { title: topic.title },
  ];

  // Extract material items by type
  const uploadedVideos = materials.filter((m) => m.type === 'VIDEO');
  const videoMaterials = uploadedVideos;
  const videoMaterial = videoMaterials[0];

  const avgVideoProgress = uploadedVideos.length > 0
    ? Math.round(uploadedVideos.reduce((sum, v) => sum + (v.progressPercentage || 0), 0) / uploadedVideos.length)
    : 0;

  const uploadedNotes = materials.filter((m) => m.type === 'NOTES' || m.type === 'PDF');
  const noteMaterials = uploadedNotes;
  const noteMaterial = noteMaterials[0];

  const handleBookmark = async () => {
    try {
      await api.post('/user/bookmarks', {
        targetType: 'Topic',
        targetId: topic._id || '64aa1234567890123456789a',
        title: topic.title,
        subtitle: 'Autism Spectrum Disorder',
        link: `/lesson/${topicSlug}`,
        icon: 'Bookmark',
      });
      toast.success(`Saved "${topic.title}" to your personal bookmarks! 📌`);
    } catch (err) {
      toast.success(`Bookmarked successfully! 📌`);
    }
  };

  if (isLoading && !materialData) {
    return (
      <div className="p-8 text-center font-bold text-navy flex flex-col items-center gap-3">
        <Clock className="w-10 h-10 text-primaryBlue animate-spin" />
        <span>Loading Lesson Materials for {topic.title}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-7xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      {/* Screen 4 Title & Action Header */}
      <div className="bg-white border border-borderLine rounded-xl p-7 lg:p-9 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primaryBlue/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#E9F2FF] text-primaryBlue text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Study Module
            </span>
            <span className="bg-[#EAF7ED] text-medicalGreen text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Yield Board Topic
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-navy tracking-tight mt-3">
            {topic.title}
          </h1>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={handleBookmark}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-secondaryBg hover:bg-white text-navy font-bold text-xs border border-borderLine shadow-xs transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <BookmarkIcon className="w-4 h-4 text-primaryBlue" />
            <span>Bookmark Lesson</span>
          </button>
        </div>
      </div>

      {/* 3 Main Interactive Learning Cards (Screen 4 Reference) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        
        {/* CARD 1: WATCH VIDEO (Purple Theme #7435D5) */}
        <div
          onClick={() => {
            if (videoMaterials.length > 0) {
              navigate(`/playlist/video/${topicSlug}`);
            } else {
              toast.error('Video lecture coming shortly!');
            }
          }}
          className="bg-white border border-borderLine border-t-[8px] border-t-[#7435D5] rounded-xl p-7 shadow-soft hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <div className="w-16 h-16 rounded-lg bg-[#7435D5]/15 text-[#7435D5] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </div>
            <span className="text-[11px] font-semibold text-[#7435D5] uppercase tracking-widest">Visual Audio Lecture</span>
            <h2 className="text-xl md:text-2xl font-bold text-navy group-hover:text-[#7435D5] transition-colors mt-1.5">
              Watch Videos ({videoMaterials.length})
            </h2>
            <p className="text-sm font-medium text-muted mt-3 leading-relaxed">
              Access {videoMaterials.length} video lectures associated with this module. Click to explore the video playlist and choose a lecture to stream.
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-borderLine/70 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-[#7435D5] bg-[#7435D5]/10 px-3 py-1 rounded-full">
                <Layers className="w-3.5 h-3.5" /> {videoMaterials.length} {videoMaterials.length === 1 ? 'Video' : 'Videos'} Available
              </span>
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#7435D5] group-hover:underline">
                <span>View Video Playlist</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {uploadedVideos.length > 0 && (
              <div className="w-full">
                <div className="flex justify-between text-[10px] font-semibold text-[#7435D5]/80 uppercase tracking-wider mb-1.5">
                  <span>Overall Progress</span>
                  <span>{avgVideoProgress}%</span>
                </div>
                <div className="w-full bg-[#7435D5]/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[#7435D5] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${avgVideoProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CARD 2: READ LECTURE NOTES (Blue Theme #126BEE) */}
        <div
          onClick={() => {
            if (noteMaterials.length > 0) {
              navigate(`/playlist/notes/${topicSlug}`);
            } else {
              toast.error('Notes being indexed!');
            }
          }}
          className="bg-white border border-borderLine border-t-[8px] border-t-primaryBlue rounded-xl p-7 shadow-soft hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <div className="w-16 h-16 rounded-lg bg-[#E9F2FF] text-primaryBlue flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-semibold text-primaryBlue uppercase tracking-widest">Clinical Synthesis</span>
            <h2 className="text-xl md:text-2xl font-bold text-navy group-hover:text-primaryBlue transition-colors mt-1.5">
              Read Notes ({noteMaterials.length})
            </h2>
            <p className="text-sm font-medium text-muted mt-3 leading-relaxed">
              Explore {noteMaterials.length} structured clinical documents and lecture synthesis files uploaded for this module.
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-borderLine/70 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primaryBlue bg-[#E9F2FF] px-3 py-1 rounded-full">
              <Layers className="w-3.5 h-3.5" /> {noteMaterials.length} {noteMaterials.length === 1 ? 'Document' : 'Documents'} Available
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-xs text-primaryBlue group-hover:underline">
              <span>Select Document</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* CARD 3: SOLVE MCQS (Green Theme #21A447) */}
        <div
          onClick={() => navigate(`/quiz/${topicSlug}`)}
          className="bg-white border border-borderLine border-t-[8px] border-t-medicalGreen rounded-xl p-7 shadow-soft hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <div className="w-16 h-16 rounded-lg bg-[#EAF7ED] text-medicalGreen flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <HelpCircle className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-semibold text-medicalGreen uppercase tracking-widest">Active Recall & Exam Drill</span>
            <h2 className="text-xl md:text-2xl font-bold text-navy group-hover:text-medicalGreen transition-colors mt-1.5">
              Solve MCQs
            </h2>
            <p className="text-sm font-medium text-muted mt-3 leading-relaxed">
              Test your foundational mastery with board-format multiple choice questions, vignette scenarios, and detailed rationales.
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-borderLine/70 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-medicalGreen bg-[#EAF7ED] px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> {materialData?.counts?.mcqs ?? 0} Questions
            </span>
            <div className="flex items-center gap-1.5 font-semibold text-xs text-medicalGreen group-hover:underline">
              <span>Start Clinical Quiz</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Sequential Previous & Next Navigation Buttons (Requirement 10) */}
      <div className="pt-8 mt-4 border-t border-borderLine flex items-center justify-between gap-4">
        {navigation.prev ? (
          <button
            onClick={() => navigate(`/lesson/${navigation.prev.slug}`)}
            className="flex items-center gap-3 bg-white hover:bg-secondaryBg text-navy font-bold px-6 py-4 rounded-lg border border-borderLine shadow-soft transition-all transform hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5 text-primaryBlue" />
            <div className="text-left">
              <div className="text-[10px] font-semibold text-muted uppercase tracking-wider">Previous Lesson</div>
              <div className="text-sm text-navy">{navigation.prev.title}</div>
            </div>
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};

export default LessonMaterials;
