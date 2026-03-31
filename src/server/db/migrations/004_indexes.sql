-- Database Indexes for Performance Optimization
-- Run this migration to add indexes

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Courses table indexes
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published, category, level);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_approval ON courses(approval_status);

-- Lessons table indexes
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);

-- Enrollments table indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);

-- Lesson Progress table indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_completed ON lesson_progress(user_id, is_completed);

-- Vocabulary table indexes
CREATE INDEX IF NOT EXISTS idx_vocabulary_hsk ON vocabulary(hsk_level);
CREATE INDEX IF NOT EXISTS idx_vocabulary_lesson ON vocabulary(lesson_id);

-- Grammar Exercises table indexes
CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON grammar_exercises(lesson_id);

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_user_quest_user ON user_quest_progress(user_id, quest_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_xp ON leaderboard(xp DESC);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);

-- Learning history indexes
CREATE INDEX IF NOT EXISTS idx_learning_history_user ON learning_history(user_id, created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- Study Groups indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_user ON study_groups_members(user_id, group_id);

-- Friends indexes
CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id, friend_id);

-- Add unique constraint for enrollments to prevent duplicates
ALTER TABLE enrollments ADD CONSTRAINT unique_user_course UNIQUE (user_id, course_id);

-- Add unique constraint for certificates
ALTER TABLE certificates ADD CONSTRAINT unique_user_course_cert UNIQUE (user_id, course_id);

COMMENT ON INDEX idx_users_email IS 'Email lookup for login';
COMMENT ON INDEX idx_courses_published IS 'Course browsing with filters';
COMMENT ON INDEX idx_enrollments_user_course IS 'Check user enrollment status';
COMMENT ON INDEX idx_lesson_progress_user IS 'Get user lesson progress';
