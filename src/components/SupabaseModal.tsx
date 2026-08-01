import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Database, CheckCircle2, ShieldCheck, X, RefreshCw } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../services/storage';
import { playSuccessSound } from '../utils/audio';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState(getSupabaseConfig());
  const [url, setUrl] = useState(config.url || '');
  const [key, setKey] = useState(config.anonKey || '');
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newCfg = {
      url,
      anonKey: key,
      isConnected: Boolean(url && key),
    };
    saveSupabaseConfig(newCfg);
    setConfig(newCfg);
    setStatusMsg(newCfg.isConnected ? 'Terhubung ke Supabase Cloud Database!' : 'Menggunakan Storage Lokal Berkecepatan Tinggi.');
    playSuccessSound();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="game-card bg-[#FFFCF5] dark:bg-zinc-900 rounded-2xl max-w-md w-full overflow-hidden"
      >
        <div className="bg-[#6BCB77] p-4 text-[#2d2d2d] font-display font-black flex items-center justify-between border-b-3 border-[#2d2d2d] uppercase">
          <div className="flex items-center gap-2 text-base">
            <Database size={20} />
            <span>INTEGRASI SUPABASE DATABASE</span>
          </div>
          <button onClick={onClose} className="btn-pixel p-1 bg-white rounded-lg text-[#2d2d2d]">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-[#6BCB77]/20 border-2 border-[#2d2d2d] rounded-xl text-xs text-[#2d2d2d] flex items-start gap-2 shadow-[2px_2px_0px_#2d2d2d]">
            <ShieldCheck size={18} className="shrink-0 text-[#2d2d2d]" />
            <div>
              <p className="font-black uppercase">Status Sistem Persistence:</p>
              <p className="font-bold mt-0.5">
                {config.isConnected
                  ? '⚡ Supabase Cloud Database terhubung aktif.'
                  : '⚡ Database Lokal Berkecepatan Tinggi Aktif (Tanpa Setup Tambahan).'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                Supabase URL (Opsional)
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                Supabase Anon Key (Opsional)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
              />
            </div>

            {statusMsg && (
              <p className="text-xs text-[#2d2d2d] font-black text-center">{statusMsg}</p>
            )}

            <button
              type="submit"
              className="btn-pixel w-full py-2.5 bg-[#6BCB77] text-[#2d2d2d] font-display font-black text-xs rounded-xl uppercase flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={14} /> Simpan Pengaturan Database
            </button>
          </form>

          <p className="text-[11px] font-bold text-zinc-500 text-center">
            Catatan: Aplikasi secara otomatis menyimpan seluruh data siswa, absensi, dan jurnal dengan aman di browser.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
