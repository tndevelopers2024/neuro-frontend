import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, FileText, Clock, ArrowLeft, ArrowRight, Layers, Download, Sparkles, Video, BookOpen, CheckCircle2 } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';
import NeonBrainLoader from '../../components/common/NeonBrainLoader.jsx';

const MaterialPlaylist = () => {
  const { type, topicSlug } = useParams();
  const navigate = useNavigate();

  // Fetch all topic materials
  const { data: materialData, isLoading } = useQuery({
    queryKey: ['topicMaterials', topicSlug],
    queryFn: () => api.get(`/materials/topic/${topicSlug}`),
    staleTime: 5 * 60 * 1000,
    enabled: !!topicSlug,
  });

  const isVideo = type === 'video' || type === 'videos';

  const formattedTitle = useMemo(() => {
    if (!topicSlug) return '';
    return topicSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }, [topicSlug]);

  const topic = materialData?.topic || {
    title: formattedTitle,
    description: `Comprehensive clinical study modules and lecture materials on ${formattedTitle}.`,
  };

  const allMaterials = materialData?.materials || [];

  // Filter based on requested media type
  const filteredMaterials = useMemo(() => {
    if (isVideo) {
      return allMaterials.filter(m => m.type === 'VIDEO');
    } else {
      return allMaterials.filter(m => m.type === 'NOTES' || m.type === 'PDF' || m.type === 'DOCUMENT');
    }
  }, [allMaterials, isVideo]);

  const breadcrumbs = [
    { title: 'Home', link: '/' },
    { title: 'Study Modules', link: '/' },
    { title: topic.title, link: `/lesson/${topicSlug}` },
    { title: isVideo ? 'Video Playlist' : 'Study Documents' },
  ];

  if (isLoading && !materialData) {
    return <NeonBrainLoader text={`Loading ${isVideo ? 'Video Lectures' : 'Study Notes'} for ${topic.title}...`} />;
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16 max-w-6xl mx-auto">
      <Breadcrumb items={breadcrumbs} />

      {/* Hero Header */}
      <div className={`bg-white border border-borderLine border-t-[8px] ${isVideo ? 'border-t-[#7435D5]' : 'border-t-primaryBlue'} rounded-xl p-7 lg:p-9 shadow-soft relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#7435D5]/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-xs ${
              isVideo ? 'bg-[#7435D5]/15 text-[#7435D5]' : 'bg-[#E9F2FF] text-primaryBlue'
            }`}>
              {isVideo ? <Video className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
              {isVideo ? 'HD Video Lectures Playlist' : 'Clinical Documents Library'}
            </span>
            <span className="bg-[#EAF7ED] text-medicalGreen text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {filteredMaterials.length} {isVideo ? (filteredMaterials.length === 1 ? 'Lecture Available' : 'Lectures Available') : (filteredMaterials.length === 1 ? 'Document Available' : 'Documents Available')}
            </span>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-bold text-navy tracking-tight">
            {topic.title} - {isVideo ? 'Video Playlist' : 'Study Documents'}
          </h1>
        </div>

        <div className="relative z-10 shrink-0">
          <button
            onClick={() => navigate(`/lesson/${topicSlug}`)}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-secondaryBg hover:bg-white text-navy font-bold text-xs border border-borderLine shadow-xs transition-all transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="w-4 h-4 text-primaryBlue" />
            <span>Back to Module Overview</span>
          </button>
        </div>
      </div>

      {/* Playlist Grid / List */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider px-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primaryBlue" />
          <span>Available {isVideo ? 'Video Lectures' : 'Study Materials'}</span>
        </h2>

        <div className="space-y-4">
          {filteredMaterials.length === 0 ? (
            <div className="bg-white border border-borderLine rounded-lg p-8 text-center shadow-soft">
              <p className="text-muted font-medium">No {isVideo ? 'video lectures' : 'study documents'} available for this topic yet.</p>
            </div>
          ) : filteredMaterials.map((item, idx) => (
            <div
              key={item._id || idx}
              onClick={() => navigate(isVideo ? `/video/${item._id}` : `/notes/${item._id}`)}
              className="bg-white border border-borderLine hover:border-transparent rounded-lg p-6 sm:p-7 shadow-soft hover:shadow-elevated transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6 group"
            >
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center shrink-0 font-bold text-lg shadow-inner transition-all duration-300 ${
                  isVideo 
                    ? 'bg-[#7435D5]/15 text-[#7435D5] group-hover:bg-[#7435D5] group-hover:text-white' 
                    : 'bg-[#E9F2FF] text-primaryBlue group-hover:bg-primaryBlue group-hover:text-white'
                }`}>
                  {isVideo ? <Play className="w-7 h-7 fill-current translate-x-0.5" /> : <FileText className="w-7 h-7" />}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold text-muted uppercase tracking-wider bg-secondaryBg px-2.5 py-0.5 rounded-md border border-borderLine/80">
                      Module {idx + 1}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-md ${
                      isVideo ? 'text-[#7435D5] bg-[#7435D5]/10' : 'text-primaryBlue bg-[#E9F2FF]'
                    }`}>
                      {isVideo ? <Clock className="w-3 h-3" /> : <></>}
                      {isVideo ? (item.duration || 'Unknown duration') : (item.type || 'Document')}
                    </span>
                    {isVideo && item.videoUrl && item.videoUrl.includes('youtube') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E62E2E] bg-[#E62E2E]/10 px-2.5 py-0.5 rounded-md">
                        YouTube HD Stream
                      </span>
                    )}
                  </div>

                  <h3 className={`text-lg sm:text-xl font-bold text-navy transition-colors ${
                    isVideo ? 'group-hover:text-[#7435D5]' : 'group-hover:text-primaryBlue'
                  }`}>
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-medium text-muted leading-relaxed max-w-3xl line-clamp-2">
                    {item.description || 'No description available for this material.'}
                  </p>

                  {isVideo && item.progressPercentage !== undefined && (
                    <div className="mt-4 max-w-md">
                      <div className="flex justify-between text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
                        <span>{item.progressPercentage === 100 ? 'Completed' : `${item.progressPercentage}% Completed`}</span>
                      </div>
                      <div className="w-full bg-secondaryBg border border-borderLine rounded-full h-2 overflow-hidden shadow-inner">
                        <div 
                          className={`${isVideo ? 'bg-[#7435D5]' : 'bg-primaryBlue'} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${item.progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 border-borderLine/60">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(isVideo ? `/video/${item._id}` : `/notes/${item._id}`);
                  }}
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-xs text-white shadow-md transition-all transform group-hover:scale-105 ${
                    isVideo ? 'bg-[#7435D5] hover:bg-[#5E25B2]' : 'bg-primaryBlue hover:bg-[#0F56C4]'
                  }`}
                >
                  {isVideo ? <Play className="w-4 h-4 fill-current" /> : <FileText className="w-4 h-4" />}
                  <span>{isVideo ? 'Stream Lecture' : 'Open Reader'}</span>
                  <ArrowRight className="w-4 h-4 ml-0.5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="pt-6 mt-8 border-t border-borderLine flex items-center justify-between">
        <button
          onClick={() => navigate(`/lesson/${topicSlug}`)}
          className="flex items-center gap-2 text-xs font-semibold text-primaryBlue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to {topic.title} Learning Cards</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="btn-secondary text-xs px-5 py-2.5"
        >
          Study Modules Home
        </button>
      </div>
    </div>
  );
};

export default MaterialPlaylist;
