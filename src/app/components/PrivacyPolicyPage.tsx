import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Cookie, Share2, CheckCircle, ArrowLeft, Mail } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBackToHome: () => void;
}

export const PrivacyPolicyPage = ({ onBackToHome }: PrivacyPolicyPageProps) => {
  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 via-white to-cyan-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                <Shield size={32} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Chính Sách Bảo Mật</h1>
                <p className="text-gray-500 text-sm mt-1">Cập nhật lần cuối: 03/02/2026</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 1: Giới thiệu */}
          <PolicySection
            icon={<Shield className="text-blue-600" size={24} />}
            title="1. Giới Thiệu"
            delay={0.1}
          >
          </PolicySection>

          {/* Section 2: Thông tin thu thập */}
          <PolicySection
            icon={<Eye className="text-green-600" size={24} />}
            title="2. Thông Tin Thu Thập"
            delay={0.2}
          >
          </PolicySection>

          {/* Section 3: Mục đích sử dụng */}
          <PolicySection
            icon={<CheckCircle className="text-cyan-600" size={24} />}
            title="3. Mục Đích Sử Dụng"
            delay={0.3}
          >
          </PolicySection>

          {/* Section 4: Cookie và công nghệ theo dõi */}
          <PolicySection
            icon={<Cookie className="text-orange-600" size={24} />}
            title="4. Cookie và Công Nghệ Theo Dõi"
            delay={0.4}
          >
          </PolicySection>

          {/* Section 5: Chia sẻ thông tin */}
          <PolicySection
            icon={<Share2 className="text-purple-600" size={24} />}
            title="5. Chia Sẻ Thông Tin"
            delay={0.5}
          >
          </PolicySection>

          {/* Section 6: Bảo mật dữ liệu */}
          <PolicySection
            icon={<Lock className="text-red-600" size={24} />}
            title="6. Bảo Mật Dữ Liệu"
            delay={0.6}
          >
          </PolicySection>

          {/* Section 7: Quyền của người dùng */}
          <PolicySection
            icon={<CheckCircle className="text-teal-600" size={24} />}
            title="7. Quyền Của Người Dùng"
            delay={0.7}
          >
          </PolicySection>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-8 shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-4">Liên Hệ Với Chúng Tôi</h3>
            <p className="mb-6 opacity-90">
              Nếu bạn có bất kỳ câu hỏi hoặc thắc mắc nào về chính sách bảo mật này, 
              vui lòng liên hệ với chúng tôi:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-blue-100 text-sm">contact@myweb.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-semibold">Bộ phận bảo mật</p>
                  <p className="text-blue-100 text-sm">privacy@group3.net</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Last Update Notice */}
          <div className="text-center text-sm text-gray-500 py-6">
            <p>Chính sách này có hiệu lực từ ngày 03/02/2026</p>
            <p className="mt-1">Chúng tôi có thể cập nhật chính sách này theo thời gian. Mọi thay đổi sẽ được thông báo trên trang web.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PolicySectionProps {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  delay?: number;
}

const PolicySection = ({ icon, title, children, delay = 0 }: PolicySectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="text-gray-700">
        {children}
      </div>
    </motion.div>
  );
};