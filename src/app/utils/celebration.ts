import confetti from 'canvas-confetti';

interface CelebrationOptions {
  type?: 'success' | 'milestone' | 'achievement' | 'streak';
  message?: string;
}

class CelebrationManager {
  private hasCelebrated = false;
  private readonly STORAGE_KEY = 'hoangu-celebrations';

  celebrate(options: CelebrationOptions = {}) {
    const { type = 'success', message } = options;

    const configs: Record<string, Parameters<typeof confetti>[0]> = {
      success: {
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#10B981', '#34D399', '#6EE7B7'],
      },
      milestone: {
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#818CF8', '#A5B4FC'],
      },
      achievement: {
        particleCount: 150,
        spread: 120,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#FBBF24', '#FCD34D'],
      },
      streak: {
        particleCount: 80,
        spread: 90,
        origin: { y: 0.65 },
        colors: ['#EF4444', '#F87171', '#FCA5A5'],
      },
    };

    const config = configs[type] || configs.success;
    
    // Canvas confetti from center
    confetti({
      ...config,
      origin: { x: 0.5, y: config.origin.y },
    });

    // Fire from sides
    setTimeout(() => {
      confetti({
        ...config,
        origin: { x: 0, y: 0.7 },
        angle: 60,
        spread: 50,
        particleCount: 30,
      });
    }, 250);

    setTimeout(() => {
      confetti({
        ...config,
        origin: { x: 1, y: 0.7 },
        angle: 120,
        spread: 50,
        particleCount: 30,
      });
    }, 400);

    if (message) {
      this.showToast(message, type);
    }
  }

  private showToast(message: string, type: string) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('celebration', { 
        detail: { message, type } 
      });
      window.dispatchEvent(event);
    }
  }

  // Check if should celebrate milestone (avoid repeated celebrations)
  shouldCelebrate(key: string): boolean {
    if (this.hasCelebrated) return false;
    
    const celebrations = this.getCelebrations();
    const now = Date.now();
    
    // Only celebrate once per session for same key
    if (celebrations[key] && now - celebrations[key] < 3600000) {
      return false;
    }
    
    celebrations[key] = now;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(celebrations));
    return true;
  }

  private getCelebrations(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  // Celebrate learning milestones
  celebrateProgress(progress: number, totalProgress: number) {
    const milestones = [25, 50, 75, 100];
    const reachedMilestone = milestones.find(m => 
      progress >= m && Math.floor((progress - m) / totalProgress * 100) === 0
    );

    if (reachedMilestone && this.shouldCelebrate(`progress-${reachedMilestone}`)) {
      this.celebrate({ 
        type: 'milestone', 
        message: `🎉 Chúc mừng! Bạn đã hoàn thành ${reachedMilestone}%` 
      });
    }
  }

  // Celebrate streak
  celebrateStreak(days: number) {
    const streakMilestones = [7, 14, 30, 60, 100, 365];
    
    if (streakMilestones.includes(days) && this.shouldCelebrate(`streak-${days}`)) {
      this.celebrate({ 
        type: 'streak', 
        message: `🔥 ${days} ngày liên tiếp! Kinh ngạc!` 
      });
    }
  }

  // Celebrate achievement
  celebrateAchievement(name: string) {
    if (this.shouldCelebrate(`achievement-${name}`)) {
      this.celebrate({ 
        type: 'achievement', 
        message: `🏆 ${name}` 
      });
    }
  }

  // Reset celebration state (for testing)
  reset() {
    this.hasCelebrated = false;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const celebration = new CelebrationManager();
