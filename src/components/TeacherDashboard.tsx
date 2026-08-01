import React, { useState } from 'react';
import { TeacherProfile, StudentProfile, ClassName, AttendanceRecord, JournalRecord, JournalStatus } from '../types';
import { Users, BookOpen, Calendar, Download, Search, CheckCircle, ChevronRight, ArrowLeft, MessageSquare, LogOut, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Eye, Sparkles } from 'lucide-react';
import { AttendanceTable } from './AttendanceTable';
import { JournalTable } from './JournalTable';
import { PrintableBook } from './PrintableBook';
import { updateInstructorNotes, saveJournals, reviewJournalRecord } from '../services/storage';
import { downloadPDF } from '../utils/pdf';
import { playSuccessSound } from '../utils/audio';

interface TeacherDashboardProps {
  teacher: TeacherProfile;
  students: StudentProfile[];
  attendanceRecords: AttendanceRecord[];
  journalRecords: JournalRecord[];
  onLogout: () => void;
  onRefreshData: () => void;
}

const CLASSES: ClassName[] = ['TKJ', 'DKP'];

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  students,
  attendanceRecords,
  journalRecords,
  onLogout,
  onRefreshData,
}) => {
  const [selectedClass, setSelectedClass] = useState<ClassName>('TKJ');
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'semua' | 'menunggu' | 'disetujui' | 'revisi'>('semua');
  const [activeTab, setActiveTab] = useState<'presensi' | 'jurnal' | 'cetak'>('jurnal');
  const [viewMode, setViewMode] = useState<'students' | 'review_queue'>('students');
  const [isDownloading, setIsDownloading] = useState(false);

  // Edit Note Modal
  const [noteModal, setNoteModal] = useState<{ isOpen: boolean; journalId: string; note: string }>({
    isOpen: false,
    journalId: '',
    note: '',
  });

  // Calculate stats
  const pendingCount = journalRecords.filter((j) => j.status === 'menunggu').length;
  const approvedCount = journalRecords.filter((j) => j.status === 'disetujui').length;
  const revisionCount = journalRecords.filter((j) => j.status === 'revisi').length;

  // Filter students by class & search
  const classStudents = students.filter(
    (s) => s.kelas === selectedClass && s.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter journals for review queue
  const queueJournals = journalRecords.filter((j) => {
    const std = students.find((s) => s.id === j.studentId);
    if (!std || std.kelas !== selectedClass) return false;

    if (statusFilter !== 'semua' && j.status !== statusFilter) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchName = std.namaLengkap.toLowerCase().includes(term);
      const matchJudul = (j.judul || '').toLowerCase().includes(term);
      const matchKegiatan = j.kegiatan.toLowerCase().includes(term);
      return matchName || matchJudul || matchKegiatan;
    }

    return true;
  });

  // Selected student records
  const studentAttendance = selectedStudent
    ? attendanceRecords.filter((a) => a.studentId === selectedStudent.id)
    : [];
  const studentJournals = selectedStudent
    ? journalRecords.filter((j) => j.studentId === selectedStudent.id)
    : [];

  const handleOpenNoteModal = (journalId: string, currentNote: string) => {
    setNoteModal({
      isOpen: true,
      journalId,
      note: currentNote === '-' ? '' : currentNote,
    });
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = teacher.namaLengkap
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    updateInstructorNotes(noteModal.journalId, noteModal.note, initials);
    playSuccessSound();
    onRefreshData();
    setNoteModal({ isOpen: false, journalId: '', note: '' });
  };

  const handleDownloadPDF = async () => {
    if (!selectedStudent) return;
    setIsDownloading(true);
    await downloadPDF('printable-book-content', `Jurnal_${selectedStudent.namaLengkap.replace(/\s+/g, '_')}_${selectedStudent.kelas}.pdf`);
    setIsDownloading(false);
    playSuccessSound();
  };

  return (
    <div className="space-y-6">
      {/* Edit Instructor Note Modal */}
      {noteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSaveNote} className="game-card bg-[#FFFCF5] dark:bg-zinc-900 p-6 max-w-md w-full space-y-4 rounded-2xl">
            <h3 className="font-display font-black text-[#2d2d2d] dark:text-amber-100 text-lg uppercase flex items-center gap-2">
              <MessageSquare size={18} className="text-[#FF6B6B]" />
              Beri Catatan Instruktur / Guru
            </h3>
            <textarea
              required
              rows={4}
              placeholder="Tuliskan masukan, saran, atau catatan evaluasi untuk kegiatan siswa..."
              value={noteModal.note}
              onChange={(e) => setNoteModal({ ...noteModal, note: e.target.value })}
              className="w-full p-3 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setNoteModal({ isOpen: false, journalId: '', note: '' })}
                className="btn-pixel bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-200 px-4 py-2 text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-pixel bg-[#6BCB77] text-[#2d2d2d] font-display font-black text-xs px-5 py-2 rounded-xl uppercase"
              >
                Simpan Catatan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Top Banner Teacher Profile */}
      <div className="game-card bg-[#FF6B6B] text-white rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-[#2d2d2d] text-[#FFD93D] text-xs font-black px-3 py-1 rounded-md mb-2 font-display uppercase tracking-wider">
            <ShieldCheck size={14} /> PANEL MONITORING & REVIEW GURU
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight">{teacher.namaLengkap}</h2>
          <p className="text-xs sm:text-sm font-bold opacity-90">NIP: {teacher.nip}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onLogout}
            className="btn-pixel bg-[#2d2d2d] text-[#FFD93D] font-display font-black text-xs px-4 py-2.5 rounded-xl uppercase flex items-center gap-2"
          >
            <LogOut size={16} /> KELUAR GURU
          </button>
        </div>
      </div>

      {/* Quest Edition Stats Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 p-4 rounded-xl border-2 border-[#2d2d2d] space-y-1">
          <span className="text-[10px] font-black uppercase text-zinc-500">Total Siswa</span>
          <p className="font-display font-black text-xl text-[#2d2d2d] dark:text-zinc-100">{students.length} Siswa</p>
        </div>

        <div className="game-card bg-amber-100 dark:bg-amber-950 p-4 rounded-xl border-2 border-[#2d2d2d] space-y-1">
          <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 flex items-center gap-1">
            <Clock size={12} /> Menunggu Review
          </span>
          <p className="font-display font-black text-xl text-amber-900 dark:text-amber-100">{pendingCount} Jurnal</p>
        </div>

        <div className="game-card bg-emerald-100 dark:bg-emerald-950 p-4 rounded-xl border-2 border-[#2d2d2d] space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
            <CheckCircle2 size={12} /> Disetujui
          </span>
          <p className="font-display font-black text-xl text-emerald-900 dark:text-emerald-100">{approvedCount} Jurnal</p>
        </div>

        <div className="game-card bg-rose-100 dark:bg-rose-950 p-4 rounded-xl border-2 border-[#2d2d2d] space-y-1">
          <span className="text-[10px] font-black uppercase text-rose-800 dark:text-rose-300 flex items-center gap-1">
            <AlertTriangle size={12} /> Perlu Revisi
          </span>
          <p className="font-display font-black text-xl text-rose-900 dark:text-rose-100">{revisionCount} Jurnal</p>
        </div>
      </div>

      {/* Main Mode Toggle: Per-Siswa vs Antrean Review Jurnal */}
      {!selectedStudent && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 border-b-2 border-[#2d2d2d]/20 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('students')}
                className={`btn-pixel px-4 py-2 rounded-xl text-xs font-black font-display uppercase transition flex items-center gap-2 ${
                  viewMode === 'students'
                    ? 'bg-[#FFD93D] text-[#2d2d2d]'
                    : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-300'
                }`}
              >
                <Users size={15} /> Daftar Siswa ({classStudents.length})
              </button>

              <button
                onClick={() => setViewMode('review_queue')}
                className={`btn-pixel px-4 py-2 rounded-xl text-xs font-black font-display uppercase transition flex items-center gap-2 ${
                  viewMode === 'review_queue'
                    ? 'bg-[#6BCB77] text-[#2d2d2d]'
                    : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-300'
                }`}
              >
                <Clock size={15} /> Antrean Review Jurnal ({queueJournals.length})
              </button>
            </div>

            {/* Class Selector */}
            <div className="flex items-center gap-2">
              {CLASSES.map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`btn-pixel px-3 py-1.5 rounded-lg text-xs font-black font-display uppercase transition ${
                    selectedClass === cls
                      ? 'bg-[#4D96FF] text-white'
                      : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-300'
                  }`}
                >
                  Kelas {cls}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* Status Filter buttons for Review Queue */}
            {viewMode === 'review_queue' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setStatusFilter('semua')}
                  className={`btn-pixel px-3 py-1 rounded-lg text-[11px] font-black uppercase ${
                    statusFilter === 'semua' ? 'bg-[#2d2d2d] text-white' : 'bg-white dark:bg-zinc-800 text-[#2d2d2d]'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setStatusFilter('menunggu')}
                  className={`btn-pixel px-3 py-1 rounded-lg text-[11px] font-black uppercase ${
                    statusFilter === 'menunggu' ? 'bg-[#FFD93D] text-[#2d2d2d]' : 'bg-white dark:bg-zinc-800 text-[#2d2d2d]'
                  }`}
                >
                  🟡 Menunggu
                </button>
                <button
                  onClick={() => setStatusFilter('disetujui')}
                  className={`btn-pixel px-3 py-1 rounded-lg text-[11px] font-black uppercase ${
                    statusFilter === 'disetujui' ? 'bg-[#6BCB77] text-[#2d2d2d]' : 'bg-white dark:bg-zinc-800 text-[#2d2d2d]'
                  }`}
                >
                  🟢 Disetujui
                </button>
                <button
                  onClick={() => setStatusFilter('revisi')}
                  className={`btn-pixel px-3 py-1 rounded-lg text-[11px] font-black uppercase ${
                    statusFilter === 'revisi' ? 'bg-rose-500 text-white' : 'bg-white dark:bg-zinc-800 text-[#2d2d2d]'
                  }`}
                >
                  🔴 Revisi
                </button>
              </div>
            )}

            {/* Search Input */}
            <div className="relative w-full sm:w-64 ml-auto">
              <Search className="absolute left-3 top-2.5 text-[#2d2d2d]" size={16} />
              <input
                type="text"
                placeholder="Cari Nama / NISN / Judul..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
              />
            </div>
          </div>

          {/* VIEW 1: STUDENT CARDS GRID */}
          {viewMode === 'students' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classStudents.length === 0 ? (
                <div className="col-span-full game-card bg-[#FFFCF5] dark:bg-zinc-800 p-8 text-center rounded-2xl text-[#2d2d2d] dark:text-zinc-300 font-bold text-xs">
                  Tidak ada siswa terdaftar pada kelas {selectedClass}.
                </div>
              ) : (
                classStudents.map((std) => {
                  const attCount = attendanceRecords.filter((a) => a.studentId === std.id).length;
                  const myJournals = journalRecords.filter((j) => j.studentId === std.id);
                  const jrnCount = myJournals.length;
                  const pendingJrn = myJournals.filter((j) => j.status === 'menunggu').length;

                  return (
                    <div
                      key={std.id}
                      onClick={() => {
                        setSelectedStudent(std);
                        playSuccessSound();
                      }}
                      className="game-card game-card-hover bg-[#FFFCF5] dark:bg-zinc-900 p-5 rounded-2xl cursor-pointer group space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#4D96FF]/20 text-2xl flex items-center justify-center border-2 border-[#2d2d2d] shrink-0 shadow-[2px_2px_0px_#2d2d2d]">
                            {std.avatar || '🎓'}
                          </div>
                          <div>
                            <h4 className="font-display font-black text-base text-[#2d2d2d] dark:text-zinc-100 group-hover:text-[#4D96FF] transition uppercase">
                              {std.namaLengkap}
                            </h4>
                            <p className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-400">NISN: {std.nisn}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#2d2d2d] bg-[#FFD93D] border-2 border-[#2d2d2d] px-2 py-0.5 rounded-md font-display uppercase shadow-[1px_1px_0px_#2d2d2d]">
                          {std.kelas}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t-2 border-dashed border-[#2d2d2d]/20">
                        <div className="flex items-center gap-1.5 font-bold text-[#2d2d2d] dark:text-zinc-300">
                          <Calendar size={14} className="text-[#FF6B6B]" />
                          <span>{attCount} Presensi</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-[#2d2d2d] dark:text-zinc-300">
                          <BookOpen size={14} className="text-[#6BCB77]" />
                          <span>{jrnCount} Jurnal</span>
                        </div>
                      </div>

                      {pendingJrn > 0 && (
                        <div className="bg-amber-100 text-amber-900 text-[10px] font-black px-2 py-1 rounded-md border border-[#2d2d2d] flex items-center justify-between uppercase">
                          <span>🟡 {pendingJrn} Jurnal Menunggu Review</span>
                          <span className="underline">Review Now</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-[#4D96FF] font-black font-display uppercase pt-1">
                        <span>Lihat Rekapan Lengkap</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* VIEW 2: ALL ANTREAN REVIEW JURNAL QUEUE */}
          {viewMode === 'review_queue' && (
            <div className="space-y-4">
              {queueJournals.length === 0 ? (
                <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 p-8 text-center rounded-2xl text-zinc-500 font-bold text-xs">
                  Tidak ada jurnal kegiatan yang sesuai filter.
                </div>
              ) : (
                queueJournals.map((j) => {
                  const studentObj = students.find((s) => s.id === j.studentId);
                  return (
                    <div key={j.id} className="game-card bg-[#FFFCF5] dark:bg-zinc-900 p-4 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-[#2d2d2d]/20 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-black text-sm uppercase text-[#2d2d2d] dark:text-zinc-100">
                            {studentObj?.namaLengkap || 'Siswa'}
                          </span>
                          <span className="bg-[#FFD93D] text-[#2d2d2d] text-[10px] font-black px-2 py-0.5 rounded font-mono">
                            {studentObj?.kelas}
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-500">
                            ({j.tanggal})
                          </span>
                        </div>

                        {/* Action Buttons directly in queue card */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              reviewJournalRecord(j.id, 'disetujui', 'Sesuai dan Disetujui.', teacher.namaLengkap);
                              playSuccessSound();
                              onRefreshData();
                            }}
                            className="btn-pixel bg-[#6BCB77] text-[#2d2d2d] font-black text-xs px-3 py-1.5 rounded-xl uppercase flex items-center gap-1"
                          >
                            <CheckCircle2 size={14} /> Setujui
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt('Tuliskan Catatan Revisi untuk siswa:', 'Mohon jelaskan secara lebih detail.');
                              if (note) {
                                reviewJournalRecord(j.id, 'revisi', note, teacher.namaLengkap);
                                playSuccessSound();
                                onRefreshData();
                              }
                            }}
                            className="btn-pixel bg-rose-500 text-white font-black text-xs px-3 py-1.5 rounded-xl uppercase flex items-center gap-1"
                          >
                            <AlertTriangle size={14} /> Revisi
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <h4 className="font-black text-[#2d2d2d] dark:text-zinc-100 text-sm">{j.judul || 'Jurnal Magang'}</h4>
                        <p className="text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed">{j.kegiatan}</p>
                      </div>

                      {j.catatanInstruktur && j.catatanInstruktur !== '-' && (
                        <div className="p-2 bg-amber-50 dark:bg-zinc-800 border border-[#2d2d2d] rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          💬 Catatan Guru Sebelumnya: {j.catatanInstruktur}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Selected Student Detail View */}
      {selectedStudent && (
        <div className="space-y-6">
          {/* Back Button & Student Header */}
          <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="btn-pixel bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-200 p-2 rounded-xl"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="font-display font-black text-lg sm:text-xl text-[#2d2d2d] dark:text-zinc-100 uppercase">
                  Rekapan Magang: {selectedStudent.namaLengkap}
                </h3>
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 font-mono">
                  NISN: {selectedStudent.nisn} | KELAS {selectedStudent.kelas} | TEMPAT MAGANG: {selectedStudent.tempatMagang || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="btn-pixel bg-[#6BCB77] text-[#2d2d2d] font-display font-black text-xs px-4 py-2.5 rounded-xl uppercase flex items-center gap-2"
              >
                <Download size={15} /> {isDownloading ? 'Menyiapkan PDF...' : 'Download Rekapan PDF'}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-3 border-b-2 border-[#2d2d2d]/20 pb-2">
            <button
              onClick={() => setActiveTab('jurnal')}
              className={`btn-pixel px-4 py-2 rounded-xl text-xs font-black font-display uppercase transition flex items-center gap-2 ${
                activeTab === 'jurnal'
                  ? 'bg-[#6BCB77] text-[#2d2d2d]'
                  : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-300'
              }`}
            >
              <BookOpen size={15} /> Jurnal Kegiatan ({studentJournals.length})
            </button>
            <button
              onClick={() => setActiveTab('presensi')}
              className={`btn-pixel px-4 py-2 rounded-xl text-xs font-black font-display uppercase transition flex items-center gap-2 ${
                activeTab === 'presensi'
                  ? 'bg-[#FFD93D] text-[#2d2d2d]'
                  : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-300'
              }`}
            >
              <Calendar size={15} /> Presensi Magang ({studentAttendance.length})
            </button>
            <button
              onClick={() => setActiveTab('cetak')}
              className={`btn-pixel px-4 py-2 rounded-xl text-xs font-black font-display uppercase transition flex items-center gap-2 ${
                activeTab === 'cetak'
                  ? 'bg-[#4D96FF] text-white'
                  : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-300'
              }`}
            >
              <Download size={15} /> Preview Bukti Buku Cetak
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === 'presensi' && (
            <AttendanceTable student={selectedStudent} records={studentAttendance} />
          )}

          {activeTab === 'jurnal' && (
            <JournalTable
              student={selectedStudent}
              records={studentJournals}
              isTeacherView={true}
              teacherName={teacher.namaLengkap}
              onEditInstructorNote={handleOpenNoteModal}
              onRefreshData={onRefreshData}
            />
          )}

          {activeTab === 'cetak' && (
            <PrintableBook
              student={selectedStudent}
              attendanceRecords={studentAttendance}
              journalRecords={studentJournals}
            />
          )}
        </div>
      )}
    </div>
  );
};
