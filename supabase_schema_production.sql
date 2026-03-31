-- =====================================================
-- HOANGU - SIMPLIFIED DATABASE SCHEMA
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES (extends Supabase Auth)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 2. COURSES
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  teacher_name TEXT,
  
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  category TEXT,
  
  price_vnd INTEGER NOT NULL DEFAULT 0,
  original_price_vnd INTEGER,
  discount_percent INTEGER DEFAULT 0,
  
  rating DECIMAL(2,1) DEFAULT 5.0,
  students_enrolled INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  duration_hours DECIMAL(4,1),
  
  has_certificate BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courses_published ON courses(is_published) WHERE is_published = true;

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. LESSONS
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  video_url TEXT,
  video_duration INTEGER,
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lessons_course ON lessons(course_id, order_index);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons" ON lessons
  FOR SELECT USING (is_published = true);

-- 4. ENROLLMENTS
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create enrollments" ON enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. PAYMENTS
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  amount_vnd INTEGER NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'momo')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  transaction_id TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. PROGRESS
CREATE TABLE public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  watched_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON progress
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- AUTO CREATE PROFILE TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SEED DATA - SAMPLE COURSES
-- =====================================================
INSERT INTO courses (slug, title, description, thumbnail_url, teacher_name, level, category, price_vnd, original_price_vnd, discount_percent, rating, students_enrolled, total_lessons, duration_hours, is_published, is_featured) VALUES
('hsk-1-90-ngay', 'HSK 1 - Chỉ 90 ngày nói thành thạo', 'Khóa học tiếng Hoa HSK cấp độ 1 dành cho người mới bắt đầu. Học từ cơ bản đến nói được câu đơn giản.', 'https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800', 'Giảng viên HoaNgữ', 'beginner', 'HSK', 299000, 499000, 40, 5.0, 1250, 30, 15.0, true, true),
('tieng-hoa-giao-tiep', 'Tiếng Hoa Giao Tiếp Cơ Bản', 'Học giao tiếp tiếng Hoa thực tế trong 30 ngày với 100+ câu giao tiếp thường dùng.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'Giảng viên HoaNgữ', 'beginner', 'Conversation', 199000, 399000, 50, 4.8, 890, 20, 10.0, true, true),
('hsk-2-nang-cao', 'HSK 2 - Mở rộng vốn từ', 'Nâng cao vốn từ vựng và ngữ pháp HSK cấp 2. Chuẩn bị cho kỳ thi HSK 2.', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800', 'Giảng viên HoaNgữ', 'intermediate', 'HSK', 399000, 599000, 33, 4.9, 560, 40, 20.0, true, false);

-- Add sample lessons for first course
INSERT INTO lessons (course_id, title, description, order_index, video_url, video_duration, is_free)
SELECT 
  id,
  'Bài ' || seq || ': Học cách chào hỏi',
  'Học cách chào hỏi trong tiếng Hoa',
  seq,
  'https://example.com/video1.mp4',
  900,
  true
FROM courses, generate_series(1, 5) seq
WHERE slug = 'hsk-1-90-ngay';

SELECT 'Database setup completed!' as status;
