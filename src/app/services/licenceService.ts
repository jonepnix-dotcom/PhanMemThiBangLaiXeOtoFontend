// 1. Import apiClient đã có sẵn Interceptor
import apiClient from '../api/axiosClient';
import { AuthService } from './authService';
import { CategoryDto, LicenceDto } from '../admin-types/licence.type';

export const LicenceService = {
  /**
   * LẤY TẤT CẢ VĂN BẰNG
   */
  getAllLicences: async (): Promise<LicenceDto[]> => {
    // 2. Dùng apiClient (nó sẽ tự thêm Token và dùng baseURL đã cấu hình)
    const response = await apiClient.get('/vanbang');
    return response.data;
  },

  /**
   * LẤY CHI TIẾT 1 VĂN BẰNG
   */
  getLicenceById: async (id: number): Promise<LicenceDto> => {
    const response = await apiClient.get(`/vanbang/${id}`);
    return response.data;
  },

  /**
   * TẠO MỚI VĂN BẰNG
   */
  createLicence: async (data: LicenceDto): Promise<any> => {
    const token = AuthService.getToken();
    const response = await apiClient.post('/vanbang', data, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  /**
   * CẬP NHẬT VĂN BẰNG
   */
  updateLicence: async (id: number, data: LicenceDto): Promise<any> => {
    const token = AuthService.getToken();
    const response = await apiClient.put(`/vanbang/${id}`, data, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  /**
   * XÓA VĂN BẰNG
   */
  deleteLicence: async (id: number): Promise<any> => {
    const token = AuthService.getToken();
    const response = await apiClient.delete(`/vanbang/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
  },

  /**
   * LẤY DANH SÁCH CHƯƠNG
   */
  getCategories: async (): Promise<CategoryDto[]> => {
    const response = await apiClient.get('/chuong');
    return response.data;
  }
};
