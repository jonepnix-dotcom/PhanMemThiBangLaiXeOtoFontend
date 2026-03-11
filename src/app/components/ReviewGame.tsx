import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, RotateCcw } from 'lucide-react';
import { Question } from '@/app/types';

interface ReviewGameProps {
  examTitle: string;
  questions: Question[];
  onExit: () => void;
}

export const ReviewGame: React.FC<ReviewGameProps> = ({ examTitle, questions, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
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

  if (!questions || questions.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-xl font-bold text-gray-800">Không có câu hỏi</h3>
        <p className="text-gray-500 mt-2">Vui lòng quay lại trang Quản trị để thêm câu hỏi.</p>
        <button 
          onClick={onExit}
          className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionIndex
    });

    // immediate feedback: persist wrong ids if incorrect, remove if fixed
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    setWrongQuestionIds(prev => {
      const has = prev.includes(currentQuestion.id);
      if (!isCorrect && !has) {
        return [...prev, currentQuestion.id];
      }
      if (isCorrect && has) {
        return prev.filter(id => id !== currentQuestion.id);
      }
      return prev;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const correctCount = questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md z-10">
        <div>
          <h2 className="font-bold text-lg opacity-90">{examTitle}</h2>
          <div className="text-sm opacity-75">Câu hỏi {currentQuestionIndex + 1}/{totalQuestions}</div>
        </div>
        <div className="text-sm opacity-75 px-4 py-1 rounded-lg">
          Review Mode
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-3">
              Câu {currentQuestionIndex + 1}
            </span>
            <h3 className="text-2xl font-bold text-gray-800 leading-snug">
              {currentQuestion.content}
            </h3>
            {currentQuestion.imageUrl && (
              <img src={currentQuestion.imageUrl} alt="Question illustration" className="mt-4 rounded-xl border border-gray-200 max-h-64 object-contain" />
            )}
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group
                  ${selectedAnswers[currentQuestion.id] === index 
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700'}
                `}
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 flex-shrink-0 transition-colors
                  ${selectedAnswers[currentQuestion.id] === index 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : 'bg-white border-gray-300 text-gray-500 group-hover:border-blue-400 group-hover:text-blue-500'}
                `}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="text-lg font-medium">{option}</span>
              </button>
            ))}
            {/* Immediate explanation / feedback */}
            {selectedAnswers[currentQuestion.id] !== undefined && (
              <div className="mt-4 p-4 rounded-md bg-gray-50 border border-gray-200">
                <div className="mb-2">
                  {selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? (
                    <span className="text-sm text-green-600 font-medium">Bạn trả lời đúng.</span>
                  ) : (
                    <span className="text-sm text-red-600 font-medium">Bạn trả lời sai.</span>
                  )}
                </div>
                {currentQuestion.explanation && (
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Giải thích:</strong> {currentQuestion.explanation}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  Đáp án đúng: <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto hidden md:block">
          <h4 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-4">Danh sách câu hỏi</h4>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`
                  h-10 rounded-lg font-bold text-sm transition-all
                  ${currentQuestionIndex === idx ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                  ${selectedAnswers[q.id] !== undefined 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-white text-gray-400 border border-gray-200 hover:border-gray-300'}
                `}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="flex items-start gap-2">
              <div className="text-xs text-yellow-800">
                Hãy kiểm tra kỹ các câu hỏi trước khi nộp bài. Bạn có thể quay lại bất kỳ câu nào để thay đổi đáp án.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
        <button 
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          <ArrowLeft size={20} /> Trước
        </button>

        <button
          onClick={() => {
            if (currentQuestionIndex === totalQuestions - 1) {
              onExit();
            } else {
              handleNext();
            }
          }}
          className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Hoàn thành' : 'Tiếp theo'} <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
