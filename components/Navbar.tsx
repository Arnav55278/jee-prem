'use client';

import React from 'react';
import { Flame, Shield, Sparkles, Mic, CheckCircle2, AlertCircle, Menu, X, BarChart3, Calendar, BookOpen, FileText, Cpu, Award, User, LogIn, Cloud } from 'lucide-react';
import { ExpStats } from '@/lib/exp-system';
import { AuthUserSession } from '@/lib/types';

interface NavbarProps {
  activeTab: 'workstation' | 'fire_calendar' | 'question_bank' | 'analytics' | 'reports';
  setActiveTab: (tab: 'workstation' | 'fire_calendar' | 'question_bank' | 'analytics' | 'reports') => void;
  onOpenAdmin: () => void;
  onOpenAi: () => void;
  onOpenExpBadges: () => void;
  onOpenAuth: () => void;
  currentUser: AuthUserSession | null;
  expStats: ExpStats;
  onToggleVoice: () => void;
  isVoiceActive: boolean;
  todaySolved: number;
  isSaved: boolean;
  onSave: () => void;
  currentStreak: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAdmin,
  onOpenAi,
  onOpenExpBadges,
  onOpenAuth,
  currentUser,
  expStats,
  onToggleVoice,
  isVoiceActive,
  todaySolved,
  isSaved,
  onSave,
  currentStreak
}: NavbarProps) {

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#0d1017]/90 backdrop-blur-md border-b border-[#1f2638] px-4 lg:px-6 py-3 transition-colors">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('workstation')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              Σ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white font-mono-code">KINETIC</span>
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">JEE</span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  AIR 1 LAB
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 hidden sm:block">Precision Analytics & Practice Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-[#131722] p-1 rounded-xl border border-[#232a3d]">
          <button
            onClick={() => setActiveTab('workstation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'workstation'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-[#1b2234]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Workstation</span>
          </button>

          <button
            onClick={() => setActiveTab('fire_calendar')}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'fire_calendar'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/30'
                : 'text-slate-300 hover:text-white hover:bg-[#1b2234]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Fire Calendar</span>
            {todaySolved >= 100 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('question_bank')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'question_bank'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-[#1b2234]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Questions & Entry</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-[#1b2234]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Real-time Charts</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-[#1b2234]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Custom Reports</span>
          </button>
        </nav>

        {/* Action Widgets on Right */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* EXP & Level & Credit Score Citadel Badge (Clickable) */}
          <button
            onClick={onOpenExpBadges}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all text-xs font-semibold group cursor-pointer shadow-sm"
            style={{
              backgroundColor: expStats.currentLevel.bgGlow,
              borderColor: `${expStats.currentLevel.color}50`,
              color: expStats.currentLevel.color
            }}
            title="Click to view EXP Progression, Level Perks & Badges Citadel"
          >
            <Award className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span className="font-mono-code font-bold">Lv.{expStats.currentLevel.level}</span>
            <span className="hidden xl:inline text-[11px] text-slate-300">· {expStats.totalExp.toLocaleString()} XP</span>
            <span 
              className="hidden 2xl:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-mono-code font-bold bg-black/40" 
              style={{ color: expStats.creditRatingColor }}
              title={`Academic Preparation Credit Score: ${expStats.creditScore}`}
            >
              Credit {expStats.creditScore}
            </span>
          </button>

          {/* Today's Target Indicator */}
          <div 
            onClick={() => setActiveTab('fire_calendar')}
            className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
              todaySolved >= 100 
                ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 hover:bg-orange-500/20' 
                : 'bg-[#141824] border-[#22293c] text-slate-300 hover:bg-[#1c2233]'
            }`}
            title="100 Qs Daily Target"
          >
            <div className="flex items-center">
              {todaySolved >= 100 ? (
                <span className="text-base animate-flame">🔥</span>
              ) : (
                <div className="w-2 h-2 rounded-full bg-amber-400 mr-1.5" />
              )}
              <span className="font-mono-code font-bold text-xs">{todaySolved}/100</span>
            </div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Qs</span>
          </div>

          {/* Voice Command Button */}
          <button
            onClick={onToggleVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
              isVoiceActive
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-[#141824] text-slate-300 border-[#22293c] hover:text-white hover:bg-[#1c2233]'
            }`}
            title="Voice Logging (Speak: Log 10 Physics L2)"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{isVoiceActive ? 'Listening...' : 'Voice'}</span>
          </button>

          {/* AI Mentor Button */}
          <button
            onClick={onOpenAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-pink-500/15 hover:from-indigo-500/25 hover:to-pink-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold shadow-sm transition-all"
            title="AI Academic Mentor & Derivation Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Mentor</span>
          </button>

          {/* Admin Panel Trigger (Ctrl + O) */}
          <button
            onClick={onOpenAdmin}
            className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1c2233] text-slate-300 hover:text-white border border-[#22293c] text-xs font-semibold transition-all"
            title="Open Admin Panel (Password: 4900 or Press Ctrl+O)"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden lg:inline">Admin</span>
            <kbd className="hidden xl:inline-block px-1.5 py-0.2 rounded text-[10px] font-mono-code bg-[#0b0e14] text-slate-400 border border-[#22293c]">
              Ctrl+O
            </kbd>
          </button>

          {/* Save Status & Quick Save Button */}
          <button
            onClick={onSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSaved
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-amber-500 text-slate-950 font-bold border border-amber-400 shadow-md shadow-amber-500/20 hover:bg-amber-400'
            }`}
          >
            {isSaved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* User Account & Multi-Device Sync Button */}
          <button
            onClick={onOpenAuth}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              currentUser
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 shadow-sm'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-indigo-400/50 shadow-md shadow-indigo-600/20'
            }`}
            title={currentUser ? `Logged in as @${currentUser.username} (Click to manage sync & device storage)` : "Log in to sync your logs across all devices forever"}
          >
            {currentUser ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-white text-[11px] truncate max-w-[90px] xl:max-w-[120px]">
                  @{currentUser.username}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </>
            )}
          </button>


          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg bg-[#141824] text-slate-300 border border-[#22293c]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-[#1f2638] flex flex-col gap-2">
          <button
            onClick={() => { setActiveTab('workstation'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'workstation' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-[#1b2234]'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Workstation</span>
          </button>
          <button
            onClick={() => { setActiveTab('fire_calendar'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'fire_calendar' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-[#1b2234]'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>🔥 Fire Calendar (100+ Q Streak)</span>
          </button>
          <button
            onClick={() => { setActiveTab('question_bank'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'question_bank' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-[#1b2234]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Question Bank & Entry</span>
          </button>
          <button
            onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-[#1b2234]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Real-time Charts & Coverage</span>
          </button>
          <button
            onClick={() => { setActiveTab('reports'); setMobileMenuOpen(false); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'reports' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-[#1b2234]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Custom Reports & Exports</span>
          </button>
          <button
            onClick={() => { onOpenExpBadges(); setMobileMenuOpen(false); }}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold bg-[#141b2c] text-amber-300 border border-amber-500/30"
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Lv.{expStats.currentLevel.level} {expStats.currentLevel.title} · Badges Citadel</span>
            </div>
            <span className="font-mono-code text-[11px] text-white">{expStats.totalExp.toLocaleString()} XP</span>
          </button>
          <div className="pt-2 border-t border-[#1f2638] flex items-center justify-between">
            <span className="text-xs text-slate-400">Current Streak: <b className="text-orange-400">{currentStreak} Days 🔥</b></span>
            <button
              onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
              className="text-xs text-amber-400 font-semibold underline"
            >
              Admin Panel (4900)
            </button>
          </div>
          <button
            onClick={() => { onOpenAuth(); setMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold"
          >
            <User className="w-3.5 h-3.5" />
            <span>{currentUser ? `Account: @${currentUser.username} (Connected)` : 'Log In / Register (Multi-Device Sync)'}</span>
          </button>
        </div>

      )}
    </header>
  );
}
