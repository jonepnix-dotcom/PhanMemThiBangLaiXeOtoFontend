import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Wrench, AlertTriangle, Map as MapIcon, Zap, Gavel, ArrowLeft, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Question } from '@/app/types';
import { QuizGame } from '@/app/components/QuizGame';
import { url } from '../../env.js';
import trafficSignService from '@/app/services/trafficSignService';

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
  const [selectedChapter, setSelectedChapter] = useState<any>(null);
  const [showParalysisOnly, setShowParalysisOnly] = useState(false);
  const [paralysisQuestions, setParalysisQuestions] = useState<Question[]>([]);
  const [loadingParalysis, setLoadingParalysis] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [attemptResult, setAttemptResult] = useState<'correct' | 'wrong' | null>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [showTrafficSigns, setShowTrafficSigns] = useState(false);
  const [trafficSigns, setTrafficSigns] = useState<any[]>([]);
  const [loadingSigns, setLoadingSigns] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [totalCount, setTotalCount] = useState(0);
  const paginationRange = React.useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const range: Array<number | string> = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
        range.push('...');
      }
    }
    return Array.from(new Set(range));
  }, [totalCount, currentPage, pageSize]);
  const resolveSignImage = (img?: string | null) => {
    if (!img) return null;
    const trimUrl = (u: string) => u.endsWith('/') ? u.slice(0, -1) : u;
    if (/^https?:\/\//i.test(img)) return img;
    const base = trimUrl(url);
    if (img.startsWith('/')) {
      return base + img;
    }
    if (img.startsWith('assets/') || img.startsWith('uploads/')) {
      return base + '/' + img;
    }
    return base + '/assets/uploads/' + img;
  };

  // Fetch chuong data directly component load
  useEffect(() => {
    const fetchChuong = async () => {
      try {
        const res = await fetch(`${url}api/chuong`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        const formattedChapters = data.map((c: any) => {
          return {
            id: c.categoryId,
            title: `Chương ${c.categoryId}`,
            topic: c.categoryName,
            icon: getIconForCategory(c.categoryId),
            detail: "Đang cập nhật",
          };
        });
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
      return paralysisQuestions.length > 0 ? paralysisQuestions : questions.filter(q => q.isParalysis);
    }

    if (selectedChapter) {
      // Mặc định: lọc theo ID chương
      return questions.filter(q => q.chapterId === selectedChapter.id);
    }
    return [];
  }, [questions, selectedChapter, showParalysisOnly]);

  const handleParalysisClick = async () => {
    try {
      setLoadingParalysis(true);
      const res = await fetch(`${url}api/CauHoi?CauDiemLiet=true&SoLuong=1000`);
      if (!res.ok) throw new Error('Network error');
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Invalid JSON response:', text);
        throw e;
      }
      
      const qArray = Array.isArray(data) ? data : (data.questions || data.data || data.items || []);
      const mappedQuestions: Question[] = qArray.map((q: any) => {
        const options = Array.isArray(q.answers) ? q.answers.map((a: any) => a?.answerContent ?? String(a)) : [];
        let correctIndex = 0;
        if (Array.isArray(q.answers)) {
          const idx = q.answers.findIndex((a: any) => a && a.isCorrect === true);
          if (idx !== -1) correctIndex = idx;
        }

        return {
          id: `api-${String(q.id)}`,
          content: q.questionContent ?? '',
          options,
          correctAnswer: Math.max(0, Math.min(correctIndex, options.length - 1)),
          chapterId: (q.categories && q.categories.length > 0) ? q.categories[0] : 0,
          isParalysis: !!q.isCritical,
          imageUrl: q.imageUrl ?? '',
          explanation: q.explanation ?? '',
          optionExplanations: [],
        };
      });

      setParalysisQuestions(mappedQuestions);
      setShowParalysisOnly(true);
    } catch (err) {
      console.error('Failed to fetch critical questions:', err);
      // Fallback
      setShowParalysisOnly(true);
    } finally {
      setLoadingParalysis(false);
    }
  };

  // Launch the ReviewGame
  // Fetch traffic signs from server when the traffic view is opened or paging changes
  useEffect(() => {
    let cancelled = false;
    const fetchSigns = async () => {
      if (!showTrafficSigns) return;
      setLoadingSigns(true);
      try {
        const result = await trafficSignService.getPaged(currentPage, pageSize);
        if (!cancelled) {
          let items = result.items || [];
          let total = typeof result.total === 'number' ? result.total : items.length;

          // Nếu server trả về toàn bộ danh sách (không phân trang) => result.total === items.length
          // Trong trường hợp đó, ta cắt (slice) client-side để hiển thị đúng trang hiện tại.
          if (total === items.length && items.length > pageSize) {
            const start = (currentPage - 1) * pageSize;
            items = items.slice(start, start + pageSize);
            // total giữ nguyên là tổng phần tử để pagination vẫn hiển thị chính xác
          }

          setTrafficSigns(items);
          setTotalCount(total);
        }
      } catch (err) {
        console.error('Failed to load traffic signs', err);
        if (!cancelled) {
          setTrafficSigns([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) setLoadingSigns(false);
      }
    };

    fetchSigns();
    return () => { cancelled = true; };
  }, [showTrafficSigns, currentPage, pageSize]);

  if (selectedChapter || showParalysisOnly || showTrafficSigns) {
    // Special view for traffic signs (admin-like layout)
    if (showTrafficSigns) {
      const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
      const startItem = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
      const endItem = Math.min(totalCount, currentPage * pageSize);
      return (
        <div className="max-w-[1400px] mx-auto p-6">
          <div className="flex items-center justify-end mb-4">
            <button
              onClick={() => setShowTrafficSigns(false)}
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-semibold">Quay lại</span>
            </button>
          </div>

          <div className="px-5 py-4 bg-white rounded-xl mb-6 flex items-center justify-between shadow-2xl border border-slate-100 z-40">
            <div>
              <div className="inline-flex items-center gap-3">
                <div className="text-sm text-slate-900 font-extrabold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md shadow-sm">Tổng cộng: {totalCount} mục</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">Hiển thị {startItem}-{endItem} trên {totalCount}</div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number((e.target as HTMLSelectElement).value)); setCurrentPage(1); }}
                className="border rounded px-3 py-2 text-sm bg-white shadow-sm"
              >
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
              </select>

              <div className="flex items-center gap-2 bg-white p-3 rounded-3xl border border-slate-200 shadow-lg">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="flex items-center justify-center p-3 hover:bg-slate-100 rounded-lg disabled:opacity-40 text-slate-500 transition-all"
                >
                  {'<<'}
                </button>

                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-3 hover:bg-slate-100 rounded-lg disabled:opacity-40 text-slate-500 transition-all"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center mx-1">
                  {paginationRange.map((page, idx) => (
                    <React.Fragment key={idx}>
                      {page === '...' ? (
                        <span className="w-10 text-center text-slate-300 font-bold select-none">...</span>
                      ) : (
                        <button
                          onClick={() => setCurrentPage(Number(page))}
                          className={`min-w-[40px] h-10 mx-1 rounded-full text-sm font-semibold transition-all ${currentPage === page ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border border-transparent hover:border-indigo-100 text-slate-600'}`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-3 hover:bg-slate-100 rounded-lg disabled:opacity-40 text-slate-500 transition-all"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="flex items-center justify-center p-3 hover:bg-slate-100 rounded-lg disabled:opacity-40 text-slate-500 transition-all"
                >
                  {'>>'}
                </button>
              </div>
            </div>
          </div>

          <main>
            {loadingSigns ? (
              <div>Đang tải...</div>
            ) : trafficSigns.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                Không có biển báo.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                {trafficSigns.map((sign) => (
                  <div key={sign.id} className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300">
                    <div className="aspect-square bg-slate-50 relative flex items-center justify-center p-8">
                      {resolveSignImage(sign.imageUrl) ? (
                        <img
                          src={resolveSignImage(sign.imageUrl) as string}
                          alt={sign.name}
                          className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : null}
                    </div>
                    <div className="p-6">
                      <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">{sign.categoryName}</span>
                      <h3 className="font-bold text-slate-800 uppercase text-sm line-clamp-1 mb-1">{sign.name}</h3>
                      <p className="text-[11px] text-slate-400 line-clamp-2 h-8 leading-relaxed">{sign.description || 'Không có mô tả'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      );
    }

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
        resultFullPage={true}
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
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 sm:p-6 p-2">
          {chapters.map((chapter) => {
            const count = questions.filter(q => q.chapterId === chapter.id).length;
            const displayDetail = count > 0 ? `${count} câu` : chapter.detail;
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
            onClick={handleParalysisClick}
            disabled={loadingParalysis}
            className={`bg-white p-2 md:p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:border-red-200 transition-all duration-300 flex flex-col gap-4 hover:-translate-y-1 group text-left h-full ${loadingParalysis ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <AlertCircle size={32} className="text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-[12px] md:text-lg font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {loadingParalysis ? 'Đang tải...' : 'Các câu điểm liệt'}
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

          {/* Nút Biển báo */}
          <button
            onClick={() => {
              setCurrentPage(1);
              setShowTrafficSigns(true);
            }}
            className="bg-white p-2 md:p-6 rounded-xl shadow-md hover:shadow-xl border border-gray-100 hover:border-green-200 transition-all duration-300 flex flex-col gap-4 hover:-translate-y-1 group text-left h-full"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                <MapIcon size={32} className="text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-[12px] md:text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  Biển báo
                </h3>
              </div>
            </div>

            <p className="text-gray-700 text-[10px] md:text-sm leading-relaxed flex-1">
              Ôn tập nhận biết các loại biển báo giao thông
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
              <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                Xem biển báo
              </span>
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-green-600 rotate-180 transition-all" />
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
