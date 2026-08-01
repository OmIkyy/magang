import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus, StudentProfile } from '../types';
import { Calendar, Clock, CheckCircle, FileText, Send } from 'lucide-react';
import { addAttendanceRecord } from '../services/storage';
import { playSuccessSound, playLevelUpSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface AttendanceFormProps {
  student: StudentProfile;
  onSuccess: (expGained: number, isLevelUp: boolean) => void;
}

export const AttendanceForm: React.FC<AttendanceFormProps> = ({ student, onSuccess }) => {
  const today = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(today);
  const [jamMasuk, setJamMasuk] = useState('07:30');
  const [jamPulang, setJamPulang] = useState('16:00');
  const [status, setStatus] = useState<AttendanceStatus>('hadir');
  const [keterangan, setKeterangan] = useState('Hadir Tepat Waktu');

  // Auto calculate day in Indonesian
  const getHariName = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      return days[d.getDay()];
    } catch {
      return 'Senin';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Initials for Paraf
    const initials = student.namaLengkap
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 3)
      .toUpperCase();

    const { expGained, isLevelUp } = addAttendanceRecord({
      studentId: student.id,
      tanggal,
      hari: getHariName(tanggal),
      jamMasuk: status === 'hadir' ? jamMasuk : '-',
      parafMasuk: '',
      jamPulang: status === 'hadir' ? jamPulang : '-',
      parafPulang: '',
      status,
      keterangan,
    });

    if (isLevelUp) {
      playLevelUpSound();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } else {
      playSuccessSound();
    }

    onSuccess(expGained, isLevelUp);
  };

  return (
    <form onSubmit={handleSubmit} className="game-card bg-[#FFFCF5] dark:bg-zinc-900 rounded-2xl p-5 mb-6 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-[#2d2d2d]/20 pb-3 flex-wrap gap-2">
        <div>
          <h3 className="font-display font-black text-[#2d2d2d] dark:text-amber-100 flex items-center gap-2 text-base uppercase">
            <Calendar size={18} className="text-[#FF6B6B]" />
            INPUT PRESENSI MAGANG
          </h3>
          <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mt-0.5">
            💡 Tertinggal absen? Bebas pilih tanggal berapa saja untuk mengisi presensi susulan!
          </p>
        </div>
        <span className="text-xs font-black bg-[#FFD93D] text-[#2d2d2d] border-2 border-[#2d2d2d] px-2.5 py-1 rounded-md font-display uppercase shadow-[2px_2px_0px_#2d2d2d]">
          HARI {getHariName(tanggal).toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Date Selector */}
        <div>
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
            Pilih Tanggal Absen
          </label>
          <input
            type="date"
            required
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
            Status Kehadiran
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as AttendanceStatus)}
            className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
          >
            <option value="hadir">Hadir</option>
            <option value="izin">Izin</option>
            <option value="sakit">Sakit</option>
            <option value="alpha">Alpha</option>
          </select>
        </div>

        {/* Jam Masuk */}
        <div>
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 flex items-center gap-1 uppercase tracking-wide">
            <Clock size={12} /> Jam Masuk
          </label>
          <input
            type="time"
            disabled={status !== 'hadir'}
            value={jamMasuk}
            onChange={(e) => setJamMasuk(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl disabled:opacity-50 focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
          />
        </div>

        {/* Jam Pulang */}
        <div>
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 flex items-center gap-1 uppercase tracking-wide">
            <Clock size={12} /> Jam Pulang
          </label>
          <input
            type="time"
            disabled={status !== 'hadir'}
            value={jamPulang}
            onChange={(e) => setJamPulang(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl disabled:opacity-50 focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
          />
        </div>
      </div>

      {/* Keterangan */}
      <div>
        <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
          Keterangan / Catatan Singkat
        </label>
        <input
          type="text"
          placeholder="Contoh: Hadir Tepat Waktu, Maintenance Server, Izin Acara Keluarga"
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
        />
      </div>

      <button
        type="submit"
        className="btn-pixel w-full sm:w-auto px-6 py-2.5 bg-[#FFD93D] text-[#2d2d2d] font-display font-black text-xs rounded-xl uppercase flex items-center justify-center gap-2"
      >
        <Send size={15} /> Simpan Presensi (+15 EXP)
      </button>
    </form>
  );
};
