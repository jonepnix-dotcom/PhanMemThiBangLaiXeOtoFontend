import React, { useEffect, useState } from 'react';
import { QuizGame } from './QuizGame';
import { Question } from '@/app/types';
import apiClient from '../api/axiosClient';
import { Home, BookOpen, Clock, Award, X } from 'lucide-react';

interface Attempt {
  id: number;
  examTitle: string;
  date: string;
  correctCount: number;
  totalQuestions?: number;
  isPassed: boolean;
  timeTakenSeconds: number;
  incorrectQuestions?: Question[];
  questions?: Question[];
  selectedAnswers?: Record<string, number>;
  failedByCritical?: boolean;
  licenceCode?: string | null;
  licenceId?: number | null;
}

interface HistoryPageProps {
  userName: string;
  onBackToHome: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ userName, onBackToHome }) => {
  const [history, setHistory] = useState<Attempt[]>([]);
  const [retryQuestions, setRetryQuestions] = useState<Question[] | null>(null);
  const [retryTitle, setRetryTitle] = useState<string>('');
  const [retryLicenceId, setRetryLicenceId] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedHistoryDetail, setSelectedHistoryDetail] = useState<any[] | null>(null);
  const [selectedHistoryTitle, setSelectedHistoryTitle] = useState<string>('');
  const [selectedHistorySource, setSelectedHistorySource] = useState<Attempt | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await apiClient.get('/KiemTra/LichSu');
        const data = response.data;
        const historyArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : [];
        if (historyArray.length > 0) {
          const parsed = historyArray.map((item: any) => {
            const id = Number(item.Id ?? item.id ?? item.ExamId ?? item.examId ?? 0);
            const licenceCode = item.LicenceCode ?? item.licenceCode ?? item.LicenseCode ?? item.licenseCode ?? item.LicenceCodeStr ?? '';
            const licenceId = Number(item.LicenceId ?? item.licenceId ?? item.LicenseId ?? item.licenseId ?? 0) || null;
            const createdAt = item.CreatedAt ?? item.createdAt ?? item.createdAtString ?? new Date().toISOString();
            const totalCorrect = Number(item.TotalCorrect ?? item.totalCorrect ?? 0);
            const totalQuestionsValue = item.TotalQuestions ?? item.totalQuestions ?? item.TotalQuestion ?? item.totalQuestion;
            return {
              id,
              examTitle: licenceCode ? `Bài thi ${licenceCode}` : `Bài thi #${id}`,
              date: createdAt,
              correctCount: totalCorrect,
              totalQuestions: totalQuestionsValue !== undefined ? Number(totalQuestionsValue) : totalCorrect,
              isPassed: Boolean(item.isPassed ?? item.IsPassed ?? item.passed ?? item.Passed),
              timeTakenSeconds: Number(item.TimeTakenSeconds ?? item.timeTakenSeconds ?? 0),
              failedByCritical: Boolean(item.HitCritical ?? item.hitCritical ?? item.Hitcritical ?? item.Hitcritical),
              incorrectQuestions: [],
              questions: [],
              selectedAnswers: {},
              licenceCode: licenceCode || null,
              licenceId,
            } as Attempt;
          });
          setHistory(parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          return;
        }
        setHistory([]);
      } catch (err) {
        console.error('Failed to load history from API', err);
        setHistory([]);
      }
    };
    loadHistory();
  }, []);

  const totalAttempts = history.length;
  const passedCount = history.filter(h => h.isPassed).length;
  const totalTimeSeconds = history.reduce((s, h) => s + (h.timeTakenSeconds || 0), 0);
  const totalIncorrect = history.reduce((acc, h) => acc + (h.incorrectQuestions ? h.incorrectQuestions.length : 0), 0);
  const getDisplayedTotal = (h: Attempt) => h.totalQuestions ?? h.correctCount;

  const aggregateIncorrectQuestions = (): Question[] => {
    const map = new Map<number | string, Question>();
    history.forEach(h => {
      (h.incorrectQuestions || []).forEach(q => {
        if (!map.has(q.id)) map.set(q.id, q);
      });
    });
    return Array.from(map.values());
  };

  const computeDetailCounts = (detail: any[] | null) => {
    if (!detail || !Array.isArray(detail)) return { correct: 0, wrong: 0, unanswered: 0, total: 0 };
    let correct = 0, wrong = 0, unanswered = 0;
    detail.forEach(q => {
      if (!Array.isArray(q.answers) || q.answers.length === 0) {
        unanswered += 1;
        return;
      }
      const selIdx = q.answers.findIndex((a: any) => a.isSelected === true);
      if (selIdx === -1) {
        unanswered += 1;
      } else {
        if (q.answers[selIdx].correctAnswer) correct += 1;
        else wrong += 1;
      }
    });
    return { correct, wrong, unanswered, total: detail.length };
  };
  const mainContent = history.length === 0 ? (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-12 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <BookOpen size={48} className="text-blue-600" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-3">Chưa Có Lịch Sử Làm Bài</h2>
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">Bạn chưa hoàn thành bài thi nào. Hãy bắt đầu làm bài để xem kết quả tại đây!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:p-6 max-w-3xl mx-auto mt-8">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 sm:p-6 rounded-xl">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <BookOpen size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Tổng bài thi</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 sm:p-6 rounded-xl">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Award size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Bài đã đạt</p>
          <p className="text-3xl font-bold text-gray-900">0</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 sm:p-6 rounded-xl">
          <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Clock size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Thời gian luyện tập</p>
          <p className="text-3xl font-bold text-gray-900">0h</p>
        </div>
      </div>

      <button
        onClick={onBackToHome}
        className="mt-10 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
      >
        <Home size={20} />
        <span>Về Trang Chủ để Bắt Đầu</span>
      </button>
    </div>
  ) : (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-3 sm:p-6">
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lịch Sử Làm Bài</h2>
          <p className="text-sm text-gray-600">{userName}, có {totalAttempts} bài thi trong lịch sử của bạn</p>
        </div>

        <div className="flex items-center gap-4 flex-col sm:flex-row w-full sm:w-auto">
          {totalIncorrect > 0 && (
            <button
              onClick={() => {
                setRetryQuestions(aggregateIncorrectQuestions());
                setRetryTitle(`Làm lại toàn bộ: ${totalIncorrect} câu sai tổng hợp`);
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Làm lại câu sai ({totalIncorrect})
            </button>
          )}

          <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">{totalAttempts}</p>
              <p className="text-xs text-gray-500">Tổng bài</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-green-600">{passedCount}</p>
              <p className="text-xs text-gray-500">Đạt</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">{Math.floor(totalTimeSeconds / 60)}m</p>
              <p className="text-xs text-gray-500">Tổng thời gian</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {history.map(h => (
          <div key={h.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h4 className="font-bold text-gray-800 text-sm sm:text-base">{h.examTitle}</h4>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${h.isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {h.isPassed ? 'Đạt' : 'Không đạt'}
                  </span>
                  <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                    {h.correctCount}/{getDisplayedTotal(h)}
                  </span>
                  <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                    {Math.floor((h.timeTakenSeconds || 0) / 60)}m
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">{new Date(h.date).toLocaleString('vi-VN')}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    // fetch detail from API using history id
                    if (!h.id || h.id <= 0) {
                      alert('Không có id lịch sử để xem chi tiết.');
                      return;
                    }
                    setDetailLoading(true);
                    setSelectedHistoryDetail(null);
                    try {
                      // try path parameter first
                      let resp;
                      try {
                        resp = await apiClient.get(`/KiemTra/LichSu/${h.id}`);
                      } catch (err) {
                        resp = await apiClient.get(`/KiemTra/LichSu?id=${h.id}`);
                      }
                      const data = resp.data;
                      const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (Array.isArray(data?.items) ? data.items : []));
                      if (arr.length === 0 && data && typeof data === 'object' && Array.isArray(data.questions)) {
                        // some APIs return object with questions
                        setSelectedHistoryDetail(data.questions);
                        setSelectedHistoryTitle(h.examTitle);
                        setSelectedHistorySource(h);
                      } else {
                        setSelectedHistoryDetail(arr);
                        setSelectedHistoryTitle(h.examTitle);
                        setSelectedHistorySource(h);
                      }
                    } catch (err) {
                      console.error('Failed to load history detail', err);
                      alert('Không thể tải chi tiết lịch sử từ máy chủ.');
                    } finally {
                      setDetailLoading(false);
                    }
                  }}
                  disabled={detailLoading}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xem chi tiết
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {retryQuestions ? (
        <div className="fixed inset-0 z-50 bg-white sm:p-6 overflow-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setRetryQuestions(null)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
              Thoát
            </button>
          </div>
          <QuizGame
            examTitle={retryTitle || `Làm lại: ${retryQuestions.length} câu sai`}
            questions={retryQuestions}
            onExit={() => setRetryQuestions(null)}
            initialSelectedAnswers={(() => {
              try {
                const raw = window.sessionStorage.getItem('history_retry_selected');
                return raw ? JSON.parse(raw) : undefined;
              } catch (e) { return undefined; }
            })()}
            mode="learn"
            showTimer={false}
            autoAdvance={false}
            allowUnsure={false}
            submitButtonText="Hoàn thành"
            showImmediateExplanation={true}
            resultFullPage={true}
            licenceId={retryLicenceId}
            submitToServer={false}
          />
        </div>
      ) : null}

      {selectedHistoryDetail && (
        <div className="fixed inset-0 z-60 bg-white sm:p-6 overflow-auto">
          {/* Header with counts */}
          {(() => {
            const counts = computeDetailCounts(selectedHistoryDetail);
            return (
              <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-6 mb-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Chi tiết: {selectedHistoryTitle}</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">✓ Đúng: {counts.correct}</span>
                      <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">✗ Sai: {counts.wrong}</span>
                      <span className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">? Chưa làm: {counts.unanswered}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => { setSelectedHistoryDetail(null); }}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm border border-white/30 text-white font-semibold transition-all"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => {
                        // Allow retake only if the source history contains licence info
                        if (!selectedHistorySource || (!selectedHistorySource.licenceCode && !selectedHistorySource.licenceId)) {
                          alert('Không thể làm lại: bài này không thuộc hạng bằng cụ thể (đề ngẫu nhiên).');
                          return;
                        }
                        // Map server detail to QuizGame questions and selectedAnswers and open retry
                        if (!selectedHistoryDetail) return;
                        const mapped: Question[] = selectedHistoryDetail.map((q: any) => {
                          const options = Array.isArray(q.answers) ? q.answers.map((a: any) => a.answerContent ?? String(a)) : [];
                          const answerIds = Array.isArray(q.answers) ? q.answers.map((a: any) => Number(a.answerId ?? a.id ?? a)) : [];
                          const correctIndex = Array.isArray(q.answers) ? Math.max(0, q.answers.findIndex((a: any) => a.correctAnswer === true)) : 0;
                          return {
                            id: `api-${String(q.questionId)}`,
                            content: q.questionContent ?? '',
                            options,
                            answerIds,
                            correctAnswer: correctIndex,
                            chapterId: 1,
                            isParalysis: !!q.isCritical,
                            imageUrl: q.imageLink ?? '',
                            explanation: q.explain ?? ''
                          } as Question;
                        });
                        // selectedAnswers mapping
                        const sel: Record<string, number> = {};
                        selectedHistoryDetail.forEach((q: any) => {
                          if (Array.isArray(q.answers)) {
                            const idx = q.answers.findIndex((a: any) => a.isSelected === true);
                            if (idx !== -1) sel[`api-${q.questionId}`] = idx;
                          }
                        });
                        setSelectedHistoryDetail(null);
                        setRetryQuestions(mapped);
                        setRetryTitle(`Làm lại: ${selectedHistoryTitle}`);
                        setRetryLicenceId(selectedHistorySource.licenceId ?? null);
                        // Preselect answers by storing in sessionStorage as initialSelectedAnswers used elsewhere
                        try { window.sessionStorage.setItem('history_retry_selected', JSON.stringify(sel)); } catch (e) { }
                      }}
                      className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                    >
                      Làm lại
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="max-w-4xl mx-auto space-y-4 px-4 sm:px-0">
            {selectedHistoryDetail.map((q: any, index: number) => {
              const isUnanswered = !Array.isArray(q.answers) || q.answers.findIndex((a: any) => a.isSelected === true) === -1;
              return (
                <div key={q.questionId} className={`p-5 rounded-lg border transition-all ${isUnanswered ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-blue-200'}`}>
                  <div className="flex gap-3 mb-3">
                    <span className="inline-flex items-center justify-center bg-blue-600 text-white rounded-full w-8 h-8 text-sm font-bold flex-shrink-0">{index + 1}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-base leading-snug break-words">{q.questionContent}</h4>
                      {isUnanswered && (
                        <span className="inline-block text-xs font-semibold text-yellow-800 bg-yellow-200 px-2 py-1 rounded mt-2">
                          Chưa trả lời
                        </span>
                      )}
                    </div>
                  </div>

                  {q.imageLink && (
                    <div className="mb-3">
                      <img src={q.imageLink} alt="question" className="max-h-48 max-w-full object-contain rounded-md" />
                    </div>
                  )}

                  <div className="space-y-2 mb-3">
                    {Array.isArray(q.answers) && q.answers.map((a: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded-md border transition-all ${a.correctAnswer
                          ? 'bg-green-50 border-green-300'
                          : (a.isSelected ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200')
                          }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0 ${a.correctAnswer ? 'bg-green-500 text-white' : (a.isSelected ? 'bg-red-500 text-white' : 'bg-gray-300 text-white')
                            }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="font-medium text-gray-800 flex-1 break-words">{a.answerContent}</span>
                          <div className="flex-shrink-0 ml-2">
                            {a.correctAnswer && (
                              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded whitespace-nowrap">✓ Đúng</span>
                            )}
                            {a.isSelected && !a.correctAnswer && (
                              <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded whitespace-nowrap">✗ Sai</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {q.explain && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-700"><span className="font-semibold">Giải thích:</span> {q.explain}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-2 py-2">
        {mainContent}
      </div>
    </div>
  );
};
