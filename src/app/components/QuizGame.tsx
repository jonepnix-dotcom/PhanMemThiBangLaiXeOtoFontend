import React, { useState, useEffect, useRef } from 'react';
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
  showTimer?: boolean;
  submitButtonText?: string;
  showImmediateExplanation?: boolean;
  autoAdvance?: boolean; // whether to automatically move to next question after answering
  allowUnsure?: boolean; // whether to show "mark unsure" checkbox and markers
  resultFullPage?: boolean; // when true, render result view to fill the page body
}

export const QuizGame: React.FC<QuizGameProps> = ({ examTitle, questions, onExit, initialSelectedAnswers, startShowResult, readonly, examConfig, showTimer = true, submitButtonText = 'Nộp bài', showImmediateExplanation = false, autoAdvance = true, allowUnsure = true, resultFullPage = false }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(() => initialSelectedAnswers || {});
  const [unsureQuestions, setUnsureQuestions] = useState<Record<string, boolean>>(() => ({}));
  const [isSubmitted, setIsSubmitted] = useState(false);
  const autoAdvanceTimer = useRef<number | null>(null);
  const defaultTime = (examConfig?.timeSeconds) ?? (22 * 60);
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [showResult, setShowResult] = useState(!!startShowResult);

  // If no questions are provided, show loading state
  if (!questions || questions.length === 0) {
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

  const usedQuestions = questions;
  const currentQuestion = usedQuestions[currentQuestionIndex];
  const totalQuestions = usedQuestions.length;

  // Reset exam state when question set changes.
  useEffect(() => {
    if (!questions || questions.length === 0) return;
    if (showResult || readonly) return;
    if (!initialSelectedAnswers) setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft((examConfig?.timeSeconds) ?? (22 * 60));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  useEffect(() => {
    if (showResult || readonly || !showTimer) return;

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
  }, [showResult, readonly, showTimer]);

  // Clear any pending auto-advance timer on unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (showResult || readonly) return;
    // clear any pending auto-advance timer
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }

    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));

    // auto-advance to next question after short delay (unless last question)
    if (autoAdvance && currentQuestionIndex < totalQuestions - 1) {
      autoAdvanceTimer.current = window.setTimeout(() => {
        setCurrentQuestionIndex(prev => Math.min(prev + 1, totalQuestions - 1));
        autoAdvanceTimer.current = null;
      }, 500);
    }
  };

  const handleToggleUnsure = () => {
    if (showResult || readonly) return;
    setUnsureQuestions(prev => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  const handleNext = () => {
    // clear pending auto-advance when navigating manually
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
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
        unsureQuestions,
        questions: usedQuestions,
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
    const outerClass = resultFullPage
      ? 'w-full h-full mx-0 bg-white rounded-none shadow-none overflow-hidden animate-fade-in flex flex-col'
      : 'w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in';

    const bodyClass = resultFullPage ? 'p-8 flex-1 overflow-y-auto' : 'p-8 max-h-[60vh] overflow-y-auto';

    return (
      <div className={outerClass}>
        <div className={`p-8 text-center text-white ${isPassed ? 'bg-green-600' : 'bg-red-500'}`}>
          {isPassed ? <CheckCircle size={80} className="mx-auto mb-4" /> : <XCircle size={80} className="mx-auto mb-4" />}
          <h2 className="text-4xl font-bold mb-2">{isPassed ? "ĐẠT" : "KHÔNG ĐẠT"}</h2>
          <p className="text-xl opacity-90">Bạn đã trả lời đúng {correctCount}/{totalQuestions} câu hỏi</p>
          {!isPassed && failedByCritical && (
            <p className="mt-2 text-sm opacity-90">Bạn không đạt do trả lời sai câu điểm liệt (câu bắt buộc).</p>
          )}
        </div>
        
        <div className={bodyClass}>
          <h3 className="text-2xl font-bold mb-6 text-gray-800">Chi tiết bài làm</h3>
          <div className="space-y-6">
            {usedQuestions.map((q, index) => {
              const userAnswer = selectedAnswers[q.id];
              const isCorrect = userAnswer === q.correctAnswer;
              const isUnsure = !!unsureQuestions[q.id];

              const containerClass = `p-4 rounded-xl border-2 ${isUnsure ? 'border-yellow-400 bg-yellow-100' : (isCorrect ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50')}`;

              return (
                <div key={q.id} className={containerClass}>
                  <div className="flex gap-3">
                    <span className="font-bold text-gray-500">Câu {index + 1}:</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <p className="font-medium text-gray-900">{q.content}</p>
                        {isUnsure && (
                          <span className="text-xs font-semibold text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded">Không chắc</span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {q.options.map((opt, i) => (
                          (() => {
                            const isOptCorrect = i === q.correctAnswer;
                            const isOptUser = i === userAnswer;
                            const baseClass = 'p-2 rounded-lg text-sm flex items-center justify-between';
                            const correctClass = 'bg-green-200 text-green-900 font-medium';
                            const wrongClass = 'bg-red-200 text-red-900';
                            const neutralClass = 'bg-transparent text-gray-700';
                            const unsureHighlightCorrect = isUnsure && isOptCorrect ? 'ring-2 ring-green-300' : '';
                            const unsureHighlightWrong = isUnsure && isOptUser && !isOptCorrect ? 'ring-2 ring-red-300' : '';
                            const combined = [baseClass, isOptCorrect ? correctClass : '', (isOptUser && !isOptCorrect) ? wrongClass : '', (!isOptUser && !isOptCorrect) ? neutralClass : '', unsureHighlightCorrect, unsureHighlightWrong].filter(Boolean).join(' ');

                            return (
                              <div key={i} className={combined}>
                                <span>{String.fromCharCode(65 + i)}. {opt}</span>
                                {isOptCorrect && <CheckCircle size={16} className="text-green-700" />}
                                {isOptUser && !isOptCorrect && <XCircle size={16} className="text-red-700" />}
                              </div>
                            );
                          })()
                        ))}
                      </div>
                      {q.explanation && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[20px] text-amber-900 leading-relaxed">
                          <span className="font-bold text-amber-950">Giải thích:</span> {q.explanation}
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
        {showTimer && (
          <div className={`flex items-center gap-2 font-mono text-2xl font-bold px-4 py-1 rounded-lg ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-blue-500/50'}`}>
            <Clock size={24} />
            {formatTime(timeLeft)}
          </div>
        )}
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
            {currentQuestion.options.map((option, index) => {
              const userAns = selectedAnswers[currentQuestion.id];
              const isAnswered = userAns !== undefined;
              const isOptCorrect = index === currentQuestion.correctAnswer;
              const isOptUser = index === userAns;

              // When immediate explanation mode is active (review), show green for correct answer
              // and red for the user's wrong selection. Otherwise keep original selection styling.
              let optionClass = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 group ';
              if (isAnswered && showImmediateExplanation) {
                if (isOptCorrect) {
                  optionClass += 'border-green-500 bg-green-100 text-green-900 shadow-md';
                } else if (isOptUser && !isOptCorrect) {
                  optionClass += 'border-red-500 bg-red-100 text-red-900';
                } else {
                  optionClass += 'border-gray-200 bg-transparent text-gray-700';
                }
              } else {
                optionClass += isOptUser ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-700';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  className={optionClass}
                >
                  {/* Radio-like marker */}
                  <div className="flex items-center justify-center flex-shrink-0">
                    {isAnswered && showImmediateExplanation ? (
                      isOptCorrect ? (
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white">
                          <CheckCircle size={14} />
                        </div>
                      ) : isOptUser ? (
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                          <XCircle size={14} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400">
                          <span className="text-sm font-semibold">{String.fromCharCode(65 + index)}</span>
                        </div>
                      )
                    ) : (
                      isOptUser ? (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          <CheckCircle size={14} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400">
                          <span className="text-sm font-semibold">{String.fromCharCode(65 + index)}</span>
                        </div>
                      )
                    )}
                  </div>
                  <span className="text-lg font-medium">{option}</span>
                </button>
              );
            })}

            {/* Mark unsure checkbox (optional) */}
            {allowUnsure && (
              <div className="mt-3 flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={!!unsureQuestions[currentQuestion.id]}
                    onChange={handleToggleUnsure}
                    className="w-4 h-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-400"
                  />
                  <span className="select-none">Đánh dấu không chắc</span>
                </label>
                {unsureQuestions[currentQuestion.id] && (
                  <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">Đã đánh dấu</span>
                )}
              </div>
            )}

            {showImmediateExplanation && selectedAnswers[currentQuestion.id] !== undefined && (
              <div
                className={`mt-4 rounded-xl border-2 p-4 shadow-sm ${
                  selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer
                    ? 'border-green-300 bg-green-50'
                    : 'border-red-300 bg-red-50'
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  {selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? (
                    <CheckCircle size={18} className="text-green-700" />
                  ) : (
                    <XCircle size={18} className="text-red-700" />
                  )}
                  {selectedAnswers[currentQuestion.id] === currentQuestion.correctAnswer ? (
                    <span className="text-base font-bold text-green-800">Bạn trả lời đúng.</span>
                  ) : (
                    <span className="text-base font-bold text-red-800">Bạn trả lời sai.</span>
                  )}
                </div>

                {currentQuestion.explanation ? (
                  <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[20px] leading-relaxed text-amber-900">
                    <span className="font-bold text-amber-950">Giải thích:</span> {currentQuestion.explanation}
                  </div>
                ) : null}

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  <span className="font-semibold text-blue-950">Đáp án đúng:</span>{' '}
                  <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex w-full items-center justify-between gap-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold border transition-all ${currentQuestionIndex === 0 ? 'cursor-not-allowed text-blue-400 bg-blue-50 border-blue-200' : 'hover:bg-blue-100 text-blue-700 bg-blue-50 border-blue-300'}`}
            >
              <ArrowLeft size={20} /> Trước
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Tiếp theo <ArrowRight size={20} />
            </button>
          </div>
        </div>

  {/* Sidebar Navigation (Desktop) */}
  <div className="w-full md:w-72 bg-transparent border-none p-4 hidden md:flex md:flex-col">
          <h4 className="font-bold text-gray-500 text-sm uppercase tracking-wider mb-4">Danh sách câu hỏi</h4>
          <div className="max-h-[46vh] overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="grid grid-cols-5 lg:grid-cols-6 gap-2">
              {usedQuestions.map((q, idx) => {
                const selectedOptionIndex = selectedAnswers[q.id];
                const selectedOptionLabel = selectedOptionIndex !== undefined ? String.fromCodePoint(65 + selectedOptionIndex) : null;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    type="button"
                    className={`
                      relative w-10 h-10 flex items-center justify-center rounded-md font-bold text-sm transition-all select-none box-border
                      ${currentQuestionIndex === idx ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                      ${selectedOptionIndex !== undefined
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300'}
                    `}
                  >
                    <span className="pointer-events-none">{idx + 1}</span>
                    {selectedOptionLabel && (
                      <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full text-[9px] leading-4 font-extrabold shadow-sm bg-blue-600 text-white">
                        {selectedOptionLabel}
                      </span>
                    )}
                    {allowUnsure && unsureQuestions[q.id] && (
                      <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 rounded-full text-[9px] leading-4 font-extrabold shadow-sm bg-yellow-500 text-white">
                        ?
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-100">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
              <p className="text-xs text-yellow-800">
                Hãy kiểm tra kỹ các câu hỏi trước khi nộp bài. Bạn có thể quay lại bất kỳ câu nào để thay đổi đáp án.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-lg hover:shadow-green-500/30 transition-all"
          >
            {submitButtonText} <CheckCircle size={20} />
          </button>
        </div>
      </div>

    </div>
  );
};
