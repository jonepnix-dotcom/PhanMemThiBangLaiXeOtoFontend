import React, { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, Search, AlertTriangle, Layers, Download, Eye, FileText, BookOpen, Settings, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

import { CHAPTERS, Question, Chapter } from '@/app/types';

interface AdminPageProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  chapters?: Chapter[];
}

export const AdminPage: React.FC<AdminPageProps> = ({ questions, setQuestions, chapters: propChapters }) => {
  const chapters = propChapters && propChapters.length ? propChapters : CHAPTERS;
  const [adminTab, setAdminTab] = useState<'overview'|'questions'|'review'|'docs'|'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterChapter, setFilterChapter] = useState<number | 'ALL'>('ALL');
  const [filterParalysis, setFilterParalysis] = useState<boolean | 'ALL'>('ALL');

  // Form Handlers
  const handleAddNew = () => {
    setCurrentQuestion({
      id: '',
      content: '',
      options: ['', '', '', ''],
                        explanation: '',
                        imageUrl: '',
      correctAnswer: 0,
      chapterId: 1,
      isParalysis: false,
    });
    setIsEditing(true);
  };

  const handleEdit = (q: Question) => {
    setCurrentQuestion({ ...q });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này không?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast.success('Đã xóa câu hỏi thành công');
    }
  };

  const handleDeleteAll = () => {
    if (!questions || questions.length === 0) {
      toast.error('Không có câu hỏi để xóa');
      return;
    }
    if (!confirm('Bạn sắp xóa toàn bộ câu hỏi trong hệ thống. Thao tác này không thể hoàn tác. Tiếp tục?')) return;
    setQuestions([]);
    try {
      window.localStorage.removeItem('questions');
    } catch {}
    toast.success('Đã xóa toàn bộ câu hỏi');
  };

  const handleSave = () => {
    if (!currentQuestion.content || !currentQuestion.options?.every(o => o.trim() !== '')) {
      toast.error('Vui lòng điền đầy đủ nội dung câu hỏi và các đáp án');
      return;
    }

    if (currentQuestion.id) {
      // Update
      setQuestions(prev => prev.map(q => q.id === currentQuestion.id ? currentQuestion as Question : q));
      toast.success('Cập nhật câu hỏi thành công');
    } else {
      // Create
      const newQuestion = {
        ...currentQuestion,
                                        explanation: currentQuestion.explanation || '',
        id: Math.random().toString(36).slice(2, 11),
      } as Question;
      setQuestions(prev => [...prev, newQuestion]);
      toast.success('Thêm câu hỏi mới thành công');
    }
    setIsEditing(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [])];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

    // Note: per-option explanations removed from UI. Keep handler removed.

  // Filter Logic
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesChapter = filterChapter === 'ALL' || q.chapterId === filterChapter;
    const matchesParalysis = filterParalysis === 'ALL' || q.isParalysis === filterParalysis;
    return matchesSearch && matchesChapter && matchesParalysis;
  });

  // Documents
  type Doc = { id: string; name: string; link: string; createdAt: number };

  const [documents, setDocuments] = useState<Doc[]>(() => {
    try { return JSON.parse(window.localStorage.getItem('documents') || '[]'); } catch { return []; }
  });
  const [docForm, setDocForm] = useState({ name: '', link: '' });
  const [viewDoc, setViewDoc] = useState<Doc | null>(null);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Review chapters management (admin can create/update chapters used by ReviewPage)
  interface ReviewChapter { id: number; title: string; topic: string; detail?: string; questionIds?: number[] }

  const DEFAULT_REVIEW_CHAPTERS: ReviewChapter[] = [
    { id: 1, title: 'Chương I', topic: 'Quy định chung và quy tắc giao thông đường bộ', detail: '166 câu (từ câu 1 đến câu 166)', questionIds: [] },
    { id: 2, title: 'Chương II', topic: 'Nghiệp vụ vận tải', detail: '26 câu (từ câu 167 đến câu 192)', questionIds: [] },
    { id: 3, title: 'Chương III', topic: 'Văn hóa giao thông, đạo đức người lái xe', detail: '21 câu (từ câu 193 đến câu 213)', questionIds: [] },
    { id: 4, title: 'Chương IV', topic: 'Kỹ thuật lái xe', detail: '56 câu (từ câu 214 đến câu 269)', questionIds: [] },
    { id: 5, title: 'Chương V', topic: 'Cấu tạo và sửa chữa', detail: '35 câu (từ câu 270 đến câu 304)', questionIds: [] },
    { id: 6, title: 'Chương VI', topic: 'Hệ thống biển báo đường bộ', detail: '182 câu (từ câu 305 đến câu 486)', questionIds: [] },
    { id: 7, title: 'Chương VII', topic: 'Giải các thế sa hình và kỹ năng xử lý tình huống', detail: '114 câu (từ câu 487 đến câu 600)', questionIds: [] },
  ];

  const [reviewChapters, setReviewChapters] = useState<ReviewChapter[]>(() => {
    try {
      const raw = window.localStorage.getItem('reviewChapters');
      if (!raw) return DEFAULT_REVIEW_CHAPTERS;
      const parsed = JSON.parse(raw) as ReviewChapter[];
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_REVIEW_CHAPTERS;
    } catch {
      return DEFAULT_REVIEW_CHAPTERS;
    }
  });
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewChapter | null>(null);

  const saveReviewChapters = (arr: ReviewChapter[]) => {
    setReviewChapters(arr);
    try { window.localStorage.setItem('reviewChapters', JSON.stringify(arr)); } catch {}
  };

  const openEditReview = (r?: ReviewChapter) => {
    setEditingReview(r ? { ...r } : { id: Date.now() % 100000, title: '', topic: '', detail: '', questionIds: [] });
    setIsReviewModalOpen(true);
  };

  const applyReviewMappingToQuestions = () => {
    // For each review chapter, set chapterId on questions that match questionIds
    setQuestions(prev => {
      const next = prev.map(q => {
        // try to derive numeric id from question.id which may be like 'api-123' or numeric string
        const numericId = Number(String(q.id).replace(/^api-/, ''));
        for (const rc of reviewChapters) {
          if (Array.isArray(rc.questionIds) && rc.questionIds.includes(numericId)) {
            return { ...q, chapterId: rc.id };
          }
        }
        return q;
      });
      try { window.localStorage.setItem('questions', JSON.stringify(next)); } catch {}
      toast.success('Áp dụng phân chương cho câu hỏi thành công');
      return next;
    });
  };

  const saveDocs = (docs: Doc[]) => {
    setDocuments(docs);
    window.localStorage.setItem('documents', JSON.stringify(docs));
  };

  const handleUploadDoc = () => {
    if (!docForm.name.trim() || !docForm.link.trim()) { toast.error('Nhập tên và link tài liệu'); return; }
    const newDoc: Doc = { id: Math.random().toString(36).slice(2, 9), name: docForm.name.trim(), link: docForm.link.trim(), createdAt: Date.now() };
    saveDocs([...documents, newDoc]);
    setDocForm({ name: '', link: '' });
    setIsDocModalOpen(false);
    toast.success('Đã thêm tài liệu');
  };

  const handleDeleteDoc = (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) return;
    saveDocs(documents.filter(d => d.id !== id));
    toast.success('Đã xóa tài liệu');
  };

  const handleDownloadDoc = (link: string, name: string) => {
    const a = document.createElement('a');
    a.href = link;
    a.download = name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Admin: fetch questions from remote API and merge/replace local questions
  const fetchQuestionsFromServer = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/questions');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid response');

      const mapped: Question[] = data.map((q: any) => {
        const options = Array.isArray(q.answers) ? q.answers.map((a: any) => a?.text ?? String(a)) : (q.options ?? []);
        let correctIndex = 0;
        if (Array.isArray(q.answers)) {
          const idx = q.answers.findIndex((a: any) => a && (a.correct === true || a.isCorrect === true));
          if (idx !== -1) correctIndex = idx;
        } else if (typeof q.correct === 'number') {
          correctIndex = q.correct;
        } else if (typeof q.correctAnswer === 'number') {
          correctIndex = q.correctAnswer;
        }

        return {
          id: `api-${String(q.id)}`,
          content: q.question ?? q.content ?? '',
          options,
          correctAnswer: Math.max(0, Math.min(correctIndex, options.length - 1)),
          chapterId: Array.isArray(q.categoryIds) && q.categoryIds.length > 0 ? Number(q.categoryIds[0]) : (q.chapterId ?? 1),
          isParalysis: !!q.isParalysis,
          imageUrl: q.hinhanhqAlt ?? q.imageUrl,
          explanation: q.explanation ?? '',
          optionExplanations: q.optionExplanations ?? undefined,
        } as Question;
      });

      // Merge: keep existing local questions (by id) and add/update from API
      setQuestions(prev => {
        const byId = new Map(prev.map(p => [p.id, p]));
        for (const mq of mapped) byId.set(mq.id, mq);
        const merged = Array.from(byId.values());
        try { window.localStorage.setItem('questions', JSON.stringify(merged)); } catch {}
        return merged;
      });
      toast.success(`Đã tải ${mapped.length} câu hỏi từ server`);
    } catch (err) {
      console.warn('Failed to fetch questions from API', err);
      toast.error('Không thể tải câu hỏi từ server. Kiểm tra API và thử lại.');
    }
  };

  const handleViewDoc = (doc: Doc) => setViewDoc(doc);
  const closeView = () => setViewDoc(null);

  return (
    <div className="flex-1 bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-4 bg-blue-100 rounded-full mb-4"
          >
            <Settings className="w-8 h-8 text-blue-600" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold text-gray-900 mb-4"
          >
            Quản Trị Hệ Thống
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Quản lý ngân hàng câu hỏi, tài liệu học tập và các thiết lập hệ thống khác.
          </motion.p>
        </div>

        <div className="space-y-6">
          {/* Top menu (replaces sidebar) - sticky when scrolling */}
          <div className="sticky top-24 z-40">
            <nav className="w-full flex flex-wrap items-center gap-3 mb-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-xl shadow-sm">
            <button onClick={() => setAdminTab('overview')} className={`px-4 py-2 rounded-xl transition-colors ${adminTab==='overview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
              <div className="flex items-center gap-2"><BookOpen size={16} /> <span className="hidden sm:inline">Overview</span></div>
            </button>
            <button onClick={() => setAdminTab('questions')} className={`px-4 py-2 rounded-xl transition-colors ${adminTab==='questions' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
              <div className="flex items-center gap-2"><BookOpen size={16} /> <span className="hidden sm:inline">Questions</span></div>
            </button>
            <button onClick={() => setAdminTab('review')} className={`px-4 py-2 rounded-xl transition-colors ${adminTab==='review' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
              <div className="flex items-center gap-2"><Layers size={16} /> <span className="hidden sm:inline">Review Chapters</span></div>
            </button>
            <button onClick={() => setAdminTab('docs')} className={`px-4 py-2 rounded-xl transition-colors ${adminTab==='docs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
              <div className="flex items-center gap-2"><FileText size={16} /> <span className="hidden sm:inline">Documents</span></div>
            </button>
            <button onClick={() => setAdminTab('settings')} className={`px-4 py-2 rounded-xl transition-colors ${adminTab==='settings' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-100'}`}>
              <div className="flex items-center gap-2"><Settings size={16} /> <span className="hidden sm:inline">Settings</span></div>
            </button>
          </nav>
          </div>

          <main>
            {/* Quick Stats Dashboard (overview) */}
            {adminTab === 'overview' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tổng câu hỏi</div>
                    <div className="text-2xl font-bold text-gray-900">{questions.length}</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Câu điểm liệt</div>
                    <div className="text-2xl font-bold text-gray-900">{questions.filter(q => q.isParalysis).length}</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                      <Layers size={20} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Chapters (API/Local)</div>
                      <div className="text-2xl font-bold text-gray-900">{(propChapters && propChapters.length) ? `${propChapters.length} / ${chapters.length}` : `${chapters.length}`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={async () => {
                      try {
                        const res = await fetch('http://localhost:3000/api/chapters');
                        if (!res.ok) throw new Error('HTTP ' + res.status);
                        const data = await res.json();
                        if (!Array.isArray(data)) throw new Error('Invalid response');
                        const mapped = data.map((c: any) => ({ id: Number(c.id) + 1, title: c.title ?? `Chương ${c.id}`, description: c.description ?? '', questionIds: Array.isArray(c.questionIds) ? c.questionIds.map((n: any) => Number(n)) : [] }));
                        try { window.localStorage.setItem('chapters', JSON.stringify(mapped)); } catch {}
                        toast.success(`Đã tải ${mapped.length} chương từ server`);
                      } catch (err) {
                        console.warn('Failed to fetch chapters', err);
                        toast.error('Không thể tải chapters từ server');
                      }
                    }} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl">Tải Chapters</button>
                  </div>
                </div>
              </div>
            )}

        {/* Question Bank Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <BookOpen size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ngân Hàng Câu Hỏi</h2>
                <p className="text-sm text-gray-500 mt-1">Quản lý {questions.length} câu hỏi trong hệ thống</p>
                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">Tổng: <strong className="ml-2">{questions.length}</strong></span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">Câu điểm liệt: <strong className="ml-2">{questions.filter(q => q.isParalysis).length}</strong></span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">Chương khác: <strong className="ml-2">{new Set(questions.map(q => q.chapterId)).size}</strong></span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleAddNew}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all transform hover:scale-105 font-medium"
              >
                <Plus size={20} />
                <span>Thêm Câu Hỏi Mới</span>
              </button>
              <button
                onClick={fetchQuestionsFromServer}
                className={`w-full md:w-auto bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all font-medium`}
                title="Lấy câu hỏi từ server"
              >
                <RefreshCw size={18} />
                <span className="hidden sm:inline">Lấy từ server</span>
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={questions.length === 0}
                className={`w-full md:w-auto bg-red-50 hover:bg-red-100 text-red-600 px-4 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all font-medium ${questions.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Xóa tất cả câu hỏi"
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Xóa tất cả</span>
              </button>
            </div>
          </div>

          {/* Review Chapters Management */}
          <div className="p-6 sm:p-8 bg-gray-50/50 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Quản lý nội dung Ôn Tập</h3>
                <p className="text-sm text-gray-500">Tạo/sửa các chương ôn tập và gán danh sách câu hỏi (questionIds)</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditReview()} className="px-4 py-2 bg-blue-600 text-white rounded-xl">Thêm chương</button>
                <button onClick={applyReviewMappingToQuestions} className="px-4 py-2 bg-green-600 text-white rounded-xl">Áp dụng phân chương</button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {reviewChapters.map(rc => (
                <div key={rc.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-500">ID: {rc.id}</div>
                    <div className="font-semibold text-gray-900">{rc.title}</div>
                    <div className="text-sm text-gray-600">{rc.topic}</div>
                    <div className="text-xs text-gray-400 mt-2">Chi tiết: {rc.detail}</div>
                    <div className="text-xs text-gray-500 mt-2">Số câu gán: {Array.isArray(rc.questionIds) ? rc.questionIds.length : 0}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEditReview(rc)} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-xl">Sửa</button>
                    <button onClick={() => { saveReviewChapters(reviewChapters.filter(x => x.id !== rc.id)); toast.success('Đã xóa chương ôn tập'); }} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl">Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-gray-50/50">
            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm nội dung câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                />
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                  <select
                      value={filterChapter}
                      onChange={(e) => setFilterChapter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white min-w-[180px] transition-all"
                  >
                      <option value="ALL">Tất cả chương</option>
                      {chapters.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                  </select>

                  <select
                      value={String(filterParalysis)}
                      onChange={(e) => setFilterParalysis(e.target.value === 'ALL' ? 'ALL' : e.target.value === 'true')}
                      className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all"
                  >
                      <option value="ALL">Tất cả loại câu</option>
                      <option value="false">Câu thường</option>
                      <option value="true">Câu điểm liệt</option>
                  </select>
              </div>
            </div>

            {/* Question List */}
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                  {filteredQuestions.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center py-16 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200"
                      >
                          <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium text-gray-900">Không tìm thấy câu hỏi</p>
                          <p className="mt-1 text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                      </motion.div>
                  ) : (
                      filteredQuestions.map((q) => (
                          <motion.div
                              key={q.id}
                              layout
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className={`bg-white p-6 rounded-2xl shadow-sm border transition-all hover:shadow-md flex flex-col sm:flex-row gap-6 ${q.isParalysis ? 'border-red-200 hover:border-red-300' : 'border-gray-100 hover:border-blue-200'}`}
                          >
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                                        {chapters.find(c => c.id === q.chapterId)?.title || 'Chương ?'}
                                    </span>
                                    {q.isParalysis && (
                                        <span className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-lg uppercase tracking-wider border border-red-100">
                                            <AlertTriangle size={14} />
                                            Câu điểm liệt
                                        </span>
                                    )}
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900 mb-2 leading-relaxed">{q.content}</h3>
                                {q.explanation && (
                                    <p className="text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">{q.explanation}</p>
                                )}
                                <ul className="space-y-3 mt-4">
                                    {q.options.map((opt, idx) => (
                                        <li key={idx} className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${idx === q.correctAnswer ? 'border-green-200 bg-green-50/50 text-green-800' : 'border-gray-100 bg-white text-gray-600'}`}>
                                            <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${idx === q.correctAnswer ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                                                {idx === q.correctAnswer && <div className="w-2 h-2 rounded-full bg-white" />}
                                            </div>
                                            <span className="text-sm leading-relaxed">{opt}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex sm:flex-col gap-2 shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 justify-end sm:justify-start">
                                <button
                                    onClick={() => handleEdit(q)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                                    title="Sửa"
                                >
                                    <Edit size={16} />
                                    <span className="sm:hidden">Sửa</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(q.id)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                    title="Xóa"
                                >
                                    <Trash2 size={16} />
                                    <span className="sm:hidden">Xóa</span>
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </AnimatePresence>
            </div>
          </div>
        </motion.section>

          </main>
        </div>

      {/* Edit Modal */}
      <AnimatePresence>
      {isEditing && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        {currentQuestion.id ? <Edit size={20} /> : <Plus size={20} />}
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                          {currentQuestion.id ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Câu Hỏi Mới'}
                      </h2>
                    </div>
                    <button onClick={() => setIsEditing(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto flex-1">
                    {/* Chapter & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Chương</label>
                            <select
                                value={currentQuestion.chapterId}
                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, chapterId: Number(e.target.value) })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all"
                            >
                                {chapters.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                             <label className="flex items-center gap-3 cursor-pointer select-none p-3 border border-gray-200 rounded-xl w-full hover:bg-gray-50 transition-colors h-[50px]">
                                <input
                                    type="checkbox"
                                    checked={currentQuestion.isParalysis}
                                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, isParalysis: e.target.checked })}
                                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500 border-gray-300"
                                />
                                <span className={`font-medium ${currentQuestion.isParalysis ? 'text-red-600' : 'text-gray-600'}`}>
                                    Đánh dấu là câu điểm liệt
                                </span>
                       </label>
                        </div>
                    </div>

          {/* Image URL (moved above question content) */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Hình ảnh (URL) — tuỳ chọn</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={currentQuestion.imageUrl || ''}
                onChange={(e) => setCurrentQuestion({ ...currentQuestion, imageUrl: e.target.value })}
                placeholder="https://... hoặc đường dẫn tới ảnh"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setCurrentQuestion({ ...currentQuestion, imageUrl: '' })}
                className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
              >
                Xóa
              </button>
            </div>
            {currentQuestion.imageUrl && (
              <div className="mt-3">
                <img src={currentQuestion.imageUrl} alt="preview" className="max-h-40 rounded-lg border border-gray-200 shadow-sm" />
              </div>
            )}
          </div>

          {/* Question Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nội dung câu hỏi</label>
            <textarea
              value={currentQuestion.content}
              onChange={(e) => setCurrentQuestion({ ...currentQuestion, content: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="Nhập nội dung câu hỏi..."
            />
          </div>

                    {/* (Giải thích moved below options) */}

                    {/* Options */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Các phương án trả lời</label>
                        <div className="space-y-3">
                            {currentQuestion.options?.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        checked={currentQuestion.correctAnswer === idx}
                                        onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: idx })}
                                        className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer"
                                        title="Chọn làm đáp án đúng"
                                    />
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                                        className={`flex-1 px-4 py-3 border rounded-xl outline-none transition-all ${currentQuestion.correctAnswer === idx ? 'border-green-500 bg-green-50 ring-1 ring-green-200' : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'}`}
                                        placeholder={`Đáp án ${idx + 1}`}
                                    />
                                    {currentQuestion.options && currentQuestion.options.length > 2 && (
                                        <button
                                            onClick={() => {
                                                const newOpts = currentQuestion.options?.filter((_, i) => i !== idx);
                                                let newCorrect = currentQuestion.correctAnswer || 0;
                                                if (idx < newCorrect) newCorrect--;
                                                if (idx === newCorrect) newCorrect = 0;
                                                setCurrentQuestion({ ...currentQuestion, options: newOpts, correctAnswer: newCorrect });
                                            }}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa lựa chọn này"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentQuestion({
                                ...currentQuestion,
                                options: [...(currentQuestion.options || []), '']
                            })}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors w-fit"
                        >
                            <Plus size={16} />
                            Thêm phương án
                        </button>

                        {/* Explanation */}
                        <div className="mt-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Giải thích (tuỳ chọn)</label>
                            <textarea
                                value={currentQuestion.explanation || ''}
                                onChange={(e) => setCurrentQuestion({ ...currentQuestion, explanation: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-gray-50 focus:bg-white transition-all"
                                placeholder="Nhập phần giải thích cho câu hỏi (ví dụ: tại sao đáp án này đúng, các chú ý...)"
                            />
                        </div>

              {/* Image URL */}
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hình ảnh (URL) — tuỳ chọn</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={currentQuestion.imageUrl || ''}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, imageUrl: e.target.value })}
                    placeholder="https://... hoặc đường dẫn tới ảnh"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setCurrentQuestion({ ...currentQuestion, imageUrl: '' })}
                    className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                  >
                    Xóa
                  </button>
                </div>
                {currentQuestion.imageUrl && (
                  <div className="mt-3">
                    <img src={currentQuestion.imageUrl} alt="preview" className="max-h-40 rounded-lg border border-gray-200 shadow-sm" />
                  </div>
                )}
              </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50 shrink-0">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 text-gray-600 font-medium hover:bg-gray-200 rounded-xl transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center gap-2"
                    >
                        <Save size={20} />
                        Lưu Thay Đổi
                    </button>
                </div>
            </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      {/* Documents Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quản Lý Tài Liệu</h2>
              <p className="text-sm text-gray-500 mt-1">Quản lý {documents.length} tài liệu học tập</p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-gray-50/50">
          {/* Upload: show a single centered button that opens modal */}
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-sm transition-transform transform hover:scale-105"
            >
              <Plus size={18} />
              Thêm Tài Liệu
            </button>
          </div>

          {/* Document List */}
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {documents.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-16 text-gray-400 bg-white rounded-2xl border-2 border-dashed border-gray-200"
                >
                  <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900">Chưa có tài liệu nào</p>
                  <p className="mt-1 text-gray-500">Hãy thêm tài liệu mới để học viên có thể tải xuống.</p>
                </motion.div>
              ) : (
                documents.map(d => (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                        <FileText size={24} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">{d.name}</h3>
                        <p className="text-sm text-gray-500 truncate mt-1">{d.link}</p>
                        <div className="text-xs text-gray-400 mt-2">Đăng lúc: {new Date(d.createdAt).toLocaleString('vi-VN')}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100">
                      <button
                        onClick={() => handleDownloadDoc(d.link, d.name)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                        title="Tải xuống"
                      >
                        <Download size={16} />
                        <span className="sm:hidden">Tải xuống</span>
                      </button>
                      <button
                        onClick={() => handleViewDoc(d)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                        title="Xem"
                      >
                        <Eye size={16} />
                        <span className="sm:hidden">Xem</span>
                      </button>
                      <button
                        onClick={() => handleDeleteDoc(d.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                        <span className="sm:hidden">Xóa</span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Document Viewer Modal */}
      <AnimatePresence>
      {viewDoc && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-gray-900/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white w-full max-w-5xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <FileText size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 truncate">{viewDoc.name}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button 
                  onClick={() => handleDownloadDoc(viewDoc.link, viewDoc.name)} 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Tải xuống</span>
                </button>
                <button onClick={closeView} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-gray-100 p-2 sm:p-4">
              <iframe src={viewDoc.link} className="w-full h-full rounded-xl bg-white shadow-sm border border-gray-200" title={viewDoc.name} />
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Add Document Modal */}
      <AnimatePresence>
        {isDocModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: 10 }}
              className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Thêm tài liệu</h3>
                <button onClick={() => setIsDocModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Tên tài liệu</label>
                  <input value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} placeholder="Tên tài liệu..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Link tài liệu</label>
                  <input value={docForm.link} onChange={(e) => setDocForm({ ...docForm, link: e.target.value })} placeholder="https://..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button onClick={() => { setDocForm({ name: '', link: '' }); setIsDocModalOpen(false); }} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200">Hủy</button>
                  <button onClick={handleUploadDoc} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                    <Plus size={16} />
                    Đăng
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        {/* Review Chapter Edit Modal */}
        <AnimatePresence>
          {isReviewModalOpen && editingReview && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
              <motion.div initial={{ scale: 0.98, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.98, opacity: 0, y: 10 }} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{editingReview.id ? 'Chỉnh sửa chương ôn tập' : 'Thêm chương'}</h3>
                  <button onClick={() => setIsReviewModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"><X size={18} /></button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">ID</label>
                    <input type="number" value={editingReview.id} onChange={(e) => setEditingReview({...editingReview, id: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Tiêu đề</label>
                    <input value={editingReview.title} onChange={(e) => setEditingReview({...editingReview, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Chủ đề</label>
                    <input value={editingReview.topic} onChange={(e) => setEditingReview({...editingReview, topic: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Chi tiết</label>
                    <input value={editingReview.detail} onChange={(e) => setEditingReview({...editingReview, detail: e.target.value})} className="w-full px-4 py-2 border rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Danh sách questionIds (phân tách bằng dấu phẩy)</label>
                    <textarea value={(editingReview.questionIds || []).join(',')} onChange={(e) => setEditingReview({...editingReview, questionIds: e.target.value.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n))})} className="w-full px-4 py-2 border rounded-lg" rows={3} />
                  </div>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-100">Hủy</button>
                    <button onClick={() => { const others = reviewChapters.filter(r => r.id !== editingReview.id); saveReviewChapters([...others, editingReview]); setIsReviewModalOpen(false); toast.success('Lưu chương ôn tập'); }} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Lưu</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  </div>
  );
};

