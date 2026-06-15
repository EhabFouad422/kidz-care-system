-- ============================================================
-- Kidz Care System — Database Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CLINICS (for future multi-clinic support)
-- ============================================================
CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_ar TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default clinic
INSERT INTO clinics (id, name, name_ar) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dr. Bola Pediatric Clinic', 'عيادة د. بولا لطب الأطفال');

-- ============================================================
-- USERS / PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'nurse', 'secretary', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATIENTS
-- ============================================================
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) DEFAULT '00000000-0000-0000-0000-000000000001',
  patient_number TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('male', 'female')),

  -- Birth info (from the card)
  birth_place TEXT,
  birth_mode TEXT CHECK (birth_mode IN ('normal', 'cs', 'assisted')), -- طريقة الولادة
  gestational_age_weeks INTEGER,
  birth_weight_grams INTEGER,
  birth_length_cm NUMERIC(5,2),
  birth_head_circumference_cm NUMERIC(5,2),
  nicu_days INTEGER DEFAULT 0,

  -- Contact
  father_name TEXT,
  mother_name TEXT,
  phone TEXT,
  phone2 TEXT,
  address TEXT,

  -- Medical history
  dietary_history TEXT,
  family_history TEXT,
  allergies TEXT,
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-generate patient number
CREATE SEQUENCE patient_number_seq START 1000;
ALTER TABLE patients ALTER COLUMN patient_number SET DEFAULT 'P-' || LPAD(nextval('patient_number_seq')::TEXT, 5, '0');

-- ============================================================
-- VISITS (سجل الزيارات)
-- ============================================================
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID REFERENCES clinics(id),
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visit_time TIME DEFAULT CURRENT_TIME,

  -- Patient measurements at visit
  weight_kg NUMERIC(5,2),
  length_cm NUMERIC(5,2),
  head_circumference_cm NUMERIC(5,2),
  temperature_c NUMERIC(4,1),

  -- Clinical (from the card: C/O, O/E, Diag., Treatment, Notes)
  chief_complaint TEXT,           -- C/O
  on_examination TEXT,            -- O/E
  diagnosis TEXT,                 -- Diag.
  treatment TEXT,                 -- Treatment
  notes TEXT,                     -- Notes

  -- Follow-up
  next_visit_date DATE,

  -- Meta
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRESCRIPTIONS (روشتات)
-- ============================================================
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visit_id UUID REFERENCES visits(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

  -- Either structured or file upload
  items JSONB, -- [{drug, dose, frequency, duration, notes}]
  file_url TEXT, -- uploaded prescription image/PDF
  file_name TEXT,

  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VACCINATION SCHEDULE (الجدول المرجعي للتطعيمات)
-- ============================================================
CREATE TABLE vaccine_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID REFERENCES clinics(id) DEFAULT '00000000-0000-0000-0000-000000000001',
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  due_age_months INTEGER NOT NULL, -- عمر التطعيم بالشهور
  due_age_label TEXT NOT NULL,     -- e.g. "عند الولادة", "شهر 4"
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Egyptian vaccination schedule (from the card photo)
INSERT INTO vaccine_schedule (name, name_ar, due_age_months, due_age_label, sort_order) VALUES
  ('BCG + HepB', 'BCG + التهاب الكبد ب', 0, 'عند الولادة', 1),
  ('Penta + OPV + PCV + Rota', 'خماسي + شلل فموي + رئوي + روتا', 2, 'شهر 2', 2),
  ('Penta + OPV + PCV + Rota', 'خماسي + شلل فموي + رئوي + روتا', 4, 'شهر 4', 3),
  ('Penta + OPV + PCV + Rota', 'خماسي + شلل فموي + رئوي + روتا', 6, 'شهر 6', 4),
  ('OPV + HepA', 'شلل فموي + التهاب الكبد أ', 9, 'شهر 9', 5),
  ('MMR + Varicella', 'حصبة نكاف حصبة ألمانية + جدري ماء', 12, 'سنة', 6),
  ('Penta booster + OPV + PCV', 'خماسي منشط + شلل فموي + رئوي', 15, 'سنة ونص', 7),
  ('HepA 2nd dose', 'التهاب الكبد أ جرعة ثانية', 18, 'سنة ونص', 8),
  ('MMR 2nd + OPV + Varicella 2nd', 'حصبة ثانية + شلل فموي + جدري ماء ثانية', 24, 'سنتين', 9);

-- ============================================================
-- PATIENT VACCINATIONS (تطعيمات كل طفل)
-- ============================================================
CREATE TABLE patient_vaccinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  vaccine_schedule_id UUID REFERENCES vaccine_schedule(id),

  -- Custom vaccine (not in schedule)
  custom_name TEXT,
  custom_name_ar TEXT,

  given_date DATE,
  given_age_months INTEGER,
  batch_number TEXT,
  site TEXT, -- e.g. 'right arm', 'left thigh'
  reaction TEXT,
  notes TEXT,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'given', 'missed', 'delayed')),

  given_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users see their own profile
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Patients: clinic staff see their clinic's patients
CREATE POLICY "patients_clinic" ON patients FOR ALL USING (
  clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "visits_clinic" ON visits FOR ALL USING (
  clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "prescriptions_clinic" ON prescriptions FOR ALL USING (
  patient_id IN (SELECT id FROM patients WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()))
);

CREATE POLICY "vaccinations_clinic" ON patient_vaccinations FOR ALL USING (
  patient_id IN (SELECT id FROM patients WHERE clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()))
);

-- Vaccine schedule: public read
ALTER TABLE vaccine_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vaccine_schedule_read" ON vaccine_schedule FOR SELECT USING (true);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update updated_at on patients
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create vaccination records for new patient
CREATE OR REPLACE FUNCTION create_patient_vaccinations()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO patient_vaccinations (patient_id, vaccine_schedule_id, status)
  SELECT NEW.id, id, 'pending' FROM vaccine_schedule;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_patient_vaccinations AFTER INSERT ON patients
  FOR EACH ROW EXECUTE FUNCTION create_patient_vaccinations();
