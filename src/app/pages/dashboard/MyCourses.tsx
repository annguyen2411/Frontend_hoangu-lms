import { Link } from 'react-router';
import { BookOpen, Clock, Play, Award, TrendingUp, ChevronRight, CheckCircle, Lock, Flame } from 'lucide-react';
import { authUtils } from '../../utils/auth';
import { courses } from '../../data/mockData';
import { Button } from '../../components/ui/Button';
import { Progress } from '../../components/ui/Progress';
import { motion } from 'motion/react';

export function MyCourses() {
  const user = authUtils.getCurrentUser();
  if (!user) return null;

  const enrolledCourses = courses.filter(c => user.enrolledCourses.includes(c.id));
  
  const totalProgress = Math.round(
    Object.values(user.progress).reduce((a, b) => a + b, 0) / (user.enrolledCourses.length || 1)
  );

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
      label: 'Học tuần này',
      value: '8.5h',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      icon: Award,
      label: 'Chứng chỉ',
      value: '2',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-12">
      {/* Header */}
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

      {/* Stats */}
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

      {/* Courses List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Đang học</h2>
        
        {enrolledCourses.length > 0 ? (
          <div className="space-y-4">
            {enrolledCourses.map((course, index) => {
              const progress = user.progress[course.id] || 0;
              const lessonsCompleted = Math.round((progress / 100) * course.totalLessons);
              
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                    <div className="flex flex-col md:flex-row">
                      {/* Thumbnail */}
                      <div className="relative md:w-72 flex-shrink-0">
                        <img
                          src={course.thumbnail}
                          alt={course.titleVi}
                          className="w-full h-48 md:h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:bg-none md:hidden" />
                        {progress === 100 && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Hoàn thành
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            {/* Level Badge */}
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3 ${
                              course.hskLevel === 1 ? 'bg-green-500' :
                              course.hskLevel === 2 ? 'bg-blue-500' :
                              course.hskLevel === 3 ? 'bg-purple-500' :
                              'bg-orange-500'
                            }`}>
                              HSK {course.hskLevel} - {course.level}
                            </span>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[var(--primary)] transition-colors">
                              {course.titleVi}
                            </h3>

                            {/* Teacher */}
                            <div className="flex items-center gap-2 mb-4">
                              <img
                                src={course.teacher.avatar}
                                alt={course.teacher.nameVi}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="text-gray-600">{course.teacher.nameVi}</span>
                              {course.teacher.isNative && (
                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                  Bản xứ
                                </span>
                              )}
                            </div>

                            {/* Progress */}
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

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.totalLessons} bài học</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{course.duration}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{lessonsCompleted}/{course.totalLessons} hoàn thành</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex md:flex-col gap-3 md:items-end">
                            <Link to={`/courses/${course.slug}`} className="flex-1 md:flex-none">
                              <Button className="w-full bg-gradient-to-r from-[var(--primary)] to-red-600 hover:opacity-90 text-white font-semibold shadow-lg group-hover:shadow-xl transition-all">
                                <Play className="h-5 w-5 mr-2" />
                                {progress === 0 ? 'Bắt đầu' : progress === 100 ? 'Ôn tập' : 'Tiếp tục'}
                              </Button>
                            </Link>
                            {progress > 0 && progress < 100 && (
                              <Link to={`/courses/${course.slug}/lesson/${Math.ceil((progress / 100) * course.totalLessons)}`}>
                                <Button variant="outline" className="border-gray-300 hover:border-[var(--primary)] hover:text-[var(--primary)]">
                                  <ChevronRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
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
