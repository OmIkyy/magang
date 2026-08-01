import React, { useState, useEffect } from 'react';
import { UserRole, StudentProfile, TeacherProfile, AttendanceRecord, JournalRecord, NotificationItem } from './types';
import { getStudents, getTeachers, getAttendanceRecords, getJournalRecords, getNotifications, markNotificationAsRead, clearAllNotifications } from './services/storage';
import { initGlobalClickListener, toggleSound, isSoundEnabled } from './utils/audio';
import { LoginModal } from './components/LoginModal';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { SupabaseModal } from './components/SupabaseModal';
import { NotificationCenter } from './components/NotificationCenter';
import { Volume2, VolumeX, User, ShieldCheck, Lock } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<{
    role: UserRole;
    profile: StudentProfile | TeacherProfile;
  } | null>(null);

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [journalRecords, setJournalRecords] = useState<JournalRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Sound
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  // Load data & sound listener
  useEffect(() => {
    const cleanupClickSound = initGlobalClickListener();
    refreshAllData();

    return () => {
      cleanupClickSound?.();
    };
  }, []);

  const refreshAllData = () => {
    const stds = getStudents();
    const tchs = getTeachers();
    const atts = getAttendanceRecords();
    const jrns = getJournalRecords();

    setStudents(stds);
    setTeachers(tchs);
    setAttendanceRecords(atts);
    setJournalRecords(jrns);

    if (currentUser) {
      setNotifications(getNotifications(currentUser.profile.id));
      if (currentUser.role === 'siswa') {
        const updatedStd = stds.find((s) => s.id === currentUser.profile.id);
        if (updatedStd) {
          setCurrentUser({ role: 'siswa', profile: updatedStd });
        }
      }
    }
  };

  const handleLoginSuccess = (user: { role: UserRole; profile: StudentProfile | TeacherProfile }) => {
    setCurrentUser(user);
    setNotifications(getNotifications(user.profile.id));
    refreshAllData();
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleToggleSound = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handleMarkNotifRead = (id: string) => {
    markNotificationAsRead(id);
    if (currentUser) {
      setNotifications(getNotifications(currentUser.profile.id));
    }
  };

  const handleClearNotifs = () => {
    clearAllNotifications();
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-[#fdf5e6] text-[#2d2d2d] font-sans bg-grid transition-colors duration-200">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-[#FFD93D] border-b-4 border-[#2d2d2d] px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#2d2d2d] font-black flex items-center justify-center overflow-hidden shadow-[3px_3px_0px_#2d2d2d] shrink-0">
              <img
                src="/assets/logo.png"
                alt="Logo Website"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="%23FFD93D" stroke="%232d2d2d" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>';
                }}
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="font-display font-black text-base sm:text-lg text-[#2d2d2d] tracking-tight flex items-center gap-2">
                JURNAL MAGANG <span className="text-xs bg-[#2d2d2d] text-[#FFD93D] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">QUEST EDITION</span>
              </h1>
              <p className="text-[11px] font-bold text-[#2d2d2d]/80 hidden sm:block">
                Sistem Rekapitulasi Presensi & Buku Catatan Kegiatan Industri SMK
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkNotifRead}
                onClearAll={handleClearNotifs}
              />
            )}

            <button
              onClick={handleToggleSound}
              className="btn-pixel bg-white text-[#2d2d2d] p-2 rounded-xl border-2 border-[#2d2d2d]"
              title={soundOn ? 'Efek Suara Klik Aktif (Klik untuk Mute)' : 'Efek Suara Klik Mute'}
            >
              {soundOn ? <Volume2 size={18} className="text-amber-600" /> : <VolumeX size={18} className="text-rose-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 pb-12">
        {!currentUser ? (
          <LoginModal
            onLoginSuccess={handleLoginSuccess}
            onOpenResetPassword={() => setIsResetModalOpen(true)}
          />
        ) : currentUser.role === 'siswa' ? (
          <StudentDashboard
            student={currentUser.profile as StudentProfile}
            attendanceRecords={attendanceRecords}
            journalRecords={journalRecords}
            onLogout={handleLogout}
            onRefreshData={refreshAllData}
            onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          />
        ) : (
          <TeacherDashboard
            teacher={currentUser.profile as TeacherProfile}
            students={students}
            attendanceRecords={attendanceRecords}
            journalRecords={journalRecords}
            onLogout={handleLogout}
            onRefreshData={refreshAllData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-[#2d2d2d] bg-[#2d2d2d] text-white py-4 px-6 text-center text-xs font-bold uppercase tracking-widest flex items-center justify-between flex-wrap gap-3 max-w-7xl mx-auto rounded-t-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#6BCB77] animate-pulse"></span>
          <span>Status: Synced & Ready</span>
        </div>

        <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 text-[#FFD93D]">
          <User size={13} className="text-[#FFD93D] shrink-0" />
          <span className="font-black tracking-wider text-[11px] normal-case">Pembuat website By M.Rizki Ramadhani</span>
        </div>

        <div>© 2026 Jurnal Magang Pro - Quest Edition</div>
      </footer>

      {/* Modals */}
      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />
    </div>
  );
}
