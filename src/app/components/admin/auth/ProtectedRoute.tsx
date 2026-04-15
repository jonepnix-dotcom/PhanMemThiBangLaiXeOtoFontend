import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthService } from '../../../services/authService';

const ProtectedRoute: React.FC = () => {
  // Sử dụng hàm isAuthenticated từ AuthService để kiểm tra cả token và role ADMIN
  const isAuth = AuthService.isAuthenticated();

  useEffect(() => {
    if (!isAuth) {
      window.location.href = '/';
    }
  }, [isAuth]);

  // Nếu không có token hoặc không phải ADMIN, chưa kịp chuyển trang thì render null
  if (!isAuth) return null;

  // Nếu hợp lệ, hiển thị các route con của Admin
  return <Outlet />;
};

export default ProtectedRoute;
