-- =====================================================
-- ADVANCED ANALYTICS TABLES
-- =====================================================

-- Daily learning analytics (aggregated daily stats)
CREATE TABLE IF NOT EXISTS daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  new_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_study_time_seconds INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_taken INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  average_quiz_score DECIMAL(5,2),
  total_revenue_vnd BIGINT DEFAULT 0,
  new_enrollments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_daily_analytics_date ON daily_analytics(date);

-- Course analytics (per-course aggregated stats)
CREATE TABLE IF NOT EXISTS course_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  enrollments INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  average_progress DECIMAL(5,2),
  average_score DECIMAL(5,2),
  revenue_vnd BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, date)
);

CREATE INDEX idx_course_analytics_course ON course_analytics(course_id);
CREATE INDEX idx_course_analytics_date ON course_analytics(date);

-- User learning journey (detailed progress tracking)
CREATE TABLE IF NOT EXISTS user_learning_journey (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  quizzes_taken INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  study_time_seconds INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  coins_earned INTEGER DEFAULT 0,
  streak_continued BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_learning_journey_user ON user_learning_journey(user_id);
CREATE INDEX idx_learning_journey_date ON user_learning_journey(date);

-- Content performance metrics
CREATE TABLE IF NOT EXISTS content_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type VARCHAR(20) NOT NULL,
  content_id UUID NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  completions INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  engagement_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(content_type, content_id, date)
);

CREATE INDEX idx_content_metrics_type ON content_metrics(content_type, content_id);

-- Cohort analysis
CREATE TABLE IF NOT EXISTS user_cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cohort_date DATE NOT NULL,
  cohort_month DATE NOT NULL,
  signup_source VARCHAR(50),
  first_course_id UUID REFERENCES courses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_cohorts_cohort ON user_cohorts(cohort_month);

-- Revenue analytics
CREATE TABLE IF NOT EXISTS revenue_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  total_revenue_vnd BIGINT DEFAULT 0,
  course_sales INTEGER DEFAULT 0,
  subscription_revenue_vnd BIGINT DEFAULT 0,
  coupon_discounts_vnd BIGINT DEFAULT 0,
  refunds_count INTEGER DEFAULT 0,
  refunds_vnd BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

CREATE INDEX idx_revenue_analytics_date ON revenue_analytics(date);

-- Funnel analytics
CREATE TABLE IF NOT EXISTS funnel_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funnel_name VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  step_name VARCHAR(100) NOT NULL,
  step_order INTEGER NOT NULL,
  users_count INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(funnel_name, date, step_name)
);

CREATE INDEX idx_funnel_analytics_name ON funnel_analytics(funnel_name);

-- Create function to refresh daily analytics
CREATE OR REPLACE FUNCTION refresh_daily_analytics()
RETURNS void AS $$
DECLARE
  yesterday DATE := CURRENT_DATE - 1;
BEGIN
  INSERT INTO daily_analytics (date, new_users, active_users, total_sessions, total_study_time_seconds,
    lessons_completed, quizzes_taken, quizzes_passed, average_quiz_score, total_revenue_vnd, new_enrollments)
  SELECT 
    yesterday,
    (SELECT COUNT(*) FROM users WHERE DATE(created_at) = yesterday),
    (SELECT COUNT(DISTINCT user_id) FROM activities WHERE DATE(created_at) = yesterday),
    (SELECT COUNT(*) FROM activities WHERE DATE(created_at) = yesterday),
    COALESCE((SELECT SUM(duration_seconds) FROM learning_history WHERE DATE(created_at) = yesterday), 0),
    (SELECT COUNT(*) FROM lesson_progress WHERE DATE(completed_at) = yesterday AND is_completed = true),
    (SELECT COUNT(*) FROM quiz_attempts WHERE DATE(started_at) = yesterday),
    (SELECT COUNT(*) FROM quiz_attempts WHERE DATE(started_at) = yesterday AND passed = true),
    (SELECT AVG(score_percentage) FROM quiz_attempts WHERE DATE(started_at) = yesterday AND status = 'completed'),
    COALESCE((SELECT SUM(amount_vnd) FROM payments WHERE DATE(completed_at) = yesterday AND status = 'completed'), 0),
    (SELECT COUNT(*) FROM enrollments WHERE DATE(enrolled_at) = yesterday)
  ON CONFLICT (date) DO UPDATE SET
    new_users = EXCLUDED.new_users,
    active_users = EXCLUDED.active_users,
    total_sessions = EXCLUDED.total_sessions,
    total_study_time_seconds = EXCLUDED.total_study_time_seconds,
    lessons_completed = EXCLUDED.lessons_completed,
    quizzes_taken = EXCLUDED.quizzes_taken,
    quizzes_passed = EXCLUDED.quizzes_passed,
    average_quiz_score = EXCLUDED.average_quiz_score,
    total_revenue_vnd = EXCLUDED.total_revenue_vnd,
    new_enrollments = EXCLUDED.new_enrollments;
END;
$$ LANGUAGE plpgsql;
