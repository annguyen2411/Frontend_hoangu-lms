import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect, useCallback } from 'react';
import { 
  Play, CheckCircle, Lock, ChevronLeft, ChevronRight, Menu, X, 
  Home, BookOpen, Clock, ArrowLeft, FileText, Bookmark, MessageSquare,
  ListChecks, BookMarked, HelpCircle, Download
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { VideoPlayer } from '../components/ui/VideoPlayer';
import { useCourse, useLessons, useEnrollment, useLessonProgress } from '../hooks/useData';
import { api } from '../../lib/api';

type TabType = 'overview' | 'podcast' | 'exercises' | 'resources';

export function Learn() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { course, loading: courseLoading } = useCourse(slug || '');
  const { lessons, loading: lessonsLoading } = useLessons(course?.id);
  const { enrollment, loading: enrollmentLoading } = useEnrollment(course?.id);
  const { progress: lessonProgress, loading: progressLoading, markCompleted } = useLessonProgress(course?.id);
  
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isPlaying, setIsPlaying] = useState(false);

  const currentLesson = lessons[currentLessonIndex];
  const isLocked = currentLesson ? (!currentLesson.is_free && !enrollment) : false;
  const isCurrentCompleted = currentLesson ? (lessonProgress?.[currentLesson.id]?.is_completed ?? false) : false;
  const currentProgress = currentLesson ? (lessonProgress?.[currentLesson.id]?.watched_seconds ?? 0) : 0;

  const completedLessons = lessonProgress ? Object.values(lessonProgress).filter(p => p.is_completed).length : 0;
  const progress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  const goToLesson = useCallback((index: number) => {
    if (index >= 0 && index < lessons.length) {
      setCurrentLessonIndex(index);
      setIsPlaying(false);
    }
  }, [lessons.length]);

  const handleMarkComplete = useCallback(async () => {
    if (currentLesson && !isCurrentCompleted) {
      await markCompleted(currentLesson.id);
    }
  }, [currentLesson, isCurrentCompleted, markCompleted]);

  const handleVideoProgress = useCallback(async (seconds: number) => {
    if (currentLesson && enrollment) {
      try {
        await api.progress.updateLesson(currentLesson.id, {
          watched_seconds: Math.floor(seconds),
          is_completed: isCurrentCompleted
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
  }, [currentLesson, enrollment, isCurrentCompleted]);

  const handleNext = useCallback(() => {
    if (currentLessonIndex < lessons.length - 1) {
      if (!isCurrentCompleted && currentLesson) {
        markCompleted(currentLesson.id);
      }
      goToLesson(currentLessonIndex + 1);
    }
  }, [currentLessonIndex, lessons.length, isCurrentCompleted, currentLesson, markCompleted, goToLesson]);

  const handlePrev = useCallback(() => {
    if (currentLessonIndex > 0) {
      goToLesson(currentLessonIndex - 1);
    }
  }, [currentLessonIndex, goToLesson]);

  useEffect(() => {
    if (lessonProgress && lessons.length > 0) {
      const completedCount = Object.values(lessonProgress).filter(p => p.is_completed).length;
      if (completedCount < lessons.length) {
        const firstIncomplete = lessons.findIndex(l => !lessonProgress[l.id]?.is_completed);
        if (firstIncomplete !== -1) setCurrentLessonIndex(firstIncomplete);
      }
    }
  }, [lessonProgress, lessons]);

  const tabs = [
    { id: 'overview' as TabType, label: 'Tổng quan', icon: BookOpen },
    { id: 'podcast' as TabType, label: 'Podcast', icon: MessageSquare },
    { id: 'exercises' as TabType, label: 'Bài tập', icon: ListChecks },
    { id: 'resources' as TabType, label: 'Tài nguyên', icon: Download },
  ];

  if (courseLoading || lessonsLoading || enrollmentLoading || progressLoading) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/70 text-sm">Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-10 w-10 text-white/30 mx-auto mb-3" />
          <h1 className="text-white font-semibold text-lg">Không tìm thấy</h1>
          <Link to="/courses" className="text-purple-400 text-sm">Quay lại</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-200 bg-slate-950 border-r border-white/10 flex-shrink-0`}>
        <div className="w-64 h-full flex flex-col">
          {/* Header */}
          <div className="p-3 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-2">
              <Link to={`/courses/${slug}`} className="text-white/40 hover:text-white text-xs flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Exit
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-white/30 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-white font-semibold text-sm line-clamp-2">{course.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-purple-400 text-xs">{progress}%</span>
            </div>
          </div>

          {/* Current Lesson */}
          <div className="p-3 bg-purple-500/10 border-b border-white/10 flex-shrink-0">
            <p className="text-white/40 text-xs mb-1">Đang học</p>
            <p className="text-white text-sm font-medium mb-2">{currentLesson.title}</p>
            <div className="flex items-center gap-2">
              {isLocked ? (
                <span className="text-orange-400 text-xs flex items-center gap-1">
                  <Lock className="h-3 w-3" /> Cần đăng ký
                </span>
              ) : isCurrentCompleted ? (
                <span className="text-green-400 text-xs flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Hoàn thành
                </span>
              ) : (
                <Button size="sm" onClick={handleMarkComplete} className="bg-green-600 text-white text-xs px-2 py-1 h-6">
                  Hoàn thành
                </Button>
              )}
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto py-1">
            {lessons.map((lesson, index) => {
              const isCompleted = lessonProgress?.[lesson.id]?.is_completed;
              const isActive = index === currentLessonIndex;
              const isLessonLocked = !lesson.is_free && !enrollment;

              return (
                <button
                  key={lesson.id}
                  onClick={() => !isLessonLocked && goToLesson(index)}
                  disabled={isLessonLocked}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/5 ${
                    isActive ? 'bg-purple-500/20 border-l-2 border-purple-500' : ''
                  } ${isLessonLocked ? 'opacity-40' : ''}`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                    isCompleted ? 'bg-green-500/20 text-green-400' : 
                    isActive ? 'bg-purple-500 text-white' : 
                    'bg-white/10 text-white/50'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : isLessonLocked ? <Lock className="h-3 w-3" /> : index + 1}
                  </div>
                  <span className={`text-xs line-clamp-1 ${isActive ? 'text-white' : 'text-white/60'}`}>
                    {lesson.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-white/10 flex-shrink-0">
            <Link to="/dashboard/my-courses" className="flex items-center justify-center gap-1 py-2 text-white/40 hover:text-white text-xs">
              <Home className="h-3 w-3" /> Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="h-12 bg-slate-950 border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded hover:bg-white/10 text-white/50">
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <span className="text-white/70 text-sm truncate max-w-xs">{course.title}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} disabled={currentLessonIndex === 0} className="p-1.5 rounded hover:bg-white/10 text-white/50 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-white/40 text-xs">{currentLessonIndex + 1}/{lessons.length}</span>
            <button onClick={handleNext} disabled={currentLessonIndex === lessons.length - 1} className="p-1.5 rounded hover:bg-white/10 text-white/50 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Video Player */}
          <div className="bg-black p-4">
            {isLocked ? (
              <div className="max-w-3xl mx-auto aspect-video flex items-center justify-center bg-slate-900 rounded-lg">
                <div className="text-center p-6">
                  <Lock className="h-8 w-8 text-white/30 mx-auto mb-2" />
                  <p className="text-white/50 text-sm mb-2">Cần đăng ký khóa học</p>
                  <Button size="sm" className="bg-purple-600 text-white" onClick={() => navigate(`/checkout/${course.id}`)}>
                    Đăng ký ngay
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <VideoPlayer 
                  title={currentLesson.title}
                  videoId={currentLesson.video_id || 'dQw4w9WgXcQ'}
                  onComplete={handleMarkComplete}
                  onProgressSeconds={handleVideoProgress}
                  startTime={currentProgress}
                />
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-slate-950 border-b border-white/10">
            <div className="max-w-3xl mx-auto flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
                    activeTab === tab.id 
                      ? 'border-purple-500 text-white' 
                      : 'border-transparent text-white/50 hover:text-white'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-3xl mx-auto p-4">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg">{currentLesson.title}</h3>
                <p className="text-white/60 text-sm">
                  Trong bài học này, bạn sẽ học về các khái niệm cơ bản và thực hành theo hướng dẫn của giáo viên.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">HSK 1</span>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">Cơ bản</span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">20 phút</span>
                </div>
              </div>
            )}

            {activeTab === 'podcast' && (
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Podcast & Audio</h3>
                <div className="p-4 bg-white/5 rounded-lg flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <Play className="h-5 w-5 text-white ml-0.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Nghe lại bài giảng</p>
                    <p className="text-white/40 text-xs">15:00</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'exercises' && (
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Bài tập</h3>
                <div className="p-4 bg-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <ListChecks className="h-5 w-5 text-green-400" />
                    <div>
                      <p className="text-white text-sm">Luyện từ vựng</p>
                      <p className="text-white/40 text-xs">10 câu</p>
                    </div>
                  </div>
                  <span className="text-purple-400 text-xs">Làm bài</span>
                </div>
                <div className="p-4 bg-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-white text-sm">Bài tập ngữ pháp</p>
                      <p className="text-white/40 text-xs">5 câu</p>
                    </div>
                  </div>
                  <span className="text-purple-400 text-xs">Làm bài</span>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="space-y-3">
                <h3 className="text-white font-semibold">Tài nguyên</h3>
                <div className="p-4 bg-white/5 rounded-lg flex items-center gap-3 hover:bg-white/10 cursor-pointer">
                  <FileText className="h-5 w-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm">Bài giảng PDF</p>
                    <p className="text-white/40 text-xs">2.5 MB</p>
                  </div>
                  <Download className="h-4 w-4 text-white/40" />
                </div>
                <div className="p-4 bg-white/5 rounded-lg flex items-center gap-3 hover:bg-white/10 cursor-pointer">
                  <BookMarked className="h-5 w-5 text-green-400" />
                  <div className="flex-1">
                    <p className="text-white text-sm">Từ vựng</p>
                    <p className="text-white/40 text-xs">PDF • 500 KB</p>
                  </div>
                  <Download className="h-4 w-4 text-white/40" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}