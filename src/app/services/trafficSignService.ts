import apiClient from '../api/axiosClient';

export interface TrafficSignDTO {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
}

export interface CategoryDTO {
  categoryId: number;
  categoryName: string;
}

const trafficSignService = {
  getAll: async (): Promise<TrafficSignDTO[]> => {
    const response = await apiClient.get<TrafficSignDTO[]>('/BienBao');
    return response.data;
  },

  // THÊM: Gọi API lấy danh mục động
  getCategories: async (): Promise<CategoryDTO[]> => {
    const response = await apiClient.get<CategoryDTO[]>('/chuong?phanloai=bienbao');
    return response.data;
  },

  create: async (formData: FormData): Promise<TrafficSignDTO> => {
    const response = await apiClient.post<TrafficSignDTO>('/BienBao/form', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  update: async (id: number, formData: FormData): Promise<void> => {
    await apiClient.put(`/BienBao/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/BienBao/${id}`);
  }
};

export default trafficSignService;
