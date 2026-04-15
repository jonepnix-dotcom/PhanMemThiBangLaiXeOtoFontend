import axios from 'axios';
import { url } from '../../env.js';

const API_URL = url; // Sử dụng url từ env.js

export const AuthService = {
  login: async (dto: any) => {
    // 1. Gửi request POST tới API C# của bạn
    const response = await axios.post(`${API_URL}auth/login`, dto);

    // 2. Nhận accessToken từ Backend (khớp với Controller của bạn)
    if (response.data.accessToken) {
      // 3. Lưu vào LocalStorage
      localStorage.setItem('accessToken', response.data.accessToken);
    }
    return response.data;
  },

  getToken: () => localStorage.getItem('accessToken'),

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    window.location.href = '/';
  },

  isAuthenticated: () => !!localStorage.getItem('accessToken')
};
