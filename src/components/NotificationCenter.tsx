import React, { useState } from 'react';
import { NotificationItem } from '../types';
import { Bell, Check, Trash2, CheckCircle2, AlertTriangle, MessageSquare, X } from 'lucide-react';

interface NotificationCenterProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-pixel bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-200 p-2 rounded-xl relative flex items-center justify-center border-2 border-[#2d2d2d]"
        title="Notifikasi Sistem"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-[#2d2d2d] animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 game-card bg-[#FFFCF5] dark:bg-zinc-900 border-4 border-[#2d2d2d] rounded-2xl p-4 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#2d2d2d] pb-2">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#FFD93D]" />
              <h4 className="font-display font-black text-xs sm:text-sm text-[#2d2d2d] dark:text-zinc-100 uppercase">
                PEMBERITAHUAN JURNAL ({unreadCount} BARU)
              </h4>
            </div>

            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-[10px] font-bold text-rose-500 hover:underline flex items-center gap-1"
                  title="Hapus Semua"
                >
                  <Trash2 size={12} /> Hapus
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="btn-pixel p-1 bg-rose-500 text-white rounded-lg ml-1"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {notifications.length === 0 ? (
              <p className="text-center text-xs font-bold text-zinc-500 italic py-6">
                Belum ada notifikasi baru.
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-3 rounded-xl border-2 border-[#2d2d2d] transition cursor-pointer relative ${
                    n.read
                      ? 'bg-white/60 dark:bg-zinc-800/60 opacity-80'
                      : 'bg-[#FFD93D]/20 dark:bg-amber-900/30 border-[#FFD93D]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {n.type === 'journal_approved' && (
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    )}
                    {n.type === 'journal_revision' && (
                      <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    )}
                    {(n.type === 'note_added' || n.type === 'reminder') && (
                      <MessageSquare size={18} className="text-[#4D96FF] shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-black text-[#2d2d2d] dark:text-zinc-100">{n.title}</span>
                        <span className="text-[9px] font-mono font-bold text-zinc-500">
                          {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 font-bold mt-0.5 leading-relaxed">{n.message}</p>
                    </div>

                    {!n.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
