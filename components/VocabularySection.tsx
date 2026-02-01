
import React, { useState } from 'react';
import { VocabularyItem } from '../types';
import { playGeminiTTS } from '../services/geminiService';

interface VocabularySectionProps {
  items: VocabularyItem[];
}

export const VocabularySection: React.FC<VocabularySectionProps> = ({ items = [] }) => {
  const [showMeaning, setShowMeaning] = useState(true);

  const handlePlayAudio = (text: string) => {
    playGeminiTTS(text);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b-2 border-brand-100 pb-4">
        <h2 className="text-3xl font-black text-brand-800 uppercase tracking-tighter">Vocabulary List 📖</h2>
        <button
          onClick={() => setShowMeaning(!showMeaning)}
          className="text-sm bg-white border-2 border-brand-100 px-4 py-1.5 rounded-full hover:bg-brand-50 transition-all text-brand-600 font-black uppercase tracking-widest shadow-sm"
        >
          {showMeaning ? 'Hide Meaning' : 'Show Meaning'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {items.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2.5rem] shadow-lg border-2 border-slate-50 flex gap-6 hover:shadow-xl transition-all items-start group hover:-translate-y-1">
              <div className="shrink-0 relative mt-1 w-24 h-24 bg-brand-50 rounded-2xl overflow-hidden border-2 border-white shadow-inner flex items-center justify-center transform group-hover:rotate-6 transition-all">
                 <span className="text-5xl select-none">{item.emoji || '📝'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-brand-900 tracking-tight leading-none mb-1.5">{item.word}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-brand-600 text-sm font-black font-mono bg-brand-100/50 px-3 py-0.5 rounded-lg border border-brand-200">/{item.ipa}/</span>
                      <span className="text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded-md font-black uppercase tracking-widest">{item.type}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handlePlayAudio(item.word)}
                    className="p-3 rounded-full bg-brand-100 text-brand-700 hover:bg-brand-500 hover:text-white transition-all transform active:scale-90 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  </button>
                </div>
                
                <div className={`mt-4 transition-all duration-300 ${showMeaning ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                  <p className="text-highlight-600 font-black text-xl italic tracking-tight">{item.meaning}</p>
                </div>

                <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 relative group/example shadow-inner">
                  <p className="text-slate-700 text-base font-bold italic leading-relaxed pr-8">
                    "{item.example}"
                  </p>
                  {showMeaning && item.sentenceMeaning && (
                    <p className="text-brand-500 text-[10px] font-black mt-2 border-t border-slate-200 pt-2 uppercase tracking-wider">
                      ➔ {item.sentenceMeaning}
                    </p>
                  )}
                  <button 
                    onClick={() => handlePlayAudio(item.example)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-slate-400 hover:text-brand-500 hover:bg-brand-50 border border-slate-100 shadow-sm transition-all"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                  </button>
                </div>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
};
