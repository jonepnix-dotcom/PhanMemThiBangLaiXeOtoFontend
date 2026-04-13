import React from 'react';
import { Carousel, CarouselContent, CarouselItem } from "./ui/carousel";

type IntroPageProps = {
  onNavigateToThi?: () => void;
  onNavigateToDocs?: () => void;
};

type GoalCardProps = {
  title: string;
  desc: string;
  icon: React.ReactNode;
};

const GoalCard: React.FC<GoalCardProps> = ({ title, desc, icon }) => (
  <div className="p-8 rounded-3xl hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-gray-100 bg-white shadow-xl relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>
    <div className="text-5xl mb-6 bg-blue-50/50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors shadow-sm">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
  </div>
);

const TEAM_MEMBERS = [
  { initials: 'TTK', name: 'Trần Tuấn Kiệt', role: 'Trưởng nhóm — 1822040606', color: 'from-blue-500 to-blue-700' },
  { initials: 'THD', name: 'Trần Hoàng Duy', role: '1822040721', color: 'from-indigo-500 to-indigo-700' },
  { initials: 'NDT', name: 'Nguyễn Duy Thanh', role: '1822040492', color: 'from-purple-500 to-purple-700' },
  { initials: 'TTM', name: 'Trần Tuyết Mai', role: '1822040897', color: 'from-teal-500 to-teal-700' },
  { initials: 'VTD', name: 'Vũ Trung Đức', role: '1822041161', color: 'from-blue-500 to-blue-700' },
  { initials: 'NVD', name: 'Nguyễn Văn Đức', role: '1822991155', color: 'from-indigo-500 to-indigo-700' },
  { initials: 'NGH', name: 'Nguyễn Gia Huy', role: '1822040092', color: 'from-purple-500 to-purple-700' },
  { initials: 'NVTK', name: 'Nguyễn Vũ Tuấn Kiệt', role: '1822040131', color: 'from-teal-500 to-teal-700' },
  { initials: 'NHN', name: 'Nguyễn Hoài Nam', role: '1822041128', color: 'from-blue-500 to-blue-700' },
  { initials: 'MTB', name: 'Mai Thanh Bình', role: '1822041222', color: 'from-indigo-500 to-indigo-700' },
  { initials: 'TNK', name: 'Trần Nguyên Khoa', role: '1822041106', color: 'from-purple-500 to-purple-700' }
];

const IntroPage: React.FC<IntroPageProps> = ({ onNavigateToThi, onNavigateToDocs }) => {
  const [goalsApi, setGoalsApi] = React.useState<any>();
  const [teamApi, setTeamApi] = React.useState<any>();

  React.useEffect(() => {
    if (!goalsApi) return;
    const timer = setInterval(() => {
      goalsApi.scrollNext();
    }, 3000);
    return () => clearInterval(timer);
  }, [goalsApi]);

  React.useEffect(() => {
    if (!teamApi) return;
    const timer = setInterval(() => {
      teamApi.scrollNext();
    }, 3500);
    return () => clearInterval(timer);
  }, [teamApi]);

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans">
      {/* Full-width Top Box with Gradient */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600965179346-bf53a7ff83f8?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-6xl mx-auto px-6 py-24 text-center text-white relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">
            DỰ ÁN HỆ THỐNG <span className="text-blue-200">ÔN THI LÁI XE</span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-blue-100/90 leading-relaxed font-light">
            Xây dựng bởi sinh viên Khoa CNTT – DNTU. Chúng tôi thay thế sách vở truyền thống bằng trải nghiệm học tập số hóa, trực quan và đầy cảm hứng.
          </p>
        </div>
        {/* Curved bottom separator */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-gray-50/30 w-full"></div>
      </div>

      {/* Goals Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Tầm nhìn</span>
            <h2 className="text-4xl font-extrabold mt-2 text-gray-900">Mục tiêu của chúng tôi</h2>
            <div className="w-24 h-1.5 bg-blue-500 rounded-full mx-auto mt-6"></div>
          </div>
          <Carousel
            setApi={setGoalsApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 sm:-ml-8">
              <CarouselItem className="pl-4 sm:pl-8 basis-[85%] sm:basis-1/2 lg:basis-1/4 pt-8 pb-8">
                <GoalCard icon={"📱"} title="Số hóa toàn diện" desc="Cập nhật 600 câu hỏi, biển báo và sa hình mới nhất theo chuẩn Bộ GTVT." />
              </CarouselItem>
              <CarouselItem className="pl-4 sm:pl-8 basis-[85%] sm:basis-1/2 lg:basis-1/4 pt-8 pb-8">
                <GoalCard icon={"⏱️"} title="Thi thử thực tế" desc="Thuật toán trộn đề ngẫu nhiên, áp lực thời gian như kỳ thi thật." />
              </CarouselItem>
              <CarouselItem className="pl-4 sm:pl-8 basis-[85%] sm:basis-1/2 lg:basis-1/4 pt-8 pb-8">
                <GoalCard icon={"🧠"} title="Học hiểu bản chất" desc="Giải thích chi tiết từng câu, loại bỏ tư duy học vẹt." />
              </CarouselItem>
              <CarouselItem className="pl-4 sm:pl-8 basis-[85%] sm:basis-1/2 lg:basis-1/4 pt-8 pb-8">
                <GoalCard icon={"📈"} title="Tối ưu lộ trình" desc="Tự động lọc câu hỏi hay sai để người dùng tập trung ôn luyện." />
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>
      </section>

      {/* Team Info (moved under Goals) - use same gradient as Hero */}
      <section className="py-20 bg-gradient-to-r from-blue-500/60 via-blue-500/40 to-blue-700/30 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center text-white">
          <h3 className="text-xl font-bold text-white mb-3 text-center uppercase tracking-wider">Thành Viên thực hiện</h3>
          <p className="max-w-3xl mx-auto text-lg text-blue-100/90 mb-8">Xây dựng bởi sinh viên Khoa CNTT – DNTU. Chúng tôi thay thế sách vở truyền thống bằng trải nghiệm học tập số hóa, trực quan và đầy cảm hứng.</p>
          <div className="relative w-full max-w-5xl mx-auto py-8">
            <Carousel
              setApi={setTeamApi}
              opts={{
                align: "center",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4 sm:-ml-6 py-8">
                {TEAM_MEMBERS.map((member) => (
                  <CarouselItem key={member.role} className="pl-4 sm:pl-6 basis-[85%] sm:basis-1/2 md:basis-1/3">
                    <div className="bg-white rounded-2xl p-6 h-full text-center shadow-lg hover:-translate-y-2 transition-transform duration-300 mx-2">
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.color} mx-auto flex items-center justify-center text-white font-bold text-2xl shadow-md border-4 border-white -mt-12`}>
                        {member.initials}
                      </div>
                      <div className="mt-4 text-gray-900 font-bold text-lg">{member.name}</div>
                      <div className="text-gray-600 text-sm mt-1">{member.role}</div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background Decorative Blob */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10 opacity-60"></div>
        
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 space-y-8">
              <div>
                <span className="text-blue-600 font-bold uppercase tracking-wider text-sm">Hệ Thống</span>
                <h2 className="text-4xl font-extrabold mt-2 text-gray-900 leading-tight">Công nghệ triển khai</h2>
                <div className="w-20 h-1.5 bg-blue-500 rounded-full mt-6"></div>
              </div>
              
              <ul className="space-y-6">
                <li className="flex items-start bg-white p-3 sm:p-5 rounded-2xl shadow-md border-l-4 border-l-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mr-5 shadow-sm">
                    <span className="text-blue-600 font-bold text-lg">✔</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base sm:text-xl tracking-tight">Backend API</h4>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 leading-relaxed">ASP.NET Core Web API mạnh mẽ, bảo mật.</p>
                  </div>
                </li>
                <li className="flex items-start bg-white p-3 sm:p-5 rounded-2xl shadow-md border-l-4 border-l-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mr-5 shadow-sm">
                    <span className="text-blue-600 font-bold text-lg">✔</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base sm:text-xl tracking-tight">Phần mềm đa nền tảng</h4>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 leading-relaxed">Giao diện hiện đại phát triển bằng React & .NET MAUI.</p>
                  </div>
                </li>
                <li className="flex items-start bg-white p-3 sm:p-5 rounded-2xl shadow-md border-l-4 border-l-blue-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mr-5 shadow-sm">
                    <span className="text-blue-600 font-bold text-lg">✔</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base sm:text-xl tracking-tight">Trải nghiệm phần mềm di động</h4>
                    <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2 leading-relaxed">Tính năng đồng bộ cục bộ, ôn tập mọi lúc mọi nơi không cần Wifi.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="w-full lg:w-1/2 relative hidden md:block">
               {/* Decorative Tech Image Area */}
               <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border-8 border-white transform rotate-2 hover:rotate-0 transition-transform duration-500">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent z-10 pointer-events-none"></div>
                 <img 
                   src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80" 
                   alt="Technology Workspace" 
                   className="w-full h-[450px] object-cover" 
                 />
                 <div className="absolute bottom-6 left-6 p-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg z-20 flex items-center gap-3">
                   <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="font-bold text-gray-800 text-sm">Hệ thống đang hoạt động</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Small footer with basic info */}
      <footer className="bg-white border-t mt-0">
        <div className="container mx-auto px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-700">
            <div className="font-bold text-gray-900">GROUP 3 .NET TECH</div>
            <div>Hotline: <a href="tel:333-88-222-55" className="text-blue-600 hover:underline">333-88-222-55</a></div>
            <div className="text-gray-500">© {new Date().getFullYear()} Nhóm 3. All rights reserved.</div>
          </div>
        </div>
      </footer>

    </div>
  );
};

export { IntroPage };
export default IntroPage;
