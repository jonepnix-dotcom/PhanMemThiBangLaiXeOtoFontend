import React, { useState, useEffect } from 'react';
import apiClient from '../../../api/axiosClient';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  MagnifyingGlassIcon, XMarkIcon, ExclamationCircleIcon, CheckCircleIcon,
  BookOpenIcon, KeyIcon
} from '@heroicons/react/24/outline';

import { QuestionFormModal } from './QuestionModal';
import { questionService } from '../../../services/questionService';

const ITEMS_PER_PAGE = 8;

interface CategoryDTO {
  categoryId: number;
  categoryName: string;
}

const Toast = ({ msg, type, onClose }: { msg: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border bg-white animate-in slide-in-from-right-8 z-[100] ${type === 'success' ? 'border-green-100' : 'border-red-100'}`}>
      {type === 'success' ? (
        <CheckCircleIcon className="h-6 w-6 text-green-500" />
      ) : (
        <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
      )}
      <div className="flex flex-col">
        <span className={`text-[10px] font-black uppercase tracking-widest ${type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
          {type === 'success' ? 'Thành công' : 'Lỗi'}
        </span>
        <span className="text-sm font-bold text-slate-700">{msg}</span>
      </div>
      <button onClick={onClose} className="p-1 hover:bg-slate-50 rounded-lg ml-2">
        <XMarkIcon className="h-5 w-5 text-slate-400" />
      </button>
    </div>
  );
};

const ChapterPage: React.FC = () => {
  const [chapters, setChapters] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryName: ''
  });
  
  // Chapter Questions State
  const [activeTab, setActiveTab] = useState<'info' | 'questions'>('info');
  const [chapterQuestions, setChapterQuestions] = useState<any[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/chuong');
      setChapters(res.data);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách chương:', err);
      setToast({ msg: 'Không thể kết nối đến máy chủ', type: 'error' });
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, []);

  const handleOpenModal = (chapter?: CategoryDTO) => {
    setActiveTab('info');
    if (chapter) {
      setEditingId(chapter.categoryId);
      setFormData({ categoryName: chapter.categoryName });
      fetchChapterQuestions(chapter.categoryId);
    } else {
      setEditingId(null);
      setFormData({ categoryName: '' });
      setChapterQuestions([]);
    }
    setIsModalOpen(true);
  };

  const fetchChapterQuestions = async (id: number) => {
    setLoadingQuestions(true);
    try {
      const res = await questionService.getQuestions({ chuong: id, soLuong: 1000 });
      setChapterQuestions(res.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleDeleteQuestion = async (qId: number) => {
    if (globalThis.confirm('Xóa câu hỏi khỏi hệ thống?')) {
      try {
        await questionService.deleteQuestion(qId);
        setToast({ msg: 'Đã xóa câu hỏi', type: 'success' });
        if (editingId) fetchChapterQuestions(editingId);
      } catch (err) {
        setToast({ msg: 'Lỗi khi xóa câu hỏi', type: 'error' });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ categoryName: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryName.trim()) {
      setToast({ msg: "Tên chương không được để trống!", type: 'error' });
      return;
    }
    
    try {
      if (editingId) {
        // Cập nhật
        await apiClient.put(`/chuong/${editingId}`, {
          categoryId: editingId,
          categoryName: formData.categoryName
        });
        setToast({ msg: "Cập nhật chương thành công!", type: 'success' });
      } else {
        // Tạo mới
        await apiClient.post('/chuong', {
          categoryName: formData.categoryName
        });
        setToast({ msg: "Thêm mới chương thành công!", type: 'success' });
      }
      handleCloseModal();
      fetchChapters();
    } catch (err) {
      setToast({ msg: "Lỗi khi lưu dữ liệu!", type: 'error' });
      console.error(err);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa chương "${name}" không?`)) {
      try {
  await apiClient.delete(`/chuong/${id}`);
        setToast({ msg: "Đã xóa chương thành công!", type: 'success' });
        fetchChapters();
      } catch (err) {
        setToast({ msg: "Lỗi không thể xóa chương (Có thể đang có câu hỏi thuộc chương này).", type: 'error' });
      }
    }
  };

  // Filter logic
  const filteredChapters = chapters.filter(c => 
    c.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.categoryId.toString().includes(searchTerm)
  );

  // Phân trang
  const totalPages = Math.ceil(filteredChapters.length / ITEMS_PER_PAGE);
  const currentData = filteredChapters.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans relative">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 hidden md:flex">
              <BookOpenIcon className="h-6 w-6 text-white stroke-[2.5]" />
            </div>
            <span className="font-black text-slate-800 hidden lg:block uppercase tracking-tighter text-sm">Quản lý chương</span>
          </div>

          <div className="flex-1 max-w-2xl relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm chương..."
              className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 md:px-5 py-2 md:py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] md:text-[11px] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase whitespace-nowrap"
          >
             <PlusIcon className="h-4 w-4 md:h-5 md:w-5 inline mr-1" /> Thêm mới
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="bg-white rounded-[2rem] p-6 border border-slate-100 min-h-[160px] flex items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentData.length > 0 ? currentData.map((chapter) => (
                <div key={chapter.categoryId} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                         <KeyIcon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl">
                        ID: {chapter.categoryId}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-2">{chapter.categoryName}</h3>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-50">
                    <button onClick={() => handleOpenModal(chapter)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(chapter.categoryId, chapter.categoryName)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-12 text-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                  Không tìm thấy chương nào phù hợp
                </div>
              )}
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-10 h-10 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                      currentPage === idx + 1 ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl flex flex-col h-[90vh] animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-6">
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  {editingId ? 'Quản lý chương' : 'Tạo mới chương'}
                </h2>
                
                {/* Tabs */}
                {editingId && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveTab('info')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'info' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      Thông tin chung
                    </button>
                    <button 
                      onClick={() => setActiveTab('questions')}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'questions' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                      Câu hỏi ({chapterQuestions.length})
                    </button>
                  </div>
                )}
              </div>
              <button title="Close Modal" onClick={handleCloseModal} className="p-2 -mr-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col">
              {activeTab === 'info' && (
                <form onSubmit={handleSave} className="p-8 flex-1 overflow-y-auto w-full max-w-md mx-auto mt-10">
                  <div className="mb-6">
                    <label id="category-name-label" className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tên chương *</label>
                    <input
                      aria-labelledby="category-name-label"
                      type="text"
                      required
                      className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="Nhập tên chương..."
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all hover:-translate-y-1 hover:shadow-xl shadow-indigo-200">
                    {editingId ? 'Lưu thay đổi' : 'Tạo chương mới'}
                  </button>
                </form>
              )}

              {activeTab === 'questions' && (
                <div className="flex-1 flex flex-col p-6 bg-slate-50 overflow-hidden">
                  <div className="flex justify-between items-center mb-4 shrink-0 px-2">
                    <h3 className="text-sm font-bold text-slate-700">Danh sách câu hỏi trong chương</h3>
                    <button
                      onClick={() => { setSelectedQuestion(null); setIsQuestionModalOpen(true); }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[11px] font-black shadow-lg hover:bg-indigo-700 transition-all uppercase flex items-center gap-1"
                    >
                      <PlusIcon className="h-4 w-4" /> Thêm câu hỏi
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar">
                    {loadingQuestions ? (
                      <div className="flex justify-center p-8"><div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" /></div>
                    ) : chapterQuestions.length > 0 ? (
                      chapterQuestions.map((q) => (
                        <div key={q.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex gap-4 hover:shadow-md transition-all">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">ID: {q.id}</span>
                              {q.isCritical && <span className="text-[10px] text-red-600 bg-red-50 font-bold px-2 py-0.5 rounded-lg">Điểm liệt</span>}
                            </div>
                            <p className="text-sm font-bold text-slate-800 line-clamp-2">{q.questionContent}</p>
                          </div>
                          <div className="flex flex-col gap-2 justify-center border-l border-slate-50 pl-4">
                            <button onClick={() => { setSelectedQuestion(q); setIsQuestionModalOpen(true); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
                        Chương này chưa có câu hỏi nào
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION MODAL */}
      {isQuestionModalOpen && (
        <QuestionFormModal
          data={selectedQuestion}
          defaultCategoryId={editingId ?? undefined}
          onClose={() => setIsQuestionModalOpen(false)}
          onSuccess={() => {
            setIsQuestionModalOpen(false);
            if (editingId) fetchChapterQuestions(editingId);
          }}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default ChapterPage;
