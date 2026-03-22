-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  equipment_name TEXT,
  equipment_id TEXT,
  location TEXT,
  customer_name TEXT,
  balancing_date TEXT,
  technician_name TEXT,
  machine_type TEXT,
  balancing_method TEXT DEFAULT 'single',
  measurement_points JSONB DEFAULT '[]'::jsonb,
  trial_weight NUMERIC DEFAULT 0,
  trial_angle NUMERIC DEFAULT 0,
  final_correction_weight NUMERIC DEFAULT 0,
  final_angle NUMERIC DEFAULT 0,
  final_correction_weight_2 NUMERIC DEFAULT 0,
  final_angle_2 NUMERIC DEFAULT 0,
  rpm NUMERIC DEFAULT 0,
  reference_point TEXT,
  service_remarks TEXT,
  recommendations TEXT,
  customer_acknowledgment TEXT
);

-- Create company_branding table
CREATE TABLE IF NOT EXISTS company_branding (
  id TEXT PRIMARY KEY DEFAULT 'default',
  company_name TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for reports
ALTER PUBLICATION supabase_realtime ADD TABLE reports;
