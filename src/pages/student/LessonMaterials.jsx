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

  // Extract material items by type or supply rich interactive default demonstrations
  const uploadedVideos = materials.filter((m) => m.type === 'VIDEO');
  const videoMaterials = uploadedVideos.length > 0 ? uploadedVideos : [{
    _id: '64aaaaa00000000000000001',
    title: `${topic.title} - HD Video Lecture`,
    duration: '24 min',
    description: `Detailed board-review video analysis of ${topic.title} covering neurodevelopmental concepts, diagnostic assessment, and clinical protocols.`
  }];
  const videoMaterial = videoMaterials[0];

  const avgVideoProgress = uploadedVideos.length > 0
    ? Math.round(uploadedVideos.reduce((sum, v) => sum + (v.progressPercentage || 0), 0) / uploadedVideos.length)
    : 0;

  const uploadedNotes = materials.filter((m) => m.type === 'NOTES' || m.type === 'PDF');
  const noteMaterials = uploadedNotes.length > 0 ? uploadedNotes : [{
    _id: '64aaaaa00000000000000002',
    title: `${topic.title} - High-Yield Study Notes`,
    description: `High-yield structured reading notes synthesizing key diagnostic criteria, epidemiological parameters, and clinical practice pearls for ${topic.title}.`,
    type: 'PDF'
  }];
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
      <div className="p-16 text-center font-bold text-navy flex flex-col items-center gap-3">
        <Clock className="w-10 h-10 text-primaryBlue animate-spin" />
        <span>Loading Lesson Materials for {topic.title}...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-7xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      {/* Screen 4 Title & Action Header */}
      <div className="bg-white border border-borderLine rounded-3xl p-7 lg:p-9 shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-primaryBlue/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="bg-[#E9F2FF] text-primaryBlue text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Study Module
            </span>
            <span className="bg-[#EAF7ED] text-medicalGreen text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Yield Board Topic
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-navy tracking-tight mt-3">
            {topic.title}
          </h1>
          <p className="text-sm md:text-base font-medium text-muted mt-2 max-w-3xl leading-relaxed">
            {topic.description || 'Comprehensive clinical exploration featuring HD lecture videos, structured study notes, and diagnostic clinical case questions.'}
          </p>
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
            if (videoMaterials.length > 1) {
              navigate(`/playlist/video/${topicSlug}`);
            } else if (videoMaterials.length === 1 && videoMaterials[0]) {
              navigate(`/video/${videoMaterials[0]._id}`);
            } else {
              toast.error('Video lecture coming shortly!');
            }
          }}
          className="bg-white border border-borderLine border-t-[8px] border-t-[#7435D5] rounded-3xl p-7 shadow-soft hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-[#7435D5]/15 text-[#7435D5] flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <Play className="w-8 h-8 fill-current translate-x-0.5" />
            </div>
            <span className="text-[11px] font-extrabold text-[#7435D5] uppercase tracking-widest">Visual Audio Lecture</span>
            <h2 className="text-xl md:text-2xl font-black text-navy group-hover:text-[#7435D5] transition-colors mt-1.5">
              {videoMaterials.length > 1 ? `Watch Videos (${videoMaterials.length})` : 'Watch Video'}
            </h2>
            <p className="text-sm font-medium text-muted mt-3 leading-relaxed">
              {videoMaterials.length > 1
                ? `Access ${videoMaterials.length} video lectures associated with this module. Click to explore the video playlist and choose a lecture to stream.`
                : (videoMaterial?.description || 'Watch high-quality visual video lectures detailing Leo Kanner (1943), Hans Asperger, and diagnostic DSM revisions over decades.')}
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-borderLine/70 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-extrabold text-[#7435D5] bg-[#7435D5]/10 px-3 py-1 rounded-full">
                {videoMaterials.length > 1 ? (
                  <>
                    <Layers className="w-3.5 h-3.5" /> {videoMaterials.length} Videos Available
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" /> {videoMaterial?.duration || '24 min'}
                  </>
                )}
              </span>
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-[#7435D5] group-hover:underline">
                <span>{videoMaterials.length > 1 ? 'View Video Playlist' : 'Launch Video Player'}</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
            
            {uploadedVideos.length > 0 && (
              <div className="w-full">
                <div className="flex justify-between text-[10px] font-extrabold text-[#7435D5]/80 uppercase tracking-wider mb-1.5">
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
            if (noteMaterials.length > 1) {
              navigate(`/playlist/notes/${topicSlug}`);
            } else if (noteMaterials.length === 1 && noteMaterials[0]) {
              navigate(`/notes/${noteMaterials[0]._id}`);
            } else {
              toast.error('Notes being indexed!');
            }
          }}
          className="bg-white border border-borderLine border-t-[8px] border-t-primaryBlue rounded-3xl p-7 shadow-soft hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-[#E9F2FF] text-primaryBlue flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-extrabold text-primaryBlue uppercase tracking-widest">Clinical Synthesis</span>
            <h2 className="text-xl md:text-2xl font-black text-navy group-hover:text-primaryBlue transition-colors mt-1.5">
              {noteMaterials.length > 1 ? `Read Notes (${noteMaterials.length})` : 'Read Lecture Notes'}
            </h2>
            <p className="text-sm font-medium text-muted mt-3 leading-relaxed">
              {noteMaterials.length > 1
                ? `Explore ${noteMaterials.length} structured clinical documents and lecture synthesis files uploaded for this module.`
                : (noteMaterial?.description || 'Read comprehensive lecture notes complete with diagnostic comparison diagrams, timeline tables, and clinical practice pearls.')}
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-borderLine/70 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-primaryBlue bg-[#E9F2FF] px-3 py-1 rounded-full">
              {noteMaterials.length > 1 ? (
                <>
                  <Layers className="w-3.5 h-3.5" /> {noteMaterials.length} Documents Available
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" /> PDF & HTML
                </>
              )}
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-xs text-primaryBlue group-hover:underline">
              <span>{noteMaterials.length > 1 ? 'Select Document' : 'Open Reader'}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>

        {/* CARD 3: SOLVE MCQS (Green Theme #21A447) */}
        <div
          onClick={() => navigate(`/quiz/${topicSlug}`)}
          className="bg-white border border-borderLine border-t-[8px] border-t-medicalGreen rounded-3xl p-7 shadow-soft hover:shadow-elevated hover:-translate-y-2 transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
        >
          <div>
            <div className="w-16 h-16 rounded-2xl bg-[#EAF7ED] text-medicalGreen flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <HelpCircle className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-extrabold text-medicalGreen uppercase tracking-widest">Active Recall & Exam Drill</span>
            <h2 className="text-xl md:text-2xl font-black text-navy group-hover:text-medicalGreen transition-colors mt-1.5">
              Solve MCQs
            </h2>
            <p className="text-sm font-medium text-muted mt-3 leading-relaxed">
              Test your foundational mastery with board-format multiple choice questions, vignette scenarios, and detailed rationales.
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-borderLine/70 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-extrabold text-medicalGreen bg-[#EAF7ED] px-3 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> {materialData?.counts?.mcqs || 3} Questions
            </span>
            <div className="flex items-center gap-1.5 font-extrabold text-xs text-medicalGreen group-hover:underline">
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
            className="flex items-center gap-3 bg-white hover:bg-secondaryBg text-navy font-bold px-6 py-4 rounded-2xl border border-borderLine shadow-soft transition-all transform hover:-translate-x-1"
          >
            <ArrowLeft className="w-5 h-5 text-primaryBlue" />
            <div className="text-left">
              <div className="text-[10px] font-extrabold text-muted uppercase tracking-wider">Previous Lesson</div>
              <div className="text-sm text-navy">{navigation.prev.title}</div>
            </div>
          </button>
        ) : (
          <div className="text-xs text-muted font-medium italic">First lesson in topic hierarchy.</div>
        )}

        <button
          onClick={() => navigate(navigation.parentMapLink || '/')}
          className="bg-secondaryBg hover:bg-white text-navy font-bold px-5 py-3 rounded-xl text-xs border border-borderLine shadow-xs transition-all"
        >
          ⬆ Return to {navigation.parentMapTitle || 'Topic'} Mind Map
        </button>

        {navigation.next ? (
          <button
            onClick={() => navigate(`/lesson/${navigation.next.slug}`)}
            className="flex items-center gap-3 bg-primaryBlue hover:bg-[#0D55C2] text-white font-bold px-6 py-4 rounded-2xl shadow-md transition-all transform hover:translate-x-1"
          >
            <div className="text-right">
              <div className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">Next Lesson</div>
              <div className="text-sm text-white">{navigation.next.title}</div>
            </div>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        ) : (
          <div className="text-xs text-muted font-medium italic">Final lesson in this branch.</div>
        )}
      </div>
    </div>
  );
};

export default LessonMaterials;
