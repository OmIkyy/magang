import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserRole, ClassName, StudentProfile, TeacherProfile } from '../types';
import { User, Lock, Mail, CreditCard, School, LogIn, UserPlus, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { registerStudent, getStudents, getTeachers, getPasswords } from '../services/storage';
import { playSuccessSound, playPopSound } from '../utils/audio';

interface LoginModalProps {
  onLoginSuccess: (user: { role: UserRole; profile: StudentProfile | TeacherProfile }) => void;
  onOpenResetPassword: () => void;
}

const KELAS_OPTIONS: ClassName[] = ['TKJ', 'DKP'];

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess, onOpenResetPassword }) => {
  const [role, setRole] = useState<UserRole>('siswa');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  // Login Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register Form States
  const [regNamaLengkap, setRegNamaLengkap] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regNisn, setRegNisn] = useState('');
  const [regKelas, setRegKelas] = useState<ClassName>('TKJ');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setIsRegistering(false);
    setError('');
    playPopSound();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const passwords = getPasswords();
    const inputClean = username.trim().toLowerCase();

    if (role === 'siswa') {
      const students = getStudents();
      // Match by username or full name
      const student = students.find(
        (s) => s.username.toLowerCase() === inputClean || s.namaLengkap.toLowerCase() === inputClean
      );

      if (!student) {
        setError('Data siswa tidak ditemukan! Silakan periksa nama/username atau daftar terlebih dahulu.');
        return;
      }

      const storedPass = passwords[student.username.toLowerCase()] || 'rahma123';
      if (storedPass !== password) {
        setError('Kata sandi salah! Silakan coba lagi.');
        return;
      }

      playSuccessSound();
      onLoginSuccess({ role: 'siswa', profile: student });
    } else {
      // Guru Login
      const teachers = getTeachers();
      const teacher = teachers.find(
        (t) => t.username.toLowerCase() === inputClean || t.nip === username.trim() || t.namaLengkap.toLowerCase() === inputClean
      );

      if (!teacher) {
        setError('Username / NIP Guru tidak terdaftar!');
        return;
      }

      const storedPass = passwords[teacher.username.toLowerCase()] || 'gurusmk113';
      if (storedPass !== password) {
        setError('Kata sandi guru salah!');
        return;
      }

      playSuccessSound();
      onLoginSuccess({ role: 'guru', profile: teacher });
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regNamaLengkap || !regNisn || !regEmail || !regUsername || !regPassword) {
      setError('Mohon lengkapi seluruh formulir pendaftaran!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    const res = registerStudent({
      namaLengkap: regNamaLengkap,
      username: regUsername,
      nisn: regNisn,
      kelas: regKelas,
      email: regEmail,
      password: regPassword,
    });

    if (res.success && res.student) {
      playSuccessSound();
      onLoginSuccess({ role: 'siswa', profile: res.student });
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-[#FFFCF5] dark:bg-zinc-900 border-3 border-[#2d2d2d] rounded-3xl shadow-[8px_8px_0px_#2d2d2d] overflow-hidden"
      >
        {/* Header Title & Role Toggle */}
        <div className="bg-[#FFD93D] border-b-3 border-[#2d2d2d] p-6 text-[#2d2d2d] text-center relative">
          <div className="w-16 h-16 bg-white text-[#2d2d2d] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 border-2 border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d]">
            📓
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black tracking-tight uppercase">JURNAL MAGANG DIGITAL</h2>
          <p className="text-xs font-bold text-[#2d2d2d]/80 mt-1 uppercase tracking-wide">
            Sistem Presensi & Book Catatan Kegiatan PKL
          </p>

          {/* Role Tabs */}
          <div className="mt-5 inline-flex bg-white p-1.5 rounded-2xl gap-2 border-2 border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d]">
            <button
              onClick={() => handleRoleChange('siswa')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition flex items-center gap-1.5 ${
                role === 'siswa'
                  ? 'bg-[#4D96FF] text-white border-2 border-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]'
                  : 'text-[#2d2d2d] hover:bg-amber-100'
              }`}
            >
              <User size={14} /> Siswa Magang
            </button>
            <button
              onClick={() => handleRoleChange('guru')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition flex items-center gap-1.5 ${
                role === 'guru'
                  ? 'bg-[#FF6B6B] text-white border-2 border-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]'
                  : 'text-[#2d2d2d] hover:bg-amber-100'
              }`}
            >
              <ShieldCheck size={14} /> Guru Pembimbing
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-4">
          {error && (
            <div className="p-3 bg-[#FF6B6B]/15 border-2 border-[#2d2d2d] text-[#2d2d2d] dark:text-rose-200 text-xs font-bold rounded-xl flex items-center gap-2 shadow-[2px_2px_0px_#2d2d2d]">
              <AlertCircle size={16} className="shrink-0 text-[#FF6B6B]" />
              <span>{error}</span>
            </div>
          )}

          {/* SISWA LOGIN FORM */}
          {role === 'siswa' && !isRegistering && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center pb-2">
                <h3 className="font-display font-black text-xl text-[#2d2d2d] dark:text-zinc-100 uppercase">Login Siswa Magang</h3>
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Masukkan Nama Lengkap atau Username beserta kata sandi Anda</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                  Nama Lengkap / Username Siswa
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-[#2d2d2d]" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rahma Fadilla atau rahma"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 uppercase tracking-wide">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      onOpenResetPassword();
                    }}
                    className="text-[11px] font-black text-[#4D96FF] hover:underline flex items-center gap-1 uppercase"
                  >
                    <KeyRound size={12} /> Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-[#2d2d2d]" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="Masukkan Kata Sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pixel w-full py-3 bg-[#FFD93D] hover:bg-amber-300 text-[#2d2d2d] font-display font-black text-sm rounded-xl uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <LogIn size={16} /> Masuk Siswa
              </button>

              <div className="text-center pt-3 border-t-2 border-dashed border-[#2d2d2d]/20">
                <p className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  Belum punya akun siswa?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setError('');
                      playPopSound();
                    }}
                    className="font-black text-[#4D96FF] dark:text-amber-400 hover:underline flex items-center gap-1 mx-auto mt-1 uppercase"
                  >
                    <UserPlus size={14} /> Daftar Akun Siswa Baru
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* SISWA REGISTRATION FORM */}
          {role === 'siswa' && isRegistering && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="text-center pb-1">
                <h3 className="font-display font-black text-lg text-[#2d2d2d] dark:text-zinc-100 uppercase">Pendaftaran Siswa Baru</h3>
                <p className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">Isi data diri lengkap dan pilih kelas Anda</p>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                  Nama Lengkap Siswa
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rahma Fadilla"
                  value={regNamaLengkap}
                  onChange={(e) => setRegNamaLengkap(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                />
              </div>

              {/* Username & NISN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="rahma"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                    NISN
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="00949372241"
                    value={regNisn}
                    onChange={(e) => setRegNisn(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                  />
                </div>
              </div>

              {/* Pilih Kelas Button Selector */}
              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1.5 uppercase tracking-wide">
                  Pilih Kelas Keahlian
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {KELAS_OPTIONS.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        setRegKelas(cls);
                        playPopSound();
                      }}
                      className={`py-1.5 px-2 rounded-xl text-xs font-black transition border-2 border-[#2d2d2d] font-display ${
                        regKelas === cls
                          ? 'bg-[#FFD93D] text-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d]'
                          : 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-300 hover:bg-amber-100 shadow-[1px_1px_0px_#2d2d2d]'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Konfirmasi Akun */}
              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                  Alamat Email Konfirmasi Akun Siswa
                </label>
                <input
                  type="email"
                  required
                  placeholder="email.konfirmasi@siswa.smk.sch.id"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                />
                <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                  ✉️ Alamat email ini digunakan untuk konfirmasi pendaftaran akun siswa.
                </p>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                    Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 4 Karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                    Konfirmasi Sandi
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Ulangi Sandi"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pixel w-full py-3 bg-[#6BCB77] text-[#2d2d2d] font-display font-black text-xs rounded-xl uppercase tracking-wider"
              >
                Daftar & Masuk Sekarang
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError('');
                    playPopSound();
                  }}
                  className="text-xs font-black text-[#2d2d2d] dark:text-zinc-400 hover:underline uppercase"
                >
                  Sudah punya akun? Kembali ke Login
                </button>
              </div>
            </form>
          )}

          {/* GURU LOGIN FORM */}
          {role === 'guru' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center pb-2">
                <h3 className="font-display font-black text-xl text-[#2d2d2d] dark:text-zinc-100 uppercase">Login Guru Pembimbing</h3>
                <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                  Akses khusus untuk memantau presensi dan jurnal magang seluruh siswa
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                  Username Guru
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-[#2d2d2d]" size={16} />
                  <input
                    type="text"
                    required
                    placeholder="Masukkan Username Guru (Contoh: guru)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2d2d2d] dark:text-zinc-300 mb-1 uppercase tracking-wide">
                  Kata Sandi Guru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-[#2d2d2d]" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="Masukkan Kata Sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold border-2 border-[#2d2d2d] bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-xl focus:ring-2 focus:ring-[#FFD93D] focus:outline-none shadow-[2px_2px_0px_#2d2d2d]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pixel w-full py-3 bg-[#FF6B6B] text-white font-display font-black text-sm rounded-xl uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <LogIn size={16} /> Masuk Panel Guru
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
