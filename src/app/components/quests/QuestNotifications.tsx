import { X, AlertCircle, Clock, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Notification {
  id: string;
  type: 'new_quest' | 'expiring' | 'completed' | 'reward';
  title: string;
  message: string;
  icon: string;
  timestamp: Date;
}

interface QuestNotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function QuestNotifications({ notifications, onDismiss }: QuestNotificationsProps) {
  const [visible, setVisible] = useState<string[]>([]);

  useEffect(() => {
    // Show notifications one by one
    notifications.forEach((notif, index) => {
      setTimeout(() => {
        setVisible((prev) => [...prev, notif.id]);
      }, index * 200);

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        handleDismiss(notif.id);
      }, 5000 + index * 200);
    });
  }, [notifications]);

  const handleDismiss = (id: string) => {
    setVisible((prev) => prev.filter((nid) => nid !== id));
    setTimeout(() => {
      onDismiss(id);
    }, 300);
  };

  const getTypeStyles = (type: Notification['type']) => {
    const styles = {
      new_quest: {
        bg: 'from-blue-500 to-cyan-500',
        icon: Star
      },
      expiring: {
        bg: 'from-orange-500 to-red-500',
        icon: Clock
      },
      completed: {
        bg: 'from-green-500 to-emerald-500',
        icon: Star
      },
      reward: {
        bg: 'from-yellow-500 to-orange-500',
        icon: Star
      }
    };
    return styles[type];
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map((notification) => {
        const isVisible = visible.includes(notification.id);
        const typeStyle = getTypeStyles(notification.type);
        const Icon = typeStyle.icon;

        return (
          <div
            key={notification.id}
            className={`transform transition-all duration-300 ${
              isVisible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0'
            }`}
          >
            <div className={`bg-gradient-to-r ${typeStyle.bg} rounded-xl shadow-lg overflow-hidden`}>
              <div className="p-4 flex items-start gap-3 text-white">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-900/60 backdrop-blur-sm rounded-lg flex items-center justify-center text-2xl border border-white/30">
                    {notification.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold mb-1">{notification.title}</h4>
                  <p className="text-sm text-white">{notification.message}</p>
                  <div className="text-xs text-white/80 mt-1">
                    {notification.timestamp.toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => handleDismiss(notification.id)}
                  className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-gray-900/40 border-t border-white/10">
                <div
                  className="h-1 bg-white animate-notification-progress"
                  style={{ animationDuration: '5s' }}
                />
              </div>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes notification-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-notification-progress {
          animation: notification-progress linear forwards;
        }
      `}</style>
    </div>
  );
}

// Hook to manage notifications
export function useQuestNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    type: Notification['type'],
    title: string,
    message: string,
    icon: string
  ) => {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
      icon,
      timestamp: new Date()
    };

    setNotifications((prev) => [...prev, notification]);
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return {
    notifications,
    addNotification,
    dismissNotification
  };
}