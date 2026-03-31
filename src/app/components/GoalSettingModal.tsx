import { useState } from 'react';
import { X, Target, Clock, BookOpen, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { smartScheduler, StudyGoal } from '../utils/smartScheduler';

interface GoalSettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (goals: StudyGoal[]) => void;
}

export function GoalSettingModal({ isOpen, onClose, onSave }: GoalSettingModalProps) {
  const existingGoals = smartScheduler.getStudyGoals();
  
  const [dailyMinutes, setDailyMinutes] = useState(
    existingGoals.find(g => g.type === 'daily')?.target || 30
  );
  const [weeklyLessons, setWeeklyLessons] = useState(
    existingGoals.find(g => g.type === 'weekly')?.target || 10
  );
  const [monthlyHours, setMonthlyHours] = useState(
    existingGoals.find(g => g.type === 'monthly')?.target || 20
  );

  const handleSave = () => {
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const monthEnd = new Date(today);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const goals: StudyGoal[] = [
      {
        id: 'daily-minutes',
        type: 'daily',
        target: dailyMinutes,
        unit: 'minutes',
        current: 0,
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      {
        id: 'weekly-lessons',
        type: 'weekly',
        target: weeklyLessons,
        unit: 'lessons',
        current: 0,
        startDate: today,
        endDate: weekEnd
      },
      {
        id: 'monthly-hours',
        type: 'monthly',
        target: monthlyHours,
        unit: 'minutes',
        current: 0,
        startDate: today,
        endDate: monthEnd
      }
    ];

    smartScheduler.saveStudyGoals(goals);
    onSave?.(goals);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <Card className="p-6 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-2xl flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Đặt mục tiêu học tập
                </h2>
                <p className="text-muted-foreground">
                  Thiết lập mục tiêu để duy trì động lực và tiến bộ đều đặn
                </p>
              </div>

              {/* Goals Form */}
              <div className="space-y-6">
                {/* Daily Goal */}
                <div className="p-5 border-2 border-border rounded-xl hover:border-[var(--theme-primary)] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-lg font-bold text-foreground mb-2 block">
                        Mục tiêu hàng ngày
                      </Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Số phút học mỗi ngày để xây dựng thói quen
                      </p>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="5"
                          max="180"
                          step="5"
                          value={dailyMinutes}
                          onChange={(e) => setDailyMinutes(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-foreground font-semibold">phút/ngày</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {[15, 30, 45, 60].map(min => (
                          <button
                            key={min}
                            onClick={() => setDailyMinutes(min)}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                              dailyMinutes === min
                                ? 'bg-[var(--theme-primary)] text-white'
                                : 'bg-accent text-foreground hover:bg-accent/80'
                            }`}
                          >
                            {min}p
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Goal */}
                <div className="p-5 border-2 border-border rounded-xl hover:border-[var(--theme-primary)] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-lg font-bold text-foreground mb-2 block">
                        Mục tiêu hàng tuần
                      </Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Số bài học hoàn thành mỗi tuần
                      </p>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={weeklyLessons}
                          onChange={(e) => setWeeklyLessons(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-foreground font-semibold">bài/tuần</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {[5, 10, 15, 20].map(lessons => (
                          <button
                            key={lessons}
                            onClick={() => setWeeklyLessons(lessons)}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                              weeklyLessons === lessons
                                ? 'bg-[var(--theme-primary)] text-white'
                                : 'bg-accent text-foreground hover:bg-accent/80'
                            }`}
                          >
                            {lessons}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Goal */}
                <div className="p-5 border-2 border-border rounded-xl hover:border-[var(--theme-primary)] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-lg font-bold text-foreground mb-2 block">
                        Mục tiêu hàng tháng
                      </Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tổng số giờ học trong tháng
                      </p>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={monthlyHours}
                          onChange={(e) => setMonthlyHours(Number(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-foreground font-semibold">giờ/tháng</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        {[10, 20, 30, 40].map(hours => (
                          <button
                            key={hours}
                            onClick={() => setMonthlyHours(hours)}
                            className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${
                              monthlyHours === hours
                                ? 'bg-[var(--theme-primary)] text-white'
                                : 'bg-accent text-foreground hover:bg-accent/80'
                            }`}
                          >
                            {hours}h
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estimated Progress */}
                <div className="bg-accent/50 rounded-xl p-5 border border-border">
                  <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[var(--theme-primary)]" />
                    Dự kiến tiến độ
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Với {dailyMinutes} phút/ngày, bạn sẽ học khoảng {Math.round(dailyMinutes * 7 / 60)} giờ/tuần</p>
                    <p>• {weeklyLessons} bài/tuần tương đương ~{Math.round(weeklyLessons / 7)} bài/ngày</p>
                    <p>• Trong 90 ngày, bạn sẽ hoàn thành ~{Math.round(weeklyLessons * 12)} bài học</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white"
                  size="lg"
                >
                  Lưu mục tiêu
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}