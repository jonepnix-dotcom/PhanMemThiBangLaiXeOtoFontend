import React, { useEffect, useState } from 'react';
import { QuizGame } from './QuizGame';
import { Question } from '@/app/types';
import { Home, BookOpen, Clock, Award } from 'lucide-react';

interface Attempt {
  id: number;
  examTitle: string;
  date: string;
  correctCount: number;
  totalQuestions: number;
  isPassed: boolean;
  timeTakenSeconds: number;
  incorrectQuestions?: Question[];
  questions?: Question[];
  selectedAnswers?: Record<string, number>;
}

interface HistoryPageProps {
  userName: string;
  onBackToHome: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ userName, onBackToHome }) => {
  const [history, setHistory] = useState<Attempt[]>([]);
  const [retryQuestions, setRetryQuestions] = useState<Question[] | null>(null);
  const [retryTitle, setRetryTitle] = useState<string>('');

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const raw = window.localStorage.getItem('history');
        const parsed: Attempt[] = raw ? JSON.parse(raw) : [];
        setHistory(Array.isArray(parsed) ? parsed : []);
      }
    } catch (err) {
      console.error('Failed to load history from localStorage', err);
      setHistory([]);
    }
  }, []);

  const totalAttempts = history.length;
  const passedCount = history.filter(h => h.isPassed).length;
  const totalTimeSeconds = history.reduce((s, h) => s + (h.timeTakenSeconds || 0), 0);
  const totalIncorrect = history.reduce((acc, h) => acc + (h.incorrectQuestions ? h.incorrectQuestions.length : 0), 0);

  const aggregateIncorrectQuestions = (): Question[] => {
    const map = new Map<number | string, Question>();
    history.forEach(h => {
      (h.incorrectQuestions || []).forEach(q => {
        if (!map.has(q.id)) map.set(q.id, q);
      });
    });
    return Array.from(map.values());
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Tổng quan</h2>
          <p className="text-sm text-gray-600">{userName}, có {totalAttempts} bài thi trong lịch sử của bạn</p>
        </div>

        <div className="flex items-center gap-4">
          {totalIncorrect > 0 && (
            <button
              onClick={() => {
                setRetryQuestions(aggregateIncorrectQuestions());
                setRetryTitle(`Làm lại toàn bộ: ${totalIncorrect} câu sai tổng hợp`);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Làm lại câu sai ({totalIncorrect})
            </button>
          )}

          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-lg font-bold">{totalAttempts}</p>
              <p className="text-xs text-gray-500">Tổng bài</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{passedCount}</p>
              <p className="text-xs text-gray-500">Đạt</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{Math.floor(totalTimeSeconds / 60)}m</p>
              <p className="text-xs text-gray-500">Tổng thời gian</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {history.map(h => (
          <div 
            key={h.id} 
            className="p-4 border rounded-lg flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" 
            onClick={() => {
              if (h.incorrectQuestions && h.incorrectQuestions.length > 0) {
                setRetryQuestions(h.incorrectQuestions);
                setRetryTitle(`Làm lại câu sai (${h.incorrectQuestions.length}): ${h.examTitle}`);
              } else {
                alert('Tuyệt vời! Bạn không sai câu nào trong bài thi này.');
              }
            }}
          >
            <div>
              <h4 className="font-bold text-gray-800">{h.examTitle}</h4>
              <p className="text-sm text-gray-500">{new Date(h.date).toLocaleString()} • {h.correctCount}/{h.totalQuestions} • {h.isPassed ? 'Đạt' : 'Không đạt'}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right text-sm text-gray-600">
                <p>{Math.floor(h.timeTakenSeconds / 60)}m {h.timeTakenSeconds % 60}s</p>
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
          <QuizGame
            examTitle={retryTitle || `Làm lại: ${retryQuestions.length} câu sai`}
            questions={retryQuestions}
            onExit={() => setRetryQuestions(null)}
            showTimer={false}
            autoAdvance={false}
            allowUnsure={false}
            submitButtonText="Hoàn thành"
            showImmediateExplanation={true}
            resultFullPage={true}
          />
        </div>
      ) : null}

      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-8 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all mb-6 backdrop-blur-sm border border-white/30"
          >
            <Home size={20} />
            <span className="font-medium">Quay về Trang Chủ</span>
          </button>

          <div>
            <h1 className="text-4xl font-bold mb-2">Lịch Sử Làm Bài</h1>
            <p className="text-blue-100 text-lg">Xem lại các bài thi bạn đã hoàn thành</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {mainContent}
      </div>
    </div>
  );
};
