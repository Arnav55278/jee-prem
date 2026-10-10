export type SubjectKey = 'phy' | 'che' | 'mat';
export type QuestionLevel = 'l1' | 'l2' | 'l3';
export type DiagnosticError = '' | 'Calculation' | 'Formula' | 'Concept' | 'Silly';
export type ChapterStatus = '' | 'status-weak' | 'status-practice' | 'status-strong';

export interface SubjectDayData {
  l1: number;
  l2: number;
  l3: number;
  time: number; // in minutes
  mistake: DiagnosticError;
  concept: string;
  c: Record<string, ChapterStatus>; // chapter name -> status
}

export interface DayRecord {
  reflection: string;
  missions: [boolean, boolean, boolean];
  phy: SubjectDayData;
  che: SubjectDayData;
  mat: SubjectDayData;
}

export interface QuestionBankItem {
  id: string;
  subject: SubjectKey;
  chapter: string;
  tier: 'L1' | 'L2' | 'L3' | 'JEE_MAIN' | 'JEE_ADVANCED';
  title: string;
  questionText: string;
  options?: string[]; // for MCQs [A, B, C, D]
  correctAnswer: string;
  solutionExplanation: string;
  sourceExam: string;
  tags: string[];
  status: 'unsolved' | 'solved' | 'starred' | 'review_needed';
  dateAdded: string;
  difficultyRating: number; // 1-5
}

export interface StudentActivityLog {
  id: string;
  studentName: string;
  action: string;
  subject?: SubjectKey;
  details: string;
  timestamp: string;
  type: 'log_questions' | 'solve_problem' | 'mission_complete' | 'pomodoro' | 'note';
}

export interface StudentProfile {
  id: string;
  name: string;
  rollNo: string;
  targetYear: string;
  targetRankGoal: string;
  totalQuestions: number;
  streakDays: number;
  accuracyRate: number;
  activeNow: boolean;
  lastActive: string;
  preferredSubject: SubjectKey;
}

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  date: string;
  tag: 'Exam Alert' | 'Revision Strategy' | 'High Yield';
  author: string;
}
