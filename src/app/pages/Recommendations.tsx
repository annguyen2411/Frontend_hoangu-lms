import { useState, useEffect } from 'react';
import { Star, Users, BookOpen, ChevronRight, Target, Clock, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { api } from '../../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  level: string;
  category: string;
  price_vnd: number;
  original_price_vnd: number;
  rating: number;
  students_enrolled: number;
  total_lessons: number;
}

export function Recommendations() {
  const { user, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadRecommendations();
    }
  }, [isAuthenticated]);

  const loadRecommendations = async () => {
    try {
      const res = await api.student.getRecommendations();
      if (res.success) setCourses(res.data);
    } catch (err) {
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập để xem gợi ý</h2>
          <p className="text-gray-600">Đăng nhập để nhận gợi ý khóa học phù hợp với bạn</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900">Gợi ý cho bạn</h1>
          </div>
          <p className="text-gray-600">
            Dựa trên trình độ hiện tại của bạn (cấp {user?.level || 1})
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                  <div className="aspect-video bg-gray-200 relative">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {course.level === 'beginner' && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs rounded">Sơ cấp</span>
                    )}
                    {course.level === 'intermediate' && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded">Trung cấp</span>
                    )}
                    {course.level === 'advanced' && (
                      <span className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded">Nâng cao</span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {course.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.students_enrolled || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.total_lessons || 0} bài
                      </span>
                    </div>

                      <div className="flex items-center justify-between">
                      <div>
                        {(course.price_vnd > 0 && course.course_type !== 'free') ? (
                          <>
                            <span className="text-lg font-bold text-red-600">
                              {course.price_vnd.toLocaleString('vi-VN')} ₫
                            </span>
                            {course.original_price_vnd > course.price_vnd && (
                              <span className="ml-2 text-sm text-gray-400 line-through">
                                {course.original_price_vnd.toLocaleString('vi-VN')} ₫
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-lg font-bold text-green-600">Miễn phí</span>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Sparkles className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có gợi ý</h3>
            <p className="text-gray-500">Hãy hoàn thành một số bài học để nhận gợi ý</p>
          </Card>
        )}
      </div>
    </div>
  );
}
