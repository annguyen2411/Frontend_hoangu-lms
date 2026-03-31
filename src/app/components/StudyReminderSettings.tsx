import { useState, useEffect } from 'react';
import { Bell, Clock, Zap, Flame } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export function StudyReminderSettings() {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [reminders, setReminders] = useState({
    daily: true,
    streak: true,
    goal: true,
    lesson: true
  });
  const [dailyTime, setDailyTime] = useState('20:00');
  const [streakWarning, setStreakWarning] = useState(true);

  useEffect(() => {
    setNotificationPermission(notificationManager.getPermissionStatus());
    
    // Load saved settings
    const saved = localStorage.getItem('reminder-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setReminders(settings.reminders || reminders);
        setDailyTime(settings.dailyTime || '20:00');
        setStreakWarning(settings.streakWarning ?? true);
      } catch (error) {
        console.error('Error loading reminder settings:', error);
      }
    }
  }, []);

  const handleEnableNotifications = async () => {
    const granted = await notificationManager.requestPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    
    if (granted) {
      // Schedule daily reminder
      if (reminders.daily) {
        const [hour, minute] = dailyTime.split(':').map(Number);
        notificationManager.scheduleDailyReminder(hour, minute);
      }
    }
  };

  const handleSaveSettings = () => {
    const settings = {
      reminders,
      dailyTime,
      streakWarning
    };
    localStorage.setItem('reminder-settings', JSON.stringify(settings));

    // Update notifications
    if (notificationPermission === 'granted') {
      if (reminders.daily) {
        const [hour, minute] = dailyTime.split(':').map(Number);
        notificationManager.scheduleDailyReminder(hour, minute);
      } else {
        notificationManager.cancelAllReminders();
      }
    }

    // Show success message
    alert('Đã lưu cài đặt nhắc nhở!');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-lg flex items-center justify-center">
          <Bell className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Nhắc nhở học tập</h2>
          <p className="text-sm text-muted-foreground">
            Thiết lập thông báo để không bỏ lỡ giờ học
          </p>
        </div>
      </div>

      {/* Notification Permission */}
      {notificationPermission !== 'granted' && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Bật thông báo
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-200 mb-3">
                Cho phép thông báo để nhận nhắc nhở học tập đúng giờ
              </p>
              <Button
                onClick={handleEnableNotifications}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Cho phép thông báo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Types */}
      <div className="space-y-4 mb-6">
        {/* Daily Reminder */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <Label className="text-base font-semibold text-foreground block mb-1">
                Nhắc học hàng ngày
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Nhận thông báo mỗi ngày để duy trì thói quen học tập
              </p>
              {reminders.daily && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={dailyTime}
                    onChange={(e) => setDailyTime(e.target.value)}
                    className="px-3 py-1.5 border border-border rounded-lg bg-background text-foreground text-sm"
                  />
                  <span className="text-sm text-muted-foreground">mỗi ngày</span>
                </div>
              )}
            </div>
          </div>
          <Switch
            checked={reminders.daily}
            onCheckedChange={(checked) => setReminders({ ...reminders, daily: checked })}
          />
        </div>

        {/* Streak Protection */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <Label className="text-base font-semibold text-foreground block mb-1">
                Bảo vệ streak
              </Label>
              <p className="text-sm text-muted-foreground">
                Cảnh báo khi streak sắp bị mất vào cuối ngày
              </p>
            </div>
          </div>
          <Switch
            checked={reminders.streak}
            onCheckedChange={(checked) => setReminders({ ...reminders, streak: checked })}
          />
        </div>

        {/* Goal Reminder */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <Label className="text-base font-semibold text-foreground block mb-1">
                Nhắc mục tiêu
              </Label>
              <p className="text-sm text-muted-foreground">
                Thông báo khi sắp hoàn thành hoặc vượt mục tiêu
              </p>
            </div>
          </div>
          <Switch
            checked={reminders.goal}
            onCheckedChange={(checked) => setReminders({ ...reminders, goal: checked })}
          />
        </div>

        {/* Lesson Reminder */}
        <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <Label className="text-base font-semibold text-foreground block mb-1">
                Nhắc bài học đã lên lịch
              </Label>
              <p className="text-sm text-muted-foreground">
                Thông báo 15 phút trước mỗi bài học trong lịch
              </p>
            </div>
          </div>
          <Switch
            checked={reminders.lesson}
            onCheckedChange={(checked) => setReminders({ ...reminders, lesson: checked })}
          />
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-accent/50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[var(--theme-primary)]" />
          Gợi ý thông minh
        </h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>• Thời gian tốt nhất để học: <span className="font-semibold text-foreground">20:00 - 21:00</span></p>
          <p>• Bạn học hiệu quả nhất vào <span className="font-semibold text-foreground">tối</span></p>
          <p>• Nên học <span className="font-semibold text-foreground">20-30 phút</span> mỗi phiên</p>
        </div>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSaveSettings}
        className="w-full bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
        size="lg"
      >
        Lưu cài đặt
      </Button>
    </Card>
  );
}