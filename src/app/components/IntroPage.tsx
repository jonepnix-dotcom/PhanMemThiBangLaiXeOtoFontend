import React from 'react';
import { BookOpen, CheckCircle, ShieldCheck, Target, Trophy, Users } from 'lucide-react';

interface IntroPageProps {
  onNavigateToThi: () => void;
  onNavigateToDocs: () => void;
}

export const IntroPage: React.FC<IntroPageProps> = ({ onNavigateToThi, onNavigateToDocs }) => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 via-white to-white overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="bg-gradient-to-r from-blue-600/10 via-white to-white rounded-3xl p-8 md:p-12 shadow-md flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-3">Hệ thống ôn thi lái xe nhóm 3 — DNTU</h1>
            <p className="text-gray-700 mb-5 max-w-2xl">Một nền tảng ôn thi trực tuyến được thiết kế để mô phỏng giao diện và áp lực thời gian của kỳ thi thật, giúp học viên luyện tập hiệu quả, hiểu sâu và đạt kết quả tốt hơn.</p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6 text-gray-700">
              <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> 600 câu hỏi chuẩn Bộ GTVT</li>
              <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> Thi thử sát đề, có phân tích chi tiết</li>
              <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> Theo dõi tiến độ & lịch sử làm bài</li>
              <li className="flex items-start gap-3"><span className="text-blue-600 font-bold">•</span> Hỗ trợ offline & đa nền tảng</li>
            </ul>

            <div className="flex gap-4 flex-wrap">
              <button
                onClick={onNavigateToThi}
                className="px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                Bắt đầu thi thử
              </button>
              <button
                onClick={onNavigateToDocs}
                className="px-6 py-3 rounded-full bg-white border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition"
              >
                Xem tài liệu
              </button>
            </div>
          </div>

          <div className="w-full md:w-96">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold">G3</div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Nhóm 3 .NET TECH</div>
                  <div className="text-xs text-gray-500">DNTU - Khoa CNTT</div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-semibold text-blue-700">Thi thử sát đề</div>
                  <div className="text-xs text-gray-600">Giao diện & thời gian như đề thi thật</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-100">
                  <div className="text-sm font-semibold text-gray-900">Phân tích chi tiết</div>
                  <div className="text-xs text-gray-600">Lý giải từng đáp án để hiểu bản chất</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-gray-100">
                  <div className="text-sm font-semibold text-gray-900">Lưu & theo dõi</div>
                  <div className="text-xs text-gray-600">Lịch sử làm bài và tiến bộ cá nhân</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <section className="mt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Các tính năng nổi bật</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Target className="text-blue-600" size={20} />}
              title="Thi thử sát đề"
              desc="Giao diện và thời gian giống thi thật, bao gồm câu điểm liệt và cấu trúc đề chuẩn." />

            <FeatureCard
              icon={<ShieldCheck className="text-blue-600" size={20} />}
              title="Giải thích chi tiết"
              desc="Mỗi câu hỏi đi kèm lời giải, chú thích luật và liên kết tới nội dung liên quan." />

            <FeatureCard
              icon={<Trophy className="text-blue-600" size={20} />}
              title="Theo dõi tiến bộ"
              desc="Lưu lịch sử làm bài, điểm số và thống kê để tối ưu lộ trình ôn luyện." />

            <FeatureCard
              icon={<BookOpen className="text-blue-600" size={20} />}
              title="Ôn tập theo chương"
              desc="Hệ thống chắt lọc kiến thức theo chủ đề: biển báo, sa hình, quy tắc giao thông." />

            <FeatureCard
              icon={<Users className="text-blue-600" size={20} />}
              title="Thân thiện mọi thiết bị"
              desc="Giao diện responsive, hỗ trợ desktop, mobile và dự kiến tích hợp ứng dụng .NET MAUI." />

            <FeatureCard
              icon={<CheckCircle className="text-blue-600" size={20} />}
              title="Tập trung điểm yếu"
              desc="Thuật toán lọc câu thường sai để bạn ôn tập có trọng tâm và cải thiện nhanh." />
          </div>
        </section>

        {/* Large stacked sections 1-5 */}
        <section id="muc-1" className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">1. Tổng quan dự án</h2>
            <p className="text-lg text-gray-700 leading-relaxed">Trong bối cảnh nhu cầu sở hữu ô tô và đăng ký học lái xe tăng trưởng mạnh mẽ, việc ôn tập qua sách vở truyền thống thường gây nhàm chán và khó hình dung. Website được xây dựng như một hệ sinh thái giáo dục pháp luật giao thông hoàn chỉnh, giúp học viên làm quen với áp lực thời gian và giao diện thi thật, từ đó tự tin hơn khi bước vào kỳ thi sát hạch chính thức.</p>
          </div>
        </section>

        <section id="muc-2" className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">2. Mục tiêu hệ thống</h2>
            <ul className="list-disc pl-6 text-lg text-gray-700 leading-relaxed space-y-3">
              <li><strong>Số hóa toàn diện:</strong> Cập nhật đầy đủ bộ 600 câu hỏi lý thuyết, biển báo và sa hình mới nhất.</li>
              <li><strong>Thi thử thực tế:</strong> Thuật toán trộn đề ngẫu nhiên đảm bảo đúng cấu trúc đề thi chuẩn của Bộ GTVT.</li>
              <li><strong>Học hiểu bản chất:</strong> Cung cấp giải thích chi tiết cho từng câu hỏi, giúp người dùng hiểu rõ quy định thay vì học vẹt.</li>
              <li><strong>Tối ưu hóa lộ trình:</strong> Theo dõi lịch sử làm bài và tự động lọc ra các câu hỏi hay sai để người dùng tập trung ôn luyện lại.</li>
            </ul>
          </div>
        </section>

        <section id="muc-3" className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">3. Các tính năng cốt lõi</h2>
            <p className="text-lg text-gray-700 leading-relaxed">Hệ thống cho phép ôn tập theo chương (Khái niệm, Quy tắc, Biển báo, Sa hình...), thi thử theo hạng bằng (B1, B2, C...), cảnh báo câu điểm liệt và lưu trữ lịch sử để theo dõi tiến bộ. Ngoài ra, người dùng có thể xem phân tích chi tiết sau khi hoàn thành bài thi và tập trung luyện các câu trả lời sai.</p>
          </div>
        </section>

        <section id="muc-4" className="py-16 md:py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">4. Công nghệ triển khai</h2>
            <ul className="list-disc pl-6 text-lg text-gray-700 leading-relaxed space-y-2">
              <li><strong>Backend:</strong> ASP.NET Core Web API.</li>
              <li><strong>Frontend:</strong> React + TypeScript, Tailwind CSS.</li>
              <li><strong>Đa nền tảng:</strong> Hỗ trợ mở rộng cho desktop và mobile (.NET MAUI) và khả năng offline.</li>
            </ul>
          </div>
        </section>

        <section id="muc-5" className="py-16 md:py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">5. Đối tượng sử dụng</h2>
            <p className="text-lg text-gray-700 leading-relaxed">Hệ thống hướng tới học viên mới bắt đầu, người ôn thi cấp tốc, người muốn ôn theo chương, và học viên muốn lưu trữ/đánh giá tiến độ học.</p>
          </div>
        </section>

        {/* Tech & CTA */}
        <section className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Công nghệ & Triển khai</h3>
              <p className="text-gray-700 text-sm mt-1">Backend: ASP.NET Core • Frontend: React + TypeScript • Hỗ trợ Offline & Đa nền tảng</p>

              <div className="flex gap-2 mt-3 flex-wrap">
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700">ASP.NET Core</span>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700">React</span>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700">TypeScript</span>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700">Tailwind CSS</span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="text-right">
                <div className="text-sm text-gray-500">Liên hệ</div>
                <div className="text-lg font-semibold text-gray-900">Hotline: <a href="tel:333-88-222-55" className="text-blue-600">333-88-222-55</a></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <div className="mt-10 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-lg font-bold">Sẵn sàng bắt đầu ôn luyện?</div>
              <div className="text-sm opacity-90">Thử ngay với bộ đề sát thực tế và phân tích đáp án chi tiết.</div>
            </div>
            <div className="flex gap-3">
              <button onClick={onNavigateToThi} className="bg-white text-blue-700 px-5 py-2 rounded-full font-semibold">Bắt đầu thi thử</button>
              <button onClick={onNavigateToDocs} className="bg-white/20 text-white px-5 py-2 rounded-full font-semibold border border-white/30">Xem tài liệu</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
  <div className="bg-white/80 backdrop-blur-sm border border-blue-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center mb-4">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-700 leading-relaxed">{desc}</p>
  </div>
);
