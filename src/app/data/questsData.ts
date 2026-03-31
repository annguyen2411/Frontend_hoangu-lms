export type QuestType = 'daily' | 'weekly' | 'special' | 'achievement';
export type QuestCategory = 'study' | 'practice' | 'social' | 'milestone';

export interface Quest {
  id: string;
  type: QuestType;
  category: QuestCategory;
  title: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  rewards: {
    coins: number;
    xp: number;
    badge?: string;
  };
  isCompleted: boolean;
  expiresAt?: string; // For daily/weekly quests
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  totalXp: number;
  completedQuests: number;
  streak: number;
  badges: string[];
}

// Mock user stats
export const userStats: UserStats = {
  level: 5,
  xp: 350,
  xpToNextLevel: 500,
  coins: 1250,
  totalXp: 2350,
  completedQuests: 24,
  streak: 7,
  badges: ['first_lesson', 'week_streak', 'pronunciation_master']
};

// Daily Quests - Reset every day
export const dailyQuests: Quest[] = [
  {
    id: 'daily_lesson',
    type: 'daily',
    category: 'study',
    title: 'Hoàn thành 1 bài học',
    description: 'Học ít nhất 1 bài học trong ngày hôm nay',
    icon: '📚',
    progress: 1,
    target: 1,
    rewards: { coins: 50, xp: 100 },
    isCompleted: true,
    expiresAt: '2026-03-14T23:59:59'
  },
  {
    id: 'daily_flashcard',
    type: 'daily',
    category: 'practice',
    title: 'Ôn tập 20 flashcard',
    description: 'Ôn tập ít nhất 20 thẻ flashcard',
    icon: '🎴',
    progress: 15,
    target: 20,
    rewards: { coins: 30, xp: 60 },
    isCompleted: false,
    expiresAt: '2026-03-14T23:59:59'
  },
  {
    id: 'daily_pronunciation',
    type: 'daily',
    category: 'practice',
    title: 'Luyện phát âm 10 từ',
    description: 'Thực hành phát âm với AI ít nhất 10 từ',
    icon: '🎤',
    progress: 7,
    target: 10,
    rewards: { coins: 40, xp: 80 },
    isCompleted: false,
    expiresAt: '2026-03-14T23:59:59'
  },
  {
    id: 'daily_time',
    type: 'daily',
    category: 'study',
    title: 'Học 30 phút',
    description: 'Dành ít nhất 30 phút để học trong ngày',
    icon: '⏰',
    progress: 25,
    target: 30,
    rewards: { coins: 60, xp: 120 },
    isCompleted: false,
    expiresAt: '2026-03-14T23:59:59'
  }
];

// Weekly Quests - Reset every week
export const weeklyQuests: Quest[] = [
  {
    id: 'weekly_lessons',
    type: 'weekly',
    category: 'study',
    title: 'Hoàn thành 10 bài học',
    description: 'Học ít nhất 10 bài học trong tuần này',
    icon: '📖',
    progress: 6,
    target: 10,
    rewards: { coins: 200, xp: 400 },
    isCompleted: false,
    expiresAt: '2026-03-16T23:59:59'
  },
  {
    id: 'weekly_streak',
    type: 'weekly',
    category: 'study',
    title: 'Học liên tục 7 ngày',
    description: 'Giữ chuỗi streak 7 ngày liên tiếp',
    icon: '🔥',
    progress: 7,
    target: 7,
    rewards: { coins: 300, xp: 600, badge: 'weekly_warrior' },
    isCompleted: true,
    expiresAt: '2026-03-16T23:59:59'
  },
  {
    id: 'weekly_perfect_score',
    type: 'weekly',
    category: 'practice',
    title: 'Đạt điểm hoàn hảo 5 lần',
    description: 'Đạt 100% trong bài kiểm tra hoặc phát âm 5 lần',
    icon: '⭐',
    progress: 3,
    target: 5,
    rewards: { coins: 250, xp: 500 },
    isCompleted: false,
    expiresAt: '2026-03-16T23:59:59'
  },
  {
    id: 'weekly_vocabulary',
    type: 'weekly',
    category: 'practice',
    title: 'Học 50 từ vựng mới',
    description: 'Thêm 50 từ vựng mới vào vốn từ của bạn',
    icon: '📝',
    progress: 32,
    target: 50,
    rewards: { coins: 150, xp: 300 },
    isCompleted: false,
    expiresAt: '2026-03-16T23:59:59'
  }
];

// Special Quests - Limited time events
export const specialQuests: Quest[] = [
  {
    id: 'spring_festival',
    type: 'special',
    category: 'milestone',
    title: 'Sự kiện Tết Nguyên Đán',
    description: 'Hoàn thành 15 bài học về văn hóa Tết Trung Quốc',
    icon: '🧧',
    progress: 8,
    target: 15,
    rewards: { coins: 500, xp: 1000, badge: 'spring_festival_2026' },
    isCompleted: false,
    expiresAt: '2026-03-20T23:59:59'
  },
  {
    id: 'hsk_challenge',
    type: 'special',
    category: 'milestone',
    title: 'Thử thách HSK',
    description: 'Hoàn thành bài kiểm tra thử HSK với điểm >= 80%',
    icon: '🎯',
    progress: 0,
    target: 1,
    rewards: { coins: 400, xp: 800, badge: 'hsk_ready' },
    isCompleted: false,
    expiresAt: '2026-03-31T23:59:59'
  }
];

// Achievement Quests - Permanent milestones
export const achievementQuests: Quest[] = [
  {
    id: 'first_course',
    type: 'achievement',
    category: 'milestone',
    title: 'Khóa học đầu tiên',
    description: 'Hoàn thành khóa học đầu tiên của bạn',
    icon: '🎓',
    progress: 45,
    target: 100,
    rewards: { coins: 1000, xp: 2000, badge: 'course_graduate' },
    isCompleted: false
  },
  {
    id: 'pronunciation_master',
    type: 'achievement',
    category: 'practice',
    title: 'Bậc thầy phát âm',
    description: 'Đạt điểm AI phát âm >= 95% cho 100 từ',
    icon: '🎭',
    progress: 67,
    target: 100,
    rewards: { coins: 800, xp: 1600, badge: 'pronunciation_master' },
    isCompleted: false
  },
  {
    id: 'vocabulary_king',
    type: 'achievement',
    category: 'practice',
    title: 'Vua từ vựng',
    description: 'Học được 1000 từ vựng tiếng Hoa',
    icon: '👑',
    progress: 456,
    target: 1000,
    rewards: { coins: 1500, xp: 3000, badge: 'vocabulary_king' },
    isCompleted: false
  },
  {
    id: 'streak_legend',
    type: 'achievement',
    category: 'study',
    title: 'Huyền thoại Streak',
    description: 'Duy trì streak 30 ngày liên tiếp',
    icon: '⚡',
    progress: 7,
    target: 30,
    rewards: { coins: 2000, xp: 4000, badge: 'streak_legend' },
    isCompleted: false
  },
  {
    id: 'social_butterfly',
    type: 'achievement',
    category: 'social',
    title: 'Người kết nối',
    description: 'Chia sẻ thành tích trên mạng xã hội 10 lần',
    icon: '🦋',
    progress: 3,
    target: 10,
    rewards: { coins: 500, xp: 1000, badge: 'social_star' },
    isCompleted: false
  }
];

// Badges data
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export const badges: Badge[] = [
  {
    id: 'first_lesson',
    name: 'Bước đầu tiên',
    description: 'Hoàn thành bài học đầu tiên',
    icon: '🌱',
    rarity: 'common',
    unlockedAt: '2026-03-08'
  },
  {
    id: 'week_streak',
    name: 'Tuần hoàn hảo',
    description: 'Học liên tục 7 ngày',
    icon: '🔥',
    rarity: 'rare',
    unlockedAt: '2026-03-14'
  },
  {
    id: 'pronunciation_master',
    name: 'Bậc thầy phát âm',
    description: 'Đạt điểm phát âm hoàn hảo 100 lần',
    icon: '🎭',
    rarity: 'epic',
    unlockedAt: '2026-03-12'
  },
  {
    id: 'weekly_warrior',
    name: 'Chiến binh tuần này',
    description: 'Hoàn thành tất cả nhiệm vụ tuần',
    icon: '⚔️',
    rarity: 'rare'
  },
  {
    id: 'course_graduate',
    name: 'Tốt nghiệp khóa học',
    description: 'Hoàn thành 100% một khóa học',
    icon: '🎓',
    rarity: 'epic'
  },
  {
    id: 'vocabulary_king',
    name: 'Vua từ vựng',
    description: 'Học được 1000 từ vựng',
    icon: '👑',
    rarity: 'legendary'
  },
  {
    id: 'streak_legend',
    name: 'Huyền thoại Streak',
    description: 'Duy trì streak 30 ngày',
    icon: '⚡',
    rarity: 'legendary'
  },
  {
    id: 'spring_festival_2026',
    name: 'Tết Nguyên Đán 2026',
    description: 'Hoàn thành sự kiện Tết 2026',
    icon: '🧧',
    rarity: 'epic'
  },
  {
    id: 'hsk_ready',
    name: 'Sẵn sàng HSK',
    description: 'Đạt 80% bài kiểm tra thử HSK',
    icon: '🎯',
    rarity: 'rare'
  },
  {
    id: 'social_star',
    name: 'Ngôi sao mạng xã hội',
    description: 'Chia sẻ 10 thành tích',
    icon: '🌟',
    rarity: 'rare'
  }
];