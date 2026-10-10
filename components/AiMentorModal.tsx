'use client';

import React, { useState } from 'react';
import { 
  Sparkles, Send, X, Bot, User, RefreshCw, 
  Lightbulb, BookOpen, Compass, Zap
} from 'lucide-react';
import { QuestionBankItem } from '@/lib/types';

interface AiMentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentContext?: any;
  targetQuestion?: QuestionBankItem | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export default function AiMentorModal({
  isOpen,
  onClose,
  studentContext,
  targetQuestion
}: AiMentorModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        role: 'assistant',
        text: 'Greetings. I am your KINETIC JEE Academic Advisor & STEM Specialist. How can I assist your preparation today? You can inquire about rigorous physics derivations, multi-concept calculus problems, diagnostic error correction, or weekly pacing strategy.'
      }
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState<'advisor' | 'specialist' | 'strategist'>('advisor');

  if (!isOpen) return null;

  const sendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: newMessages.slice(0, -1),
          studentContext: {
            ...studentContext,
            personaMode: persona,
            questionContext: targetQuestion ? {
              title: targetQuestion.title,
              subject: targetQuestion.subject,
              chapter: targetQuestion.chapter,
              text: targetQuestion.questionText
            } : null
          }
        })
      });

      const data = await res.json();
      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
      } else if (data.error) {
        setMessages(prev => [
          ...prev, 
          { 
            role: 'assistant', 
            text: `[Academic Advisory Notice]: ${data.error}. Strategy recommendation: Maintain minimum 15 Level 3 problems daily in high-yield topics like Rotational Dynamics and Definite Integration.` 
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          text: 'Strategy recommendation: Ensure balanced 35-40 questions across Physics, Chemistry, and Mathematics daily. Focus on first-principles derivations and avoid memorization of complex formulas.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0e121c] border border-[#2b354e] rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1f273b] bg-[#121624] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  AI Academic Mentor & STEM Specialist
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  GEMINI 2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                First-principles derivations, problem explanations, and pacing diagnostics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={persona}
              onChange={e => setPersona(e.target.value as any)}
              className="bg-[#141928] border border-[#232b40] rounded-lg px-2.5 py-1 text-xs text-slate-300 outline-none"
            >
              <option value="advisor">🎓 Academic Advisor</option>
              <option value="specialist">🔬 Concept Specialist</option>
              <option value="strategist">⚡ Exam Strategist</option>
            </select>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#1a2133] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* If context question attached */}
        {targetQuestion && (
          <div className="px-5 py-2.5 bg-indigo-950/30 border-b border-indigo-500/20 flex items-center justify-between text-xs">
            <span className="text-indigo-300 truncate max-w-lg">
              <b>Focusing on Problem:</b> {targetQuestion.title} ({targetQuestion.chapter})
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-400 font-bold">
              ATTACHED
            </span>
          </div>
        )}

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#181e2e] text-indigo-400 border border-indigo-500/30'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-[#121624] text-slate-200 border border-[#20273b] rounded-tl-none shadow-sm font-sans'
              }`}>
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-lg bg-[#181e2e] text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-[#121624] text-slate-400 border border-[#20273b] rounded-tl-none text-xs flex items-center gap-2">
                <span>Synthesizing rigorous mathematical derivation...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-5 py-2.5 bg-[#101420] border-t border-[#1a2133] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-slate-500 font-bold uppercase whitespace-nowrap">Suggested:</span>
          {[
            'Derive condition for pure rolling without slipping',
            'Analyze my 7-day velocity and suggest priority topics',
            'Explain Kings property in definite integrals with proof',
            'How to avoid calculation errors under exam fatigue'
          ].map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="px-2.5 py-1 rounded-lg bg-[#161b29] hover:bg-[#1f263c] text-slate-300 hover:text-white border border-[#222a3d] text-[11px] whitespace-nowrap transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-[#121624] border-t border-[#1f273b]">
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Inquire about derivations, conceptual distinctions, or exam strategy..."
              value={inputPrompt}
              onChange={e => setInputPrompt(e.target.value)}
              className="flex-1 bg-[#0d1017] border border-[#20273b] rounded-xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-indigo-500 font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold transition-all shadow-md shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
