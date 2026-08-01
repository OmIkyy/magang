import React, { useState } from 'react';
import { AttendanceRecord, JournalRecord } from '../types';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Clock, AlertTriangle, UserCheck, X } from 'lucide-react';

interface JournalCalendarProps {
  attendanceRecords: AttendanceRecord[];
  journalRecords: JournalRecord[];
  studentName?: string;
}

export const JournalCalendar: React.FC<JournalCalendarProps> = ({
  attendanceRecords,
  journalRecords,
  studentName,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState<{
    dateStr: string;
    formattedDate: string;
    attendance?: AttendanceRecord;
    journals: JournalRecord[];
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Days in month calculation
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (dayNum: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;

    const attendance = attendanceRecords.find((a) => a.tanggal === dateStr);
    const journals = journalRecords.filter((j) => j.tanggal === dateStr);

    const formattedDate = `${dayNum} ${monthNames[month]} ${year}`;

    setSelectedDayDetails({
      dateStr,
      formattedDate,
      attendance,
      journals,
    });
  };

  // Helper to format date YYYY-MM-DD
  const getDateStr = (dayNum: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(dayNum).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
  };

  return (
    <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 rounded-2xl p-5 mb-6">
      {/* Detail Modal for Selected Day */}
      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="game-card bg-[#FFFCF5] dark:bg-zinc-900 max-w-lg w-full p-5 rounded-2xl border-4 border-[#2d2d2d] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#2d2d2d] pb-2">
              <div className="flex items-center gap-2">
                <CalendarIcon size={18} className="text-[#4D96FF]" />
                <h3 className="font-display font-black text-[#2d2d2d] dark:text-zinc-100 uppercase text-sm">
                  Aktivitas: {selectedDayDetails.formattedDate}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="btn-pixel p-1 bg-rose-500 text-white rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Presensi Status */}
              <div className="p-3 bg-white dark:bg-zinc-800 border-2 border-[#2d2d2d] rounded-xl shadow-[2px_2px_0px_#2d2d2d]">
                <h4 className="font-bold text-[#2d2d2d] dark:text-zinc-200 uppercase mb-1 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-emerald-500" />
                  Status Presensi Magang
                </h4>
                {selectedDayDetails.attendance ? (
                  <div className="grid grid-cols-2 gap-2 text-zinc-700 dark:text-zinc-300 font-bold mt-2">
                    <div>Status: <span className="uppercase text-emerald-600 font-black">{selectedDayDetails.attendance.status}</span></div>
                    <div>Jam Masuk: <span className="font-mono">{selectedDayDetails.attendance.jamMasuk}</span></div>
                    <div>Jam Pulang: <span className="font-mono">{selectedDayDetails.attendance.jamPulang}</span></div>
                    <div>Keterangan: {selectedDayDetails.attendance.keterangan || '-'}</div>
                  </div>
                ) : (
                  <p className="text-zinc-500 italic">Belum ada catatan presensi pada tanggal ini.</p>
                )}
              </div>

              {/* Jurnal Status */}
              <div className="p-3 bg-white dark:bg-zinc-800 border-2 border-[#2d2d2d] rounded-xl shadow-[2px_2px_0px_#2d2d2d]">
                <h4 className="font-bold text-[#2d2d2d] dark:text-zinc-200 uppercase mb-2 flex items-center gap-1.5">
                  <CalendarIcon size={14} className="text-[#FFD93D]" />
                  Buku Jurnal Kegiatan ({selectedDayDetails.journals.length})
                </h4>

                {selectedDayDetails.journals.length === 0 ? (
                  <p className="text-zinc-500 italic">Belum ada jurnal yang dibuat pada tanggal ini.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedDayDetails.journals.map((j) => (
                      <div key={j.id} className="p-2.5 bg-amber-50 dark:bg-zinc-700/50 rounded-lg border border-[#2d2d2d] space-y-1">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <span className="font-black text-[#2d2d2d] dark:text-zinc-100">{j.judul || 'Jurnal Kegiatan'}</span>
                          {j.status === 'disetujui' && (
                            <span className="bg-emerald-500 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase flex items-center gap-1">
                              <CheckCircle2 size={10} /> Disetujui
                            </span>
                          )}
                          {j.status === 'menunggu' && (
                            <span className="bg-[#FFD93D] text-[#2d2d2d] font-black px-2 py-0.5 rounded text-[10px] uppercase flex items-center gap-1">
                              <Clock size={10} /> Menunggu Review
                            </span>
                          )}
                          {j.status === 'revisi' && (
                            <span className="bg-rose-500 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase flex items-center gap-1">
                              <AlertTriangle size={10} /> Perlu Revisi
                            </span>
                          )}
                        </div>

                        <p className="text-zinc-700 dark:text-zinc-300 line-clamp-3 leading-relaxed">{j.kegiatan}</p>

                        {j.catatanInstruktur && j.catatanInstruktur !== '-' && (
                          <div className="mt-1 p-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-200 rounded font-bold text-[11px]">
                            💬 Catatan Guru: {j.catatanInstruktur}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDayDetails(null)}
                className="btn-pixel px-4 py-2 bg-[#2d2d2d] text-white font-bold rounded-xl"
              >
                Tutup Kalender
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Month Navigation */}
      <div className="flex items-center justify-between border-b-2 border-[#2d2d2d]/20 pb-3 mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarIcon size={18} className="text-[#FFD93D]" />
          <h3 className="font-display font-black text-[#2d2d2d] dark:text-zinc-100 uppercase text-sm sm:text-base">
            KALENDER AKTIVITAS & REVISI JURNAL
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="btn-pixel bg-white dark:bg-zinc-800 p-1.5 rounded-lg border-2 border-[#2d2d2d]"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-black text-xs sm:text-sm uppercase text-[#2d2d2d] dark:text-zinc-100 min-w-[130px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="btn-pixel bg-white dark:bg-zinc-800 p-1.5 rounded-lg border-2 border-[#2d2d2d]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Legend Indicators */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap text-[10px] sm:text-xs font-bold mb-4 bg-amber-50 dark:bg-zinc-800 p-2.5 rounded-xl border-2 border-[#2d2d2d]">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-[#2d2d2d] inline-block"></span>
          <span>🟢 Disetujui</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#FFD93D] border border-[#2d2d2d] inline-block"></span>
          <span>🟡 Menunggu Review</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-rose-500 border border-[#2d2d2d] inline-block"></span>
          <span>🔴 Perlu Revisi</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#4D96FF] border border-[#2d2d2d] inline-block"></span>
          <span>🔵 Presensi Hadir</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {/* Days Header */}
        {dayNames.map((d) => (
          <div key={d} className="font-display font-black text-[11px] uppercase text-zinc-500 dark:text-zinc-400 py-1">
            {d}
          </div>
        ))}

        {/* Empty Padding Tiles before 1st day */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-10 sm:h-12 rounded-xl bg-transparent" />
        ))}

        {/* Days of Month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateStr = getDateStr(dayNum);

          const hasAttendance = attendanceRecords.some((a) => a.tanggal === dateStr);
          const dayJournals = journalRecords.filter((j) => j.tanggal === dateStr);

          const isApproved = dayJournals.some((j) => j.status === 'disetujui');
          const isPending = dayJournals.some((j) => j.status === 'menunggu');
          const isRevision = dayJournals.some((j) => j.status === 'revisi');

          let bgClass = 'bg-white dark:bg-zinc-800 text-[#2d2d2d] dark:text-zinc-200';
          let borderClass = 'border-2 border-[#2d2d2d]';

          if (isApproved) {
            bgClass = 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-900 dark:text-emerald-200';
            borderClass = 'border-2 border-emerald-600';
          } else if (isRevision) {
            bgClass = 'bg-rose-100 dark:bg-rose-900/40 text-rose-900 dark:text-rose-200';
            borderClass = 'border-2 border-rose-600';
          } else if (isPending) {
            bgClass = 'bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200';
            borderClass = 'border-2 border-amber-500';
          }

          return (
            <button
              key={dayNum}
              onClick={() => handleDateClick(dayNum)}
              className={`h-11 sm:h-14 rounded-xl ${bgClass} ${borderClass} p-1 flex flex-col items-center justify-between hover:scale-105 transition shadow-[1px_1px_0px_#2d2d2d] relative group`}
            >
              <span className="font-mono font-black text-xs sm:text-sm">{dayNum}</span>

              <div className="flex items-center gap-1 mb-0.5">
                {hasAttendance && (
                  <span className="w-2 h-2 rounded-full bg-[#4D96FF] inline-block" title="Hadir Presensi"></span>
                )}
                {isApproved && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Jurnal Disetujui"></span>
                )}
                {isPending && !isApproved && (
                  <span className="w-2 h-2 rounded-full bg-[#FFD93D] inline-block" title="Jurnal Menunggu Review"></span>
                )}
                {isRevision && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" title="Jurnal Perlu Revisi"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
