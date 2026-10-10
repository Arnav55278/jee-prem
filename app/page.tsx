'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import Navbar from '@/components/Navbar';
import Workstation from '@/components/Workstation';
import FireCalendar from '@/components/FireCalendar';
import QuestionEntryBank from '@/components/QuestionEntryBank';
import AnalyticsVisualizer from '@/components/AnalyticsVisualizer';
import CustomReportGenerator from '@/components/CustomReportGenerator';
import AdminPanelModal from '@/components/AdminPanelModal';
import AiMentorModal from '@/components/AiMentorModal';
import WorkstationSkeleton from '@/components/WorkstationSkeleton';
import { 
  DayRecord, SubjectKey, QuestionLevel, QuestionBankItem, 
  StudentProfile, StudentActivityLog, AnnouncementItem, SubjectDayData 
} from '@/lib/types';
import { 
  getSeedPracticeDatabase, INITIAL_QUESTIONS, INITIAL_STUDENTS, 
  INITIAL_ACTIVITY_LOGS, INITIAL_ANNOUNCEMENTS 
} from '@/lib/syllabus-data';
import confetti from 'canvas-confetti';

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export default function HomePage() {
  const isMounted = useIsMounted();
  const todayKey = new Date().toISOString().slice(0, 10);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'workstation' | 'fire_calendar' | 'question_bank' | 'analytics' | 'reports'>('workstation');

  // Currently inspected date in workstation
  const [currentDateKey, setCurrentDateKey] = useState<string>(todayKey);

  // Persistence State with Lazy Initializer - Clean Personal Data for Aditya Khari
  const [records, setRecords] = useState<Record<string, DayRecord>>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('kinetic_jee_records_v1'); // Purge legacy fake seed data
        const stored = localStorage.getItem('kinetic_jee_personal_records');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  const [questions, setQuestions] = useState<QuestionBankItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('kinetic_jee_questions_v1'); // Purge legacy mock questions
        const stored = localStorage.getItem('kinetic_jee_personal_questions');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [activityLogs, setActivityLogs] = useState<StudentActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('kinetic_jee_ann_v1');
        const stored = localStorage.getItem('kinetic_jee_personal_ann');
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAiOpen, setIsAiOpen] = useState<boolean>(false);
  const [targetQuestionForAi, setTargetQuestionForAi] = useState<QuestionBankItem | null>(null);

  // Voice Logging State
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Global Keyboard Listener for Ctrl + O (or Cmd + O) to open Admin Panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'o' || e.key === 'O')) {
        e.preventDefault();
        setIsAdminOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save changes to localStorage
  const handleSave = useCallback(() => {
    try {
      localStorage.setItem('kinetic_jee_personal_records', JSON.stringify(records));
      localStorage.setItem('kinetic_jee_personal_questions', JSON.stringify(questions));
      localStorage.setItem('kinetic_jee_personal_ann', JSON.stringify(announcements));
      setIsSaved(true);
      showToast('Record saved and synced to workstation storage.', 'success');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
      showToast('Error saving data to browser storage.', 'error');
    }
  }, [records, questions, announcements]);

  // Update a subject in the currently inspected date
  const handleUpdateSubject = useCallback((sub: SubjectKey, data: Partial<SubjectDayData>) => {
    setRecords(prev => {
      const existing = prev[currentDateKey] || {
        reflection: '',
        missions: [false, false, false],
        phy: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        che: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        mat: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} }
      };

      const nextDay = {
        ...existing,
        [sub]: {
          ...existing[sub],
          ...data
        }
      };

      return {
        ...prev,
        [currentDateKey]: nextDay
      };
    });
    setIsSaved(false);
  }, [currentDateKey]);

  // Update qualitative reflection note
  const handleUpdateReflection = useCallback((text: string) => {
    setRecords(prev => {
      const existing = prev[currentDateKey] || {
        reflection: '',
        missions: [false, false, false],
        phy: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        che: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        mat: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} }
      };

      return {
        ...prev,
        [currentDateKey]: {
          ...existing,
          reflection: text
        }
      };
    });
    setIsSaved(false);
  }, [currentDateKey]);

  // Toggle mission completion
  const handleToggleMission = useCallback((index: number) => {
    setRecords(prev => {
      const existing = prev[currentDateKey] || {
        reflection: '',
        missions: [false, false, false],
        phy: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        che: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        mat: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} }
      };

      const newMissions = [...existing.missions] as [boolean, boolean, boolean];
      newMissions[index] = !newMissions[index];

      return {
        ...prev,
        [currentDateKey]: {
          ...existing,
          missions: newMissions
        }
      };
    });
    setIsSaved(false);
  }, [currentDateKey]);

  // Quick log helper (+5 Qs)
  const handleTriggerQuickLog = useCallback((sub: SubjectKey, level: QuestionLevel, amount: number) => {
    setRecords(prev => {
      const existing = prev[currentDateKey] || {
        reflection: '',
        missions: [false, false, false],
        phy: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        che: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        mat: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} }
      };

      const currentVal = existing[sub][level] || 0;
      const nextDay = {
        ...existing,
        [sub]: {
          ...existing[sub],
          [level]: currentVal + amount
        }
      };

      return {
        ...prev,
        [currentDateKey]: nextDay
      };
    });
    setIsSaved(false);
    showToast(`Quick Logged: +${amount} questions in ${sub.toUpperCase()} ${level.toUpperCase()}`, 'info');
  }, [currentDateKey]);

  // Quick add questions from calendar modal
  const handleCalendarQuickAdd = useCallback((dateKey: string, count: number) => {
    setRecords(prev => {
      const existing = prev[dateKey] || {
        reflection: '',
        missions: [false, false, false],
        phy: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        che: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} },
        mat: { l1: 0, l2: 0, l3: 0, time: 0, mistake: '' as any, concept: '', c: {} }
      };

      const phyAdd = Math.floor(count * 0.4);
      const cheAdd = Math.floor(count * 0.35);
      const matAdd = count - phyAdd - cheAdd;

      return {
        ...prev,
        [dateKey]: {
          ...existing,
          phy: { ...existing.phy, l2: (existing.phy.l2 || 0) + phyAdd },
          che: { ...existing.che, l2: (existing.che.l2 || 0) + cheAdd },
          mat: { ...existing.mat, l2: (existing.mat.l2 || 0) + matAdd }
        }
      };
    });
    setIsSaved(false);
    showToast(`Added +${count} questions to ${dateKey}`, 'success');
  }, []);

  // Add Question to Question Bank & optionally increment practice
  const handleAddQuestion = useCallback((q: QuestionBankItem, incrementTodayPractice = true) => {
    setQuestions(prev => [q, ...prev]);

    if (incrementTodayPractice) {
      handleTriggerQuickLog(q.subject, 'l3', 1);
    }

    // Add activity log
    const newLog: StudentActivityLog = {
      id: `act-${Date.now()}`,
      studentName: 'Aditya Khari',
      action: 'Entered Problem',
      subject: q.subject,
      details: `Authored: "${q.title}" in ${q.chapter}`,
      timestamp: 'Just now',
      type: 'solve_problem'
    };
    setActivityLogs(prev => [newLog, ...prev]);

    setIsSaved(false);
    showToast('Question successfully banked and tagged.', 'success');
  }, [handleTriggerQuickLog]);

  // Update Question Status (solved / starred / unsolved)
  const handleUpdateQuestionStatus = useCallback((id: string, status: QuestionBankItem['status']) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, status } : q));
    setIsSaved(false);
    showToast(`Question marked as ${status}`, 'info');
  }, []);

  // Delete Question
  const handleDeleteQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
    setIsSaved(false);
    showToast('Question removed from repository.', 'info');
  }, []);

  // Add Announcement (Admin)
  const handleAddAnnouncement = useCallback((a: AnnouncementItem) => {
    setAnnouncements(prev => [a, ...prev]);
    setIsSaved(false);
    showToast('Announcement broadcasted across workstation.', 'success');
  }, []);

  // Seed / Reset helper
  const handleSeedDemoData = useCallback(() => {
    setRecords({});
    setIsSaved(true);
    showToast('Workstation is in clean personal state.', 'info');
  }, []);

  // Clear all data (Admin)
  const handleClearAllData = useCallback(() => {
    setRecords({});
    setQuestions([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kinetic_jee_personal_records');
      localStorage.removeItem('kinetic_jee_personal_questions');
      localStorage.removeItem('kinetic_jee_records_v1');
      localStorage.removeItem('kinetic_jee_questions_v1');
    }
    setIsSaved(true);
    showToast('All practice records reset to clean zero.', 'info');
  }, []);

  // Voice Command Logger
  const handleToggleVoice = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice logging requires Google Chrome or Chromium browser.', 'error');
      return;
    }

    if (isVoiceActive) {
      setIsVoiceActive(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsVoiceActive(true);
        showToast('Listening... Speak: "Log 10 Physics L2" or "Maths 15 questions"', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        showToast(`Heard: "${transcript}"`, 'info');

        // Regex parse: subject and count
        let subject: SubjectKey = 'phy';
        if (transcript.includes('chem') || transcript.includes('chemistry')) subject = 'che';
        else if (transcript.includes('math') || transcript.includes('mathematics')) subject = 'mat';

        const matchNum = transcript.match(/\d+/);
        const amount = matchNum ? parseInt(matchNum[0], 10) : 5;

        let level: QuestionLevel = 'l2';
        if (transcript.includes('advanced') || transcript.includes('l3')) level = 'l3';
        else if (transcript.includes('basic') || transcript.includes('l1')) level = 'l1';

        handleTriggerQuickLog(subject, level, amount);
        confetti({ particleCount: 30, spread: 50 });
      };

      recognition.onerror = () => {
        setIsVoiceActive(false);
      };

      recognition.onend = () => {
        setIsVoiceActive(false);
      };

      recognition.start();
    } catch (e) {
      setIsVoiceActive(false);
      showToast('Failed to start microphone listener.', 'error');
    }
  }, [isVoiceActive, handleTriggerQuickLog]);

  // Compute Today's Solved Qs
  const todayRecord = records[todayKey];
  const todaySolved = todayRecord
    ? ((todayRecord.phy?.l1 || 0) + (todayRecord.phy?.l2 || 0) + (todayRecord.phy?.l3 || 0)) +
      ((todayRecord.che?.l1 || 0) + (todayRecord.che?.l2 || 0) + (todayRecord.che?.l3 || 0)) +
      ((todayRecord.mat?.l1 || 0) + (todayRecord.mat?.l2 || 0) + (todayRecord.mat?.l3 || 0))
    : 0;

  // Streak Calculation
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

  const totalQuestionsAllTime = Object.values(records).reduce((sum, rec) => {
    return sum +
      ((rec.phy?.l1 || 0) + (rec.phy?.l2 || 0) + (rec.phy?.l3 || 0)) +
      ((rec.che?.l1 || 0) + (rec.che?.l2 || 0) + (rec.che?.l3 || 0)) +
      ((rec.mat?.l1 || 0) + (rec.mat?.l2 || 0) + (rec.mat?.l3 || 0));
  }, 0);

  const personalStudentsList: StudentProfile[] = [
    {
      id: 'stu-aditya',
      name: 'Aditya Khari (You)',
      rollNo: 'JEE-2026-ASPIRANT',
      targetYear: '2026',
      targetRankGoal: 'AIR < 500 (IIT Bombay CSE)',
      totalQuestions: totalQuestionsAllTime,
      streakDays: calculateStreak(),
      accuracyRate: 100,
      activeNow: true,
      lastActive: 'Active Now',
      preferredSubject: 'phy'
    }
  ];

  if (!isMounted) {
    return <WorkstationSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#090b10] text-[#f1f3f9] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* GLOBAL NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAi={() => { setTargetQuestionForAi(null); setIsAiOpen(true); }}
        onToggleVoice={handleToggleVoice}
        isVoiceActive={isVoiceActive}
        todaySolved={todaySolved}
        isSaved={isSaved}
        onSave={handleSave}
        currentStreak={calculateStreak()}
      />

      {/* ANNOUNCEMENT TICKER IF AVAILABLE */}
      {announcements.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-[#0e121c] border-b border-[#1f273b] px-4 py-2 text-xs">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider flex-shrink-0">
                {announcements[0].tag}
              </span>
              <span className="text-slate-300 font-medium truncate">
                <b>{announcements[0].title}:</b> {announcements[0].content}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold whitespace-nowrap flex-shrink-0"
            >
              View Full Strategy ↗
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* VIEW 1: WORKSTATION */}
        {activeTab === 'workstation' && (
          <Workstation
            currentDateKey={currentDateKey}
            records={records}
            onUpdateSubject={handleUpdateSubject}
            onUpdateReflection={handleUpdateReflection}
            onSelectDate={k => setCurrentDateKey(k)}
            onToggleMission={handleToggleMission}
            onOpenAi={() => { setTargetQuestionForAi(null); setIsAiOpen(true); }}
            onTriggerQuickLog={handleTriggerQuickLog}
          />
        )}

        {/* VIEW 2: BIG FIRE CALENDAR */}
        {activeTab === 'fire_calendar' && (
          <FireCalendar
            records={records}
            onSelectDate={k => {
              setCurrentDateKey(k);
              setActiveTab('workstation');
            }}
            onQuickAddQuestions={handleCalendarQuickAdd}
          />
        )}

        {/* VIEW 3: QUESTION BANK & ENTRY */}
        {activeTab === 'question_bank' && (
          <QuestionEntryBank
            questions={questions}
            onAddQuestion={handleAddQuestion}
            onUpdateQuestionStatus={handleUpdateQuestionStatus}
            onDeleteQuestion={handleDeleteQuestion}
            onOpenAiForQuestion={q => {
              setTargetQuestionForAi(q);
              setIsAiOpen(true);
            }}
          />
        )}

        {/* VIEW 4: REAL-TIME CHARTS & VISUALIZATIONS */}
        {activeTab === 'analytics' && (
          <AnalyticsVisualizer records={records} />
        )}

        {/* VIEW 5: CUSTOM REPORTS */}
        {activeTab === 'reports' && (
          <CustomReportGenerator records={records} />
        )}

      </main>

      {/* TOAST POPUP */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-200 ${
          toastMsg.type === 'success'
            ? 'bg-[#101918] border-emerald-500/40 text-emerald-300'
            : toastMsg.type === 'error'
            ? 'bg-[#1a1114] border-red-500/40 text-red-300'
            : 'bg-[#131724] border-indigo-500/40 text-indigo-300'
        }`}>
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* ADMIN PANEL MODAL (Triggered by Ctrl+O or Password 4900) */}
      <AdminPanelModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        students={personalStudentsList}
        activityLogs={activityLogs}
        questions={questions}
        announcements={announcements}
        onAddAnnouncement={handleAddAnnouncement}
        onDeleteQuestion={handleDeleteQuestion}
        onSeedDemoData={handleSeedDemoData}
        onClearAllData={handleClearAllData}
      />

      {/* AI ACADEMIC MENTOR MODAL */}
      <AiMentorModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        targetQuestion={targetQuestionForAi}
        studentContext={{
          todaySolved,
          currentStreak: calculateStreak(),
          targetExam: 'JEE Advanced 2026',
          targetBranch: 'IIT Bombay Computer Science'
        }}
      />

    </div>
  );
}
