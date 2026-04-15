import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  DocumentTextIcon,
  IdentificationIcon,
  Squares2X2Icon, // Icon phù hợp cho Biển báo
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';

// Cập nhật danh sách điều hướng tại đây
const navigation = [
  { name: 'Câu hỏi', icon: DocumentTextIcon, href: '/admin/questions' },
  { name: 'Văn bằng', icon: IdentificationIcon, href: '/admin/licences' },
  { name: 'Biển báo', icon: Squares2X2Icon, href: '/admin/traffic-signs' }, // Mục mới thêm
];

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Hàm xử lý class cho NavLink để đảm bảo UI đồng nhất
  const linkClass = ({ isActive }: { isActive: boolean }) => `
    flex items-center gap-4 px-3 py-3 rounded-xl font-bold transition-all duration-200
    ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-100'}
    ${isCollapsed ? 'justify-center' : ''}
  `;

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 h-screen sticky top-0 transition-all duration-300 relative ${isCollapsed ? 'w-20' : 'w-64'}`}>

        {/* Nút thu gọn/mở rộng */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:text-indigo-600 z-50 transition-transform hover:scale-110"
        >
          <ChevronLeftIcon className={`h-4 w-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Logo */}
        <div className="p-6 mb-4">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
              <span className="text-white font-black">G</span>
            </div>
            {!isCollapsed && <span className="text-l font-black text-gray-900 tracking-tighter uppercase">Quản lý hệ thống</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-2">
          {navigation.map((item) => (
            <NavLink key={item.name} to={item.href} className={linkClass} title={item.name}>
              <item.icon className="h-6 w-6 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}
          >
            <item.icon className="h-6 w-6" />
            {/* Hiển thị từ cuối cùng của tên để tiết kiệm diện tích mobile (ví dụ: "Biển báo" -> "báo") */}
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.name.split(' ').pop()}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
};
