export interface Answer {
  id: number;
  answerContent: string;
  isCorrect: boolean;
}

export interface QuestionResponse {
  page: number;
  pageSize: number;
  totalPages: number;
  questionCount: number;
  questions: Question[];
}

export interface QuestionFilter {
  chuong?: number;
  cauDiemLiet?: boolean;
  bienBao?: boolean;
  soLuong?: number;
  trang?: number;
  TuKhoa?: string;
}
export interface Question {
  id: number;
  questionContent: string;
  explanation: string;
  imageUrl?: string;
  isCritical: boolean;
  categories: string[];    // Tên chương: ["Văn hóa", "Điểm liệt"]
  categoryIds: number[];   // ID chương: [2, 0] - THÊM DÒNG NÀY
  answers: Answer[];
}

export interface Category {
  categoryId: number;
  categoryName: string;
}