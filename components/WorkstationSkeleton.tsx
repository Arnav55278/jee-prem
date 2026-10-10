'use client';

import React from 'react';

export default function WorkstationSkeleton() {
  return (
    <div className="min-h-screen bg-[#090b10] text-[#f1f3f9] flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Header Bar Skeleton */}
      <header className="sticky top-0 z-40 bg-[#0d1017]/90 backdrop-blur-md border-b border-[#1f2638] px-4 lg:px-6 py-3">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">
              Σ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-mono">KINETIC</span>
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">JEE</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  AIR 1 LAB
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400">Precision Analytics & Practice Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-8 w-28 rounded-xl bg-[#141824] animate-pulse border border-[#22293c]" />
            <div className="h-8 w-24 rounded-xl bg-[#141824] animate-pulse border border-[#22293c]" />
          </div>
        </div>
      </header>

      {/* Main Content Area Skeleton */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Date Selector Row Skeleton */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#0d1017] border border-[#1f2638]">
          <div className="space-y-1.5">
            <div className="h-6 w-48 bg-[#161d2d] rounded-lg animate-pulse" />
            <div className="h-3 w-64 bg-[#141926] rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-[#141926] rounded-xl animate-pulse" />
            <div className="h-8 w-20 bg-[#141926] rounded-xl animate-pulse" />
          </div>
        </div>

        {/* 4 KPI Metric Cards Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-[#0e121c] p-4 rounded-xl border border-[#1f273b] space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-[#161d2d] rounded animate-pulse" />
                <div className="h-4 w-4 bg-[#161d2d] rounded-full animate-pulse" />
              </div>
              <div className="h-8 w-28 bg-[#1a2338] rounded animate-pulse" />
              <div className="h-2.5 w-32 bg-[#141926] rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* 100-Question Meter Skeleton */}
        <div className="p-5 rounded-2xl bg-[#0e121c] border border-[#1f273b] space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 w-52 bg-[#161d2d] rounded animate-pulse" />
            <div className="h-4 w-24 bg-[#161d2d] rounded animate-pulse" />
          </div>
          <div className="w-full bg-[#141824] h-3.5 rounded-full border border-[#22293c]" />
        </div>

        {/* 3 Subject Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {['Physics', 'Chemistry', 'Mathematics'].map(sub => (
            <div key={sub} className="bg-[#0e121c] rounded-2xl border border-[#1f273b] p-4 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#181f30]">
                <div className="h-4 w-28 bg-[#161d2d] rounded animate-pulse" />
                <div className="h-6 w-16 bg-[#141926] rounded-lg animate-pulse" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="h-14 bg-[#131724] rounded-xl border border-[#20273b] animate-pulse" />
                <div className="h-14 bg-[#131724] rounded-xl border border-[#20273b] animate-pulse" />
                <div className="h-14 bg-[#131724] rounded-xl border border-[#20273b] animate-pulse" />
              </div>
              <div className="h-10 bg-[#131724] rounded-xl border border-[#20273b] animate-pulse" />
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
