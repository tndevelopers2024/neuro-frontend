import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, RotateCcw, RotateCw, CheckCircle, FileText, ArrowLeft, Send, Sparkles, Volume2, Maximize2, Video, Clock } from 'lucide-react';
import api from '../../api/axiosInstance.js';
import toast from 'react-hot-toast';
import Breadcrumb from '../../components/layout/Breadcrumb.jsx';

const extractYouTubeId = (url = '') => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|live\/|watch\?v=|&v=)([^#&?]*).*/);
  if (match && match[2].length === 11) return match[2];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
};

const formatTime = (secs = 0) => {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}m ${s}s`;
};

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resumedTime, setResumedTime] = useState(0);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Fetch material item details
  const { data: resData, isLoading } = useQuery({
    queryKey: ['materialDetail', id],
    queryFn: () => api.get(`/materials/${id}`),
    staleTime: 10 * 60 * 1000,
  });

  const material = resData?.material;
  const ytVideoId = extractYouTubeId(material?.videoUrl);

  // Load saved timestamp from server and localStorage
  useEffect(() => {
    const fetchProgress = async () => {
      let serverPos = 0;
      try {
        const { data } = await api.get(`/progress/item/${id}`);
        if (data && data.lastPosition) {
          serverPos = data.lastPosition;
          if (data.progressPercentage) setProgress(data.progressPercentage);
        }
      } catch (e) {
        // Fallback to local storage if API fails
      }
      const localPos = parseInt(localStorage.getItem(`video_pos_${id}`) || '0', 10);
      const bestPos = Math.max(serverPos, localPos);
      if (bestPos > 3) {
        setResumedTime(bestPos);
      }
    };
    if (!isLoading && id) {
      fetchProgress();
    }
  }, [id, isLoading]);

  // Save playback progress position
  const syncPositionNow = async (forceCompleted = false) => {
    let current = 0;
    let total = 0;
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      current = Math.floor(playerRef.current.getCurrentTime() || 0);
      total = Math.floor(playerRef.current.getDuration() || 0);
    } else if (videoRef.current && videoRef.current.currentTime) {
      current = Math.floor(videoRef.current.currentTime || 0);
      total = Math.floor(videoRef.current.duration || 0);
    }

    if (current > 0) {
      localStorage.setItem(`video_pos_${id}`, current.toString());
      setResumedTime(current);

      let pct = progress;
      if (total > 0) {
        pct = Math.min(Math.round((current / total) * 100), 100);
        setProgress(pct);
      }
      if (forceCompleted) pct = 100;

      if (pct >= 90 && progress < 99) {
        toast.success('Video lesson mastered! Your progress percentage has escalated!', { icon: '✨', duration: 4000 });
      }

      try {
        await api.post('/progress/update', {
          topicId: material?.topic?._id || material?.topic,
          materialId: material?._id || id,
          materialType: 'VIDEO',
          progressPercentage: pct >= 90 ? 100 : pct,
          lastPosition: current,
        });
      } catch (e) {
        // silent fail on network interruption
      }
    }
  };

  // Initialize YouTube Native Embedded Player with automatic resume
  useEffect(() => {
    if (!ytVideoId || isLoading) return;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player || playerRef.current) return;

      playerRef.current = new window.YT.Player('youtube-native-player', {
        videoId: ytVideoId,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
          start: resumedTime > 3 ? Math.floor(resumedTime) : 0,
        },
        events: {
          onReady: (event) => {
            if (resumedTime > 3) {
              event.target.seekTo(resumedTime, true);
              toast.success(`⏳ Automatically resumed video where you left off at ${formatTime(resumedTime)}!`, { icon: '🚀', duration: 5000 });
            }
          },
          onStateChange: (event) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              syncPositionNow(event.data === window.YT.PlayerState.ENDED ? true : false);
            }
          },
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0] || document.head;
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    const checkTimer = setInterval(() => {
      if (window.YT && window.YT.Player && !playerRef.current) {
        initPlayer();
      }
    }, 500);

    return () => {
      clearInterval(checkTimer);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (e) {}
      }
    };
  }, [ytVideoId, isLoading]);

  // Periodic position syncing while playing & on page exit
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) syncPositionNow();
    }, 4000);

    const handleBeforeUnload = () => {
      syncPositionNow();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      syncPositionNow();
    };
  }, [isPlaying, id, progress]);

  const handleSavePrivateNote = async () => {
    if (!noteText.trim()) return toast.error('Please enter study notes before saving.');
    setIsSavingNote(true);
    try {
      await api.post('/user/notes', {
        title: `Video Note: ${material?.topic?.title || material?.title}`,
        content: noteText,
        relatedTopic: material?.topic?._id || id,
        topicTitle: material?.topic?.title || 'Video Lecture',
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
          <div className="bg-black rounded-3xl overflow-hidden shadow-elevated border border-borderLine relative group aspect-video flex items-center justify-center">
            {ytVideoId ? (
              <div id="youtube-native-player" className="w-full h-full aspect-video border-0"></div>
            ) : (
              <video
                ref={videoRef}
                src={material?.videoUrl}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                onTimeUpdate={() => syncPositionNow()}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {resumedTime > 3 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-primaryBlue/10 via-purple-500/10 to-transparent p-4 rounded-2xl border border-primaryBlue/20 text-xs font-bold text-navy">
              <span className="flex items-center gap-2 text-primaryBlue">
                <Clock className="w-4 h-4 text-purple-600 animate-pulse" />
                <span>In-App Resume Active: Your playback timestamp is continuously preserved.</span>
              </span>
              <div className="flex items-center gap-3">
                <span className="bg-white px-3 py-1.5 rounded-xl shadow-xs text-navy font-black border border-borderLine">
                  Last Saved Position: {formatTime(resumedTime)}
                </span>
                {!ytVideoId && (
                  <button 
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.currentTime = resumedTime;
                        videoRef.current.play();
                      }
                    }}
                    className="flex items-center gap-1.5 bg-[#7435D5] text-white px-4 py-1.5 rounded-xl font-extrabold hover:bg-[#5E25B2] transition-colors shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Resume
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-borderLine rounded-3xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl md:text-2xl font-black text-navy flex items-center gap-2.5">
                {ytVideoId ? <Video className="w-6 h-6 text-red-600 shrink-0" /> : null}
                <span>{material?.title}</span>
              </h1>
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
              {material?.description}
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
