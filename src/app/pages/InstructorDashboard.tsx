import { useState, useEffect, useRef } from 'react';
import { BookOpen, Plus, Edit, Trash2, Video, Eye, Users, Clock, Check, X, Save, GraduationCap, BarChart3, MessageCircle, DollarSign, Send, User, LayoutDashboard, Upload, FileText, List, TrendingUp, Play, BookMarked, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  students_enrolled: number;
  total_lessons: number;
  is_published: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order_index: number;
  video_id: string;
  video_duration: number;
  is_free: boolean;
  is_published: boolean;
}

export function InstructorDashboard() {
  const { profile, isAuthenticated, user } = useAuth();
  const isInstructor = user?.role === 'instructor' || user?.role === 'admin' || user?.role === 'super_admin';
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    video_id: '',
    video_duration: 0,
    is_free: false,
    is_published: true,
  });

  const [activeTab, setActiveTab] = useState<'courses' | 'exercises' | 'vocabulary' | 'resources' | 'progress' | 'stats' | 'messages'>('courses');
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [vocabulary, setVocabulary] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [showVocabularyModal, setShowVocabularyModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [editingVocab, setEditingVocab] = useState<any>(null);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [loadingStates, setLoadingStates] = useState({
    courses: false,
    lessons: false,
    exercises: false,
    vocabulary: false,
    resources: false,
    progress: false,
    saving: false,
  });
  const [exerciseForm, setExerciseForm] = useState({
    question: '',
    question_type: 'multiple_choice',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 'medium',
  });
  const [vocabForm, setVocabForm] = useState({
    word: '',
    pinyin: '',
    meaning: '',
    example_sentence: '',
    category: '',
    hsk_level: 1,
  });
  const [resourceForm, setResourceForm] = useState({
    title: '',
    type: 'pdf',
    url: '',
    description: '',
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    level: 'beginner',
    category: 'HSK 1',
    price_vnd: 0,
    original_price_vnd: 0,
    discount_percent: 0,
    has_certificate: false,
    total_lessons: 0,
    duration_hours: 0,
  });
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({ user_id: '', subject: '', content: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    if (!isInstructor) {
      return;
    }
    fetchMyCourses();
    fetchStats();
    fetchStudents();
    fetchMessages();
  }, [isAuthenticated, isInstructor]);

  const fetchStats = async () => {
    try {
      const res = await api.instructors.getStats();
      if (res.success) setStats(res.data);
    } catch (err) { console.error('Failed to fetch stats:', err); }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.instructors.getStudents();
      if (res.success) setStudents(res.data);
    } catch (err) { console.error('Failed to fetch students:', err); }
  };

  const fetchMessages = async () => {
    try {
      const res = await api.instructors.getMessages();
      if (res.success) setMessages(res.data);
    } catch (err) { console.error('Failed to fetch messages:', err); }
  };

  const fetchExercises = async (lessonId: string) => {
    setLoadingStates(prev => ({ ...prev, exercises: true }));
    try {
      const res = await api.instructors.getExercises(lessonId);
      if (res.success) setExercises(res.data || []);
    } catch (err) { 
      console.error('Failed to fetch exercises:', err);
      toast.error('Không thể tải danh sách bài tập');
    } finally {
      setLoadingStates(prev => ({ ...prev, exercises: false }));
    }
  };

  const fetchVocabulary = async (lessonId: string) => {
    setLoadingStates(prev => ({ ...prev, vocabulary: true }));
    try {
      const res = await api.instructors.getVocabulary(lessonId);
      if (res.success) setVocabulary(res.data || []);
    } catch (err) { 
      console.error('Failed to fetch vocabulary:', err);
      toast.error('Không thể tải danh sách từ vựng');
    } finally {
      setLoadingStates(prev => ({ ...prev, vocabulary: false }));
    }
  };

  const fetchResources = async (lessonId: string) => {
    setLoadingStates(prev => ({ ...prev, resources: true }));
    try {
      const res = await api.instructors.getResources(lessonId);
      if (res.success) setResources(res.data || []);
    } catch (err) { 
      console.error('Failed to fetch resources:', err);
      toast.error('Không thể tải danh sách tài liệu');
    } finally {
      setLoadingStates(prev => ({ ...prev, resources: false }));
    }
  };

  const fetchStudentProgress = async (courseId: string) => {
    setLoadingStates(prev => ({ ...prev, progress: true }));
    try {
      const res = await api.instructors.getStudentProgress(courseId);
      if (res.success) setStudentProgress(res.data || []);
    } catch (err) { 
      console.error('Failed to fetch student progress:', err);
      toast.error('Không thể tải tiến độ học viên');
    } finally {
      setLoadingStates(prev => ({ ...prev, progress: false }));
    }
  };

  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <InstructorIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600">Bạn cần là giảng viên để truy cập trang này</p>
        </div>
      </div>
    );
  }

  const fetchMyCourses = async () => {
    setLoadingStates(prev => ({ ...prev, courses: true }));
    try {
      const response = await api.instructors.getMyCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      toast.error('Không thể tải danh sách khóa học');
    } finally {
      setLoadingStates(prev => ({ ...prev, courses: false }));
    }
  };

  const fetchLessons = async (courseId: string) => {
    setLoadingStates(prev => ({ ...prev, lessons: true }));
    try {
      const response = await api.lessons.getByCourse(courseId);
      if (response.success && response.data) {
        setLessons(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch lessons:', err);
      toast.error('Không thể tải danh sách bài học');
    } finally {
      setLoadingStates(prev => ({ ...prev, lessons: false }));
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    fetchLessons(course.id);
  };

  const handleSaveLesson = async () => {
    if (!selectedCourse) return;
    
    try {
      if (editingLesson) {
        await api.lessons.update(editingLesson.id, {
          ...lessonForm,
          order_index: editingLesson.order_index,
        });
      } else {
        await api.lessons.create({
          course_id: selectedCourse.id,
          ...lessonForm,
          order_index: lessons.length + 1,
        });
      }
      setShowLessonModal(false);
      setEditingLesson(null);
      setLessonForm({ title: '', description: '', video_id: '', video_duration: 0, is_free: false, is_published: true });
      fetchLessons(selectedCourse.id);
    } catch (err) {
      console.error('Failed to save lesson:', err);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!selectedCourse || !confirm('Bạn có chắc muốn xóa bài học này?')) return;
    
    try {
      await api.lessons.delete(lessonId);
      fetchLessons(selectedCourse.id);
    } catch (err) {
      console.error('Failed to delete lesson:', err);
    }
  };

  const openEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      video_id: lesson.video_id || '',
      video_duration: lesson.video_duration || 0,
      is_free: lesson.is_free,
      is_published: lesson.is_published,
    });
    setShowLessonModal(true);
  };

  const openNewLesson = () => {
    setEditingLesson(null);
    setLessonForm({ title: '', description: '', video_id: '', video_duration: 0, is_free: false, is_published: true });
    setShowLessonModal(true);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    if (activeTab === 'exercises') {
      fetchExercises(lesson.id);
    } else if (activeTab === 'vocabulary') {
      fetchVocabulary(lesson.id);
    } else if (activeTab === 'resources') {
      fetchResources(lesson.id);
    }
  };

  const handleSaveExercise = async () => {
    if (!selectedLesson) return;
    setLoadingStates(prev => ({ ...prev, saving: true }));
    try {
      if (editingExercise) {
        await api.instructors.updateExercise(editingExercise.id, exerciseForm);
        toast.success('Cập nhật bài tập thành công');
      } else {
        await api.instructors.createExercise({ ...exerciseForm, lesson_id: selectedLesson.id });
        toast.success('Thêm bài tập thành công');
      }
      setShowExerciseModal(false);
      setEditingExercise(null);
      setExerciseForm({ question: '', question_type: 'multiple_choice', options: ['', '', '', ''], correct_answer: '', explanation: '', difficulty: 'medium' });
      fetchExercises(selectedLesson.id);
    } catch (err) { 
      console.error('Failed to save exercise:', err);
      toast.error('Không thể lưu bài tập');
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  };

  const handleDeleteExercise = async (id: string) => {
    if (!selectedLesson || !confirm('Xóa bài tập này?')) return;
    setLoadingStates(prev => ({ ...prev, saving: true }));
    try {
      await api.instructors.deleteExercise(id);
      toast.success('Xóa bài tập thành công');
      fetchExercises(selectedLesson.id);
    } catch (err) { 
      console.error('Failed to delete exercise:', err);
      toast.error('Không thể xóa bài tập');
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  };

  const openEditExercise = (ex: any) => {
    setEditingExercise(ex);
    setExerciseForm({
      question: ex.question,
      question_type: ex.question_type || 'multiple_choice',
      options: ex.options || ['', '', '', ''],
      correct_answer: ex.correct_answer || '',
      explanation: ex.explanation || '',
      difficulty: ex.difficulty || 'medium',
    });
    setShowExerciseModal(true);
  };

  const handleSaveVocab = async () => {
    if (!selectedLesson) return;
    setLoadingStates(prev => ({ ...prev, saving: true }));
    try {
      if (editingVocab) {
        await api.instructors.updateVocabulary(editingVocab.id, vocabForm);
        toast.success('Cập nhật từ vựng thành công');
      } else {
        await api.instructors.createVocabulary({ ...vocabForm, lesson_id: selectedLesson.id });
        toast.success('Thêm từ vựng thành công');
      }
      setShowVocabularyModal(false);
      setEditingVocab(null);
      setVocabForm({ word: '', pinyin: '', meaning: '', example_sentence: '', category: '', hsk_level: 1 });
      fetchVocabulary(selectedLesson.id);
    } catch (err) { 
      console.error('Failed to save vocabulary:', err);
      toast.error('Không thể lưu từ vựng');
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  };

  const handleDeleteVocab = async (id: string) => {
    if (!selectedLesson || !confirm('Xóa từ vựng này?')) return;
    setLoadingStates(prev => ({ ...prev, saving: true }));
    try {
      await api.instructors.deleteVocabulary(id);
      toast.success('Xóa từ vựng thành công');
      fetchVocabulary(selectedLesson.id);
    } catch (err) { 
      console.error('Failed to delete vocabulary:', err);
      toast.error('Không thể xóa từ vựng');
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  };

  const openEditVocab = (vocab: any) => {
    setEditingVocab(vocab);
    setVocabForm({
      word: vocab.word || '',
      pinyin: vocab.pinyin || '',
      meaning: vocab.meaning || '',
      example_sentence: vocab.example_sentence || '',
      category: vocab.category || '',
      hsk_level: vocab.hsk_level || 1,
    });
    setShowVocabularyModal(true);
  };

  const handleSaveResource = async () => {
    if (!selectedLesson) return;
    setLoadingStates(prev => ({ ...prev, saving: true }));
    try {
      if (editingResource) {
        await api.instructors.updateResource(editingResource.id, resourceForm);
        toast.success('Cập nhật tài liệu thành công');
      } else {
        await api.instructors.createResource({ ...resourceForm, lesson_id: selectedLesson.id });
        toast.success('Thêm tài liệu thành công');
      }
      setShowResourceModal(false);
      setEditingResource(null);
      setResourceForm({ title: '', type: 'pdf', url: '', description: '' });
      fetchResources(selectedLesson.id);
    } catch (err) { 
      console.error('Failed to save resource:', err);
      toast.error('Không thể lưu tài liệu');
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!selectedLesson || !confirm('Xóa tài liệu này?')) return;
    setLoadingStates(prev => ({ ...prev, saving: true }));
    try {
      await api.instructors.deleteResource(id);
      toast.success('Xóa tài liệu thành công');
      fetchResources(selectedLesson.id);
    } catch (err) { 
      console.error('Failed to delete resource:', err);
      toast.error('Không thể xóa tài liệu');
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  };

  const openEditResource = (res: any) => {
    setEditingResource(res);
    setResourceForm({
      title: res.title || '',
      type: res.type || 'pdf',
      url: res.url || '',
      description: res.description || '',
    });
    setShowResourceModal(true);
  };

  const handleImportLessons = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !fileInputRef.current?.files?.length) return;
    const file = fileInputRef.current.files[0];
    if (!file) return;
    
    setImporting(true);
    try {
      const res = await api.instructors.importLessons(selectedCourse.id, file);
      if (res.success) {
        toast.success(`Import thành công ${res.data.imported} bài học!`);
        setShowImportModal(false);
        fetchLessons(selectedCourse.id);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        toast.error(res.error || 'Lỗi khi import');
      }
    } catch (err) {
      toast.error('Lỗi khi import');
    } finally {
      setImporting(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.instructors.createCourse({
        ...courseForm,
        teacher_name: user?.full_name || 'Giảng viên',
      });
      if (res.success) {
        toast.success('Tạo khóa học thành công! Chờ duyệt từ admin.');
        setShowCourseModal(false);
        setCourseForm({
          title: '', description: '', thumbnail_url: '', level: 'beginner',
          category: 'HSK 1', price_vnd: 0, original_price_vnd: 0,
          discount_percent: 0, has_certificate: false, total_lessons: 0, duration_hours: 0,
        });
        fetchMyCourses();
        fetchStats();
      } else {
        toast.error(res.error || 'Lỗi khi tạo khóa học');
      }
    } catch (err) {
      toast.error('Lỗi khi tạo khóa học');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageForm.user_id || !messageForm.content) return;
    try {
      const res = await api.instructors.sendMessage(messageForm.user_id, messageForm.subject, messageForm.content);
      if (res.success) {
        toast.success('Gửi tin nhắn thành công!');
        setShowMessageModal(false);
        setMessageForm({ user_id: '', subject: '', content: '' });
        fetchMessages();
      }
    } catch (err) {
      toast.error('Lỗi khi gửi tin nhắn');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trang giảng viên</h1>
              <p className="text-gray-600">Quản lý khóa học, thống kê và hỗ trợ học viên</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'courses' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Khóa học
            </button>
            <button
              onClick={() => setActiveTab('exercises')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'exercises' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" /> Bài tập
            </button>
            <button
              onClick={() => setActiveTab('vocabulary')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'vocabulary' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BookMarked className="h-4 w-4" /> Từ vựng
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'resources' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Download className="h-4 w-4" /> Tài liệu
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'progress' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="h-4 w-4" /> Tiến độ
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'stats' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Thống kê
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'messages' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <MessageCircle className="h-4 w-4" /> Tin nhắn
            </button>
          </nav>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg"><BookOpen className="h-6 w-6 text-blue-600" /></div>
                <div><p className="text-sm text-gray-500">Tổng khóa học</p><p className="text-2xl font-bold">{stats.totalCourses}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg"><Users className="h-6 w-6 text-green-600" /></div>
                <div><p className="text-sm text-gray-500">Học viên</p><p className="text-2xl font-bold">{stats.totalStudents}</p></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-lg"><DollarSign className="h-6 w-6 text-purple-600" /></div>
                <div><p className="text-sm text-gray-500">Doanh thu</p><p className="text-2xl font-bold">{(stats.totalRevenue / 1000000).toFixed(1)}M ₫</p></div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-lg"><Video className="h-6 w-6 text-orange-600" /></div>
                <div><p className="text-sm text-gray-500">Bài học</p><p className="text-2xl font-bold">{stats.totalLessons}</p></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && stats?.topCourses?.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Top khóa học doanh thu</h3>
            <div className="space-y-3">
              {stats.topCourses.map((course: any, idx: number) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm">{idx + 1}</span>
                    <span className="font-medium">{course.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{(course.revenue / 1000000).toFixed(1)}M ₫</p>
                    <p className="text-sm text-gray-500">{course.students_enrolled} học viên</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Danh sách học viên</h2>
              <Button onClick={() => setShowMessageModal(true)}><Send className="h-4 w-4 mr-2" /> Gửi tin nhắn</Button>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Học viên</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Khóa học</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tiến độ</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có học viên</td></tr>
                  ) : students.map((s, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4"><div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="font-medium">{s.full_name}</span></div></td>
                      <td className="px-6 py-4">{s.course_title}</td>
                      <td className="px-6 py-4"><div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${s.progress || 0}%` }} /></div><span className="text-sm">{s.progress || 0}%</span></td>
                      <td className="px-6 py-4 text-gray-500">{s.enrolled_at ? new Date(s.enrolled_at).toLocaleDateString('vi-VN') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Course Modal */}
        {showCourseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Tạo khóa học mới</h2>
                <button onClick={() => setShowCourseModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreateCourse} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                  <Input value={courseForm.title} onChange={(e) => setCourseForm({...courseForm, title: e.target.value})} required placeholder="Tiếng Hoa Sơ Cấp HSK 1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea value={courseForm.description} onChange={(e) => setCourseForm({...courseForm, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Mô tả khóa học..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Hình ảnh</label>
                  <Input value={courseForm.thumbnail_url} onChange={(e) => setCourseForm({...courseForm, thumbnail_url: e.target.value})} placeholder="https://..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ</label>
                    <select value={courseForm.level} onChange={(e) => setCourseForm({...courseForm, level: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                      <option value="beginner">Sơ cấp</option>
                      <option value="intermediate">Trung cấp</option>
                      <option value="advanced">Nâng cao</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                    <Input value={courseForm.category} onChange={(e) => setCourseForm({...courseForm, category: e.target.value})} placeholder="HSK 1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                    <Input type="number" value={courseForm.price_vnd} onChange={(e) => setCourseForm({...courseForm, price_vnd: parseInt(e.target.value)})} min={0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VNĐ)</label>
                    <Input type="number" value={courseForm.original_price_vnd} onChange={(e) => setCourseForm({...courseForm, original_price_vnd: parseInt(e.target.value)})} min={0} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="has_cert" checked={courseForm.has_certificate} onChange={(e) => setCourseForm({...courseForm, has_certificate: e.target.checked})} className="rounded" />
                  <label htmlFor="has_cert" className="text-sm text-gray-700">Cấp chứng chỉ hoàn thành</label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCourseModal(false)}>Hủy</Button>
                  <Button type="submit" className="flex-1">Tạo khóa học</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-xl font-bold">Gửi tin nhắn</h2>
                <button onClick={() => setShowMessageModal(false)} className="p-1 hover:bg-gray-100 rounded"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSendMessage} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn học viên</label>
                  <select value={messageForm.user_id} onChange={(e) => setMessageForm({...messageForm, user_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required>
                    <option value="">-- Chọn học viên --</option>
                    {students.map((s) => <option key={s.id} value={s.id}>{s.full_name} - {s.course_title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
                  <Input value={messageForm.subject} onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})} placeholder="Tiêu đề tin nhắn" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung *</label>
                  <textarea value={messageForm.content} onChange={(e) => setMessageForm({...messageForm, content: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={4} required placeholder="Nội dung tin nhắn..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowMessageModal(false)}>Hủy</Button>
                  <Button type="submit" className="flex-1"><Send className="h-4 w-4 mr-2" /> Gửi</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Chọn khóa học</h2>
              </div>
              <div className="space-y-3">
                {courses.map(course => (
                  <Card 
                    key={course.id} 
                    className={`p-4 cursor-pointer transition-all ${selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => { setSelectedCourse(course); fetchLessons(course.id); }}
                  >
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.total_lessons || 0} bài học</p>
                  </Card>
                ))}
              </div>
              {selectedCourse && lessons.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Chọn bài học</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson)}
                        className={`p-2 rounded cursor-pointer ${selectedLesson?.id === lesson.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'} border`}
                      >
                        <span className="font-medium">{idx + 1}. {lesson.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              {selectedLesson ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Bài tập: {selectedLesson.title}
                    </h2>
                    <Button onClick={() => { setEditingExercise(null); setExerciseForm({ question: '', question_type: 'multiple_choice', options: ['', '', '', ''], correct_answer: '', explanation: '', difficulty: 'medium' }); setShowExerciseModal(true); }}>
                      <Plus className="h-4 w-4 mr-2" /> Thêm bài tập
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {exercises.map((ex) => (
                      <Card key={ex.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">{ex.question_type || 'multiple_choice'}</span>
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">{ex.difficulty || 'medium'}</span>
                            </div>
                            <p className="font-medium text-gray-900">{ex.question}</p>
                            {ex.options && ex.options.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {ex.options.map((opt: string, i: number) => (
                                  <p key={i} className={`text-sm ${ex.correct_answer === opt ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                    {String.fromCharCode(65 + i)}. {opt} {ex.correct_answer === opt && '✓'}
                                  </p>
                                ))}
                              </div>
                            )}
                            {ex.explanation && <p className="mt-2 text-sm text-gray-500 italic">Giải thích: {ex.explanation}</p>}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditExercise(ex)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteExercise(ex.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {exercises.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chưa có bài tập nào</p>
                        <Button className="mt-2" onClick={() => { setEditingExercise(null); setExerciseForm({ question: '', question_type: 'multiple_choice', options: ['', '', '', ''], correct_answer: '', explanation: '', difficulty: 'medium' }); setShowExerciseModal(true); }}>
                          <Plus className="h-4 w-4 mr-2" /> Thêm bài tập đầu tiên
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Chọn khóa học và bài học để quản lý bài tập</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vocabulary Tab */}
        {activeTab === 'vocabulary' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Chọn khóa học</h2>
              </div>
              <div className="space-y-3">
                {courses.map(course => (
                  <Card 
                    key={course.id} 
                    className={`p-4 cursor-pointer transition-all ${selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => { setSelectedCourse(course); fetchLessons(course.id); }}
                  >
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.total_lessons || 0} bài học</p>
                  </Card>
                ))}
              </div>
              {selectedCourse && lessons.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Chọn bài học</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson)}
                        className={`p-2 rounded cursor-pointer ${selectedLesson?.id === lesson.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'} border`}
                      >
                        <span className="font-medium">{idx + 1}. {lesson.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              {selectedLesson ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Từ vựng: {selectedLesson.title}
                    </h2>
                    <Button onClick={() => { setEditingVocab(null); setVocabForm({ word: '', pinyin: '', meaning: '', example_sentence: '', category: '', hsk_level: 1 }); setShowVocabularyModal(true); }}>
                      <Plus className="h-4 w-4 mr-2" /> Thêm từ vựng
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {vocabulary.map((vocab) => (
                      <Card key={vocab.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl font-bold text-red-600">{vocab.word}</span>
                              <span className="text-sm text-gray-500">{vocab.pinyin}</span>
                            </div>
                            <p className="font-medium text-gray-900">{vocab.meaning}</p>
                            {vocab.example_sentence && <p className="mt-1 text-sm text-gray-500 italic">"{vocab.example_sentence}"</p>}
                            {vocab.category && <span className="mt-2 inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full">{vocab.category}</span>}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => openEditVocab(vocab)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteVocab(vocab.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {vocabulary.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <BookMarked className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chưa có từ vựng nào</p>
                        <Button className="mt-2" onClick={() => { setEditingVocab(null); setVocabForm({ word: '', pinyin: '', meaning: '', example_sentence: '', category: '', hsk_level: 1 }); setShowVocabularyModal(true); }}>
                          <Plus className="h-4 w-4 mr-2" /> Thêm từ vựng đầu tiên
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <BookMarked className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Chọn khóa học và bài học để quản lý từ vựng</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Chọn khóa học</h2>
              </div>
              <div className="space-y-3">
                {courses.map(course => (
                  <Card 
                    key={course.id} 
                    className={`p-4 cursor-pointer transition-all ${selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => { setSelectedCourse(course); fetchLessons(course.id); }}
                  >
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.total_lessons || 0} bài học</p>
                  </Card>
                ))}
              </div>
              {selectedCourse && lessons.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Chọn bài học</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {lessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id}
                        onClick={() => handleSelectLesson(lesson)}
                        className={`p-2 rounded cursor-pointer ${selectedLesson?.id === lesson.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'} border`}
                      >
                        <span className="font-medium">{idx + 1}. {lesson.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              {selectedLesson ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Tài liệu: {selectedLesson.title}
                    </h2>
                    <Button onClick={() => { setEditingResource(null); setResourceForm({ title: '', type: 'pdf', url: '', description: '' }); setShowResourceModal(true); }}>
                      <Plus className="h-4 w-4 mr-2" /> Thêm tài liệu
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {resources.map((res) => (
                      <Card key={res.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${res.type === 'pdf' ? 'bg-red-100' : res.type === 'video' ? 'bg-blue-100' : 'bg-green-100'}`}>
                              {res.type === 'pdf' ? <FileText className="h-5 w-5 text-red-600" /> : res.type === 'video' ? <Play className="h-5 w-5 text-blue-600" /> : <Download className="h-5 w-5 text-green-600" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{res.title}</h4>
                              <p className="text-sm text-gray-500">{res.description || 'Không có mô tả'}</p>
                              <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{res.url}</a>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" onClick={() => openEditResource(res)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteResource(res.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {resources.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Download className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Chưa có tài liệu nào</p>
                        <Button className="mt-2" onClick={() => { setEditingResource(null); setResourceForm({ title: '', type: 'pdf', url: '', description: '' }); setShowResourceModal(true); }}>
                          <Plus className="h-4 w-4 mr-2" /> Thêm tài liệu đầu tiên
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Download className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Chọn khóa học và bài học để quản lý tài liệu</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Chọn khóa học</h2>
              </div>
              <div className="space-y-3">
                {courses.map(course => (
                  <Card 
                    key={course.id} 
                    className={`p-4 cursor-pointer transition-all ${selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => { setSelectedCourse(course); fetchStudentProgress(course.id); }}
                  >
                    <h3 className="font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.students_enrolled || 0} học viên</p>
                  </Card>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              {selectedCourse ? (
                <>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Tiến độ học viên: {selectedCourse.title}
                    </h2>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Học viên</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bài học đã học</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tiến độ</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lần cuối</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {studentProgress.length === 0 ? (
                          <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có dữ liệu tiến độ</td></tr>
                        ) : studentProgress.map((sp, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-6 py-4"><div className="flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /><span className="font-medium">{sp.full_name}</span></div></td>
                            <td className="px-6 py-4">{sp.lessons_completed || 0} / {selectedCourse.total_lessons || 0}</td>
                            <td className="px-6 py-4"><div className="w-24 bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: `${sp.progress_percent || 0}%` }} /></div><span className="text-sm">{sp.progress_percent || 0}%</span></td>
                            <td className="px-6 py-4 text-gray-500">{sp.last_activity ? new Date(sp.last_activity).toLocaleDateString('vi-VN') : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Chọn khóa học để xem tiến độ học viên</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course List */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Khóa học của tôi</h2>
              <Button size="sm" onClick={() => setShowCourseModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> Tạo mới
              </Button>
            </div>
            <div className="space-y-3">
              {courses.map(course => (
                <Card 
                  key={course.id} 
                  className={`p-4 cursor-pointer transition-all ${selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleSelectCourse(course)}
                >
                  <div className="flex items-center gap-3">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-16 h-12 object-cover rounded" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                      <p className="text-sm text-gray-500">{course.total_lessons || 0} bài học</p>
                    </div>
                  </div>
                </Card>
              ))}
              {courses.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Chưa có khóa học nào</p>
                </div>
              )}
            </div>
          </div>

          {/* Lessons */}
          <div className="lg:col-span-2">
            {selectedCourse ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Bài học: {selectedCourse.title}
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowImportModal(true)} disabled={!selectedCourse}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import CSV
                    </Button>
                    <Button onClick={openNewLesson}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm bài học
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {lessons.map((lesson, index) => (
                    <Card key={lesson.id} className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                            {lesson.is_free && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Miễn phí</span>
                            )}
                            {!lesson.is_published && (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full">Nháp</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            {lesson.video_id && (
                              <span className="flex items-center gap-1">
                                <Video className="h-4 w-4" />
                                YouTube
                              </span>
                            )}
                            {lesson.video_duration > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {Math.floor(lesson.video_duration / 60)}:{(lesson.video_duration % 60).toString().padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEditLesson(lesson)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteLesson(lesson.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {lessons.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Chưa có bài học nào</p>
                      <Button className="mt-2" onClick={openNewLesson}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm bài học đầu tiên
                      </Button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Chọn khóa học để quản lý bài giảng</p>
                </div>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Import Lessons Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4">Import bài học từ CSV</h2>
              <form onSubmit={handleImportLessons} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Chọn khóa học: <span className="font-medium">{selectedCourse?.title}</span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">File CSV</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="w-full border rounded-lg p-2 text-sm"
                  />
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="font-medium mb-1">Định dạng CSV:</p>
                  <code className="text-xs text-gray-600">
                    title,description,video_id,video_duration,is_free,is_published
                  </code>
                  <p className="text-xs text-gray-500 mt-1">
                    Ví dụ: Bài 1 - Chào hỏi,Video mở đầu,dQw4w9WgXcQ,300,true,true
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowImportModal(false)}>Hủy</Button>
                  <Button type="submit" className="flex-1" disabled={importing}>
                    {importing ? 'Đang import...' : 'Import'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Lesson Modal */}
        {showLessonModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingLesson ? 'Sửa bài học' : 'Thêm bài học mới'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề bài học</label>
                  <Input
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="Nhập tiêu đề bài học"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    placeholder="Mô tả nội dung bài học"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Video ID (YouTube)</label>
                  <Input
                    value={lessonForm.video_id}
                    onChange={(e) => setLessonForm({ ...lessonForm, video_id: e.target.value })}
                    placeholder="dQw4w9WgXcQ"
                  />
                  <p className="text-xs text-gray-500 mt-1">Nhập ID video YouTube (phần sau v=)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Thời lượng (giây)</label>
                  <Input
                    type="number"
                    value={lessonForm.video_duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, video_duration: parseInt(e.target.value) || 0 })}
                    placeholder="300"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={lessonForm.is_free}
                      onChange={(e) => setLessonForm({ ...lessonForm, is_free: e.target.checked })}
                    />
                    <span className="text-sm">Miễn phí (xem trước)</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={lessonForm.is_published}
                      onChange={(e) => setLessonForm({ ...lessonForm, is_published: e.target.checked })}
                    />
                    <span className="text-sm">Xuất bản</span>
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowLessonModal(false)} className="flex-1">
                    Hủy
                  </Button>
                  <Button onClick={handleSaveLesson} className="flex-1" disabled={loadingStates.saving}>
                    <Save className="h-4 w-4 mr-2" />
                    Lưu
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Exercise Modal */}
        {showExerciseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingExercise ? 'Sửa bài tập' : 'Thêm bài tập mới'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Câu hỏi</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    value={exerciseForm.question}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, question: e.target.value })}
                    placeholder="Nhập câu hỏi..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại câu hỏi</label>
                    <select
                      value={exerciseForm.question_type}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, question_type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="multiple_choice">Trắc nghiệm</option>
                      <option value="fill_blank">Điền từ</option>
                      <option value="arrange">Sắp xếp từ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Độ khó</label>
                    <select
                      value={exerciseForm.difficulty}
                      onChange={(e) => setExerciseForm({ ...exerciseForm, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="easy">Dễ</option>
                      <option value="medium">Trung bình</option>
                      <option value="hard">Khó</option>
                    </select>
                  </div>
                </div>
                {exerciseForm.question_type === 'multiple_choice' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Các lựa chọn</label>
                    {exerciseForm.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <span className="w-6 text-gray-500">{String.fromCharCode(65 + idx)}.</span>
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...exerciseForm.options];
                            newOpts[idx] = e.target.value;
                            setExerciseForm({ ...exerciseForm, options: newOpts });
                          }}
                          placeholder={`Lựa chọn ${idx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Đáp án đúng</label>
                  <Input
                    value={exerciseForm.correct_answer}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, correct_answer: e.target.value })}
                    placeholder="Nhập đáp án đúng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giải thích</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    value={exerciseForm.explanation}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, explanation: e.target.value })}
                    placeholder="Giải thích đáp án..."
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowExerciseModal(false)} className="flex-1">
                    Hủy
                  </Button>
                  <Button onClick={handleSaveExercise} className="flex-1" disabled={loadingStates.saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {loadingStates.saving ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Vocabulary Modal */}
        {showVocabularyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingVocab ? 'Sửa từ vựng' : 'Thêm từ vựng mới'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Từ (Hán tự)</label>
                  <Input
                    value={vocabForm.word}
                    onChange={(e) => setVocabForm({ ...vocabForm, word: e.target.value })}
                    placeholder="例如: 你好"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pinyin</label>
                  <Input
                    value={vocabForm.pinyin}
                    onChange={(e) => setVocabForm({ ...vocabForm, pinyin: e.target.value })}
                    placeholder="nǐ hǎo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nghĩa</label>
                  <Input
                    value={vocabForm.meaning}
                    onChange={(e) => setVocabForm({ ...vocabForm, meaning: e.target.value })}
                    placeholder="Xin chào"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ví dụ</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    value={vocabForm.example_sentence}
                    onChange={(e) => setVocabForm({ ...vocabForm, example_sentence: e.target.value })}
                    placeholder="Câu ví dụ..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Danh mục</label>
                    <Input
                      value={vocabForm.category}
                      onChange={(e) => setVocabForm({ ...vocabForm, category: e.target.value })}
                      placeholder="Từ vựng HSK"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cấp độ HSK</label>
                    <select
                      value={vocabForm.hsk_level}
                      onChange={(e) => setVocabForm({ ...vocabForm, hsk_level: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value={1}>HSK 1</option>
                      <option value={2}>HSK 2</option>
                      <option value={3}>HSK 3</option>
                      <option value={4}>HSK 4</option>
                      <option value={5}>HSK 5</option>
                      <option value={6}>HSK 6</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowVocabularyModal(false)} className="flex-1">
                    Hủy
                  </Button>
                  <Button onClick={handleSaveVocab} className="flex-1" disabled={loadingStates.saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {loadingStates.saving ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Resource Modal */}
        {showResourceModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingResource ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề</label>
                  <Input
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    placeholder="Tài liệu bài học..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Loại tài liệu</label>
                  <select
                    value={resourceForm.type}
                    onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="link">Link</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <Input
                    value={resourceForm.url}
                    onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea
                    className="w-full p-3 border rounded-lg"
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    placeholder="Mô tả tài liệu..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowResourceModal(false)} className="flex-1">
                    Hủy
                  </Button>
                  <Button onClick={handleSaveResource} className="flex-1" disabled={loadingStates.saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {loadingStates.saving ? 'Đang lưu...' : 'Lưu'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
