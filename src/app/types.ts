export interface Question {
  id: string;
  content: string;
  options: string[];
  correctAnswer: number;
  chapterId: number;
  isParalysis: boolean; // Câu điểm liệt
  imageUrl?: string;
  explanation?: string;
  optionExplanations?: string[]; // per-option explanations
}

export interface Chapter {
  id: number;
  title: string;
  description?: string;
  questionIds?: number[];
}

export const CHAPTERS: Chapter[] = [
  { id: 1, title: 'Chương 1: Khái niệm và quy tắc' },
  { id: 2, title: 'Chương 2: Nghiệp vụ vận tải' },
  { id: 3, title: 'Chương 3: Văn hóa và đạo đức' },
  { id: 4, title: 'Chương 4: Kỹ thuật lái xe' },
  { id: 5, title: 'Chương 5: Cấu tạo và sửa chữa' },
  { id: 6, title: 'Chương 6: Hệ thống biển báo' },
  { id: 7, title: 'Chương 7: Các thế sa hình' },
];
