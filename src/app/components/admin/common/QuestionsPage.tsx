import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { questionService } from '../../../services/questionService';
import { AuthService } from '../../../services/authService';
import { QuestionResponse, QuestionFilter, Category } from '../../../admin-types';
import QuestionList from './QuestionList';
import { QuestionFilterComponent } from './QuestionFilter';
import { Pagination } from './Pagination';
import { QuestionFormModal } from './QuestionModal';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  ChevronUpIcon,
  HashtagIcon,
  InboxIcon
} from '@heroicons/react/24/outline';

const QuestionsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QuestionResponse | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filter, setFilter] = useState<QuestionFilter>({ soLuong: 20, trang: 1, TuKhoa: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('https://localhost:52207/api/chuong');
      setCategories(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách chương:", err);
    }
  };

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await questionService.getQuestions(filter);
      setData(response);
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      // Giảm thời gian timeout xuống một chút để trải nghiệm mượt hơn
      setTimeout(() => setLoading(false), 300);
    }
  }, [filter]);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePageChange = (p: number) => {
    setFilter(prev => ({ ...prev, trang: p }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans relative">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col">

          {/* TẦNG 1: TOP BAR */}
          <div className="px-6 h-16 flex items-center justify-between gap-4 border-b border-slate-50">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <HashtagIcon className="h-6 w-6 text-white stroke-[2.5]" />
              </div>
              <span className="font-black text-slate-800 hidden lg:block uppercase tracking-tighter text-sm">Hệ thống câu hỏi</span>
            </div>

            <div className="flex-1 max-w-2xl relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm nội dung..."
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSelectedQuestion(null); setIsModalOpen(true); }}
                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase"
              >
                <PlusIcon className="h-5 w-5 inline mr-1" /> Thêm mới
              </button>
              <button onClick={() => AuthService.logout()} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors">
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* TẦNG 2: BỘ LỌC & PHÂN TRANG (Đã sửa lỗi flickering) */}
          <div className="px-6 py-4 bg-slate-50/50 flex flex-col gap-4">
            <div className="w-full">
              <QuestionFilterComponent filter={filter} onFilterChange={setFilter} />
            </div>

            {/* Chỉ kiểm tra data, không kiểm tra loading để giữ nguyên vị trí phân trang */}
            {data && data.totalPages > 1 && (
              <div className={`w-full bg-white p-2 rounded-2xl shadow-sm border border-slate-200/60 flex items-center justify-between transition-all duration-300 ${loading ? 'opacity-60 pointer-events-none grayscale-[0.5]' : 'opacity-100'}`}>
                <div className="px-4 py-1 border-r border-slate-100 flex items-center gap-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Trang {data.page} / {data.totalPages}
                  </p>
                  {loading && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  )}
                </div>

                <div className="flex-1 flex justify-center">
                  <Pagination
                    currentPage={data.page}
                    totalPages={data.totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>

                <div className="w-[100px] hidden md:block" />
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        {loading && !data ? (
          <QuestionList questions={[]} categories={categories} isLoading={true} onEdit={() => { }} onDelete={() => { }} />
        ) : data && data.questions && data.questions.length > 0 ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <QuestionList
              questions={data.questions}
              categories={categories}
              isLoading={loading}
              onEdit={(q) => { setSelectedQuestion(q); setIsModalOpen(true); }}
              onDelete={(id) => { if (window.confirm('Xóa câu hỏi này?')) questionService.deleteQuestion(id).then(() => fetchQuestions()); }}
            />

            <div className="py-12 flex flex-col items-center gap-4 border-t border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                Kết thúc danh sách
              </p>
              <Pagination
                currentPage={data.page}
                totalPages={data.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <InboxIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs">Không tìm thấy kết quả</p>
          </div>
        )}
      </main>


      {isModalOpen && (
        <QuestionFormModal
          data={selectedQuestion}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { setIsModalOpen(false); fetchQuestions(); }}
        />
      )}
    </div>
  );
};

export default QuestionsPage;
