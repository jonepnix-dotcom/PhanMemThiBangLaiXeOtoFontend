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
    const headers: any = config.headers || {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    config.headers = headers;
  const isDev = (import.meta as any)?.env?.DEV;
    if (isDev) {
      console.debug('[apiClient] request', config.method, config.url, {
        hasToken: !!token,
        authHeader: headers.Authorization ? `${headers.Authorization.slice(0, 7)}...` : null,
        cookieToken: Cookies.get('accessToken')
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// X? l� l?i 401 (H?t h?n ho?c chua dang nh?p), ho?c 403 (C?m quy?n)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      Cookies.remove('accessToken', { path: '/' });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      globalThis.location.href = '/';
    } else if (status === 403) {
      console.warn('[apiClient] Forbidden request, user remains on page', error.config?.url);
      if ((import.meta as any)?.env?.DEV) {
        console.warn('[apiClient] response body', error.response?.data);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
