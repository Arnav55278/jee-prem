'use client';

import React, { useState } from 'react';
import { 
  PlusCircle, BookOpen, Search, Filter, CheckCircle2, Star, 
  HelpCircle, Eye, EyeOff, Tag, Sparkles, Trash2, ArrowUpRight, Award, Zap
} from 'lucide-react';
import { QuestionBankItem, SubjectKey } from '@/lib/types';
import { CH, SUBJECT_CONFIG } from '@/lib/syllabus-data';
import confetti from 'canvas-confetti';

interface QuestionEntryBankProps {
  questions: QuestionBankItem[];
  onAddQuestion: (q: QuestionBankItem, incrementTodayPractice?: boolean) => void;
  onUpdateQuestionStatus: (id: string, status: QuestionBankItem['status']) => void;
  onDeleteQuestion?: (id: string) => void;
  onOpenAiForQuestion?: (q: QuestionBankItem) => void;
}

export default function QuestionEntryBank({
  questions,
  onAddQuestion,
  onUpdateQuestionStatus,
  onDeleteQuestion,
  onOpenAiForQuestion
}: QuestionEntryBankProps) {
  // Active Tab: Bank or Entry
  const [activeSubTab, setActiveSubTab] = useState<'bank' | 'entry'>('bank');

  // Filter States
  const [subjectFilter, setSubjectFilter] = useState<'all' | SubjectKey>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unsolved' | 'solved' | 'starred'>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Question for Modal / View
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  // Form State for Adding New Question
  const [formData, setFormData] = useState({
    subject: 'phy' as SubjectKey,
    chapter: CH.phy[0],
    tier: 'JEE_ADVANCED' as QuestionBankItem['tier'],
    title: '',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    solutionExplanation: '',
    sourceExam: 'JEE Advanced High-Yield Practice',
    tags: 'Mechanics, Advanced',
    difficultyRating: 4,
    incrementPractice: true
  });

  const handleSubjectChange = (sub: SubjectKey) => {
    setFormData(prev => ({
      ...prev,
      subject: sub,
      chapter: CH[sub][0]
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.questionText.trim()) {
      alert('Please enter a Question Title and Problem Statement.');
      return;
    }

    const newQuestion: QuestionBankItem = {
      id: `q-${formData.subject}-${Date.now()}`,
      subject: formData.subject,
      chapter: formData.chapter,
      tier: formData.tier,
      title: formData.title.trim(),
      questionText: formData.questionText.trim(),
      options: [
        `A) ${formData.optionA || 'Option A'}`,
        `B) ${formData.optionB || 'Option B'}`,
        `C) ${formData.optionC || 'Option C'}`,
        `D) ${formData.optionD || 'Option D'}`
      ],
      correctAnswer: formData.correctAnswer,
      solutionExplanation: formData.solutionExplanation.trim() || 'Step-by-step mathematical reasoning verified.',
      sourceExam: formData.sourceExam.trim() || 'Custom Self-Entered Problem',
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      status: 'unsolved',
      dateAdded: new Date().toISOString().slice(0, 10),
      difficultyRating: Number(formData.difficultyRating) || 3
    };

    onAddQuestion(newQuestion, formData.incrementPractice);
    confetti({ particleCount: 60, spread: 60 });

    // Reset Form
    setFormData({
      subject: 'phy',
      chapter: CH.phy[0],
      tier: 'JEE_ADVANCED',
      title: '',
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      solutionExplanation: '',
      sourceExam: 'JEE Advanced High-Yield Practice',
      tags: 'Mechanics, Advanced',
      difficultyRating: 4,
      incrementPractice: true
    });

    setActiveSubTab('bank');
  };

  const toggleSolutionReveal = (id: string) => {
    setRevealedSolutions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAnswer = (qId: string, optLetter: string, correctLetter: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qId]: optLetter }));
    if (optLetter === correctLetter) {
      onUpdateQuestionStatus(qId, 'solved');
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    if (subjectFilter !== 'all' && q.subject !== subjectFilter) return false;
    if (statusFilter !== 'all' && q.status !== statusFilter) return false;
    if (tierFilter !== 'all' && q.tier !== tierFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(query);
      const matchText = q.questionText.toLowerCase().includes(query);
      const matchChapter = q.chapter.toLowerCase().includes(query);
      const matchTags = q.tags.some(t => t.toLowerCase().includes(query));
      if (!matchTitle && !matchText && !matchChapter && !matchTags) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header and Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d1017] p-5 rounded-2xl border border-[#1f2638]">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-400" />
            <span>Question Bank & Problem Entry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Store, enter, tag, and practice real JEE Main & Advanced problems with full solutions.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#121624] p-1.5 rounded-xl border border-[#21293c]">
          <button
            onClick={() => setActiveSubTab('bank')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'bank'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Question Bank ({questions.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('entry')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'entry'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Enter New Problem</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: QUESTION BANK LIST */}
      {activeSubTab === 'bank' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-[#0e121c] p-4 rounded-xl border border-[#1f273b] flex flex-wrap items-center justify-between gap-3 text-xs">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search question, chapter, topic tag, or source..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#131724] border border-[#20273b] rounded-lg pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            {/* Subject Filter */}
            <div className="flex items-center gap-1 bg-[#131724] p-1 rounded-lg border border-[#20273b]">
              <button
                onClick={() => setSubjectFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold ${
                  subjectFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              {(['phy', 'che', 'mat'] as SubjectKey[]).map(sub => (
                <button
                  key={sub}
                  onClick={() => setSubjectFilter(sub)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold uppercase ${
                    subjectFilter === sub ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-[#131724] border border-[#20273b] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none"
            >
              <option value="all">Status: All</option>
              <option value="unsolved">Unsolved</option>
              <option value="solved">Solved ✓</option>
              <option value="starred">Starred ★</option>
            </select>

            {/* Tier Filter */}
            <select
              value={tierFilter}
              onChange={e => setTierFilter(e.target.value)}
              className="bg-[#131724] border border-[#20273b] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none"
            >
              <option value="all">Tier: All Difficulties</option>
              <option value="JEE_ADVANCED">JEE Advanced</option>
              <option value="JEE_MAIN">JEE Main</option>
              <option value="L3">L3 - Adv Rigor</option>
              <option value="L2">L2 - Mains Standard</option>
              <option value="L1">L1 - Basic</option>
            </select>
          </div>

          {/* Question Cards Feed */}
          {filteredQuestions.length === 0 ? (
            <div className="bg-[#0e121c] p-12 text-center rounded-2xl border border-[#1f273b]">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No questions match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing your search query or subject filters, or click &ldquo;Enter New Problem&rdquo; to create one.
              </p>
              <button
                onClick={() => setActiveSubTab('entry')}
                className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-500 transition-colors"
              >
                + Enter a Question Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const cfg = SUBJECT_CONFIG[q.subject];
                const isRevealed = revealedSolutions[q.id];
                const userSelected = selectedAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    className="bg-[#0e121c] rounded-2xl border border-[#1f273b] p-5 shadow-md hover:border-[#2b3650] transition-all"
                  >
                    {/* Question Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#181f30]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span 
                          className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase"
                          style={{ backgroundColor: cfg.bg, color: cfg.accent, border: `1px solid ${cfg.border}` }}
                        >
                          {cfg.name}
                        </span>

                        <span className="text-xs font-semibold text-slate-300">
                          {q.chapter}
                        </span>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {q.tier.replace('_', ' ')}
                        </span>

                        <span className="text-[11px] text-slate-500">
                          Source: {q.sourceExam}
                        </span>
                      </div>

                      {/* Right Quick Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuestionStatus(q.id, q.status === 'starred' ? 'unsolved' : 'starred')}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            q.status === 'starred'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                              : 'bg-[#141824] text-slate-500 border-[#22293c] hover:text-amber-400'
                          }`}
                          title="Star Problem for Spaced Repetition"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                        </button>

                        <button
                          onClick={() => onUpdateQuestionStatus(q.id, q.status === 'solved' ? 'unsolved' : 'solved')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            q.status === 'solved'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-[#141824] text-slate-400 border-[#22293c] hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{q.status === 'solved' ? 'Solved' : 'Mark Solved'}</span>
                        </button>

                        {onDeleteQuestion && (
                          <button
                            onClick={() => onDeleteQuestion(q.id)}
                            className="p-1.5 rounded-lg bg-[#141824] text-slate-500 hover:text-red-400 border border-[#22293c] transition-colors"
                            title="Delete Question"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Title & Problem Statement */}
                    <div className="my-3.5">
                      <h4 className="text-sm font-bold text-white mb-2">{q.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-[#121624] p-3.5 rounded-xl border border-[#1b2234]">
                        {q.questionText}
                      </p>
                    </div>

                    {/* Options (if multiple choice) */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
                        {q.options.map((opt, optIdx) => {
                          const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
                          const isSelected = userSelected === letter;
                          const isCorrect = isRevealed && letter === q.correctAnswer;
                          const isWrong = isRevealed && isSelected && letter !== q.correctAnswer;

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectAnswer(q.id, letter, q.correctAnswer)}
                              className={`p-2.5 rounded-xl text-left text-xs font-medium border transition-all flex items-center justify-between ${
                                isCorrect
                                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                                  : isWrong
                                  ? 'bg-red-500/20 border-red-500/50 text-red-300'
                                  : isSelected
                                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                                  : 'bg-[#141824] border-[#22293c] text-slate-300 hover:border-[#35415e] hover:bg-[#181d2c]'
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Solution Reveal & Tags Bar */}
                    <div className="pt-3 border-t border-[#181f30] flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {q.tags.map(t => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#161b29] text-slate-400 border border-[#21293c]"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>{t}</span>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        {onOpenAiForQuestion && (
                          <button
                            onClick={() => onOpenAiForQuestion(q)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-semibold text-xs transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>Explain with AI</span>
                          </button>
                        )}

                        <button
                          onClick={() => toggleSolutionReveal(q.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141824] hover:bg-[#1b2234] text-slate-300 border border-[#22293c] font-semibold text-xs transition-colors"
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          <span>{isRevealed ? 'Hide Solution' : 'Reveal Solution'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Solution Derivation Card (shown when toggled) */}
                    {isRevealed && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#121827] to-[#161a29] border border-indigo-500/30 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#21293d]">
                          <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>Correct Answer: Option {q.correctAnswer}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">Step-by-Step Mathematical Derivation</span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap font-sans">
                          {q.solutionExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: QUESTION ENTERING FORM */}
      {activeSubTab === 'entry' && (
        <form onSubmit={handleFormSubmit} className="bg-[#0e121c] p-6 rounded-2xl border border-[#1f2638] shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#1c2336]">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                <span>Enter & Archive Practice Question</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Log customized JEE questions into the local question archive and track your solutions.
              </p>
            </div>
          </div>

          {/* Subject & Chapter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={e => handleSubjectChange(e.target.value as SubjectKey)}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="phy">Physics</option>
                <option value="che">Chemistry</option>
                <option value="mat">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Curriculum Chapter
              </label>
              <select
                value={formData.chapter}
                onChange={e => setFormData({ ...formData, chapter: e.target.value })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                {CH[formData.subject].map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Target Difficulty Tier
              </label>
              <select
                value={formData.tier}
                onChange={e => setFormData({ ...formData, tier: e.target.value as any })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="JEE_ADVANCED">JEE Advanced Rigor (L3)</option>
                <option value="JEE_MAIN">JEE Main Standard (L2)</option>
                <option value="L1">Level 1 - Foundational (L1)</option>
              </select>
            </div>
          </div>

          {/* Question Title & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Problem Title / Key Theme
              </label>
              <input
                type="text"
                placeholder="e.g. Pure Rolling on Variable Friction Incline"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Source Reference
              </label>
              <input
                type="text"
                placeholder="e.g. JEE Adv 2024 / Irodov / Allen Test Series"
                value={formData.sourceExam}
                onChange={e => setFormData({ ...formData, sourceExam: e.target.value })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Full Problem Statement */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Complete Problem Statement
            </label>
            <textarea
              rows={4}
              placeholder="Paste or write the complete problem statement, values, conditions, and questions..."
              value={formData.questionText}
              onChange={e => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full bg-[#131724] border border-[#20273b] rounded-xl p-3 text-xs text-white leading-relaxed outline-none focus:border-indigo-500 font-sans"
              required
            />
          </div>

          {/* Options A, B, C, D */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Options (Multiple Choice)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Option A content"
                value={formData.optionA}
                onChange={e => setFormData({ ...formData, optionA: e.target.value })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Option B content"
                value={formData.optionB}
                onChange={e => setFormData({ ...formData, optionB: e.target.value })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Option C content"
                value={formData.optionC}
                onChange={e => setFormData({ ...formData, optionC: e.target.value })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
              <input
                type="text"
                placeholder="Option D content"
                value={formData.optionD}
                onChange={e => setFormData({ ...formData, optionD: e.target.value })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>
          </div>

          {/* Correct Answer & Solution Derivation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Correct Answer Key
              </label>
              <select
                value={formData.correctAnswer}
                onChange={e => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Topic Tags (Comma Separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Rolling Motion, Moment of Inertia, Friction"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                className="w-full bg-[#131724] border border-[#20273b] rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Detailed Step-by-Step Solution / Derivation
            </label>
            <textarea
              rows={3}
              placeholder="Provide full mathematical proof, core formulas applied, and trick explanations..."
              value={formData.solutionExplanation}
              onChange={e => setFormData({ ...formData, solutionExplanation: e.target.value })}
              className="w-full bg-[#131724] border border-[#20273b] rounded-xl p-3 text-xs text-white leading-relaxed outline-none focus:border-indigo-500 font-sans"
            />
          </div>

          {/* Practice increment checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="incrementPractice"
              checked={formData.incrementPractice}
              onChange={e => setFormData({ ...formData, incrementPractice: e.target.checked })}
              className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-[#131724] border-[#20273b]"
            />
            <label htmlFor="incrementPractice" className="text-xs text-slate-300 font-medium cursor-pointer">
              Count this problem toward today&apos;s logged practice volume (+1 to {formData.subject.toUpperCase()})
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-3 border-t border-[#1c2336] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActiveSubTab('bank')}
              className="px-4 py-2.5 rounded-xl bg-[#141824] text-slate-400 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Save & Bank Question</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
