import axios from 'axios';
import Cookies from 'js-cookie';
import { url } from '../../env.js';

const API_URL = url; // Sử dụng url từ env.js

export const AuthService = {
  login: async (dto: any) => {
    const response = await axios.post(`${API_URL}auth/login`, dto, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = response.data;
    if (!data?.accessToken) {
      throw new Error('Không nhận được accessToken từ server');
    }

    Cookies.set('accessToken', data.accessToken, { path: '/' });
    if (data.role !== undefined) {
      Cookies.set('userRole', data.role === 1 ? 'ADMIN' : 'USER', { path: '/' });
    }
    if (data.userId !== undefined) {
      Cookies.set('userId', String(data.userId), { path: '/' });
    }
    if (data.name !== undefined) {
      Cookies.set('userName', data.name, { path: '/' });
    }
    return data;
  },

  register: async (dto: any) => {
    const response = await axios.post(`${API_URL}auth/register`, dto, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  getToken: () => Cookies.get('accessToken') || localStorage.getItem('accessToken'),

  logout: () => {
  Cookies.remove('accessToken', { path: '/' });
  Cookies.remove('userRole', { path: '/' });
  Cookies.remove('userId', { path: '/' });
  Cookies.remove('userName', { path: '/' });
  Cookies.remove('userEmail', { path: '/' });
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
    globalThis.location.href = '/';
  },

  isAuthenticated: () => !!Cookies.get('accessToken') || !!localStorage.getItem('accessToken')
};
