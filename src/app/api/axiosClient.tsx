import axios from 'axios';
import Cookies from 'js-cookie';
import { url } from '../../env.js';

// Đảm bảo baseURL luôn đúng cấu trúc https://domain.com/api
const cleanUrl = url.endsWith('/') ? url : `${url}/`;

const apiClient = axios.create({
  baseURL: `${cleanUrl}api`,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');
    if (token) {
      // replace(/^"(.*)"$/, '$1') để phòng trường hợp token bị dính dấu ngoặc kép khi lưu
      const cleanToken = token.replace(/^"(.*)"$/, '$1');
      config.headers.Authorization = `Bearer ${cleanToken.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ logout nếu thực sự là lỗi xác thực từ server
    if (error.response?.status === 401) {
      localStorage.clear(); // Xóa sạch cho chắc
      Cookies.remove('accessToken', { path: '/' });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
