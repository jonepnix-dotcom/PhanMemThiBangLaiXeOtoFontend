import axios from 'axios';
import Cookies from 'js-cookie';
import { url } from '../../env.js';

const apiClient = axios.create({
  baseURL: url + 'api',
});

// T? d?ng d�n Token v�o Header
apiClient.interceptors.request.use(
  (config) => {
    // L?y token t? Cookies ho?c localStorage gi?ng c�ch x? l� c?a Consultation
    const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// X? l� l?i 401 (H?t h?n ho?c chua dang nh?p), ho?c 403 (C?m quy?n)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      Cookies.remove('accessToken', { path: '/' });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
