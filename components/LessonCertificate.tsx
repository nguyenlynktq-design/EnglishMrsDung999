
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
  const [fullDateStr, setFullDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    setFullDateStr(`${day}/${month}/${year}`);
  }, []);

  const downloadCert = async () => {
    if (!certRef.current) return;
    try {
      const originalTransform = certRef.current.style.transform;
      certRef.current.style.transform = 'none';

      const dataUrl = await toPng(certRef.current, {
        pixelRatio: 3,
        backgroundColor: '#ffffff',
        width: 900,
        height: 640
      });

      certRef.current.style.transform = originalTransform;

      const link = document.createElement('a');
      link.download = `ChungNhan-${studentName || 'HocSinh'}-${fullDateStr}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      alert("Lỗi tải chứng nhận, vui lòng thử lại!");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      {/* Control Bar */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-4">
        <h2 className="text-white font-bold text-xl">📜 Giấy chứng nhận</h2>
        <div className="flex gap-3">
          <button onClick={downloadCert} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-400 transition-all flex items-center gap-2">
            💾 Tải về
          </button>
          <button onClick={onClose} className="bg-rose-500 text-white px-4 py-3 rounded-xl font-bold hover:bg-rose-600 transition-all">
            ✕
          </button>
        </div>
      </div>

      {/* Certificate */}
      <div className="relative flex items-center justify-center w-full overflow-hidden">
        <div
          ref={certRef}
          className="w-[900px] h-[640px] bg-white rounded-lg shadow-2xl shrink-0 origin-center scale-[0.35] sm:scale-[0.5] md:scale-[0.7] lg:scale-[0.85] xl:scale-100 overflow-hidden"
        >
          {/* Golden Border Frame */}
          <div className="absolute inset-3 border-4 border-brand-300 rounded-lg"></div>
          <div className="absolute inset-5 border-2 border-brand-200 rounded-lg"></div>

          {/* Content Container */}
          <div className="relative h-full flex flex-col items-center justify-between px-12 py-10">

            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-lg">🏫</div>
              <p className="text-sm font-bold text-brand-600 uppercase tracking-[0.3em] mb-1">Trung tâm Ngoại Ngữ English Mrs. Dung</p>
              <h1 className="text-3xl font-black text-brand-800 uppercase tracking-wide">GIẤY CHỨNG NHẬN</h1>
              <p className="text-sm text-slate-500 font-semibold mt-1">Hoàn thành xuất sắc bài học</p>
            </div>

            {/* Student Name */}
            <div className="text-center -mt-2">
              <p className="text-sm text-slate-400 italic mb-2">Vinh danh học viên:</p>
              <h2 className="text-5xl font-black text-slate-800 tracking-tight">{studentName || "Học sinh giỏi"}</h2>
              <div className="w-48 h-1 bg-brand-500 mx-auto mt-3 rounded-full"></div>
            </div>

            {/* Topic */}
            <div className="text-center -mt-2">
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">Chủ đề học tập</p>
              <p className="text-xl font-bold text-brand-700 italic max-w-lg leading-tight">"{topic}"</p>
            </div>

            {/* Score Section - Centered and Prominent */}
            <div className="flex items-center justify-center gap-8 -mt-2">
              {/* Score Circle */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-xl">
                  <div className="text-center">
                    <span className="text-5xl font-black text-white leading-none">{score.toFixed(1)}</span>
                    <span className="text-lg text-white/80 font-bold">/10</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase mt-2 tracking-wider">Điểm số</p>
              </div>

              {/* Evaluation Badge */}
              <div className="text-center">
                <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl px-6 py-4 shadow-md">
                  <p className="text-4xl mb-1">{evaluation.emoji}</p>
                  <p className="text-lg font-black text-amber-700">{evaluation.text}</p>
                  <p className="text-xs text-slate-500 mt-1">Đúng {totalCorrect}/40 câu</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="w-full flex justify-between items-end">
              <div className="text-left">
                <p className="text-xs text-slate-400">Ngày cấp: {fullDateStr}</p>
                <p className="text-sm font-bold text-brand-600 mt-1">English with Heart 💚</p>
              </div>
              <div className="text-right">
                <div className="w-32 h-0.5 bg-slate-800 mb-2"></div>
                <p className="text-2xl font-black text-slate-800" style={{ fontFamily: 'Georgia, serif' }}>Mrs. Dung</p>
                <p className="text-xs text-brand-600 font-bold mt-1">Giám đốc Trung tâm</p>
                <p className="text-[10px] text-slate-400">Trung tâm Ngoại Ngữ English Mrs. Dung</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
