import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Send, ArrowLeft, Clock } from 'lucide-react';

interface ContactPageProps {
  onBackToHome: () => void;
}

export const ContactPage = ({ onBackToHome }: ContactPageProps) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Xử lý gửi form
    console.log('Form submitted:', formData);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <MessageSquare size={32} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Liên Hệ & Góp Ý</h1>
                <p className="text-gray-500 text-sm mt-1">Chúng tôi luôn lắng nghe ý kiến của bạn</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Contact Info */}
          <div className="space-y-6">
            {/* Section 1: Giới thiệu */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-3 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="text-blue-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Giới Thiệu</h2>
              </div>
              <div className="text-gray-700">
                {/* Nội dung giới thiệu ngắn gọn */}
              </div>
            </motion.div>

            {/* Section 2: Thông tin liên hệ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-3 sm:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-4">
                <Phone className="text-green-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Thông Tin Liên Hệ</h2>
              </div>
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg mt-1">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600 text-sm">contact@myweb.com</p>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 p-2 rounded-lg mt-1">
                    <Phone size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Số Điện Thoại</h3>
                    <p className="text-gray-600 text-sm"></p>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg mt-1">
                    <MapPin size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Địa Chỉ</h3>
                    <p className="text-gray-600 text-sm"></p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 4: Cam kết phản hồi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg p-3 sm:p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-white" size={24} />
                <h2 className="text-xl font-bold">Cam Kết Phản Hồi</h2>
              </div>
              <div className="text-white/90">
                {/* Nội dung cam kết phản hồi */}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            {/* Section 3: Biểu mẫu góp ý */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-3 sm:p-6 hover:shadow-lg transition-shadow sticky top-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <Send className="text-cyan-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">Biểu Mẫu Góp Ý</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Họ tên */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập họ và tên của bạn"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>

                {/* Nội dung góp ý */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Nội Dung Góp Ý <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Nhập nội dung góp ý, thắc mắc hoặc yêu cầu hỗ trợ của bạn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Send size={20} />
                  <span>Gửi Góp Ý</span>
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Bằng việc gửi góp ý, bạn đồng ý với chính sách bảo mật của chúng tôi
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
