import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Settings, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { api } from '../../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const response = await api.notifications.getAll();
      if (response.success && response.data) {
        setNotifications(response.data);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClearAll = async () => {
    // Just close the dropdown for now
  };

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const getNotificationIcon = (type: string) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      achievement: '🏆',
      streak: '🔥',
      friend: '👥',
      lesson: '📚',
    };
    return icons[type] || 'ℹ️';
  };

  const getNotificationColor = (type: string) => {
    const colors = {
      success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      warning: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      achievement: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      streak: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
      friend: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      lesson: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    };
    return colors[type] || 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-foreground hover:text-[var(--theme-primary)] transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[var(--theme-primary)] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-2xl z-50 max-h-[600px] flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-foreground">Thông báo</h3>
                  <div className="flex items-center gap-2">
                    <Link
                      to="/settings"
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 hover:bg-accent rounded transition-colors"
                      title="Cài đặt thông báo"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1.5 hover:bg-accent rounded transition-colors"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === 'all'
                        ? 'bg-accent text-[var(--theme-primary)]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Tất cả ({notifications.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('unread')}
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                      activeTab === 'unread'
                        ? 'bg-accent text-[var(--theme-primary)]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Chưa đọc ({unreadCount})
                  </button>
                </div>
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-b border-border flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-[var(--theme-primary)] hover:underline flex items-center gap-1"
                    >
                      <Check className="h-3 w-3" />
                      Đánh dấu tất cả đã đọc
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
                  >
                    <Trash2 className="h-3 w-3" />
                    Xóa tất cả
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="text-5xl mb-3">🔔</div>
                    <p className="text-muted-foreground">
                      {activeTab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
                    </p>
                  </div>
                ) : (
                  <div className="p-2 space-y-2">
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-3 rounded-lg border transition-all ${
                          notification.is_read
                            ? 'bg-card border-border'
                            : getNotificationColor(notification.type)
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="text-2xl flex-shrink-0">
                            {notification.icon || getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h4 className="font-semibold text-foreground text-sm">
                                {notification.title}
                              </h4>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-[var(--theme-primary)] rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.timestamp)}
                              </span>
                              <div className="flex gap-1">
                                {notification.actionUrl && (
                                  <Link
                                    to={notification.actionUrl}
                                    onClick={() => {
                                      handleMarkAsRead(notification.id);
                                      setIsOpen(false);
                                    }}
                                    className="text-xs text-[var(--theme-primary)] hover:underline"
                                  >
                                    {notification.actionLabel || 'Xem'}
                                  </Link>
                                )}
                                {!notification.is_read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-xs text-muted-foreground hover:text-foreground"
                                    title="Đánh dấu đã đọc"
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(notification.id)}
                                  className="text-xs text-muted-foreground hover:text-red-600"
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}