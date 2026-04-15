import axios from 'axios';
import Cookies from 'js-cookie';
import { url } from '../../env';

const API_URL = url; // Sử dụng url từ env.js

export const AuthService = {
  login: async (dto: any) => {
    // 1. Gửi request POST tới API C# của bạn
    const response = await axios.post(`${API_URL}auth/login`, dto);

    // 2. Nhận accessToken từ Backend (khớp với Controller của bạn)
    if (response.data.accessToken) {
      // 3. Lưu vào Cookie (hết hạn sau 24 giờ, bảo mật SameSite)
      Cookies.set('accessToken', response.data.accessToken, {
        expires: 1,
        path: '/',
        sameSite: 'strict',
        secure: window.location.protocol === 'https:' // Chỉ gửi qua HTTPS nếu có
      });
    }
    return response.data;
  },

  getToken: () => Cookies.get('accessToken'),

  logout: () => {
    Cookies.remove('accessToken', { path: '/' });
    window.location.href = '/login';
  },

  isAuthenticated: () => !!Cookies.get('accessToken')
};
