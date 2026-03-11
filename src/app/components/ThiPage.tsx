import React, { useState, useEffect } from 'react';
import { PlayCircle, ArrowLeft, Car, Truck, Bike, History, Star, AlertCircle } from 'lucide-react';
import { QuizGame } from './QuizGame';
import { toast } from 'sonner';
import { Question, Chapter } from '@/app/types';

// Danh sách các bằng lái
const LICENSE_TYPES = [
  {
    code: "B1",
    name: "Hạng B1",
    description: "Ô tô số tự động, không kinh doanh (cá nhân, gia đình)",
    color: "text-green-500",
    bg: "bg-green-50",
    border: "border-green-200"
  },
  {
    code: "B2",
    name: "Hạng B2",
    description: "Ô tô số sàn, được kinh doanh vận tải (taxi, grab, giao hàng…)",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200"
  },
  {
    code: "C",
    name: "Hạng C",
    description: "Ô tô tải và ô tô chuyên dùng (trên 3,5 tấn)",
    color: "text-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200"
  },
  {
    code: "D",
    name: "Hạng D",
    description: "Ô tô chở người từ 10–30 chỗ",
    color: "text-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200"
  },
  {
    code: "E",
    name: "Hạng E",
    description: "Ô tô chở người trên 30 chỗ",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200"
  }
];


interface ThiPageProps {
  isAuthenticated: boolean;
  onShowAuth: () => void;
  onNavigateHistory: () => void;
  questions: Question[];
  chapters?: Chapter[];
  retakeQuestions?: Question[] | null;
  retakeExamTitle?: string | null;
  onConsumeRetake?: () => void;
}

export const ThiPage: React.FC<ThiPageProps> = ({ isAuthenticated, onShowAuth, onNavigateHistory, questions: allQuestions, chapters: propChapters, retakeQuestions, retakeExamTitle, onConsumeRetake }) => {
  // State: null = trang chủ thi, object = đang chọn bằng lái cụ thể
  const [selectedLicense, setSelectedLicense] = useState<typeof LICENSE_TYPES[0] | null>(null);
  
  // State: null = chưa chọn đề, object = đang làm bài thi (hoặc xem chi tiết đề)
  const [selectedExam, setSelectedExam] = useState<{title: string, topic: string} | null>(null);
  
  // Selected questions for the current exam
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examConfig, setExamConfig] = useState<{timeSeconds?: number; passCount?: number; paralysisMandatory?: boolean} | null>(null);

  useEffect(() => {
    if (retakeQuestions && retakeQuestions.length > 0) {
      setExamQuestions(retakeQuestions);
      setSelectedExam({ title: retakeExamTitle || 'Làm lại câu sai', topic: `Làm lại ${retakeQuestions.length} câu sai` });
      onConsumeRetake?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retakeQuestions]);

  // If user clicked retake from history, initialize examQuestions accordingly
  useEffect(() => {
    // props retakeQuestions handled in caller (App) by passing them; avoid reading window here
  }, []);

  const handleStartExam = (exam: {title: string, topic: string}) => {
    // Simple logic: Take 35 random questions or all if less than 35
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    setExamQuestions(shuffled.slice(0, 35));
    setSelectedExam(exam);
  };

  const getLicenseIcon = (code: string) => {
    if (code.startsWith('A')) return <Bike size={32} />;
    if (code.startsWith('B')) return <Car size={32} />;
    if (code.startsWith('C') || code.startsWith('F')) return <Truck size={32} />;
    return <Truck size={32} />; // D, E dùng chung icon xe lớn
  };

  // Admin / debug: show all questions fetched from API/localStorage
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const chapters = propChapters && propChapters.length ? propChapters : [];

  // 1. Màn hình chi tiết bài thi (Placeholder)
  if (selectedExam) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 animate-fade-in relative min-h-[600px] p-4">
        <button 
          onClick={() => setSelectedExam(null)}
          className="absolute top-8 left-8 flex items-center gap-2 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all hover:shadow-md border border-blue-100 z-20"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Quay lại danh sách đề</span>
        </button>
        
        {/* Quiz Interface Replaces Previous Start Screen */}
            <div className="w-full h-full flex items-center justify-center pt-16">
          <QuizGame 
            examTitle={selectedExam.title} 
            questions={examQuestions}
            onExit={() => setSelectedExam(null)} 
            examConfig={examConfig ?? undefined}
          />
        </div>
      </div>
    );
  }

  // 2. Màn hình danh sách đề thi của một bằng lái cụ thể
  if (selectedLicense) {
    return (
      <div className="w-full h-full p-8 bg-gradient-to-b from-blue-50 via-white to-blue-50 animate-fade-in overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-md mb-4">
              <div className={selectedLicense.color}>
                {getLicenseIcon(selectedLicense.code)}
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Bộ Đề Thi {selectedLicense.name}
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">{selectedLicense.description}</p>
            
            <button 
              onClick={() => {
                // Helper: Fisher-Yates shuffle
                const shuffle = <T,>(arr: T[]) => {
                  const a = [...arr];
                  for (let i = a.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [a[i], a[j]] = [a[j], a[i]];
                  }
                  return a;
                };

                if (selectedLicense.code === 'B1') {
                  // Desired per-chapter counts for B1
                  const desired: Record<number, number> = {
                    1: 9,
                    3: 1,
                    4: 1,
                    5: 1,
                    6: 9,
                    7: 9,
                  };

                  const selected: Question[] = [];
                  const usedIds = new Set<string>();

                  // Try to include exactly one paralysis question from the chapters above if possible
                  let needParalysis = true;

                  // First pass: pick per-chapter, reserving one slot for paralysis when found
                  for (const chapStr of Object.keys(desired)) {
                    const chap = Number(chapStr);
                    const want = desired[chap];
                    const pool = shuffle(allQuestions.filter(q => q.chapterId === chap && !usedIds.has(q.id)));

                    // If we still need a paralysis and this chapter has one, take it first (reserve one)
                    if (needParalysis) {
                      const paralysisIdx = pool.findIndex(q => q.isParalysis);
                      if (paralysisIdx !== -1) {
                        const pq = pool.splice(paralysisIdx, 1)[0];
                        selected.push(pq);
                        usedIds.add(pq.id);
                        needParalysis = false;
                      }
                    }

                    // Fill the rest for this chapter up to 'want'
                    for (let i = 0; i < want && pool.length > 0; i++) {
                      const q = pool.shift()!;
                      if (!usedIds.has(q.id)) {
                        selected.push(q);
                        usedIds.add(q.id);
                      } else {
                        // continue to next if somehow duplicate
                        i--;
                      }
                    }
                  }

                  // If we still need paralysis, try to find one anywhere (not already selected)
                  if (needParalysis) {
                    const globalPar = allQuestions.find(q => q.isParalysis && !usedIds.has(q.id));
                    if (globalPar) {
                      // replace a non-paralysis selected question with this one
                      const replaceIdx = selected.findIndex(q => !q.isParalysis);
                      if (replaceIdx !== -1) {
                        usedIds.delete(selected[replaceIdx].id);
                        selected[replaceIdx] = globalPar;
                        usedIds.add(globalPar.id);
                        needParalysis = false;
                      } else {
                        // no non-paralysis to replace (very unlikely) -> just push and later trim
                        selected.push(globalPar);
                        usedIds.add(globalPar.id);
                        needParalysis = false;
                      }
                    }
                  }

                  // If some chapters didn't have enough questions, DO NOT auto-fill from unrelated chapters.
                  // Instead keep the actual per-chapter selection (may be <30) and notify the user.
                  const shortages: number[] = [];
                  for (const chapStr of Object.keys(desired)) {
                    const chap = Number(chapStr);
                    const got = selected.filter(q => q.chapterId === chap).length;
                    if (got < desired[chap]) shortages.push(chap);
                  }

                  if (shortages.length > 0) {
                    // Notify which chapters were short and that the exam will have fewer questions
                    const chapNames = shortages.map(c => `Chương ${c}`).join(', ');
                    toast.warning(`Không đủ câu cho: ${chapNames}. Đề sẽ có ${selected.length} câu.`);
                  }

                  // If we have more than 30 (possible if we pushed a global paralysis), trim to 30
                  let finalSelected = selected.slice(0, 30);

                  // As a last safety, ensure exactly one paralysis question included (if possible)
                  const paralysisCount = finalSelected.filter(q => q.isParalysis).length;
                  if (paralysisCount === 0) {
                    // try to swap in one
                    const globalPar2 = allQuestions.find(q => q.isParalysis && !finalSelected.some(f => f.id === q.id));
                    if (globalPar2) {
                      // replace last non-paralysis
                      const replaceIdx = finalSelected.findIndex(q => !q.isParalysis);
                      if (replaceIdx !== -1) finalSelected[replaceIdx] = globalPar2;
                    }
                  } else if (paralysisCount > 1) {
                    // reduce to 1 by replacing extras with non-paralysis leftovers
                    let keepOne = false;
                    for (let i = finalSelected.length - 1; i >= 0; i--) {
                      if (finalSelected[i].isParalysis) {
                        if (!keepOne) {
                          keepOne = true;
                          continue;
                        }
                        // find a replacement non-paralysis
                        const replacement = allQuestions.find(q => !q.isParalysis && !finalSelected.some(f => f.id === q.id));
                        if (replacement) finalSelected[i] = replacement;
                      }
                    }
                  }

                  // Final shuffle within the selected set so order is random
                  finalSelected = shuffle(finalSelected);

                  setExamQuestions(finalSelected);
                  setExamConfig({ timeSeconds: 20 * 60, passCount: 27, paralysisMandatory: true });
                  setSelectedExam({ 
                    title: `${selectedLicense.code} - Thi Sát Hạch`, 
                    topic: `Thời gian: 20 phút - 30 câu hỏi` 
                  });
                } else {
                  const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
                  setExamQuestions(shuffled.slice(0, 35));
                  setExamConfig(null);
                  setSelectedExam({ 
                    title: `${selectedLicense.code} - Thi Sát Hạch`, 
                    topic: `Thời gian: 22 phút - 35 câu hỏi` 
                  });
                }
              }}
              className="px-12 py-4 bg-blue-600 text-white text-xl font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Làm bài
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Màn hình chính (Trang chủ Thi Sát Hạch)
  return (
    <div className="w-full h-full bg-gradient-to-b from-white via-blue-50/30 to-white animate-fade-in overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Phần 1: Chọn Văn Bằng */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">Chọn Văn Bằng</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Chọn hạng bằng lái xe bạn đang ôn tập để làm các đề thi sát với thực tế nhất.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LICENSE_TYPES.map((license) => (
              <button 
                key={license.code}
                onClick={() => setSelectedLicense(license)}
                className={`
                  bg-white p-6 rounded-xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg text-left group
                  ${license.border} hover:border-current
                `}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${license.bg} ${license.color}`}>
                    {getLicenseIcon(license.code)}
                  </div>
                  <span className={`px-3 py-1.5 rounded text-sm font-bold ${license.bg} ${license.color}`}>
                    {license.code}
                  </span>
                </div>
                
                <h3 className={`text-xl font-bold group-hover:text-current text-gray-800`}>
                  {license.name}
                </h3>
                
                <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-current transition-colors mt-4">
                  <span>Vào thi ngay</span>
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-10">
          <div className="h-px bg-gray-200 flex-1"></div>
          <span className="text-gray-400 font-medium text-sm uppercase tracking-wider">Hoặc</span>
          <div className="h-px bg-gray-200 flex-1"></div>
        </div>

        {/* Phần 2: Hành động nhanh (Thi thử & Lịch sử) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card Thi Thử */}
          <button 
            onClick={() => {
              const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
              setExamQuestions(shuffled.slice(0, 35));
              setSelectedExam({ 
                title: "Thi Thử Ngẫu Nhiên", 
                topic: "Hệ thống sẽ tạo đề thi ngẫu nhiên dựa trên cấu trúc đề thi chuẩn của Bộ GTVT" 
              });
            }}
            className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-8 text-white shadow-lg hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group text-left"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
              <PlayCircle size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                <PlayCircle size={32} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">Thi Thử Ngẫu Nhiên</h3>
              <p className="text-blue-100 text-lg mb-6 max-w-md">
                Làm bài thi được tạo ngẫu nhiên giống như thi thật. Kiểm tra kiến thức tổng quát của bạn.
              </p>
              <div className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-xl backdrop-blur-sm transition-colors font-semibold">
                Bắt đầu ngay <ArrowLeft className="rotate-180" size={20} />
              </div>
            </div>
          </button>

          {/* Card Lịch Sử */}
          <button 
            onClick={() => {
              if (isAuthenticated) {
                onNavigateHistory();
              } else {
                onShowAuth();
              }
            }}
            className="bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group text-left"
          >
             <div className="absolute top-0 right-0 p-8 text-gray-100 transform group-hover:scale-110 transition-transform duration-500">
              <History size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
                <History size={32} className="text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Lịch Sử Làm Bài</h3>
              <p className="text-gray-600 text-lg mb-6 max-w-md">
                {isAuthenticated 
                  ? "Xem lại kết quả các bài thi bạn đã thực hiện để theo dõi sự tiến bộ." 
                  : "Đăng nhập để lưu lại kết quả thi và theo dõi tiến trình học tập của bạn."}
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-100 group-hover:bg-purple-50 text-gray-700 group-hover:text-purple-700 px-6 py-3 rounded-xl transition-colors font-semibold">
                {isAuthenticated ? "Xem lịch sử" : "Đăng nhập ngay"} <ArrowLeft className="rotate-180" size={20} />
              </div>
            </div>
          </button>
        </div>

        {/* Tips / Info Banner */}
        <div className="mt-16 bg-yellow-50 border border-yellow-200 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 text-yellow-600">
            <AlertCircle size={24} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h4 className="font-bold text-yellow-800 text-lg mb-1">Lưu ý quan trọng</h4>
            <p className="text-yellow-700 text-sm">
              Cấu trúc đề thi và thời gian làm bài sẽ thay đổi tùy theo hạng bằng bạn chọn. 
              Hãy chắc chắn chọn đúng hạng bằng để có kết quả đánh giá chính xác nhất.
            </p>
          </div>
          <button className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors shadow-sm">
            Xem quy định thi
          </button>
        </div>

        {/* Danh sách tất cả câu hỏi (từ API / localStorage) */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Danh sách câu hỏi (từ API)</h3>
            <button
              onClick={() => setShowAllQuestions(prev => !prev)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              {showAllQuestions ? 'Ẩn' : 'Hiện tất cả câu hỏi'}
            </button>
          </div>

          {showAllQuestions && (
            allQuestions.length === 0 ? (
              <div className="p-6 bg-white rounded-2xl border border-gray-100 text-center text-gray-500">Chưa có câu hỏi trong hệ thống</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {allQuestions.map((q) => (
                  <div key={q.id} className={`bg-white p-4 rounded-2xl border ${q.isParalysis ? 'border-red-100' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-500">ID: {q.id}</div>
                      <div className="text-sm text-gray-500">Chương: {chapters.find(c => c.id === q.chapterId)?.title ?? `Chương ${q.chapterId}`}</div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-3">{q.content}</h4>
                    <ul className="space-y-2">
                      {q.options.map((opt, idx) => (
                        <li key={idx} className={`p-2 rounded ${idx === q.correctAnswer ? 'bg-green-50 border border-green-100 text-green-800' : 'bg-gray-50 border border-gray-100'}`}>
                          <div className="text-sm">{String.fromCharCode(65 + idx)}. {opt}</div>
                        </li>
                      ))}
                    </ul>
                    {q.explanation && <p className="mt-3 text-sm text-gray-500">Giải thích: {q.explanation}</p>}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};
