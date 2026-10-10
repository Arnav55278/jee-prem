'use client';

import React, { useState } from 'react';
import { 
  Shield, Lock, Users, BookOpen, Bell, Database, Trash2, 
  CheckCircle2, AlertTriangle, RefreshCw, Download, Upload, 
  Activity, ArrowRight, UserCheck, Flame, X, PlusCircle
} from 'lucide-react';
import { StudentProfile, StudentActivityLog, QuestionBankItem, AnnouncementItem, SubjectKey } from '@/lib/types';
import { CH, SUBJECT_CONFIG } from '@/lib/syllabus-data';
import confetti from 'canvas-confetti';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: StudentProfile[];
  activityLogs: StudentActivityLog[];
  questions: QuestionBankItem[];
  announcements: AnnouncementItem[];
  onAddAnnouncement: (a: AnnouncementItem) => void;
  onDeleteQuestion: (id: string) => void;
  onSeedDemoData: () => void;
  onClearAllData: () => void;
}

export default function AdminPanelModal({
  isOpen,
  onClose,
  students,
  activityLogs,
  questions,
  announcements,
  onAddAnnouncement,
  onDeleteQuestion,
  onSeedDemoData,
  onClearAllData
}: AdminPanelModalProps) {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Admin Sub-Tabs
  const [adminTab, setAdminTab] = useState<'monitoring' | 'content' | 'announcements' | 'system'>('monitoring');

  // Announcement Form State
  const [newAnnTitle, setNewAnnTitle] = useState('');
  const [newAnnContent, setNewAnnContent] = useState('');
  const [newAnnTag, setNewAnnTag] = useState<'High Yield' | 'Revision Strategy' | 'Exam Alert'>('High Yield');

  // Student Filter
  const [studentFilter, setStudentFilter] = useState<string>('all');

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === '4900') {
      setIsAuthenticated(true);
      setAuthError(false);
      setPasswordInput('');
      confetti({ particleCount: 50, spread: 60 });
    } else {
      setAuthError(true);
    }
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnTitle.trim() || !newAnnContent.trim()) return;

    const ann: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      title: newAnnTitle.trim(),
      content: newAnnContent.trim(),
      tag: newAnnTag,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      author: 'Admin Workstation'
    };

    onAddAnnouncement(ann);
    setNewAnnTitle('');
    setNewAnnContent('');
    confetti({ particleCount: 40, spread: 50 });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0e121c] border border-[#2b354e] rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#1f273b] bg-[#121624] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  KINETIC Administration & Monitoring Terminal
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  SECURE ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authorized supervision of student telemetry, content distribution, and audit logs.
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

        {/* STEP 1: PASSWORD GATEWAY IF NOT AUTHENTICATED */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-amber-500/10">
              <Lock className="w-7 h-7" />
            </div>

            <h4 className="text-lg font-bold text-white mb-1.5">Admin Security Verification</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              This panel is locked. Please enter the administrator security passcode (<b className="text-amber-400 font-mono-code">4900</b>) to access student telemetry and content management.
            </p>

            <form onSubmit={handlePasswordSubmit} className="w-full space-y-3">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter Passcode (4900)"
                  value={passwordInput}
                  onChange={e => { setPasswordInput(e.target.value); setAuthError(false); }}
                  autoFocus
                  className={`w-full bg-[#131724] border rounded-xl px-4 py-3 text-center font-mono-code text-lg text-white tracking-widest outline-none transition-colors ${
                    authError ? 'border-red-500 text-red-300' : 'border-[#242d44] focus:border-indigo-500'
                  }`}
                />
              </div>

              {authError && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-red-400 font-semibold animate-shake">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Invalid passcode. Enter 4900 to proceed.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md shadow-amber-500/20"
              >
                Authenticate & Unlock Panel
              </button>
            </form>
          </div>
        ) : (
          /* STEP 2: AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Sub-Tabs Navigation */}
            <div className="px-5 pt-3 border-b border-[#1f273b] bg-[#101420] flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setAdminTab('monitoring')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
                  adminTab === 'monitoring'
                    ? 'border-indigo-500 text-white bg-[#141928]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Student Monitoring & Audit Feed</span>
              </button>

              <button
                onClick={() => setAdminTab('content')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
                  adminTab === 'content'
                    ? 'border-indigo-500 text-white bg-[#141928]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Content & Question Bank ({questions.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('announcements')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
                  adminTab === 'announcements'
                    ? 'border-indigo-500 text-white bg-[#141928]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Announcements & Advisories ({announcements.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('system')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${
                  adminTab === 'system'
                    ? 'border-indigo-500 text-white bg-[#141928]'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>System Operations & Seeding</span>
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              
              {/* TAB 1: USER ACTIVITY MONITORING */}
              {adminTab === 'monitoring' && (
                <div className="space-y-6">
                  
                  {/* Active Students Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Personal Preparation Telemetry</span>
                      </h4>
                      <span className="text-xs text-slate-500">Aditya Khari (Personal Profile)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {students.map(s => (
                        <div
                          key={s.id}
                          className="bg-[#121624] p-4 rounded-xl border border-[#20273b] space-y-2 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-white truncate">{s.name}</span>
                              <span className={`w-2 h-2 rounded-full ${s.activeNow ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                            </div>
                            <span className="text-[10px] text-slate-400 block font-mono-code">{s.rollNo}</span>
                            <span className="text-[11px] text-indigo-300 font-semibold block mt-1">{s.targetRankGoal}</span>
                          </div>

                          <div className="pt-2 border-t border-[#1c2336] grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-[10px] text-slate-500 block">Total Qs:</span>
                              <span className="font-mono-code font-bold text-slate-200">{s.totalQuestions.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block">Streak:</span>
                              <span className="font-mono-code font-bold text-orange-400 flex items-center gap-0.5">
                                <Flame className="w-3 h-3" /> {s.streakDays}d
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-Time Live Activity Feed */}
                  <div className="bg-[#121624] p-5 rounded-xl border border-[#20273b]">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Live Aspirant Audit Feed</span>
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Timestamped record of problems logged and objectives achieved</p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        AUDIT LOG
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {activityLogs.map(log => (
                        <div
                          key={log.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-[#0e121c] border border-[#1b2234] text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                              {log.studentName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-200">{log.studentName}</span>
                                <span className="text-[11px] text-slate-400">• {log.action}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono-code text-[10px] text-slate-500">{log.timestamp}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: CONTENT & QUESTION BANK MANAGEMENT */}
              {adminTab === 'content' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Question Bank Registry ({questions.length} Items)
                      </h4>
                      <p className="text-[11px] text-slate-500">Supervise, inspect, or remove archived problems from the database.</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {questions.map(q => (
                      <div
                        key={q.id}
                        className="p-3.5 rounded-xl bg-[#121624] border border-[#20273b] flex items-center justify-between text-xs"
                      >
                        <div className="space-y-1 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                              {q.subject.toUpperCase()}
                            </span>
                            <span className="font-bold text-white">{q.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono-code">({q.chapter})</span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-1">{q.questionText}</p>
                          <div className="text-[10px] text-slate-500">Source: {q.sourceExam} · Added: {q.dateAdded}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onDeleteQuestion(q.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                            title="Delete Problem"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ANNOUNCEMENTS MANAGEMENT */}
              {adminTab === 'announcements' && (
                <div className="space-y-6">
                  {/* Create Announcement Form */}
                  <form onSubmit={handleCreateAnnouncement} className="bg-[#121624] p-5 rounded-xl border border-[#20273b] space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Publish Strategic Announcement / Exam Alert
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Title</label>
                        <input
                          type="text"
                          placeholder="e.g. High-Yield Focus on Rotational Dynamics"
                          value={newAnnTitle}
                          onChange={e => setNewAnnTitle(e.target.value)}
                          className="w-full bg-[#0d1017] border border-[#1f273b] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tag Category</label>
                        <select
                          value={newAnnTag}
                          onChange={e => setNewAnnTag(e.target.value as any)}
                          className="w-full bg-[#0d1017] border border-[#1f273b] rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                        >
                          <option value="High Yield">High Yield</option>
                          <option value="Revision Strategy">Revision Strategy</option>
                          <option value="Exam Alert">Exam Alert</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Announcement Body</label>
                      <textarea
                        rows={2}
                        placeholder="State strategic insights, formula emphasis, or revision alerts..."
                        value={newAnnContent}
                        onChange={e => setNewAnnContent(e.target.value)}
                        className="w-full bg-[#0d1017] border border-[#1f273b] rounded-lg p-3 text-xs text-white outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Broadcast Announcement</span>
                      </button>
                    </div>
                  </form>

                  {/* Existing Announcements List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Active Bulletins ({announcements.length})
                    </h4>
                    {announcements.map(a => (
                      <div
                        key={a.id}
                        className="p-4 rounded-xl bg-[#121624] border border-[#20273b] space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{a.title}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            {a.tag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-[#1c2336] text-[10px] text-slate-500">
                          <span>Author: {a.author}</span>
                          <span>{a.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PERSONAL DATA CONTROLS */}
              {adminTab === 'system' && (
                <div className="space-y-6">
                  <div className="bg-[#121624] p-5 rounded-xl border border-[#20273b] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Personal Workstation Storage & Reset Controls
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All practice data is exclusively yours, stored locally and securely in your browser. Every question and daily practice record entered here tracks your personal journey toward IIT Bombay.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => {
                          if (confirm("Reset all logged practice records to a clean 0-state?")) {
                            onClearAllData();
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-semibold text-xs flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset All Logged Records</span>
                      </button>
                    </div>
                  </div>

                  {/* System Health Telemetry */}
                  <div className="bg-[#121624] p-5 rounded-xl border border-[#20273b] space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Workstation Environment Diagnostics
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1b2234]">
                        <span className="text-slate-500 block text-[10px]">Admin Access:</span>
                        <span className="font-bold text-emerald-400">Authenticated (4900)</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1b2234]">
                        <span className="text-slate-500 block text-[10px]">Syllabus Registry:</span>
                        <span className="font-bold text-slate-200">94 Core Chapters</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1b2234]">
                        <span className="text-slate-500 block text-[10px]">Client Storage:</span>
                        <span className="font-bold text-sky-400">LocalStorage Active</span>
                      </div>
                      <div className="p-3 rounded-lg bg-[#0d1017] border border-[#1b2234]">
                        <span className="text-slate-500 block text-[10px]">AI Model:</span>
                        <span className="font-bold text-purple-400">Gemini 2.5 Flash</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
