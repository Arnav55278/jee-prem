'use client';

import React, { useEffect, useRef, useState } from 'react';
import { 
  BarChart3, PieChart, Activity, Clock, Zap, CheckCircle2, 
  AlertTriangle, Layers, Calendar, ChevronRight
} from 'lucide-react';
import { DayRecord, SubjectKey } from '@/lib/types';
import { CH, SUBJECT_CONFIG } from '@/lib/syllabus-data';
import Chart from 'chart.js/auto';

interface AnalyticsVisualizerProps {
  records: Record<string, DayRecord>;
}

export default function AnalyticsVisualizer({ records }: AnalyticsVisualizerProps) {
  const lineChartRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartRef = useRef<HTMLCanvasElement | null>(null);
  const effChartRef = useRef<HTMLCanvasElement | null>(null);
  const fatigueChartRef = useRef<HTMLCanvasElement | null>(null);

  const lineChartInst = useRef<Chart | null>(null);
  const radarChartInst = useRef<Chart | null>(null);
  const effChartInst = useRef<Chart | null>(null);
  const fatigueChartInst = useRef<Chart | null>(null);

  const [activeMatrixSubject, setActiveMatrixSubject] = useState<SubjectKey>('phy');

  // Initialize and update Chart.js
  useEffect(() => {
    // Compute 7-day data
    const labels: string[] = [];
    const phyData: number[] = [];
    const cheData: number[] = [];
    const matData: number[] = [];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const k = d.toISOString().slice(0, 10);
      labels.push(d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }));

      const rec = records[k];
      if (rec) {
        phyData.push((rec.phy?.l1 || 0) + (rec.phy?.l2 || 0) + (rec.phy?.l3 || 0));
        cheData.push((rec.che?.l1 || 0) + (rec.che?.l2 || 0) + (rec.che?.l3 || 0));
        matData.push((rec.mat?.l1 || 0) + (rec.mat?.l2 || 0) + (rec.mat?.l3 || 0));
      } else {
        phyData.push(0);
        cheData.push(0);
        matData.push(0);
      }
    }

    // Compute all-time totals for radar
    let p = 0, c = 0, m = 0;
    let pTime = 0, cTime = 0, mTime = 0;

    Object.values(records).forEach(rec => {
      const pt = (rec.phy?.l1 || 0) + (rec.phy?.l2 || 0) + (rec.phy?.l3 || 0);
      const ct = (rec.che?.l1 || 0) + (rec.che?.l2 || 0) + (rec.che?.l3 || 0);
      const mt = (rec.mat?.l1 || 0) + (rec.mat?.l2 || 0) + (rec.mat?.l3 || 0);
      p += pt;
      c += ct;
      m += mt;
      pTime += rec.phy?.time || 0;
      cTime += rec.che?.time || 0;
      mTime += rec.mat?.time || 0;
    });

    const pMinsPerQ = Number(p > 0 ? (pTime / p).toFixed(1) : '0');
    const cMinsPerQ = Number(c > 0 ? (cTime / c).toFixed(1) : '0');
    const mMinsPerQ = Number(m > 0 ? (mTime / m).toFixed(1) : '0');

    // Count real diagnostic mistakes from Aditya's records
    let calcErrors = 0, formulaErrors = 0, conceptErrors = 0, sillyErrors = 0;
    Object.values(records).forEach(rec => {
      (['phy', 'che', 'mat'] as SubjectKey[]).forEach(s => {
        const mis = rec[s]?.mistake;
        if (mis === 'Calculation') calcErrors++;
        else if (mis === 'Formula') formulaErrors++;
        else if (mis === 'Concept') conceptErrors++;
        else if (mis === 'Silly') sillyErrors++;
      });
    });

    // 1. Line Chart
    if (lineChartRef.current) {
      if (lineChartInst.current) lineChartInst.current.destroy();
      lineChartInst.current = new Chart(lineChartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Physics',
              data: phyData,
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#38bdf8',
              pointRadius: 4
            },
            {
              label: 'Chemistry',
              data: cheData,
              borderColor: '#34d399',
              backgroundColor: 'rgba(52, 211, 153, 0.1)',
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#34d399',
              pointRadius: 4
            },
            {
              label: 'Mathematics',
              data: matData,
              borderColor: '#fbbf24',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#fbbf24',
              pointRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: { color: '#94a3b8', font: { size: 11, family: 'Plus Jakarta Sans' } }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b' }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b' }
            }
          }
        }
      });
    }

    // 2. Radar Chart
    if (radarChartRef.current) {
      if (radarChartInst.current) radarChartInst.current.destroy();
      radarChartInst.current = new Chart(radarChartRef.current, {
        type: 'radar',
        data: {
          labels: ['Physics', 'Chemistry', 'Mathematics'],
          datasets: [
            {
              label: 'Total Output Volume',
              data: [p, c, m],
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              borderColor: '#6366f1',
              pointBackgroundColor: '#6366f1',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: '#6366f1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            r: {
              angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
              grid: { color: 'rgba(255, 255, 255, 0.08)' },
              pointLabels: { color: '#cbd5e1', font: { size: 12, weight: 'bold' } },
              ticks: { display: false }
            }
          }
        }
      });
    }

    // 3. Efficiency Chart
    if (effChartRef.current) {
      if (effChartInst.current) effChartInst.current.destroy();
      effChartInst.current = new Chart(effChartRef.current, {
        type: 'bar',
        data: {
          labels: ['Physics', 'Chemistry', 'Mathematics'],
          datasets: [
            {
              label: 'Minutes Spent per Question',
              data: [pMinsPerQ, cMinsPerQ, mMinsPerQ],
              backgroundColor: ['#38bdf8', '#34d399', '#fbbf24'],
              borderRadius: 8
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8' }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b' }
            }
          }
        }
      });
    }

    // 4. Real Diagnostic Error Distribution Chart
    if (fatigueChartRef.current) {
      if (fatigueChartInst.current) fatigueChartInst.current.destroy();
      
      const errorCategories = ['Calculation Slip', 'Formula Gap', 'Conceptual Hesitation', 'Rushed / Silly'];
      const realErrorsData = [calcErrors, formulaErrors, conceptErrors, sillyErrors];

      fatigueChartInst.current = new Chart(fatigueChartRef.current, {
        type: 'bar',
        data: {
          labels: errorCategories,
          datasets: [
            {
              label: 'Recorded Errors in Practice',
              data: realErrorsData,
              backgroundColor: ['#f87171', '#fbbf24', '#38bdf8', '#c084fc'],
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94a3b8', font: { size: 10 } }
            },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.05)' },
              ticks: { color: '#64748b', stepSize: 1 },
              title: { display: true, text: 'Occurrences', color: '#64748b' }
            }
          }
        }
      });
    }

    return () => {
      lineChartInst.current?.destroy();
      radarChartInst.current?.destroy();
      effChartInst.current?.destroy();
      fatigueChartInst.current?.destroy();
    };
  }, [records]);

  // Compute touched chapters for coverage matrix
  const getTouchedChapters = (sub: SubjectKey) => {
    const touched: Record<string, { lastDate: string; status: string }> = {};
    Object.keys(records).sort().forEach(dateKey => {
      const rec = records[dateKey];
      const subObj = rec?.[sub];
      if (subObj?.c) {
        Object.entries(subObj.c).forEach(([chName, st]) => {
          touched[chName] = { lastDate: dateKey, status: st as string };
        });
      }
    });
    return touched;
  };

  const touchedMap = getTouchedChapters(activeMatrixSubject);
  const totalChapters = CH[activeMatrixSubject].length;
  const touchedCount = Object.keys(touchedMap).length;
  const coveragePercent = Math.round((touchedCount / totalChapters) * 100);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#0d1017] p-5 rounded-2xl border border-[#1f2638] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            <span>Real-time Visual Analytics & Curriculum Matrix</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Grounded mathematical trends, balance radars, speed efficiencies, and syllabus coverage.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#121624] px-4 py-2 rounded-xl border border-[#21293c]">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Syllabus Coverage</span>
            <span className="font-mono-code font-bold text-sm text-emerald-400">
              {coveragePercent}% Overall Active
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
            {touchedCount}/{totalChapters}
          </div>
        </div>
      </div>

      {/* Chart Grid: Line + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Line Chart */}
        <div className="bg-[#0e121c] p-5 rounded-2xl border border-[#1f273b] shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>7-Day Problem Solving Velocity Trend</span>
              </h3>
              <p className="text-[11px] text-slate-400">Daily question volume across subjects</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
              LIVE TELEMETRY
            </span>
          </div>
          <div className="h-64 relative flex-1">
            <canvas ref={lineChartRef} />
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-[#0e121c] p-5 rounded-2xl border border-[#1f273b] shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <PieChart className="w-4 h-4 text-indigo-400" />
                <span>PCM Balance Equilibrium</span>
              </h3>
              <p className="text-[11px] text-slate-400">Relative allocation across Physics, Chemistry, and Math</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
              TRIPARTITE SYMMETRY
            </span>
          </div>
          <div className="h-64 relative flex-1">
            <canvas ref={radarChartRef} />
          </div>
        </div>
      </div>

      {/* Efficiency Bar Chart + Diurnal Fatigue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Time Efficiency */}
        <div className="bg-[#0e121c] p-5 rounded-2xl border border-[#1f273b] shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Time Investment Speed (Minutes / Question)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Target for JEE Advanced: ~2.5 - 3.0 min/Q</p>
            </div>
          </div>
          <div className="h-60 relative flex-1">
            <canvas ref={effChartRef} />
          </div>
        </div>

        {/* Diagnostic Errors Audit */}
        <div className="bg-[#0e121c] p-5 rounded-2xl border border-[#1f273b] shadow-md flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-400" />
                <span>Diagnostic Error Frequency Audit</span>
              </h3>
              <p className="text-[11px] text-slate-400">Personal audit of calculation slips, formula gaps, and conceptual hesitations</p>
            </div>
          </div>
          <div className="h-60 relative flex-1">
            <canvas ref={fatigueChartRef} />
          </div>
        </div>
      </div>

      {/* SYLLABUS COVERAGE MATRIX (94 CHAPTERS) */}
      <div className="bg-[#0e121c] p-6 rounded-2xl border border-[#1f2638] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c2336]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Syllabus Coverage & Spaced Review Heatmap</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Visual matrix of all 94 JEE chapters with active practice status and recall latency.
            </p>
          </div>

          {/* Subject Tabs */}
          <div className="flex items-center gap-1 bg-[#131724] p-1 rounded-xl border border-[#20273b]">
            {(['phy', 'che', 'mat'] as SubjectKey[]).map(sub => {
              const cfg = SUBJECT_CONFIG[sub];
              return (
                <button
                  key={sub}
                  onClick={() => setActiveMatrixSubject(sub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                    activeMatrixSubject === sub
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cfg.name} ({CH[sub].length})
                </button>
              );
            })}
          </div>
        </div>

        {/* Matrix Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-5">
          {CH[activeMatrixSubject].map(ch => {
            const touchInfo = touchedMap[ch];
            const isTouched = !!touchInfo;
            const isMastered = touchInfo?.status === 'status-strong';
            const isWeak = touchInfo?.status === 'status-weak';

            return (
              <div
                key={ch}
                className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  isMastered
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : isWeak
                    ? 'bg-red-500/10 border-red-500/30 text-red-300'
                    : isTouched
                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-300'
                    : 'bg-[#121624] border-[#1c2336] text-slate-400 opacity-70'
                }`}
              >
                <div>
                  <span className="font-semibold block truncate leading-tight" title={ch}>
                    {ch}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {isTouched ? `Last: ${touchInfo.lastDate}` : 'Not practiced yet'}
                  </span>
                </div>
                <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-bold">
                  <span>
                    {isMastered ? 'Mastered ★' : isWeak ? 'Needs Fix ⚠️' : isTouched ? 'Practiced ✓' : 'Untouched'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-5 pt-4 border-t border-[#1c2336] flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500" />
            <span>Mastered (Status Strong)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-sky-500/40 border border-sky-500" />
            <span>Active Practice (Status Normal)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500" />
            <span>Needs Urgent Revision (Status Weak)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#121624] border border-[#232b3f]" />
            <span>Untouched In Cycle</span>
          </div>
        </div>
      </div>

    </div>
  );
}
