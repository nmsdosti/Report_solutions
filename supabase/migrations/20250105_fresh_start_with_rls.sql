-- Delete all existing report data for a fresh start
DELETE FROM alignment_reports;
DELETE FROM reports;
DELETE FROM company_branding;

-- Make sure user_id columns exist and are NOT NULL going forward
-- (keep nullable for now but enforce via RLS)

-- Enable RLS on reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Drop old policies if any
DROP POLICY IF EXISTS "Users can view own reports" ON reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON reports;
DROP POLICY IF EXISTS "Users can update own reports" ON reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON reports;

-- Create per-user RLS policies for reports
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on alignment_reports
ALTER TABLE alignment_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alignment reports" ON alignment_reports;
DROP POLICY IF EXISTS "Users can insert own alignment reports" ON alignment_reports;
DROP POLICY IF EXISTS "Users can update own alignment reports" ON alignment_reports;
DROP POLICY IF EXISTS "Users can delete own alignment reports" ON alignment_reports;

CREATE POLICY "Users can view own alignment reports"
  ON alignment_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alignment reports"
  ON alignment_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alignment reports"
  ON alignment_reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alignment reports"
  ON alignment_reports FOR DELETE
  USING (auth.uid() = user_id);

-- Enable RLS on company_branding and scope per user
ALTER TABLE company_branding ENABLE ROW LEVEL SECURITY;

-- Add user_id to company_branding if not exists
ALTER TABLE company_branding ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;

DROP POLICY IF EXISTS "Users can view own branding" ON company_branding;
DROP POLICY IF EXISTS "Users can insert own branding" ON company_branding;
DROP POLICY IF EXISTS "Users can update own branding" ON company_branding;
DROP POLICY IF EXISTS "Users can delete own branding" ON company_branding;

CREATE POLICY "Users can view own branding"
  ON company_branding FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own branding"
  ON company_branding FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own branding"
  ON company_branding FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own branding"
  ON company_branding FOR DELETE
  USING (auth.uid() = user_id);
