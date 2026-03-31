import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, CheckCircle, Lock, ChevronLeft, ChevronRight, Menu, X, 
  Home, BookOpen, Clock, ArrowLeft, FileText, Bookmark, MessageSquare,
  ListChecks, BookMarked, HelpCircle, Download, AlertCircle, Loader2,
  History, Target, Volume2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EnhancedVideoPlayer } from '../components/ui/EnhancedVideoPlayer';
import { VocabularyPanel } from '../components/ui/VocabularyPanel';
import { InteractiveExercises } from '../components/ui/InteractiveExercises';
import { LessonResources } from '../components/ui/LessonResources';
import { LessonQA } from '../components/ui/LessonQA';
import { useCourse, useLessons, useEnrollment, useLessonProgress } from '../hooks/useData';
import { api } from '../../lib/api';
import { toast } from 'sonner';

type TabType = 'overview' | 'vocabulary' | 'exercises' | 'resources' | 'qa';
type AccessStatus = 'loading' | 'authorized' | 'unauthenticated' | 'not_enrolled' | 'not_paid' | 'not_found';

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
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('loading');
  const [exercises, setExercises] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);
  const [learningTime, setLearningTime] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentLesson = lessons[currentLessonIndex];
  
  const canAccess = course && (
    course.course_type === 'free' || 
    enrollment !== null
  );

  const isLocked = currentLesson ? (!currentLesson.is_free && !canAccess) : false;
  const isCurrentCompleted = currentLesson ? (lessonProgress?.[currentLesson.id]?.is_completed ?? false) : false;
  const currentProgress = currentLesson ? (lessonProgress?.[currentLesson.id]?.watched_seconds ?? 0) : 0;

  const completedLessons = lessonProgress ? Object.values(lessonProgress).filter(p => p.is_completed).length : 0;
  const progress = lessons.length > 0 ? Math.round((completedLessons / lessons.length) * 100) : 0;

  const checkAccess = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      setAccessStatus('unauthenticated');
      return;
    }

    if (!course) {
      setAccessStatus('not_found');
      return;
    }

    const isFree = course.course_type === 'free' || course.is_free_for_all;
    
    if (isFree) {
      setAccessStatus('authorized');
      return;
    }

    if (enrollment) {
      setAccessStatus('authorized');
      return;
    }

    try {
      const paymentCheck = await api.courses.checkAccess(course.id);
      if (paymentCheck.success && paymentCheck.data?.canAccess) {
        setAccessStatus('authorized');
      } else {
        setAccessStatus('not_enrolled');
      }
    } catch {
      setAccessStatus('not_enrolled');
    }
  }, [course, enrollment]);

  useEffect(() => {
    if (course && !courseLoading) {
      checkAccess();
    }
  }, [course, courseLoading, checkAccess]);

  useEffect(() => {
    const loadExercises = async () => {
      if (!currentLesson?.id || activeTab !== 'exercises') return;
      
      setLoadingExercises(true);
      try {
        const response = await api.quizzes.getByLesson(currentLesson.id);
        if (response.success) {
          setExercises(response.data || []);
        }
      } catch (err) {
        console.error('Failed to load exercises:', err);
      } finally {
        setLoadingExercises(false);
      }
    };

    loadExercises();
  }, [currentLesson?.id, activeTab]);

  useEffect(() => {
    const loadResources = async () => {
      if (!currentLesson?.id || activeTab !== 'resources') return;
      
      try {
        const response = await api.lessons.getResources(currentLesson.id);
        if (response.success) {
          setResources(response.data || []);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      }
    };

    loadResources();
  }, [currentLesson?.id, activeTab]);

  useEffect(() => {
    const loadVocabulary = async () => {
      if (!currentLesson?.id || activeTab !== 'vocabulary') return;
      
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/student/vocabulary/lesson/${currentLesson.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
          setVocabulary(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load vocabulary:', err);
      }
    };

    loadVocabulary();
  }, [currentLesson?.id, activeTab]);

  useEffect(() => {
    const loadComments = async () => {
      if (!currentLesson?.id || activeTab !== 'qa') return;
      
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`/api/comments/lesson/${currentLesson.id}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await response.json();
        if (data.success) {
          setComments(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      }
    };

    loadComments();
  }, [currentLesson?.id, activeTab]);

  useEffect(() => {
    if (!canAccess || !currentLesson) return;
    
    const interval = setInterval(() => {
      setLearningTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [canAccess, currentLesson]);

  useEffect(() => {
    if (learningTime > 0 && learningTime % 60 === 0 && currentLesson) {
      api.progress.update({
        lesson_id: currentLesson.id,
        watched_seconds: learningTime,
        is_completed: false
      }).catch(console.error);
    }
  }, [learningTime, currentLesson]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(prev => !prev);
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'm':
          handleMarkComplete();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentLessonIndex, lessons.length, isCurrentCompleted]);

  const goToLesson = useCallback((index: number) => {
    if (index >= 0 && index < lessons.length) {
      setCurrentLessonIndex(index);
      setIsPlaying(false);
    }
  }, [lessons.length]);

  const handleMarkComplete = useCallback(async () => {
    if (currentLesson && !isCurrentCompleted) {
      await markCompleted(currentLesson.id);
      toast.success('Đánh dấu hoàn thành!', { duration: 1500 });
    }
  }, [currentLesson, isCurrentCompleted, markCompleted]);

  const handleVideoProgress = useCallback(async (seconds: number) => {
    if (currentLesson && canAccess) {
      try {
        await api.progress.update({
          lesson_id: currentLesson.id,
          watched_seconds: Math.floor(seconds),
          is_completed: isCurrentCompleted
        });
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    }
  }, [currentLesson, canAccess, isCurrentCompleted]);

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

  const handleEnroll = async () => {
    if (!course) return;
    
    const isFreeCourse = course.course_type === 'free' || course.price_vnd === 0;
    
    if (isFreeCourse) {
      try {
        const response = await fetch(`/api/enrollments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ course_id: course.id })
        });
        
        const data = await response.json();
        if (data.success) {
          toast.success('Đăng ký thành công!');
          window.location.reload();
        } else {
          toast.error(data.error || 'Đăng ký thất bại');
        }
      } catch (err) {
        toast.error('Có lỗi xảy ra');
      }
    } else {
      navigate(`/checkout/${course.id}`);
    }
  };

  const tabs = [
    { id: 'overview' as TabType, label: 'Tổng quan', icon: BookOpen },
    { id: 'vocabulary' as TabType, label: 'Từ vựng', icon: Bookmark, count: vocabulary.length },
    { id: 'exercises' as TabType, label: 'Bài tập', icon: ListChecks, count: exercises.length },
    { id: 'resources' as TabType, label: 'Tài nguyên', icon: Download },
    { id: 'qa' as TabType, label: 'Hỏi đáp', icon: MessageSquare, count: comments.length },
  ];

  const renderLoadingSkeleton = () => (
    <div className="h-screen bg-slate-900 flex">
      <div className="w-64 bg-slate-950 border-r border-white/10 p-4 space-y-4">
        <div className="h-4 w-20 bg-white/10 rounded animate-pulse"></div>
        <div className="h-6 w-full bg-white/10 rounded animate-pulse"></div>
        <div className="h-2 w-full bg-white/10 rounded animate-pulse"></div>
        <div className="space-y-2 mt-4">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-10 w-full bg-white/5 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-slate-950 border-b border-white/10"></div>
        <div className="flex-1 bg-black flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
        </div>
      </div>
    </div>
  );

  const renderAccessDenied = (status: AccessStatus) => {
    const config = {
      unauthenticated: {
        icon: Lock,
        title: 'Vui lòng đăng nhập',
        message: 'Bạn cần đăng nhập để học khóa học này',
        action: () => navigate('/?auth=login'),
        actionLabel: 'Đăng nhập'
      },
      not_enrolled: {
        icon: Lock,
        title: 'Cần đăng ký khóa học',
        message: 'Bạn chưa đăng ký khóa học này',
        action: handleEnroll,
        actionLabel: 'Đăng ký ngay'
      },
      not_paid: {
        icon: AlertCircle,
        title: 'Cần thanh toán',
        message: 'Bạn cần thanh toán để học khóa học này',
        action: () => navigate(`/checkout/${course?.id}`),
        actionLabel: 'Thanh toán ngay'
      },
      not_found: {
        icon: AlertCircle,
        title: 'Không tìm thấy khóa học',
        message: 'Khóa học này không tồn tại',
        action: () => navigate('/courses'),
        actionLabel: 'Quay lại'
      }
    };

    const { icon: Icon, title, message, action, actionLabel } = config[status] || config.not_found;

    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon className="h-8 w-8 text-orange-400" />
          </div>
          <h1 className="text-white font-bold text-xl mb-2">{title}</h1>
          <p className="text-white/50 mb-6">{message}</p>
          <Button onClick={action} className="bg-purple-600 text-white">
            {actionLabel}
          </Button>
          <Link to="/courses" className="block mt-4 text-purple-400 text-sm hover:underline">
            ← Danh sách khóa học
          </Link>
        </div>
      </div>
    );
  };

  if (courseLoading || lessonsLoading || enrollmentLoading || progressLoading || accessStatus === 'loading') {
    return renderLoadingSkeleton();
  }

  if (accessStatus !== 'authorized') {
    return renderAccessDenied(accessStatus);
  }

  if (!course || !currentLesson) {
    return renderAccessDenied('not_found');
  }

  return (
    <div className="h-screen bg-slate-900 flex overflow-hidden" ref={contentRef}>
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 ease-out bg-slate-950 border-r border-white/10 flex-shrink-0`}>
        <div className="w-72 h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <Link to={`/courses/${slug}`} className="text-white/40 hover:text-white text-xs flex items-center gap-1 transition-colors">
                <ArrowLeft className="h-3 w-3" /> Thoát
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-white/30 hover:text-white transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
            <h2 className="text-white font-semibold text-sm line-clamp-2">{course.title}</h2>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500 ease-out" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-purple-400 text-xs font-medium min-w-[36px]">{progress}%</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
              <span>{completedLessons}/{lessons.length} bài</span>
              {course.course_type === 'free' && (
                <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Miễn phí</span>
              )}
            </div>
          </div>

          {/* Current Lesson */}
          <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/10 flex-shrink-0">
            <p className="text-white/40 text-xs mb-1">Đang học</p>
            <p className="text-white text-sm font-medium mb-3 line-clamp-2">{currentLesson.title}</p>
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
                <Button 
                  size="sm" 
                  onClick={handleMarkComplete} 
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 h-7 transition-all"
                >
                  Hoàn thành (M)
                </Button>
              )}
            </div>
          </div>

          {/* Lessons List */}
          <div className="flex-1 overflow-y-auto py-2">
            {lessons.map((lesson, index) => {
              const isCompleted = lessonProgress?.[lesson.id]?.is_completed;
              const isActive = index === currentLessonIndex;
              const isLessonLocked = !lesson.is_free && !canAccess;

              return (
                <button
                  key={lesson.id}
                  onClick={() => !isLessonLocked && goToLesson(index)}
                  disabled={isLessonLocked}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-white/5 transition-colors ${
                    isActive ? 'bg-purple-500/20 border-l-2 border-purple-500' : ''
                  } ${isLessonLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all ${
                    isCompleted ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/30' : 
                    isActive ? 'bg-purple-500 text-white ring-2 ring-purple-500/50' : 
                    'bg-white/10 text-white/50'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-3.5 w-3.5" /> : isLessonLocked ? <Lock className="h-3 w-3" /> : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm block truncate ${isActive ? 'text-white font-medium' : 'text-white/70'}`}>
                      {lesson.title}
                    </span>
                    {lesson.is_free && (
                      <span className="text-xs text-green-400/70">Miễn phí xem</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-white/10 flex-shrink-0">
            <Link to="/dashboard/my-courses" className="flex items-center justify-center gap-2 py-2.5 text-white/40 hover:text-white text-sm rounded-lg hover:bg-white/5 transition-colors">
              <Home className="h-4 w-4" /> Trang chủ
            </Link>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <div className="h-14 bg-slate-950 border-b border-white/10 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm truncate max-w-xs font-medium">{course.title}</span>
              <span className="text-white/30 text-sm">•</span>
              <span className="text-purple-400 text-sm">{currentLessonIndex + 1}/{lessons.length}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handlePrev} 
              disabled={currentLessonIndex === 0} 
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Bài trước (←)"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={handleNext} 
              disabled={currentLessonIndex === lessons.length - 1} 
              className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Bài tiếp theo (→)"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Video Player */}
          <div className="bg-black p-4 md:p-6">
            {isLocked ? (
              <div className="max-w-4xl mx-auto aspect-video flex items-center justify-center bg-slate-900 rounded-xl">
                <div className="text-center p-8">
                  <Lock className="h-12 w-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/50 text-lg mb-4">Cần đăng ký khóa học để xem</p>
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleEnroll}>
                    Đăng ký ngay
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto">
                <EnhancedVideoPlayer 
                  title={currentLesson.title}
                  videoId={currentLesson.video_id || 'dQw4w9WgXcQ'}
                  onComplete={handleMarkComplete}
                  onProgressSeconds={handleVideoProgress}
                  startTime={currentProgress}
                />
                <div className="flex items-center justify-center gap-4 mt-4 text-white/40 text-sm">
                  <span className="flex items-center gap-1"><kbd className="px-2 py-0.5 bg-white/10 rounded text-xs">Space</kbd> Play/Pause</span>
                  <span className="flex items-center gap-1"><kbd className="px-2 py-0.5 bg-white/10 rounded text-xs">←→</kbd> Chuyển bài</span>
                  <span className="flex items-center gap-1"><kbd className="px-2 py-0.5 bg-white/10 rounded text-xs">M</kbd> Đánh dấu</span>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-slate-950 border-b border-white/10 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto flex">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-all ${
                    activeTab === tab.id 
                      ? 'border-purple-500 text-white bg-white/5' 
                      : 'border-transparent text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === 'vocabulary' && vocabulary.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">{vocabulary.length}</span>
                  )}
                  {tab.id === 'exercises' && exercises.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">{exercises.length}</span>
                  )}
                  {tab.id === 'qa' && comments.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">{comments.length}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="max-w-4xl mx-auto p-4 md:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-white font-bold text-xl mb-3">{currentLesson.title}</h3>
                  <p className="text-white/60 leading-relaxed">
                    {currentLesson.description || 'Trong bài học này, bạn sẽ học về các khái niệm cơ bản và thực hành theo hướng dẫn của giáo viên. Hãy chú ý theo dõi và luyện tập thường xuyên để đạt hiệu quả tốt nhất.'}
                  </p>
                </div>
                
                {/* Learning Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20">
                    <div className="flex items-center gap-2 text-purple-400 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">Thời gian học</span>
                    </div>
                    <p className="text-white font-bold text-lg">
                      {Math.floor(learningTime / 60)}:{String(learningTime % 60).padStart(2, '0')}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Hoàn thành</span>
                    </div>
                    <p className="text-white font-bold text-lg">{progress}%</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/20">
                    <div className="flex items-center gap-2 text-blue-400 mb-1">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-xs">Bài học</span>
                    </div>
                    <p className="text-white font-bold text-lg">{completedLessons}/{lessons.length}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-500/20">
                    <div className="flex items-center gap-2 text-orange-400 mb-1">
                      <History className="h-4 w-4" />
                      <span className="text-xs">Tiến độ video</span>
                    </div>
                    <p className="text-white font-bold text-lg">{Math.floor(currentProgress / 60)}:{String(Math.floor(currentProgress) % 60).padStart(2, '0')}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 text-sm rounded-lg">{course.category || 'Tiếng Trung'}</span>
                  <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-sm rounded-lg">{course.level || 'Cơ bản'}</span>
                  <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-lg flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {currentLesson.duration_minutes || 20} phút
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'vocabulary' && (
              <div className="animate-in fade-in duration-300">
                <VocabularyPanel 
                  vocabulary={vocabulary}
                  lessonId={currentLesson?.id || ''}
                  savedWords={savedWords}
                  onSaveWord={(word) => {
                    setSavedWords(prev => [...prev, word.id]);
                    toast.success(`Đã lưu "${word.word}" vào danh sách học`);
                  }}
                />
              </div>
            )}

            {activeTab === 'exercises' && (
              <div className="animate-in fade-in duration-300">
                {loadingExercises ? (
                  <div className="space-y-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="p-4 bg-white/5 rounded-lg animate-pulse flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/10 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-white/10 rounded"></div>
                          <div className="h-3 w-20 bg-white/10 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <InteractiveExercises 
                    exercises={exercises}
                    onSubmit={async (exerciseId, answer) => {
                      try {
                        const response = await api.quizzes.submitAnswer(exerciseId, answer);
                        return {
                          correct: response.data?.is_correct ?? false,
                          correctAnswer: response.data?.correct_answer ?? '',
                          explanation: response.data?.explanation
                        };
                      } catch (err) {
                        return { correct: false, correctAnswer: '' };
                      }
                    }}
                  />
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="animate-in fade-in duration-300">
                <LessonResources 
                  resources={resources}
                  lessonId={currentLesson?.id || ''}
                />
              </div>
            )}

            {activeTab === 'qa' && (
              <div className="animate-in fade-in duration-300">
                <LessonQA 
                  lessonId={currentLesson?.id || ''}
                  comments={comments}
                  onPostComment={async (content, parentId) => {
                    try {
                      const token = localStorage.getItem('auth_token');
                      await fetch('/api/comments', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ lesson_id: currentLesson?.id, content, parent_id: parentId })
                      });
                    } catch (err) {
                      console.error('Failed to post comment:', err);
                    }
                  }}
                  onLike={async (commentId) => {
                    try {
                      const token = localStorage.getItem('auth_token');
                      await fetch(`/api/comments/${commentId}/like`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                    } catch (err) {
                      console.error('Failed to like comment:', err);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
