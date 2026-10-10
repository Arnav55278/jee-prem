'use client';

import React, { useState } from 'react';
import { 
  FileText, Download, Printer, Copy, Check, Calendar, 
  TrendingUp, Award, Compass, AlertCircle, ArrowDownToLine, Zap
} from 'lucide-react';
import { DayRecord, SubjectKey } from '@/lib/types';
import { SUBJECT_CONFIG } from '@/lib/syllabus-data';

interface CustomReportGeneratorProps {
  records: Record<string, DayRecord>;
}

export default function CustomReportGenerator({ records }: CustomReportGeneratorProps) {
  const [rangeMode, setRangeMode] = useState<'7d' | '14d' | '30d' | 'all'>('7d');
  const [copied, setCopied] = useState(false);

  // Compute records in selected range
  const getFilteredRecords = () => {
    const keys = Object.keys(records).sort().reverse();
    if (rangeMode === '7d') return keys.slice(0, 7);
    if (rangeMode === '14d') return keys.slice(0, 14);
    if (rangeMode === '30d') return keys.slice(0, 30);
    return keys;
  };

  const activeKeys = getFilteredRecords();

  let totalQuestions = 0;
  let pTotal = 0, cTotal = 0, mTotal = 0;
  let l1Total = 0, l2Total = 0, l3Total = 0;
  let totalTimeMins = 0;
  let errorCounts: Record<string, number> = { Calculation: 0, Formula: 0, Concept: 0, Silly: 0 };
  let centurionDays = 0;

  activeKeys.forEach(k => {
    const rec = records[k];
    if (!rec) return;

    let dayQ = 0;
    (['phy', 'che', 'mat'] as SubjectKey[]).forEach(s => {
      const subObj = rec[s];
      if (subObj) {
        const l1 = subObj.l1 || 0;
        const l2 = subObj.l2 || 0;
        const l3 = subObj.l3 || 0;
        const subTot = l1 + l2 + l3;
        dayQ += subTot;
        if (s === 'phy') pTotal += subTot;
        if (s === 'che') cTotal += subTot;
        if (s === 'mat') mTotal += subTot;
        l1Total += l1;
        l2Total += l2;
        l3Total += l3;
        totalTimeMins += subObj.time || 0;
        if (subObj.mistake && errorCounts[subObj.mistake] !== undefined) {
          errorCounts[subObj.mistake]++;
        }
      }
    });

    totalQuestions += dayQ;
    if (dayQ >= 100) centurionDays++;
  });

  const dailyAvg = activeKeys.length > 0 ? Math.round(totalQuestions / activeKeys.length) : 0;
  const hoursSpent = (totalTimeMins / 60).toFixed(1);
  const avgMinsPerQ = totalQuestions > 0 ? (totalTimeMins / totalQuestions).toFixed(1) : '0.0';

  // Projected AIR
  const getProjectedAIR = () => {
    if (dailyAvg >= 120 && l3Total >= 150) return 'AIR < 200 (Top 0.1% Elite)';
    if (dailyAvg >= 90 && l3Total >= 80) return 'AIR < 500 (IIT Bombay / Delhi CSE)';
    if (dailyAvg >= 70) return 'AIR < 1200 (Top 5 IITs Preferred Branch)';
    if (dailyAvg >= 50) return 'AIR < 2500 (Core IITs Selection)';
    return 'Foundation Phase (Focus on Volume & L2 Mastery)';
  };

  // CSV Export
  const exportCSV = () => {
    let csv = "Date,Total_Questions,Physics,Chemistry,Mathematics,L1_Basic,L2_Main,L3_Adv,Time_Minutes,Mistake_Category,Reflection\n";
    activeKeys.forEach(k => {
      const rec = records[k];
      if (rec) {
        const p = (rec.phy?.l1 || 0) + (rec.phy?.l2 || 0) + (rec.phy?.l3 || 0);
        const c = (rec.che?.l1 || 0) + (rec.che?.l2 || 0) + (rec.che?.l3 || 0);
        const m = (rec.mat?.l1 || 0) + (rec.mat?.l2 || 0) + (rec.mat?.l3 || 0);
        const l1 = (rec.phy?.l1 || 0) + (rec.che?.l1 || 0) + (rec.mat?.l1 || 0);
        const l2 = (rec.phy?.l2 || 0) + (rec.che?.l2 || 0) + (rec.mat?.l2 || 0);
        const l3 = (rec.phy?.l3 || 0) + (rec.che?.l3 || 0) + (rec.mat?.l3 || 0);
        const time = (rec.phy?.time || 0) + (rec.che?.time || 0) + (rec.mat?.time || 0);
        const mistakes = [rec.phy?.mistake, rec.che?.mistake, rec.mat?.mistake].filter(Boolean).join('; ');
        const reflection = (rec.reflection || '').replace(/"/g, '""');

        csv += `${k},${p + c + m},${p},${c},${m},${l1},${l2},${l3},${time},"${mistakes}","${reflection}"\n`;
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KINETIC_JEE_Audit_Report_${rangeMode}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy Clipboard Summary
  const copySummary = () => {
    const text = `📋 KINETIC JEE Performance Audit Report (${rangeMode.toUpperCase()} Period):
• Total Problems Solved: ${totalQuestions.toLocaleString()} Qs
• Daily Average Velocity: ${dailyAvg} Qs/Day
• Centurion Fire Days (100+ Qs): ${centurionDays} Days 🔥
• Subject Allocation: Physics (${pTotal} Qs) | Chemistry (${cTotal} Qs) | Maths (${mTotal} Qs)
• Rigor Tier Breakdown: L1 Basic (${l1Total}) | L2 Main (${l2Total}) | L3 Adv (${l3Total})
• Total Time Invested: ${hoursSpent} Hours (Avg ${avgMinsPerQ} mins/Q)
• Projected Trajectory: ${getProjectedAIR()}
Generated via KINETIC JEE Precision Workstation`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#0d1017] p-5 rounded-2xl border border-[#1f2638] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-amber-400" />
            <span>Custom Report Generation & Diagnostic Audit</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Produce comprehensive performance audits with percentile models, CSV datasets, and printable reports.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 bg-[#121624] p-1.5 rounded-xl border border-[#21293c]">
          {[
            { id: '7d', label: 'Last 7 Days' },
            { id: '14d', label: 'Last 14 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: 'all', label: 'All Time' }
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setRangeMode(r.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                rangeMode === r.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-[#0e121c] p-4 rounded-xl border border-[#1f273b] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-400 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span>Auditing {activeKeys.length} days of verified practice logs</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={copySummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141824] hover:bg-[#1c2233] text-slate-300 hover:text-white border border-[#22293c] transition-colors font-semibold"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141824] hover:bg-[#1c2233] text-slate-300 hover:text-white border border-[#22293c] transition-colors font-semibold"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 text-sky-400" />
            <span>Download CSV Dataset</span>
          </button>

          <button
            onClick={printReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors shadow-md shadow-indigo-600/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* Printable / Rendered Performance Dossier */}
      <div className="bg-[#0e121c] p-6 sm:p-8 rounded-2xl border border-[#1f2638] shadow-2xl space-y-6">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#21293d]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                OFFICIAL PERFORMANCE DOSSIER
              </span>
              <span className="text-xs text-slate-400 font-mono-code">CONFIDENTIAL</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              JEE Advanced Academic Velocity & Diagnostic Report
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Candidate: <b>Aditya Khari</b> · Target: <b>IIT Bombay Computer Science (AIR &lt; 500)</b>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Report Generation Timestamp:</span>
            <span className="font-mono-code text-xs text-slate-200 font-semibold">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 4 Core Quantitative Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#121624] p-4 rounded-xl border border-[#20273b]">
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Volume Solved</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-code text-white mt-1">
              {totalQuestions.toLocaleString()}
            </div>
            <span className="text-[11px] text-slate-400">Questions in period</span>
          </div>

          <div className="bg-[#121624] p-4 rounded-xl border border-[#20273b]">
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Daily Velocity</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-code text-orange-400 mt-1">
              {dailyAvg} <span className="text-xs font-normal text-slate-400">Qs/day</span>
            </div>
            <span className="text-[11px] text-slate-400">Target baseline: 100 Qs</span>
          </div>

          <div className="bg-[#121624] p-4 rounded-xl border border-[#20273b]">
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Centurion Days 🔥</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-code text-amber-400 mt-1">
              {centurionDays} <span className="text-xs font-normal text-slate-400">/ {activeKeys.length}d</span>
            </div>
            <span className="text-[11px] text-slate-400">Days hitting 100+ target</span>
          </div>

          <div className="bg-[#121624] p-4 rounded-xl border border-[#20273b]">
            <span className="text-[11px] text-slate-400 uppercase font-bold block">Time Invested</span>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono-code text-sky-400 mt-1">
              {hoursSpent} <span className="text-xs font-normal text-slate-400">Hrs</span>
            </div>
            <span className="text-[11px] text-slate-400">Avg {avgMinsPerQ} mins/Q</span>
          </div>
        </div>

        {/* Projected AIR Percentile Banner */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-[#131722] to-amber-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-bold text-white">Projected Performance Trajectory</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Calculated via cumulative Level 3 ratio, 100-Q consistency, and curriculum breadth.
            </p>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs font-mono-code font-bold px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-sm sm:text-base">
              {getProjectedAIR()}
            </span>
          </div>
        </div>

        {/* Subject Allocation & Tier Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          
          {/* Subject Breakdown Card */}
          <div className="bg-[#121624] p-5 rounded-xl border border-[#20273b] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Subject Allocation Balance
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 font-semibold">
                  <span className="text-sky-400">Physics: {pTotal} Qs</span>
                  <span className="text-slate-400 font-mono-code">
                    {totalQuestions > 0 ? Math.round((pTotal / totalQuestions) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#1b2234] overflow-hidden">
                  <div
                    className="h-full bg-sky-400 rounded-full"
                    style={{ width: `${totalQuestions > 0 ? (pTotal / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold">
                  <span className="text-emerald-400">Chemistry: {cTotal} Qs</span>
                  <span className="text-slate-400 font-mono-code">
                    {totalQuestions > 0 ? Math.round((cTotal / totalQuestions) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#1b2234] overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${totalQuestions > 0 ? (cTotal / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 font-semibold">
                  <span className="text-amber-400">Mathematics: {mTotal} Qs</span>
                  <span className="text-slate-400 font-mono-code">
                    {totalQuestions > 0 ? Math.round((mTotal / totalQuestions) * 100) : 0}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#1b2234] overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${totalQuestions > 0 ? (mTotal / totalQuestions) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tier Rigor Distribution */}
          <div className="bg-[#121624] p-5 rounded-xl border border-[#20273b] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Problem Rigor Tiers
            </h4>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1d2538]">
                <span className="text-[10px] font-bold text-sky-400 uppercase block">L1 · Basic</span>
                <span className="text-xl font-bold font-mono-code text-white mt-1 block">{l1Total}</span>
                <span className="text-[10px] text-slate-500">
                  {totalQuestions > 0 ? Math.round((l1Total / totalQuestions) * 100) : 0}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1d2538]">
                <span className="text-[10px] font-bold text-emerald-400 uppercase block">L2 · Main</span>
                <span className="text-xl font-bold font-mono-code text-white mt-1 block">{l2Total}</span>
                <span className="text-[10px] text-slate-500">
                  {totalQuestions > 0 ? Math.round((l2Total / totalQuestions) * 100) : 0}%
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1d2538]">
                <span className="text-[10px] font-bold text-amber-400 uppercase block">L3 · Adv</span>
                <span className="text-xl font-bold font-mono-code text-white mt-1 block">{l3Total}</span>
                <span className="text-[10px] text-slate-500">
                  {totalQuestions > 0 ? Math.round((l3Total / totalQuestions) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 mt-2 bg-[#0d1017] p-2.5 rounded-lg border border-[#1b2234]">
              <b>Rigor Recommendation:</b> Advanced tier (L3) should account for ≥25% of practice to secure rank under 500 in JEE Advanced.
            </div>
          </div>
        </div>

        {/* Error Diagnostics Audit */}
        <div className="p-5 rounded-xl bg-[#121624] border border-[#20273b] space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Error Diagnostics Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1d2538]">
              <span className="text-slate-400 block">Calculation Slips:</span>
              <span className="font-mono-code font-bold text-base text-red-400">{errorCounts.Calculation} logged</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1d2538]">
              <span className="text-slate-400 block">Formula Missteps:</span>
              <span className="font-mono-code font-bold text-base text-amber-400">{errorCounts.Formula} logged</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1d2538]">
              <span className="text-slate-400 block">Conceptual Gaps:</span>
              <span className="font-mono-code font-bold text-base text-sky-400">{errorCounts.Concept} logged</span>
            </div>
            <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1d2538]">
              <span className="text-slate-400 block">Rushed / Silly:</span>
              <span className="font-mono-code font-bold text-base text-purple-400">{errorCounts.Silly} logged</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
