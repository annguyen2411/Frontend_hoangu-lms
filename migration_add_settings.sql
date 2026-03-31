-- =====================================================
-- HOANGU LMS - DATABASE MIGRATION
-- Add settings table and payment functions
-- =====================================================

-- 1. Settings table for payment configuration
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage settings
CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Everyone can read settings
CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT USING (true);

-- 2. Insert default payment settings (admin should update these)
INSERT INTO settings (key, value) VALUES
  ('bank_name', 'Vietcombank'),
  ('account_number', '1234567890'),
  ('account_name', 'CONG TY HOA NGU'),
  ('bank_branch', 'Chi nhánh TP.HCM'),
  ('momo_phone', '0123456789'),
  ('momo_name', 'CONG TY HOA NGU')
ON CONFLICT (key) DO NOTHING;

-- 3. Create function to increment course enrollment
CREATE OR REPLACE FUNCTION public.increment_course_enrolled(course_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.courses
  SET students_enrolled = students_enrolled + 1
  WHERE id = course_id;
END;
$$;

-- 4. Create index for performance
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_course_id ON payments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_course ON enrollments(user_id, course_id);

-- 5. Add foreign key for users table referencing auth.users
ALTER TABLE public.users 
ADD CONSTRAINT fk_users_id 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

SELECT 'Migration completed successfully!' as status;
