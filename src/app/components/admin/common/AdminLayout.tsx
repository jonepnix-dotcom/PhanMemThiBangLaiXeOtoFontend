import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ScrollToTop } from './ScrollToTop';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar luôn cố định ở bên trái */}
      <Sidebar />

      {/* Vùng nội dung chính bên phải */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* pb-20 để mobile không bị che bởi thanh điều hướng dưới cùng */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {/* Outlet là nơi QuestionsPage hoặc LicencePage sẽ hiển thị */}
          <Outlet />
        </div>
        <ScrollToTop /> {/* Nút sẽ luôn nằm trên cùng của các lớp UI khác */}
      </main>
    </div>
  );
};

export default AdminLayout;
