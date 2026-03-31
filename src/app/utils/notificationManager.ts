// Notification Manager for Study Reminders
import { ScheduledLesson } from './smartScheduler';

class NotificationManager {
  private permission: NotificationPermission = 'default';
  private scheduledNotifications = new Map<string, number>();

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('[Notifications] Not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permission = 'granted';
      return true;
    }

    if (Notification.permission === 'denied') {
      this.permission = 'denied';
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
      return false;
    }
  }

  async scheduleReminder(lesson: ScheduledLesson): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return;
    }

    // Calculate when to show notification
    const lessonTime = new Date(lesson.scheduledTime).getTime();
    const reminderTime = lessonTime - (lesson.reminderTime * 60 * 1000);
    const now = Date.now();
    const delay = reminderTime - now;

    if (delay <= 0) {
      // Already past reminder time
      return;
    }

    // Schedule notification
    const timeoutId = window.setTimeout(() => {
      this.showNotification({
        title: '⏰ Nhắc nhở học tập',
        body: `Còn ${lesson.reminderTime} phút nữa đến giờ học của bạn!`,
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: `reminder-${lesson.id}`,
        requireInteraction: false,
        data: {
          url: '/dashboard',
          lessonId: lesson.id
        },
        actions: [
          { action: 'start', title: 'Bắt đầu ngay' },
          { action: 'dismiss', title: 'Để sau' }
        ]
      });

      this.scheduledNotifications.delete(lesson.id);
    }, delay);

    this.scheduledNotifications.set(lesson.id, timeoutId);
  }

  cancelReminder(lessonId: string): void {
    const timeoutId = this.scheduledNotifications.get(lessonId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.scheduledNotifications.delete(lessonId);
    }
  }

  async showNotification(options: {
    title: string;
    body: string;
    icon?: string;
    badge?: string;
    tag?: string;
    requireInteraction?: boolean;
    data?: any;
    actions?: Array<{ action: string; title: string }>;
  }): Promise<void> {
    if (this.permission !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return;
    }

    try {
      // Use Service Worker for better notification support
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(options.title, {
          body: options.body,
          icon: options.icon || '/icon-192x192.png',
          badge: options.badge || '/icon-72x72.png',
          tag: options.tag,
          requireInteraction: options.requireInteraction,
          data: options.data,
          actions: options.actions,
          vibrate: [200, 100, 200]
        });
      } else {
        // Fallback to regular notification
        new Notification(options.title, {
          body: options.body,
          icon: options.icon,
          tag: options.tag,
          requireInteraction: options.requireInteraction
        });
      }
    } catch (error) {
      console.error('[Notifications] Error showing notification:', error);
    }
  }

  // Daily reminder at specific time
  scheduleDailyReminder(hour: number, minute: number = 0): void {
    const now = new Date();
    const target = new Date(now);
    target.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (target <= now) {
      target.setDate(target.getDate() + 1);
    }

    const delay = target.getTime() - now.getTime();

    setTimeout(() => {
      this.showNotification({
        title: '📚 Đã đến giờ học!',
        body: 'Hãy dành 20 phút để học tiếng Hoa hôm nay nhé!',
        icon: '/icon-192x192.png',
        tag: 'daily-reminder',
        requireInteraction: true,
        data: { url: '/dashboard' },
        actions: [
          { action: 'start', title: 'Học ngay' },
          { action: 'snooze', title: 'Nhắc lại sau 1 giờ' }
        ]
      });

      // Reschedule for tomorrow
      this.scheduleDailyReminder(hour, minute);
    }, delay);
  }

  // Streak protection reminder
  async showStreakProtectionReminder(streakDays: number): Promise<void> {
    await this.showNotification({
      title: `🔥 Streak ${streakDays} ngày đang bị đe dọa!`,
      body: 'Học ít nhất 1 bài để giữ streak của bạn!',
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      tag: 'streak-protection',
      requireInteraction: true,
      data: { url: '/dashboard' },
      actions: [
        { action: 'study', title: 'Cứu streak ngay' },
        { action: 'use-freeze', title: 'Dùng Streak Freeze' }
      ]
    });
  }

  // Achievement unlocked notification
  async showAchievementNotification(achievement: {
    title: string;
    description: string;
    icon: string;
  }): Promise<void> {
    await this.showNotification({
      title: `🏆 ${achievement.title}`,
      body: achievement.description,
      icon: '/icon-192x192.png',
      tag: 'achievement',
      requireInteraction: false,
      data: { url: '/dashboard' }
    });
  }

  // Goal completed notification
  async showGoalCompletedNotification(goalType: string, target: number): Promise<void> {
    await this.showNotification({
      title: '🎯 Hoàn thành mục tiêu!',
      body: `Bạn đã hoàn thành mục tiêu ${goalType}: ${target} phút học tập!`,
      icon: '/icon-192x192.png',
      tag: 'goal-completed',
      requireInteraction: false,
      data: { url: '/dashboard' }
    });
  }

  // Cancel all scheduled notifications
  cancelAllReminders(): void {
    this.scheduledNotifications.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledNotifications.clear();
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }
}

export const notificationManager = new NotificationManager();
