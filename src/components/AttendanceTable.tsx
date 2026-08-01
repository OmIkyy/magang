import React, { useState } from 'react';
import { AttendanceRecord, AttendanceStatus, StudentProfile } from '../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Edit3, Trash2, X, Save } from 'lucide-react';
import { updateAttendanceRecord, deleteAttendanceRecord } from '../services/storage';
import { playSuccessSound } from '../utils/audio';

interface AttendanceTableProps {
  student: StudentProfile;
  records: AttendanceRecord[];
  selectedMonth?: string;
  onRefreshData?: () => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  student,
  records,
  selectedMonth = 'Agustus 2026',
  onRefreshData,
}) => {
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);

  const formatTanggal = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'hadir':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Hadir</span>;
      case 'izin':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">Izin</span>;
      case 'sakit':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">Sakit</span>;
      case 'alpha':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">Alpha</span>;
      default:
        return status;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data presensi ini?')) {
      deleteAttendanceRecord(id);
      playSuccessSound();
      if (onRefreshData) onRefreshData();
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    updateAttendanceRecord(editingRecord.id, {
      tanggal: editingRecord.tanggal,
      jamMasuk: editingRecord.jamMasuk,
      jamPulang: editingRecord.jamPulang,
      status: editingRecord.status,
      keterangan: editingRecord.keterangan,
    });
    playSuccessSound();
    setEditingRecord(null);
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 rounded-2xl p-5 overflow-hidden">
      {/* Modal Edit Presensi */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 max-w-md w-full p-5 rounded-2xl border-4 border-[#2d2d2d] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#2d2d2d] pb-2">
              <h3 className="font-display font-black text-[#2d2d2d] dark:text-zinc-100 uppercase text-sm">
                Edit Presensi Magang
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="btn-pixel p-1 bg-rose-500 text-white rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-bold text-[#2d2d2d]">
              <div>
                <label className="block mb-1 uppercase">Tanggal</label>
                <input
                  type="date"
                  value={editingRecord.tanggal}
                  onChange={(e) => setEditingRecord({ ...editingRecord, tanggal: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 uppercase">Jam Masuk</label>
                  <input
                    type="text"
                    value={editingRecord.jamMasuk}
                    onChange={(e) => setEditingRecord({ ...editingRecord, jamMasuk: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white"
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase">Jam Pulang</label>
                  <input
                    type="text"
                    value={editingRecord.jamPulang}
                    onChange={(e) => setEditingRecord({ ...editingRecord, jamPulang: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase">Status</label>
                <select
                  value={editingRecord.status}
                  onChange={(e) => setEditingRecord({ ...editingRecord, status: e.target.value as AttendanceStatus })}
                  className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white"
                >
                  <option value="hadir">Hadir</option>
                  <option value="izin">Izin</option>
                  <option value="sakit">Sakit</option>
                  <option value="alpha">Alpha</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 uppercase">Keterangan</label>
                <input
                  type="text"
                  value={editingRecord.keterangan}
                  onChange={(e) => setEditingRecord({ ...editingRecord, keterangan: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white"
                  placeholder="Keterangan kehadiran..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="btn-pixel px-3 py-2 bg-zinc-300 text-[#2d2d2d] rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-pixel px-4 py-2 bg-[#6BCB77] text-[#2d2d2d] font-black rounded-xl flex items-center gap-1.5"
                >
                  <Save size={14} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="border-b-3 border-[#2d2d2d] pb-3 mb-4 text-[#2d2d2d] dark:text-zinc-100">
        <h4 className="font-display font-black text-center text-lg tracking-wider uppercase mb-3 text-[#2d2d2d] dark:text-zinc-100">
          PRESENSI MAGANG SISWA
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
          <div>
            <span className="text-zinc-500 uppercase">NAMA : </span>
            <span className="font-black uppercase tracking-wide">{student.namaLengkap}</span>
          </div>
          <div>
            <span className="text-zinc-500 uppercase">NIS / NISN : </span>
            <span className="font-mono font-bold">{student.nisn}</span>
          </div>
          <div className="sm:text-right">
            <span className="text-zinc-500 uppercase">Bulan : </span>
            <span className="font-black">{selectedMonth}</span>
          </div>
        </div>
      </div>

      {/* Table Format */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border-2 border-[#2d2d2d] text-xs">
          <thead>
            <tr className="bg-[#FFD93D] text-[#2d2d2d] text-center font-display font-black uppercase">
              <th rowSpan={2} className="border-2 border-[#2d2d2d] p-2 w-10">No</th>
              <th rowSpan={2} className="border-2 border-[#2d2d2d] p-2 min-w-[100px]">Hari / Tgl</th>
              <th colSpan={2} className="border-2 border-[#2d2d2d] p-1.5">Masuk</th>
              <th colSpan={2} className="border-2 border-[#2d2d2d] p-1.5">Pulang</th>
              <th rowSpan={2} className="border-2 border-[#2d2d2d] p-2 min-w-[120px]">Keterangan</th>
              <th rowSpan={2} className="border-2 border-[#2d2d2d] p-2 w-20">Aksi</th>
            </tr>
            <tr className="bg-[#FFD93D]/80 text-[#2d2d2d] text-center font-display font-black uppercase text-[11px]">
              <th className="border-2 border-[#2d2d2d] p-1.5 w-20">Pukul</th>
              <th className="border-2 border-[#2d2d2d] p-1.5 w-16">Paraf</th>
              <th className="border-2 border-[#2d2d2d] p-1.5 w-20">Pukul</th>
              <th className="border-2 border-[#2d2d2d] p-1.5 w-16">Paraf</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="border-2 border-[#2d2d2d] p-6 text-center text-[#2d2d2d] font-bold italic bg-white/50">
                  Belum ada rekapan presensi bulan ini.
                </td>
              </tr>
            ) : (
              records.map((rec, index) => (
                <tr key={rec.id} className="hover:bg-[#FFD93D]/20 transition bg-white dark:bg-zinc-800 font-bold">
                  <td className="border-2 border-[#2d2d2d] p-2 text-center font-mono text-[#2d2d2d] dark:text-zinc-200">{index + 1}</td>
                  <td className="border-2 border-[#2d2d2d] p-2 text-[#2d2d2d] dark:text-zinc-200">
                    <span className="font-black">{rec.hari}</span>, {formatTanggal(rec.tanggal)}
                  </td>
                  <td className="border-2 border-[#2d2d2d] p-2 text-center font-mono text-[#2d2d2d] dark:text-zinc-200">
                    {rec.jamMasuk}
                  </td>
                  <td className="border-2 border-[#2d2d2d] p-2 text-center font-black italic text-[#FF6B6B]">
                    {rec.parafMasuk || '-'}
                  </td>
                  <td className="border-2 border-[#2d2d2d] p-2 text-center font-mono text-[#2d2d2d] dark:text-zinc-200">
                    {rec.jamPulang}
                  </td>
                  <td className="border-2 border-[#2d2d2d] p-2 text-center font-black italic text-[#FF6B6B]">
                    {rec.parafPulang || '-'}
                  </td>
                  <td className="border-2 border-[#2d2d2d] p-2 text-[#2d2d2d] dark:text-zinc-200">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate">{rec.keterangan || '-'}</span>
                      {getStatusBadge(rec.status)}
                    </div>
                  </td>
                  <td className="border-2 border-[#2d2d2d] p-1 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setEditingRecord(rec)}
                        className="btn-pixel p-1.5 bg-[#FFD93D] text-[#2d2d2d] rounded-lg hover:bg-amber-400"
                        title="Edit Presensi"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(rec.id)}
                        className="btn-pixel p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                        title="Hapus Presensi"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
