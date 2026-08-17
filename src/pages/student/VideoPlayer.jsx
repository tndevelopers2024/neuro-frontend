import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Play, Pause, RotateCcw, RotateCw, CheckCircle, FileText, ArrowLeft, Send, Sparkles, Volume2, VolumeX, Maximize2, Video, Clock, Volume1, MessageCircle } from 'lucide-react';
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
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const controlsTimeoutRef = useRef(null);
  const playerContainerRef = useRef(null);
  const hasResumed = useRef(false);

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
        if (videoRef.current && videoRef.current.readyState >= 1 && !hasResumed.current) {
          hasResumed.current = true;
          videoRef.current.currentTime = bestPos;
          toast.success(`⏳ Automatically resumed video where you left off at ${formatTime(bestPos)}!`, { icon: '🚀', duration: 5000 });
          videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
        }
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

      if (pct >= 90 && progress < 90) {
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
    } catch (error) {
      toast.error('Failed to preserve note. Please try again.');
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await api.post('/comments', {
        materialId: id,
        content: commentText
      });
      toast.success('Your message has been securely sent to the administrators.', { icon: '📨' });
      setCommentText('');
    } catch (error) {
      toast.error('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center font-bold text-navy flex flex-col items-center gap-3">
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
          className="flex items-center gap-2 text-sm font-semibold text-primaryBlue hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Lesson Materials
        </button>
        <span className="bg-[#7435D5]/15 text-[#7435D5] text-xs font-semibold px-3.5 py-1 rounded-full uppercase tracking-wider">
          Visual Video Module
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Screen (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-black rounded-xl overflow-hidden shadow-elevated border border-borderLine relative group aspect-video flex items-center justify-center">
            {ytVideoId ? (
              <div id="youtube-native-player" className="w-full h-full aspect-video border-0"></div>
            ) : (
              <div 
                ref={playerContainerRef}
                className="w-full h-full relative group bg-black"
                onMouseMove={() => {
                  setShowControls(true);
                  if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
                  if (isPlaying) {
                    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
                  }
                }}
                onMouseLeave={() => isPlaying && setShowControls(false)}
              >
                <video
                  ref={videoRef}
                  src={material?.videoUrl}
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                  onTimeUpdate={() => {
                    if (videoRef.current) setVideoCurrentTime(videoRef.current.currentTime);
                  }}
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      setVideoDuration(videoRef.current.duration);
                      if (resumedTime > 3 && !hasResumed.current) {
                        hasResumed.current = true;
                        videoRef.current.currentTime = resumedTime;
                        toast.success(`⏳ Automatically resumed video where you left off at ${formatTime(resumedTime)}!`, { icon: '🚀', duration: 5000 });
                        videoRef.current.play().catch(e => console.log('Autoplay blocked:', e));
                      }
                    }
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) videoRef.current.pause();
                      else videoRef.current.play();
                    }
                  }}
                  className="w-full h-full object-contain cursor-pointer"
                />
                
                {/* Custom Controls Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                  
                  {/* Progress Bar */}
                  <div 
                    className="w-full h-1.5 bg-white/20 rounded-full cursor-pointer relative group/progress"
                    onClick={(e) => {
                      if (!videoRef.current || !videoDuration) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      const pos = (e.clientX - rect.left) / rect.width;
                      videoRef.current.currentTime = pos * videoDuration;
                    }}
                  >
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-primaryBlue rounded-full"
                      style={{ width: `${(videoCurrentTime / videoDuration) * 100 || 0}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow blur-0 scale-0 group-hover/progress:scale-100 transition-transform origin-center"
                      style={{ left: `calc(${(videoCurrentTime / videoDuration) * 100 || 0}% - 6px)` }}
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          if (videoRef.current) {
                            if (isPlaying) videoRef.current.pause();
                            else videoRef.current.play();
                          }
                        }}
                        className="text-white hover:text-primaryBlue transition-colors focus:outline-none"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                      </button>
                      
                      {/* Volume Control */}
                      <div className="flex items-center gap-2 group/volume">
                        <button 
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.muted = !isMuted;
                              setIsMuted(!isMuted);
                            }
                          }}
                          className="text-white hover:text-primaryBlue transition-colors focus:outline-none"
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : volume < 0.5 ? <Volume1 className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                        </button>
                        <input 
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setVolume(val);
                            if (val > 0) setIsMuted(false);
                            if (videoRef.current) {
                              videoRef.current.volume = val;
                              videoRef.current.muted = (val === 0);
                            }
                          }}
                          className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 h-1.5 accent-primaryBlue cursor-pointer"
                        />
                      </div>

                      <span className="text-white/90 text-xs font-semibold font-mono ml-2">
                        {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          if (!playerContainerRef.current) return;
                          if (!document.fullscreenElement) {
                            playerContainerRef.current.requestFullscreen().catch(err => console.log(err));
                            setIsFullscreen(true);
                          } else {
                            document.exitFullscreen();
                            setIsFullscreen(false);
                          }
                        }}
                        className="text-white hover:text-primaryBlue transition-colors focus:outline-none"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>


          <div className="bg-white border border-borderLine rounded-xl p-6 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl md:text-2xl font-bold text-navy flex items-center gap-2.5">
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

          <div className="bg-white border border-borderLine rounded-xl p-6 shadow-soft mt-6">
             <div className="flex items-center gap-2 mb-3">
               <MessageCircle className="w-5 h-5 text-primaryBlue" />
               <h3 className="text-lg font-bold text-navy">Ask a Question / Leave a Comment</h3>
             </div>
             <p className="text-xs font-medium text-muted mb-4">
               Have a question about this video? Submit your query here. Your message is private and goes directly to the faculty administrators.
             </p>
             <div className="flex flex-col gap-3">
               <textarea
                 value={commentText}
                 onChange={(e) => setCommentText(e.target.value)}
                 rows={3}
                 placeholder="Type your question or comment here..."
                 className="w-full p-4 rounded-xl bg-secondaryBg border border-borderLine font-medium text-sm text-navy outline-none resize-none focus:bg-white focus:border-primaryBlue transition-all"
               />
               <button
                 onClick={handleSubmitComment}
                 disabled={isSubmittingComment || !commentText.trim()}
                 className="self-end btn-primary text-xs px-6 py-2.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isSubmittingComment ? 'Sending...' : 'Send to Administrators'}
               </button>
             </div>
          </div>
        </div>

        {/* Synchronized Resident Private Study Notes Sidebar (1 col) */}
        <div className="bg-white border border-borderLine rounded-xl p-6 shadow-soft flex flex-col justify-between h-[580px] lg:h-auto">
          <div>
            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-borderLine">
              <FileText className="w-5 h-5 text-primaryBlue" />
              <h3 className="text-base font-semibold text-navy">Resident Study Vault</h3>
            </div>
            <p className="text-xs font-medium text-muted mb-4">
              Take private clinical reflections or timestamp notes while watching. Your notes are synchronized and accessible in your <strong>My Notes</strong> drawer.
            </p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={12}
              placeholder="Take notes here..."
              className="w-full p-4 rounded-lg bg-secondaryBg border border-borderLine font-medium text-sm text-navy placeholder:text-muted/70 focus:bg-white focus:border-primaryBlue outline-none resize-none shadow-inner/50"
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
