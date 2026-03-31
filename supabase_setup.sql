-- =====================================================
-- HOANGUỮ - SUPABASE DATABASE SETUP
-- =====================================================
-- Project: HoaNgữ - Nền tảng học tiếng Hoa trực tuyến
-- Date: March 14, 2026
-- Description: Complete database schema for production
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy search

-- =====================================================
-- 1. USERS & PROFILES
-- =====================================================

CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  
  -- Gamification
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  coins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  
  -- Stats
  completed_quests INTEGER DEFAULT 0,
  
  -- Settings
  language TEXT DEFAULT 'vi',
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  notification_enabled BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_level ON users(level DESC);
CREATE INDEX idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Auto update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. TEACHERS
-- =====================================================

CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  expertise TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  students_count INTEGER DEFAULT 0,
  years_experience INTEGER,
  certifications TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teachers_rating ON teachers(rating DESC);
CREATE INDEX idx_teachers_verified ON teachers(is_verified, rating DESC);

ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teachers" ON teachers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage teachers" ON teachers
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- =====================================================
-- 3. COURSES
-- =====================================================

CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  teacher_id UUID REFERENCES teachers(id),
  
  -- Course info
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Pricing
  price_vnd INTEGER NOT NULL,
  original_price_vnd INTEGER,
  discount_percent INTEGER DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  
  -- Stats
  rating DECIMAL(2,1) DEFAULT 5.0 CHECK (rating >= 0 AND rating <= 5),
  students_enrolled INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  duration_hours DECIMAL(4,1),
  
  -- Features
  has_certificate BOOLEAN DEFAULT true,
  has_ai_pronunciation BOOLEAN DEFAULT true,
  has_flashcards BOOLEAN DEFAULT true,
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_published ON courses(is_published, published_at DESC) WHERE is_published = true;
CREATE INDEX idx_courses_rating ON courses(rating DESC);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_teacher ON courses(teacher_id);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all courses" ON courses
  USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- =====================================================
-- 4. LESSONS
-- =====================================================

CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  
  -- Content
  video_url TEXT,
  video_duration INTEGER, -- seconds
  content JSONB DEFAULT '{}',
  
  -- Resources
  vocabulary JSONB[] DEFAULT '{}',
  grammar_points JSONB[] DEFAULT '{}',
  exercises JSONB[] DEFAULT '{}',
  
  -- Status
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(course_id, order_index)
);

CREATE INDEX idx_lessons_course ON lessons(course_id, order_index);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons of published courses" ON lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = lessons.course_id 
      AND courses.is_published = true
    )
  );

-- =====================================================
-- 5. COURSE ENROLLMENTS
-- =====================================================

CREATE TABLE public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  -- Progress
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_lessons INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- seconds
  last_accessed_lesson_id UUID REFERENCES lessons(id),
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON course_enrollments(user_id, status);
CREATE INDEX idx_enrollments_course ON course_enrollments(course_id);

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own enrollments" ON course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users enroll in courses" ON course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own enrollments" ON course_enrollments
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- 6. LESSON PROGRESS
-- =====================================================

CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  is_completed BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0, -- seconds
  quiz_score INTEGER CHECK (quiz_score IS NULL OR (quiz_score >= 0 AND quiz_score <= 100)),
  
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own progress" ON lesson_progress
  USING (auth.uid() = user_id);

-- =====================================================
-- 7. BADGES
-- =====================================================

CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirement_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON badges
  FOR SELECT USING (true);

-- =====================================================
-- 8. QUESTS
-- =====================================================

CREATE TABLE public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'special', 'achievement')),
  category TEXT CHECK (category IN ('study', 'practice', 'social', 'milestone')),
  
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  
  -- Requirements
  target INTEGER NOT NULL CHECK (target > 0),
  requirement_type TEXT,
  
  -- Rewards
  coins_reward INTEGER DEFAULT 0 CHECK (coins_reward >= 0),
  xp_reward INTEGER DEFAULT 0 CHECK (xp_reward >= 0),
  badge_id UUID REFERENCES badges(id),
  
  -- Timing
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_repeatable BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quests_type ON quests(type, is_active);
CREATE INDEX idx_quests_expires ON quests(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_quests_active ON quests(is_active, type);

ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active quests" ON quests
  FOR SELECT USING (is_active = true);

-- =====================================================
-- 9. USER QUESTS
-- =====================================================

CREATE TABLE public.user_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  
  progress INTEGER DEFAULT 0 CHECK (progress >= 0),
  is_completed BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  
  completed_at TIMESTAMPTZ,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, quest_id)
);

CREATE INDEX idx_user_quests_user ON user_quests(user_id, is_completed);
CREATE INDEX idx_user_quests_quest ON user_quests(quest_id);

ALTER TABLE user_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own quests" ON user_quests
  USING (auth.uid() = user_id);

-- =====================================================
-- 10. USER BADGES
-- =====================================================

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_user_badges_user ON user_badges(user_id);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own badges" ON user_badges
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- 11. SHOP ITEMS
-- =====================================================

CREATE TABLE public.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT CHECK (category IN ('powerup', 'theme', 'avatar', 'boost')),
  
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  
  price_coins INTEGER NOT NULL CHECK (price_coins > 0),
  
  effects JSONB DEFAULT '{}',
  
  is_available BOOLEAN DEFAULT true,
  is_limited BOOLEAN DEFAULT false,
  stock_quantity INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shop_items_category ON shop_items(category, is_available);

ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view available shop items" ON shop_items
  FOR SELECT USING (is_available = true);

-- =====================================================
-- 12. USER INVENTORY
-- =====================================================

CREATE TABLE public.user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  shop_item_id UUID REFERENCES shop_items(id) ON DELETE CASCADE,
  
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
  is_active BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, shop_item_id)
);

CREATE INDEX idx_user_inventory_user ON user_inventory(user_id);

ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own inventory" ON user_inventory
  USING (auth.uid() = user_id);

-- =====================================================
-- 13. ORDERS
-- =====================================================

CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  items JSONB NOT NULL DEFAULT '[]',
  subtotal_vnd INTEGER NOT NULL CHECK (subtotal_vnd >= 0),
  discount_vnd INTEGER DEFAULT 0 CHECK (discount_vnd >= 0),
  total_vnd INTEGER NOT NULL CHECK (total_vnd >= 0),
  
  payment_method TEXT CHECK (payment_method IN ('vnpay', 'momo', 'zalopay')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  
  coupon_code TEXT,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins view all orders" ON orders
  FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- =====================================================
-- 14. COUPONS
-- =====================================================

CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  max_discount_vnd INTEGER,
  
  min_order_vnd INTEGER DEFAULT 0,
  applicable_courses UUID[] DEFAULT '{}',
  
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  per_user_limit INTEGER DEFAULT 1 CHECK (per_user_limit > 0),
  
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons(code, is_active);
CREATE INDEX idx_coupons_active ON coupons(is_active, expires_at);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (is_active = true);

-- =====================================================
-- 15. REVIEWS
-- =====================================================

CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  
  is_verified BOOLEAN DEFAULT false,
  is_hidden BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_reviews_course ON reviews(course_id, created_at DESC) WHERE is_hidden = false;
CREATE INDEX idx_reviews_user ON reviews(user_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view unhidden reviews" ON reviews
  FOR SELECT USING (is_hidden = false);

CREATE POLICY "Users can create reviews for enrolled courses" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM course_enrollments WHERE user_id = auth.uid() AND course_id = reviews.course_id)
  );

-- =====================================================
-- 16. NOTIFICATIONS
-- =====================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own notifications" ON notifications
  USING (auth.uid() = user_id);

-- =====================================================
-- 17. ANALYTICS DAILY
-- =====================================================

CREATE TABLE public.analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  
  revenue_vnd INTEGER DEFAULT 0,
  new_students INTEGER DEFAULT 0,
  active_students INTEGER DEFAULT 0,
  orders_count INTEGER DEFAULT 0,
  courses_enrolled INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date)
);

CREATE INDEX idx_analytics_date ON analytics_daily(date DESC);

ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view analytics" ON analytics_daily
  FOR SELECT USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update course stats when enrollment changes
CREATE OR REPLACE FUNCTION update_course_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE courses 
    SET students_enrolled = students_enrolled + 1
    WHERE id = NEW.course_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE courses 
    SET students_enrolled = students_enrolled - 1
    WHERE id = OLD.course_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_course_enrollment
  AFTER INSERT OR DELETE ON course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_course_enrollment_count();

-- Function: Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'HN' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Function: Update user XP and level
CREATE OR REPLACE FUNCTION update_user_xp(
  p_user_id UUID,
  p_xp_gain INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_new_total_xp INTEGER;
  v_new_level INTEGER;
  v_old_level INTEGER;
  v_leveled_up BOOLEAN;
BEGIN
  -- Get current level
  SELECT level INTO v_old_level FROM users WHERE id = p_user_id;
  
  -- Update XP
  UPDATE users
  SET 
    total_xp = total_xp + p_xp_gain,
    xp = (total_xp + p_xp_gain) % 100,
    level = FLOOR((total_xp + p_xp_gain) / 100.0) + 1,
    xp_to_next_level = 100,
    updated_at = NOW()
  WHERE id = p_user_id
  RETURNING total_xp, level INTO v_new_total_xp, v_new_level;
  
  v_leveled_up = v_new_level > v_old_level;
  
  RETURN json_build_object(
    'total_xp', v_new_total_xp,
    'level', v_new_level,
    'leveled_up', v_leveled_up
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Complete quest and give rewards
CREATE OR REPLACE FUNCTION complete_quest(
  p_user_id UUID,
  p_quest_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_quest RECORD;
  v_xp_result JSON;
BEGIN
  -- Get quest details
  SELECT * INTO v_quest FROM quests WHERE id = p_quest_id;
  
  -- Mark quest as completed
  UPDATE user_quests
  SET 
    is_completed = true,
    is_claimed = true,
    progress = v_quest.target,
    completed_at = NOW(),
    claimed_at = NOW()
  WHERE user_id = p_user_id AND quest_id = p_quest_id;
  
  -- Give XP reward
  v_xp_result = update_user_xp(p_user_id, v_quest.xp_reward);
  
  -- Give coins reward
  UPDATE users
  SET coins = coins + v_quest.coins_reward
  WHERE id = p_user_id;
  
  -- Give badge if exists
  IF v_quest.badge_id IS NOT NULL THEN
    INSERT INTO user_badges (user_id, badge_id)
    VALUES (p_user_id, v_quest.badge_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN v_xp_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default badges
INSERT INTO badges (slug, name, description, icon, rarity) VALUES
  ('first_lesson', 'Bài học đầu tiên', 'Hoàn thành bài học đầu tiên', '📚', 'common'),
  ('week_streak', 'Tuần hoàn hảo', 'Học 7 ngày liên tiếp', '🔥', 'rare'),
  ('pronunciation_master', 'Phát âm chuẩn', 'Đạt 95% độ chính xác phát âm', '🎤', 'epic'),
  ('hsk_1', 'Chinh phục HSK 1', 'Hoàn thành khóa HSK 1', '🏆', 'legendary');

-- Insert default shop items
INSERT INTO shop_items (category, name, description, icon, price_coins, effects) VALUES
  ('powerup', 'XP Boost 2x', 'Nhân đôi XP trong 1 giờ', '⚡', 100, '{"type": "xp_multiplier", "value": 2, "duration": 3600}'::jsonb),
  ('powerup', 'Coin Magnet', 'Nhận thêm 50% xu trong 30 phút', '💰', 150, '{"type": "coin_multiplier", "value": 1.5, "duration": 1800}'::jsonb),
  ('theme', 'Dark Theme', 'Giao diện tối sang trọng', '🌙', 500, '{"type": "theme", "value": "dark"}'::jsonb),
  ('avatar', 'Panda Avatar', 'Avatar gấu trúc dễ thương', '🐼', 200, '{"type": "avatar", "value": "panda"}'::jsonb);

COMMENT ON TABLE users IS 'User accounts extending Supabase auth';
COMMENT ON TABLE courses IS 'Chinese learning courses';
COMMENT ON TABLE quests IS 'Gamification quests (daily, weekly, special)';
COMMENT ON TABLE shop_items IS 'Items available in the rewards shop';
