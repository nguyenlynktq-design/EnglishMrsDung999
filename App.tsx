
import React, { useState, useEffect } from 'react';
import { generateLessonPlan, fileToBase64 } from './services/geminiService';
import { LessonPlan } from './types';
import { VocabularySection } from './components/VocabularySection';
import { PracticeSection } from './components/PracticeSection';
import { MagicStory } from './components/MagicStory';
import { InfographicPoster } from './components/InfographicPoster';
import { MindMapTab } from './components/MindMapTab';
import { MindMapPromptGenerator } from './components/MindMapPromptGenerator';
import { MegaChallenge } from './components/MegaChallenge';
import { UploadZone } from './components/UploadZone';
import { LessonCertificate } from './components/LessonCertificate';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

interface LogoProps {
  className?: string;
  color?: string;
}

const MrsDungLogo = ({ className = "w-16 h-16", color = "currentColor" }: LogoProps) => (
  <div className={`relative ${className} flex items-center justify-center`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <g stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M35 80C25 75 20 62 20 50C20 38 25 25 35 20" />
        {[28, 38, 48, 58, 68].map(y => <path key={`l-${y}`} d={`M20 ${y} L14 ${y-4}`} />)}
        <path d="M65 80C75 75 80 62 80 50C80 38 75 25 65 20" />
        {[28, 38, 48, 58, 68].map(y => <path key={`r-${y}`} d={`M80 ${y} L86 ${y-4}`} />)}
      </g>
      <path d="M50 30C50 30 65 30 70 25C70 45 70 70 50 88C30 70 30 45 30 25C35 30 50 30 50 30Z" fill="white" stroke={color} strokeWidth="1.5" />
      <g fill="#0f172a">
        <circle cx="50" cy="46" r="3" />
        <circle cx="43" cy="48" r="3.5" />
        <circle cx="57" cy="48" r="3.5" />
        <path d="M43 52 C38 52 38 65 43 68 L46 68 V55 L50 55 L50 68 H54 V55 L57 55 V68 L60 68 C65 65 65 52 60 52 H43Z" />
        <path d="M50 40 C50 40 51 39 51 38 C51 37 50.5 36.5 50 36.5 C49.5 36.5 49 37 49 38 C49 39 50 40 50 40Z" fill="#ef4444" />
      </g>
    </svg>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'story' | 'mindmap' | 'prompt'>('planner');
  const [plannerMode, setPlannerMode] = useState<'topic' | 'text' | 'image'>('topic');
  const [topic, setTopic] = useState('');
  const [lessonText, setLessonText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<LessonPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [listeningCorrect, setListeningCorrect] = useState(0);
  const [megaScores, setMegaScores] = useState({ mc: 0, scramble: 0, fill: 0, error: 0, match: 0 });
  const [showCertificate, setShowCertificate] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(!!process.env.API_KEY);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected || !!process.env.API_KEY);
      }
    };
    checkKey();
    // Re-check periodically in case they just added it
    const timer = setInterval(checkKey, 2000);
    return () => clearInterval(timer);
  }, []);

  const handleConnectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // Assume success per instructions
    } else {
      window.open('https://aistudio.google.com/apikey', '_blank');
    }
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-brand-900 flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-xl w-full bg-white/10 backdrop-blur-xl p-10 md:p-16 rounded-[4rem] border-2 border-white/20 shadow-2xl flex flex-col items-center text-center animate-bounce-in relative z-10">
          <MrsDungLogo className="w-40 h-40 mb-8 bg-white rounded-3xl p-3 shadow-xl" color="#16a34a" />
          <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter font-display">English Mrs. Dung</h1>
          <p className="text-brand-200 text-lg font-bold mb-10 italic">"Hệ thống AI chưa được kết nối. Hãy bắt đầu hành trình của con ngay nhé!"</p>
          
          <button 
            onClick={handleConnectKey}
            className="w-full py-6 bg-highlight-400 text-brand-900 rounded-3xl font-black text-2xl shadow-2xl hover:bg-highlight-300 transition-all transform active:scale-95 border-b-[10px] border-highlight-600 active:border-b-0 mb-8 uppercase"
          >
            🔑 KẾT NỐI API KEY
          </button>

          <div className="space-y-4 text-sm text-brand-100/60 font-medium">
            <p>1. Nhấn nút để chọn hoặc tạo API Key từ Google AI Studio.</p>
            <p>2. Nếu dùng trên Vercel, hãy thêm biến <code className="bg-white/10 px-2 py-1 rounded text-white font-mono">API_KEY</code> vào Settings.</p>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="block text-highlight-400 font-bold underline hover:text-white transition-colors">Lấy Key miễn phí tại đây ➔</a>
          </div>
        </div>
        <footer className="mt-12 text-brand-400 font-black text-xs uppercase tracking-widest opacity-40">English with Heart • Success with Mrs.Dung</footer>
      </div>
    );
  }

  const totalCorrectCount = (listeningCorrect || 0) + 
                         (megaScores.mc || 0) + 
                         (megaScores.fill || 0) + 
                         (megaScores.error || 0) +
                         (megaScores.scramble || 0);

  const calculateTotalScore = () => {
      return Math.round((totalCorrectCount / 50) * 10 * 10) / 10;
  };

  const getEvaluation = (score: number) => {
      const s = score || 0;
      if (s >= 9) return { text: "XUẤS SẮC", emoji: "🏆", level: "EXCELLENT", praise: "Con là một ngôi sao sáng nhất lớp Mrs. Dung!" };
      if (s >= 7) return { text: "KHÁ GIỎI", emoji: "🌟", level: "GREAT JOB", praise: "Con làm bài rất tuyệt vời, tiếp tục phát huy nhé!" };
      if (s >= 5) return { text: "CỐ GẮNG", emoji: "👍", level: "GOOD EFFORT", praise: "Con đã nỗ lực rất nhiều, Mrs. Dung tự hào về con!" };
      return { text: "CẦN NỖ LỰC", emoji: "💪", level: "KEEP IT UP", praise: "Đừng nản lòng con nhé, bài sau mình làm tốt hơn nào!" };
  };

  const handleGenerate = async () => {
    if (plannerMode === 'topic' && !topic.trim()) { setError("Hãy nhập chủ đề bài học con nhé!"); return; }
    if (plannerMode === 'text' && !lessonText.trim()) { setError("Hãy dán nội dung bài học vào đây!"); return; }
    if (plannerMode === 'image' && selectedFiles.length === 0) { setError("Hãy chọn ít nhất một tấm ảnh tài liệu!"); return; }
    setLoading(true); setError(null); setLesson(null); setShowCertificate(false);
    try {
      let base64Images: string[] = [];
      if (plannerMode === 'image' && selectedFiles.length > 0) {
          base64Images = await Promise.all(selectedFiles.map(file => fileToBase64(file)));
      }
      const data = await generateLessonPlan(
          plannerMode === 'topic' ? topic : undefined,
          plannerMode === 'text' ? lessonText : undefined,
          base64Images
      );
      setLesson(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) { 
        if (err.message?.includes("API key not found") || err.message?.includes("Requested entity was not found")) {
            setHasKey(false);
            if (window.aistudio) await window.aistudio.openSelectKey();
        } else {
            setError(err.message || "Lỗi khi soạn bài, con hãy thử lại nhé!"); 
        }
    } finally { setLoading(false); }
  };

  const totalScore = calculateTotalScore();
  const evaluation = getEvaluation(totalScore);

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col font-serif text-slate-900">
      <header className="bg-brand-700 border-b-4 border-brand-800 sticky top-0 z-50 shadow-xl">
        <div className="max-w-[1600px] mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('planner')}>
            <MrsDungLogo className="w-14 h-14 bg-white rounded-2xl p-1.5 shadow-lg" color="#16a34a" />
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-black text-highlight-400 uppercase tracking-tighter font-display">ENGLISH MRS. DUNG</h1>
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] opacity-90 font-sans">English with Heart</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-brand-800/50 rounded-xl p-1.5 gap-1 overflow-x-auto border border-white/10">
               {['planner', 'story', 'mindmap', 'prompt'].map((tab) => (
                 <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-5 py-2 rounded-lg font-black text-sm transition-all uppercase whitespace-nowrap ${activeTab === tab ? 'bg-highlight-400 text-brand-900 shadow-md scale-105' : 'text-brand-50 hover:bg-brand-600 font-sans'}`}>{tab === 'planner' ? 'HỌC TẬP' : tab === 'story' ? 'KỂ TRUYỆN' : tab === 'mindmap' ? 'MIND MAP' : 'VẼ AI'}</button>
               ))}
            </div>
            
            <button 
              onClick={handleConnectKey}
              className="bg-brand-900/40 text-highlight-400 px-4 py-2 rounded-lg font-black text-xs hover:bg-brand-800 transition-all border border-highlight-400/30 flex items-center gap-2"
            >
              <span>⚙️</span> API Connected
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10 flex-grow w-full relative">
        <div className={activeTab === 'planner' ? 'block' : 'hidden'}>
          <div className="space-y-16">
             {!lesson ? (
               <div className="bg-white rounded-[3rem] shadow-xl border-b-[12px] border-r-[12px] border-brand-100 p-8 md:p-16 max-w-4xl mx-auto animate-fade-in text-center relative overflow-hidden ring-4 ring-white">
                  <div className="absolute top-0 left-0 w-full h-3 bg-brand-500"></div>
                  <MrsDungLogo className="w-32 h-32 mx-auto mb-8 drop-shadow-xl" color="#15803d" />
                  <h2 className="text-2xl md:text-4xl font-black text-brand-800 mb-2 uppercase tracking-tighter font-display">Let's learn English with Mrs. Dung</h2>
                  <p className="text-sm font-black text-slate-400 mb-8 uppercase italic opacity-60">"English with Heart. Success with Mrs.Dung"</p>
                  <div className="space-y-8 text-left">
                     <div className="flex bg-slate-100 p-2 rounded-2xl gap-2 shadow-inner">
                        {[{ id: 'topic', label: 'Chủ đề', icon: '💡' }, { id: 'text', label: 'Văn bản', icon: '📝' }, { id: 'image', label: 'Hình ảnh', icon: '📸' }].map(m => (
                          <button key={m.id} onClick={() => { setPlannerMode(m.id as any); setTopic(''); setLessonText(''); setSelectedFiles([]); setError(null); }} className={`flex-1 py-3 rounded-xl font-black text-base flex items-center justify-center gap-2 transition-all ${plannerMode === m.id ? 'bg-brand-500 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-white'}`}>{m.icon} {m.label}</button>
                        ))}
                     </div>
                     <div className="min-h-[150px]">
                        {plannerMode === 'topic' && <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Nhập chủ đề (VD: Animals, My Family...)" className="w-full p-6 text-2xl rounded-2xl border-4 border-brand-50 font-black bg-brand-50/50 outline-none text-brand-900" />}
                        {plannerMode === 'text' && <textarea value={lessonText} onChange={e => setLessonText(e.target.value)} placeholder="Dán nội dung bài học vào đây..." rows={6} className="w-full p-6 text-lg rounded-2xl border-4 border-brand-50 bg-brand-50/50 resize-none font-black text-slate-700 outline-none" />}
                        {plannerMode === 'image' && <UploadZone onFilesSelect={setSelectedFiles} isLoading={loading} fileCount={selectedFiles.length} />}
                     </div>
                     <button onClick={handleGenerate} disabled={loading} className="w-full py-6 bg-brand-500 border-b-8 border-brand-700 text-white rounded-3xl font-black text-2xl shadow-xl transform active:translate-y-2 active:border-b-0 uppercase tracking-tighter">
                        {loading ? 'ĐANG SOẠN BÀI SIÊU TỐC...' : '🚀 BẮT ĐẦU NGAY!'}
                     </button>
                     {error && <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-600 font-black text-lg text-center animate-bounce shadow-md">⚠️ {error}</div>}
                  </div>
               </div>
             ) : (
               <div className="space-y-16 animate-fade-in">
                  <div className="text-center relative py-10 bg-white rounded-[4rem] shadow-xl border-4 border-brand-50 ring-4 ring-white overflow-hidden">
                     <h1 className="text-4xl md:text-6xl font-black text-brand-800 uppercase font-display mb-6">{lesson.topic}</h1>
                     <div className="flex flex-col items-center gap-4">
                        <label className="text-brand-600 font-black uppercase tracking-[0.2em] text-base font-sans">Chào mừng con:</label>
                        <input type="text" placeholder="Nhập tên của con nhé..." value={studentName} onChange={e => setStudentName(e.target.value)} className="p-4 w-full max-w-xl rounded-2xl border-4 border-brand-50 font-black text-2xl text-center outline-none bg-brand-50/50" />
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[4rem] shadow-xl border-4 border-brand-50">
                    <VocabularySection items={lesson.vocabulary} />
                  </div>

                  <div className="bg-highlight-400 p-8 md:p-12 rounded-[4rem] shadow-xl border-[10px] border-white ring-4 ring-highlight-300 transform -rotate-1">
                     <h2 className="text-3xl md:text-4xl font-black text-brand-900 uppercase tracking-tighter mb-8 flex items-center gap-4">
                        <span className="bg-white/40 p-3 rounded-2xl shadow-inner text-4xl">✨</span> NGỮ PHÁP QUAN TRỌNG
                     </h2>
                     <div className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-[3rem] shadow-xl border-4 border-white">
                        <h3 className="text-2xl md:text-4xl font-black text-brand-700 mb-4 underline decoration-highlight-400 decoration-4 underline-offset-[10px]">{lesson.grammar?.topic}</h3>
                        <p className="text-xl md:text-2xl font-black text-slate-800 leading-relaxed italic mb-8 border-l-4 border-brand-500 pl-6">{lesson.grammar?.explanation}</p>
                        <div className="space-y-4">
                           <h4 className="text-lg font-black text-brand-600 uppercase tracking-widest">Ví dụ cho con:</h4>
                           <div className="grid gap-3">
                              {(lesson.grammar?.examples || []).map((ex, i) => (
                                 <div key={i} className="bg-brand-50 p-4 rounded-2xl border-2 border-brand-100 flex items-center gap-4">
                                    <span className="text-2xl">💎</span>
                                    <p className="text-lg md:text-xl font-black text-slate-700 italic">"{ex}"</p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                  
                  {lesson.practice && (
                    <div className="bg-white rounded-[4rem] shadow-xl border-[10px] border-brand-50 overflow-hidden">
                      <div className="bg-brand-700 p-8 text-center border-b-[10px] border-brand-900 shadow-md"><h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight font-display">HÀNH TRÌNH LUYỆN NGHE (10 CÂU)</h2></div>
                      <div className="p-8"><PracticeSection content={lesson.practice} onScoreUpdate={setListeningCorrect} /></div>
                    </div>
                  )}
                  {lesson.practice?.megaTest && <MegaChallenge megaData={lesson.practice.megaTest} onScoresUpdate={setMegaScores} />}

                  <div className="text-center py-20 bg-white rounded-[4rem] shadow-xl border-4 border-brand-100 flex flex-col items-center gap-8 relative overflow-hidden">
                      <MrsDungLogo className="w-32 h-32 drop-shadow-xl animate-bounce-slow" color="#15803d" />
                      <div className="flex flex-col items-center gap-3">
                          <div className="flex items-baseline gap-3">
                              <span className="text-8xl md:text-9xl font-black text-brand-600 leading-none drop-shadow-xl">{totalScore}</span>
                              <span className="text-3xl md:text-4xl font-black text-slate-200">/10</span>
                          </div>
                          <div className="text-xl font-black text-brand-500 bg-brand-50 px-6 py-1.5 rounded-full mb-3 shadow-sm">Số câu làm đúng: <span className="text-brand-700 font-black">{totalCorrectCount}/50</span> câu</div>
                          <div className={`px-10 py-4 rounded-full font-black text-3xl shadow-xl border-b-8 transform rotate-[-2deg] ${totalScore >= 5 ? 'bg-brand-500 text-white border-brand-700' : 'bg-orange-500 text-white border-orange-700'}`}>{evaluation.emoji} {evaluation.text}</div>
                          
                          <button 
                            onClick={() => setShowCertificate(true)} 
                            className="mt-6 px-12 py-5 bg-emerald-500 text-white rounded-[2rem] font-black text-2xl shadow-xl hover:bg-emerald-400 transform hover:scale-105 transition-all border-b-8 border-emerald-700 active:border-b-0 active:translate-y-1 uppercase tracking-tighter"
                          >
                            📜 XUẤT CHỨNG NHẬN KẾT QUẢ
                          </button>
                      </div>
                  </div>

                  {showCertificate && (
                    <LessonCertificate 
                      studentName={studentName}
                      topic={lesson.topic}
                      score={totalScore}
                      totalCorrect={totalCorrectCount}
                      evaluation={evaluation}
                      onClose={() => setShowCertificate(false)}
                    />
                  )}

                  <InfographicPoster lesson={lesson} />
               </div>
             )}
          </div>
        </div>
        <div className={activeTab === 'story' ? 'block' : 'hidden'}><MagicStory /></div>
        <div className={activeTab === 'mindmap' ? 'block' : 'hidden'}><MindMapTab /></div>
        <div className={activeTab === 'prompt' ? 'block' : 'hidden'}><MindMapPromptGenerator /></div>
      </main>

      <footer className="bg-brand-900 text-white border-t-[10px] border-brand-800 pt-20 pb-10">
         <div className="max-w-[1400px] mx-auto px-6 text-center md:text-left">
            <div className="grid md:grid-cols-3 gap-12 items-start mb-16">
               <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="bg-white p-4 rounded-[2rem] w-fit shadow-xl border-4 border-highlight-400"><MrsDungLogo className="w-20 h-20" color="#166534" /></div>
                  <div><h3 className="font-black text-2xl text-highlight-400 uppercase leading-none font-display">ENGLISH MRS. DUNG</h3><p className="text-brand-100 font-black text-base mt-2 opacity-90 italic">“English with Heart. Success with Mrs.Dung”</p></div>
               </div>
               <div className="space-y-6 text-center md:text-left">
                  <h4 className="font-black text-highlight-400 text-xl uppercase tracking-[0.2em] border-b-2 border-white/10 pb-2 font-sans">Liên Hệ</h4>
                  <ul className="space-y-4 font-black text-brand-100 text-lg">
                     <li className="flex items-start gap-3">📍<span>Ngõ 717 Mạc Đăng Doanh, Hải Phòng.</span></li>
                     <li className="flex items-center gap-3">📞<a href="tel:0364409436" className="hover:text-highlight-400 transition-colors">Mrs.Dung: 0364409436</a></li>
                     <li className="flex items-center gap-3">✉️<a href="mailto:nguyendungvn8@gmail.com" className="hover:text-highlight-400 transition-colors text-base">nguyendungvn8@gmail.com</a></li>
                     <li className="flex items-center gap-3">🌐<a href="https://www.facebook.com/profile.php?id=100054264771359" target="_blank" className="hover:text-highlight-400 transition-colors underline decoration-2">Fanpage Facebook</a></li>
                  </ul>
               </div>
               <div className="space-y-6 text-center md:text-left">
                  <h4 className="font-black text-highlight-400 text-xl uppercase tracking-[0.2em] border-b-2 border-white/10 pb-2 font-sans">Slogan</h4>
                  <div className="bg-white/5 p-8 rounded-[2rem] border-2 border-white/10 shadow-xl backdrop-blur-sm"><p className="text-xl font-black italic text-white mb-3 leading-tight">“English with Heart. Success with Mrs.Dung”</p><p className="text-brand-300 font-black text-base uppercase tracking-widest font-sans">Học Tiếng Anh bằng cả Trái Tim.</p></div>
               </div>
            </div>
         </div>
      </footer>
    </div>
  );
}
export default App;
