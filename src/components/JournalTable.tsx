import React, { useState } from 'react';
import { JournalRecord, StudentProfile, JournalStatus } from '../types';
import { Image as ImageIcon, MessageSquare, X, Eye, Edit3, Trash2, Save, Upload, CheckCircle2, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { updateJournalRecord, deleteJournalRecord, reviewJournalRecord } from '../services/storage';
import { playSuccessSound } from '../utils/audio';

interface JournalTableProps {
  student: StudentProfile;
  records: JournalRecord[];
  isTeacherView?: boolean;
  teacherName?: string;
  onEditInstructorNote?: (journalId: string, currentNote: string) => void;
  onRefreshData?: () => void;
}

export const JournalTable: React.FC<JournalTableProps> = ({
  student,
  records,
  isTeacherView = false,
  teacherName = 'Guru Pembimbing',
  onEditInstructorNote,
  onRefreshData,
}) => {
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<JournalRecord | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    journal?: JournalRecord;
    catatan: string;
    status: JournalStatus;
  }>({
    isOpen: false,
    catatan: '',
    status: 'disetujui',
  });

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

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus catatan jurnal ini?')) {
      deleteJournalRecord(id);
      playSuccessSound();
      if (onRefreshData) onRefreshData();
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    updateJournalRecord(editingRecord.id, {
      judul: editingRecord.judul,
      tanggal: editingRecord.tanggal,
      jamMulai: editingRecord.jamMulai,
      jamSelesai: editingRecord.jamSelesai,
      lokasi: editingRecord.lokasi,
      kegiatan: editingRecord.kegiatan,
      fotoKegiatan: editingRecord.fotoKegiatan,
      fotos: editingRecord.fotos,
      status: 'menunggu', // Resubmit sets back to pending review
    });
    playSuccessSound();
    setEditingRecord(null);
    if (onRefreshData) onRefreshData();
  };

  const handleOpenReview = (journal: JournalRecord, targetStatus: JournalStatus) => {
    setReviewModal({
      isOpen: true,
      journal,
      status: targetStatus,
      catatan: targetStatus === 'disetujui' ? 'Sesuai dan Disetujui.' : 'Mohon tambahkan penjelasan lebih rinci.',
    });
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModal.journal) return;

    reviewJournalRecord(
      reviewModal.journal.id,
      reviewModal.status,
      reviewModal.catatan,
      teacherName
    );

    playSuccessSound();
    setReviewModal({ isOpen: false, catatan: '', status: 'disetujui' });
    if (onRefreshData) onRefreshData();
  };

  return (
    <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 rounded-2xl p-5 overflow-hidden space-y-4">
      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full game-card bg-[#FFFCF5] p-3 rounded-2xl overflow-hidden">
            <button
              onClick={() => setActivePhoto(null)}
              className="btn-pixel absolute top-4 right-4 bg-[#FF6B6B] text-white p-2 rounded-full z-10"
            >
              <X size={18} />
            </button>
            <img
              src={activePhoto}
              alt="Foto Dokumentasi Kegiatan"
              referrerPolicy="no-referrer"
              className="w-full max-h-[80vh] object-contain rounded-xl border-2 border-[#2d2d2d]"
            />
          </div>
        </div>
      )}

      {/* Guru Review Modal */}
      {reviewModal.isOpen && reviewModal.journal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleConfirmReview} className="game-card bg-[#FFFCF5] dark:bg-zinc-900 max-w-md w-full p-5 rounded-2xl border-4 border-[#2d2d2d] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#2d2d2d] pb-2">
              <h3 className="font-display font-black text-[#2d2d2d] dark:text-zinc-100 uppercase text-sm flex items-center gap-1.5">
                {reviewModal.status === 'disetujui' ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <AlertTriangle size={18} className="text-rose-500" />
                )}
                {reviewModal.status === 'disetujui' ? 'Setujui Jurnal Kegiatan' : 'Minta Revisi Jurnal'}
              </h3>
              <button
                type="button"
                onClick={() => setReviewModal({ isOpen: false, catatan: '', status: 'disetujui' })}
                className="btn-pixel p-1 bg-rose-500 text-white rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-zinc-800 rounded-xl border-2 border-[#2d2d2d] text-xs space-y-1">
              <p className="font-black text-[#2d2d2d] dark:text-zinc-100">{reviewModal.journal.judul || 'Jurnal Magang'}</p>
              <p className="text-zinc-600 dark:text-zinc-400 font-bold">Siswa: {student.namaLengkap} ({formatTanggal(reviewModal.journal.tanggal)})</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-200 mb-1 uppercase">
                Catatan Evaluasi / Pesan Pembimbing
              </label>
              <textarea
                required
                rows={3}
                value={reviewModal.catatan}
                onChange={(e) => setReviewModal({ ...reviewModal, catatan: e.target.value })}
                className="w-full p-3 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModal({ isOpen: false, catatan: '', status: 'disetujui' })}
                className="btn-pixel px-4 py-2 bg-zinc-200 text-[#2d2d2d] rounded-xl font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className={`btn-pixel px-5 py-2 font-black text-xs uppercase rounded-xl ${
                  reviewModal.status === 'disetujui'
                    ? 'bg-[#6BCB77] text-[#2d2d2d]'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {reviewModal.status === 'disetujui' ? 'Ya, Setujui Jurnal' : 'Kirim Catatan Revisi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Edit / Perbaiki Jurnal Siswa */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 max-w-lg w-full p-5 rounded-2xl border-4 border-[#2d2d2d] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#2d2d2d] pb-2">
              <h3 className="font-display font-black text-[#2d2d2d] dark:text-zinc-100 uppercase text-sm">
                Perbaiki Catatan Jurnal
              </h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="btn-pixel p-1 bg-rose-500 text-white rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs font-bold text-[#2d2d2d] dark:text-zinc-200">
              <div>
                <label className="block mb-1 uppercase">Judul Kegiatan</label>
                <input
                  type="text"
                  value={editingRecord.judul || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, judul: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white dark:bg-zinc-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 uppercase">Tanggal</label>
                  <input
                    type="date"
                    value={editingRecord.tanggal}
                    onChange={(e) => setEditingRecord({ ...editingRecord, tanggal: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white dark:bg-zinc-800"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 uppercase">Lokasi</label>
                  <input
                    type="text"
                    value={editingRecord.lokasi || ''}
                    onChange={(e) => setEditingRecord({ ...editingRecord, lokasi: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white dark:bg-zinc-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 uppercase">Deskripsi Kegiatan</label>
                <textarea
                  rows={4}
                  value={editingRecord.kegiatan}
                  onChange={(e) => setEditingRecord({ ...editingRecord, kegiatan: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-[#2d2d2d] rounded-xl bg-white dark:bg-zinc-800 resize-none"
                  required
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
                  className="btn-pixel px-4 py-2 bg-[#6BCB77] text-[#2d2d2d] font-black rounded-xl flex items-center gap-1.5 uppercase"
                >
                  <Save size={14} /> Kirim Ulang Jurnal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="border-b-3 border-[#2d2d2d] pb-3 text-[#2d2d2d] dark:text-zinc-100">
        <h4 className="font-display font-black text-center text-lg tracking-wider uppercase mb-2 text-[#2d2d2d] dark:text-zinc-100">
          DAFTAR BUKU JURNAL KEGIATAN MAGANG
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
          <div>
            <span className="text-zinc-500 uppercase">NAMA SISWA : </span>
            <span className="font-black uppercase tracking-wide">{student.namaLengkap}</span>
          </div>
          <div className="sm:text-right">
            <span className="text-zinc-500 uppercase">NISN / KELAS : </span>
            <span className="font-mono font-bold">{student.nisn} ({student.kelas})</span>
          </div>
        </div>
      </div>

      {/* Table Format */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border-2 border-[#2d2d2d] text-xs">
          <thead>
            <tr className="bg-[#6BCB77] text-[#2d2d2d] text-center font-display font-black uppercase">
              <th className="border-2 border-[#2d2d2d] p-2 w-10">No</th>
              <th className="border-2 border-[#2d2d2d] p-2 min-w-[90px]">Tanggal</th>
              <th className="border-2 border-[#2d2d2d] p-2 min-w-[220px]">Judul & Deskripsi Kegiatan</th>
              <th className="border-2 border-[#2d2d2d] p-2 min-w-[120px]">Status Review</th>
              <th className="border-2 border-[#2d2d2d] p-2 min-w-[160px]">Catatan Instruktur</th>
              <th className="border-2 border-[#2d2d2d] p-2 w-20">Foto</th>
              <th className="border-2 border-[#2d2d2d] p-2 min-w-[110px]">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="border-2 border-[#2d2d2d] p-6 text-center text-[#2d2d2d] dark:text-zinc-300 font-bold italic bg-white/50 dark:bg-zinc-800/50">
                  Belum ada catatan jurnal kegiatan.
                </td>
              </tr>
            ) : (
              records.map((rec, index) => {
                const isApproved = rec.status === 'disetujui';
                const isPending = rec.status === 'menunggu';
                const isRevision = rec.status === 'revisi';

                const photosList = rec.fotos && rec.fotos.length > 0 ? rec.fotos : (rec.fotoKegiatan ? [rec.fotoKegiatan] : []);

                return (
                  <tr key={rec.id} className="hover:bg-[#6BCB77]/10 transition bg-white dark:bg-zinc-800 font-bold">
                    <td className="border-2 border-[#2d2d2d] p-2 text-center font-mono text-[#2d2d2d] dark:text-zinc-200">{index + 1}</td>
                    
                    <td className="border-2 border-[#2d2d2d] p-2 text-center text-[#2d2d2d] dark:text-zinc-200">
                      <div>{formatTanggal(rec.tanggal)}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{rec.jamMulai || '08:00'} - {rec.jamSelesai || '16:00'}</div>
                    </td>

                    <td className="border-2 border-[#2d2d2d] p-2 leading-relaxed text-[#2d2d2d] dark:text-zinc-200">
                      <div className="font-black text-sm text-[#2d2d2d] dark:text-zinc-100 flex items-center gap-1.5">
                        {rec.judul || 'Jurnal Kegiatan'}
                      </div>
                      <div className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 mt-1 whitespace-pre-line">
                        {rec.kegiatan}
                      </div>
                      {rec.lokasi && rec.lokasi !== '-' && (
                        <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                          <MapPin size={11} /> {rec.lokasi}
                        </div>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="border-2 border-[#2d2d2d] p-2 text-center">
                      {isApproved && (
                        <span className="bg-emerald-500 text-white font-black px-2 py-1 rounded-md text-[10px] uppercase inline-flex items-center gap-1 border border-[#2d2d2d]">
                          <CheckCircle2 size={11} /> Disetujui
                        </span>
                      )}
                      {isPending && (
                        <span className="bg-[#FFD93D] text-[#2d2d2d] font-black px-2 py-1 rounded-md text-[10px] uppercase inline-flex items-center gap-1 border border-[#2d2d2d]">
                          <Clock size={11} /> Menunggu Review
                        </span>
                      )}
                      {isRevision && (
                        <span className="bg-rose-500 text-white font-black px-2 py-1 rounded-md text-[10px] uppercase inline-flex items-center gap-1 border border-[#2d2d2d] animate-pulse">
                          <AlertTriangle size={11} /> Perlu Revisi
                        </span>
                      )}
                    </td>

                    <td className="border-2 border-[#2d2d2d] p-2 italic text-[#2d2d2d] dark:text-zinc-300">
                      {isRevision ? (
                        <div className="p-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-200 rounded border border-rose-400 font-bold text-[11px]">
                          ⚠️ Catatan Revisi: {rec.catatanInstruktur || 'Mohon diperbaiki'}
                        </div>
                      ) : (
                        <span>{rec.catatanInstruktur || '-'}</span>
                      )}
                      {rec.reviewedBy && (
                        <div className="text-[9px] font-mono text-zinc-500 mt-1">Oleh: {rec.reviewedBy}</div>
                      )}
                    </td>

                    {/* Photo Thumbnails */}
                    <td className="border-2 border-[#2d2d2d] p-2 text-center">
                      {photosList.length > 0 ? (
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          {photosList.map((p, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => setActivePhoto(p)}
                              className="w-7 h-7 rounded border border-[#2d2d2d] overflow-hidden hover:scale-110 transition shrink-0"
                            >
                              <img src={p} alt="Dokumentasi" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[10px]">-</span>
                      )}
                    </td>

                    {/* Action Column */}
                    <td className="border-2 border-[#2d2d2d] p-1 text-center">
                      {isTeacherView ? (
                        <div className="flex flex-col gap-1 items-center">
                          <button
                            onClick={() => handleOpenReview(rec, 'disetujui')}
                            className="btn-pixel w-full px-2 py-1 bg-[#6BCB77] text-[#2d2d2d] font-black text-[10px] rounded uppercase flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 size={12} /> Setujui
                          </button>
                          <button
                            onClick={() => handleOpenReview(rec, 'revisi')}
                            className="btn-pixel w-full px-2 py-1 bg-rose-500 text-white font-black text-[10px] rounded uppercase flex items-center justify-center gap-1"
                          >
                            <AlertTriangle size={12} /> Revisi
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingRecord(rec)}
                            className="btn-pixel p-1.5 bg-[#FFD93D] text-[#2d2d2d] rounded-lg hover:bg-amber-400"
                            title="Edit / Perbaiki Jurnal"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.id)}
                            className="btn-pixel p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600"
                            title="Hapus Jurnal"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
