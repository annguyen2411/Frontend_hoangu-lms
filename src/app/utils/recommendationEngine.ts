// AI-Powered Recommendation Engine
import { offlineStorage } from './offlineStorage';
import { progressTracker } from './progressTracker';

export interface LearningStyle {
  visual: number; // 0-100
  auditory: number;
  kinesthetic: number;
  reading: number;
  lastDetected: Date;
}

export interface StudyPreferences {
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'night';
  sessionDuration: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  goals: string[];
  focusAreas: string[];
}

export interface Recommendation {
  id: string;
  type: 'course' | 'lesson' | 'practice' | 'review' | 'challenge';
  title: string;
  description: string;
  reason: string;
  priority: number; // 1-10
  estimatedTime: number; // minutes
  difficulty: string;
  tags: string[];
}

class RecommendationEngine {
  private readonly LEARNING_STYLE_KEY = 'hoangu-learning-style';
  private readonly PREFERENCES_KEY = 'hoangu-study-preferences';

  // Detect learning style based on user behavior
  detectLearningStyle(): LearningStyle {
    const existing = offlineStorage.get<LearningStyle>(this.LEARNING_STYLE_KEY);
    
    // Simple detection based on activity patterns
    // In real app, this would analyze user interactions
    const style: LearningStyle = existing || {
      visual: 70,
      auditory: 60,
      kinesthetic: 50,
      reading: 65,
      lastDetected: new Date()
    };

    offlineStorage.set(this.LEARNING_STYLE_KEY, style);
    return style;
  }

  // Get study preferences
  getPreferences(): StudyPreferences {
    return offlineStorage.get<StudyPreferences>(this.PREFERENCES_KEY) || {
      preferredTime: 'evening',
      sessionDuration: 30,
      difficulty: 'medium',
      goals: ['HSK 1', 'conversation'],
      focusAreas: ['vocabulary', 'pronunciation']
    };
  }

  // Update preferences
  updatePreferences(preferences: Partial<StudyPreferences>): void {
    const current = this.getPreferences();
    const updated = { ...current, ...preferences };
    offlineStorage.set(this.PREFERENCES_KEY, updated);
  }

  // Generate personalized recommendations
  generateRecommendations(): Recommendation[] {
    const metrics = progressTracker.getMetrics();
    const preferences = this.getPreferences();
    const learningStyle = this.detectLearningStyle();
    const recommendations: Recommendation[] = [];

    // 1. Review due flashcards
    if (metrics.lessonsCompleted > 0) {
      recommendations.push({
        id: 'review-flashcards',
        type: 'review',
        title: 'Ôn tập Flashcard',
        description: 'Đã đến lúc ôn lại từ vựng với Spaced Repetition',
        reason: 'Duy trì kiến thức đã học',
        priority: 9,
        estimatedTime: 15,
        difficulty: 'easy',
        tags: ['vocabulary', 'review']
      });
    }

    // 2. Continue learning path
    if (metrics.completionRate < 1) {
      recommendations.push({
        id: 'continue-course',
        type: 'lesson',
        title: 'Tiếp tục khóa học',
        description: 'Học tiếp bài học tiếp theo trong lộ trình của bạn',
        reason: 'Hoàn thành mục tiêu đã đặt',
        priority: 10,
        estimatedTime: preferences.sessionDuration,
        difficulty: preferences.difficulty,
        tags: ['course', 'progress']
      });
    }

    // 3. Practice weak skills
    const skills = metrics.skillLevels;
    const weakestSkill = Object.entries(skills)
      .filter(([key]) => key !== 'lastUpdated')
      .sort(([, a], [, b]) => (a as number) - (b as number))[0];

    if (weakestSkill) {
      const skillName = weakestSkill[0];
      recommendations.push({
        id: `practice-${skillName}`,
        type: 'practice',
        title: `Luyện kỹ năng ${this.translateSkill(skillName)}`,
        description: `Cải thiện kỹ năng ${this.translateSkill(skillName)} của bạn`,
        reason: `Kỹ năng ${this.translateSkill(skillName)} cần được cải thiện`,
        priority: 8,
        estimatedTime: 20,
        difficulty: 'medium',
        tags: [skillName, 'practice']
      });
    }

    // 4. Daily challenge
    recommendations.push({
      id: 'daily-challenge',
      type: 'challenge',
      title: 'Thử thách hàng ngày',
      description: 'Hoàn thành thử thách để nhận 100 XP',
      reason: 'Duy trì streak và kiếm thưởng',
      priority: 7,
      estimatedTime: 10,
      difficulty: 'medium',
      tags: ['challenge', 'gamification']
    });

    // 5. Pronunciation practice (for auditory learners)
    if (learningStyle.auditory > 60) {
      recommendations.push({
        id: 'pronunciation-practice',
        type: 'practice',
        title: 'Luyện phát âm',
        description: 'Thực hành phát âm với AI chấm điểm',
        reason: 'Phù hợp với phong cách học của bạn',
        priority: 8,
        estimatedTime: 15,
        difficulty: 'medium',
        tags: ['pronunciation', 'speaking']
      });
    }

    // 6. Reading comprehension (for visual learners)
    if (learningStyle.visual > 60) {
      recommendations.push({
        id: 'reading-practice',
        type: 'practice',
        title: 'Đọc truyện ngắn',
        description: 'Cải thiện kỹ năng đọc hiểu qua truyện ngắn',
        reason: 'Phù hợp với phong cách học của bạn',
        priority: 7,
        estimatedTime: 25,
        difficulty: 'medium',
        tags: ['reading', 'comprehension']
      });
    }

    // 7. Grammar review
    recommendations.push({
      id: 'grammar-review',
      type: 'review',
      title: 'Ôn tập ngữ pháp',
      description: 'Củng cố kiến thức ngữ pháp đã học',
      reason: 'Nền tảng vững chắc cho giao tiếp',
      priority: 6,
      estimatedTime: 20,
      difficulty: 'medium',
      tags: ['grammar', 'review']
    });

    // 8. New course suggestion
    if (metrics.completionRate > 0.7) {
      recommendations.push({
        id: 'new-course',
        type: 'course',
        title: 'Khóa học mới',
        description: 'Khám phá khóa học tiếp theo phù hợp với trình độ',
        reason: 'Bạn đã hoàn thành tốt khóa học hiện tại',
        priority: 5,
        estimatedTime: 30,
        difficulty: this.getNextDifficulty(preferences.difficulty),
        tags: ['course', 'new']
      });
    }

    // Sort by priority
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  // Get time-based recommendations
  getTimeBasedRecommendations(): Recommendation[] {
    const hour = new Date().getHours();
    const allRecommendations = this.generateRecommendations();

    // Morning (6-12): Focus, new learning
    if (hour >= 6 && hour < 12) {
      return allRecommendations.filter(r => 
        r.type === 'lesson' || r.type === 'course'
      );
    }

    // Afternoon (12-18): Practice, review
    if (hour >= 12 && hour < 18) {
      return allRecommendations.filter(r => 
        r.type === 'practice' || r.type === 'review'
      );
    }

    // Evening (18-22): Light review, challenges
    if (hour >= 18 && hour < 22) {
      return allRecommendations.filter(r => 
        r.type === 'challenge' || r.type === 'review'
      );
    }

    // Night (22-6): Light activities only
    return allRecommendations.filter(r => 
      r.estimatedTime <= 15 && r.type === 'review'
    );
  }

  // Get difficulty-based recommendations
  getDifficultyRecommendations(difficulty: 'easy' | 'medium' | 'hard'): Recommendation[] {
    return this.generateRecommendations().filter(r => r.difficulty === difficulty);
  }

  // Translate skill names
  private translateSkill(skill: string): string {
    const map: { [key: string]: string } = {
      listening: 'Nghe',
      speaking: 'Nói',
      reading: 'Đọc',
      writing: 'Viết'
    };
    return map[skill] || skill;
  }

  // Get next difficulty level
  private getNextDifficulty(current: string): string {
    if (current === 'easy') return 'medium';
    if (current === 'medium') return 'hard';
    return 'hard';
  }

  // Get smart study plan for the week
  generateWeeklyPlan(): Array<{ day: string; activities: Recommendation[] }> {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];
    const preferences = this.getPreferences();
    const recommendations = this.generateRecommendations();

    return days.map((day, index) => {
      // Distribute recommendations across the week
      const dayRecommendations = recommendations
        .slice(index * 2, index * 2 + 3)
        .filter(r => r.estimatedTime <= preferences.sessionDuration);

      return {
        day,
        activities: dayRecommendations
      };
    });
  }
}

export const recommendationEngine = new RecommendationEngine();
