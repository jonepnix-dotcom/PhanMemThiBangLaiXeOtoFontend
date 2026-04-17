import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { AuthService } from '../../../services/authService';

const ProtectedRoute: React.FC = () => {
  // Kiểm tra cả token và role ADMIN
  const isAuth = AuthService.isAuthenticated();
  const isAdmin = localStorage.getItem('userRole') === 'ADMIN';

  useEffect(() => {
    if (!isAuth || !isAdmin) {
      try {
        const redirectPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/?showAuth=1&redirect=${redirectPath}`;
      } catch (e) {
        window.location.href = '/';
      }
    }
  }, [isAuth, isAdmin]);

  // Nếu không có token hoặc không phải ADMIN, chưa kịp chuyển trang thì render null
  if (!isAuth || !isAdmin) return null;

  // Nếu hợp lệ, hiển thị các route con của Admin
  return <Outlet />;
};

export default ProtectedRoute;
