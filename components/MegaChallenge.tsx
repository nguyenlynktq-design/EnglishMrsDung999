
import React, { useState, useEffect } from 'react';
import { PracticeContent } from '../types';

interface MegaChallengeProps {
  megaData: PracticeContent['megaTest'];
  onScoresUpdate?: (scores: { mc: number; scramble: number; fill: number; vocab: number; trueFalse: number }) => void;
}

export const MegaChallenge: React.FC<MegaChallengeProps> = ({ megaData, onScoresUpdate }) => {
  const [activeZone, setActiveZone] = useState<'mc' | 'fill' | 'vocab' | 'scramble' | 'trueFalse'>('mc');
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
          const userAnsObj = answers[q.id] || {};
          const targetParts = String(q.correctAnswer || "").split(',').map(s => s.trim());
          const isAllCorrect = targetParts.every((part, idx) => normalizeStrict(userAnsObj[idx] || "") === normalizeStrict(part));
          if (isAllCorrect) correct++;
        }
      });
    } else if (zone === 'vocab') {
      (megaData.vocabTranslation || []).forEach(q => { if (submitted[q.id] && answers[q.id] === q.correctAnswer) correct++; });
    } else if (zone === 'scramble') {
      (megaData.scramble || []).forEach(q => { if (submitted[q.id] && normalizeStrict(answers[q.id] || "") === normalizeStrict(q.correctSentence)) correct++; });
    } else if (zone === 'trueFalse') {
      (megaData.trueFalse || []).forEach(q => { if (submitted[q.id] && answers[q.id] === q.isTrue) correct++; });
    }
    return correct;
  };

  useEffect(() => {
    if (onScoresUpdate) {
      onScoresUpdate({
        mc: calculateZoneScore('mc'),
        scramble: calculateZoneScore('scramble'),
        fill: calculateZoneScore('fill'),
        vocab: calculateZoneScore('vocab'),
        trueFalse: calculateZoneScore('trueFalse')
      });
    }
  }, [submitted, megaData]);

  if (!megaData) return null;

  return (
    <div className="bg-brand-900 rounded-[3rem] shadow-xl border-[8px] border-brand-800 overflow-hidden mb-12 font-sans">
      <div className="bg-brand-800 p-6 text-center border-b-2 border-brand-700">
        <h2 className="text-xl md:text-2xl font-black text-white uppercase italic mb-4 tracking-tighter">🚀 50 MEGA CHALLENGES 🚀</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { id: 'mc', label: '10 Quiz', icon: '📝' },
            { id: 'fill', label: '10 Điền từ', icon: '✏️' },
            { id: 'vocab', label: '10 Từ vựng', icon: '📚' },
            { id: 'scramble', label: '10 Sắp xếp', icon: '🧩' },
            { id: 'trueFalse', label: '10 Đ/S', icon: '✅' },
          ].map(z => (
            <button key={z.id} onClick={() => setActiveZone(z.id as any)} className={`px-4 py-3 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${activeZone === z.id ? 'bg-highlight-400 text-brand-900 scale-105 shadow-lg ring-2 ring-white/20' : 'bg-brand-700 text-brand-200 hover:bg-brand-600'}`}>
              <span className="text-xl">{z.icon}</span> {z.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 bg-white/5">
        {activeZone === 'mc' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {(megaData.multipleChoice || []).map((q, idx) => (
              <div key={q.id} className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-slate-50 transition-all hover:border-brand-200">
                <p className="font-black text-lg text-slate-800 mb-4 flex gap-3 leading-tight"><span className="bg-brand-100 text-brand-600 px-3 py-0.5 rounded-lg h-fit text-sm">Q{idx + 1}</span>{q.question}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  {(q.options || []).map((opt, i) => (
                    <button key={i} onClick={() => { handleAnswer(q.id, i); checkFinal(q.id, i === q.correctAnswer); }} disabled={submitted[q.id]} className={`p-4 rounded-xl border-2 font-black text-left text-base transition-all ${submitted[q.id] ? i === q.correctAnswer ? 'bg-green-100 border-green-500 text-green-700' : answers[q.id] === i ? 'bg-red-100 border-red-500 text-red-700' : 'bg-slate-50 opacity-50' : 'bg-white border-slate-50 hover:border-brand-300 hover:bg-brand-50 hover:-translate-y-1'}`}>
                      <span className="mr-3 text-slate-300">{String.fromCharCode(65 + i)}.</span> {opt}
                    </button>
                  ))}
                </div>
                {submitted[q.id] && (
                  <div className={`mt-4 p-4 rounded-2xl border-l-4 ${answers[q.id] === q.correctAnswer ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{answers[q.id] === q.correctAnswer ? '🌟' : '💡'}</span>
                      <div>
                        <p className="font-black text-sm mb-1 text-slate-800">
                          {answers[q.id] === q.correctAnswer ? 'Tuyệt vời! Con giỏi lắm!' : `Chưa đúng rồi! Đáp án đúng là: ${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}`}
                        </p>
                        <p className="text-xs italic text-slate-600 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeZone === 'fill' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {(megaData.fillBlank || []).map((q, idx) => {
              const targetStr = String(q.correctAnswer || "");
              const targetParts = targetStr.includes(',') ? targetStr.split(',').map(s => s.trim()) : [targetStr.trim()];
              const userAnsObj = answers[q.id] || {};
              const isAllCorrect = targetParts.every((part, i) => normalizeStrict(userAnsObj[i] || "") === normalizeStrict(part));
              const questionParts = (q.question || "").split('___');

              return (
                <div key={q.id} className="bg-white p-8 rounded-[2rem] shadow-lg border-b-4 border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl bg-brand-50 p-4 rounded-2xl shadow-inner">{q.clueEmoji}</span>
                    <div className="text-xl md:text-2xl font-black text-slate-700 flex flex-wrap items-center gap-2 flex-1">
                      {questionParts.map((part, i, arr) => (
                        <React.Fragment key={i}>
                          <span>{part}</span>
                          {i < arr.length - 1 && (
                            <input
                              type="text"
                              disabled={submitted[q.id]}
                              value={userAnsObj[i] || ""}
                              onChange={(e) => setAnswers(prev => ({ ...prev, [q.id]: { ...(prev[q.id] || {}), [i]: e.target.value } }))}
                              className={`w-32 p-2 text-center border-b-2 outline-none font-black rounded-lg transition-all text-lg ${submitted[q.id] ? (normalizeStrict(userAnsObj[i]) === normalizeStrict(targetParts[i]) ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700') : 'bg-brand-50/50 border-brand-200 focus:border-brand-500'}`}
                              placeholder="..."
                            />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  {!submitted[q.id] ? (
                    <button onClick={() => checkFinal(q.id, isAllCorrect)} className="w-full py-3 bg-brand-600 text-white rounded-xl font-black text-lg shadow-md uppercase">Kiểm tra 🚀</button>
                  ) : (
                    <div className={`p-4 rounded-2xl border-l-4 ${isAllCorrect ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{isAllCorrect ? '🌟' : '💡'}</span>
                        <div>
                          <p className="font-black text-sm mb-1 text-slate-800">
                            {isAllCorrect ? 'Tuyệt vời! Con làm đúng rồi!' : `Chưa đúng rồi! Đáp án đúng là: ${q.correctAnswer}`}
                          </p>
                          {q.explanation && <p className="text-xs italic text-slate-600 leading-relaxed">{q.explanation}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeZone === 'vocab' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {(megaData.vocabTranslation || []).map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.correctAnswer;

              return (
                <div key={q.id} className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-slate-50 transition-all hover:border-brand-200">
                  <div className="text-center mb-6">
                    <p className="text-slate-400 font-black uppercase text-[10px] mb-2 tracking-widest">TỪ VỰNG CÂU {idx + 1}:</p>
                    <p className="text-3xl md:text-4xl font-black text-brand-600 mb-2">"{q.word}"</p>
                    <p className="text-sm text-slate-500">Chọn nghĩa tiếng Việt đúng:</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(q.options || []).map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => { handleAnswer(q.id, i); checkFinal(q.id, i === q.correctAnswer); }}
                        disabled={submitted[q.id]}
                        className={`p-4 rounded-xl border-2 font-black text-center text-base transition-all ${submitted[q.id]
                          ? i === q.correctAnswer
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : userAns === i
                              ? 'bg-red-100 border-red-500 text-red-700'
                              : 'bg-slate-50 opacity-50'
                          : 'bg-white border-slate-100 hover:border-brand-300 hover:bg-brand-50 hover:-translate-y-1'
                          }`}
                      >
                        <span className="mr-2 text-slate-400">{String.fromCharCode(65 + i)}.</span> {opt}
                      </button>
                    ))}
                  </div>
                  {submitted[q.id] && (
                    <div className={`mt-4 p-4 rounded-2xl border-l-4 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{isCorrect ? '🌟' : '💡'}</span>
                        <div>
                          <p className="font-black text-sm mb-1 text-slate-800">
                            {isCorrect ? 'Tuyệt vời! Con giỏi lắm!' : `Chưa đúng! Đáp án đúng là: ${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[q.correctAnswer]}`}
                          </p>
                          {q.explanation && <p className="text-xs italic text-slate-600 leading-relaxed">{q.explanation}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeZone === 'scramble' && (
          <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {(megaData.scramble || []).map((q, idx) => {
              const isCorrect = normalizeStrict(answers[q.id] || "") === normalizeStrict(q.correctSentence);
              return (
                <div key={q.id} className="bg-white p-8 rounded-[2rem] shadow-lg border-b-4 border-slate-100 flex flex-col gap-4">
                  <p className="text-slate-400 font-black uppercase text-[10px] mb-1 tracking-widest">SẮP XẾP CÂU {idx + 1}:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(q.scrambled || []).map((word, wi) => (
                      <span key={wi} className="bg-brand-50 px-3 py-1 rounded-lg font-black text-brand-700 border border-brand-100 text-sm">{word}</span>
                    ))}
                  </div>
                  <input
                    type="text"
                    disabled={submitted[q.id]}
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    placeholder="Viết lại câu hoàn chỉnh..."
                    className={`w-full p-4 text-xl rounded-xl border-2 font-black outline-none transition-all ${submitted[q.id] ? (isCorrect ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700') : 'bg-slate-50 border-slate-200 focus:border-brand-500'}`}
                  />
                  {!submitted[q.id] ? (
                    <button onClick={() => checkFinal(q.id, isCorrect)} className="w-full py-3 bg-brand-600 text-white rounded-xl font-black text-lg shadow-md uppercase">Kiểm tra 🚀</button>
                  ) : (
                    <div className={`p-4 rounded-2xl border-l-4 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{isCorrect ? '🌟' : '💡'}</span>
                        <div>
                          <p className="font-black text-sm mb-1 text-slate-800">
                            {isCorrect ? 'Tuyệt vời! Con sắp xếp đúng rồi!' : `Chưa đúng! Câu đúng là: ${q.correctSentence}`}
                          </p>
                          {q.translation && <p className="text-xs italic text-slate-600">({q.translation})</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeZone === 'trueFalse' && (
          <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
            {(megaData.trueFalse || []).map((q, idx) => {
              const userAns = answers[q.id];
              const isCorrect = userAns === q.isTrue;

              return (
                <div key={q.id} className="bg-white p-6 rounded-[2rem] shadow-lg border-2 border-slate-50 transition-all hover:border-brand-200">
                  <div className="mb-6">
                    <p className="text-slate-400 font-black uppercase text-[10px] mb-3 tracking-widest text-center">ĐỌC HIỂU CÂU {idx + 1}:</p>
                    <p className="text-lg md:text-xl font-black text-slate-800 text-center leading-relaxed px-4">
                      "{q.statement}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => { handleAnswer(q.id, true); checkFinal(q.id, true === q.isTrue); }}
                      disabled={submitted[q.id]}
                      className={`p-5 rounded-xl border-2 font-black text-center text-lg transition-all flex items-center justify-center gap-3 ${submitted[q.id]
                        ? q.isTrue === true
                          ? 'bg-green-100 border-green-500 text-green-700 ring-2 ring-green-200'
                          : userAns === true
                            ? 'bg-red-100 border-red-500 text-red-700'
                            : 'bg-slate-50 opacity-40'
                        : 'bg-green-50 border-green-200 text-green-700 hover:border-green-400 hover:bg-green-100 active:scale-95'
                        }`}
                    >
                      <span className="text-2xl">✅</span> TRUE
                    </button>
                    <button
                      onClick={() => { handleAnswer(q.id, false); checkFinal(q.id, false === q.isTrue); }}
                      disabled={submitted[q.id]}
                      className={`p-5 rounded-xl border-2 font-black text-center text-lg transition-all flex items-center justify-center gap-3 ${submitted[q.id]
                        ? q.isTrue === false
                          ? 'bg-green-100 border-green-500 text-green-700 ring-2 ring-green-200'
                          : userAns === false
                            ? 'bg-red-100 border-red-500 text-red-700'
                            : 'bg-slate-50 opacity-40'
                        : 'bg-red-50 border-red-200 text-red-700 hover:border-red-400 hover:bg-red-100 active:scale-95'
                        }`}
                    >
                      <span className="text-2xl">❌</span> FALSE
                    </button>
                  </div>
                  {submitted[q.id] && (
                    <div className={`mt-4 p-4 rounded-2xl border-l-4 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-amber-50 border-amber-500'}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{isCorrect ? '🏆' : '💡'}</span>
                        <div>
                          <p className="font-black text-sm mb-1 text-slate-800">
                            {isCorrect ? 'Chính xác! Con làm đúng rồi!' : `Chưa đúng! Đáp án đúng là: ${q.isTrue ? 'TRUE' : 'FALSE'}`}
                          </p>
                          <p className="text-xs italic text-slate-600 leading-relaxed">{q.explanation}</p>
                        </div>
                      </div>
                    </div>
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
