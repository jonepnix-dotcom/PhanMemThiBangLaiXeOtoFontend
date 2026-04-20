import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { FrequentlyWrongQuestionsPage } from './FrequentlyWrongQuestionsPage';

interface ReviewAppProps {
  userName: string;
  onBackToHome: () => void;
}

export const ReviewApp: React.FC<ReviewAppProps> = ({ userName, onBackToHome }) => {
  const [isFullscreen, setIsFullscreen] = useState(true);

  if (!isFullscreen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white animate-fade-in overflow-hidden">
      {/* Main Header / Topbar - Giống ThiPage */}
      <div className="flex items-center justify-between px-6 py-4 bg-blue-600 border-b border-blue-700 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsFullscreen(false);
              onBackToHome();
            }}
            className="flex items-center gap-2 text-blue-100 hover:text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-all"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Thoát</span>
          </button>
          <h1 className="text-xl font-bold text-white hidden md:block">Ôn Tập Câu Hỏi Sai</h1>
        </div>
        <div className="text-blue-100 text-sm">Làm lại các câu hỏi thường xuyên sai để cải thiện kỹ năng</div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex w-full min-h-0 overflow-auto">
        <div className="w-full h-full flex flex-col">
          <FrequentlyWrongQuestionsPage
            userName={userName}
            onBackToHome={() => {
              setIsFullscreen(false);
              onBackToHome();
            }}
            limit={10}
          />
        </div>
      </div>
    </div>
  );
};
