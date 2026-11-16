-- ============================================================================
-- SKEMA DATABASE SUPABASE (POSTGRESQL)
-- Sistem Asesmen Bakat dan Minat (ABM)
-- Jalankan seluruh skrip ini di Dashboard Supabase -> SQL Editor -> New Query
-- ============================================================================

-- 1. Tabel Pengaturan Lembaga & Rilis Hasil
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY CHECK (id IN ('institution', 'assessment')),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabel Peserta / Siswa & Hasil Asesmen
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  birth_place TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  class_major TEXT NOT NULL,
  school_origin TEXT NOT NULL,
  address TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  major_choice_1 TEXT NOT NULL,
  major_choice_2 TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  test_status TEXT NOT NULL DEFAULT 'registered'
    CHECK (test_status IN ('registered', 'in_progress', 'completed')),
  review_status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (review_status IN ('pending_review', 'approved')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TEXT NOT NULL DEFAULT '',
  aptitude_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  interest_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  aptitude_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  interest_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  dominant_interests JSONB NOT NULL DEFAULT '[]'::jsonb,
  major_alignment JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_students_username ON public.students (username);
CREATE INDEX IF NOT EXISTS idx_students_registered_at ON public.students (registered_at DESC);

-- 3. Tabel Akun Guru BK (Akses Read-Only Hasil Asesmen)
CREATE TABLE IF NOT EXISTS public.counselors (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  nip TEXT NOT NULL DEFAULT '',
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counselors_username ON public.counselors (username);

-- 4. Aktifkan Supabase Realtime agar perubahan Admin langsung tampil real-time di Siswa & Guru BK
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'students'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'counselors'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.counselors;
  END IF;
END $$;

-- 5. Row Level Security (RLS)
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselors ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses klien (selaras dengan arsitektur login custom aplikasi saat ini).
-- Catatan Produksi: Jika Anda memigrasikan Admin/Siswa ke Supabase Auth di masa depan,
-- persempit kebijakan di bawah menggunakan `auth.uid()` / klaim JWT.
DROP POLICY IF EXISTS "abm_settings_all" ON public.settings;
CREATE POLICY "abm_settings_all"
  ON public.settings FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "abm_students_all" ON public.students;
CREATE POLICY "abm_students_all"
  ON public.students FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "abm_counselors_all" ON public.counselors;
CREATE POLICY "abm_counselors_all"
  ON public.counselors FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Data Awal Default untuk Profil Lembaga & Pengaturan Rilis Hasil
INSERT INTO public.settings (id, data)
VALUES (
  'institution',
  '{
    "name": "SMA Negeri Harapan Bangsa",
    "subtitle": "Unit Bimbingan dan Konseling · Dinas Pendidikan Provinsi",
    "npsn": "20109988",
    "address": "Jl. Pendidikan Raya No. 45, Kebayoran Baru",
    "city": "Jakarta Selatan",
    "phone": "(021) 720-4512",
    "email": "bk@smanharapanbangsa.sch.id",
    "website": "https://smanharapanbangsa.sch.id",
    "principalName": "Drs. H. Ahmad Fauzan, M.Pd.",
    "principalNip": "19680514 199403 1 008",
    "logoBase64": ""
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.settings (id, data)
VALUES (
  'assessment',
  '{
    "mode": "immediate",
    "releaseStart": "",
    "releaseEnd": ""
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;
