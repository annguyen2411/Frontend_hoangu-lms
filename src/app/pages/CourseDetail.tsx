import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { Star, Clock, BookOpen, Users, Award, Play, Lock, CheckCircle, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { useCourse, useEnrollments, useLessons } from '../hooks/useData';
import { checkEnrollment } from '../utils/paymentService';
import { COURSE_LEVEL_LABELS } from '../constants/enums';

export function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, profile } = useAuth();
  const { course, loading: courseLoading, error } = useCourse(slug || '');
  const [activeTab, setActiveTab] = useState<'intro' | 'curriculum' | 'reviews' | 'teacher'>('intro');
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  const { lessons, loading: lessonsLoading } = useLessons(course?.id);

  useEffect(() => {
    const checkCourseEnrollment = async () => {
      if (!course?.id || !user) {
        setIsEnrolled(false);
        setCheckingEnrollment(false);
        return;
      }

      try {
        const enrolled = await checkEnrollment(course.id);
        setIsEnrolled(enrolled);
      } catch (err) {
        console.error('Error checking enrollment:', err);
        setIsEnrolled(false);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkCourseEnrollment();
  }, [course?.id, user]);

  useEffect(() => {
    if (lessons.length > 0) {
      setExpandedLessons(new Set([lessons[0].id]));
    }
  }, [lessons]);

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/?auth=login');
      return;
    }
    
    const isFreeCourse = course?.course_type === 'free' || course?.price_vnd === 0;
    
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
          navigate(`/courses/${course.slug}/learn`);
        } else {
          alert(data.error || 'Đăng ký thất bại');
        }
      } catch (err) {
        console.error('Enroll error:', err);
        alert('Có lỗi xảy ra');
      }
    } else {
      navigate(`/checkout/${course?.id}`);
    }
  };

  if (courseLoading || checkingEnrollment) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-[var(--primary)] rounded-full animate-bounce"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Không tìm thấy khóa học</h1>
          <Link to="/courses">
            <Button variant="primary">Quay lại danh sách khóa học</Button>
          </Link>
        </div>
      </div>
    );
  }

  const levelLabel = COURSE_LEVEL_LABELS[course.level as keyof typeof COURSE_LEVEL_LABELS] || course.level;
  const discountAmount = course.original_price_vnd 
    ? course.original_price_vnd - course.price_vnd 
    : 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                {course.category && (
                  <Badge variant="secondary" className="bg-white text-[var(--primary)] font-bold">
                    {course.category}
                  </Badge>
                )}
                <Badge variant="secondary" className="bg-gray-900/80 text-white backdrop-blur-sm border border-white/30">
                  {levelLabel}
                </Badge>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-white mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-400">({course.students_enrolled} học viên)</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{course.total_lessons} bài học</span>
                </div>
                {course.duration_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    <span>{course.duration_hours} giờ</span>
                  </div>
                )}
                {course.has_certificate && (
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span>Có chứng chỉ</span>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-xl overflow-hidden sticky top-24">
                <div className="relative">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <BookOpen className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="h-16 w-16 text-white" />
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    {course.discount_percent > 0 && course.original_price_vnd ? (
                      <>
                        <div className="text-3xl font-bold text-red-600">
                          {course.price_vnd.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="text-lg text-gray-400 line-through">
                          {course.original_price_vnd.toLocaleString('vi-VN')}đ
                        </div>
                        <div className="text-sm text-green-600 font-semibold mt-1">
                          Tiết kiệm {discountAmount.toLocaleString('vi-VN')}đ ({course.discount_percent}%)
                        </div>
                      </>
                    ) : (
                      <div className="text-3xl font-bold text-gray-900">
                        {(course.price_vnd === 0 || course.course_type === 'free') ? 'Miễn phí' : `${course.price_vnd.toLocaleString('vi-VN')}đ`}
                      </div>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Link
                      to={`/courses/${course.slug}/learn`}
                      className="block w-full py-4 bg-green-600 text-white text-center rounded-lg font-bold text-lg hover:bg-green-700 transition-colors mb-3"
                    >
                      Tiếp tục học
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="w-full py-4 bg-gradient-to-r from-red-600 to-yellow-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-opacity mb-3"
                    >
                      {(course.price_vnd === 0 || course.course_type === 'free') ? 'Đăng ký ngay' : 'Mua ngay'}
                    </button>
                  )}

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Thời lượng
                      </span>
                      <span className="font-semibold text-gray-900">
                        {course.duration_hours ? `${course.duration_hours} giờ` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Số bài học
                      </span>
                      <span className="font-semibold text-gray-900">{course.total_lessons} bài</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Chứng chỉ
                      </span>
                      <span className="font-semibold text-gray-900">
                        {course.has_certificate ? 'Có' : 'Không'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-8">
              <div className="flex gap-8">
                {[
                  { id: 'intro', label: 'Giới thiệu' },
                  { id: 'curriculum', label: 'Chương trình học' },
                  { id: 'teacher', label: 'Giảng viên' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`pb-4 px-1 font-semibold transition-colors ${
                      activeTab === tab.id
                        ? 'text-red-600 border-b-2 border-red-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-md p-8">
              {activeTab === 'intro' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Mục tiêu khóa học</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Sau khi hoàn thành khóa học này, bạn sẽ có thể giao tiếp cơ bản bằng tiếng Hoa, 
                    hiểu được các cấu trúc ngữ pháp cơ bản và có nền tảng vững chắc để tiếp tục học các cấp độ cao hơn.
                  </p>

                  <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">
                    Khóa học này dành cho ai?
                  </h2>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      <span>Người mới bắt đầu học tiếng Hoa</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      <span>Người muốn thi chứng chỉ HSK</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      <span>Người có nhu cầu giao tiếp trong công việc</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      <span>Người yêu thích văn hóa Trung Quốc</span>
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Chương trình học</h2>
                  <p className="text-gray-600 mb-6">
                    {course.total_lessons} bài học • {course.duration_hours ? `${course.duration_hours} giờ` : 'N/A'}
                  </p>

                  {lessonsLoading ? (
                    <div className="animate-pulse space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
                      ))}
                    </div>
                  ) : lessons.length > 0 ? (
                    <div className="space-y-3">
                      {lessons.map((lesson, index) => (
                        <div
                          key={lesson.id}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <button
                            onClick={() => toggleLesson(lesson.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.is_free || isEnrolled ? (
                                <Play className="h-5 w-5 text-red-600" />
                              ) : (
                                <Lock className="h-5 w-5 text-gray-400" />
                              )}
                              <div className="text-left">
                                <span className="font-semibold text-gray-900">
                                  Bài {index + 1}: {lesson.title}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {lesson.is_free ? 'Miễn phí' : isEnrolled ? 'Đã đăng ký' : 'Premium'}
                              </span>
                              {expandedLessons.has(lesson.id) ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </button>

                          {expandedLessons.has(lesson.id) && (
                            <div className="px-4 pb-4 bg-gray-50">
                              <p className="text-sm text-gray-600">
                                Bài học thứ {index + 1} trong khóa học
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Chương trình học sẽ được cập nhật sớm
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'teacher' && (
                <div>
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-4xl font-bold">
                      {course.teacher_name?.[0] || 'G'}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {course.teacher_name || 'Giảng viên HoaNgữ'}
                      </h2>
                      <p className="text-lg text-gray-600 mb-4">
                        Giáo viên tiếng Hoa chuyên nghiệp
                      </p>
                      <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        Giáo viên bản xứ
                      </span>
                    </div>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-gray-700">
                      Giảng viên với nhiều năm kinh nghiệm giảng dạy tiếng Hoa, chuyên về phát âm chuẩn Bắc Kinh 
                      và luyện thi HSK. Phương pháp giảng dạy sinh động, dễ hiểu, giúp học viên tiếp thu nhanh chóng.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
