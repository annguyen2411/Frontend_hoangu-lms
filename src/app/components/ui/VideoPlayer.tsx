import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Rewind, FastForward, Youtube } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  videoId?: string;
  poster?: string;
  title?: string;
  onProgress?: (progress: number) => void;
  onProgressSeconds?: (seconds: number) => void;
  onComplete?: () => void;
  autoplay?: boolean;
  startTime?: number;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function VideoPlayer({ src, videoId, poster, title, onProgress, onProgressSeconds, onComplete, autoplay = false, startTime = 0 }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const playerRef = useRef<any>(null);

  // YouTube player ready
  useEffect(() => {
    if (!videoId) return;
    
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    const checkYT = setInterval(() => {
      if (window.YT) {
        clearInterval(checkYT);
        initYouTubePlayer();
      }
    }, 100);

    return () => clearInterval(checkYT);
  }, [videoId]);

  const initYouTubePlayer = () => {
    if (!videoId || playerRef.current) return;
    
    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: autoplay ? 1 : 0,
        controls: 0,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: (event: any) => {
          setDuration(event.target.getDuration());
          if (startTime > 0) {
            event.target.seekTo(startTime, true);
          }
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            onComplete?.();
          }
        },
      },
    });
  };

  // Update time for YouTube
  useEffect(() => {
    if (!playerRef.current || !videoId) return;
    
    const interval = setInterval(() => {
      try {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          setCurrentTime(time);
          setDuration(dur);
          if (dur > 0) {
            onProgress?.((time / dur) * 100);
            onProgressSeconds?.(time);
            setBuffered(100);
          }
        }
      } catch (e) {}
    }, 1000);

    return () => clearInterval(interval);
  }, [videoId, onProgress, onProgressSeconds]);

  const togglePlay = useCallback(() => {
    if (playerRef.current && videoId) {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, videoId]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!playerRef.current || !duration || !videoId) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    playerRef.current.seekTo(newTime, true);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setVolume(value);
    if (playerRef.current) {
      playerRef.current.setVolume(value * 100);
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume * 100);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    }
  };

  const toggleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (!container) return;
    
    if (!isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const skip = (seconds: number) => {
    if (playerRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Render YouTube embed
  if (videoId) {
    return (
      <div 
        id="video-container"
        className="relative bg-black rounded-lg overflow-hidden group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        <div className="aspect-video">
          <div id="youtube-player" className="w-full h-full"></div>
        </div>

        {/* Custom Controls Overlay */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Progress bar */}
          <div 
            className="relative h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/progress"
            onClick={handleSeek}
          >
            <div className="absolute h-full bg-white/30 rounded-full" style={{ width: `${buffered}%` }} />
            <div className="absolute h-full bg-purple-500 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" style={{ left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 6px)` }} />
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => skip(-10)} className="p-1.5 rounded hover:bg-white/20 text-white/80">
                <Rewind className="h-4 w-4" />
              </button>
              <button onClick={togglePlay} className="p-2 rounded hover:bg-white/20 text-white">
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
              <button onClick={() => skip(10)} className="p-1.5 rounded hover:bg-white/20 text-white/80">
                <FastForward className="h-4 w-4" />
              </button>
              
              <div className="flex items-center gap-1 ml-2">
                <button onClick={toggleMute} className="p-1.5 rounded hover:bg-white/20 text-white/80">
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>

              <span className="text-white/80 text-xs ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleFullscreen} className="p-1.5 rounded hover:bg-white/20 text-white/80">
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Title overlay */}
        {title && (
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <p className="text-white font-medium text-sm">{title}</p>
          </div>
        )}
      </div>
    );
  }

  // Render local video or placeholder
  return (
    <div 
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {src ? (
        <video
          src={src}
          poster={poster}
          className="w-full aspect-video"
          onClick={togglePlay}
        />
      ) : (
        <div className="w-full aspect-video bg-slate-800 flex items-center justify-center">
          <div className="text-center">
            <Youtube className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-white/60">Chưa có video</p>
            <p className="text-white/40 text-sm">Thêm YouTube video ID hoặc file video</p>
          </div>
        </div>
      )}

      {!src && !videoId && (
        <button 
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center hover:scale-110 transition-transform">
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </button>
      )}
    </div>
  );
}

// YouTube helper function
export function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}