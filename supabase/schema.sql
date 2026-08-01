-- =========================================================
-- JURNAL MAGANG & PRESENSI DIGITAL SMK - QUEST EDITION
-- SUPABASE COMPLETE SQL SCHEMA & MIGRATIONS
-- =========================================================
-- Petunjuk Penggunaan:
-- 1. Buka Dashboard Supabase Anda (https://app.supabase.com)
-- 2. Pilih Proyek Anda -> Buka menu "SQL Editor"
-- 3. Salin seluruh isi skrip SQL ini dan Tempel (Paste) di SQL Editor
-- 4. Klik tombol "Run" untuk mengeksekusi dan membuat/memperbarui tabel
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABEL SISWA (students)
CREATE TABLE IF NOT EXISTS public.students (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    username VARCHAR(100) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    nisn VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    kelas VARCHAR(10) NOT NULL CHECK (kelas IN ('TKJ', 'DKP')),
    tempat_magang VARCHAR(255) DEFAULT '-',
    pembimbing_dudi VARCHAR(255) DEFAULT '-',
    exp INT DEFAULT 0,
    level INT DEFAULT 1,
    streak INT DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    avatar TEXT DEFAULT '🐱',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add columns if students table already exists
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS tempat_magang VARCHAR(255) DEFAULT '-';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS pembimbing_dudi VARCHAR(255) DEFAULT '-';

-- 2. TABEL GURU PEMBIMBING (teachers)
CREATE TABLE IF NOT EXISTS public.teachers (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    username VARCHAR(100) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    nip VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL KATA SANDI ENKRIPSI/LOKAL (passwords)
CREATE TABLE IF NOT EXISTS public.passwords (
    username VARCHAR(100) PRIMARY KEY,
    password_hash TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL PRESENSI SISWA (attendance_records)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    hari VARCHAR(20) NOT NULL,
    jam_masuk VARCHAR(10) DEFAULT '-',
    paraf_masuk TEXT DEFAULT '-',
    jam_pulang VARCHAR(10) DEFAULT '-',
    paraf_pulang TEXT DEFAULT '-',
    status VARCHAR(20) DEFAULT 'hadir' CHECK (status IN ('hadir', 'izin', 'sakit', 'alpha')),
    keterangan TEXT DEFAULT '-',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, tanggal)
);

-- 5. TABEL JURNAL KEGIATAN MAGANG (journal_records)
CREATE TABLE IF NOT EXISTS public.journal_records (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    judul VARCHAR(255) DEFAULT '-',
    kegiatan TEXT NOT NULL,
    jam_mulai VARCHAR(10) DEFAULT '08:00',
    jam_selesai VARCHAR(10) DEFAULT '16:00',
    lokasi VARCHAR(255) DEFAULT '-',
    catatan_instruktur TEXT DEFAULT '-',
    paraf_instruktur TEXT DEFAULT '-',
    foto_kegiatan TEXT DEFAULT NULL,
    fotos JSONB DEFAULT '[]'::jsonb,
    reviewed_by VARCHAR(255) DEFAULT NULL,
    reviewed_at TIMESTAMPTZ DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'menunggu' CHECK (status IN ('menunggu', 'disetujui', 'revisi')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add columns if journal_records table already exists
ALTER TABLE public.journal_records ADD COLUMN IF NOT EXISTS judul VARCHAR(255) DEFAULT '-';
ALTER TABLE public.journal_records ADD COLUMN IF NOT EXISTS jam_mulai VARCHAR(10) DEFAULT '08:00';
ALTER TABLE public.journal_records ADD COLUMN IF NOT EXISTS jam_selesai VARCHAR(10) DEFAULT '16:00';
ALTER TABLE public.journal_records ADD COLUMN IF NOT EXISTS lokasi VARCHAR(255) DEFAULT '-';
ALTER TABLE public.journal_records ADD COLUMN IF NOT EXISTS fotos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.journal_records ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255) DEFAULT NULL;
ALTER TABLE public.journal_records ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.journal_records ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'menunggu';

-- 6. TABEL NOTIFIKASI SYSTEM (notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    journal_id TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABEL DUDI / TEMPAT MAGANG (tempat_magang)
CREATE TABLE IF NOT EXISTS public.tempat_magang (
    id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    nama_perusahaan VARCHAR(255) NOT NULL,
    alamat TEXT DEFAULT '-',
    pembimbing VARCHAR(255) DEFAULT '-',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- INDEXING UNTUK PERFORMA TINGGI (PENCARIAN & FILTER)
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_students_username ON public.students(username);
CREATE INDEX IF NOT EXISTS idx_attendance_student_tanggal ON public.attendance_records(student_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_journal_student_tanggal ON public.journal_records(student_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_journal_status ON public.journal_records(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- =========================================================
-- SEED DATA DEFAULTS (AKUN GURU DEFAULTS)
-- =========================================================
INSERT INTO public.teachers (id, username, nama_lengkap, nip, email)
VALUES 
('t1', 'guru', 'Drs. Hendra Wijaya, M.Pd.', '19850112 201001 1 002', 'hendra.wijaya@smk.sch.id'),
('t2', 'bu_sri', 'Sri Wahyuni, S.Kom.', '19900325 201502 2 001', 'sri.wahyuni@smk.sch.id')
ON CONFLICT (username) DO NOTHING;

INSERT INTO public.passwords (username, password_hash)
VALUES 
('guru', 'gurusmk113'),
('bu_sri', 'gurusmk113')
ON CONFLICT (username) DO NOTHING;

-- =========================================================
-- ROW LEVEL SECURITY (RLS) - KEAMANAN DATA SUPABASE
-- =========================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tempat_magang ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Publik / Anonim (Supabase Client Access)
DROP POLICY IF EXISTS "Allow public read students" ON public.students;
DROP POLICY IF EXISTS "Allow public insert students" ON public.students;
DROP POLICY IF EXISTS "Allow public update students" ON public.students;

CREATE POLICY "Allow public read students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow public insert students" ON public.students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update students" ON public.students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read teachers" ON public.teachers;
CREATE POLICY "Allow public read teachers" ON public.teachers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read passwords" ON public.passwords;
DROP POLICY IF EXISTS "Allow public update passwords" ON public.passwords;
CREATE POLICY "Allow public read passwords" ON public.passwords FOR SELECT USING (true);
CREATE POLICY "Allow public update passwords" ON public.passwords FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all attendance" ON public.attendance_records;
CREATE POLICY "Allow public all attendance" ON public.attendance_records FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all journals" ON public.journal_records;
CREATE POLICY "Allow public all journals" ON public.journal_records FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all notifications" ON public.notifications;
CREATE POLICY "Allow public all notifications" ON public.notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public all tempat_magang" ON public.tempat_magang;
CREATE POLICY "Allow public all tempat_magang" ON public.tempat_magang FOR ALL USING (true);

-- Skrip Selesai! Tabel Quest Edition Siap Digunakan di Supabase Dashboard.
