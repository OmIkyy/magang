import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, KeyRound, CheckCircle2, AlertCircle, X, Send } from 'lucide-react';
import { resetPasswordByEmail } from '../services/storage';
import { playSuccessSound } from '../utils/audio';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSendResetEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Masukkan alamat email yang terdaftar!');
      return;
    }

    // Generate random 6-digit confirmation code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setStep('verify');
    playSuccessSound();
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (enteredCode !== verificationCode) {
      setError('Kode verifikasi email tidak sesuai!');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setError('Kata sandi baru minimal 4 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    const res = resetPasswordByEmail(email, newPassword);
    if (res.success) {
      setStep('success');
      playSuccessSound();
    } else {
      setError(res.message);
    }
  };

  const handleResetState = () => {
    setStep('request');
    setEmail('');
    setVerificationCode('');
    setEnteredCode('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="game-card bg-[#FFFCF5] dark:bg-zinc-900 rounded-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#FFD93D] p-4 text-[#2d2d2d] font-display font-black flex items-center justify-between border-b-3 border-[#2d2d2d] uppercase">
          <div className="flex items-center gap-2 text-base">
            <KeyRound size={20} />
            <span>RESET KATA SANDI SISWA</span>
          </div>
          <button
            onClick={handleResetState}
            className="btn-pixel p-1 bg-white rounded-lg text-[#2d2d2d]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-[#FF6B6B]/20 border-2 border-[#2d2d2d] text-[#2d2d2d] font-bold text-xs rounded-xl flex items-center gap-2 shadow-[2px_2px_0px_#2d2d2d]">
              <AlertCircle size={16} className="shrink-0 text-[#FF6B6B]" />
              <span>{error}</span>
            </div>
          )}

          {step === 'request' && (
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <p className="text-xs font-bold text-[#2d2d2d] dark:text-zinc-300">
                Masukkan email siswa yang terdaftar saat pendaftaran. Kami akan mengkonfirmasi kode reset ke email Anda.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                  Email Siswa
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-[#2d2d2d]" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="nama@siswa.smk.sch.id"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-sm font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pixel w-full py-2.5 bg-[#FFD93D] text-[#2d2d2d] font-display font-black text-xs rounded-xl uppercase flex items-center justify-center gap-2"
              >
                <Send size={16} /> Kirim Konfirmasi Reset
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleConfirmReset} className="space-y-4">
              <div className="p-3 bg-[#FFD93D]/30 border-2 border-[#2d2d2d] rounded-xl text-xs text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]">
                <p className="font-black uppercase mb-1">📬 Simulasi Email Konfirmasi Terkirim!</p>
                <p className="font-bold">
                  Kode verifikasi reset dikirim ke <span className="underline">{email}</span>:
                </p>
                <div className="mt-2 text-center text-xl font-black font-mono tracking-widest bg-white border-2 border-[#2d2d2d] text-[#2d2d2d] py-1 rounded-lg shadow-[2px_2px_0px_#2d2d2d]">
                  {verificationCode}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                  Masukkan Kode Verifikasi Email
                </label>
                <input
                  type="text"
                  required
                  placeholder="6 Digit Kode Verifikasi"
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl font-mono text-center tracking-widest focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimal 4 Karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi Kata Sandi Baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                />
              </div>

              <button
                type="submit"
                className="btn-pixel w-full py-2.5 bg-[#6BCB77] text-[#2d2d2d] font-display font-black text-xs rounded-xl uppercase"
              >
                Simpan Kata Sandi Baru
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 size={48} className="mx-auto text-[#6BCB77]" />
              <h3 className="font-display font-black text-xl text-[#2d2d2d] dark:text-zinc-100 uppercase">
                Kata Sandi Berhasil Diperbarui!
              </h3>
              <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                Silakan login kembali dengan kata sandi baru Anda.
              </p>
              <button
                onClick={handleResetState}
                className="btn-pixel w-full py-2.5 bg-[#FFD93D] text-[#2d2d2d] font-display font-black text-xs rounded-xl uppercase"
              >
                Kembali ke Login Siswa
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
