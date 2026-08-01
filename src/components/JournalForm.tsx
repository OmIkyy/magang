import React, { useState } from 'react';
import { JournalRecord, StudentProfile } from '../types';
import { Calendar, Upload, Image as ImageIcon, Send, Sparkles, X, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { addJournalRecord, compressImage } from '../services/storage';
import { playSuccessSound, playLevelUpSound } from '../utils/audio';
import confetti from 'canvas-confetti';

interface JournalFormProps {
  student: StudentProfile;
  onSuccess: (expGained: number, isLevelUp: boolean) => void;
}

export const JournalForm: React.FC<JournalFormProps> = ({ student, onSuccess }) => {
  const today = new Date().toISOString().split('T')[0];
  const [tanggal, setTanggal] = useState(today);
  const [judul, setJudul] = useState('');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('16:00');
  const [lokasi, setLokasi] = useState(student.tempatMagang || 'Kantor / Bengkel / DU/DI');
  const [kegiatan, setKegiatan] = useState('');
  const [fotos, setFotos] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleMultipleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (fotos.length + files.length > 4) {
      alert('Maksimal 4 foto dokumentasi per jurnal!');
      return;
    }

    setIsCompressing(true);
    const newPhotos: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} melebihi 10MB`);
        continue;
      }

      const reader = new FileReader();
      const base64: string = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const compressed = await compressImage(base64, 800, 0.7);
      newPhotos.push(compressed);
    }

    setFotos((prev) => [...prev, ...newPhotos]);
    setIsCompressing(false);
  };

  const handleRemovePhoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kegiatan.trim()) return;

    const mainPhoto = fotos.length > 0 ? fotos[0] : undefined;

    const { expGained, isLevelUp } = addJournalRecord({
      studentId: student.id,
      tanggal,
      judul: judul.trim() || 'Jurnal Harian Magang',
      jamMulai,
      jamSelesai,
      lokasi: lokasi.trim() || student.tempatMagang || '-',
      kegiatan,
      catatanInstruktur: '-',
      parafInstruktur: '-',
      fotoKegiatan: mainPhoto,
      fotos: fotos,
      status: 'menunggu',
    });

    if (isLevelUp) {
      playLevelUpSound();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } else {
      playSuccessSound();
    }

    setJudul('');
    setKegiatan('');
    setFotos([]);
    onSuccess(expGained, isLevelUp);
  };

  return (
    <form onSubmit={handleSubmit} className="game-card bg-[#FFFCF5] dark:bg-zinc-900 rounded-2xl p-5 mb-6 space-y-4">
      <div className="flex items-center justify-between border-b-2 border-[#2d2d2d]/20 pb-3 flex-wrap gap-2">
        <div>
          <h3 className="font-display font-black text-[#2d2d2d] dark:text-emerald-100 flex items-center gap-2 text-base uppercase">
            <Sparkles size={18} className="text-[#6BCB77]" />
            BUAT JURNAL KEGIATAN MAGANG
          </h3>
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            💡 Setelah dikirim, jurnal akan masuk status 🟡 Menunggu Review Guru/Pembimbing.
          </p>
        </div>
        <span className="text-xs font-black bg-[#6BCB77] text-[#2d2d2d] border-2 border-[#2d2d2d] px-2.5 py-1 rounded-md font-display uppercase shadow-[2px_2px_0px_#2d2d2d]">
          BONUS +30 ~ +50 EXP
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Judul Kegiatan */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
            Judul Kegiatan / Topik Pekerjaan
          </label>
          <input
            type="text"
            required
            placeholder="Contoh: Perbaikan Jaringan LAN / Desain Banner Promosi"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
          />
        </div>

        {/* Tanggal Kegiatan */}
        <div>
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
            Tanggal Kegiatan
          </label>
          <input
            type="date"
            required
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
          />
        </div>

        {/* Lokasi / Tempat Magang */}
        <div>
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide flex items-center gap-1">
            <MapPin size={12} className="text-rose-500" /> Lokasi Magang
          </label>
          <input
            type="text"
            required
            placeholder="Nama Perusahaan / Ruang Working"
            value={lokasi}
            onChange={(e) => setLokasi(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
          />
        </div>

        {/* Jam Mulai */}
        <div>
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide flex items-center gap-1">
            <Clock size={12} className="text-[#4D96FF]" /> Jam Mulai
          </label>
          <input
            type="time"
            required
            value={jamMulai}
            onChange={(e) => setJamMulai(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
          />
        </div>

        {/* Jam Selesai */}
        <div>
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide flex items-center gap-1">
            <Clock size={12} className="text-rose-500" /> Jam Selesai
          </label>
          <input
            type="time"
            required
            value={jamSelesai}
            onChange={(e) => setJamSelesai(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
          />
        </div>

        {/* Multi-Photo Upload Area */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 flex items-center justify-between uppercase tracking-wide">
            <span>Dokumentasi Foto (Maks 4 Foto)</span>
            <span className="text-[#6BCB77] font-black text-[11px]">+20 EXP Tambahan</span>
          </label>

          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer border-2 border-dashed border-[#2d2d2d] hover:bg-amber-100 bg-white dark:bg-zinc-800 px-3 py-2 rounded-xl text-center flex items-center justify-center gap-2 text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 transition shadow-[2px_2px_0px_#2d2d2d]">
              <Upload size={15} className="text-[#6BCB77]" />
              <span>{isCompressing ? 'Memproses Foto...' : '+ Tambah Foto'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isCompressing || fotos.length >= 4}
                onChange={handleMultipleImageUpload}
                className="hidden"
              />
            </label>

            {/* Thumbnails */}
            {fotos.map((imgUrl, idx) => (
              <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#2d2d2d] shrink-0 shadow-[2px_2px_0px_#2d2d2d]">
                <img src={imgUrl} alt={`Foto ${idx + 1}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-0 right-0 bg-[#FF6B6B] text-white p-0.5 rounded-bl border-l border-b border-[#2d2d2d]"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rincian Kegiatan */}
      <div>
        <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
          Uraian / Deskripsi Kegiatan Magang
        </label>
        <textarea
          required
          rows={3}
          placeholder="Jelaskan secara rinci tahapan kegiatan, alat/bahan yang digunakan, dan hasil pengerjaan..."
          value={kegiatan}
          onChange={(e) => setKegiatan(e.target.value)}
          className="w-full p-3 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
        />
      </div>

      <button
        type="submit"
        disabled={isCompressing}
        className="btn-pixel w-full sm:w-auto px-6 py-2.5 bg-[#6BCB77] text-[#2d2d2d] font-display font-black text-xs rounded-xl uppercase flex items-center justify-center gap-2"
      >
        <Send size={15} /> Kirim Jurnal Magang (Menunggu Review)
      </button>
    </form>
  );
};
