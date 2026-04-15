import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/admin/common/AdminLayout';
import QuestionsPage from './components/admin/common/QuestionsPage';
import LicencePage from './components/admin/common/LicencePage';
import TrafficSignPage from './components/admin/common/TrafficSignPage';
import ProtectedRoute from './components/admin/auth/ProtectedRoute';

function AdminApp() {
  return (
    <Router>
      <Routes>
        {/* --- ROUTE BẢO MẬT (Phải có Token mới vào được) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Tự động chuyển /admin sang /admin/questions */}
            <Route index element={<Navigate to="questions" replace />} />

            <Route path="questions" element={<QuestionsPage />} />
            <Route path="licences" element={<LicencePage />} />
            <Route path="traffic-signs" element={<TrafficSignPage />} />
          </Route>
        </Route>

        {/* --- 3. ĐIỀU HƯỚNG MẶC ĐỊNH --- */}
        <Route path="/" element={<Navigate to="/admin/questions" replace />} />

        {/* --- 4. TRANG 404 --- */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center h-screen bg-slate-50 font-sans">
            <h1 className="text-6xl font-black text-slate-200 uppercase">404</h1>
            <p className="text-slate-500 font-bold mt-2">Trang này không tồn tại!</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg hover:shadow-indigo-200 transition-all"
            >
              QUAY LẠI TRANG CHỦ
            </button>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default AdminApp;