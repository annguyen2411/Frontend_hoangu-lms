import { Card } from './ui/Card';
import { Activity } from '../utils/socialSystem';
import { motion } from 'motion/react';

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'lesson_completed':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'achievement_earned':
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      case 'streak_milestone':
        return 'bg-orange-100 dark:bg-orange-900/30';
      case 'course_completed':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'level_up':
        return 'bg-purple-100 dark:bg-purple-900/30';
      case 'friend_added':
        return 'bg-pink-100 dark:bg-pink-900/30';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30';
    }
  };

  if (displayActivities.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-4xl mb-3">📊</div>
        <p className="text-muted-foreground">Chưa có hoạt động nào</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-foreground mb-4">Hoạt động gần đây</h3>
      <div className="space-y-3">
        {displayActivities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
          >
            <div className={`w-10 h-10 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center flex-shrink-0 text-xl`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-foreground">
                    <span className="font-semibold">{activity.userName}</span>{' '}
                    <span className="text-muted-foreground">{activity.description}</span>
                  </p>
                  {activity.metadata && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.metadata.details}
                    </p>
                  )}
                </div>
                <img
                  src={activity.userAvatar}
                  alt={activity.userName}
                  className="w-8 h-8 rounded-full flex-shrink-0"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatTimeAgo(activity.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}