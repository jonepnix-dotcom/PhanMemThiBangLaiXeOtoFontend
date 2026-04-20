import React, { useEffect, useState } from 'react';
import { QuizGame } from './QuizGame';
import { Question } from '@/app/types';
import apiClient from '../api/axiosClient';
import { Home, AlertCircle, TrendingDown, X } from 'lucide-react';

interface FrequentlyWrongQuestion {
  questionId: number;
  content: string;
  categoryId: number;
  categoryName: string;
  wrongCount: number;
}

interface FrequentlyWrongQuestionsPageProps {
  userName: string;
  onBackToHome: () => void;
  limit?: number;
}

// Get priority category based on WrongCount
const getPriorityCategory = (wrongCount: number): 'critical' | 'high' | 'medium' => {
  if (wrongCount >= 5) return 'critical'; // Đỏ - Rất hay sai
  if (wrongCount >= 3) return 'high'; // Cam - Hay sai
  return 'medium'; // Vàng - Hay nhầm lẫn
};

export const FrequentlyWrongQuestionsPage: React.FC<FrequentlyWrongQuestionsPageProps> = ({
  userName,
  onBackToHome,
  limit = 10
}) => {
  const [questions, setQuestions] = useState<FrequentlyWrongQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryQuestions, setRetryQuestions] = useState<Question[] | null>(null);
  const [retryTitle, setRetryTitle] = useState<string>('');
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<number>>(new Set());
  const [selectedQuantity, setSelectedQuantity] = useState<number>(limit);
  const [sortBy, setSortBy] = useState<'wrongCount' | 'category' | 'alphabetical'>('wrongCount');

  // Fetch full question details from API
  const fetchQuestionDetails = async (questionId: number): Promise<Question | null> => {
    try {
      const response = await apiClient.get(`/CauHoi/${questionId}`);
      const data = response.data;

      const options = Array.isArray(data?.answers)
        ? data.answers.map((a: any) => a.answerContent ?? String(a))
        : [];

      const answerIds = Array.isArray(data?.answers)
        ? data.answers.map((a: any) => Number(a.id ?? a.answerId ?? a))
        : [];

      const correctIndex = Array.isArray(data?.answers)
        ? data.answers.findIndex((a: any) => a.isCorrect === true)
        : 0;

      return {
        id: String(questionId),
        content: data?.questionContent ?? '',
        options,
        answerIds,
        correctAnswer: Math.max(0, correctIndex),
        chapterId: data?.categories?.[0] ?? 1,
        isParalysis: !!data?.isCritical,
        imageUrl: data?.imageUrl ?? '',
        explanation: data?.explanation ?? ''
      } as Question;
    } catch (err) {
      console.error(`Failed to fetch question details for ID ${questionId}`, err);
      return null;
    }
  };

  // Call learning tracking API
  const trackLearning = async (questionId: number) => {
    try {
      await apiClient.post(`/hoctap/track`, {
        questionId,
        timestamp: new Date().toISOString()
      }).catch(() => {
        // If learning API fails, don't block the quiz
      });
    } catch (err) {
      console.warn('Failed to track learning', err);
    }
  };

  // Refresh frequently wrong questions data
  const refreshQuestions = async (quantity?: number) => {
    try {
      const qty = quantity ?? selectedQuantity;
      const response = await apiClient.get(`/hoctap/cauhoisaithuongxuyen?limit=${qty}`);
      const data = response.data;

      const questionsArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.items)
            ? data.items
            : [];

      const sortedArray = sortQuestionsData(questionsArray, sortBy);
      setQuestions(sortedArray);

      // Mark all as recently updated for visual feedback
      setRecentlyUpdated(new Set(sortedArray.map(q => q.questionId)));

      // Clear the recently updated flag after 3 seconds
      setTimeout(() => {
        setRecentlyUpdated(new Set());
      }, 3000);
    } catch (err) {
      console.error('Failed to refresh frequently wrong questions', err);
    }
  };

  // Sort questions based on sort type
  const sortQuestionsData = (arr: FrequentlyWrongQuestion[], sortType: typeof sortBy): FrequentlyWrongQuestion[] => {
    const copy = [...arr];
    switch (sortType) {
      case 'wrongCount':
        return copy.sort((a, b) => b.wrongCount - a.wrongCount); // Descending - most wrong first
      case 'category':
        return copy.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
      case 'alphabetical':
        return copy.sort((a, b) => a.content.localeCompare(b.content));
      default:
        return copy;
    }
  };

  useEffect(() => {
    const loadFrequentlyWrongQuestions = async () => {
      try {
        // Only show loading screen on initial load, not when filtering
        if (isInitialLoad) {
          setLoading(true);
        }
        setError(null);
        const response = await apiClient.get(`/hoctap/cauhoisaithuongxuyen?limit=${selectedQuantity}`);
        const data = response.data;

        // Handle different response formats
        const questionsArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : [];

        const sortedArray = sortQuestionsData(questionsArray, sortBy);
        setQuestions(sortedArray);

        // Mark as not initial load anymore
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } catch (err) {
        console.error('Failed to load frequently wrong questions', err);
        if (isInitialLoad) {
          setError('Không thể tải danh sách câu hỏi sai thường xuyên. Vui lòng thử lại sau.');
        }
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    };

    loadFrequentlyWrongQuestions();
  }, [selectedQuantity, sortBy, isInitialLoad]);

  const totalWrongCount = questions.reduce((sum, q) => sum + q.wrongCount, 0);
  const uniqueCategories = new Set(questions.map(q => q.categoryName)).size;

  const handleRetakeQuestions = async () => {
    setLoadingDetails(true);
    try {
      // Fetch all question details in parallel
      const detailPromises = questions.map(q => fetchQuestionDetails(q.questionId));
      const details = await Promise.all(detailPromises);

      // Filter out any failed fetches and track each one
      const validDetails = details.filter((q): q is Question => q !== null);

      // Track learning for each question
      questions.forEach(q => trackLearning(q.questionId));

      if (validDetails.length > 0) {
        setRetryQuestions(validDetails);
        setRetryTitle(`Làm lại: ${validDetails.length} câu sai thường xuyên`);
      } else {
        alert('Không thể tải chi tiết câu hỏi. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Failed to fetch question details', err);
      alert('Có lỗi khi tải chi tiết câu hỏi.');
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách câu hỏi sai thường xuyên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
        <div className="bg-white rounded-2xl shadow-lg border-2 border-red-100 p-12 text-center max-w-2xl mx-auto mt-20">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={48} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Lỗi Tải Dữ Liệu</h2>
          <p className="text-gray-600 text-lg mb-8">{error}</p>
          <button
            onClick={onBackToHome}
            className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Home size={20} />
            <span>Về Trang Chủ</span>
          </button>
        </div>
      </div>
    );
  }

  const mainContent = questions.length === 0 ? (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-12 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
        <TrendingDown size={48} className="text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Tuyệt Vời!</h2>
      <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">Bạn không có câu hỏi sai nào được ghi nhận. Hãy tiếp tục cố gắng!</p>

      <button
        onClick={onBackToHome}
        className="mt-10 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
      >
        <Home size={20} />
        <span>Về Trang Chủ</span>
      </button>
    </div>
  ) : (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-100 p-3 sm:p-6">
      <div className="flex items-center justify-between mb-6 flex-col sm:flex-row gap-4">
        <div>
          <h2 className="text-2xl font-bold">Câu Hỏi Sai Thường Xuyên</h2>
          <p className="text-sm text-gray-600">{userName}, có {questions.length} câu hỏi trong danh sách</p>
        </div>

        <div className="flex items-center gap-4 flex-col sm:flex-row w-full sm:w-auto">
          {questions.length > 0 && (
            <button
              onClick={handleRetakeQuestions}
              disabled={loadingDetails}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 text-sm font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loadingDetails && (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              )}
              <span>Làm lại tất cả ({questions.length})</span>
            </button>
          )}

          <div className="flex gap-4 flex-wrap justify-center sm:justify-start">
            <div className="text-center">
              <p className="text-lg font-bold text-red-600">{questions.filter(q => getPriorityCategory(q.wrongCount) === 'critical').length}</p>
              <p className="text-xs text-gray-500">Rất hay sai</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-orange-600">{questions.filter(q => getPriorityCategory(q.wrongCount) === 'high').length}</p>
              <p className="text-xs text-gray-500">Hay sai</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-yellow-600">{questions.filter(q => getPriorityCategory(q.wrongCount) === 'medium').length}</p>
              <p className="text-xs text-gray-500">Hay nhầm</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">{uniqueCategories}</p>
              <p className="text-xs text-gray-500">Chủ đề</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Số câu hỏi</label>
            <select
              value={selectedQuantity}
              onChange={(e) => setSelectedQuantity(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value={5}>5 câu</option>
              <option value={10}>10 câu</option>
              <option value={15}>15 câu</option>
              <option value={20}>20 câu</option>
              <option value={30}>30 câu</option>
              <option value={50}>50 câu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sắp xếp theo</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="wrongCount">Số lần sai (cao → thấp)</option>
              <option value="category">Chủ đề (A → Z)</option>
              <option value="alphabetical">Nội dung câu hỏi (A → Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Critical Priority - Red */}
      {questions.filter(q => getPriorityCategory(q.wrongCount) === 'critical').length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-red-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-red-700">Rất Hay Sai (5+ lần) - Ưu tiên cao</h3>
          </div>
          <div className="space-y-3 pl-4 border-l-2 border-red-200">
            {questions.filter(q => getPriorityCategory(q.wrongCount) === 'critical').map((q) => (
              <div
                key={q.questionId}
                className={`p-4 border-2 rounded-lg transition-all ${recentlyUpdated.has(q.questionId) ? 'border-red-500 bg-red-50 shadow-lg' : 'border-red-200 bg-red-50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {recentlyUpdated.has(q.questionId) && (
                        <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">✓ Vừa cập nhật</span>
                      )}
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base">{q.content}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {q.categoryName}
                      </span>
                      <span className="text-xs font-semibold bg-red-200 text-red-800 px-3 py-1 rounded-full">
                        Sai {q.wrongCount} lần
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={async () => {
                        setLoadingDetails(true);
                        try {
                          const detail = await fetchQuestionDetails(q.questionId);
                          if (detail) {
                            trackLearning(q.questionId);
                            setRetryQuestions([detail]);
                            setRetryTitle(`Làm lại: ${q.content}`);
                          } else {
                            alert('Không thể tải chi tiết câu hỏi. Vui lòng thử lại sau.');
                          }
                        } catch (err) {
                          console.error('Failed to fetch question details', err);
                          alert('Có lỗi khi tải chi tiết câu hỏi.');
                        } finally {
                          setLoadingDetails(false);
                        }
                      }}
                      disabled={loadingDetails}
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-xs sm:text-sm font-semibold hover:bg-red-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Làm lại
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High Priority - Orange */}
      {questions.filter(q => getPriorityCategory(q.wrongCount) === 'high').length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-orange-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-orange-700">Hay Sai (3-4 lần) - Ưu tiên trung bình</h3>
          </div>
          <div className="space-y-3 pl-4 border-l-2 border-orange-200">
            {questions.filter(q => getPriorityCategory(q.wrongCount) === 'high').map((q) => (
              <div
                key={q.questionId}
                className={`p-4 border-2 rounded-lg transition-all ${recentlyUpdated.has(q.questionId) ? 'border-orange-500 bg-orange-50 shadow-lg' : 'border-orange-200 bg-orange-50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {recentlyUpdated.has(q.questionId) && (
                        <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">✓ Vừa cập nhật</span>
                      )}
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base">{q.content}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {q.categoryName}
                      </span>
                      <span className="text-xs font-semibold bg-orange-200 text-orange-800 px-3 py-1 rounded-full">
                        Sai {q.wrongCount} lần
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={async () => {
                        setLoadingDetails(true);
                        try {
                          const detail = await fetchQuestionDetails(q.questionId);
                          if (detail) {
                            trackLearning(q.questionId);
                            setRetryQuestions([detail]);
                            setRetryTitle(`Làm lại: ${q.content}`);
                          } else {
                            alert('Không thể tải chi tiết câu hỏi. Vui lòng thử lại sau.');
                          }
                        } catch (err) {
                          console.error('Failed to fetch question details', err);
                          alert('Có lỗi khi tải chi tiết câu hỏi.');
                        } finally {
                          setLoadingDetails(false);
                        }
                      }}
                      disabled={loadingDetails}
                      className="px-3 py-1 bg-orange-600 text-white rounded-md text-xs sm:text-sm font-semibold hover:bg-orange-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Làm lại
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority - Yellow */}
      {questions.filter(q => getPriorityCategory(q.wrongCount) === 'medium').length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-yellow-600 rounded-full"></div>
            <h3 className="text-lg font-bold text-yellow-700">Hay Nhầm Lẫn (1-2 lần) - Ưu tiên thấp</h3>
          </div>
          <div className="space-y-3 pl-4 border-l-2 border-yellow-200">
            {questions.filter(q => getPriorityCategory(q.wrongCount) === 'medium').map((q) => (
              <div
                key={q.questionId}
                className={`p-4 border-2 rounded-lg transition-all ${recentlyUpdated.has(q.questionId) ? 'border-yellow-500 bg-yellow-50 shadow-lg' : 'border-yellow-200 bg-yellow-50'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      {recentlyUpdated.has(q.questionId) && (
                        <span className="text-xs font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full animate-pulse">✓ Vừa cập nhật</span>
                      )}
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base">{q.content}</h4>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                        {q.categoryName}
                      </span>
                      <span className="text-xs font-semibold bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">
                        Sai {q.wrongCount} lần
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={async () => {
                        setLoadingDetails(true);
                        try {
                          const detail = await fetchQuestionDetails(q.questionId);
                          if (detail) {
                            trackLearning(q.questionId);
                            setRetryQuestions([detail]);
                            setRetryTitle(`Làm lại: ${q.content}`);
                          } else {
                            alert('Không thể tải chi tiết câu hỏi. Vui lòng thử lại sau.');
                          }
                        } catch (err) {
                          console.error('Failed to fetch question details', err);
                          alert('Có lỗi khi tải chi tiết câu hỏi.');
                        } finally {
                          setLoadingDetails(false);
                        }
                      }}
                      disabled={loadingDetails}
                      className="px-3 py-1 bg-yellow-600 text-white rounded-md text-xs sm:text-sm font-semibold hover:bg-yellow-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Làm lại
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 p-2 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with back button */}

        {retryQuestions ? (
          <div className="fixed inset-0 z-50 bg-white sm:p-6 overflow-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setRetryQuestions(null);
                  // Refresh the question list after completing a quiz
                  refreshQuestions();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
                Thoát
              </button>
            </div>
            <QuizGame
              examTitle={retryTitle || `Làm lại: ${retryQuestions.length} câu sai`}
              questions={retryQuestions}
              onExit={() => {
                setRetryQuestions(null);
                // Refresh the question list after completing a quiz
                refreshQuestions();
              }}
              mode="learn"
              showTimer={false}
              autoAdvance={false}
              allowUnsure={false}
              submitButtonText="Hoàn thành"
              showImmediateExplanation={true}
              resultFullPage={true}
              submitToServer={false}
              trackOnlyCorrect={true}
            />
          </div>
        ) : null}

        {mainContent}
      </div>
    </div>
  );
};
