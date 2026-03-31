// Smart Scheduling Algorithm for HoaNgữ
import { offlineStorage } from './offlineStorage';

export interface StudySession {
  id: string;
  date: Date;
  duration: number; // in minutes
  completed: boolean;
  courseId: string;
  lessonId: string;
  score?: number;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface UserLearningPattern {
  preferredTimes: Array<{ hour: number; success: number }>; // success rate 0-1
  averageSessionDuration: number;
  bestPerformanceTime: number; // hour of day
  studyFrequency: number; // sessions per week
  completionRate: number;
  lastUpdated: Date;
}

export interface StudyGoal {
  id: string;
  type: 'daily' | 'weekly' | 'monthly';
  target: number; // minutes or lessons
  unit: 'minutes' | 'lessons';
  current: number;
  startDate: Date;
  endDate: Date;
}

export interface ScheduledLesson {
  id: string;
  courseId: string;
  lessonId: string;
  scheduledTime: Date;
  duration: number;
  priority: 'high' | 'medium' | 'low';
  type: 'regular' | 'review' | 'practice';
  reminderEnabled: boolean;
  reminderTime: number; // minutes before
}

class SmartScheduler {
  private readonly STORAGE_KEY = 'hoangu-study-sessions';
  private readonly PATTERN_KEY = 'hoangu-learning-pattern';
  private readonly GOALS_KEY = 'hoangu-study-goals';
  private readonly SCHEDULE_KEY = 'hoangu-scheduled-lessons';

  // Analyze user's learning pattern
  analyzeLearningPattern(): UserLearningPattern {
    const sessions = this.getStudySessions();
    
    if (sessions.length === 0) {
      return this.getDefaultPattern();
    }

    const hourlyPerformance = new Map<number, { total: number; success: number }>();
    let totalDuration = 0;
    let completedSessions = 0;

    sessions.forEach(session => {
      const hour = new Date(session.date).getHours();
      
      if (!hourlyPerformance.has(hour)) {
        hourlyPerformance.set(hour, { total: 0, success: 0 });
      }
      
      const perf = hourlyPerformance.get(hour)!;
      perf.total++;
      if (session.completed) {
        perf.success++;
        completedSessions++;
      }
      
      totalDuration += session.duration;
    });

    // Calculate preferred times
    const preferredTimes = Array.from(hourlyPerformance.entries())
      .map(([hour, data]) => ({
        hour,
        success: data.success / data.total
      }))
      .sort((a, b) => b.success - a.success);

    // Find best performance time
    const bestPerformanceTime = preferredTimes.length > 0 
      ? preferredTimes[0].hour 
      : 20; // Default 8 PM

    return {
      preferredTimes,
      averageSessionDuration: totalDuration / sessions.length,
      bestPerformanceTime,
      studyFrequency: this.calculateWeeklyFrequency(sessions),
      completionRate: completedSessions / sessions.length,
      lastUpdated: new Date()
    };
  }

  // Generate optimal study schedule
  generateSmartSchedule(days: number = 7): ScheduledLesson[] {
    const pattern = this.analyzeLearningPattern();
    const goals = this.getStudyGoals();
    const schedule: ScheduledLesson[] = [];

    const dailyGoal = goals.find(g => g.type === 'daily');
    const targetMinutes = dailyGoal?.target || 30;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Skip if it's in the past
      if (date < new Date()) continue;

      // Determine best time for this day
      const bestHour = this.getBestStudyTime(date, pattern);
      date.setHours(bestHour, 0, 0, 0);

      // Create scheduled lessons
      const lessonsNeeded = Math.ceil(targetMinutes / pattern.averageSessionDuration);
      
      for (let j = 0; j < lessonsNeeded; j++) {
        const lessonTime = new Date(date);
        lessonTime.setMinutes(j * (pattern.averageSessionDuration + 10)); // 10 min break

        schedule.push({
          id: `scheduled-${date.getTime()}-${j}`,
          courseId: 'auto', // Will be filled based on progress
          lessonId: 'auto',
          scheduledTime: lessonTime,
          duration: Math.round(pattern.averageSessionDuration),
          priority: this.calculatePriority(lessonTime),
          type: this.determineSessionType(i, j),
          reminderEnabled: true,
          reminderTime: 15 // 15 minutes before
        });
      }
    }

    this.saveSchedule(schedule);
    return schedule;
  }

  // Get best study time for a specific date
  getBestStudyTime(date: Date, pattern: UserLearningPattern): number {
    const dayOfWeek = date.getDay();
    
    // Weekend vs Weekday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend - more flexible, prefer morning/afternoon
      return pattern.preferredTimes.find(t => t.hour >= 9 && t.hour <= 15)?.hour || 10;
    } else {
      // Weekday - prefer evening after work/school
      return pattern.preferredTimes.find(t => t.hour >= 18 && t.hour <= 22)?.hour || 20;
    }
  }

  // Calculate priority based on time and goals
  calculatePriority(time: Date): 'high' | 'medium' | 'low' {
    const now = new Date();
    const hoursUntil = (time.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 2) return 'high';
    if (hoursUntil < 24) return 'medium';
    return 'low';
  }

  // Determine session type (regular, review, practice)
  determineSessionType(dayIndex: number, sessionIndex: number): 'regular' | 'review' | 'practice' {
    // Every 3rd day is review
    if (dayIndex % 3 === 2) return 'review';
    // Last session of the day is practice
    if (sessionIndex > 0) return 'practice';
    return 'regular';
  }

  // Calculate weekly frequency
  calculateWeeklyFrequency(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentSessions = sessions.filter(s => 
      new Date(s.date) >= oneWeekAgo
    );

    return recentSessions.length;
  }

  // Get recommended study duration based on pattern
  getRecommendedDuration(): number {
    const pattern = this.analyzeLearningPattern();
    
    // Start with 20 minutes for beginners
    if (!pattern || pattern.studyFrequency === 0) {
      return 20;
    }

    // Gradually increase based on completion rate
    const base = pattern.averageSessionDuration || 20;
    const factor = pattern.completionRate > 0.8 ? 1.2 : 1.0;
    
    return Math.min(Math.round(base * factor), 60); // Max 60 minutes
  }

  // Check if user should take a break
  shouldTakeBreak(): boolean {
    const sessions = this.getStudySessions();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const totalMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    
    // Suggest break if studied more than 90 minutes today
    return totalMinutes > 90;
  }

  // Streak protection - suggest makeup session
  suggestMakeupSession(): ScheduledLesson | null {
    const sessions = this.getStudySessions();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdaySessions = sessions.filter(s => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === yesterday.getTime();
    });

    if (yesterdaySessions.length === 0) {
      // Missed yesterday - suggest urgent makeup session
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);

      return {
        id: `makeup-${now.getTime()}`,
        courseId: 'auto',
        lessonId: 'auto',
        scheduledTime: now,
        duration: 20,
        priority: 'high',
        type: 'regular',
        reminderEnabled: true,
        reminderTime: 5
      };
    }

    return null;
  }

  // Storage methods
  saveStudySession(session: StudySession): void {
    const sessions = this.getStudySessions();
    sessions.push(session);
    offlineStorage.set(this.STORAGE_KEY, sessions);
  }

  getStudySessions(): StudySession[] {
    return offlineStorage.get<StudySession[]>(this.STORAGE_KEY) || [];
  }

  saveLearningPattern(pattern: UserLearningPattern): void {
    offlineStorage.set(this.PATTERN_KEY, pattern);
  }

  getLearningPattern(): UserLearningPattern {
    return offlineStorage.get<UserLearningPattern>(this.PATTERN_KEY) || this.getDefaultPattern();
  }

  saveStudyGoals(goals: StudyGoal[]): void {
    offlineStorage.set(this.GOALS_KEY, goals);
  }

  getStudyGoals(): StudyGoal[] {
    return offlineStorage.get<StudyGoal[]>(this.GOALS_KEY) || this.getDefaultGoals();
  }

  saveSchedule(schedule: ScheduledLesson[]): void {
    offlineStorage.set(this.SCHEDULE_KEY, schedule);
  }

  getSchedule(): ScheduledLesson[] {
    return offlineStorage.get<ScheduledLesson[]>(this.SCHEDULE_KEY) || [];
  }

  // Default values
  getDefaultPattern(): UserLearningPattern {
    return {
      preferredTimes: [
        { hour: 20, success: 1 },
        { hour: 19, success: 0.9 },
        { hour: 21, success: 0.8 }
      ],
      averageSessionDuration: 20,
      bestPerformanceTime: 20,
      studyFrequency: 0,
      completionRate: 0,
      lastUpdated: new Date()
    };
  }

  getDefaultGoals(): StudyGoal[] {
    const today = new Date();
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return [
      {
        id: 'daily-minutes',
        type: 'daily',
        target: 30,
        unit: 'minutes',
        current: 0,
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      {
        id: 'weekly-lessons',
        type: 'weekly',
        target: 10,
        unit: 'lessons',
        current: 0,
        startDate: today,
        endDate: weekEnd
      }
    ];
  }
}

export const smartScheduler = new SmartScheduler();
