import { useState, useEffect } from 'react';
import { Calendar, Target, Clock, Zap, TrendingUp, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { StudyCalendar } from '../components/StudyCalendar';
import { StudyReminderSettings } from '../components/StudyReminderSettings';
import { GoalSettingModal } from '../components/GoalSettingModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { smartScheduler } from '../utils/smartScheduler';
import { LoginPrompt, LoadingSpinner } from '../components/LoginPrompt';

export function Schedule() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'reminders'>('calendar');
  const [learningPattern, setLearningPattern] = useState(smartScheduler.getLearningPattern());
  const [goals, setGoals] = useState(smartScheduler.getStudyGoals());

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading || isLoading) return <LoadingSpinner />;
  if (!user) return <LoginPrompt />;

  const handleGenerateSchedule = () => {
    smartScheduler.generateSmartSchedule(14); // Generate 2 weeks
    window.location.reload();
  };

  const dailyGoal = goals.find(g => g.type === 'daily');
  const weeklyGoal = goals.find(g => g.type === 'weekly');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] p-3 rounded-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">Lịch học & Nhắc nhở</h1>
                <p className="text-muted-foreground mt-1">
                  Quản lý lịch học thông minh và nhận nhắc nhở đúng giờ
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowGoalModal(true)}
              className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
            >
              <Target className="h-4 w-4 mr-2" />
              Đặt mục tiêu
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mục tiêu hôm nay</p>
                <p className="text-2xl font-bold text-foreground">
                  {dailyGoal?.target || 30}p
                </p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((dailyGoal?.current || 0) / (dailyGoal?.target || 30) * 100, 100)}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tuần này</p>
                <p className="text-2xl font-bold text-foreground">
                  {weeklyGoal?.current || 0}/{weeklyGoal?.target || 10}
                </p>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((weeklyGoal?.current || 0) / (weeklyGoal?.target || 10) * 100, 100)}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Thời gian TB</p>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round(learningPattern.averageSessionDuration)}p
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Mỗi phiên học</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Giờ vàng</p>
                <p className="text-2xl font-bold text-foreground">
                  {learningPattern.bestPerformanceTime}:00
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Thời gian học tốt nhất</p>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-3 font-semibold transition-colors relative ${
              activeTab === 'calendar'
                ? 'text-[var(--theme-primary)]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="h-4 w-4 inline mr-2" />
            Lịch học
            {activeTab === 'calendar' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-3 font-semibold transition-colors relative ${
              activeTab === 'reminders'
                ? 'text-[var(--theme-primary)]'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-2" />
            Nhắc nhở
            {activeTab === 'reminders' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'calendar' ? (
              <StudyCalendar />
            ) : (
              <StudyReminderSettings />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">Hành động nhanh</h3>
              <div className="space-y-3">
                <Button
                  onClick={handleGenerateSchedule}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Tạo lịch tự động
                </Button>
                <Button
                  onClick={() => setShowGoalModal(true)}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Chỉnh mục tiêu
                </Button>
              </div>
            </Card>

            {/* Study Insights */}
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--theme-primary)]" />
                Phân tích học tập
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tần suất học</p>
                  <p className="text-lg font-bold text-foreground">
                    {learningPattern.studyFrequency} buổi/tuần
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tỷ lệ hoàn thành</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] h-2 rounded-full"
                        style={{ width: `${learningPattern.completionRate * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {Math.round(learningPattern.completionRate * 100)}%
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Giờ học hiệu quả</p>
                  <div className="space-y-1">
                    {learningPattern.preferredTimes.slice(0, 3).map((time, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="text-foreground font-semibold">
                          {time.hour}:00
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-1.5">
                          <div
                            className="bg-[var(--theme-primary)] h-1.5 rounded-full"
                            style={{ width: `${time.success * 100}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground">
                          {Math.round(time.success * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-gradient-to-br from-[var(--theme-gradient-from)]/10 to-[var(--theme-gradient-to)]/10 border-2 border-[var(--theme-primary)]/20">
              <h3 className="font-bold text-foreground mb-3">💡 Mẹo học tốt</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Học đều đặn mỗi ngày hiệu quả hơn học dồn</li>
                <li>• Tắt thông báo khác khi học để tập trung</li>
                <li>• Nghỉ 5-10 phút sau mỗi 25 phút học</li>
                <li>• Ôn tập kiến thức cũ trước khi học mới</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Goal Setting Modal */}
      <GoalSettingModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSave={(newGoals) => {
          setGoals(newGoals);
          setShowGoalModal(false);
        }}
      />
    </div>
  );
}
