'use client';

import React, { useState } from 'react';
import { Flame, ChevronLeft, ChevronRight, Zap, Target, Award, Info, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { DayRecord } from '@/lib/types';
import confetti from 'canvas-confetti';

interface FireCalendarProps {
  records: Record<string, DayRecord>;
  onSelectDate: (dateKey: string) => void;
  onQuickAddQuestions?: (dateKey: string, count: number) => void;
}

export default function FireCalendar({
  records,
  onSelectDate,
  onQuickAddQuestions
}: FireCalendarProps) {
  // Calendar current view state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dateKey: string;
    record: DayRecord | null;
    total: number;
    phy: number;
    che: number;
    mat: number;
  } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper to format date key YYYY-MM-DD
  const formatDateKey = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Calculate days in month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 for Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Helper to get total questions for a date
  const getDayTotal = (dateKey: string) => {
    const rec = records[dateKey];
    if (!rec) return { total: 0, phy: 0, che: 0, mat: 0 };
    const p = (rec.phy?.l1 || 0) + (rec.phy?.l2 || 0) + (rec.phy?.l3 || 0);
    const c = (rec.che?.l1 || 0) + (rec.che?.l2 || 0) + (rec.che?.l3 || 0);
    const m = (rec.mat?.l1 || 0) + (rec.mat?.l2 || 0) + (rec.mat?.l3 || 0);
    return { total: p + c + m, phy: p, che: c, mat: m };
  };

  // Month Statistics
  let fireDaysCount = 0;
  let totalMonthQuestions = 0;
  let maxMonthFireStreak = 0;
  let currentStreakRun = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const k = formatDateKey(year, month, day);
    const { total } = getDayTotal(k);
    totalMonthQuestions += total;
    if (total >= 100) {
      fireDaysCount++;
      currentStreakRun++;
      if (currentStreakRun > maxMonthFireStreak) {
        maxMonthFireStreak = currentStreakRun;
      }
    } else {
      currentStreakRun = 0;
    }
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  const todayKey = new Date().toISOString().slice(0, 10);

  const handleDayClick = (dateKey: string) => {
    const { total, phy, che, mat } = getDayTotal(dateKey);
    const rec = records[dateKey] || null;
    setSelectedDayDetail({ dateKey, record: rec, total, phy, che, mat });

    if (total >= 100) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Monthly Flame Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121624] via-[#161a29] to-[#1c1214] border border-orange-500/20 p-6 lg:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-bold mb-3">
              <span className="animate-flame">🔥</span>
              <span>100-QUESTION DAILY MILESTONE ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Centurion Fire Calendar</span>
              <span className="text-3xl sm:text-4xl animate-flame">🔥</span>
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
              Every day you complete <b className="text-orange-400 font-bold">100 or more questions</b>, an immortal flame is parked over that date. Build an uninterrupted wall of fire toward JEE Advanced.
            </p>
          </div>

          {/* Month Navigator Controls */}
          <div className="flex items-center gap-2 self-start lg:self-center bg-[#0d1017] p-1.5 rounded-xl border border-[#262f46] shadow-inner">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2133] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-1.5 text-center min-w-[170px]">
              <div className="text-sm font-bold text-white font-mono-code">
                {monthNames[month]} {year}
              </div>
              <div className="text-[10.5px] text-orange-400 font-semibold">
                {fireDaysCount} Days on Fire
              </div>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2133] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors ml-1"
            >
              Today
            </button>
          </div>
        </div>

        {/* 4 Key Milestone KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-[#232b40]">
          <div className="bg-[#0e121c]/80 rounded-xl p-4 border border-[#1f273b] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Days on Fire</span>
              <span className="text-orange-400 text-sm">🔥</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-code text-orange-400 mt-2">
              {fireDaysCount} <span className="text-xs font-sans text-slate-400 font-normal">/ {daysInMonth}d</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {Math.round((fireDaysCount / daysInMonth) * 100)}% Monthly Blaze Rate
            </div>
          </div>

          <div className="bg-[#0e121c]/80 rounded-xl p-4 border border-[#1f273b] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Best Fire Streak</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-code text-amber-400 mt-2">
              {maxMonthFireStreak} <span className="text-xs font-sans text-slate-400 font-normal">Days</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Consecutive 100+ Qs</div>
          </div>

          <div className="bg-[#0e121c]/80 rounded-xl p-4 border border-[#1f273b] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Month Solved</span>
              <Target className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-code text-sky-400 mt-2">
              {totalMonthQuestions.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Avg {Math.round(totalMonthQuestions / daysInMonth)} Qs/Day
            </div>
          </div>

          <div className="bg-[#0e121c]/80 rounded-xl p-4 border border-[#1f273b] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Centurion Tier</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-code text-emerald-400 mt-2">
              {fireDaysCount >= 20 ? 'GRANDMASTER 🔥' : fireDaysCount >= 10 ? 'CENTURION 🔥' : fireDaysCount >= 1 ? 'BLAZE ACTIVE 🔥' : 'READY TO IGNITE'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Target: 20+ Fire Days</div>
          </div>
        </div>
      </div>

      {/* Main Calendar Matrix */}
      <div className="bg-[#0d1017] rounded-2xl border border-[#1f2638] p-4 sm:p-6 shadow-xl">
        {/* Day Name Headers */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 mb-3 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
            <div
              key={d}
              className={`text-xs font-bold uppercase tracking-wider py-2 rounded-lg ${
                i === 0 || i === 6 ? 'text-amber-400/80 bg-[#141724]' : 'text-slate-400 bg-[#10131e]'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {/* Previous Month Overflow */}
          {Array.from({ length: firstDayIndex }).map((_, i) => {
            const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
            return (
              <div
                key={`prev-${i}`}
                className="min-h-[90px] sm:min-h-[120px] rounded-xl bg-[#090b10]/40 border border-[#171c2a]/40 p-2 text-slate-600 opacity-40 select-none"
              >
                <span className="text-xs font-mono-code">{dayNum}</span>
              </div>
            );
          })}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = formatDateKey(year, month, day);
            const { total, phy, che, mat } = getDayTotal(dateKey);
            const isToday = dateKey === todayKey;
            const hasFire = total >= 100;
            const isInferno = total >= 150;
            const isSupernova = total >= 200;

            return (
              <div
                key={dateKey}
                onClick={() => handleDayClick(dateKey)}
                className={`group relative min-h-[95px] sm:min-h-[125px] rounded-xl p-2.5 sm:p-3 cursor-pointer transition-all flex flex-col justify-between overflow-hidden ${
                  hasFire
                    ? isSupernova
                      ? 'bg-gradient-to-br from-purple-950/60 via-red-950/60 to-amber-950/60 border-2 border-amber-400/80 shadow-lg shadow-orange-500/30 hover:scale-[1.02]'
                      : isInferno
                      ? 'bg-gradient-to-br from-red-950/70 via-orange-950/60 to-[#171a29] border-2 border-orange-500/80 shadow-md shadow-orange-500/20 hover:scale-[1.02]'
                      : 'bg-gradient-to-br from-orange-950/50 via-[#161a29] to-[#111420] border-2 border-orange-500/60 shadow-md shadow-orange-500/15 hover:scale-[1.02]'
                    : isToday
                    ? 'bg-[#141a2c] border-2 border-indigo-500/70 shadow-md shadow-indigo-500/10'
                    : total > 0
                    ? 'bg-[#10131e] border border-[#232b3f] hover:border-[#384566] hover:bg-[#141826]'
                    : 'bg-[#0d1017] border border-[#192030] hover:border-[#26314a] hover:bg-[#111522]'
                }`}
              >
                {/* Radiant Fire Glow Effect for 100+ Q Days */}
                {hasFire && (
                  <div className="absolute inset-0 bg-radial from-orange-500/10 to-transparent pointer-events-none" />
                )}

                {/* Top Row: Date Number and Status Badge */}
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono-code ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold shadow-sm'
                          : hasFire
                          ? 'text-orange-300 font-extrabold'
                          : 'text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 uppercase hidden sm:inline">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Flame Badge or Progress */}
                  {hasFire ? (
                    <div className="flex items-center gap-1">
                      <span className={`text-base sm:text-lg animate-flame ${isSupernova ? 'animate-flame-fast' : ''}`}>
                        🔥
                      </span>
                      {isSupernova ? (
                        <span className="text-[10px] font-extrabold text-amber-300 font-mono-code hidden sm:inline">200+</span>
                      ) : isInferno ? (
                        <span className="text-[10px] font-extrabold text-orange-400 font-mono-code hidden sm:inline">150+</span>
                      ) : null}
                    </div>
                  ) : total > 0 ? (
                    <span className="text-[10px] font-mono-code font-semibold text-slate-400">
                      {total}/100
                    </span>
                  ) : null}
                </div>

                {/* Center / Body: Big Parked Fire Emblem on 100+ Days */}
                <div className="relative z-10 my-1 sm:my-1.5 flex flex-col items-center justify-center">
                  {hasFire ? (
                    <div className="text-center w-full">
                      {/* Parked Fire Visual Representation */}
                      <div className="relative inline-flex items-center justify-center mb-1">
                        <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-md animate-pulse" />
                        <span className="relative text-2xl sm:text-3xl select-none filter drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">
                          🔥
                        </span>
                      </div>
                      <div className="font-mono-code font-black text-sm sm:text-base text-white tracking-tight">
                        {total} <span className="text-[10px] text-orange-300 font-sans font-semibold">Qs</span>
                      </div>
                    </div>
                  ) : total > 0 ? (
                    <div className="w-full text-center">
                      <div className="font-mono-code font-bold text-xs sm:text-sm text-slate-200">
                        {total} <span className="text-[10px] text-slate-400">Qs</span>
                      </div>
                      {/* Mini Progress Bar to 100 Qs */}
                      <div className="w-full bg-[#161c2b] h-1.5 rounded-full mt-1.5 overflow-hidden border border-[#232a3d]">
                        <div
                          className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, (total / 100) * 100)}%` }}
                        />
                      </div>
                      <span className="text-[9.5px] text-slate-400 mt-1 block">
                        {100 - total} to 🔥
                      </span>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-slate-600 text-xs sm:text-sm group-hover:text-slate-400 transition-colors">
                      —
                    </div>
                  )}
                </div>

                {/* Bottom Row: Subject Mini Breakdown */}
                {total > 0 && (
                  <div className="relative z-10 flex items-center justify-between text-[9px] font-mono-code font-semibold pt-1 border-t border-white/5">
                    <span className="text-sky-400" title={`Physics: ${phy} Qs`}>P:{phy}</span>
                    <span className="text-emerald-400" title={`Chemistry: ${che} Qs`}>C:{che}</span>
                    <span className="text-amber-400" title={`Maths: ${mat} Qs`}>M:{mat}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Instructions Bar */}
      <div className="bg-[#0e121c] border border-[#1f2638] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span className="text-slate-300 font-medium"><b className="text-orange-400">Centurion (100+ Qs):</b> Parked Fire Record</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-r from-orange-500 to-red-600 shadow-sm" />
            <span className="text-slate-300 font-medium">Inferno (150+ Qs)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-r from-purple-600 to-amber-400 shadow-sm" />
            <span className="text-slate-300 font-medium">Supernova (200+ Qs)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded bg-[#161c2b] border border-[#2b354d]" />
            <span className="text-slate-400 font-medium">Under 100 Qs</span>
          </div>
        </div>

        <div className="text-slate-400 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-500" />
          <span>Click any date to inspect breakdown or log practice.</span>
        </div>
      </div>

      {/* Selected Day Inspection Modal / Popover */}
      {selectedDayDetail && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121624] border border-[#2b3650] rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono-code font-bold text-lg text-white">
                    {selectedDayDetail.dateKey}
                  </span>
                  {selectedDayDetail.total >= 100 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                      <span className="animate-flame">🔥</span> CENTURION ACHIEVED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Daily Performance & Question Volume Audit
                </p>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="w-8 h-8 rounded-lg bg-[#1a2133] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Total Questions Solved Banner */}
            <div className="my-5 p-4 rounded-xl bg-[#0b0e14] border border-[#212a3d] flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Total Volume</span>
                <div className="text-3xl font-extrabold font-mono-code text-white mt-1">
                  {selectedDayDetail.total} <span className="text-sm font-sans font-normal text-slate-400">Questions</span>
                </div>
              </div>
              <div className="text-right">
                {selectedDayDetail.total >= 100 ? (
                  <div className="text-2xl animate-flame">🔥</div>
                ) : (
                  <div className="text-xs font-semibold text-amber-400">
                    {100 - selectedDayDetail.total} more needed for Flame
                  </div>
                )}
              </div>
            </div>

            {/* Subject Distribution Grid */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="p-3 rounded-lg bg-[#0e1320] border border-sky-500/20 text-center">
                <span className="text-xs font-bold text-sky-400 block">Physics</span>
                <span className="font-mono-code font-extrabold text-xl text-white mt-1 block">
                  {selectedDayDetail.phy}
                </span>
                <span className="text-[10px] text-slate-400">Qs</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e1320] border border-emerald-500/20 text-center">
                <span className="text-xs font-bold text-emerald-400 block">Chemistry</span>
                <span className="font-mono-code font-extrabold text-xl text-white mt-1 block">
                  {selectedDayDetail.che}
                </span>
                <span className="text-[10px] text-slate-400">Qs</span>
              </div>
              <div className="p-3 rounded-lg bg-[#0e1320] border border-amber-500/20 text-center">
                <span className="text-xs font-bold text-amber-400 block">Mathematics</span>
                <span className="font-mono-code font-extrabold text-xl text-white mt-1 block">
                  {selectedDayDetail.mat}
                </span>
                <span className="text-[10px] text-slate-400">Qs</span>
              </div>
            </div>

            {/* Reflection Note if available */}
            {selectedDayDetail.record?.reflection && (
              <div className="mb-5 p-3.5 rounded-lg bg-[#161a29] border border-[#242d44]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Session Reflection:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed italic">
                  &ldquo;{selectedDayDetail.record.reflection}&rdquo;
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onSelectDate(selectedDayDetail.dateKey);
                  setSelectedDayDetail(null);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
              >
                <span>Open in Workstation</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              {onQuickAddQuestions && (
                <button
                  onClick={() => {
                    onQuickAddQuestions(selectedDayDetail.dateKey, 25);
                    const newTotal = selectedDayDetail.total + 25;
                    setSelectedDayDetail({
                      ...selectedDayDetail,
                      total: newTotal,
                      phy: selectedDayDetail.phy + 10,
                      che: selectedDayDetail.che + 10,
                      mat: selectedDayDetail.mat + 5
                    });
                    if (newTotal >= 100) {
                      confetti({ particleCount: 70, spread: 70 });
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>+25 Quick Qs</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
