// 1. Thay đổi dòng này:
// import axios from 'axios'; 
// Thành dòng này:
import apiClient from '../api/axiosClient';

import { QuestionResponse, QuestionFilter } from '../admin-types/question.types';

// 2. Không cần khai báo API_URL nữa vì đã có trong baseURL của apiClient
// const API_URL = 'https://localhost:52207/api';

export const questionService = {
  getQuestions: async (filter: QuestionFilter): Promise<QuestionResponse> => {
    const params = new URLSearchParams();
    if (filter.chuong) params.append('Chuong', filter.chuong.toString());
    if (filter.cauDiemLiet !== undefined) params.append('CauDiemLiet', filter.cauDiemLiet.toString());
    if (filter.bienBao !== undefined) params.append('BienBao', filter.bienBao.toString());
    if (filter.soLuong) params.append('SoLuong', filter.soLuong.toString());
    if (filter.trang) params.append('Trang', filter.trang.toString());
    if (filter.TuKhoa) params.append('TuKhoa', filter.TuKhoa);

    // Đổi axios -> apiClient
    const response = await apiClient.get<QuestionResponse>(`/cauhoi`, { params });
    return response.data;
  },

  createQuestion: async (formData: FormData) => {
    // Đổi axios -> apiClient
    return await apiClient.post(`/cauhoi/form/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateQuestion: async (id: number, formData: FormData) => {
    // Đổi axios -> apiClient
    // Interceptor sẽ tự động chèn Bearer Token vào đây cho bạn
    return await apiClient.put(`/cauhoi/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteQuestion: async (id: number) => {
    // Đổi axios -> apiClient
    return await apiClient.delete(`/cauhoi/${id}`);
  }
};
