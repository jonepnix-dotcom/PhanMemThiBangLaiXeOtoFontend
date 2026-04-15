import React, { useEffect, useState } from "react";
import { useSignalR } from "../contexts/SignalRContext";
import { Phone, UserCircle, SignalHigh, SignalZero, Headphones, CheckCircle2, AlertCircle } from "lucide-react";

interface User {
  userId: string;
  name: string;
  role: string;
  isCalling: boolean;
}

export const ConsultationUserPage: React.FC = () => {
  const { users, isOnline, meCalling, callUser, toggleOnline } = useSignalR();

  // Banners with real context
  const banners = [
    {
      img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1469&auto=format&fit=crop",
      title: "Hỗ Trợ Học Viên 24/7",
      desc: "Đội ngũ chuyên viên luôn sẵn sàng giải đáp mọi thắc mắc của bạn về lý thuyết và thực hành."
    },
    {
      img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1470&auto=format&fit=crop",
      title: "Giải Đáp Sa Hình Chuyên Sâu",
      desc: "Kết nối trực tiếp qua Video Call để hiểu rõ hơn về luật giao thông và các mẹo giải sa hình."
    },
    {
      img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1469&auto=format&fit=crop",
      title: "Tư Vấn Chọn Hạng Bằng",
      desc: "Nhận tư vấn chi tiết giúp bạn lựa chọn hạng bằng phù hợp với nhu cầu và năng lực."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleCall = (user: User) => callUser(user.userId);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] lg:h-auto lg:min-h-[calc(100vh-80px)] bg-slate-50/50 p-4 md:p-8 animate-in fade-in duration-500 overflow-y-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2 md:gap-3">
            <Headphones className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            Phòng Tư Vấn Trực Tuyến
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">Trao đổi 1:1 qua Video Call với bộ phận Quản trị hệ thống.</p>
        </div>

        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 bg-slate-50 p-2 pl-4 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-3 h-3 md:w-4 md:h-4">
              {isOnline && (
                <span className="absolute w-3 h-3 md:w-4 md:h-4 rounded-full bg-emerald-400 opacity-60 animate-ping" />
              )}
              <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full z-10 ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`} />
            </div>
            <span className={`text-sm md:text-base font-medium ${isOnline ? "text-emerald-600" : "text-slate-500"}`}>
              {isOnline ? "Đang kết nối" : "Ngắt kết nối"}
            </span>
          </div>

          <button
            onClick={toggleOnline}
            className={`flex items-center gap-2 px-3 py-2 md:px-5 md:py-2 rounded-lg text-sm md:text-base text-white font-medium transition-all transform active:scale-95 shadow-sm
              ${isOnline 
                ? "bg-slate-800 hover:bg-slate-900" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              }`}
          >
            {isOnline ? <SignalZero className="hidden sm:block w-4 h-4" /> : <SignalHigh className="hidden sm:block w-4 h-4" />}
            {isOnline ? "Ngắt" : "Tham gia gọi"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row flex-1 gap-6 min-h-0">
        
        {/* LEFT - Danh sách chuyên viên (Admins) */}
        <div className="w-full lg:w-1/3 xl:w-1/4 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden min-h-[300px] lg:min-h-0">
          <div className="p-4 md:p-5 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
            <h2 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              Chuyên viên Online ({isOnline ? users.length : 0})
            </h2>
          </div>

          <div className="flex-1 overflow-auto p-3 md:p-4 space-y-3">
            {!isOnline ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-3 px-4 py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-full flex items-center justify-center">
                  <SignalZero className="w-6 h-6 md:w-8 md:h-8 text-slate-300" />
                </div>
                <p className="text-sm md:text-base">Bạn đang ở chế độ Offline.<br className="hidden md:block"/>Hãy nhấn <strong className="text-slate-600">"Tham gia gọi"</strong> để kết nối.</p>
              </div>
            ) : users.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-3 px-4 py-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-50 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
                </div>
                <p className="text-sm md:text-base">Hiện tại không có Chuyên viên nào trực tuyến.<br className="hidden md:block"/>Vui lòng quay lại sau ít phút.</p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.userId}
                  className="group flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 md:p-4 bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all rounded-xl gap-3 md:gap-4"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <UserCircle className="w-8 h-8 md:w-10 md:h-10 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm md:text-base truncate">{user.name}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${user.isCalling ? 'bg-orange-500' : 'bg-emerald-500'}`}></span>
                        <span className="text-xs font-medium text-slate-500">
                          {user.isCalling ? 'Đang bận gọi' : 'Sẵn sàng'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={user.isCalling || meCalling}
                    onClick={() => handleCall(user)}
                    className={`flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 md:py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0
                      ${user.isCalling || meCalling
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white"
                      }`}
                  >
                    <Phone className="w-3 h-3 md:w-4 md:h-4" />
                    {user.isCalling || meCalling ? "Bận" : "Gọi ngay"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT - Banner / Info Section */}
        <div className="flex-1 bg-slate-800 rounded-2xl shadow-sm overflow-hidden relative group min-h-[250px] lg:min-h-0 mt-2 lg:mt-0">
          {banners.map((banner, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
            >
              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent z-10" />
              <img
                src={banner.img}
                alt={banner.title}
                className="w-full h-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              
              {/* Text content */}
              <div className="absolute bottom-0 left-0 p-5 md:p-8 lg:p-12 z-20 w-full max-w-3xl">
                <span className="inline-block px-2 py-1 md:px-3 md:py-1 bg-blue-600/90 text-white text-[10px] md:text-xs font-semibold uppercase tracking-wider rounded-md mb-2 md:mb-4 backdrop-blur-sm">
                  Trực tuyến 1:1
                </span>
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight">
                  {banner.title}
                </h3>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-300 line-clamp-2 md:line-clamp-none">
                  {banner.desc}
                </p>
              </div>
            </div>
          ))}

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-8 z-30 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full h-1.5 md:h-2 
                  ${idx === currentIndex ? "w-6 md:w-8 bg-blue-500" : "w-1.5 md:w-2 bg-white/40 hover:bg-white/60"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
