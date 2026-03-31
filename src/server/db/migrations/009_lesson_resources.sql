-- =====================================================
-- Lesson Resources Table
-- =====================================================

CREATE TABLE IF NOT EXISTS lesson_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  type VARCHAR(50) DEFAULT 'pdf' CHECK (type IN ('pdf', 'video', 'document', 'audio', 'image', 'other')),
  url TEXT NOT NULL,
  description TEXT,
  file_size INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lesson_resources_lesson_id ON lesson_resources(lesson_id);
CREATE INDEX idx_lesson_resources_type ON lesson_resources(type);
