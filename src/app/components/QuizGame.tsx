import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, ArrowRight, ArrowLeft, RotateCcw, Loader2 } from 'lucide-react';
import { Question } from '@/app/types';

interface QuizGameProps {
  examTitle: string;
  questions: Question[];
  onExit: () => void;
  // Optional: when viewing a past submission
  initialSelectedAnswers?: Record<string, number>;
  startShowResult?: boolean;
  readonly?: boolean;
  // exam configuration overrides
  examConfig?: {
    timeSeconds?: number; // total time in seconds
    passCount?: number; // minimum correct to pass
    paralysisMandatory?: boolean; // if true, any mistake on isParalysis causes fail
  };
}

export const QuizGame: React.FC<QuizGameProps> = ({ examTitle, questions, onExit, initialSelectedAnswers, startShowResult, readonly, examConfig }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(() => initialSelectedAnswers || {});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const defaultTime = (examConfig?.timeSeconds) ?? (22 * 60);
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [showResult, setShowResult] = useState(!!startShowResult);
  // displayQuestions = questions with shuffled options for this exam instance
  const [displayQuestions, setDisplayQuestions] = useState<Question[]>([]);

  // If no questions are provided, show loading state
  if ((!questions || questions.length === 0) && displayQuestions.length === 0) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-2xl shadow-xl p-8">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-xl font-bold text-gray-800">Đang tải câu hỏi...</h3>
        <p className="text-gray-500 mt-2">Vui lòng đợi trong giây lát.</p>
        <button 
          onClick={onExit}
          className="mt-6 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Use shuffled displayQuestions if available
  const usedQuestions = displayQuestions.length > 0 ? displayQuestions : questions;
  const currentQuestion = usedQuestions[currentQuestionIndex];
  const totalQuestions = usedQuestions.length;

  // Helper: shuffle options per question and adjust correctAnswer index
  const shuffleQuestionOptions = (q: Question) => {
    const opts = q.options.map((o, i) => ({ content: o, originalIndex: i }));
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    const shuffledOptions = opts.map(o => o.content);
    const newCorrect = opts.findIndex(o => o.originalIndex === q.correctAnswer);
    return { ...q, options: shuffledOptions, correctAnswer: newCorrect } as Question;
  };

  // Initialize displayQuestions when questions prop changes (new exam)
  useEffect(() => {
    if (!questions || questions.length === 0) return;
    if (showResult || readonly) return;
    const dq = questions.map(q => shuffleQuestionOptions(q));
    setDisplayQuestions(dq);
    if (!initialSelectedAnswers) setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft((examConfig?.timeSeconds) ?? (22 * 60));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  useEffect(() => {
    if (showResult || readonly) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showResult, readonly]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (showResult || readonly) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: optionIndex
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

  const handleSubmit = () => {
    setShowResult(true);
    setIsSubmitted(true);

  try {
    const correct = usedQuestions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length;
    const total = usedQuestions.length;
    const timeTakenSeconds = (examConfig?.timeSeconds ?? (22 * 60)) - timeLeft;

    const incorrectQuestions = usedQuestions.filter(q => selectedAnswers[q.id] !== q.correctAnswer);
    const failedByCritical = usedQuestions.some(q => q.isParalysis && selectedAnswers[q.id] !== q.correctAnswer);
    const passCount = typeof examConfig?.passCount === 'number' ? examConfig!.passCount : Math.floor(total * 0.9);
    const paralysisMandatory = examConfig?.paralysisMandatory ?? true;
    const passed = correct >= passCount && !(paralysisMandatory && failedByCritical);

      const attempt = {
        id: Date.now(),
        examTitle,
        date: new Date().toISOString(),
        correctCount: correct,
        totalQuestions: total,
        isPassed: passed,
        failedByCritical,
        timeTakenSeconds,
        incorrectQuestions,
        questions: usedQuestions, // save the displayed (shuffled) questions so history preserves order
        selectedAnswers,
      } as any;

      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('history') : null;
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift(attempt);
      if (typeof window !== 'undefined') window.localStorage.setItem('history', JSON.stringify(arr));
    } catch (err) {
      console.error('Failed to save attempt to history', err);
    }
  };

  // Calculate score
  const correctCount = usedQuestions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length;
  const failedByCritical = usedQuestions.some(q => q.isParalysis && selectedAnswers[q.id] !== q.correctAnswer);
  const passCountGlobal = typeof examConfig?.passCount === 'number' ? examConfig!.passCount : Math.floor(totalQuestions * 0.9);
  const paralysisMandatoryGlobal = examConfig?.paralysisMandatory ?? true;
  const isPassed = correctCount >= passCountGlobal && !(paralysisMandatoryGlobal && failedByCritical);

  if (showResult) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
        <div className={`p-8 text-center text-white ${isPassed ? 'bg-green-600' : 'bg-red-500'}`}>
          {isPassed ? <CheckCircle size={80} className="mx-auto mb-4" /> : <XCircle size={80} className="mx-auto mb-4" />}
          <h2 className="text-4xl font-bold mb-2">{isPassed ? "ĐẠT" : "KHÔNG ĐẠT"}</h2>
          <p className="text-xl opacity-90">Bạn đã trả lời đúng {correctCount}/{totalQuestions} câu hỏi</p>
          {!isPassed && failedByCritical && (
            <p className="mt-2 text-sm opacity-90">Bạn không đạt do trả lời sai câu điểm liệt (câu bắt buộc).</p>
          )}
        </div>
        
        <div className="p-8 max-h-[60vh] overflow-y-auto">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Chi tiết bài làm</h3>
          <div className="space-y-6">
            {usedQuestions.map((q, index) => {
              const userAnswer = selectedAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              
              return (
                <div key={q.id} className={`p-4 rounded-xl border-2 ${isCorrect ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
                  <div className="flex gap-3">
                    <span className="font-bold text-gray-500">Câu {index + 1}:</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-3">{q.content}</p>
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`
                            p-2 rounded-lg text-sm flex items-center justify-between
                            ${i === q.correctAnswer ? 'bg-green-200 text-green-900 font-medium' : ''}
                            ${i === userAnswer && i !== q.correctAnswer ? 'bg-red-200 text-red-900' : ''}
                            ${i !== userAnswer && i !== q.correctAnswer ? 'bg-white/50 text-gray-600' : ''}
                          `}>
                            <span>{String.fromCharCode(65 + i)}. {opt}</span>
                            {i === q.correctAnswer && <CheckCircle size={16} className="text-green-700" />}
                            {i === userAnswer && i !== q.correctAnswer && <XCircle size={16} className="text-red-700" />}
                          </div>
                        ))}
                      </div>
                      {!isCorrect && q.explanation && (
                        <div className="mt-3 text-sm text-gray-600 italic bg-white/50 p-2 rounded">
                          <span className="font-bold">Giải thích:</span> {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          <button 
            onClick={onExit}
            className="flex items-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-all"
          >
            <RotateCcw size={20} /> Quay lại danh sách đề
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md z-10">
        <div>
          <h2 className="font-bold text-lg opacity-90">{examTitle}</h2>
          <div className="text-sm opacity-75">Câu hỏi {currentQuestionIndex + 1}/{totalQuestions}</div>
        </div>
        <div className={`flex items-center gap-2 font-mono text-2xl font-bold px-4 py-1 rounded-lg ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-blue-500/50'}`}>
          <Clock size={24} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Question Area */}
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
          </div>
        </div>

        {/* Sidebar Navigation (Desktop) */}
        <div className="w-full md:w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto hidden md:block">
          <h4 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-4">Danh sách câu hỏi</h4>
          <div className="grid grid-cols-4 gap-2">
            {usedQuestions.map((q, idx) => (
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
              <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-800">
                Hãy kiểm tra kỹ các câu hỏi trước khi nộp bài. Bạn có thể quay lại bất kỳ câu nào để thay đổi đáp án.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
        <button 
          onClick={handlePrev}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed text-gray-400' : 'hover:bg-gray-100 text-gray-700'}`}
        >
          <ArrowLeft size={20} /> Trước
        </button>

        {currentQuestionIndex === totalQuestions - 1 ? (
           <button 
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all"
          >
            Nộp bài <CheckCircle size={20} />
          </button>
        ) : (
          <button 
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all"
          >
            Tiếp theo <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
