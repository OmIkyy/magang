export type UserRole = 'siswa' | 'guru';

export type ClassName = 'TKJ' | 'DKP';

export interface StudentProfile {
  id: string;
  username: string;
  namaLengkap: string;
  nisn: string;
  email: string;
  kelas: ClassName;
  tempatMagang?: string;
  pembimbingDudi?: string;
  exp: number;
  level: number;
  streak: number;
  badges: string[];
  avatar: string;
  createdAt: string;
}

export interface TeacherProfile {
  id: string;
  username: string;
  namaLengkap: string;
  nip: string;
  email: string;
}

export type AttendanceStatus = 'hadir' | 'izin' | 'sakit' | 'alpha';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  tanggal: string; // YYYY-MM-DD
  hari: string;    // e.g. "Senin"
  jamMasuk: string; // e.g. "07:30"
  parafMasuk: string;
  jamPulang: string; // e.g. "16:00"
  parafPulang: string;
  status: AttendanceStatus;
  keterangan: string;
}

export type JournalStatus = 'menunggu' | 'disetujui' | 'revisi';

export interface JournalRecord {
  id: string;
  studentId: string;
  tanggal: string; // YYYY-MM-DD
  judul?: string;
  kegiatan: string;
  jamMulai?: string;
  jamSelesai?: string;
  lokasi?: string;
  catatanInstruktur?: string;
  parafInstruktur?: string;
  fotoKegiatan?: string;
  fotos?: string[];
  reviewedBy?: string;
  reviewedAt?: string;
  status: JournalStatus;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // studentId or 'all' or 'guru'
  type: 'journal_approved' | 'journal_revision' | 'note_added' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  journalId?: string;
}

export interface TempatMagangItem {
  id: string;
  namaPerusahaan: string;
  alamat?: string;
  pembimbing?: string;
}

export interface CompanionState {
  name: string;
  mood: 'happy' | 'cheering' | 'thinking' | 'sleeping';
  dialogue: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

