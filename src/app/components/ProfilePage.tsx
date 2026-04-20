import React, { useState } from 'react';
import { Home, User, Mail, Calendar, Clock, TrendingDown } from 'lucide-react';
import userAvatar from '@/assets/avatar.svg';
import { HistoryPage } from './HistoryPage';
import { FrequentlyWrongQuestionsPage } from './FrequentlyWrongQuestionsPage';

type ProfileTab = 'INFO' | 'HISTORY' | 'FREQUENTLY_WRONG';

interface ProfilePageProps {
  userName: string;
  userEmail: string;
  onBackToHome: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ userName, userEmail, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('INFO');

  // Tính ngày tham gia (ngày hiện tại)
  const joinDate = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white py-8 px-8 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-all mb-6 backdrop-blur-sm border border-white/30"
          >
            <Home size={20} />
            <span className="font-medium">Quay về Trang Chủ</span>
          </button>

          <div className="flex items-center gap-3 sm:p-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl overflow-hidden border-4 border-white">
              <img
                src={userAvatar}
                alt="Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{userName}</h1>
              <div className="flex items-center gap-2 text-blue-100">
                <Mail size={18} />
                <span className="text-lg">{userEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('INFO')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === 'INFO'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <User size={18} />
            <span>Thông Tin</span>
          </button>
          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === 'HISTORY'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <Clock size={18} />
            <span>Lịch Sử</span>
          </button>
          <button
            onClick={() => setActiveTab('FREQUENTLY_WRONG')}
            className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap ${activeTab === 'FREQUENTLY_WRONG'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <TrendingDown size={18} />
            <span>Câu Sai Thường Xuyên</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {activeTab === 'INFO' && (
          <>
            {/* Thông tin cá nhân */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-6">
                Thông Tin Cá Nhân
              </h2>

              <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:p-6">
                  {/* Họ và tên */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium mb-1">Họ và tên</p>
                      <p className="text-xl font-bold text-gray-900">{userName}</p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium mb-1">Email</p>
                      <p className="text-xl font-bold text-gray-900">{userEmail}</p>
                    </div>
                  </div>

                  {/* Ngày tham gia */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm font-medium mb-1">Ngày tham gia</p>
                      <p className="text-xl font-bold text-gray-900">{joinDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Thông báo */}
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-8 border-2 border-blue-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Chào mừng bạn đến với hệ thống học tập!
                </h3>
              </div>
              <p className="text-gray-600 text-lg ml-16">
                Hãy bắt đầu hành trình học tập của bạn bằng cách làm các bài thi thử và ôn tập 600 câu hỏi luật giao thông.
                Chúc bạn học tốt và đạt kết quả cao!
              </p>
            </div>
          </>
        )}

        {activeTab === 'HISTORY' && (
          <HistoryPage
            userName={userName}
            onBackToHome={() => setActiveTab('INFO')}
          />
        )}

        {activeTab === 'FREQUENTLY_WRONG' && (
          <FrequentlyWrongQuestionsPage
            userName={userName}
            onBackToHome={() => setActiveTab('INFO')}
            limit={50}
          />
        )}
      </div>
    </div>
  );
};
