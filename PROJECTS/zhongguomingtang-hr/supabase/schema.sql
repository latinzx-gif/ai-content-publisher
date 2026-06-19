-- ============================================================
-- 中国名堂 HR & Payroll System — Supabase Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- GPS / location check

-- ============================================================
-- BRANCHES (สาขา)
-- ============================================================
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  address TEXT,
  lat NUMERIC(10, 7),
  lng NUMERIC(10, 7),
  radius_meters INTEGER DEFAULT 200,       -- รัศมี GPS check-in (เมตร)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO branches (name, name_en, lat, lng) VALUES
  ('สาขาสีลม', 'Silom', 13.7285, 100.5285),
  ('สาขาสยาม', 'Siam', 13.7450, 100.5340),
  ('สาขาอโศก', 'Asok', 13.7381, 100.5600);

-- ============================================================
-- SHIFT TYPES (ประเภทกะ)
-- ============================================================
CREATE TABLE shift_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,                     -- 'กะเช้า' / 'กะดึก' / 'Officer'
  start_time TIME NOT NULL,               -- 10:00 / 14:00 / 11:00
  end_time TIME NOT NULL,                 -- 22:00 / 02:00 / 20:00
  crosses_midnight BOOLEAN DEFAULT false, -- true สำหรับ 14:00-02:00
  min_clockout_minutes INTEGER DEFAULT 0, -- นาทีขั้นต่ำก่อนอนุญาต clock-out (ป้องกัน early)
  ot_rate_multiplier NUMERIC(3,2) DEFAULT 1.50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO shift_types (name, start_time, end_time, crosses_midnight, min_clockout_minutes) VALUES
  ('Officer',  '11:00:00', '20:00:00', false, -30),
  ('กะเช้า',  '10:00:00', '22:00:00', false, -30),
  ('กะดึก',   '14:00:00', '02:00:00', true,  -30);  -- crosses_midnight = true

-- ============================================================
-- EMPLOYEES (พนักงาน)
-- ============================================================
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'resigned', 'probation');
CREATE TYPE employee_type AS ENUM ('fulltime', 'parttime', 'contractor');

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_code TEXT UNIQUE NOT NULL,     -- EMP001, EMP002
  line_user_id TEXT UNIQUE,               -- U1234567890abcdef (จาก Line OA)
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nickname TEXT,
  phone TEXT,
  email TEXT,
  national_id TEXT,
  birth_date DATE,
  start_date DATE NOT NULL,
  branch_id UUID REFERENCES branches(id),
  shift_type_id UUID REFERENCES shift_types(id),
  employee_type employee_type DEFAULT 'fulltime',
  status employee_status DEFAULT 'probation',
  base_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  bank_name TEXT,
  bank_account TEXT,
  position TEXT,
  department TEXT,
  manager_id UUID REFERENCES employees(id),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE (บันทึกเวลา)
-- ============================================================
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  shift_type_id UUID REFERENCES shift_types(id),
  work_date DATE NOT NULL,                -- วันที่ของกะ (กะดึก = วันที่เริ่มกะ ไม่ใช่วันที่ clock-out)
  clock_in_at TIMESTAMPTZ,
  clock_out_at TIMESTAMPTZ,
  clock_in_lat NUMERIC(10,7),
  clock_in_lng NUMERIC(10,7),
  clock_out_lat NUMERIC(10,7),
  clock_out_lng NUMERIC(10,7),
  clock_in_within_radius BOOLEAN,
  clock_out_within_radius BOOLEAN,
  is_late BOOLEAN DEFAULT false,
  late_minutes INTEGER DEFAULT 0,
  early_leave BOOLEAN DEFAULT false,
  total_hours NUMERIC(5,2),               -- คำนวณหลัง clock-out
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',          -- pending / present / absent / leave
  note TEXT,
  approved_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, work_date)
);

-- ============================================================
-- LEAVE REQUESTS (คำขอลา)
-- ============================================================
CREATE TYPE leave_type AS ENUM ('sick', 'personal', 'vacation', 'maternity', 'paternity', 'other');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER,
  reason TEXT,
  document_url TEXT,                      -- ใบรับรองแพทย์
  status request_status DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- OT REQUESTS (คำขอทำงานล่วงเวลา)
-- ============================================================
CREATE TYPE ot_type AS ENUM ('weekday', 'weekend', 'holiday');

CREATE TABLE ot_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  ot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  crosses_midnight BOOLEAN DEFAULT false,
  ot_type ot_type DEFAULT 'weekday',
  ot_hours NUMERIC(4,2),
  estimated_amount NUMERIC(10,2),
  reason TEXT,
  status request_status DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENT REQUESTS (ขอเอกสาร)
-- ============================================================
CREATE TYPE doc_type AS ENUM (
  'employment_certificate', 'salary_certificate', 'payslip', 'tax_50', 'other'
);

CREATE TABLE document_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  doc_type doc_type NOT NULL,
  purpose TEXT,
  copies INTEGER DEFAULT 1,
  status request_status DEFAULT 'pending',
  document_url TEXT,                      -- ลิงก์ PDF หลัง HR จัดทำ
  processed_by UUID REFERENCES employees(id),
  processed_at TIMESTAMPTZ,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COMPLAINTS (ร้องเรียน)
-- ============================================================
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id), -- nullable = 익명
  branch_id UUID REFERENCES branches(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  is_anonymous BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'open',             -- open / in_review / resolved / closed
  assigned_to UUID REFERENCES employees(id),
  resolved_at TIMESTAMPTZ,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PAYROLL RUNS (รอบการจ่ายเงินเดือน)
-- ============================================================
CREATE TABLE payroll_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period_year INTEGER NOT NULL,
  period_month INTEGER NOT NULL,          -- 1-12
  branch_id UUID REFERENCES branches(id), -- NULL = ทุกสาขา
  status TEXT DEFAULT 'draft',            -- draft / finalized / paid
  total_base NUMERIC(14,2),
  total_ot NUMERIC(14,2),
  total_deductions NUMERIC(14,2),
  total_net NUMERIC(14,2),
  finalized_at TIMESTAMPTZ,
  finalized_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(period_year, period_month, branch_id)
);

CREATE TABLE payroll_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payroll_run_id UUID NOT NULL REFERENCES payroll_runs(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  work_days INTEGER,
  absent_days INTEGER,
  leave_days INTEGER,
  ot_hours NUMERIC(6,2),
  base_salary NUMERIC(12,2),
  ot_amount NUMERIC(10,2),
  late_deduction NUMERIC(10,2) DEFAULT 0,
  other_deductions NUMERIC(10,2) DEFAULT 0,
  other_additions NUMERIC(10,2) DEFAULT 0,
  net_salary NUMERIC(12,2),
  payslip_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEAVE BALANCES (วันลาคงเหลือ)
-- ============================================================
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  year INTEGER NOT NULL,
  sick_days_total INTEGER DEFAULT 30,
  sick_days_used INTEGER DEFAULT 0,
  personal_days_total INTEGER DEFAULT 3,
  personal_days_used INTEGER DEFAULT 0,
  vacation_days_total INTEGER DEFAULT 6,
  vacation_days_used INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(employee_id, year)
);

-- ============================================================
-- NOTIFICATIONS (แจ้งเตือน Line)
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  type TEXT NOT NULL,                     -- leave_approved / ot_approved / shift_reminder etc.
  title TEXT,
  body TEXT,
  line_message_id TEXT,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, work_date);
CREATE INDEX idx_attendance_work_date ON attendance(work_date);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id, status);
CREATE INDEX idx_ot_requests_employee ON ot_requests(employee_id, status);
CREATE INDEX idx_employees_line ON employees(line_user_id);
CREATE INDEX idx_employees_branch ON employees(branch_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ot_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items ENABLE ROW LEVEL SECURITY;

-- พนักงานเห็นแค่ข้อมูลตัวเอง
CREATE POLICY "employee_own_attendance" ON attendance
  FOR ALL USING (employee_id = auth.uid()::UUID);

CREATE POLICY "employee_own_leaves" ON leave_requests
  FOR ALL USING (employee_id = auth.uid()::UUID);

CREATE POLICY "employee_own_ot" ON ot_requests
  FOR ALL USING (employee_id = auth.uid()::UUID);

CREATE POLICY "employee_own_docs" ON document_requests
  FOR ALL USING (employee_id = auth.uid()::UUID);

-- HR Admin เห็นทุกอย่าง (ผ่าน service role key)
-- ใช้ service role key ใน admin API routes

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- คำนวณ work_date สำหรับกะดึก (14:00-02:00)
-- ถ้า clock_in เวลา >= 14:00 → work_date = วันนั้น
-- ถ้า clock_in เวลา < 06:00 (หลังเที่ยงคืน) → work_date = วันก่อนหน้า
CREATE OR REPLACE FUNCTION get_work_date(
  p_clock_time TIMESTAMPTZ,
  p_crosses_midnight BOOLEAN
) RETURNS DATE AS $$
BEGIN
  IF p_crosses_midnight AND EXTRACT(HOUR FROM p_clock_time AT TIME ZONE 'Asia/Bangkok') < 6 THEN
    RETURN (p_clock_time AT TIME ZONE 'Asia/Bangkok')::DATE - INTERVAL '1 day';
  ELSE
    RETURN (p_clock_time AT TIME ZONE 'Asia/Bangkok')::DATE;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ตรวจสอบ GPS อยู่ในรัศมีสาขา
CREATE OR REPLACE FUNCTION is_within_branch_radius(
  p_lat NUMERIC, p_lng NUMERIC,
  p_branch_lat NUMERIC, p_branch_lng NUMERIC,
  p_radius_meters INTEGER
) RETURNS BOOLEAN AS $$
DECLARE
  v_distance_m FLOAT;
BEGIN
  -- Haversine approximation (ประมาณ แม่นพอสำหรับ <1km)
  v_distance_m := 111320 * SQRT(
    POWER(p_lat - p_branch_lat, 2) +
    POWER((p_lng - p_branch_lng) * COS(RADIANS((p_lat + p_branch_lat) / 2)), 2)
  );
  RETURN v_distance_m <= p_radius_meters;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_attendance_updated BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leave_updated BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_ot_updated BEFORE UPDATE ON ot_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_employees_updated BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
