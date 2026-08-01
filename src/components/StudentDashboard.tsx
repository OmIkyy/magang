import React, { useState } from 'react';
import { StudentProfile, AttendanceRecord, JournalRecord } from '../types';
import { GameCompanion } from './GameCompanion';
import { AttendanceForm } from './AttendanceForm';
import { AttendanceTable } from './AttendanceTable';
import { JournalForm } from './JournalForm';
import { JournalTable } from './JournalTable';
import { JournalCalendar } from './JournalCalendar';
import { PrintableBook } from './PrintableBook';
import { Calendar, BookOpen, Download, LogOut, Award, Sparkles, Database, Camera, X, Check, Upload, Building, Edit3, Save } from 'lucide-react';
import { downloadPDF } from '../utils/pdf';
import { playSuccessSound } from '../utils/audio';
import { updateStudentAvatar, updateStudentProfile } from '../services/storage';

interface StudentDashboardProps {
  student: StudentProfile;
  attendanceRecords: AttendanceRecord[];
  journalRecords: JournalRecord[];
  onLogout: () => void;
  onRefreshData: () => void;
  onOpenSupabaseModal?: () => void;
}

const PRESET_AVATARS = [
  '🍎', '🍓', '🥑', '🍌', '🍇', '🍉', '🍊', '🍒',
  '🐱', '🦊', '🐼', '🐯', '🦁', '🐰', '🎓', '🚀'
];

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  attendanceRecords,
  journalRecords,
  onLogout,
  onRefreshData,
  onOpenSupabaseModal,
}) => {
  const [activeTab, setActiveTab] = useState<'presensi' | 'jurnal' | 'kalender' | 'rekapan'>('presensi');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

  // Edit Tempat Magang state
  const [tempatMagangInput, setTempatMagangInput] = useState(student.tempatMagang || '');
  const [pembimbingDudiInput, setPembimbingDudiInput] = useState(student.pembimbingDudi || '');

  // Student specific records
  const myAttendance = attendanceRecords.filter((a) => a.studentId === student.id);
  const myJournals = journalRecords.filter((j) => j.studentId === student.id);

  const handleFormSuccess = () => {
    onRefreshData();
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    await downloadPDF('printable-book-content', `Jurnal_${student.namaLengkap.replace(/\s+/g, '_')}_${student.kelas}.pdf`);
    setIsDownloading(false);
    playSuccessSound();
  };

  const handleSelectPresetAvatar = (avatarEmoji: string) => {
    updateStudentAvatar(student.id, avatarEmoji);
    playSuccessSound();
    setIsAvatarModalOpen(false);
    onRefreshData();
  };

  const handleFileUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCustomAvatar = () => {
    if (customAvatarPreview) {
      updateStudentAvatar(student.id, customAvatarPreview);
      playSuccessSound();
      setCustomAvatarPreview(null);
      setIsAvatarModalOpen(false);
      onRefreshData();
    }
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentProfile(student.id, {
      tempatMagang: tempatMagangInput,
      pembimbingDudi: pembimbingDudiInput,
    });
    playSuccessSound();
    setIsCompanyModalOpen(false);
    onRefreshData();
  };

  const isPhotoAvatar = student.avatar && (student.avatar.startsWith('data:') || student.avatar.startsWith('http'));

  return (
    <div className="space-y-6">
      {/* Modal Edit Tempat Magang DU/DI */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveCompany} className="game-card bg-[#FFFCF5] dark:bg-zinc-900 max-w-md w-full p-5 rounded-2xl border-4 border-[#2d2d2d] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#2d2d2d] pb-2">
              <h3 className="font-display font-black text-[#2d2d2d] dark:text-zinc-100 uppercase text-sm flex items-center gap-2">
                <Building size={16} className="text-[#FFD93D]" /> Set Tempat Magang / DU/DI
              </h3>
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(false)}
                className="btn-pixel p-1 bg-rose-500 text-white rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-bold text-[#2d2d2d] dark:text-zinc-200">
              <div>
                <label className="block mb-1 uppercase">Nama Perusahaan / Instansi DU/DI</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT. Telkom Indonesia / Studio DKP"
                  value={tempatMagangInput}
                  onChange={(e) => setTempatMagangInput(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white dark:bg-zinc-800"
                />
              </div>

              <div>
                <label className="block mb-1 uppercase">Nama Pembimbing Lapangan DU/DI</label>
                <input
                  type="text"
                  placeholder="Contoh: Bpk. Ahmad Subagyo, S.T."
                  value={pembimbingDudiInput}
                  onChange={(e) => setPembimbingDudiInput(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white dark:bg-zinc-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCompanyModalOpen(false)}
                className="btn-pixel px-3 py-2 bg-zinc-300 text-[#2d2d2d] rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-pixel px-4 py-2 bg-[#6BCB77] text-[#2d2d2d] font-black text-xs rounded-xl uppercase flex items-center gap-1"
              >
                <Save size={14} /> Simpan Tempat Magang
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Pilih / Upload Foto Profil */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 max-w-md w-full p-5 rounded-2xl border-4 border-[#2d2d2d] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#2d2d2d] pb-2">
              <h3 className="font-display font-black text-[#2d2d2d] dark:text-zinc-100 uppercase text-sm">
                Ganti Foto / Logo Profil
              </h3>
              <button
                onClick={() => {
                  setIsAvatarModalOpen(false);
                  setCustomAvatarPreview(null);
                }}
                className="btn-pixel p-1 bg-rose-500 text-white rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Upload Custom Image */}
            <div className="p-3 bg-amber-50 border-2 border-dashed border-[#2d2d2d] rounded-xl text-center space-y-2">
              <p className="text-xs font-bold text-[#2d2d2d] uppercase">1. Unggah Foto Anda Sendiri (Muka / Gambar)</p>
              {customAvatarPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-20 h-20 rounded-2xl border-2 border-[#2d2d2d] overflow-hidden shadow-[2px_2px_0px_#2d2d2d]">
                    <img src={customAvatarPreview} alt="Preview Foto" className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={handleSaveCustomAvatar}
                    className="btn-pixel px-4 py-1.5 bg-[#6BCB77] text-[#2d2d2d] font-black text-xs rounded-xl flex items-center gap-1 uppercase"
                  >
                    <Check size={14} /> Gunakan Foto Ini
                  </button>
                </div>
              ) : (
                <label className="btn-pixel inline-flex items-center gap-2 px-4 py-2 bg-[#FFD93D] text-[#2d2d2d] font-black text-xs rounded-xl cursor-pointer uppercase">
                  <Upload size={15} /> Pilih File Foto Dari HP / Laptop
                  <input type="file" accept="image/*" onChange={handleFileUploadAvatar} className="hidden" />
                </label>
              )}
            </div>

            {/* Presets */}
            <div>
              <p className="text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 uppercase mb-2">
                2. Atau Pilih Logo / Karakter Bawaan (Buahan & Hewan)
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelectPresetAvatar(emoji)}
                    className="w-10 h-10 rounded-xl bg-white border-2 border-[#2d2d2d] text-xl flex items-center justify-center hover:bg-amber-100 transition shadow-[2px_2px_0px_#2d2d2d]"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Profile */}
      <div className="game-card bg-[#FFD93D] rounded-2xl p-5 text-[#2d2d2d] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative group cursor-pointer w-16 h-16 rounded-2xl bg-white border-2 border-[#2d2d2d] text-3xl flex items-center justify-center overflow-hidden shadow-[3px_3px_0px_#2d2d2d] shrink-0"
            title="Klik untuk Ganti Foto Profil"
          >
            {isPhotoAvatar ? (
              <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{student.avatar || '🐱'}</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
              <Camera size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-tight">{student.namaLengkap}</h2>
              <span className="bg-[#2d2d2d] text-[#FFD93D] text-xs font-black px-2.5 py-0.5 rounded-md font-display uppercase">
                KELAS {student.kelas}
              </span>
              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="btn-pixel bg-white text-[#2d2d2d] border border-[#2d2d2d] text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
              >
                <Camera size={12} /> Foto
              </button>
            </div>
            
            <div className="flex items-center gap-3 text-xs font-mono font-bold text-[#2d2d2d]/90 mt-1 flex-wrap">
              <span>NISN: {student.nisn}</span>
              <span className="opacity-40">•</span>
              <button
                onClick={() => setIsCompanyModalOpen(true)}
                className="hover:underline flex items-center gap-1 font-sans text-xs bg-white/60 px-2 py-0.5 rounded-md border border-[#2d2d2d]/30"
              >
                <Building size={12} className="text-amber-800" />
                <span>Lokasi Magang: <strong>{student.tempatMagang || 'Belum diisi'}</strong></span>
                <Edit3 size={11} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onLogout}
            className="btn-pixel bg-[#FF6B6B] text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-2 uppercase font-display"
          >
            <LogOut size={15} /> KELUAR
          </button>
        </div>
      </div>

      {/* Game Companion & Level Widget */}
      <GameCompanion
        studentName={student.namaLengkap}
        exp={student.exp}
        level={student.level}
        streak={student.streak}
        badges={student.badges}
        role="siswa"
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 border-b-2 border-[#2d2d2d]/20">
        <button
          onClick={() => {
            setActiveTab('presensi');
            playSuccessSound();
          }}
          className={`btn-pixel px-5 py-2.5 rounded-xl text-xs font-black font-display tracking-wider uppercase transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'presensi'
              ? 'bg-[#FFD93D] text-[#2d2d2d]'
              : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-200'
          }`}
        >
          <Calendar size={16} /> Presensi Magang ({myAttendance.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('jurnal');
            playSuccessSound();
          }}
          className={`btn-pixel px-5 py-2.5 rounded-xl text-xs font-black font-display tracking-wider uppercase transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'jurnal'
              ? 'bg-[#6BCB77] text-[#2d2d2d]'
              : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-200'
          }`}
        >
          <BookOpen size={16} /> Buku Jurnal ({myJournals.length})
        </button>

        <button
          onClick={() => {
            setActiveTab('kalender');
            playSuccessSound();
          }}
          className={`btn-pixel px-5 py-2.5 rounded-xl text-xs font-black font-display tracking-wider uppercase transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'kalender'
              ? 'bg-[#FF9F43] text-white'
              : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-200'
          }`}
        >
          <Calendar size={16} /> Kalender Aktivitas & Revisi
        </button>

        <button
          onClick={() => {
            setActiveTab('rekapan');
            playSuccessSound();
          }}
          className={`btn-pixel px-5 py-2.5 rounded-xl text-xs font-black font-display tracking-wider uppercase transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'rekapan'
              ? 'bg-[#4D96FF] text-white'
              : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-200'
          }`}
        >
          <Download size={16} /> Download Rekapan PDF
        </button>
      </div>

      {/* TAB 1: PRESENSI */}
      {activeTab === 'presensi' && (
        <div className="space-y-6">
          <AttendanceForm student={student} onSuccess={handleFormSuccess} />
          <AttendanceTable student={student} records={myAttendance} onRefreshData={onRefreshData} />
        </div>
      )}

      {/* TAB 2: JURNAL */}
      {activeTab === 'jurnal' && (
        <div className="space-y-6">
          <JournalForm student={student} onSuccess={handleFormSuccess} />
          <JournalTable student={student} records={myJournals} onRefreshData={onRefreshData} />
        </div>
      )}

      {/* TAB 3: KALENDER AKTIVITAS */}
      {activeTab === 'kalender' && (
        <div className="space-y-6">
          <JournalCalendar
            attendanceRecords={myAttendance}
            journalRecords={myJournals}
            studentName={student.namaLengkap}
          />
        </div>
      )}

      {/* TAB 4: REKAPAN & DOWNLOAD PDF */}
      {activeTab === 'rekapan' && (
        <div className="space-y-6">
          <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-black text-lg text-[#2d2d2d] dark:text-zinc-100 uppercase">
                Unduh Hasil Rekapan Format Buku Magang
              </h3>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400 mt-0.5">
                Laporan tercetak rapi sesuai standar buku logbook sekolah (Termasuk tabel presensi, jurnal, & foto kegiatan).
              </p>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="btn-pixel bg-[#6BCB77] text-[#2d2d2d] font-display font-black text-xs px-5 py-3 rounded-xl uppercase tracking-wider flex items-center gap-2 shrink-0"
            >
              <Download size={16} />
              {isDownloading ? 'Memproses PDF...' : 'Download PDF Sekarang'}
            </button>
          </div>

          <PrintableBook
            student={student}
            attendanceRecords={myAttendance}
            journalRecords={myJournals}
          />
        </div>
      )}
    </div>
  );
};
