export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: 'student' | 'teacher' | 'admin';
  level: number;
  xp: number;
  total_xp: number;
  xp_to_next_level: number;
  coins: number;
  streak: number;
  completed_quests: number;
  language: string;
  theme: string;
  notification_enabled: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  teacher_name: string | null;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string | null;
  price_vnd: number;
  original_price_vnd: number | null;
  discount_percent: number;
  rating: number;
  students_enrolled: number;
  total_lessons: number;
  duration_hours: number | null;
  has_certificate: boolean;
  is_published: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  video_url: string | null;
  video_duration: number | null;
  is_free: boolean;
  is_published: boolean;
  created_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: 'active' | 'completed' | 'cancelled';
  enrolled_at: string;
  completed_at: string | null;
}

export interface Payment {
  id: string;
  user_id: string;
  course_id: string | null;
  amount_vnd: number;
  payment_method: string;
  status: 'pending' | 'completed' | 'cancelled';
  transaction_id: string | null;
  note: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  is_completed: boolean;
  watched_seconds: number;
  completed_at: string | null;
}

export interface Settings {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string | null;
  type: 'daily' | 'weekly' | 'special' | 'achievement';
  target: number;
  rewards: { coins: number; xp: number };
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface UserQuestProgress {
  id: string;
  user_id: string;
  quest_id: string;
  progress: number;
  is_completed: boolean;
  completed_at: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  requirement: { type: string; value: number };
  rewards: { coins: number; xp: number };
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  unlocked_at: string;
}

export interface Leaderboard {
  id: string;
  user_id: string;
  xp: number;
  coins: number;
  streak: number;
  lessons_completed: number;
  rank: number | null;
  updated_at: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  type: 'avatar' | 'theme' | 'powerup' | 'badge' | 'cosmetic';
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserShopPurchase {
  id: string;
  user_id: string;
  item_id: string;
  purchased_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  type: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string | null;
  creator_id: string;
  is_public: boolean;
  max_members: number;
  created_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
