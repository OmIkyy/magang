import React from 'react';
import { StudentProfile, AttendanceRecord, JournalRecord } from '../types';

interface PrintableBookProps {
  student: StudentProfile;
  attendanceRecords: AttendanceRecord[];
  journalRecords: JournalRecord[];
  monthName?: string;
}

export const PrintableBook: React.FC<PrintableBookProps> = ({
  student,
  attendanceRecords,
  journalRecords,
  monthName = 'Agustus 2026 - Januari 2027 (6 Bulan PKL)',
}) => {
  const formatTanggal = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Collect all photos from journals
  const allPhotos: { url: string; tanggal: string; judul: string }[] = [];
  journalRecords.forEach((j) => {
    if (j.fotos && j.fotos.length > 0) {
      j.fotos.forEach((p) => allPhotos.push({ url: p, tanggal: j.tanggal, judul: j.judul || 'Dokumentasi' }));
    } else if (j.fotoKegiatan) {
      allPhotos.push({ url: j.fotoKegiatan, tanggal: j.tanggal, judul: j.judul || 'Dokumentasi' });
    }
  });

  return (
    <div
      id="printable-book-content"
      className="bg-white text-zinc-900 p-8 max-w-4xl mx-auto font-serif space-y-8 print:p-0 print:shadow-none shadow-md border border-zinc-300 rounded-sm"
    >
      {/* Official Kop Header */}
      <div className="border-b-4 border-double border-zinc-900 pb-4 text-center">
        <h2 className="text-xl font-bold tracking-widest uppercase">
          LEMBAR REKAPITULASI JURNAL & PRESENSI MAGANG
        </h2>
        <h3 className="text-sm font-semibold tracking-wide uppercase mt-1">
          SMK NEGERI TEKNOLOGI & INDUSTRI
        </h3>
        <p className="text-xs italic text-zinc-600 mt-0.5">
          Program Pengalaman Lapangan / Praktik Kerja Lapangan (PKL) DU/DI
        </p>
      </div>

      {/* Student Biodata */}
      <div className="text-xs sm:text-sm font-serif grid grid-cols-2 gap-y-2 border border-zinc-400 p-4 rounded-sm bg-zinc-50/50">
        <div>
          <span className="font-semibold text-zinc-600">Nama Siswa : </span>
          <span className="font-bold underline text-zinc-900">{student.namaLengkap}</span>
        </div>
        <div>
          <span className="font-semibold text-zinc-600">NIS / NISN : </span>
          <span className="font-mono text-zinc-900">{student.nisn}</span>
        </div>
        <div>
          <span className="font-semibold text-zinc-600">Kelas / Jurusan : </span>
          <span className="font-bold text-zinc-900">{student.kelas}</span>
        </div>
        <div>
          <span className="font-semibold text-zinc-600">Periode PKL : </span>
          <span className="font-bold text-zinc-900">{monthName}</span>
        </div>
        <div>
          <span className="font-semibold text-zinc-600">Tempat Magang (DU/DI) : </span>
          <span className="font-bold text-zinc-900">{student.tempatMagang || '-'}</span>
        </div>
        <div>
          <span className="font-semibold text-zinc-600">Pembimbing DU/DI : </span>
          <span className="font-bold text-zinc-900">{student.pembimbingDudi || '-'}</span>
        </div>
      </div>

      {/* Section 1: Presensi Magang */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm uppercase tracking-wide border-b border-zinc-400 pb-1">
          I. REKAPITULASI PRESENSI MAGANG
        </h4>

        <table className="w-full text-left border-collapse border border-zinc-900 text-xs font-serif">
          <thead>
            <tr className="bg-zinc-100 text-zinc-900 text-center font-bold">
              <th rowSpan={2} className="border border-zinc-900 p-2 w-10">No</th>
              <th rowSpan={2} className="border border-zinc-900 p-2 min-w-[90px]">Hari / Tgl</th>
              <th colSpan={2} className="border border-zinc-900 p-1">Masuk</th>
              <th colSpan={2} className="border border-zinc-900 p-1">Pulang</th>
              <th rowSpan={2} className="border border-zinc-900 p-2 min-w-[120px]">Keterangan</th>
            </tr>
            <tr className="bg-zinc-100 text-zinc-900 text-center font-bold text-[11px]">
              <th className="border border-zinc-900 p-1 w-20">Pukul</th>
              <th className="border border-zinc-900 p-1 w-16">Paraf</th>
              <th className="border border-zinc-900 p-1 w-20">Pukul</th>
              <th className="border border-zinc-900 p-1 w-16">Paraf</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.length === 0 ? (
              <tr>
                <td colSpan={7} className="border border-zinc-900 p-4 text-center italic text-zinc-500">
                  Tidak ada data presensi.
                </td>
              </tr>
            ) : (
              attendanceRecords.map((rec, idx) => (
                <tr key={rec.id}>
                  <td className="border border-zinc-900 p-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-zinc-900 p-2">
                    <span className="font-bold">{rec.hari}</span>, {formatTanggal(rec.tanggal)}
                  </td>
                  <td className="border border-zinc-900 p-2 text-center font-mono">{rec.jamMasuk}</td>
                  <td className="border border-zinc-900 p-2 text-center font-bold italic">{rec.parafMasuk}</td>
                  <td className="border border-zinc-900 p-2 text-center font-mono">{rec.jamPulang}</td>
                  <td className="border border-zinc-900 p-2 text-center font-bold italic">{rec.parafPulang}</td>
                  <td className="border border-zinc-900 p-2 uppercase font-semibold text-[11px]">{rec.keterangan || rec.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Section 2: Jurnal Kegiatan Magang */}
      <div className="space-y-3 pt-4">
        <h4 className="font-bold text-sm uppercase tracking-wide border-b border-zinc-400 pb-1">
          II. CATATAN BUKU JURNAL KEGIATAN MAGANG
        </h4>

        <table className="w-full text-left border-collapse border border-zinc-900 text-xs font-serif">
          <thead>
            <tr className="bg-zinc-100 text-zinc-900 text-center font-bold">
              <th className="border border-zinc-900 p-2 w-10">No</th>
              <th className="border border-zinc-900 p-2 w-24">Tanggal / Waktu</th>
              <th className="border border-zinc-900 p-2">Judul & Deskripsi Kegiatan</th>
              <th className="border border-zinc-900 p-2 w-20 text-center">Status</th>
              <th className="border border-zinc-900 p-2 w-40">Catatan Instruktur</th>
              <th className="border border-zinc-900 p-2 w-16 text-center">Paraf</th>
            </tr>
          </thead>
          <tbody>
            {journalRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="border border-zinc-900 p-4 text-center italic text-zinc-500">
                  Tidak ada catatan jurnal.
                </td>
              </tr>
            ) : (
              journalRecords.map((rec, idx) => (
                <tr key={rec.id}>
                  <td className="border border-zinc-900 p-2 text-center font-mono">{idx + 1}</td>
                  <td className="border border-zinc-900 p-2 text-center font-medium">
                    <div>{formatTanggal(rec.tanggal)}</div>
                    <div className="text-[10px] font-mono text-zinc-600">{rec.jamMulai || '08:00'}-{rec.jamSelesai || '16:00'}</div>
                  </td>
                  <td className="border border-zinc-900 p-2 leading-relaxed">
                    <div className="font-bold text-zinc-900">{rec.judul || 'Jurnal Magang'}</div>
                    <div className="mt-1">{rec.kegiatan}</div>
                    {rec.lokasi && rec.lokasi !== '-' && (
                      <div className="text-[10px] text-zinc-600 italic mt-0.5">Lokasi: {rec.lokasi}</div>
                    )}
                  </td>
                  <td className="border border-zinc-900 p-2 text-center uppercase font-bold text-[10px]">
                    {rec.status === 'disetujui' && <span className="text-emerald-700">Disetujui</span>}
                    {rec.status === 'menunggu' && <span className="text-amber-700">Menunggu</span>}
                    {rec.status === 'revisi' && <span className="text-rose-700">Revisi</span>}
                  </td>
                  <td className="border border-zinc-900 p-2 italic">{rec.catatanInstruktur || '-'}</td>
                  <td className="border border-zinc-900 p-2 text-center font-bold italic">{rec.parafInstruktur || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Section 3: Photo Documentation Grid */}
      {allPhotos.length > 0 && (
        <div className="space-y-3 pt-4 break-before-page">
          <h4 className="font-bold text-sm uppercase tracking-wide border-b border-zinc-400 pb-1">
            III. DOKUMENTASI FOTO KEGIATAN
          </h4>

          <div className="grid grid-cols-2 gap-4">
            {allPhotos.map((item, idx) => (
              <div key={idx} className="border border-zinc-400 p-2 rounded text-center">
                <img
                  src={item.url}
                  alt="Foto Kegiatan"
                  referrerPolicy="no-referrer"
                  className="w-full h-40 object-cover rounded mb-2 border border-zinc-300"
                />
                <p className="text-[11px] font-sans text-zinc-700">
                  <span className="font-bold">Lampiran #{idx + 1}: {item.judul}</span> ({formatTanggal(item.tanggal)})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Signatures */}
      <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs font-serif break-inside-avoid">
        <div>
          <p className="mb-12">
            Pembimbing Industri / Instruktur,
          </p>
          <p className="font-bold underline">{student.pembimbingDudi || '(...................................................)'}</p>
          <p className="text-[10px] text-zinc-500 mt-1">Pembimbing DU/DI</p>
        </div>

        <div>
          <p className="mb-12">
            Guru Pembimbing Magang,
          </p>
          <p className="font-bold underline">Hendra Wijaya, S.Kom</p>
          <p className="text-[10px] text-zinc-500 mt-1">NIP. 19850112 201001 1 002</p>
        </div>

        <div>
          <p className="mb-1">Tangerang, {todayStr}</p>
          <p className="mb-12">Siswa Magang,</p>
          <p className="font-bold underline">{student.namaLengkap}</p>
          <p className="text-[10px] text-zinc-500 mt-1">NISN. {student.nisn}</p>
        </div>
      </div>
    </div>
  );
};
