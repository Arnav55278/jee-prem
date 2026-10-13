'use client';

import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  LogIn, 
  UserPlus, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Cloud, 
  ShieldCheck, 
  Laptop, 
  Smartphone,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  FolderHeart
} from 'lucide-react';
import { AuthUserSession, UserFilePayload } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUserSession | null;
  savedPassword: string;
  onLoginSuccess: (user: AuthUserSession, password: string, userData: UserFilePayload) => void;
  onLogout: () => void;
  onSyncNow: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedTime: string | null;
}

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  savedPassword,
  onLoginSuccess,
  onLogout,
  onSyncNow,
  isSyncing,
  lastSyncedTime
}: AuthModalProps) {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [targetYear, setTargetYear] = useState('2026');
  const [targetRankGoal, setTargetRankGoal] = useState('AIR < 500 (IIT Bombay CSE)');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim()) {
      setErrorMsg('Please enter your username');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: tab,
          username: username.trim(),
          password: password.trim(),
          displayName: displayName.trim() || undefined,
          targetYear,
          targetRankGoal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccessMsg(
        tab === 'login' 
          ? `Welcome back, ${data.user.displayName}! Syncing your data...` 
          : `Account created for ${data.user.displayName}! Personal server file initialized.`
      );

      setTimeout(() => {
        onLoginSuccess(data.user, password.trim(), data.data);
        onClose();
      }, 700);

    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-[#0d1017] border border-[#22293c] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1b2234] bg-[#111622]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Personal Cloud Sync & Multi-Device Login
              </h2>
              <p className="text-[11px] text-slate-400">
                Log in to access your logs from any device, phone, or laptop.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2133] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {currentUser ? (
            /* Logged In State Screen */
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-slate-200">
                  <p className="font-semibold text-emerald-300">
                    Currently Logged In: <span className="font-mono text-white">{currentUser.displayName}</span>
                  </p>
                  <p className="text-slate-400 mt-1">
                    Username: <span className="font-mono text-indigo-300">@{currentUser.username}</span> · Server File: <span className="font-mono text-amber-300">data/users/{currentUser.username}.json</span>
                  </p>
                </div>
              </div>

              {/* Multi-device sync banner */}
              <div className="p-4 rounded-xl bg-[#141926] border border-[#222b40] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                    <Cloud className="w-4 h-4 text-indigo-400" />
                    Multi-Device Permanent Storage
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    CONNECTED
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-300 py-1">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Laptop className="w-4 h-4 text-slate-300" />
                    <span>Laptop/PC</span>
                  </div>
                  <span className="text-slate-600">⇄</span>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Smartphone className="w-4 h-4 text-slate-300" />
                    <span>Mobile/Tablet</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Your preparation records, questions, EXP progress, and notes are saved directly to your dedicated user file forever. Any edits you make sync automatically.
                </p>

                {lastSyncedTime && (
                  <p className="text-[10px] text-slate-400 font-mono">
                    Last synced to server file: {new Date(lastSyncedTime).toLocaleTimeString()} ({new Date(lastSyncedTime).toLocaleDateString()})
                  </p>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={onSyncNow}
                    disabled={isSyncing}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs transition-colors shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing with Server File...' : 'Force Sync to Server Now'}</span>
                  </button>
                </div>
              </div>

              <div className="border-t border-[#1b2234] pt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">Want to switch account or sign out?</span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login & Register Tabs */
            <div className="space-y-5">
              {/* Tabs Switcher */}
              <div className="flex rounded-xl bg-[#141926] p-1 border border-[#20283c]">
                <button
                  type="button"
                  onClick={() => { setTab('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    tab === 'login'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In to Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setTab('register'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition-all ${
                    tab === 'register'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create New Account</span>
                </button>
              </div>

              {/* Status messages */}
              {errorMsg && (
                <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-xs text-red-300 flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-start gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. aditya or jee_aspirant"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#141926] border border-[#22293c] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Your personal file will be saved forever as <span className="font-mono text-slate-400">data/users/{username.trim() || 'username'}.json</span>.
                  </p>
                </div>

                {/* Display Name (Only in Register) */}
                {tab === 'register' && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name / Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aditya Khari"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-2 bg-[#141926] border border-[#22293c] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                )}

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Password <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password (min 4 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-[#141926] border border-[#22293c] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Registration Optional Goal Fields */}
                {tab === 'register' && (
                  <div className="grid grid-cols-2 gap-3 pt-1 animate-fadeIn">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Target JEE Year
                      </label>
                      <input
                        type="text"
                        value={targetYear}
                        onChange={(e) => setTargetYear(e.target.value)}
                        placeholder="2026"
                        className="w-full px-2.5 py-1.5 bg-[#141926] border border-[#22293c] rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Target Rank Goal
                      </label>
                      <input
                        type="text"
                        value={targetRankGoal}
                        onChange={(e) => setTargetRankGoal(e.target.value)}
                        placeholder="AIR < 500 (IIT Bombay CSE)"
                        className="w-full px-2.5 py-1.5 bg-[#141926] border border-[#22293c] rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Multi-Device Guarantee Note */}
                <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2">
                  <FolderHeart className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <b>Multi-Device Sync:</b> Any device you open this app on (mobile, laptop, iPad), simply enter this username and password to load your complete question logs, streaks, and EXP.
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{tab === 'login' ? 'Authenticating...' : 'Creating User File...'}</span>
                    </>
                  ) : (
                    <>
                      {tab === 'login' ? <LogIn className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      <span>{tab === 'login' ? 'Log In & Load My Logs' : 'Create Account & Server File'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
