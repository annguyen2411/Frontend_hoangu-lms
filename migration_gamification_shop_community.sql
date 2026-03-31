-- =====================================================
-- HOANGU LMS - GAMIFICATION, SHOP & COMMUNITY TABLES
-- =====================================================

-- 1. QUESTS TABLE
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'special', 'achievement')),
  target INTEGER NOT NULL DEFAULT 1,
  rewards JSONB NOT NULL DEFAULT '{"coins": 50, "xp": 25}',
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER QUEST PROGRESS
CREATE TABLE IF NOT EXISTS public.user_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, quest_id)
);

-- 3. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  requirement JSONB NOT NULL,
  reward JSONB NOT NULL DEFAULT '{"coins": 100, "xp": 50}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 5. LEADERBOARD
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 6. SHOP ITEMS
CREATE TABLE IF NOT EXISTS public.shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('avatar', 'theme', 'powerup', 'badge', 'cosmetic')),
  price INTEGER NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER SHOP PURCHASES
CREATE TABLE IF NOT EXISTS public.user_shop_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.shop_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- 8. POSTS (Community)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('question', 'tip', 'milestone', 'general')),
  tags JSONB DEFAULT '[]',
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. POST LIKES
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- 10. POST COMMENTS
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. STUDY GROUPS
CREATE TABLE IF NOT EXISTS public.study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  is_public BOOLEAN DEFAULT true,
  member_limit INTEGER DEFAULT 50,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. STUDY GROUP MEMBERS
CREATE TABLE IF NOT EXISTS public.study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 13. ACTIVITIES (Activity Feed)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. FRIENDS
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ENABLE RLS FOR ALL TABLES
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_shop_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- quests
CREATE POLICY "Anyone can view active quests" ON quests FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own quest progress" ON user_quest_progress FOR ALL USING (auth.uid() = user_id);

-- achievements
CREATE POLICY "Anyone can view achievements" ON achievements FOR SELECT USING (true);
CREATE POLICY "Users can manage own achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);

-- leaderboard
CREATE POLICY "Anyone can view leaderboard" ON leaderboard FOR SELECT USING (true);
CREATE POLICY "Users can update own leaderboard" ON leaderboard FOR UPDATE USING (auth.uid() = user_id);

-- shop_items
CREATE POLICY "Anyone can view active shop items" ON shop_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage shop items" ON shop_items FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- user_shop_purchases
CREATE POLICY "Users can view own purchases" ON user_shop_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create purchases" ON user_shop_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- posts
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- post_likes
CREATE POLICY "Users can manage own likes" ON post_likes FOR ALL USING (auth.uid() = user_id);

-- post_comments
CREATE POLICY "Anyone can view comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON post_comments FOR DELETE USING (auth.uid() = user_id);

-- study_groups
CREATE POLICY "Public groups viewable by all" ON study_groups FOR SELECT USING (is_public = true);
CREATE POLICY "Members can view their groups" ON study_groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM study_group_members WHERE group_id = study_groups.id AND user_id = auth.uid())
);
CREATE POLICY "Users can create groups" ON study_groups FOR INSERT WITH CHECK (auth.uid() = created_by);

-- study_group_members
CREATE POLICY "Members can manage membership" ON study_group_members FOR ALL USING (auth.uid() = user_id);

-- activities
CREATE POLICY "Anyone can view recent activities" ON activities FOR SELECT USING (true);
CREATE POLICY "Users can create activities" ON activities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- friends
CREATE POLICY "Users can manage own friends" ON friends FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- SEED DATA
-- Sample quests
INSERT INTO quests (title, description, type, target, rewards) VALUES
  ('Đăng nhập hàng ngày', 'Đăng nhập mỗi ngày để duy trì streak', 'daily', 1, '{"coins": 10, "xp": 5}'),
  ('Hoàn thành 1 bài học', 'Hoàn thành ít nhất 1 bài học trong ngày', 'daily', 1, '{"coins": 30, "xp": 15}'),
  ('Luyện 20 từ vựng', 'Luyện tập 20 từ vựng mới', 'daily', 20, '{"coins": 25, "xp": 10}'),
  ('Hoàn thành 5 bài học tuần này', 'Hoàn thành 5 bài học trong tuần', 'weekly', 5, '{"coins": 100, "xp": 50}'),
  ('Streak 7 ngày', 'Duy trì streak 7 ngày liên tiếp', 'special', 7, '{"coins": 200, "xp": 100, "badge": "streak_7"}')
ON CONFLICT DO NOTHING;

-- Sample achievements
INSERT INTO achievements (name, description, icon, requirement, reward) VALUES
  ('Bài học đầu tiên', 'Hoàn thành bài học đầu tiên', '📚', '{"lessons_completed": 1}', '{"coins": 50, "xp": 25}'),
  ('Tuần hoàn hảo', 'Học 7 ngày liên tiếp', '🔥', '{"streak": 7}', '{"coins": 100, "xp": 50}'),
  ('Bậc thầy Flashcard', 'Ôn tập 100 flashcard', '🎴', '{"flashcards_reviewed": 100}', '{"coins": 150, "xp": 75}'),
  ('Phát âm chuẩn', 'Đạt 95% độ chính xác phát âm', '🎤', '{"pronunciation_score": 95}', '{"coins": 200, "xp": 100}'),
  ('Hoàn thành HSK 1', 'Hoàn thành khóa HSK cấp 1', '🏆', '{"hsk_level": 1}', '{"coins": 500, "xp": 250}')
ON CONFLICT DO NOTHING;

-- Sample shop items
INSERT INTO shop_items (name, description, type, price, image_url) VALUES
  ('Avatar Hoa Đào', 'Avatar đẹp hoa đào', 'avatar', 100, null),
  ('Avatar Thỏ Trắng', 'Avatar thỏ trắng dễ thương', 'avatar', 150, null),
  ('Theme Đêm Trăng', 'Giao diện đêm trăng', 'theme', 200, null),
  ('Double XP', 'Nhân đôi XP trong 24h', 'powerup', 300, null),
  ('Streak Freeze', 'Bảo vệ streak khi nghỉ 1 ngày', 'powerup', 250, null),
  ('Huy hiệu Chiến binh', 'Huy hiệu Chiến binh', 'badge', 500, null)
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quests_type ON quests(type);
CREATE INDEX IF NOT EXISTS idx_user_quest_progress_user ON user_quest_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON leaderboard(xp DESC);
CREATE INDEX IF NOT EXISTS idx_shop_items_type ON shop_items(type);
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_groups_category ON study_groups(category);
CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON friends(status);

SELECT 'Gamification, Shop & Community tables created successfully!' as status;
