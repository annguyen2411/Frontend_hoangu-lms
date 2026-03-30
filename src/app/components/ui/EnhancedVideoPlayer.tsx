import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, Rewind, FastForward, 
  Settings, Subtitles, Repeat, PictureInPicture2, RotateCcw, ListRestart,
  SkipBack, SkipForward, ChevronDown
} from 'lucide-react';

interface TranscriptLine {
  start: number;
  end: number;
  text: string;
  pinyin?: string;
  translation?: string;
}

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
  transcript?: TranscriptLine[];
  onTranscriptClick?: (time: number) => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export function EnhancedVideoPlayer({ 
  src, videoId, poster, title, onProgress, onProgressSeconds, 
  onComplete, autoplay = false, startTime = 0, transcript = [], onTranscriptClick
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'segment'>('none');
  const [repeatStart, setRepeatStart] = useState<number | null>(null);
  const [repeatEnd, setRepeatEnd] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const hideControlsTimeout = useRef<NodeJS.Timeout>();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!videoId) return;
    
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
            if (repeatMode === 'one') {
              playerRef.current?.seekTo(0, true);
              playerRef.current?.playVideo();
            } else {
              setIsPlaying(false);
              onComplete?.();
            }
          }
        },
      },
    });
  };

  useEffect(() => {
    if (!playerRef.current || !videoId) return;
    
    const interval = setInterval(() => {
      try {
        if (playerRef.current && playerRef.current.getCurrentTime) {
          const time = playerRef.current.getCurrentTime();
          const dur = playerRef.current.getDuration();
          setCurrentTime(time);
          setDuration(dur);
          
          if (repeatMode === 'segment' && repeatStart !== null && repeatEnd !== null) {
            if (time >= repeatEnd) {
              playerRef.current.seekTo(repeatStart, true);
            }
          }
          
          if (dur > 0) {
            onProgress?.((time / dur) * 100);
            onProgressSeconds?.(time);
            setBuffered(100);
          }
        }
      } catch (e) {}
    }, 500);

    return () => clearInterval(interval);
  }, [videoId, onProgress, onProgressSeconds, repeatMode, repeatStart, repeatEnd]);

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

  const toggleFullscreen = async () => {
    const container = document.getElementById('video-container');
    if (!container) return;
    
    if (!isFullscreen) {
      await container.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const togglePiP = async () => {
    const videoElement = containerRef.current?.querySelector('video');
    if (!videoElement && !document.pictureInPictureEnabled) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoElement) {
        await videoElement.requestPictureInPicture();
      } else if (playerRef.current?.getIframe()) {
        await playerRef.current.getIframe().requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(speed);
    }
    setShowSpeedMenu(false);
  };

  const skip = (seconds: number) => {
    if (playerRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const setRepeatSegment = () => {
    if (repeatStart === null) {
      setRepeatStart(currentTime);
    } else if (repeatEnd === null) {
      const end = currentTime > repeatStart ? currentTime : repeatStart;
      setRepeatEnd(end);
      setRepeatMode('segment');
    } else {
      setRepeatStart(null);
      setRepeatEnd(null);
      setRepeatMode('none');
    }
  };

  const replaySegment = () => {
    if (repeatStart !== null) {
      playerRef.current?.seekTo(repeatStart, true);
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

  const handleTranscriptLineClick = (time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
    onTranscriptClick?.(time);
  };

  const getCurrentTranscriptLine = () => {
    if (!transcript.length) return null;
    return transcript.find(t => currentTime >= t.start && currentTime <= t.end);
  };

  const currentTranscript = getCurrentTranscriptLine();

  const renderYouTubePlayer = () => (
    <div 
      id="video-container"
      ref={containerRef}
      className="relative bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="aspect-video">
        <div id="youtube-player" className="w-full h-full"></div>
      </div>

      {/* Transcript Overlay */}
      {showTranscript && transcript.length > 0 && (
        <div className="absolute top-0 left-0 right-0 bottom-24 bg-black/80 overflow-y-auto p-4">
          <div className="space-y-2 max-w-2xl mx-auto">
            {transcript.map((line, i) => (
              <button
                key={i}
                onClick={() => handleTranscriptLineClick(line.start)}
                className={`block w-full text-left p-2 rounded transition-colors ${
                  currentTime >= line.start && currentTime <= line.end
                    ? 'bg-purple-500/30 text-white'
                    : 'text-white/60 hover:bg-white/10'
                }`}
              >
                <span className="text-xs text-purple-400 mr-2">[{formatTime(line.start)}]</span>
                <span className="font-medium">{line.text}</span>
                {line.pinyin && <span className="block text-xs text-white/50 mt-1">{line.pinyin}</span>}
                {line.translation && <span className="block text-xs text-white/40 mt-1">{line.translation}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Progress bar */}
        <div 
          className="relative h-1.5 bg-white/20 rounded-full mb-3 cursor-pointer group/progress"
          onClick={handleSeek}
        >
          <div className="absolute h-full bg-white/30 rounded-full" style={{ width: `${buffered}%` }} />
          <div className="absolute h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
          <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity shadow-lg" style={{ left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 6px)` }} />
          
          {/* Repeat indicator */}
          {repeatMode === 'segment' && repeatStart !== null && repeatEnd !== null && (
            <div 
              className="absolute h-full bg-yellow-500/50"
              style={{
                left: `${(repeatStart / duration) * 100}%`,
                width: `${((repeatEnd - repeatStart) / duration) * 100}%`
              }}
            />
          )}
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button onClick={() => skip(-10)} className="p-2 rounded hover:bg-white/20 text-white/80 transition-colors" title="Lùi 10s">
              <Rewind className="h-4 w-4" />
            </button>
            <button onClick={togglePlay} className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors" title={isPlaying ? 'Tạm dừng' : 'Phát'}>
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={() => skip(10)} className="p-2 rounded hover:bg-white/20 text-white/80 transition-colors" title="Tiến 10s">
              <FastForward className="h-4 w-4" />
            </button>
            
            {/* Repeat controls */}
            <div className="relative ml-1">
              <button 
                onClick={() => setRepeatMode(repeatMode === 'none' ? 'one' : repeatMode === 'one' ? 'segment' : 'none')}
                className={`p-2 rounded transition-colors ${repeatMode !== 'none' ? 'bg-yellow-500/30 text-yellow-400' : 'hover:bg-white/20 text-white/80'}`}
                title={repeatMode === 'none' ? 'Bật lặp lại' : repeatMode === 'one' ? 'Lặp 1 bài' : 'Lặp đoạn'}
              >
                <Repeat className={`h-4 w-4 ${repeatMode === 'one' ? 'animate-pulse' : ''}`} />
              </button>
              {repeatMode === 'segment' && (
                <div className="absolute bottom-full left-0 mb-2 bg-slate-800 rounded-lg p-2 text-xs text-white/80 shadow-xl">
                  <div>Start: {repeatStart !== null ? formatTime(repeatStart) : '--:--'}</div>
                  <div>End: {repeatEnd !== null ? formatTime(repeatEnd) : '--:--'}</div>
                  <button onClick={setRepeatSegment} className="mt-1 text-yellow-400 hover:underline">Đặt lại</button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-2">
              <button onClick={toggleMute} className="p-2 rounded hover:bg-white/20 text-white/80 transition-colors">
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

            <span className="text-white/80 text-xs ml-3 font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Speed control */}
            <div className="relative">
              <button 
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="p-2 rounded hover:bg-white/20 text-white/80 transition-colors flex items-center gap-1 text-sm"
              >
                {playbackSpeed}x <ChevronDown className="h-3 w-3" />
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 bg-slate-800 rounded-lg shadow-xl overflow-hidden">
                  {PLAYBACK_SPEEDS.map(speed => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`block w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors ${
                        playbackSpeed === speed ? 'bg-purple-500/30 text-purple-400' : 'text-white'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Transcript toggle */}
            {transcript.length > 0 && (
              <button 
                onClick={() => setShowTranscript(!showTranscript)}
                className={`p-2 rounded transition-colors ${showTranscript ? 'bg-purple-500/30 text-purple-400' : 'hover:bg-white/20 text-white/80'}`}
                title="Transcript"
              >
                <Subtitles className="h-4 w-4" />
              </button>
            )}

            {/* PiP */}
            <button 
              onClick={togglePiP}
              className="p-2 rounded hover:bg-white/20 text-white/80 transition-colors"
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="h-4 w-4" />
            </button>

            {/* Fullscreen */}
            <button onClick={toggleFullscreen} className="p-2 rounded hover:bg-white/20 text-white/80 transition-colors" title="Toàn màn hình">
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Current transcript display */}
        {currentTranscript && !showTranscript && (
          <div className="mt-3 text-center">
            <p className="text-white font-medium text-lg">{currentTranscript.text}</p>
            {currentTranscript.pinyin && (
              <p className="text-white/60 text-sm mt-1">{currentTranscript.pinyin}</p>
            )}
            {currentTranscript.translation && (
              <p className="text-purple-400 text-sm mt-1">{currentTranscript.translation}</p>
            )}
          </div>
        )}
      </div>

      {/* Title overlay */}
      {title && !showTranscript && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
          <p className="text-white font-medium text-sm">{title}</p>
        </div>
      )}
    </div>
  );

  if (videoId) {
    return renderYouTubePlayer();
  }

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
          ref={containerRef as any}
        />
      ) : (
        <div className="w-full aspect-video bg-slate-800 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/60">Chưa có video</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}
