
import React, { useState, useEffect, useCallback } from 'react';
import { PracticeContent } from '../types';
import { WordBankFill } from './WordBankFill';
import {
  shuffleWithRecheck,
  generateSeed,
  joinTokensWithSpacing,
  compareTokenArrays,
  parseIntoTokens
} from '../utils/shuffleUtils';

interface MegaChallengeProps {
  megaData: PracticeContent['megaTest'];
  onScoresUpdate?: (scores: { mc: number; scramble: number; fill: number }) => void;
}

// Collapsible Explanation Component
const CollapsibleExplanation: React.FC<{
  isCorrect: boolean;
  explanation: string;
  correctAnswer?: string;
  userAnswer?: string;
}> = ({ isCorrect, explanation, correctAnswer, userAnswer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`mt-3 rounded-2xl border-l-4 overflow-hidden transition-all ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'
      }`}>
      {/* Header - Always visible */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{isCorrect ? '🌟' : '💡'}</span>
          <span className={`font-bold text-sm ${isCorrect ? 'text-green-700' : 'text-amber-700'}`}>
            {isCorrect ? 'Tuyệt vời! Con giỏi lắm!' : 'Chưa đúng rồi!'}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 text-xs font-bold bg-white/50 rounded-lg hover:bg-white/80 transition-all"
        >
          {isOpen ? '▲ Thu gọn' : '▼ Xem giải thích'}
        </button>
      </div>

      {/* Collapsible content */}
      <div
        className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 pb-4 space-y-2">
          {!isCorrect && correctAnswer && (
            <div className="bg-white/50 p-2 rounded-lg">
              <p className="text-xs text-slate-500 mb-1">Đáp án đúng:</p>
              <p className="font-bold text-green-700 text-sm">{correctAnswer}</p>
            </div>
          )}
          {explanation && (
            <p className="text-xs italic text-slate-600 leading-relaxed">{explanation}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Session seed for consistent shuffling within session
const SESSION_SEED = Date.now().toString();

export const MegaChallenge: React.FC<MegaChallengeProps> = ({ megaData, onScoresUpdate }) => {
  const [activeZone, setActiveZone] = useState<'mc' | 'fill' | 'scramble'>('mc');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  const normalizeStrict = (s: string) => {
    return String(s || "")
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleAnswer = (qId: string, val: any) => {
    if (submitted[qId]) return;
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const checkFinal = (qId: string, isCorrect: boolean) => {
    setSubmitted(prev => ({ ...prev, [qId]: true }));
  };

  const calculateZoneScore = (zone: string) => {
    let correct = 0;
    if (!megaData) return 0;
    if (zone === 'mc') {
      (megaData.multipleChoice || []).forEach(q => { if (submitted[q.id] && answers[q.id] === q.correctAnswer) correct++; });
    } else if (zone === 'fill') {
      (megaData.fillBlank || []).forEach(q => {
        if (submitted[q.id]) {
          const result = answers[q.id];
          if (result?.isCorrect) correct++;
        }
      });
    } else if (zone === 'scramble') {
      (megaData.scramble || []).forEach(q => {
        if (submitted[q.id]) {
          const result = answers[q.id];
          if (result?.isCorrect) correct++;
        }
      });
    }
    return correct;
  };

  useEffect(() => {
    if (onScoresUpdate) {
      onScoresUpdate({
        mc: calculateZoneScore('mc'),
        scramble: calculateZoneScore('scramble'),
        fill: calculateZoneScore('fill')
      });
    }
  }, [submitted, megaData]);

  if (!megaData) return null;

  return (
    <div className="bg-brand-900 rounded-[3rem] shadow-xl border-[8px] border-brand-800 overflow-hidden mb-12 font-sans">
      <div className="bg-brand-800 p-6 text-center border-b-2 border-brand-700">
        <h2 className="text-xl md:text-2xl font-black text-white uppercase italic mb-4 tracking-tighter">🚀 MEGA CHALLENGES 🚀</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'mc', label: 'Quiz', icon: '📝', count: megaData.multipleChoice?.length || 0 },
            { id: 'fill', label: 'Điền từ', icon: '✏️', count: megaData.fillBlank?.length || 0 },
            { id: 'scramble', label: 'Sắp xếp', icon: '🧩', count: megaData.scramble?.length || 0 },
          ].map(z => (
            <button key={z.id} onClick={() => setActiveZone(z.id as any)} className={`px-4 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${activeZone === z.id ? 'bg-highlight-400 text-brand-900 scale-105 shadow-lg ring-2 ring-white/20' : 'bg-brand-700 text-brand-200 hover:bg-brand-600'}`}>
              <span className="text-xl">{z.icon}</span> {z.count} {z.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-8 bg-white/5">
        {/* Multiple Choice Section */}
        {activeZone === 'mc' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {(megaData.multipleChoice || []).map((q, idx) => (
              <div key={q.id} className="bg-white p-4 md:p-6 rounded-[2rem] shadow-lg border-2 border-slate-50 transition-all hover:border-brand-200">
                <p className="font-black text-base md:text-lg text-slate-800 mb-4 flex gap-3 leading-tight">
                  <span className="bg-brand-100 text-brand-600 px-3 py-0.5 rounded-lg h-fit text-sm shrink-0">Q{idx + 1}</span>
                  <span className="break-words">{q.question}</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(q.options || []).map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => { handleAnswer(q.id, i); checkFinal(q.id, i === q.correctAnswer); }}
                      disabled={submitted[q.id]}
                      className={`p-4 rounded-xl border-2 font-bold text-left text-sm md:text-base transition-all ${submitted[q.id]
                        ? i === q.correctAnswer
                          ? 'bg-green-100 border-green-500 text-green-700'
                          : answers[q.id] === i
                            ? 'bg-red-100 border-red-500 text-red-700'
                            : 'bg-slate-50 opacity-50'
                        : 'bg-white border-slate-50 hover:border-brand-300 hover:bg-brand-50 active:scale-[0.98]'
                        }`}
                    >
                      <span className="mr-3 text-slate-300">{String.fromCharCode(65 + i)}.</span> {opt}
                    </button>
                  ))}
                </div>
                {submitted[q.id] && (
                  <CollapsibleExplanation
                    isCorrect={answers[q.id] === q.correctAnswer}
                    explanation={q.explanation || ''}
                    correctAnswer={`${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fill-in-the-Blank Section - TAP TO FILL */}
        {activeZone === 'fill' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {(megaData.fillBlank || []).map((q, idx) => {
              const result = answers[q.id];
              const isSubmitted = submitted[q.id];

              // Parse the question to extract word bank
              // The correctAnswer may be comma-separated for multiple blanks
              const correctAnswers = String(q.correctAnswer || "").split(',').map(s => s.trim());

              // Create word bank with correct answers (in production, add distractors)
              const wordBank = [...correctAnswers];

              return (
                <div key={q.id} className="bg-white p-4 md:p-8 rounded-[2rem] shadow-lg border-b-4 border-slate-100">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl md:text-5xl bg-brand-50 p-3 md:p-4 rounded-2xl shadow-inner shrink-0">{q.clueEmoji || '📝'}</span>
                    <div className="flex-1">
                      <p className="text-slate-400 font-black uppercase text-[10px] mb-2 tracking-widest">ĐIỀN TỪ CÂU {idx + 1}:</p>
                      <p className="text-lg md:text-xl font-bold text-slate-700 leading-relaxed break-words">{q.question}</p>
                    </div>
                  </div>

                  <WordBankFill
                    questionId={q.id}
                    wordBank={wordBank}
                    correctTokens={correctAnswers}
                    mode="fill_blanks"
                    blankCount={correctAnswers.length}
                    disabled={isSubmitted}
                    showResult={isSubmitted}
                    sessionSeed={SESSION_SEED}
                    onComplete={(res) => {
                      handleAnswer(q.id, res);
                      checkFinal(q.id, res.isCorrect);
                    }}
                  />

                  {isSubmitted && (
                    <CollapsibleExplanation
                      isCorrect={result?.isCorrect}
                      explanation={q.explanation || ''}
                      correctAnswer={q.correctAnswer}
                      userAnswer={result?.userAnswer}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Scramble/Arrange Words Section - TAP TO BUILD SENTENCE */}
        {activeZone === 'scramble' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {(megaData.scramble || []).map((q, idx) => {
              const result = answers[q.id];
              const isSubmitted = submitted[q.id];

              // Parse correct sentence into tokens for validation
              const correctTokens = parseIntoTokens(q.correctSentence);

              // Use provided scrambled array as word bank
              const wordBank = q.scrambled || [];

              return (
                <div key={q.id} className="bg-white p-4 md:p-8 rounded-[2rem] shadow-lg border-b-4 border-slate-100">
                  <div className="mb-4">
                    <p className="text-slate-400 font-black uppercase text-[10px] mb-2 tracking-widest">SẮP XẾP CÂU {idx + 1}:</p>
                    <p className="text-sm text-slate-600 font-medium">Chạm vào các từ để xếp thành câu hoàn chỉnh:</p>
                  </div>

                  <WordBankFill
                    questionId={q.id}
                    wordBank={wordBank}
                    correctTokens={correctTokens}
                    mode="arrange_words"
                    disabled={isSubmitted}
                    showResult={isSubmitted}
                    sessionSeed={SESSION_SEED}
                    onComplete={(res) => {
                      handleAnswer(q.id, res);
                      checkFinal(q.id, res.isCorrect);
                    }}
                  />

                  {isSubmitted && (
                    <CollapsibleExplanation
                      isCorrect={result?.isCorrect}
                      explanation={q.translation ? `Nghĩa: ${q.translation}` : ''}
                      correctAnswer={q.correctSentence}
                      userAnswer={result?.userAnswer}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
