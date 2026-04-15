import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Wrench, AlertTriangle, Map as MapIcon, Zap, Gavel, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Question } from '@/app/types';
import { QuizGame } from '@/app/components/QuizGame';
import { url } from '../../env.js';

const getIconForCategory = (id: number) => {
  switch (id) {
    case 1: return <Gavel size={32} className="text-blue-500" />;
    case 2: return <Shield size={32} className="text-green-500" />;
    case 3: return <Zap size={32} className="text-yellow-500" />;
    case 4: return <Wrench size={32} className="text-gray-500" />;
    case 5: return <AlertTriangle size={32} className="text-orange-500" />;
    case 6: return <MapIcon size={32} className="text-purple-500" />;
    default: return <CheckCircle size={32} className="text-gray-500" />;
  }
};

interface ReviewPageProps {
  questions: Question[];
}

// Cache để lưu các câu hỏi đã lấy theo chương hoặc loại, tránh gọi lại API nhiều lần
const questionCache: Record<string, Question[]> = {};

export const ReviewPage: React.FC<ReviewPageProps> = ({ questions }) => {
  // Read API-provided chapter question counts once per render (from localStorage 'chapters')
  const apiCounts = React.useMemo(() => {
    try {
      if (typeof window === 'undefined') return new Map();
      const raw = window.localStorage.getItem('chapters');
      if (!raw) return new Map();
      const parsed = JSON.parse(raw) as any[];
      if (!Array.isArray(parsed)) return new Map();
      const m: Map<number, number> = new Map();
      for (const c of parsed) {
        const id = Number(c.id);
        const len = Array.isArray(c.questionIds) ? c.questionIds.length : 0;
        m.set(id, len);
      }
      return m;
    } catch (err) {
      return new Map();
    }
  }, []);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [showParalysisOnly, setShowParalysisOnly] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [attemptResult, setAttemptResult] = useState<'correct' | 'wrong' | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);

  // Fetch chuong data directly component load
  useEffect(() => {
    const fetchChuong = async () => {
      try {
        const res = await fetch(`${url}api/chuong`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        const formattedChapters = data.map((c: any) => ({
          id: c.categoryId,
          title: `Chương ${c.categoryId}`,
          topic: c.categoryName,
          icon: getIconForCategory(c.categoryId),
          detail: "Đang cập nhật",
        }));
        setChapters(formattedChapters);
      } catch (err) {
        console.error("Failed to fetch chapters", err);
      }
    };
    fetchChuong();
  }, []);

  const [wrongQuestionIds, setWrongQuestionIds] = useState<string[]>(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('wrongQuestions') : null;
      if (!raw) return [];
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('wrongQuestions', JSON.stringify(wrongQuestionIds));
      }
    } catch (err) {
      // ignore
    }
  }, [wrongQuestionIds]);

  // Lọc trực tiếp từ kho dữ liệu đã được App.tsx lấy sẵn (chứa toàn bộ 600 câu ngay khi vào web)
  const filteredQuestions = React.useMemo(() => {
    if (showParalysisOnly) {
      return questions.filter(q => q.isParalysis);
    }

    if (selectedChapter) {
      // Mặc định: lọc theo ID chương
      return questions.filter(q => q.chapterId === selectedChapter.id);
    }
    return [];
  }, [questions, selectedChapter, showParalysisOnly]);

  // Launch the ReviewGame
  if (selectedChapter || showParalysisOnly) {
    const title = showParalysisOnly ? 'Các câu điểm liệt' : (selectedChapter ? `${selectedChapter.title}: ${selectedChapter.topic}` : 'Ôn tập');
    return (
      <QuizGame
        examTitle={title}
        questions={filteredQuestions}
        onExit={() => { setSelectedChapter(null); setShowParalysisOnly(false); }}
        showTimer={false}
        autoAdvance={false}
        allowUnsure={false}
        submitButtonText="Hoàn thành"
        showImmediateExplanation={true}
      />
    );
  }

  // 2. Mặc định: Hiển thị danh sách các chương ôn tập
  return (
  <div className="w-full h-full bg-gradient-to-b from-transparent via-blue-50/30 to-transparent animate-fade-in overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow mb-2">
            Nội Dung Ôn Tập 600 Câu Hỏi
          </h2>
          <p className="text-white/90 drop-shadow">Học theo từng chương để nắm vững kiến thức luật giao thông đường bộ</p>
        </div>
        
        <div className="grid grid-cols-2 gap-2 md:gap-4 sm:p-6">
          {chapters.map((chapter) => {
            const apiCount = apiCounts.get(chapter.id);
            const displayDetail = (typeof apiCount === 'number' && apiCount > 0) ? `${apiCount} câu` : chapter.detail;
            return (
            <button 
              key={chapter.id}
              onClick={() => setSelectedChapter(chapter)}
              className="bg-white p-2 md:p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:border-blue-200 transition-all duration-300 flex flex-col gap-4 hover:-translate-y-1 group text-left h-full"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                  {chapter.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-[12px] md:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {chapter.title}
                  </h3>
                </div>
              </div>
              
              <p className="text-gray-700 text-[10px] md:text-sm leading-relaxed flex-1">
                {chapter.topic}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                <span className="text-[9px] md:text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                  {displayDetail}
                </span>
                <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-blue-600 rotate-180 transition-all" />
              </div>
            </button>
            );
          })}
          
          {/* Nút Các câu hay liệt */}
          <button 
            onClick={() => setShowParalysisOnly(true)}
            className="bg-white p-2 md:p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all duration-300 flex flex-col gap-4 hover:-translate-y-1 group text-left h-full"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-[12px] md:text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  Các câu điểm liệt
                </h3>
              </div>
            </div>
            
            <p className="text-gray-700 text-[10px] md:text-sm leading-relaxed flex-1">
              Tổng hợp các câu hỏi điểm liệt quan trọng
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
              <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded">
                Ôn tập hiệu quả
              </span>
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-red-600 rotate-180 transition-all" />
            </div>
          </button>

          {/* Nút Câu Hỏi Biển Báo */}
          <button
            onClick={() => {
              const chap = chapters.find(c => c.id === 5);
              if (chap) setSelectedChapter(chap);
            }}
            className="bg-white p-2 md:p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:border-orange-200 transition-all duration-300 flex flex-col gap-4 hover:-translate-y-1 group text-left h-full"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <AlertTriangle size={32} className="text-orange-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-[12px] md:text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  Câu hỏi Biển báo
                </h3>
              </div>
            </div>

            <p className="text-gray-700 text-[10px] md:text-sm leading-relaxed flex-1">
              Tổng hợp các câu hỏi về hệ thống biển báo đường bộ
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
              <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                Biển báo & ký hiệu
              </span>
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-orange-600 rotate-180 transition-all" />
            </div>
          </button>

          {/* Nút Câu Hỏi Tình Huống */}
          <button
            onClick={() => {
              const chap = chapters.find(c => c.id === 6);
              if (chap) setSelectedChapter(chap);
            }}
            className="bg-white p-2 md:p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:border-purple-200 transition-all duration-300 flex flex-col gap-4 hover:-translate-y-1 group text-left h-full"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <MapIcon size={32} className="text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-[12px] md:text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  Câu hỏi Tình huống
                </h3>
              </div>
            </div>

            <p className="text-gray-700 text-[10px] md:text-sm leading-relaxed flex-1">
              Câu hỏi tình huống và các thế sa hình để luyện kỹ năng xử lý
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
              <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-1 rounded">
                Tình huống & sa hình
              </span>
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-purple-600 rotate-180 transition-all" />
            </div>
          </button>
        </div>
      </div>
      
      {/* Small footer with basic info */}
      <footer className="bg-white border-t z-10 relative">
        <div className="container mx-auto px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-700">
            <div className="font-bold text-gray-900">GROUP 3 .NET TECH</div>
            <div>Hotline: <a href="tel:333-88-222-55" className="text-blue-600 hover:underline">333-88-222-55</a></div>
            <div className="text-gray-500">© {new Date().getFullYear()} Nhóm 3. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};
