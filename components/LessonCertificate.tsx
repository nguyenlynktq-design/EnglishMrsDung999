
import React, { useRef, useEffect, useState } from 'react';
import { toPng } from 'html-to-image';

interface LessonCertificateProps {
  studentName: string;
  topic: string;
  score: number;
  totalCorrect: number;
  evaluation: { text: string; emoji: string; praise: string };
  onClose: () => void;
}

export const LessonCertificate: React.FC<LessonCertificateProps> = ({ 
  studentName, 
  topic, 
  score, 
  totalCorrect, 
  evaluation, 
  onClose 
}) => {
  const certRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState('');
  const [fullDateStr, setFullDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    setFullDateStr(`${day}/${month}/${year}`);
    setCurrentDate(`Hải Phòng, ngày ${day} tháng ${month} năm ${year}`);
  }, []);

  const downloadCert = async () => {
    if (!certRef.current) return;
    try {
      const originalTransform = certRef.current.style.transform;
      certRef.current.style.transform = 'none';
      
      const dataUrl = await toPng(certRef.current, { 
        pixelRatio: 3, 
        backgroundColor: '#ffffff',
        width: 1100,
        height: 800
      });
      
      certRef.current.style.transform = originalTransform;

      const link = document.createElement('a');
      link.download = `Chung-Nhan-MrsDung-${studentName || 'Hoc-Sinh'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Lỗi tải chứng nhận, con hãy thử lại nhé!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/98 backdrop-blur-2xl flex flex-col items-center justify-center p-4 animate-fade-in overflow-hidden">
      {/* Control Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-6 z-[110]">
        <div className="flex flex-col">
          <h2 className="text-white font-black text-2xl uppercase tracking-widest">GIẤY CHỨNG NHẬN</h2>
          <p className="text-emerald-400 font-bold text-sm uppercase tracking-wider">Học tập cùng Mrs. Dung AI</p>
        </div>
        <div className="flex gap-4">
          <button onClick={downloadCert} className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black text-xl shadow-2xl hover:bg-emerald-400 transform hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
            <span>💾 TẢI VỀ MÁY</span>
          </button>
          <button onClick={onClose} className="bg-rose-500 text-white p-4 rounded-2xl font-black text-xl hover:bg-rose-600 transition-all shadow-xl" title="Đóng">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* Main Certificate Content */}
      <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
        <div 
          ref={certRef} 
          className="w-[1100px] h-[800px] bg-white border-[35px] border-brand-50 p-12 flex flex-col items-center relative shadow-2xl shrink-0 font-serif origin-center scale-[0.4] sm:scale-[0.5] md:scale-[0.7] lg:scale-[0.85] xl:scale-100"
        >
          {/* Decorative Corner Elements */}
          <div className="absolute top-6 left-6 w-32 h-32 border-t-[12px] border-l-[12px] border-brand-200 opacity-50"></div>
          <div className="absolute top-6 right-6 w-32 h-32 border-t-[12px] border-r-[12px] border-brand-200 opacity-50"></div>
          <div className="absolute bottom-6 left-6 w-32 h-32 border-b-[12px] border-l-[12px] border-brand-200 opacity-50"></div>
          <div className="absolute bottom-6 right-6 w-32 h-32 border-b-[12px] border-r-[12px] border-brand-200 opacity-50"></div>

          {/* Center Logo/Icon */}
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-24 h-24 bg-brand-700 rounded-3xl flex items-center justify-center text-white text-5xl mb-4 shadow-2xl border-4 border-white transform -rotate-3">
               🏫
            </div>
            <h2 className="text-xl font-black text-brand-800 uppercase tracking-[0.5em] font-sans mb-1">TRUNG TÂM ANH NGỮ MRS. DUNG</h2>
            <h1 className="text-5xl font-black text-brand-900 uppercase font-display tracking-tight border-b-4 border-highlight-400 pb-2">SUCCESS WITH MRS. DUNG</h1>
          </div>

          <p className="text-lg font-bold text-slate-400 mb-6 uppercase tracking-[0.4em] relative z-10">GIẤY CHỨNG NHẬN HOÀN THÀNH XUẤT SẮC</p>
          
          {/* Student Name */}
          <div className="relative z-10 text-center mb-6">
            <p className="text-slate-400 font-bold italic mb-2">Vinh danh học viên:</p>
            <h3 className="text-7xl font-black text-slate-900 border-b-8 border-brand-500 px-16 pb-3 inline-block font-display leading-tight">{studentName || "NGÔI SAO NHÍ"}</h3>
          </div>
          
          {/* Topic & Date info below name */}
          <div className="text-center mb-8 relative z-10">
            <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">CHỦ ĐỀ HỌC TẬP</p>
            <p className="text-4xl font-black text-brand-700 uppercase italic mb-4">"{topic}"</p>
            <div className="inline-block bg-slate-100 px-6 py-2 rounded-full border-2 border-slate-200">
               <span className="text-slate-500 font-black text-sm uppercase tracking-widest">Ngày hoàn thành: </span>
               <span className="text-brand-700 font-black text-lg">{fullDateStr}</span>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="grid grid-cols-2 gap-10 w-full max-w-4xl mb-8 bg-slate-50/80 p-8 rounded-[3rem] border-4 border-white shadow-inner relative z-10">
             <div className="flex flex-col items-center border-r-4 border-white pr-6">
                <p className="text-[12px] font-black text-slate-400 uppercase mb-3 tracking-widest">ĐIỂM SỐ HỆ 10</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-[10rem] font-black text-brand-600 leading-none drop-shadow-xl">{score.toFixed(1)}</p>
                  <p className="text-5xl font-black text-slate-300">/10</p>
                </div>
                <p className="mt-4 bg-brand-500 text-white px-10 py-3 rounded-full font-black text-2xl shadow-xl border-b-[8px] border-brand-700 transform rotate-[-2deg]">{evaluation.emoji} {evaluation.text}</p>
             </div>
             <div className="flex flex-col justify-center pl-6 text-left space-y-4">
                <p className="text-2xl font-bold text-slate-600 italic leading-relaxed">"{evaluation.praise}"</p>
                <div className="bg-white p-6 rounded-3xl border-2 border-brand-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 text-brand-100 text-4xl">🌟</div>
                  <p className="text-xs font-black text-brand-500 uppercase mb-2 tracking-widest">KẾT QUẢ CHI TIẾT:</p>
                  <p className="text-3xl font-black text-slate-800">Đúng {totalCorrect} / 50 câu.</p>
                </div>
             </div>
          </div>

          {/* Signature & Date Footer */}
          <div className="w-full flex justify-between items-end mt-auto px-10 relative z-10">
             <div className="text-left">
                <p className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">MD-CERTIFICATE-ID: {Date.now()}</p>
                <p className="text-2xl font-black text-brand-600 uppercase tracking-[0.2em] mt-2">English with Heart</p>
                <p className="text-sm font-bold text-slate-400 italic mt-1">Cấp tại Hải Phòng</p>
             </div>
             <div className="text-right">
                <div className="text-center">
                    <div className="w-40 h-2 bg-brand-800 mb-3 ml-auto rounded-full"></div>
                    <p className="text-4xl font-black text-brand-900 italic font-serif leading-none">Mrs. Dung</p>
                    <p className="text-xs font-black text-brand-500 uppercase tracking-[0.3em] mt-2">Giáo viên sáng lập</p>
                </div>
                <p className="text-sm font-black text-slate-500 mt-6 tracking-tighter italic">{currentDate}</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
