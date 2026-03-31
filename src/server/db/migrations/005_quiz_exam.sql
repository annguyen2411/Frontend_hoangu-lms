-- =====================================================
-- QUIZ/EXAM SYSTEM TABLES
-- =====================================================

-- Quiz Templates (reusable quiz definitions)
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  quiz_type VARCHAR(20) NOT NULL CHECK (quiz_type IN ('practice', 'quiz', 'exam', 'midterm', 'final')),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  hsk_level INTEGER CHECK (hsk_level IN (1, 2, 3, 4, 5, 6)),
  time_limit_minutes INTEGER,
  passing_score INTEGER DEFAULT 60,
  randomize_questions BOOLEAN DEFAULT false,
  show_results BOOLEAN DEFAULT true,
  allow_retry BOOLEAN DEFAULT true,
  max_attempts INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quizzes_course ON quizzes(course_id);
CREATE INDEX idx_quizzes_lesson ON quizzes(lesson_id);
CREATE INDEX idx_quizzes_type ON quizzes(quiz_type);
CREATE INDEX idx_quizzes_published ON quizzes(is_published);

-- Questions in quizzes
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'matching', 'audio', 'ordering')),
  options JSONB DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  correct_answers JSONB DEFAULT '[]',
  points INTEGER DEFAULT 1,
  explanation TEXT,
  audio_url TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_quiz ON quiz_questions(quiz_id);

-- User quiz attempts
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'timed_out')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_points INTEGER DEFAULT 0,
  earned_points INTEGER DEFAULT 0,
  score_percentage DECIMAL(5,2),
  passed BOOLEAN,
  time_spent_seconds INTEGER
);

CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_quiz ON quiz_attempts(quiz_id);
CREATE INDEX idx_quiz_attempts_status ON quiz_attempts(status);

-- User answers in attempts
CREATE TABLE IF NOT EXISTS quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  user_answer TEXT,
  is_correct BOOLEAN,
  points_earned INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_answers_attempt ON quiz_answers(attempt_id);

-- Exam sessions (timed, proctored exams)
CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_graded BOOLEAN DEFAULT false,
  graded_by UUID REFERENCES users(id),
  graded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

CREATE INDEX idx_exam_sessions_user ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_quiz ON exam_sessions(quiz_id);

-- Quiz results/analytics per user
CREATE TABLE IF NOT EXISTS user_quiz_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  attempts_count INTEGER DEFAULT 0,
  best_score DECIMAL(5,2),
  average_score DECIMAL(5,2),
  total_time_seconds INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, quiz_id)
);

CREATE INDEX idx_quiz_stats_user ON user_quiz_stats(user_id);

-- Quiz categories/tags
CREATE TABLE IF NOT EXISTS quiz_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  parent_id UUID REFERENCES quiz_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_quiz_categories_slug ON quiz_categories(slug);

-- Quiz-category relationships
CREATE TABLE IF NOT EXISTS quiz_category_relations (
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES quiz_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (quiz_id, category_id)
);

-- Update trigger for quizzes
CREATE TRIGGER update_quizzes_updated_at BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
