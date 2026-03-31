// Progress Tracking System for HoaNgữ
import { offlineStorage } from './offlineStorage';

export interface LessonProgress {
  lessonId: string;
  courseId: string;
  completed: boolean;
  score: number; // 0-100
  timeSpent: number; // minutes
  attempts: number;
  lastAttempt: Date;
  completedAt?: Date;
}

export interface CourseProgress {
  courseId: string;
  enrolledAt: Date;
  lastAccessedAt: Date;
  completedLessons: number;
  totalLessons: number;
  overallScore: number;
  totalTimeSpent: number;
  certificateEarned: boolean;
  certificateDate?: Date;
}

export interface SkillLevel {
  listening: number; // 0-100
  speaking: number;
  reading: number;
  writing: number;
  lastUpdated: Date;
}

export interface StudySession {
  id: string;
  date: Date;
  duration: number; // minutes
  lessonsCompleted: number;
  xpEarned: number;
  skillsImproved: Partial<SkillLevel>;
}

export interface PerformanceMetrics {
  totalStudyTime: number; // minutes
  averageSessionDuration: number;
  completionRate: number;
  averageScore: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  currentLevel: number;
  lessonsCompleted: number;
  coursesCompleted: number;
  skillLevels: SkillLevel;
  lastUpdated: Date;
}

export interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  studyTime: number;
  lessonsCompleted: number;
  averageScore: number;
  xpEarned: number;
  skillsImproved: Partial<SkillLevel>;
  streakMaintained: boolean;
  achievements: string[];
  dailyBreakdown: Array<{
    date: Date;
    studyTime: number;
    lessonsCompleted: number;
  }>;
}

class ProgressTracker {
  private readonly LESSONS_KEY = 'hoangu-lesson-progress';
  private readonly COURSES_KEY = 'hoangu-course-progress';
  private readonly SESSIONS_KEY = 'hoangu-study-sessions';
  private readonly METRICS_KEY = 'hoangu-performance-metrics';
  private readonly SKILLS_KEY = 'hoangu-skill-levels';

  // Track lesson completion
  updateLessonProgress(progress: LessonProgress): void {
    const allProgress = this.getAllLessonProgress();
    const existingIndex = allProgress.findIndex(
      p => p.lessonId === progress.lessonId && p.courseId === progress.courseId
    );

    if (existingIndex >= 0) {
      allProgress[existingIndex] = progress;
    } else {
      allProgress.push(progress);
    }

    offlineStorage.set(this.LESSONS_KEY, allProgress);
    
    // Update course progress
    this.updateCourseProgress(progress.courseId);
    
    // Update metrics
    this.recalculateMetrics();
  }

  // Get lesson progress
  getLessonProgress(lessonId: string, courseId: string): LessonProgress | null {
    const allProgress = this.getAllLessonProgress();
    return allProgress.find(
      p => p.lessonId === lessonId && p.courseId === courseId
    ) || null;
  }

  // Get all lesson progress
  getAllLessonProgress(): LessonProgress[] {
    return offlineStorage.get<LessonProgress[]>(this.LESSONS_KEY) || [];
  }

  // Update course progress
  updateCourseProgress(courseId: string): void {
    const lessonProgress = this.getAllLessonProgress().filter(
      p => p.courseId === courseId
    );
    
    if (lessonProgress.length === 0) return;

    const completedLessons = lessonProgress.filter(p => p.completed).length;
    const totalLessons = lessonProgress.length;
    const overallScore = lessonProgress.reduce((sum, p) => sum + p.score, 0) / totalLessons;
    const totalTimeSpent = lessonProgress.reduce((sum, p) => sum + p.timeSpent, 0);

    const courseProgress: CourseProgress = {
      courseId,
      enrolledAt: new Date(Math.min(...lessonProgress.map(p => new Date(p.lastAttempt).getTime()))),
      lastAccessedAt: new Date(Math.max(...lessonProgress.map(p => new Date(p.lastAttempt).getTime()))),
      completedLessons,
      totalLessons,
      overallScore,
      totalTimeSpent,
      certificateEarned: completedLessons === totalLessons && overallScore >= 70,
      certificateDate: completedLessons === totalLessons ? new Date() : undefined
    };

    const allCourses = this.getAllCourseProgress();
    const existingIndex = allCourses.findIndex(c => c.courseId === courseId);

    if (existingIndex >= 0) {
      allCourses[existingIndex] = courseProgress;
    } else {
      allCourses.push(courseProgress);
    }

    offlineStorage.set(this.COURSES_KEY, allCourses);
  }

  // Get course progress
  getCourseProgress(courseId: string): CourseProgress | null {
    const allCourses = this.getAllCourseProgress();
    return allCourses.find(c => c.courseId === courseId) || null;
  }

  // Get all course progress
  getAllCourseProgress(): CourseProgress[] {
    return offlineStorage.get<CourseProgress[]>(this.COURSES_KEY) || [];
  }

  // Record study session
  recordStudySession(session: Omit<StudySession, 'id'>): void {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString()
    };

    const sessions = this.getStudySessions();
    sessions.push(newSession);
    offlineStorage.set(this.SESSIONS_KEY, sessions);

    // Update skill levels
    if (session.skillsImproved) {
      this.updateSkillLevels(session.skillsImproved);
    }

    // Recalculate metrics
    this.recalculateMetrics();
  }

  // Get study sessions
  getStudySessions(limit?: number): StudySession[] {
    const sessions = offlineStorage.get<StudySession[]>(this.SESSIONS_KEY) || [];
    return limit ? sessions.slice(-limit) : sessions;
  }

  // Update skill levels
  updateSkillLevels(improvements: Partial<SkillLevel>): void {
    const current = this.getSkillLevels();
    
    const updated: SkillLevel = {
      listening: Math.min(100, current.listening + (improvements.listening || 0)),
      speaking: Math.min(100, current.speaking + (improvements.speaking || 0)),
      reading: Math.min(100, current.reading + (improvements.reading || 0)),
      writing: Math.min(100, current.writing + (improvements.writing || 0)),
      lastUpdated: new Date()
    };

    offlineStorage.set(this.SKILLS_KEY, updated);
  }

  // Get skill levels
  getSkillLevels(): SkillLevel {
    return offlineStorage.get<SkillLevel>(this.SKILLS_KEY) || {
      listening: 0,
      speaking: 0,
      reading: 0,
      writing: 0,
      lastUpdated: new Date()
    };
  }

  // Calculate current streak
  calculateStreak(): number {
    const sessions = this.getStudySessions();
    if (sessions.length === 0) return 0;

    // Sort by date descending
    const sorted = sessions
      .map(s => ({ ...s, date: new Date(s.date) }))
      .sort((a, b) => b.date.getTime() - a.date.getTime());

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const sessionDate = new Date(sorted[i].date);
      sessionDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === streak) {
        streak++;
      } else if (dayDiff > streak) {
        break;
      }
    }

    return streak;
  }

  // Recalculate all metrics
  recalculateMetrics(): void {
    const sessions = this.getStudySessions();
    const lessonProgress = this.getAllLessonProgress();
    const courseProgress = this.getAllCourseProgress();

    const totalStudyTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionDuration = sessions.length > 0 
      ? totalStudyTime / sessions.length 
      : 0;

    const completedLessons = lessonProgress.filter(p => p.completed).length;
    const totalLessons = lessonProgress.length;
    const completionRate = totalLessons > 0 
      ? completedLessons / totalLessons 
      : 0;

    const averageScore = lessonProgress.length > 0
      ? lessonProgress.reduce((sum, p) => sum + p.score, 0) / lessonProgress.length
      : 0;

    const totalXP = sessions.reduce((sum, s) => sum + s.xpEarned, 0);
    const currentLevel = Math.floor(totalXP / 1000) + 1;

    const currentStreak = this.calculateStreak();
    const longestStreak = this.calculateLongestStreak();

    const metrics: PerformanceMetrics = {
      totalStudyTime,
      averageSessionDuration,
      completionRate,
      averageScore,
      currentStreak,
      longestStreak,
      totalXP,
      currentLevel,
      lessonsCompleted: completedLessons,
      coursesCompleted: courseProgress.filter(c => c.certificateEarned).length,
      skillLevels: this.getSkillLevels(),
      lastUpdated: new Date()
    };

    offlineStorage.set(this.METRICS_KEY, metrics);
  }

  // Get performance metrics
  getMetrics(): PerformanceMetrics {
    let metrics = offlineStorage.get<PerformanceMetrics>(this.METRICS_KEY);
    
    if (!metrics) {
      this.recalculateMetrics();
      metrics = offlineStorage.get<PerformanceMetrics>(this.METRICS_KEY)!;
    }

    return metrics;
  }

  // Calculate longest streak
  calculateLongestStreak(): number {
    const sessions = this.getStudySessions();
    if (sessions.length === 0) return 0;

    const sorted = sessions
      .map(s => ({ ...s, date: new Date(s.date) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    let longestStreak = 1;
    let currentStreak = 1;
    let lastDate = new Date(sorted[0].date);
    lastDate.setHours(0, 0, 0, 0);

    for (let i = 1; i < sorted.length; i++) {
      const currentDate = new Date(sorted[i].date);
      currentDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (dayDiff > 1) {
        currentStreak = 1;
      }

      lastDate = currentDate;
    }

    return longestStreak;
  }

  // Generate weekly report
  generateWeeklyReport(): WeeklyReport {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(now);
    weekEnd.setHours(23, 59, 59, 999);

    const sessions = this.getStudySessions().filter(s => {
      const date = new Date(s.date);
      return date >= weekStart && date <= weekEnd;
    });

    const lessonProgress = this.getAllLessonProgress().filter(p => {
      const date = new Date(p.lastAttempt);
      return date >= weekStart && date <= weekEnd && p.completed;
    });

    const studyTime = sessions.reduce((sum, s) => sum + s.duration, 0);
    const lessonsCompleted = lessonProgress.length;
    const averageScore = lessonProgress.length > 0
      ? lessonProgress.reduce((sum, p) => sum + p.score, 0) / lessonProgress.length
      : 0;
    const xpEarned = sessions.reduce((sum, s) => sum + s.xpEarned, 0);

    // Calculate skill improvements
    const skillsImproved: Partial<SkillLevel> = sessions.reduce(
      (acc, s) => ({
        listening: (acc.listening || 0) + (s.skillsImproved.listening || 0),
        speaking: (acc.speaking || 0) + (s.skillsImproved.speaking || 0),
        reading: (acc.reading || 0) + (s.skillsImproved.reading || 0),
        writing: (acc.writing || 0) + (s.skillsImproved.writing || 0)
      }),
      {}
    );

    // Daily breakdown
    const dailyBreakdown = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime();
      });

      const dayLessons = lessonProgress.filter(p => {
        const lessonDate = new Date(p.completedAt || p.lastAttempt);
        lessonDate.setHours(0, 0, 0, 0);
        return lessonDate.getTime() === date.getTime();
      });

      dailyBreakdown.push({
        date,
        studyTime: daySessions.reduce((sum, s) => sum + s.duration, 0),
        lessonsCompleted: dayLessons.length
      });
    }

    return {
      weekStart,
      weekEnd,
      studyTime,
      lessonsCompleted,
      averageScore,
      xpEarned,
      skillsImproved,
      streakMaintained: dailyBreakdown.every(d => d.studyTime > 0),
      achievements: [],
      dailyBreakdown
    };
  }

  // Get study time for specific period
  getStudyTimeByPeriod(days: number): Array<{ date: Date; duration: number }> {
    const sessions = this.getStudySessions();
    const result: Array<{ date: Date; duration: number }> = [];

    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime();
      });

      result.push({
        date,
        duration: daySessions.reduce((sum, s) => sum + s.duration, 0)
      });
    }

    return result;
  }
}

export const progressTracker = new ProgressTracker();
