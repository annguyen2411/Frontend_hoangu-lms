// Notification System
import { offlineStorage } from './offlineStorage';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'achievement' | 'streak' | 'friend' | 'lesson';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
}

export interface NotificationSettings {
  enabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  achievements: boolean;
  streak: boolean;
  friends: boolean;
  lessons: boolean;
  marketing: boolean;
  soundEnabled: boolean;
}

class NotificationSystem {
  private readonly NOTIFICATIONS_KEY = 'hoangu-notifications';
  private readonly SETTINGS_KEY = 'hoangu-notification-settings';
  private readonly MAX_NOTIFICATIONS = 100;
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  // Get all notifications
  getAll(): Notification[] {
    return offlineStorage.get<Notification[]>(this.NOTIFICATIONS_KEY) || [];
  }

  // Get unread notifications
  getUnread(): Notification[] {
    return this.getAll().filter(n => !n.read);
  }

  // Get unread count
  getUnreadCount(): number {
    return this.getUnread().length;
  }

  // Generate unique ID
  private generateId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
  }

  // Add notification
  add(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };

    const notifications = this.getAll();
    notifications.unshift(newNotification);

    // Keep only last MAX_NOTIFICATIONS
    const trimmed = notifications.slice(0, this.MAX_NOTIFICATIONS);
    offlineStorage.set(this.NOTIFICATIONS_KEY, trimmed);

    // Play sound if enabled
    this.playNotificationSound();

    // Show browser notification
    this.showBrowserNotification(newNotification);

    // Notify listeners
    this.notifyListeners();

    return newNotification;
  }

  // Mark as read
  markAsRead(id: string): void {
    const notifications = this.getAll();
    const notification = notifications.find(n => n.id === id);
    
    if (notification) {
      notification.read = true;
      offlineStorage.set(this.NOTIFICATIONS_KEY, notifications);
      this.notifyListeners();
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    const notifications = this.getAll();
    notifications.forEach(n => n.read = true);
    offlineStorage.set(this.NOTIFICATIONS_KEY, notifications);
    this.notifyListeners();
  }

  // Delete notification
  delete(id: string): void {
    const notifications = this.getAll();
    const filtered = notifications.filter(n => n.id !== id);
    offlineStorage.set(this.NOTIFICATIONS_KEY, filtered);
    this.notifyListeners();
  }

  // Clear all notifications
  clearAll(): void {
    offlineStorage.set(this.NOTIFICATIONS_KEY, []);
    this.notifyListeners();
  }

  // Get settings
  getSettings(): NotificationSettings {
    return offlineStorage.get<NotificationSettings>(this.SETTINGS_KEY) || {
      enabled: true,
      pushEnabled: false,
      emailEnabled: false,
      achievements: true,
      streak: true,
      friends: true,
      lessons: true,
      marketing: false,
      soundEnabled: true,
    };
  }

  // Update settings
  updateSettings(settings: Partial<NotificationSettings>): void {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    offlineStorage.set(this.SETTINGS_KEY, updated);
  }

  // Subscribe to changes
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners
  private notifyListeners(): void {
    const notifications = this.getAll();
    this.listeners.forEach(callback => callback(notifications));
  }

  // Play notification sound
  private playNotificationSound(): void {
    const settings = this.getSettings();
    if (!settings.soundEnabled || !settings.enabled) return;

    try {
      // Simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  // Show browser notification
  private async showBrowserNotification(notification: Notification): Promise<void> {
    const settings = this.getSettings();
    if (!settings.pushEnabled || !settings.enabled) return;

    if (!('Notification' in window)) return;

    // Request permission if needed
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }

    if (Notification.permission === 'granted') {
      try {
        const browserNotification = new Notification(notification.title, {
          body: notification.message,
          icon: notification.icon || '/logo.png',
          badge: '/logo.png',
          tag: notification.id,
          requireInteraction: false,
        });

        browserNotification.onclick = () => {
          window.focus();
          if (notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
          browserNotification.close();
        };
      } catch (error) {
        console.error('Failed to show browser notification:', error);
      }
    }
  }

  // Request push notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    const granted = permission === 'granted';

    if (granted) {
      this.updateSettings({ pushEnabled: true });
    }

    return granted;
  }

  // Helper: Create achievement notification
  achievement(title: string, message: string, icon: string = '🏆'): Notification {
    const settings = this.getSettings();
    if (!settings.achievements || !settings.enabled) {
      return {} as Notification;
    }

    return this.add({
      type: 'achievement',
      title,
      message,
      icon,
      actionUrl: '/dashboard',
      actionLabel: 'Xem chi tiết',
    });
  }

  // Helper: Create streak notification
  streak(days: number): Notification {
    const settings = this.getSettings();
    if (!settings.streak || !settings.enabled) {
      return {} as Notification;
    }

    return this.add({
      type: 'streak',
      title: '🔥 Chuỗi học tập!',
      message: `Bạn đã duy trì chuỗi ${days} ngày! Tiếp tục phát huy!`,
      icon: '🔥',
      actionUrl: '/dashboard',
    });
  }

  // Helper: Create friend notification
  friend(friendName: string, action: 'request' | 'accept'): Notification {
    const settings = this.getSettings();
    if (!settings.friends || !settings.enabled) {
      return {} as Notification;
    }

    const messages = {
      request: `${friendName} đã gửi lời mời kết bạn`,
      accept: `${friendName} đã chấp nhận lời mời kết bạn của bạn`,
    };

    return this.add({
      type: 'friend',
      title: '👥 Bạn bè',
      message: messages[action],
      icon: '👥',
      actionUrl: '/community',
      actionLabel: 'Xem',
    });
  }

  // Helper: Create lesson notification
  lesson(lessonTitle: string, action: 'complete' | 'unlock'): Notification {
    const settings = this.getSettings();
    if (!settings.lessons || !settings.enabled) {
      return {} as Notification;
    }

    const messages = {
      complete: `Bạn đã hoàn thành: ${lessonTitle}`,
      unlock: `Bài học mới đã được mở: ${lessonTitle}`,
    };

    return this.add({
      type: 'lesson',
      title: '📚 Bài học',
      message: messages[action],
      icon: '📚',
      actionUrl: '/courses',
      actionLabel: 'Học tiếp',
    });
  }
}

export const notificationSystem = new NotificationSystem();

// Demo notifications - only in development mode
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  const hasNotifications = notificationSystem.getAll().length > 0;
  
  if (!hasNotifications) {
    setTimeout(() => {
      notificationSystem.achievement(
        'Chào mừng đến HoaNgữ! 🎉',
        'Bắt đầu hành trình học tiếng Hoa của bạn ngay hôm nay!'
      );
    }, 2000);
  }
}
