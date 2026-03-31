import { useState, useEffect } from 'react';
import type { UserStats } from '../data/questsData';

interface QuestProgress {
  [key: string]: {
    isCompleted: boolean;
    progress: number;
    completedAt?: string;
  };
}

interface GameProgress {
  userStats: UserStats;
  questProgress: QuestProgress;
  completedAchievements: string[];
  lastLoginDate: string;
  dailyRewardClaimed: boolean;
}

const STORAGE_KEY = 'hoanguNgữ_game_progress';

const getDefaultProgress = (): GameProgress => ({
  userStats: {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    coins: 0,
    totalXp: 0,
    completedQuests: 0,
    streak: 0,
    badges: [],
  },
  questProgress: {},
  completedAchievements: [],
  lastLoginDate: new Date().toDateString(),
  dailyRewardClaimed: false,
});

export function useGameProgress() {
  const [progress, setProgress] = useState<GameProgress>(getDefaultProgress);
  const [isNewDay, setIsNewDay] = useState(false);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toDateString();
        const lastLogin = new Date(parsed.lastLoginDate).toDateString();
        
        // Check if it's a new day
        if (today !== lastLogin) {
          setIsNewDay(true);
          // Update streak
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const isConsecutive = yesterday.toDateString() === lastLogin;
          
          parsed.userStats.streak = isConsecutive ? parsed.userStats.streak + 1 : 1;
          parsed.dailyRewardClaimed = false;
          parsed.lastLoginDate = today;
        }
        
        setProgress(parsed);
      }
    } catch (error) {
      console.error('Failed to load game progress:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Failed to save game progress:', error);
    }
  }, [progress]);

  const updateUserStats = (updates: Partial<UserStats>) => {
    setProgress((prev) => ({
      ...prev,
      userStats: { ...prev.userStats, ...updates },
    }));
  };

  const updateQuestProgress = (questId: string, progressUpdate: Partial<QuestProgress[string]>) => {
    setProgress((prev) => ({
      ...prev,
      questProgress: {
        ...prev.questProgress,
        [questId]: {
          ...prev.questProgress[questId],
          ...progressUpdate,
        },
      },
    }));
  };

  const completeQuest = (questId: string, rewards: { coins: number; xp: number; badge?: string }) => {
    setProgress((prev) => {
      const newTotalXP = prev.userStats.totalXp + rewards.xp;
      const newLevel = Math.floor(newTotalXP / 100) + 1;
      const leveledUp = newLevel > prev.userStats.level;
      const xpInCurrentLevel = newTotalXP % 100;
      const xpToNextLevel = 100;

      return {
        ...prev,
        userStats: {
          ...prev.userStats,
          xp: xpInCurrentLevel,
          totalXp: newTotalXP,
          level: newLevel,
          xpToNextLevel: xpToNextLevel,
          coins: prev.userStats.coins + rewards.coins,
          completedQuests: prev.userStats.completedQuests + 1,
          badges: rewards.badge && !prev.userStats.badges.includes(rewards.badge)
            ? [...prev.userStats.badges, rewards.badge]
            : prev.userStats.badges,
        },
        questProgress: {
          ...prev.questProgress,
          [questId]: {
            isCompleted: true,
            progress: 100,
            completedAt: new Date().toISOString(),
          },
        },
      };
    });

    // Return level up status
    const newTotalXP = progress.userStats.totalXp + rewards.xp;
    const newLevel = Math.floor(newTotalXP / 100) + 1;
    return {
      leveledUp: newLevel > progress.userStats.level,
      newLevel: newLevel,
    };
  };

  const unlockAchievement = (achievementId: string) => {
    setProgress((prev) => {
      if (prev.completedAchievements.includes(achievementId)) {
        return prev;
      }
      return {
        ...prev,
        completedAchievements: [...prev.completedAchievements, achievementId],
      };
    });
  };

  const claimDailyReward = () => {
    setProgress((prev) => ({
      ...prev,
      dailyRewardClaimed: true,
    }));
  };

  const resetProgress = () => {
    setProgress(getDefaultProgress());
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    progress,
    isNewDay,
    updateUserStats,
    updateQuestProgress,
    completeQuest,
    unlockAchievement,
    claimDailyReward,
    resetProgress,
  };
}