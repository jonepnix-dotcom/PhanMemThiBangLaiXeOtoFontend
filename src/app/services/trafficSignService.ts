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

  // Server-side pagination: attempt to call API with Vietnamese params 'trang' and 'SoLuong'.
  // Parses responses that are either a plain array or an object containing items/data and total count.
  getPaged: async (page = 1, pageSize = 24, categoryId?: number): Promise<{ items: TrafficSignDTO[]; total: number }> => {
    const params: any = { trang: page, SoLuong: pageSize };
    if (typeof categoryId === 'number') params.categoryId = categoryId;
    const response = await apiClient.get('/BienBao', { params });
    const data = response.data;

    // If API returns an array directly
    if (Array.isArray(data)) {
      return { items: data as TrafficSignDTO[], total: data.length };
    }

    // Try common shapes: { items: [], total: N } or { data: [], total: N } or { results: [], totalCount: N }
    const items: TrafficSignDTO[] = Array.isArray(data.items)
      ? data.items
      : Array.isArray(data.data)
      ? data.data
      : Array.isArray(data.results)
      ? data.results
      : [];

    const total: number = typeof data.total === 'number'
      ? data.total
      : typeof data.totalItems === 'number'
      ? data.totalItems
      : typeof data.totalCount === 'number'
      ? data.totalCount
      : items.length;

    return { items, total };
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
