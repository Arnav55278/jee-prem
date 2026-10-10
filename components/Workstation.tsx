'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Check, Sparkles, AlertTriangle, 
  ChevronRight, Calendar, Clock, Flame, Zap, Award, Target, HelpCircle,
  TrendingUp, Compass, ArrowRight, BookOpen, Star, X
} from 'lucide-react';
import { SubjectKey, QuestionLevel, DayRecord, SubjectDayData } from '@/lib/types';
import { CH, SUBJECT_CONFIG } from '@/lib/syllabus-data';
import { ExpStats } from '@/lib/exp-system';
import confetti from 'canvas-confetti';

interface WorkstationProps {
  currentDateKey: string;
  records: Record<string, DayRecord>;
  expStats?: ExpStats;
  onOpenExpBadges?: () => void;
  onUpdateSubject: (sub: SubjectKey, data: Partial<SubjectDayData>) => void;
  onUpdateReflection: (text: string) => void;
  onSelectDate: (dateKey: string) => void;
  onToggleMission: (index: number) => void;
  onOpenAi: () => void;
  onTriggerQuickLog: (sub: SubjectKey, level: QuestionLevel, amount: number) => void;
}

export default function Workstation({
  currentDateKey,
  records,
  expStats,
  onOpenExpBadges,
  onUpdateSubject,
  onUpdateReflection,
  onSelectDate,
  onToggleMission,
  onOpenAi,
  onTriggerQuickLog
}: WorkstationProps) {
  const todayKey = new Date().toISOString().slice(0, 10);
  const isToday = currentDateKey === todayKey;

  const currentEntry = React.useMemo(() => records[currentDateKey] || {
    reflection: '',
    missions: [false, false, false],
    phy: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '', concept: '', c: {} },
    che: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '', concept: '', c: {} },
    mat: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '', concept: '', c: {} }
  }, [records, currentDateKey]);

  // Pomodoro states for each subject
  const [pomoTimers, setPomoTimers] = useState<Record<SubjectKey, { seconds: number; running: boolean }>>({
    phy: { seconds: 1500, running: false },
    che: { seconds: 1500, running: false },
    mat: { seconds: 1500, running: false }
  });

  // Chapter dropdown search queries
  const [searchQuery, setSearchQuery] = useState<Record<SubjectKey, string>>({
    phy: '',
    che: '',
    mat: ''
  });
  const [openDropdown, setOpenDropdown] = useState<SubjectKey | null>(null);

  // Confidence DB in state / storage
  const [confidenceRatings, setConfidenceRatings] = useState<Record<string, number>>(() => {
    try {
      return JSON.parse(localStorage.getItem('pcm_conf_stars') || '{}');
    } catch {
      return {};
    }
  });

  // Pomodoro interval loop
  useEffect(() => {
    const interval = setInterval(() => {
      setPomoTimers(prev => {
        let changed = false;
        const next = { ...prev };
        (['phy', 'che', 'mat'] as SubjectKey[]).forEach(sub => {
          if (next[sub].running) {
            changed = true;
            if (next[sub].seconds <= 1) {
              next[sub] = { seconds: 1500, running: false };
              // Log 25 mins
              const currTime = currentEntry[sub]?.time || 0;
              onUpdateSubject(sub, { time: currTime + 25 });
              confetti({ particleCount: 40, spread: 60 });
            } else {
              next[sub] = { ...next[sub], seconds: next[sub].seconds - 1 };
            }
          }
        });
        return changed ? next : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentEntry, onUpdateSubject]);

  const togglePomo = (sub: SubjectKey) => {
    setPomoTimers(prev => ({
      ...prev,
      [sub]: { ...prev[sub], running: !prev[sub].running }
    }));
  };

  const resetPomo = (sub: SubjectKey) => {
    const elapsed = Math.floor((1500 - pomoTimers[sub].seconds) / 60);
    if (elapsed > 0) {
      const currTime = currentEntry[sub]?.time || 0;
      onUpdateSubject(sub, { time: currTime + elapsed });
    }
    setPomoTimers(prev => ({
      ...prev,
      [sub]: { seconds: 1500, running: false }
    }));
  };

  const formatPomoTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calculations for current day totals
  const pTotal = (currentEntry.phy?.l1 || 0) + (currentEntry.phy?.l2 || 0) + (currentEntry.phy?.l3 || 0);
  const cTotal = (currentEntry.che?.l1 || 0) + (currentEntry.che?.l2 || 0) + (currentEntry.che?.l3 || 0);
  const mTotal = (currentEntry.mat?.l1 || 0) + (currentEntry.mat?.l2 || 0) + (currentEntry.mat?.l3 || 0);
  const dayTotal = pTotal + cTotal + mTotal;

  // Milestone confetti check on 100 Qs
  const hasTriggered100 = useRef(false);
  useEffect(() => {
    if (dayTotal >= 100 && !hasTriggered100.current && isToday) {
      hasTriggered100.current = true;
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } else if (dayTotal < 100) {
      hasTriggered100.current = false;
    }
  }, [dayTotal, isToday]);

  // Overall database calculations
  const calculateStreak = () => {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const rec = records[k];
      if (rec) {
        const tot = ((rec.phy?.l1 || 0) + (rec.phy?.l2 || 0) + (rec.phy?.l3 || 0)) +
                    ((rec.che?.l1 || 0) + (rec.che?.l2 || 0) + (rec.che?.l3 || 0)) +
                    ((rec.mat?.l1 || 0) + (rec.mat?.l2 || 0) + (rec.mat?.l3 || 0));
        if (tot > 0) streak++;
        else break;
      } else {
        break;
      }
    }
    return streak;
  };

  // Readiness calculation based on Aditya's real practice
  const calcReadiness = () => {
    let totalQuestions = 0;
    let l3Questions = 0;
    Object.values(records).forEach(rec => {
      ['phy', 'che', 'mat'].forEach(s => {
        const subData = (rec as any)[s];
        if (subData) {
          totalQuestions += (subData.l1 || 0) + (subData.l2 || 0) + (subData.l3 || 0);
          l3Questions += (subData.l3 || 0);
        }
      });
    });
    if (totalQuestions === 0) return 0;
    const volumeScore = Math.min(50, (totalQuestions / 5000) * 50);
    const advScore = Math.min(30, (l3Questions / 500) * 30);
    const streakScore = Math.min(20, calculateStreak() * 2);
    return Math.min(99, Math.round(volumeScore + advScore + streakScore));
  };

  // 7-day momentum based on Aditya's real output
  const calcMomentum = () => {
    let last7 = 0;
    let prev7 = 0;
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const rec = records[k];
      if (rec) {
        last7 += (rec.phy?.l1 || 0) + (rec.phy?.l2 || 0) + (rec.phy?.l3 || 0) +
                 (rec.che?.l1 || 0) + (rec.che?.l2 || 0) + (rec.che?.l3 || 0) +
                 (rec.mat?.l1 || 0) + (rec.mat?.l2 || 0) + (rec.mat?.l3 || 0);
      }
    }
    for (let i = 7; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      const rec = records[k];
      if (rec) {
        prev7 += (rec.phy?.l1 || 0) + (rec.phy?.l2 || 0) + (rec.phy?.l3 || 0) +
                 (rec.che?.l1 || 0) + (rec.che?.l2 || 0) + (rec.che?.l3 || 0) +
                 (rec.mat?.l1 || 0) + (rec.mat?.l2 || 0) + (rec.mat?.l3 || 0);
      }
    }
    if (last7 === 0 && prev7 === 0) return '0%';
    if (prev7 === 0) return last7 > 0 ? '+100%' : '0%';
    const pct = Math.round(((last7 - prev7) / prev7) * 100);
    return `${pct >= 0 ? '+' : ''}${pct}%`;
  };

  // Days to JEE Advanced 2026 (e.g. May/June 2026)
  const targetDate = new Date('2026-06-15T00:00:00');
  const daysLeft = Math.max(1, Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  // Ghost Pacing (run-rate of 100 Qs/day from 8am to 11pm)
  const calculateGhostPacing = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentMins = hours * 60 + minutes - 8 * 60; // since 8:00 AM
    const totalDayMins = 15 * 60; // 8:00 AM to 11:00 PM = 15 hours
    if (currentMins <= 0) return 0;
    if (currentMins >= totalDayMins) return 100;
    return Math.round((currentMins / totalDayMins) * 100);
  };
  const ghostTarget = calculateGhostPacing();
  const paceDiff = dayTotal - ghostTarget;

  // Chapter star rating toggle
  const setStarRating = (chapter: string, stars: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = { ...confidenceRatings, [chapter]: stars };
    setConfidenceRatings(next);
    localStorage.setItem('pcm_conf_stars', JSON.stringify(next));
  };

  // Toggle chapter selection for current subject
  const toggleChapter = (sub: SubjectKey, ch: string) => {
    const currMap = { ...(currentEntry[sub]?.c || {}) };
    if (currMap[ch]) {
      delete currMap[ch];
    } else {
      currMap[ch] = 'status-practice';
    }
    onUpdateSubject(sub, { c: currMap });
  };

  const cycleChapterStatus = (sub: SubjectKey, ch: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currMap = { ...(currentEntry[sub]?.c || {}) };
    const currStatus = currMap[ch] || '';
    let nextStatus: any = '';
    if (currStatus === '') nextStatus = 'status-practice';
    else if (currStatus === 'status-practice') nextStatus = 'status-strong';
    else if (currStatus === 'status-strong') nextStatus = 'status-weak';
    else nextStatus = '';

    currMap[ch] = nextStatus;
    onUpdateSubject(sub, { c: currMap });
  };

  const removeChapter = (sub: SubjectKey, ch: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currMap = { ...(currentEntry[sub]?.c || {}) };
    delete currMap[ch];
    onUpdateSubject(sub, { c: currMap });
  };

  // Format readable date
  const formatHeaderDate = (k: string) => {
    const [y, m, d] = k.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Date Header & Quick Carousel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1017] p-4 rounded-2xl border border-[#1f2638]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-white font-mono-code">
              {formatHeaderDate(currentDateKey)}
            </span>
            {isToday ? (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                LIVE SESSION
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                HISTORICAL RECORD
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isToday ? 'Real-time practice workstation. All counters persist instantly.' : 'Viewing archived session. Edits update the historical audit.'}
          </p>
        </div>

        {/* Date Selector Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0">
          {[-2, -1, 0].map(offset => {
            const d = new Date();
            d.setDate(d.getDate() + offset);
            const k = d.toISOString().slice(0, 10);
            const isSelected = k === currentDateKey;
            const label = offset === 0 ? 'Today' : offset === -1 ? 'Yesterday' : `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
            const rec = records[k];
            const qCount = rec ? ((rec.phy?.l1 || 0) + (rec.phy?.l2 || 0) + (rec.phy?.l3 || 0)) +
                                 ((rec.che?.l1 || 0) + (rec.che?.l2 || 0) + (rec.che?.l3 || 0)) +
                                 ((rec.mat?.l1 || 0) + (rec.mat?.l2 || 0) + (rec.mat?.l3 || 0)) : 0;
            return (
              <button
                key={k}
                onClick={() => onSelectDate(k)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                    : 'bg-[#131722] text-slate-300 border-[#22293c] hover:bg-[#1a2133] hover:text-white'
                }`}
              >
                <span>{label}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono-code ${qCount >= 100 ? 'bg-orange-500/30 text-orange-300' : 'bg-black/30 text-slate-400'}`}>
                  {qCount > 0 ? `${qCount}Q` : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI METRIC STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-[#0e121c] p-4 rounded-xl border border-[#1f273b] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Solved Today</span>
            <span className="text-orange-400 text-base">🔥</span>
          </div>
          <div className="text-3xl font-extrabold font-mono-code text-white mt-2">
            {dayTotal} <span className="text-xs font-sans font-normal text-slate-400">/ 100 Qs</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            {dayTotal >= 100 ? (
              <span className="text-orange-400 font-bold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 animate-flame" /> Centurion Fire Parked!
              </span>
            ) : (
              <span>{100 - dayTotal} Qs left to park flame</span>
            )}
          </div>
        </div>

        <div className="bg-[#0e121c] p-4 rounded-xl border border-[#1f273b] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Readiness Index</span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono-code text-emerald-400 mt-2">
            {calcReadiness()}<span className="text-sm text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            AIR &lt; 500 Projected Trajectory
          </div>
        </div>

        <div className="bg-[#0e121c] p-4 rounded-xl border border-[#1f273b] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>7-Day Momentum</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono-code text-amber-400 mt-2">
            {calcMomentum()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            vs prior 7-day period output
          </div>
        </div>

        <div className="bg-[#0e121c] p-4 rounded-xl border border-[#1f273b] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Exam Runway</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono-code text-sky-400 mt-2">
            {daysLeft} <span className="text-xs font-sans font-normal text-slate-400">Days</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            JEE Advanced 2026 Target
          </div>
        </div>
      </div>

      {/* EXP & ACADEMIC CREDIT CITADEL CARD */}
      {expStats && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#121728] via-[#101422] to-[#171626] border border-indigo-500/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm"
                style={{ backgroundColor: expStats.currentLevel.bgGlow, border: `1px solid ${expStats.currentLevel.color}`, color: expStats.currentLevel.color }}
              >
                <Award className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    Level {expStats.currentLevel.level}: {expStats.currentLevel.title}
                  </span>
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono-code"
                    style={{ backgroundColor: expStats.currentLevel.bgGlow, color: expStats.currentLevel.color }}
                  >
                    {expStats.totalExp.toLocaleString()} EXP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {expStats.currentLevel.perk}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div 
                className="px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-semibold"
                style={{ backgroundColor: `${expStats.creditRatingColor}15`, borderColor: `${expStats.creditRatingColor}40` }}
                title="Academic Credit Score (300 - 900)"
              >
                <span className="text-[10px] text-slate-400 uppercase font-mono-code">Credit Score:</span>
                <span className="font-mono-code font-bold text-sm" style={{ color: expStats.creditRatingColor }}>
                  {expStats.creditScore}
                </span>
                <span className="text-[10px] text-slate-400 hidden lg:inline">({expStats.creditTier})</span>
              </div>

              {onOpenExpBadges && (
                <button
                  onClick={onOpenExpBadges}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Badges ({expStats.unlockedBadges.length}/{expStats.unlockedBadges.length + expStats.lockedBadges.length}) ↗</span>
                </button>
              )}
            </div>
          </div>

          {/* Level Progress Bar & Next Level Target */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span>Level Progress ({expStats.levelProgress}%)</span>
              <span className="font-mono-code text-indigo-300">
                {expStats.nextLevel ? `${expStats.expToNextLevel.toLocaleString()} EXP to Level ${expStats.nextLevel.level} (${expStats.nextLevel.title})` : 'Apex Level Reached!'}
              </span>
            </div>
            <div className="w-full bg-[#0a0d14] h-2.5 rounded-full border border-[#1f2638] overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 via-sky-400 to-amber-400"
                style={{ width: `${expStats.levelProgress}%` }}
              />
            </div>
          </div>

          {/* Real-time Multipliers Hint */}
          <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-[10.5px] text-slate-400">
            <div className="flex flex-wrap items-center gap-3">
              <span>⚡ <b>L1:</b> +10 XP</span>
              <span>⚡ <b>L2:</b> +25 XP</span>
              <span>⚡ <b>L3 Adv:</b> +50 XP</span>
              <span>⏱ <b>Focus Time:</b> +2 XP/min</span>
              <span>🔥 <b>Centurion 100-Q:</b> +300 Blaze XP</span>
              <span>🎯 <b>Clean Diagnostic:</b> +40 XP</span>
            </div>
            <span className="text-amber-400/90 font-semibold">Live Real-time XP Calculation</span>
          </div>
        </div>
      )}

      {/* TARGET PROGRESS (100 Qs CENTURION METER) */}
      <div className={`p-5 rounded-2xl border transition-all ${
        dayTotal >= 100 
          ? 'bg-gradient-to-r from-orange-950/40 via-[#131722] to-amber-950/40 border-orange-500/50 shadow-lg shadow-orange-500/10'
          : 'bg-[#0e121c] border-[#1f273b]'
      }`}>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`text-base ${dayTotal >= 100 ? 'animate-flame' : ''}`}>🔥</span>
            <span className="text-sm font-bold text-white">Daily 100-Question Centurion Meter</span>
            {dayTotal >= 100 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                FIRE PARKED ON CALENDAR
              </span>
            )}
          </div>
          <div className="font-mono-code text-xs font-bold text-slate-300">
            {dayTotal} / 100 Qs ({Math.round(Math.min(100, (dayTotal / 100) * 100))}%)
          </div>
        </div>

        <div className="w-full bg-[#141824] h-3.5 rounded-full p-0.5 border border-[#22293c] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              dayTotal >= 100
                ? 'bg-gradient-to-r from-orange-500 via-amber-400 to-red-500 fire-card-shadow'
                : 'bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${Math.min(100, (dayTotal / 100) * 100)}%` }}
          />
        </div>

        {/* BENCHMARK PACING (Run-rate vs Ghost) */}
        <div className="mt-4 pt-3 border-t border-[#1a2133] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-slate-400 font-semibold">Ghost Pacing Run-rate:</span>
            <span className="font-mono-code font-bold text-amber-400">{ghostTarget} Qs benchmark</span>
            <span className="text-slate-500">|</span>
            <span className={`font-semibold ${paceDiff >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {paceDiff >= 0 ? `+${paceDiff} Qs Ahead of Pace ⚡` : `${Math.abs(paceDiff)} Qs Behind Run-Rate`}
            </span>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            <span className="text-[11px] text-slate-400 mr-1">Quick Log:</span>
            {(['phy', 'che', 'mat'] as SubjectKey[]).map(sub => (
              <button
                key={sub}
                onClick={() => onTriggerQuickLog(sub, 'l2', 5)}
                className="px-2 py-1 rounded bg-[#171d2b] hover:bg-[#20283c] text-[11px] font-semibold text-slate-300 border border-[#252e44] transition-colors"
              >
                +5 {sub.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STRATEGIC INTEL BRIEFING & MISSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Strategic Diagnostic Briefing */}
        <div className="lg:col-span-2 bg-[#0e121c] p-5 rounded-2xl border border-[#1f273b] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">🧠</span>
                <span className="text-sm font-bold text-white">Strategic Diagnostic Briefing</span>
              </div>
              <button
                onClick={onOpenAi}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Consult AI Advisor</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              With <b>{daysLeft} days</b> remaining before JEE Advanced, your problem-solving velocity is strong. 
              Priority focus for this week: Strengthen <b className="text-sky-400">Rotational Motion</b> and <b className="text-amber-400">Definite Integration</b> Level 3 questions. Ensure minimum 15 Advanced problems are logged across Physics and Mathematics daily.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1a2133] grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-[#131724] p-2.5 rounded-lg border border-[#20273b] text-xs">
              <span className="text-slate-300">⚡ Rotational Dynamics</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                CRITICAL L3
              </span>
            </div>
            <div className="flex items-center justify-between bg-[#131724] p-2.5 rounded-lg border border-[#20273b] text-xs">
              <span className="text-slate-300">🧪 Ionic Buffer Equilibrium</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                FORMULA AUDIT
              </span>
            </div>
          </div>
        </div>

        {/* Daily Missions */}
        <div className="bg-[#0e121c] p-5 rounded-2xl border border-[#1f273b] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">Daily Objectives</span>
              </div>
              <span className="text-[11px] font-mono-code text-slate-400">
                {currentEntry.missions.filter(Boolean).length}/3 Done
              </span>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Complete 15+ Advanced (L3) Problems', check: (currentEntry.phy?.l3 || 0) + (currentEntry.che?.l3 || 0) + (currentEntry.mat?.l3 || 0) >= 15 },
                { label: 'Dedicated 60+ Mins Mathematics', check: (currentEntry.mat?.time || 0) >= 60 },
                { label: 'Reach 100+ Total Questions (Centurion)', check: dayTotal >= 100 }
              ].map((m, idx) => {
                const isCompleted = currentEntry.missions[idx] || m.check;
                return (
                  <div
                    key={idx}
                    onClick={() => onToggleMission(idx)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#131724] border-[#20273b] text-slate-300 hover:border-[#2f3954]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted ? 'bg-emerald-500 text-slate-950' : 'border border-slate-600'
                    }`}>
                      {isCompleted ? '✓' : ''}
                    </div>
                    <span className="text-xs font-medium">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3 PRIMARY SUBJECT WORKSTATION CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {(['phy', 'che', 'mat'] as SubjectKey[]).map(sub => {
          const cfg = SUBJECT_CONFIG[sub];
          const subData = currentEntry[sub] || { l1: 0, l2: 0, l3: 0, time: 0, mistake: '', concept: '', c: {} };
          const subTot = (subData.l1 || 0) + (subData.l2 || 0) + (subData.l3 || 0);
          const chaptersSelected = Object.keys(subData.c || {});
          const pomo = pomoTimers[sub];

          return (
            <div
              key={sub}
              className="bg-[#0e121c] rounded-2xl border border-[#1f273b] overflow-hidden shadow-lg flex flex-col justify-between"
            >
              {/* Subject Card Header */}
              <div className="p-4 border-b border-[#1a2133] flex items-center justify-between bg-[#121624]">
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm"
                    style={{ backgroundColor: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
                  >
                    {cfg.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">{cfg.name}</h3>
                    <p className="text-[10px] text-slate-400">{cfg.desc}</p>
                  </div>
                </div>

                {/* Pomodoro Timer Mini Widget */}
                <div className="flex items-center gap-1.5 bg-[#0a0d14] px-2.5 py-1 rounded-lg border border-[#1e2537]">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono-code text-xs font-bold text-slate-200">
                    {formatPomoTime(pomo.seconds)}
                  </span>
                  <button
                    onClick={() => togglePomo(sub)}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title={pomo.running ? 'Pause Sprint' : 'Start 25m Focus Block'}
                  >
                    {pomo.running ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => resetPomo(sub)}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title="Reset Focus Timer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Subject Card Body */}
              <div className="p-4 space-y-4 flex-1">
                
                {/* Problem Volume by Tier Inputs */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    <span>Problem Volume by Tier</span>
                    <span className="text-slate-500 font-mono-code">L1 / L2 / L3</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Level 1: Basic / Mains */}
                    <div className="bg-[#131724] rounded-xl border border-[#20273b] p-2 text-center">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block mb-1">
                        L1 · Base
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={subData.l1 || ''}
                        placeholder="0"
                        onChange={e => onUpdateSubject(sub, { l1: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-transparent text-center font-mono-code font-bold text-xl text-white outline-none"
                      />
                    </div>

                    {/* Level 2: JEE Main Standard */}
                    <div className="bg-[#131724] rounded-xl border border-[#20273b] p-2 text-center">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        L2 · Main
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={subData.l2 || ''}
                        placeholder="0"
                        onChange={e => onUpdateSubject(sub, { l2: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-transparent text-center font-mono-code font-bold text-xl text-white outline-none"
                      />
                    </div>

                    {/* Level 3: JEE Advanced Rigor */}
                    <div className="bg-[#131724] rounded-xl border border-[#20273b] p-2 text-center">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                        L3 · Adv
                      </span>
                      <input
                        type="number"
                        min="0"
                        value={subData.l3 || ''}
                        placeholder="0"
                        onChange={e => onUpdateSubject(sub, { l3: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-transparent text-center font-mono-code font-bold text-xl text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Subtotal Pill */}
                  <div className="mt-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#141825] border border-[#22293c]">
                    <span className="text-xs text-slate-400 font-medium">{cfg.name} Subtotal:</span>
                    <span className="font-mono-code font-bold text-base" style={{ color: cfg.accent }}>
                      {subTot} Questions
                    </span>
                  </div>
                </div>

                {/* Practice Metadata (Time & Diagnostics Error) */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Practice Metadata & Diagnostic
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        min="0"
                        placeholder="⏱ Minutes Spent"
                        value={subData.time || ''}
                        onChange={e => onUpdateSubject(sub, { time: Math.max(0, parseInt(e.target.value) || 0) })}
                        className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs font-mono-code text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <select
                        value={subData.mistake || ''}
                        onChange={e => onUpdateSubject(sub, { mistake: e.target.value as any })}
                        className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      >
                        <option value="">Diagnostic: Clean</option>
                        <option value="Calculation">Calculation Error</option>
                        <option value="Formula">Formula Slip</option>
                        <option value="Concept">Conceptual Gap</option>
                        <option value="Silly">Rushed / Misread</option>
                      </select>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Cross-concept link (e.g., Vectors in Rotational dynamics)"
                    value={subData.concept || ''}
                    onChange={e => onUpdateSubject(sub, { concept: e.target.value })}
                    className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Syllabus Chapters Tagged */}
                <div className="space-y-2 relative">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Syllabus Chapters Tagged</span>
                    <button
                      onClick={() => setOpenDropdown(openDropdown === sub ? null : sub)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      {openDropdown === sub ? 'Close List' : '+ Tag Chapter'}
                    </button>
                  </div>

                  {/* Selected Chapter Chips */}
                  <div className="min-h-[46px] p-2 rounded-xl bg-[#131724] border border-[#20273b] flex flex-wrap gap-1.5 items-center">
                    {chaptersSelected.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">No chapters tagged today</span>
                    ) : (
                      chaptersSelected.map(ch => {
                        const st = subData.c[ch];
                        const stars = confidenceRatings[ch] || 0;
                        return (
                          <div
                            key={ch}
                            onClick={e => cycleChapterStatus(sub, ch, e)}
                            className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all border ${
                              st === 'status-strong'
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : st === 'status-weak'
                                ? 'bg-red-500/15 text-red-300 border-red-500/30'
                                : 'bg-[#1b2234] text-slate-200 border-[#2a354f]'
                            }`}
                            title="Click to toggle status (Practice / Mastered / Needs Revision)"
                          >
                            <span className="max-w-[130px] truncate">{ch}</span>
                            {stars > 0 && (
                              <span className="text-[10px] text-amber-400">★{stars}</span>
                            )}
                            <button
                              onClick={e => removeChapter(sub, ch, e)}
                              className="text-slate-400 hover:text-red-400 ml-1 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Chapter Selection Dropdown */}
                  {openDropdown === sub && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-[#151a29] border border-[#2b354e] rounded-xl shadow-2xl p-3 max-h-72 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                      <input
                        type="text"
                        placeholder="Search syllabus..."
                        value={searchQuery[sub]}
                        onChange={e => setSearchQuery(prev => ({ ...prev, [sub]: e.target.value }))}
                        className="w-full bg-[#0d1017] border border-[#222a3d] rounded-lg px-2.5 py-1.5 text-xs text-white outline-none mb-2"
                      />
                      <div className="overflow-y-auto space-y-1 flex-1 pr-1">
                        {CH[sub]
                          .filter(c => c.toLowerCase().includes(searchQuery[sub].toLowerCase()))
                          .map(ch => {
                            const isTagged = ch in (subData.c || {});
                            const stars = confidenceRatings[ch] || 0;
                            return (
                              <div
                                key={ch}
                                onClick={() => toggleChapter(sub, ch)}
                                className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                  isTagged
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                                    : 'text-slate-300 hover:bg-[#1f263c]'
                                }`}
                              >
                                <span className="truncate pr-2">{ch}</span>
                                <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                                  {[1, 2, 3, 4, 5].map(starNum => (
                                    <span
                                      key={starNum}
                                      onClick={e => setStarRating(ch, starNum, e)}
                                      className={`cursor-pointer text-[11px] ${
                                        starNum <= stars ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                                      }`}
                                    >
                                      ★
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Card Footer */}
              <div className="p-3 bg-[#0a0d14] border-t border-[#1a2133] flex items-center justify-between text-xs text-slate-400">
                <span>Time efficiency:</span>
                <span className="font-mono-code text-slate-200">
                  {subTot > 0 ? (subData.time / subTot).toFixed(1) : 0} mins/Q
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DAILY QUALITATIVE REFLECTION LOG */}
      <div className="bg-[#0e121c] p-5 rounded-2xl border border-[#1f2638] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">✍️</span>
            <span className="text-sm font-bold text-white">Daily Practice Log & Qualitative Review</span>
          </div>
          <span className="text-xs text-slate-500">Auto-saved</span>
        </div>
        <textarea
          value={currentEntry.reflection || ''}
          onChange={e => onUpdateReflection(e.target.value)}
          placeholder="Document derivations mastered today, conceptual hesitation notes, time management reflections, and target adjustments for tomorrow..."
          className="w-full h-24 bg-[#131724] border border-[#20273b] rounded-xl p-3.5 text-xs text-slate-200 leading-relaxed outline-none focus:border-indigo-500 resize-y"
        />
      </div>

      {/* FOOTER BAR METRICS */}
      <div className="p-4 rounded-xl bg-[#0b0e14] border border-[#1d2436] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Today Solved</span>
            <span className="text-lg font-mono-code font-bold text-white">{dayTotal} Qs</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Physics</span>
            <span className="text-lg font-mono-code font-bold text-sky-400">{pTotal} Qs</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Chemistry</span>
            <span className="text-lg font-mono-code font-bold text-emerald-400">{cTotal} Qs</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Maths</span>
            <span className="text-lg font-mono-code font-bold text-amber-400">{mTotal} Qs</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141824] border border-[#232b3e]">
            <span className="text-base animate-flame">🔥</span>
            <div>
              <span className="text-xs font-mono-code font-bold text-orange-400">{calculateStreak()} Days</span>
              <span className="text-[10px] text-slate-400 ml-1">Practice Streak</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141824] border border-[#232b3e]">
            <Award className="w-4 h-4 text-indigo-400" />
            <div>
              <span className="text-xs font-mono-code font-bold text-indigo-300">AIR &lt; 500</span>
              <span className="text-[10px] text-slate-400 ml-1">Target Pace</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
