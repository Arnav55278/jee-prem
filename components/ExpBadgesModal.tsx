'use client';

import React, { useState } from 'react';
import { 
  Award, Shield, Zap, Flame, Clock, CheckCircle2, Lock, 
  Sparkles, TrendingUp, ChevronRight, X, Star, CreditCard, BarChart2
} from 'lucide-react';
import { ExpStats, LEVELS, BADGES, BadgeDefinition } from '@/lib/exp-system';

interface ExpBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  expStats: ExpStats;
}

export default function ExpBadgesModal({
  isOpen,
  onClose,
  expStats
}: ExpBadgesModalProps) {
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);

  if (!isOpen) return null;

  const {
    totalExp,
    currentLevel,
    nextLevel,
    levelProgress,
    expToNextLevel,
    creditScore,
    creditTier,
    creditRatingColor,
    breakdown,
    metrics,
    unlockedBadges,
    lockedBadges
  } = expStats;

  const totalBadges = BADGES.length;
  const unlockedCount = unlockedBadges.length;

  const displayedBadges = BADGES.filter(b => {
    const isUnlocked = unlockedBadges.some(ub => ub.id === b.id);
    if (badgeFilter === 'unlocked') return isUnlocked;
    if (badgeFilter === 'locked') return !isUnlocked;
    return true;
  });

  // Credit gauge percentage (300 to 900 scale -> 0 to 100%)
  const creditGaugePct = Math.min(100, Math.max(0, Math.round(((creditScore - 300) / 600) * 100)));

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0e121c] border border-[#2b354e] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1f273b] bg-[#121624] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg"
              style={{ backgroundColor: currentLevel.bgGlow, border: `1px solid ${currentLevel.color}`, color: currentLevel.color }}
            >
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Academic Experience & Credit Citadel
                </h3>
                <span 
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: currentLevel.bgGlow, color: currentLevel.color, border: `1px solid ${currentLevel.color}40` }}
                >
                  Lv. {currentLevel.level} · {currentLevel.title}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Experience points earned through problem volume, rigor, deep focus, and credit score consistency
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#1a2133] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TOP DUAL CARDS: 1) LEVEL PROGRESSION & 2) ACADEMIC CREDIT SCORE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* CARD 1: LEVEL PROGRESSION */}
            <div className="bg-gradient-to-br from-[#121726] to-[#151c2e] p-5 rounded-2xl border border-indigo-500/30 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Experience Progression</span>
                  </span>
                  <span className="font-mono-code font-bold text-lg text-white">
                    {totalExp.toLocaleString()} <span className="text-xs text-indigo-300 font-sans">EXP</span>
                  </span>
                </div>

                <div className="my-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentLevel.color }} />
                      <span>Level {currentLevel.level}: {currentLevel.title}</span>
                    </span>
                    <span className="text-slate-400 font-mono-code text-[11px]">
                      {levelProgress}%
                    </span>
                  </div>

                  {/* Level Progress Bar */}
                  <div className="w-full bg-[#0a0d14] h-3 rounded-full p-0.5 border border-[#1f273d] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-500 via-sky-400 to-amber-400 shadow-sm"
                      style={{ width: `${levelProgress}%` }}
                    />
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 mt-3 bg-[#0d1017]/80 p-2.5 rounded-xl border border-[#1c2438]">
                  <span className="font-semibold text-amber-300 block mb-0.5">Unlocked Level Perk:</span>
                  <span>{currentLevel.perk}</span>
                </div>
              </div>

              {nextLevel && (
                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>Next Rank: <b className="text-white">{nextLevel.title}</b></span>
                  <span className="font-mono-code text-indigo-300">{expToNextLevel.toLocaleString()} EXP needed</span>
                </div>
              )}
            </div>

            {/* CARD 2: ACADEMIC CREDIT SCORE */}
            <div className="bg-gradient-to-br from-[#121624] to-[#1a1c22] p-5 rounded-2xl border border-amber-500/25 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>Academic Preparation Credit Score</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono-code font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    300 — 900 SCALE
                  </span>
                </div>

                <div className="flex items-center gap-4 my-2">
                  <div className="text-3xl sm:text-4xl font-extrabold font-mono-code" style={{ color: creditRatingColor }}>
                    {creditScore}
                  </div>
                  <div>
                    <span className="text-xs font-bold block text-white leading-tight">
                      {creditTier}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Based on consistency streak, L3 problem rigor, and error discipline
                    </span>
                  </div>
                </div>

                {/* Credit Gauge Meter */}
                <div className="w-full bg-[#0a0d14] h-2.5 rounded-full p-0.5 border border-[#232938] overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${creditGaugePct}%`,
                      backgroundColor: creditRatingColor
                    }}
                  />
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center text-[10px]">
                <div className="bg-[#0b0e14] p-1.5 rounded-lg border border-[#1e2434]">
                  <span className="text-slate-400 block">Streak Factor</span>
                  <span className="font-mono-code font-bold text-amber-400">+{Math.min(180, metrics.streakDays * 25)} pts</span>
                </div>
                <div className="bg-[#0b0e14] p-1.5 rounded-lg border border-[#1e2434]">
                  <span className="text-slate-400 block">L3 Rigor Ratio</span>
                  <span className="font-mono-code font-bold text-sky-400">
                    {metrics.totalQuestions > 0 ? Math.round((metrics.l3Questions / metrics.totalQuestions) * 100) : 0}% L3
                  </span>
                </div>
                <div className="bg-[#0b0e14] p-1.5 rounded-lg border border-[#1e2434]">
                  <span className="text-slate-400 block">Clean Sessions</span>
                  <span className="font-mono-code font-bold text-emerald-400">{metrics.cleanSessions} logged</span>
                </div>
              </div>
            </div>

          </div>

          {/* CUMULATIVE EXP CALCULATION BREAKDOWN GRID */}
          <div className="bg-[#0e121c] p-5 rounded-2xl border border-[#1f2638] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#1b2234]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-sky-400" />
                <span>Cumulative EXP Breakdown Engine</span>
              </h4>
              <span className="text-[11px] text-slate-400 font-mono-code">
                Every minute & question verified
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-[#121624] p-3 rounded-xl border border-[#1c2336]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">L1 Basic Questions</span>
                <div className="font-mono-code font-bold text-sky-400 text-sm mt-1">
                  +{breakdown.l1Exp.toLocaleString()} EXP
                </div>
                <span className="text-[10px] text-slate-500">{metrics.l1Questions} Qs × 10 XP</span>
              </div>

              <div className="bg-[#121624] p-3 rounded-xl border border-[#1c2336]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">L2 JEE Main Problems</span>
                <div className="font-mono-code font-bold text-emerald-400 text-sm mt-1">
                  +{breakdown.l2Exp.toLocaleString()} EXP
                </div>
                <span className="text-[10px] text-slate-500">{metrics.l2Questions} Qs × 25 XP</span>
              </div>

              <div className="bg-[#121624] p-3 rounded-xl border border-[#1c2336]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">L3 JEE Adv Rigor</span>
                <div className="font-mono-code font-bold text-amber-400 text-sm mt-1">
                  +{breakdown.l3Exp.toLocaleString()} EXP
                </div>
                <span className="text-[10px] text-slate-500">{metrics.l3Questions} Qs × 50 XP</span>
              </div>

              <div className="bg-[#121624] p-3 rounded-xl border border-[#1c2336]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Focused Time Spent</span>
                <div className="font-mono-code font-bold text-indigo-300 text-sm mt-1">
                  +{breakdown.timeExp.toLocaleString()} EXP
                </div>
                <span className="text-[10px] text-slate-500">{metrics.totalMinutes} Mins × 2 XP</span>
              </div>

              <div className="bg-[#121624] p-3 rounded-xl border border-[#1c2336]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Active Streak Bonus</span>
                <div className="font-mono-code font-bold text-orange-400 text-sm mt-1">
                  +{breakdown.streakExp.toLocaleString()} EXP
                </div>
                <span className="text-[10px] text-slate-500">{metrics.streakDays} Days × 100 XP</span>
              </div>

              <div className="bg-[#121624] p-3 rounded-xl border border-[#1c2336]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Centurion Flames Parked 🔥</span>
                <div className="font-mono-code font-bold text-red-400 text-sm mt-1">
                  +{breakdown.fireBlazeExp.toLocaleString()} EXP
                </div>
                <span className="text-[10px] text-slate-500">{metrics.centurionDays} Flames × 300 XP</span>
              </div>

              <div className="bg-[#121624] p-3 rounded-xl border border-[#1c2336]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Zero-Error Precision</span>
                <div className="font-mono-code font-bold text-teal-400 text-sm mt-1">
                  +{breakdown.cleanSessionExp.toLocaleString()} EXP
                </div>
                <span className="text-[10px] text-slate-500">{metrics.cleanSessions} Clean × 40 XP</span>
              </div>

              <div className="bg-[#121624] p-3 rounded-xl border border-[#1c2336]">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Banked Problems</span>
                <div className="font-mono-code font-bold text-purple-400 text-sm mt-1">
                  +{breakdown.bankedExp.toLocaleString()} EXP
                </div>
                <span className="text-[10px] text-slate-500">{metrics.bankedQuestionsCount} Problems × 40 XP</span>
              </div>
            </div>
          </div>

          {/* BADGES CITADEL SECTION */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2638]">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <span>Academic Milestones & Badges Citadel</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unlock prestigious badges by reaching consistency, question volume, and rigor milestones.
                </p>
              </div>

              {/* Filter Tabs & Unlocked Counter */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="flex items-center gap-1 bg-[#121624] p-1 rounded-xl border border-[#21293c]">
                  <button
                    onClick={() => setBadgeFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      badgeFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({totalBadges})
                  </button>
                  <button
                    onClick={() => setBadgeFilter('unlocked')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      badgeFilter === 'unlocked' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Unlocked ({unlockedCount})
                  </button>
                  <button
                    onClick={() => setBadgeFilter('locked')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      badgeFilter === 'locked' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Locked ({totalBadges - unlockedCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {displayedBadges.map(badge => {
                const isUnlocked = unlockedBadges.some(b => b.id === badge.id);
                const rarityColor = 
                  badge.rarity === 'Mythic' ? '#f43f5e' :
                  badge.rarity === 'Legendary' ? '#eab308' :
                  badge.rarity === 'Epic' ? '#a855f7' :
                  badge.rarity === 'Rare' ? '#38bdf8' : '#94a3b8';

                return (
                  <div
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center justify-between ${
                      isUnlocked
                        ? 'bg-gradient-to-b from-[#141a2a] to-[#101420] border-amber-500/40 shadow-md shadow-amber-500/10 hover:border-amber-400 hover:scale-[1.02]'
                        : 'bg-[#0d1017] border-[#1b2234] opacity-50 grayscale hover:opacity-75 hover:grayscale-0'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-2 relative"
                      style={{ 
                        backgroundColor: isUnlocked ? `${rarityColor}15` : '#121624',
                        border: `1px solid ${isUnlocked ? rarityColor : '#22293c'}`
                      }}
                    >
                      {badge.icon}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-xs text-white block leading-tight">
                        {badge.title}
                      </span>
                      <span 
                        className="text-[9px] font-bold uppercase tracking-wider block mt-1"
                        style={{ color: rarityColor }}
                      >
                        {badge.rarity}
                      </span>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/5 w-full flex items-center justify-center">
                      {isUnlocked ? (
                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ALL LEVELS ROADMAP PREVIEW ACCORDION */}
          <div className="bg-[#0e121c] p-5 rounded-2xl border border-[#1f2638] space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Full 11-Tier Aspirant Hierarchy Roadmap</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
              {LEVELS.map(lvl => {
                const isCurrent = lvl.level === currentLevel.level;
                const isCompleted = totalExp >= lvl.minExp;

                return (
                  <div
                    key={lvl.level}
                    className={`p-3 rounded-xl border flex items-center justify-between ${
                      isCurrent
                        ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm'
                        : isCompleted
                        ? 'bg-[#121624] border-emerald-500/30 text-slate-200'
                        : 'bg-[#0d1017] border-[#1c2336] text-slate-500 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span style={{ color: lvl.color }}>Lv. {lvl.level}</span>
                        <span>{lvl.title}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {lvl.minExp.toLocaleString()} EXP
                      </span>
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-500 text-white uppercase">
                          CURRENT
                        </span>
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* BADGE INSPECTION POPUP */}
      {selectedBadge && (
        <div 
          onClick={() => setSelectedBadge(null)}
          className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="bg-[#121624] border border-[#2c364e] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl relative animate-in fade-in zoom-in-95"
          >
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>

            <div className="text-4xl mb-3">{selectedBadge.icon}</div>
            <h4 className="text-lg font-bold text-white mb-1">{selectedBadge.title}</h4>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-3">
              {selectedBadge.rarity} · {selectedBadge.category.toUpperCase()}
            </span>

            <p className="text-xs text-slate-300 leading-relaxed bg-[#0d1017] p-3.5 rounded-xl border border-[#1e2538] mb-4">
              {selectedBadge.description}
            </p>

            <div className="text-xs font-semibold">
              {unlockedBadges.some(b => b.id === selectedBadge.id) ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Milestone Achieved & Badge In Possession
                </span>
              ) : (
                <span className="text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-4 h-4" /> Locked: Keep solving and practicing to unlock!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
