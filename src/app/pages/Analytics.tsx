import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { PerformanceStats } from '../components/PerformanceStats';
import { StudyTimeChart } from '../components/StudyTimeChart';
import { SkillRadarChart } from '../components/SkillRadarChart';
import { ProgressLineChart } from '../components/ProgressLineChart';
import { WeeklyReport } from '../components/WeeklyReport';
import { progressTracker } from '../utils/progressTracker';
import { LoginPrompt, LoadingSpinner } from '../components/LoginPrompt';

export function Analytics() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly'>('overview');

  useEffect(() => {
    generateSampleData();
    setLoading(false);
  }, []);

  const generateSampleData = () => {
    const sessions = progressTracker.getStudySessions();
    
    // Only generate if no data exists
    if (sessions.length === 0) {
      // Generate 30 days of sample data
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Random study session
        const duration = Math.floor(Math.random() * 40) + 20; // 20-60 minutes
        const lessonsCompleted = Math.floor(Math.random() * 3) + 1; // 1-3 lessons
        const xpEarned = lessonsCompleted * 50 + Math.floor(Math.random() * 50);
        
        progressTracker.recordStudySession({
          date,
          duration,
          lessonsCompleted,
          xpEarned,
          skillsImproved: {
            listening: Math.floor(Math.random() * 3),
            speaking: Math.floor(Math.random() * 3),
            reading: Math.floor(Math.random() * 3),
            writing: Math.floor(Math.random() * 2)
          }
        });

        // Random lesson progress
        for (let j = 0; j < lessonsCompleted; j++) {
          progressTracker.updateLessonProgress({
            lessonId: `lesson-${i}-${j}`,
            courseId: `course-${Math.floor(i / 10)}`,
            completed: true,
            score: Math.floor(Math.random() * 30) + 70, // 70-100
            timeSpent: Math.floor(duration / lessonsCompleted),
            attempts: 1,
            lastAttempt: date,
            completedAt: date
          });
        }
      }
    }
  };

  const handleExportReport = () => {
    const report = progressTracker.generateWeeklyReport();
    const metrics = progressTracker.getMetrics();
    
    const data = {
      report,
      metrics,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hoangu-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading || isLoading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] p-3 rounded-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Thống kê & Phân tích</h1>
                <p className="text-muted-foreground mt-1">
                  Theo dõi tiến độ và hiệu suất học tập của bạn
                </p>
              </div>
            </div>
            <Button
              onClick={handleExportReport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-semibold transition-colors relative ${
              activeTab === 'overview'
                ? 'text-[var(--theme-primary)]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="h-4 w-4 inline mr-2" />
            Tổng quan
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-3 font-semibold transition-colors relative ${
              activeTab === 'weekly'
                ? 'text-[var(--theme-primary)]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Báo cáo tuần
            {activeTab === 'weekly' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <div className="space-y-8">
            {/* Performance Stats */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Chỉ số thành tích</h2>
              <PerformanceStats />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StudyTimeChart />
              <SkillRadarChart />
            </div>

            {/* Charts Row 2 */}
            <div>
              <ProgressLineChart />
            </div>

            {/* Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  Điểm mạnh
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Bạn học đều đặn và có tỷ lệ hoàn thành cao
                </p>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• Streak ổn định {progressTracker.getMetrics().currentStreak} ngày</li>
                  <li>• Điểm số trung bình trên 80</li>
                  <li>• Phân bổ thời gian hợp lý</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl border-2 border-orange-200 dark:border-orange-800">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  Cần cải thiện
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Một số kỹ năng cần thêm thời gian luyện tập
                </p>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• Kỹ năng viết cần thực hành thêm</li>
                  <li>• Tăng thời gian mỗi phiên học</li>
                  <li>• Ôn tập bài cũ thường xuyên hơn</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border-2 border-green-200 dark:border-green-800">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  Gợi ý
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Để đạt hiệu quả tốt hơn
                </p>
                <ul className="space-y-1 text-sm text-foreground">
                  <li>• Học vào buổi tối (19-21h)</li>
                  <li>• Tăng lên 45 phút/phiên</li>
                  <li>• Tập trung vào kỹ năng nghe-nói</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <WeeklyReport />
          </div>
        )}
      </div>
    </div>
  );
}
