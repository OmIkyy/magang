import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Flame, Volume2, VolumeX, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { playSuccessSound, isSoundEnabled, toggleSound } from '../utils/audio';

interface GameCompanionProps {
  studentName?: string;
  exp: number;
  level: number;
  streak: number;
  badges?: string[];
  role?: 'siswa' | 'guru';
}

const DIALOGUES = [
  'Semangat magangnya hari ini! Jangan lupa isi presensi dan jurnal ya! 🚀',
  'Ingat upload foto kegiatan magang untuk bonus +20 EXP! 📸',
  'Jurnal yang rapi membuat laporan akhir magang jauh lebih mudah! ✨',
  'Keren banget! Streak absensimu terus bertambah! 🔥',
  'Hari ini kamu belajar hal baru apa di tempat magang? 💡',
  'Koleksi badge prestasi magangmu untuk dipamerkan ke guru pembimbing! 🏆',
];

export const GameCompanion: React.FC<GameCompanionProps> = ({
  studentName = 'Teman Magang',
  exp,
  level,
  streak,
  badges = [],
  role = 'siswa',
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [dialogueIdx, setDialogueIdx] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [isCheering, setIsCheering] = useState(false);

  const expNextLevel = level * 100;
  const currentExpInLevel = exp % 100;
  const expPercentage = Math.min(100, Math.round((currentExpInLevel / 100) * 100));

  useEffect(() => {
    const interval = setInterval(() => {
      setDialogueIdx((prev) => (prev + 1) % DIALOGUES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleSoundToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = toggleSound();
    setSoundOn(nextState);
  };

  const handleInteract = () => {
    setIsCheering(true);
    playSuccessSound();
    setDialogueIdx((prev) => (prev + 1) % DIALOGUES.length);
    setTimeout(() => setIsCheering(false), 1200);
  };

  return (
    <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 rounded-2xl p-5 mb-6 relative overflow-hidden">
      {/* Background Decorative Game Pattern */}
      <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#FFD93D]/20 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        
        {/* Mascot Avatar & Speech */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <motion.div
            className="relative cursor-pointer select-none shrink-0"
            onClick={handleInteract}
            animate={
              isCheering
                ? { y: [-6, 0, -6, 0], rotate: [0, 10, -10, 0], scale: 1.1 }
                : { y: [0, -4, 0] }
            }
            transition={{
              duration: isCheering ? 0.6 : 3,
              repeat: isCheering ? 1 : Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Mascot Character Frame matching design HTML character box */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#6BCB77] border-3 border-[#2d2d2d] rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_#2d2d2d] relative overflow-hidden character-pulse">
              <div className="absolute bottom-0 w-full h-1/2 bg-[#4D96FF] opacity-30"></div>
              <div className="text-3xl sm:text-4xl relative z-10">🧑‍💻</div>
            </div>

            {/* Level Badge Pill */}
            <div className="absolute -bottom-2 -right-1 bg-[#FFD93D] text-[#2d2d2d] font-black text-xs px-2 py-0.5 rounded-md border-2 border-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] font-display">
              LVL {level}
            </div>
          </motion.div>

          {/* Speech Bubble */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display font-black text-[#2d2d2d] dark:text-amber-300 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                Moni <span className="text-[10px] bg-[#2d2d2d] text-white font-sans px-2 py-0.5 rounded">HERO COMPANION</span>
              </span>
              
              <button
                onClick={handleSoundToggle}
                className="btn-pixel bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-200 p-1 rounded-md"
                title={soundOn ? 'Efek Suara Aktif (Klik untuk Mute)' : 'Efek Suara Mute (Klik untuk Aktifkan)'}
              >
                {soundOn ? <Volume2 size={14} className="text-[#2d2d2d] dark:text-amber-400" /> : <VolumeX size={14} className="text-rose-500" />}
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={dialogueIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-white dark:bg-zinc-800 border-2 border-[#2d2d2d] text-[#2d2d2d] dark:text-zinc-100 text-xs sm:text-sm p-3 rounded-xl shadow-[3px_3px_0px_#2d2d2d] relative"
              >
                <p className="font-semibold leading-snug">{DIALOGUES[dialogueIdx]}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Game Stats (EXP, Level, Streak) for Students */}
        {role === 'siswa' && (
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t-2 sm:border-t-0 border-[#2d2d2d]/20 pt-3 sm:pt-0">
            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 bg-[#FF6B6B] text-white border-2 border-[#2d2d2d] px-3 py-1.5 rounded-xl text-xs font-black shadow-[3px_3px_0px_#2d2d2d] font-display">
              <Flame size={16} className="fill-white text-white animate-pulse" />
              <span>{streak} HARI STREAK</span>
            </div>

            {/* EXP Bar */}
            <div className="flex flex-col gap-1 w-36 sm:w-44">
              <div className="flex justify-between items-center text-xs font-black text-[#2d2d2d] dark:text-zinc-200 font-display uppercase">
                <span className="flex items-center gap-1 text-[11px]">
                  <Sparkles size={12} className="text-[#FFD93D]" /> EXP PROGRESS
                </span>
                <span className="text-[11px] font-mono">{currentExpInLevel}/100</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-zinc-800 h-4 rounded-full overflow-hidden border-2 border-[#2d2d2d] shadow-inner">
                <motion.div
                  className="bg-[#4D96FF] h-full border-r-2 border-[#2d2d2d]"
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Badges Earned Strip */}
      {badges.length > 0 && role === 'siswa' && (
        <div className="mt-4 pt-3 border-t-2 border-dashed border-[#2d2d2d]/30 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black text-[#2d2d2d] dark:text-zinc-300 font-display flex items-center gap-1 uppercase">
            <Trophy size={14} className="text-[#FFD93D]" /> QUEST ACHIEVEMENTS:
          </span>
          {badges.map((badge, idx) => (
            <span
              key={idx}
              className="bg-[#FFD93D] text-[#2d2d2d] border-2 border-[#2d2d2d] text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-[2px_2px_0px_#2d2d2d] font-display uppercase tracking-wide"
            >
              ✨ {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
