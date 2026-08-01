import { StudentProfile, TeacherProfile, AttendanceRecord, JournalRecord } from '../types';

export const INITIAL_STUDENTS: StudentProfile[] = [];

export const INITIAL_TEACHERS: TeacherProfile[] = [
  {
    id: 't1',
    username: 'guru',
    namaLengkap: 'Hendra Wijaya, S.Kom',
    nip: '19850112 201001 1 002',
    email: 'hendra.wijaya@guru.smk.sch.id',
  },
  {
    id: 't2',
    username: 'bu_sri',
    namaLengkap: 'Sri Wahyuni, M.Pd',
    nip: '19880315 201202 2 004',
    email: 'sri.wahyuni@guru.smk.sch.id',
  }
];

// Fresh empty arrays - No demo attendance or journals prefilled
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_JOURNALS: JournalRecord[] = [];


