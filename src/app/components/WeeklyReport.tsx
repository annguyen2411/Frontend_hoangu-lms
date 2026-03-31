import { Card } from './ui/Card';
import { Calendar, Clock, BookOpen, Trophy, TrendingUp, Flame } from 'lucide-react';
import { progressTracker } from '../utils/progressTracker';

export function WeeklyReport() {
  const report = progressTracker.generateWeeklyReport();
  const metrics = progressTracker.getMetrics();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-lg flex items-center justify-center">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground">Báo cáo tuần</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Thời gian</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{report.studyTime}p</p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Bài học</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{report.lessonsCompleted}</p>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">Điểm TB</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{Math.round(report.averageScore)}</p>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">XP kiếm được</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{report.xpEarned}</p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="mb-6">
        <h4 className="font-bold text-foreground mb-3">Hoạt động hàng ngày</h4>
        <div className="space-y-2">
          {report.dailyBreakdown.map((day, idx) => {
            const dayName = new Date(day.date).toLocaleDateString('vi-VN', { weekday: 'short' });
            const isToday = new Date(day.date).toDateString() === new Date().toDateString();
            const percentage = (day.studyTime / 60) * 100; // Assume 60 min target

            return (
              <div key={idx} className={`flex items-center gap-3 ${isToday ? 'bg-accent rounded-lg p-2' : ''}`}>
                <div className="w-12 text-sm font-semibold text-muted-foreground">
                  {dayName}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      {formatDate(day.date)}
                    </span>
                    <span className="font-semibold text-foreground">
                      {day.studyTime}p • {day.lessonsCompleted} bài
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        day.studyTime > 0
                          ? 'bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]'
                          : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills Improved */}
      {Object.keys(report.skillsImproved).length > 0 && (
        <div className="mb-6">
          <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[var(--theme-primary)]" />
            Kỹ năng cải thiện
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {report.skillsImproved.listening !== undefined && report.skillsImproved.listening > 0 && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <span className="text-2xl">👂</span>
                <div>
                  <p className="text-xs text-muted-foreground">Nghe</p>
                  <p className="font-bold text-foreground">+{report.skillsImproved.listening}</p>
                </div>
              </div>
            )}
            {report.skillsImproved.speaking !== undefined && report.skillsImproved.speaking > 0 && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="text-xs text-muted-foreground">Nói</p>
                  <p className="font-bold text-foreground">+{report.skillsImproved.speaking}</p>
                </div>
              </div>
            )}
            {report.skillsImproved.reading !== undefined && report.skillsImproved.reading > 0 && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <span className="text-2xl">📖</span>
                <div>
                  <p className="text-xs text-muted-foreground">Đọc</p>
                  <p className="font-bold text-foreground">+{report.skillsImproved.reading}</p>
                </div>
              </div>
            )}
            {report.skillsImproved.writing !== undefined && report.skillsImproved.writing > 0 && (
              <div className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                <span className="text-2xl">✍️</span>
                <div>
                  <p className="text-xs text-muted-foreground">Viết</p>
                  <p className="font-bold text-foreground">+{report.skillsImproved.writing}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Streak Status */}
      <div className={`p-4 rounded-lg ${
        report.streakMaintained
          ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
          : 'bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-500'
      }`}>
        <div className="flex items-center gap-3">
          <Flame className={`h-6 w-6 ${
            report.streakMaintained ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
          }`} />
          <div>
            <p className={`font-bold ${
              report.streakMaintained ? 'text-green-900 dark:text-green-100' : 'text-orange-900 dark:text-orange-100'
            }`}>
              {report.streakMaintained 
                ? `🎉 Streak ${metrics.currentStreak} ngày được giữ vững!`
                : `⚠️ Streak có nguy cơ bị gián đoạn`
              }
            </p>
            <p className={`text-sm ${
              report.streakMaintained ? 'text-green-700 dark:text-green-300' : 'text-orange-700 dark:text-orange-300'
            }`}>
              {report.streakMaintained
                ? 'Tiếp tục duy trì để đạt thành tích cao hơn!'
                : 'Hãy học ít nhất 1 bài mỗi ngày để giữ streak'
              }
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}