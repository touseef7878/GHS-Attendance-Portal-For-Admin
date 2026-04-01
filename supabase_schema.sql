-- ============================================================
-- GHS Khanpur — Staff Attendance Portal
-- Supabase Schema  (safe to re-run — uses IF NOT EXISTS guards)
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================


-- ── 1. TEACHERS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  subject    text        NOT NULL,
  phone      text        NOT NULL,
  avatar     text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ── 2. ATTENDANCE ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid        NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date       date        NOT NULL,
  status     text        NOT NULL CHECK (status IN ('Present', 'Absent', 'Late')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT attendance_teacher_date_unique UNIQUE (teacher_id, date)
);


-- ── 3. ATTENDANCE REQUESTS ───────────────────────────────────
-- Teachers submit a self-check-in request; principal approves/rejects.
-- On approval the system auto-marks attendance as Present.
CREATE TABLE IF NOT EXISTS attendance_requests (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  uuid        NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  date        date        NOT NULL DEFAULT CURRENT_DATE,
  note        text,                                          -- optional message from teacher
  status      text        NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'approved', 'rejected')),
  resolved_at timestamptz,                                   -- when principal acted
  created_at  timestamptz NOT NULL DEFAULT now()
);


-- ── 4. INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_attendance_date
  ON attendance (date DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_teacher_id
  ON attendance (teacher_id);

CREATE INDEX IF NOT EXISTS idx_requests_status
  ON attendance_requests (status, date DESC);

CREATE INDEX IF NOT EXISTS idx_requests_teacher_id
  ON attendance_requests (teacher_id);


-- ── 5. AUTO-UPDATE updated_at ────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_attendance_updated_at ON attendance;
CREATE TRIGGER trg_attendance_updated_at
  BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ── 6. ROW LEVEL SECURITY ────────────────────────────────────
ALTER TABLE teachers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance           ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_requests  ENABLE ROW LEVEL SECURITY;

-- Drop & recreate (idempotent)
DROP POLICY IF EXISTS "teachers_select"  ON teachers;
DROP POLICY IF EXISTS "teachers_insert"  ON teachers;
DROP POLICY IF EXISTS "teachers_update"  ON teachers;
DROP POLICY IF EXISTS "teachers_delete"  ON teachers;

DROP POLICY IF EXISTS "attendance_select" ON attendance;
DROP POLICY IF EXISTS "attendance_insert" ON attendance;
DROP POLICY IF EXISTS "attendance_update" ON attendance;
DROP POLICY IF EXISTS "attendance_delete" ON attendance;

DROP POLICY IF EXISTS "requests_select" ON attendance_requests;
DROP POLICY IF EXISTS "requests_insert" ON attendance_requests;
DROP POLICY IF EXISTS "requests_update" ON attendance_requests;
DROP POLICY IF EXISTS "requests_delete" ON attendance_requests;

-- Teachers table
CREATE POLICY "teachers_select" ON teachers FOR SELECT USING (true);
CREATE POLICY "teachers_insert" ON teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "teachers_update" ON teachers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "teachers_delete" ON teachers FOR DELETE USING (true);

-- Attendance table
CREATE POLICY "attendance_select" ON attendance FOR SELECT USING (true);
CREATE POLICY "attendance_insert" ON attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "attendance_update" ON attendance FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "attendance_delete" ON attendance FOR DELETE USING (true);

-- Attendance requests table
CREATE POLICY "requests_select" ON attendance_requests FOR SELECT USING (true);
CREATE POLICY "requests_insert" ON attendance_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "requests_update" ON attendance_requests FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "requests_delete" ON attendance_requests FOR DELETE USING (true);


-- ── 7. HELPER VIEW ───────────────────────────────────────────
CREATE OR REPLACE VIEW attendance_report AS
  SELECT
    a.id,
    a.date,
    a.status,
    a.created_at,
    a.updated_at,
    t.id      AS teacher_id,
    t.name    AS teacher_name,
    t.subject,
    t.avatar
  FROM attendance a
  JOIN teachers t ON t.id = a.teacher_id
  ORDER BY a.date DESC, t.name ASC;
