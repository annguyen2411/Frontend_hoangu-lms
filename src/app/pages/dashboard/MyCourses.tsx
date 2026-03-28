import { useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Clock, Play, Award, TrendingUp, ChevronRight, CheckCircle, Lock, Flame } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCourses, useEnrollments } from '../../hooks/useData';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { motion } from 'motion/react';
import { COURSE_LEVEL_LABELS } from '../../constants/enums';
import { LoginPrompt } from '../../components/LoginPrompt';

export function MyCourses() {
  const { profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const { courses, loading: coursesLoading } = useCourses({ publishedOnly: true });
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(profile?.id);

  // Get enrolled courses by matching enrollments with courses
  const enrolledCourses = courses.filter(course => 
    enrollments.some(e => e.course_id === course.id)
  );

  const totalProgress = enrollments.length > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
    : 0;

  if (authLoading || enrollmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-[var(--primary)] rounded-full animate-bounce"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  const stats = [
    {
      icon: BookOpen,
      label: 'Khóa học',
      value: enrolledCourses.length,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: TrendingUp,
      label: 'Tiến độ TB',
      value: `${totalProgress}%`,
      color: 'bg-green-100 text-green-600',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${profile?.streak || 0} ngày`,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Award,
      label: 'Level',
      value: profile?.level || 1,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  const getLevelLabel = (level: string) => {
    return COURSE_LEVEL_LABELS[level as keyof typeof COURSE_LEVEL_LABELS] || level;
  };

  // Wait for courses to load
  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-[var(--primary)] rounded-full animate-bounce"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
      <div className="bg-gradient-to-r from-[var(--primary)] to-red-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Khóa học của tôi</h1>
              <p className="text-white/80">
                Tiếp tục hành trình học tiếng Hoa của bạn
              </p>
            </div>
            <Link to="/courses">
              <Button className="bg-white text-[var(--primary)] hover:bg-gray-100 font-semibold">
                <BookOpen className="h-5 w-5 mr-2" />
                Khám phá thêm
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Đang học</h2>
        
        {enrolledCourses.length > 0 ? (
          <div className="space-y-4">
            {enrolledCourses.map((course, index) => {
              const enrollment = enrollments.find(e => e.course_id === course.id);
              const progress = enrollment?.progress || 0;
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                    <div className="flex flex-col md:flex-row">
                      <div className="relative md:w-72 flex-shrink-0">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-48 md:h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 md:h-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                            <BookOpen className="h-12 w-12 text-white/50" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-none md:hidden" />
                        {progress >= 100 && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Hoàn thành
                          </div>
                        )}
                      </div>

                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3 ${
                              course.level === 'beginner' ? 'bg-green-500' :
                              course.level === 'intermediate' ? 'bg-blue-500' :
                              course.level === 'advanced' ? 'bg-purple-500' :
                              'bg-orange-500'
                            }`}>
                              {course.category} - {getLevelLabel(course.level)}
                            </span>

                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors">
                              {course.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-4">
                              <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-bold">
                                {course.teacher_name?.[0] || 'G'}
                              </div>
                              <span className="text-gray-600">{course.teacher_name || 'Giảng viên HoaNgữ'}</span>
                            </div>

                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-gray-500">Tiến độ</span>
                                <span className="font-semibold text-gray-900">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                  className="h-full bg-gradient-to-r from-[var(--primary)] to-red-500 rounded-full"
                                />
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.total_lessons} bài học</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.duration_hours ? `${course.duration_hours}h` : 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex md:flex-col gap-3 md:items-end">
                            <Link to={`/courses/${course.slug}`} className="flex-1 md:flex-none">
                              <Button className="w-full bg-gradient-to-r from-[var(--primary)] to-red-600 hover:opacity-90 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all">
                                <Play className="h-5 w-5 mr-2" />
                                {progress === 0 ? 'Bắt đầu' : progress >= 100 ? 'Ôn tập' : 'Tiếp tục'}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có khóa học nào</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Bạn chưa đăng ký khóa học nào. Khám phá các khóa học chất lượng để bắt đầu hành trình học tiếng Hoa.
            </p>
            <Link to="/courses">
              <Button className="bg-gradient-to-r from-[var(--primary)] to-red-600 hover:opacity-90 text-white font-semibold">
                <BookOpen className="h-5 w-5 mr-2" />
                Khám phá khóa học
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
