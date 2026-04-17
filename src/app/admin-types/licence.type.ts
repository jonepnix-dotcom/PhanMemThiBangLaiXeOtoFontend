// Định nghĩa cấu trúc Luật thi (phần con trong JSON)
export interface LicenceRuleDto {
  categoryId: number;
  categoryName?: string; // Dùng để hiển thị tên chương nếu cần
  questionCount: number;
}

// Định nghĩa cấu trúc Văn bằng (Cục JSON tổng)
export interface LicenceDto {
  licenceId?: number; // Có ID khi Edit, không có khi Create
  licenceCode: string;
  totalQuestion?: number;
  questionCount?: number;
  duration: number;
  passScore: number;
  licenceRule: LicenceRuleDto[];
}

// Định nghĩa cấu trúc Chương (Từ /api/chuong)
export interface CategoryDto {
  id: number;
  name: string;
}