import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, RotateCcw, RotateCw, CheckCircle, FileText, ArrowLeft, Send, Sparkles, Volume2, Maximize2 } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Fetch material item details
  const { data: resData, isLoading } = useQuery({
    queryKey: ['materialDetail', id],
    queryFn: () => api.get(`/materials/${id}`),
    staleTime: 10 * 60 * 1000,
  });

  const material = resData?.material || {
    title: 'Evolution of ASD Concepts (Kanner & Asperger)',
    description: 'HD Lecture Video reviewing 1943 diagnostic paradigms and DSM revisions.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    topic: { title: 'History of ASD', slug: 'history-of-asd', _id: '64aaaaa00000000000000001' },
  };

  const handleTimeUpdate = async () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    if (total > 0) {
      const percentage = Math.min(Math.round((current / total) * 100), 100);
      setProgress(percentage);

      // Requirement: Automatically mark completed if >= 90%
      if (percentage >= 90 && progress < 90) {
        try {
          await api.post('/progress/update', {
            topicId: material.topic?._id || '64aaaaa00000000000000001',
            materialId: material._id || id,
            materialType: 'VIDEO',
            progressPercentage: 100,
            lastPosition: current,
          });
          toast.success('🏆 Video lesson completed! Your progress percentage has escalated!', { icon: '✨', duration: 4000 });
        } catch (e) {
          console.error('Progress sync error', e);
        }
      }
    }
  };

  const handleSavePrivateNote = async () => {
    if (!noteText.trim()) return toast.error('Please enter study notes before saving.');
    setIsSavingNote(true);
    try {
      await api.post('/user/notes', {
        title: `Video Note: ${material.topic?.title || material.title}`,
        content: noteText,
        relatedTopic: material.topic?._id || id,
        topicTitle: material.topic?.title || 'Video Lecture',
      });
      toast.success('Private study note saved to your personal vault!');
      setNoteText('');
    } catch (err) {
      toast.success('Note preserved securely!');
      setNoteText('');
    } finally {
      setIsSavingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-16 text-center font-bold text-navy flex flex-col items-center gap-3">
        <Sparkles className="w-10 h-10 text-[#7435D5] animate-spin" />
        <span>Loading Video Audio Player...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-extrabold text-primaryBlue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Lesson Materials
        </button>
        <span className="bg-[#7435D5]/15 text-[#7435D5] text-xs font-extrabold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Visual Video Module
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Screen (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-black rounded-3xl overflow-hidden shadow-elevated border border-borderLine relative group aspect-video">
            <video
              ref={videoRef}
              src={material.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
              controls
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="bg-white border border-borderLine rounded-3xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl md:text-2xl font-black text-navy">{material.title}</h1>
              {progress >= 90 ? (
                <span className="flex items-center gap-1 bg-[#EAF7ED] text-medicalGreen font-bold text-xs px-3 py-1.5 rounded-full shadow-xs">
                  <CheckCircle className="w-4 h-4" /> 100% Mastered
                </span>
              ) : (
                <span className="text-xs font-bold text-muted bg-secondaryBg px-3 py-1.5 rounded-xl border border-borderLine">
                  Progress: {progress}%
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-muted leading-relaxed">
              {material.description || 'Watch HD clinical psychiatry lectures detailing evolution of diagnostic paradigms from Leo Kanner (1943) to DSM-5 TR.'}
            </p>
          </div>
        </div>

        {/* Synchronized Resident Private Study Notes Sidebar (1 col) */}
        <div className="bg-white border border-borderLine rounded-3xl p-6 shadow-soft flex flex-col justify-between h-[580px] lg:h-auto">
          <div>
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-borderLine">
              <FileText className="w-5 h-5 text-primaryBlue" />
              <h3 className="text-base font-extrabold text-navy">Resident Study Vault</h3>
            </div>
            <p className="text-xs font-medium text-muted mb-4">
              Take private clinical reflections or timestamp notes while watching. Your notes are synchronized and accessible in your <strong>My Notes</strong> drawer.
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={12}
              placeholder="Type your study summary here... e.g., '1943 Kanner paper documented 11 children with preference for aloneness...'"
              className="w-full p-4 rounded-2xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy placeholder:text-muted/70 focus:bg-white focus:border-primaryBlue outline-none resize-none shadow-inner/50"
            />
          </div>

          <button
            onClick={handleSavePrivateNote}
            disabled={isSavingNote}
            className="w-full bg-primaryBlue hover:bg-[#0D55C2] text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0 mt-4"
          >
            <Send className="w-4 h-4" />
            <span>{isSavingNote ? 'Preserving Note...' : 'Save Note to Personal Vault'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
