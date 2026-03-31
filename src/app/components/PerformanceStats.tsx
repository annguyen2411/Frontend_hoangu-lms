import { Card } from './ui/Card';
import { Clock, BookOpen, Trophy, TrendingUp, Zap, Award, Target, Flame } from 'lucide-react';
import { progressTracker } from '../utils/progressTracker';

export function PerformanceStats() {
  const metrics = progressTracker.getMetrics();

  const stats = [
    {
      icon: Clock,
      label: 'Tổng thời gian học',
      value: `${Math.floor(metrics.totalStudyTime / 60)}h ${metrics.totalStudyTime % 60}p`,
      color: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: '+12%'
    },
    {
      icon: BookOpen,
      label: 'Bài học hoàn thành',
      value: metrics.lessonsCompleted.toString(),
      color: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      trend: '+8 tuần này'
    },
    {
      icon: Trophy,
      label: 'Điểm trung bình',
      value: `${Math.round(metrics.averageScore)}/100`,
      color: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: '+5%'
    },
    {
      icon: Flame,
      label: 'Streak hiện tại',
      value: `${metrics.currentStreak} ngày`,
      color: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      trend: metrics.longestStreak > metrics.currentStreak ? `Kỷ lục: ${metrics.longestStreak}` : 'Kỷ lục mới!'
    },
    {
      icon: Zap,
      label: 'Tổng kinh nghiệm',
      value: metrics.totalXP.toLocaleString(),
      color: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      trend: `Level ${metrics.currentLevel}`
    },
    {
      icon: Award,
      label: 'Khóa học hoàn thành',
      value: metrics.coursesCompleted.toString(),
      color: 'bg-pink-100 dark:bg-pink-900/30',
      iconColor: 'text-pink-600 dark:text-pink-400',
      trend: `${metrics.coursesCompleted}/10`
    },
    {
      icon: Target,
      label: 'Tỷ lệ hoàn thành',
      value: `${Math.round(metrics.completionRate * 100)}%`,
      color: 'bg-indigo-100 dark:bg-indigo-900/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      trend: metrics.completionRate >= 0.8 ? 'Xuất sắc!' : 'Cố gắng thêm!'
    },
    {
      icon: TrendingUp,
      label: 'Phiên học TB',
      value: `${Math.round(metrics.averageSessionDuration)}p`,
      color: 'bg-teal-100 dark:bg-teal-900/30',
      iconColor: 'text-teal-600 dark:text-teal-400',
      trend: 'Lý tưởng'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <Card key={idx} className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-foreground mb-2">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.trend}</p>
          </Card>
        );
      })}
    </div>
  );
}