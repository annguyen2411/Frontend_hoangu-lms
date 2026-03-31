import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Target, Play } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { smartScheduler, ScheduledLesson } from '../utils/smartScheduler';

const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export function StudyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [schedule] = useState<ScheduledLesson[]>(smartScheduler.getSchedule());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getLessonsForDate = (date: Date): ScheduledLesson[] => {
    return schedule.filter(lesson => {
      const lessonDate = new Date(lesson.scheduledTime);
      return (
        lessonDate.getDate() === date.getDate() &&
        lessonDate.getMonth() === date.getMonth() &&
        lessonDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const date = isCurrentMonth ? new Date(year, month, dayNumber) : null;
      const isToday = date && 
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();
      const isSelected = date && selectedDate &&
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();
      
      const lessons = date ? getLessonsForDate(date) : [];
      const hasLessons = lessons.length > 0;

      days.push(
        <button
          key={i}
          onClick={() => date && setSelectedDate(date)}
          disabled={!isCurrentMonth}
          className={`
            aspect-square p-2 rounded-lg transition-all relative
            ${!isCurrentMonth ? 'invisible' : ''}
            ${isToday ? 'bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] text-white font-bold' : ''}
            ${isSelected && !isToday ? 'bg-accent border-2 border-[var(--theme-primary)]' : ''}
            ${!isToday && !isSelected ? 'hover:bg-accent' : ''}
          `}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <span className={`text-sm ${isToday ? 'text-white' : 'text-foreground'}`}>
              {isCurrentMonth ? dayNumber : ''}
            </span>
            {hasLessons && (
              <div className="flex gap-1 mt-1">
                {lessons.slice(0, 3).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1 h-1 rounded-full ${
                      isToday ? 'bg-white' : 'bg-[var(--theme-primary)]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </button>
      );
    }

    return days;
  };

  const selectedLessons = selectedDate ? getLessonsForDate(selectedDate) : [];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)] rounded-lg flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Lịch học</h2>
            <p className="text-sm text-muted-foreground">
              {MONTHS[month]} {year}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {renderCalendarDays()}
      </div>

      {/* Selected date lessons */}
      {selectedDate && (
        <div className="border-t border-border pt-6">
          <h3 className="font-bold text-foreground mb-4">
            {selectedDate.toLocaleDateString('vi-VN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          {selectedLessons.length > 0 ? (
            <div className="space-y-3">
              {selectedLessons.map((lesson, idx) => {
                const time = new Date(lesson.scheduledTime);
                const isPast = time < new Date();
                
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      isPast 
                        ? 'border-border bg-muted/50 opacity-60' 
                        : 'border-[var(--theme-primary)] bg-accent/50 hover:bg-accent'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isPast ? 'bg-muted' : 'bg-gradient-to-br from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]'
                    }`}>
                      <Clock className={`h-6 w-6 ${isPast ? 'text-muted-foreground' : 'text-white'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">
                          {time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          lesson.priority === 'high' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                            : lesson.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {lesson.priority === 'high' ? 'Ưu tiên cao' : lesson.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="capitalize">{lesson.type === 'regular' ? 'Bài học' : lesson.type === 'review' ? 'Ôn tập' : 'Luyện tập'}</span>
                        {' • '}
                        {lesson.duration} phút
                      </div>
                    </div>
                    {!isPast && (
                      <Button size="sm" className="bg-gradient-to-r from-[var(--theme-gradient-from)] to-[var(--theme-gradient-to)]">
                        <Play className="h-4 w-4 mr-1" />
                        Bắt đầu
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Chưa có lịch học nào</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  const newSchedule = smartScheduler.generateSmartSchedule(7);
                  window.location.reload();
                }}
              >
                Tạo lịch học tự động
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}