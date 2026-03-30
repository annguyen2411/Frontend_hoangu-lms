import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { BookOpen, TrendingUp, Award, Calendar, Clock, Play, Target, Flame, ShoppingBag, Settings, Users, Zap, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useCourses, useEnrollments } from '../hooks/useData';
import { RecommendationsPanel } from '../components/RecommendationsPanel';
import { AdvancedSearch } from '../components/AdvancedSearch';
import { dataExport } from '../utils/dataExport';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoginPrompt } from '../components/LoginPrompt';

export function Dashboard() {
  const { profile, isAuthenticated, isLoading: authLoading } = useAuth();
  const { courses, loading: coursesLoading } = useCourses({ publishedOnly: true });
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(profile?.id);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleExportData = () => {
    dataExport.downloadReport();
    toast.success('Đã xuất báo cáo học tập!');
  };

  const handleSearch = (query: string, _filters: unknown) => {
    toast.info(`Tìm kiếm: ${query}`);
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 bg-[var(--primary)] rounded-full animate-bounce"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  const enrolledCourses = courses.filter(c => 
    enrollments.some(e => e.course_id === c.id)
  );
  
  const totalProgress = enrollments.length > 0
    ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
    : 0;

  const weeklyData = [
    { id: 'mon', day: 'T2', hours: 1.5 },
    { id: 'tue', day: 'T3', hours: 2.0 },
    { id: 'wed', day: 'T4', hours: 1.0 },
    { id: 'thu', day: 'T5', hours: 2.5 },
    { id: 'fri', day: 'T6', hours: 1.5 },
    { id: 'sat', day: 'T7', hours: 3.0 },
    { id: 'sun', day: 'CN', hours: 2.0 }
  ];

  const todayLessons = [
    { id: 1, title: 'Bài 5: Gia đình (家庭)', course: 'HSK 1', time: '09:00', duration: '20 phút' },
    { id: 2, title: 'Luyện phát âm thanh điệu', course: 'Phát âm', time: '14:00', duration: '15 phút' },
    { id: 3, title: 'Flashcard: Từ vựng bài 1-5', course: 'HSK 1', time: '20:00', duration: '10 phút' }
  ];

  const streakDays = profile?.streak || 0;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Xin chào, {profile?.full_name || 'Học viên'}!
          </h1>
          <p className="text-muted-foreground">
            Hãy tiếp tục hành trình học tiếng Hoa của bạn
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card padding="md" className="sticky top-24">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.full_name?.[0] || 'H'}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{profile?.full_name || 'Học viên'}</h3>
                  <Badge variant="primary" size="sm">Học viên</Badge>
                </div>
              </div>

              <nav className="space-y-1">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 bg-[var(--primary)] text-white rounded-lg font-medium"
                >
                  <BookOpen className="h-5 w-5" />
                  Trang chủ
                </Link>
                <Link
                  to="/gamification"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-[var(--muted)] rounded-lg font-medium transition-colors"
                >
                  <Award className="h-5 w-5" />
                  Gamification
                </Link>
                <Link
                  to="/quests"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-[var(--muted)] rounded-lg font-medium transition-colors"
                >
                  <Target className="h-5 w-5" />
                  Nhiệm vụ
                </Link>
                <Link
                  to="/community"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-[var(--muted)] rounded-lg font-medium transition-colors"
                >
                  <Users className="h-5 w-5" />
                  Cộng đồng
                </Link>
                <Link
                  to="/schedule"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-[var(--muted)] rounded-lg font-medium transition-colors"
                >
                  <Calendar className="h-5 w-5" />
                  Lịch học
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-[var(--muted)] rounded-lg font-medium transition-colors"
                >
                  <TrendingUp className="h-5 w-5" />
                  Thống kê
                </Link>
                <Link
                  to="/shop"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-[var(--muted)] rounded-lg font-medium transition-colors"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Cửa hàng
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-[var(--muted)] rounded-lg font-medium transition-colors"
                >
                  <Settings className="h-5 w-5" />
                  Cài đặt
                </Link>
                <Link
                  to="/certificates"
                  className="flex items-center gap-3 px-4 py-3 text-foreground hover:bg-[var(--muted)] rounded-lg font-medium transition-colors"
                >
                  <Award className="h-5 w-5" />
                  Chứng chỉ
                </Link>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3 text-foreground hover:bg-[var(--muted)] rounded-lg font-medium transition-colors"
                  onClick={handleExportData}
                >
                  <Download className="h-5 w-5" />
                  Xuất báo cáo
                </button>
              </nav>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-xl shadow-lg text-white p-8 mb-8">
              <h1 className="text-3xl font-extrabold mb-2 drop-shadow-lg">
                Chào {profile?.full_name || 'Học viên'}!
              </h1>
              <p className="font-semibold mb-6 drop-shadow-md">
                Hôm nay là {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{streakDays}</div>
                  <div className="text-sm font-semibold flex items-center gap-1">
                    <Flame className="h-4 w-4" />
                    Ngày liên tiếp
                  </div>
                </div>
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{profile?.level || 1}</div>
                  <div className="text-sm font-semibold">Level</div>
                </div>
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{profile?.xp || 0}</div>
                  <div className="text-sm font-semibold">XP</div>
                </div>
                <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">{profile?.coins || 0}</div>
                  <div className="text-sm font-semibold">Xu</div>
                </div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-card rounded-xl shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-[var(--theme-primary)]" />
                  Lịch học hôm nay
                </h2>
                <span className="text-sm text-muted-foreground">{todayLessons.length} bài học</span>
              </div>

              <div className="space-y-4">
                {todayLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-[var(--theme-primary)] hover:bg-accent/50 transition-all cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-lg flex items-center justify-center">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{lesson.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {lesson.course}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {lesson.duration}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-[var(--theme-primary)]">{lesson.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* My Courses */}
              <div className="bg-card rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Khóa học của tôi</h2>
                <div className="space-y-4">
                  {enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course) => {
                      const enrollment = enrollments.find(e => e.course_id === course.id);
                      return (
                        <div key={course.id} className="border border-border rounded-lg p-4">
                          <div className="flex items-start gap-4">
                            {course.thumbnail_url ? (
                              <img
                                src={course.thumbnail_url}
                                alt={course.title}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
                                <BookOpen className="h-8 w-8 text-[var(--primary)]" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-2 line-clamp-1">
                                {course.title}
                              </h3>
                              <div className="mb-2">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">Tiến độ</span>
                                  <span className="font-semibold text-[var(--theme-primary)]">
                                    {enrollment?.progress || 0}%
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] h-2 rounded-full transition-all"
                                    style={{ width: `${enrollment?.progress || 0}%` }}
                                  />
                                </div>
                              </div>
                              <Link
                                to={`/courses/${course.slug}`}
                                className="text-sm text-[var(--theme-primary)] hover:opacity-80 font-semibold"
                              >
                                Tiếp tục học →
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground mb-4">Bạn chưa đăng ký khóa học nào</p>
                      <Link
                        to="/courses"
                        className="inline-block px-4 py-2 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                      >
                        Khám phá khóa học
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Chart */}
              <div className="bg-card rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-foreground mb-6">Biểu đồ học tập 7 ngày</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid key="grid-dashboard" strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      key="xaxis-dashboard"
                      dataKey="day"
                      stroke="var(--muted-foreground)"
                    />
                    <YAxis key="yaxis-dashboard" stroke="var(--muted-foreground)" />
                    <Tooltip
                      key="tooltip-dashboard"
                      contentStyle={{
                        backgroundColor: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Line
                      key="line-dashboard"
                      type="monotone"
                      dataKey="hours"
                      stroke="var(--theme-primary)"
                      strokeWidth={3}
                      dot={{ fill: 'var(--theme-primary)', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-4 p-4 bg-accent rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tổng thời gian tuần này</span>
                    <span className="text-xl font-bold text-[var(--theme-primary)]">
                      {weeklyData.reduce((a, b) => a + b.hours, 0)} giờ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button className="bg-card rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-[var(--theme-primary)]" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Flashcard</h3>
                <p className="text-sm text-muted-foreground">Ôn tập từ vựng với thuật toán Spaced Repetition</p>
              </button>

              <button className="bg-card rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left">
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Play className="h-6 w-6 text-[var(--theme-primary)]" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Luyện nói</h3>
                <p className="text-sm text-muted-foreground">Thực hành phát âm với AI chấm điểm</p>
              </button>

              <Link
                to="/courses"
                className="bg-card rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-[var(--theme-primary)]" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Khóa học mới</h3>
                <p className="text-sm text-muted-foreground">Khám phá thêm khóa học phù hợp với bạn</p>
              </Link>
            </div>

            {/* Recommendations Panel */}
            <div className="mt-8">
              <button
                className="bg-card rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-[var(--theme-primary)]" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Khám phá thêm</h3>
                <p className="text-sm text-muted-foreground">Nhận các gợi ý khóa học phù hợp</p>
              </button>
              {showRecommendations && <RecommendationsPanel />}
            </div>

            {/* Advanced Search */}
            <div className="mt-8">
              <button
                className="bg-card rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-left"
                onClick={() => setShowSearch(!showSearch)}
              >
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-[var(--theme-primary)]" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Tìm kiếm nâng cao</h3>
                <p className="text-sm text-muted-foreground">Tìm kiếm khóa học theo nhiều tiêu chí</p>
              </button>
              {showSearch && <AdvancedSearch onSearch={handleSearch} />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
