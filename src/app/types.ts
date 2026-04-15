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

export const CHAPTERS: Chapter[] = [];
