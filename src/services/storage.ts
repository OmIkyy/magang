import { StudentProfile, TeacherProfile, AttendanceRecord, JournalRecord, JournalStatus, NotificationItem, SupabaseConfig } from '../types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_ATTENDANCE, INITIAL_JOURNALS } from '../data/mockData';

const KEYS = {
  STUDENTS: 'jurnal_magang_students_v4',
  TEACHERS: 'jurnal_magang_teachers_v4',
  ATTENDANCE: 'jurnal_magang_attendance_v4',
  JOURNALS: 'jurnal_magang_journals_v4',
  NOTIFICATIONS: 'jurnal_magang_notifications_v4',
  SUPABASE: 'jurnal_magang_supabase_v4',
  PASSWORDS: 'jurnal_magang_passwords_v4',
};

// Reset Storage to Fresh Clean State
export const clearAllDataAndResetToFresh = () => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify([]));
  localStorage.setItem(KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify([]));
  localStorage.setItem(KEYS.JOURNALS, JSON.stringify([]));
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  const defaultPasswords: Record<string, string> = {
    'guru': 'gurusmk113',
    'bu_sri': 'gurusmk113',
  };
  localStorage.setItem(KEYS.PASSWORDS, JSON.stringify(defaultPasswords));
};

// Initialize default state if empty
const initStorage = () => {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEYS.STUDENTS)) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  }
  if (!localStorage.getItem(KEYS.TEACHERS)) {
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
  }
  if (!localStorage.getItem(KEYS.JOURNALS)) {
    localStorage.setItem(KEYS.JOURNALS, JSON.stringify(INITIAL_JOURNALS));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.PASSWORDS)) {
    const defaultPasswords: Record<string, string> = {
      'guru': 'gurusmk113',
      'bu_sri': 'gurusmk113',
    };
    localStorage.setItem(KEYS.PASSWORDS, JSON.stringify(defaultPasswords));
  }
};

initStorage();

// Image Compression Helper
export const compressImage = (base64Str: string, maxWidth = 1000, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image')) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } else {
        resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
  });
};

// Storage Getters
export const getStudents = (): StudentProfile[] => {
  try {
    const data = localStorage.getItem(KEYS.STUDENTS);
    return data ? JSON.parse(data) : INITIAL_STUDENTS;
  } catch {
    return INITIAL_STUDENTS;
  }
};

export const getTeachers = (): TeacherProfile[] => {
  try {
    const data = localStorage.getItem(KEYS.TEACHERS);
    return data ? JSON.parse(data) : INITIAL_TEACHERS;
  } catch {
    return INITIAL_TEACHERS;
  }
};

export const getAttendanceRecords = (): AttendanceRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : INITIAL_ATTENDANCE;
  } catch {
    return INITIAL_ATTENDANCE;
  }
};

export const getJournalRecords = (): JournalRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.JOURNALS);
    if (!data) return INITIAL_JOURNALS;
    const parsed: JournalRecord[] = JSON.parse(data);
    // Ensure status compatibility
    return parsed.map((j) => ({
      ...j,
      status: j.status || 'menunggu',
    }));
  } catch {
    return INITIAL_JOURNALS;
  }
};

export const getNotifications = (userId?: string): NotificationItem[] => {
  try {
    const data = localStorage.getItem(KEYS.NOTIFICATIONS);
    const list: NotificationItem[] = data ? JSON.parse(data) : [];
    if (!userId) return list;
    return list.filter((n) => n.userId === userId || n.userId === 'all');
  } catch {
    return [];
  }
};

export const getPasswords = (): Record<string, string> => {
  try {
    const data = localStorage.getItem(KEYS.PASSWORDS);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const saveStudents = (students: StudentProfile[]) => {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
};

export const saveAttendance = (records: AttendanceRecord[]) => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
};

export const saveJournals = (records: JournalRecord[]) => {
  localStorage.setItem(KEYS.JOURNALS, JSON.stringify(records));
};

export const saveNotifications = (notifications: NotificationItem[]) => {
  localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

export const savePasswords = (passwords: Record<string, string>) => {
  localStorage.setItem(KEYS.PASSWORDS, JSON.stringify(passwords));
};

// Notification Actions
export const addNotification = (notif: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>) => {
  const list = getNotifications();
  const newItem: NotificationItem = {
    ...notif,
    id: 'notif_' + Date.now(),
    read: false,
    createdAt: new Date().toISOString(),
  };
  list.unshift(newItem);
  saveNotifications(list);
  return newItem;
};

export const markNotificationAsRead = (id: string) => {
  const list = getNotifications();
  const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveNotifications(updated);
};

export const clearAllNotifications = () => {
  saveNotifications([]);
};

// Actions
export const registerStudent = (data: Omit<StudentProfile, 'id' | 'exp' | 'level' | 'streak' | 'badges' | 'avatar' | 'createdAt'> & { password: string }): { success: boolean; message: string; student?: StudentProfile } => {
  const students = getStudents();
  const passwords = getPasswords();

  // Check NISN or username existing
  if (students.some(s => s.nisn === data.nisn)) {
    return { success: false, message: 'NISN sudah terdaftar! Silakan login atau gunakan NISN lain.' };
  }
  if (students.some(s => s.username.toLowerCase() === data.username.toLowerCase())) {
    return { success: false, message: 'Username sudah digunakan!' };
  }

  const avatars = ['🐱', '🦊', '🐼', '🐯', '🦁', '🐰', '🐨', '🦄'];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

  const newStudent: StudentProfile = {
    id: 's_' + Date.now(),
    username: data.username,
    namaLengkap: data.namaLengkap,
    nisn: data.nisn,
    email: data.email,
    kelas: data.kelas,
    tempatMagang: data.tempatMagang || '-',
    pembimbingDudi: data.pembimbingDudi || '-',
    exp: 0,
    level: 0,
    streak: 0,
    badges: [],
    avatar: randomAvatar,
    createdAt: new Date().toISOString().split('T')[0],
  };

  students.push(newStudent);
  passwords[data.username.toLowerCase()] = data.password;

  saveStudents(students);
  savePasswords(passwords);

  return { success: true, message: 'Pendaftaran berhasil! Silakan login.', student: newStudent };
};

export const updateStudentProfile = (studentId: string, updates: Partial<StudentProfile>): StudentProfile[] => {
  const students = getStudents();
  const updated = students.map((s) => {
    if (s.id === studentId) {
      return { ...s, ...updates };
    }
    return s;
  });
  saveStudents(updated);
  return updated;
};

export const resetPasswordByEmail = (email: string, newPass: string): { success: boolean; message: string } => {
  const students = getStudents();
  const student = students.find(s => s.email.toLowerCase() === email.toLowerCase());

  if (!student) {
    return { success: false, message: 'Email tidak ditemukan dalam sistem.' };
  }

  const passwords = getPasswords();
  passwords[student.username.toLowerCase()] = newPass;
  savePasswords(passwords);

  return { success: true, message: `Kata sandi untuk ${student.namaLengkap} berhasil diperbarui!` };
};

export const addAttendanceRecord = (record: Omit<AttendanceRecord, 'id'>): { record: AttendanceRecord; expGained: number; isLevelUp: boolean } => {
  const records = getAttendanceRecords();
  const newRecord: AttendanceRecord = {
    ...record,
    id: 'att_' + Date.now(),
  };

  records.unshift(newRecord);
  saveAttendance(records);

  // Add EXP to student
  const students = getStudents();
  let expGained = 15;
  let isLevelUp = false;

  const updatedStudents = students.map(s => {
    if (s.id === record.studentId) {
      const studentRecords = records.filter(r => r.studentId === s.id);
      const oldLevel = Math.floor(s.exp / 100);
      const newExp = s.exp + expGained;
      const newLevel = Math.floor(newExp / 100);
      if (newLevel > oldLevel) isLevelUp = true;

      const streak = studentRecords.length;

      const badges = [...s.badges];
      if (streak >= 3 && !badges.includes('Absen Teratur')) {
        badges.push('Absen Teratur');
      }
      if (streak >= 10 && !badges.includes('100% Kehadiran')) {
        badges.push('100% Kehadiran');
      }

      return { ...s, exp: newExp, level: newLevel, streak, badges };
    }
    return s;
  });

  saveStudents(updatedStudents);

  return { record: newRecord, expGained, isLevelUp };
};

export const addJournalRecord = (record: Omit<JournalRecord, 'id' | 'createdAt' | 'status'> & { status?: JournalStatus }): { record: JournalRecord; expGained: number; isLevelUp: boolean } => {
  const records = getJournalRecords();
  const newRecord: JournalRecord = {
    ...record,
    id: 'j_' + Date.now(),
    status: record.status || 'menunggu',
    catatanInstruktur: record.catatanInstruktur || '-',
    parafInstruktur: record.parafInstruktur || '-',
    createdAt: new Date().toISOString(),
  };

  records.unshift(newRecord);
  saveJournals(records);

  // Add EXP to student
  const students = getStudents();
  const hasPhotos = (record.fotos && record.fotos.length > 0) || !!record.fotoKegiatan;
  let expGained = hasPhotos ? 50 : 30;
  let isLevelUp = false;

  const updatedStudents = students.map(s => {
    if (s.id === record.studentId) {
      const studentJournals = records.filter(r => r.studentId === s.id);
      const oldLevel = Math.floor(s.exp / 100);
      const newExp = s.exp + expGained;
      const newLevel = Math.floor(newExp / 100);
      if (newLevel > oldLevel) isLevelUp = true;

      const badges = [...s.badges];
      if (studentJournals.length >= 1 && !badges.includes('Jurnal Perdana')) {
        badges.push('Jurnal Perdana');
      }
      if (studentJournals.length >= 7 && !badges.includes('7 Hari Konsisten')) {
        badges.push('7 Hari Konsisten');
      }
      if (studentJournals.length >= 10 && !badges.includes('10 Jurnal Selesai')) {
        badges.push('10 Jurnal Selesai');
      }
      if (hasPhotos && !badges.includes('Dokumentator Handal')) {
        badges.push('Dokumentator Handal');
      }

      return { ...s, exp: newExp, level: newLevel, badges };
    }
    return s;
  });

  saveStudents(updatedStudents);

  // Create System Notification
  addNotification({
    userId: record.studentId,
    type: 'note_added',
    title: '🟡 Jurnal Baru Dikirim',
    message: `Jurnal tanggal ${record.tanggal} berhasil dikirim dan menunggu review guru.`,
    journalId: newRecord.id,
  });

  return { record: newRecord, expGained, isLevelUp };
};

export const reviewJournalRecord = (
  journalId: string,
  status: JournalStatus,
  catatan: string,
  reviewerName: string
): { success: boolean; updatedJournals: JournalRecord[] } => {
  const records = getJournalRecords();
  let studentId = '';
  let tanggal = '';

  const updated = records.map((r) => {
    if (r.id === journalId) {
      studentId = r.studentId;
      tanggal = r.tanggal;
      const initials = reviewerName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

      return {
        ...r,
        status,
        catatanInstruktur: catatan || (status === 'disetujui' ? 'Sesuai dan Disetujui.' : 'Perlu perbaikan.'),
        parafInstruktur: initials,
        reviewedBy: reviewerName,
        reviewedAt: new Date().toISOString(),
      };
    }
    return r;
  });

  saveJournals(updated);

  // Send Notification to Student
  if (studentId) {
    if (status === 'disetujui') {
      // Award Bonus EXP to student for approved journal
      const students = getStudents();
      const updatedStudents = students.map((s) => {
        if (s.id === studentId) {
          return { ...s, exp: s.exp + 20 }; // Bonus +20 EXP for approval
        }
        return s;
      });
      saveStudents(updatedStudents);

      addNotification({
        userId: studentId,
        type: 'journal_approved',
        title: '🟢 Jurnal Disetujui!',
        message: `Jurnal Anda tanggal ${tanggal} telah disetujui oleh ${reviewerName}. Bonus +20 EXP!`,
        journalId,
      });
    } else if (status === 'revisi') {
      addNotification({
        userId: studentId,
        type: 'journal_revision',
        title: '🔴 Jurnal Perlu Revisi',
        message: `Guru ${reviewerName} meminta revisi untuk jurnal tanggal ${tanggal}: "${catatan}"`,
        journalId,
      });
    }
  }

  return { success: true, updatedJournals: updated };
};

export const updateInstructorNotes = (journalId: string, catatan: string, paraf: string): JournalRecord[] => {
  const records = getJournalRecords();
  const updated = records.map(r => {
    if (r.id === journalId) {
      return { ...r, catatanInstruktur: catatan, parafInstruktur: paraf };
    }
    return r;
  });
  saveJournals(updated);
  return updated;
};

// Update Avatar for Student
export const updateStudentAvatar = (studentId: string, avatar: string): StudentProfile[] => {
  const students = getStudents();
  const updated = students.map(s => {
    if (s.id === studentId) {
      return { ...s, avatar };
    }
    return s;
  });
  saveStudents(updated);
  return updated;
};

// Delete & Edit Attendance Records
export const deleteAttendanceRecord = (id: string): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  const filtered = records.filter(r => r.id !== id);
  saveAttendance(filtered);
  return filtered;
};

export const updateAttendanceRecord = (id: string, updatedData: Partial<AttendanceRecord>): AttendanceRecord[] => {
  const records = getAttendanceRecords();
  const updated = records.map(r => {
    if (r.id === id) {
      return { ...r, ...updatedData };
    }
    return r;
  });
  saveAttendance(updated);
  return updated;
};

// Delete & Edit Journal Records
export const deleteJournalRecord = (id: string): JournalRecord[] => {
  const records = getJournalRecords();
  const filtered = records.filter(r => r.id !== id);
  saveJournals(filtered);
  return filtered;
};

export const updateJournalRecord = (id: string, updatedData: Partial<JournalRecord>): JournalRecord[] => {
  const records = getJournalRecords();
  const updated = records.map(r => {
    if (r.id === id) {
      // If resubmitted from revision, set back to 'menunggu' for review
      const newStatus = r.status === 'revisi' ? 'menunggu' : (updatedData.status || r.status);
      return { ...r, ...updatedData, status: newStatus };
    }
    return r;
  });
  saveJournals(updated);
  return updated;
};

// Supabase Config Storage
export const getSupabaseConfig = (): SupabaseConfig => {
  try {
    const data = localStorage.getItem(KEYS.SUPABASE);
    return data ? JSON.parse(data) : { url: '', anonKey: '', isConnected: false };
  } catch {
    return { url: '', anonKey: '', isConnected: false };
  }
};

export const saveSupabaseConfig = (cfg: SupabaseConfig) => {
  localStorage.setItem(KEYS.SUPABASE, JSON.stringify(cfg));
};
