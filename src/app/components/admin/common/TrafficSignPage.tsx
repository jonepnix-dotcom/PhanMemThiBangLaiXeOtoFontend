import React, { useState, useEffect, useMemo } from 'react';
import trafficSignService, { TrafficSignDTO, CategoryDTO } from '../../../services/trafficSignService';
import {
  PlusIcon, PencilSquareIcon, TrashIcon,
  MagnifyingGlassIcon, XMarkIcon, PhotoIcon,
  FunnelIcon, ArrowPathIcon, ChevronUpIcon,
  HashtagIcon, InboxIcon, ChevronLeftIcon, ChevronRightIcon,
  CheckCircleIcon, ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const IMAGE_BASE_URL = "https://localhost:52207/assets/uploads/";
const ITEMS_PER_PAGE = 8;

// --- COMPONENT TOAST ---
const Toast = ({ msg, type, onClose }: { msg: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-5 border backdrop-blur-md ${type === 'success' ? 'bg-emerald-600/90 text-white border-emerald-500' : 'bg-red-600/90 text-white border-red-500'
      }`}>
      {type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationCircleIcon className="h-5 w-5" />}
      <span className="font-black uppercase text-[10px] tracking-widest">{msg}</span>
    </div>
  );
};

const TrafficSignAdmin: React.FC = () => {
  const [signs, setSigns] = useState<TrafficSignDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  // Search & Filter
  const [searchKey, setSearchKey] = useState('');
  const [filterTerm, setFilterTerm] = useState('');
  const [selectedSortCategory, setSelectedSortCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    previewUrl: '',
    imageFile: null as File | null,
    isImageChanged: false
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [signsData, catsData] = await Promise.all([
        trafficSignService.getAll(),
        trafficSignService.getCategories()
      ]);
      setSigns(signsData);
      setCategories(catsData);
    } catch (error) {
      console.error("Lỗi load data:", error);
    } finally {
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { setFilterTerm(searchKey); setCurrentPage(1); }, 350);
    return () => clearTimeout(timer);
  }, [searchKey]);

  const filteredSigns = useMemo(() => {
    return signs.filter(s => {
      const matchName = s.name.toLowerCase().includes(filterTerm.toLowerCase());
      const matchCat = selectedSortCategory === 'all' || s.categoryId.toString() === selectedSortCategory;
      return matchName && matchCat;
    });
  }, [signs, filterTerm, selectedSortCategory]);

  const totalPages = Math.ceil(filteredSigns.length / ITEMS_PER_PAGE);

  const paginatedSigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSigns.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSigns, currentPage]);

  // --- LOGIC PHÂN TRANG SỐ (HIỂN THỊ DẢI TRANG) ---
  const paginationRange = useMemo(() => {
    const range = [];
    const delta = 2; // Số lượng trang hiển thị xung quanh trang hiện tại

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      } else if (i === currentPage - delta - 1 || i === currentPage + delta + 1) {
        range.push('...');
      }
    }
    return Array.from(new Set(range));
  }, [totalPages, currentPage]);

  const handleOpenEditModal = (sign?: TrafficSignDTO) => {
    if (sign) {
      setFormData({
        name: sign.name,
        description: sign.description || '',
        categoryId: sign.categoryId.toString(),
        previewUrl: sign.imageUrl || '',
        imageFile: null,
        isImageChanged: false
      });
      setEditingId(sign.id);
    } else {
      setFormData({
        name: '',
        description: '',
        categoryId: categories[0]?.categoryId.toString() || '',
        previewUrl: '',
        imageFile: null,
        isImageChanged: false
      });
      setEditingId(null);
    }
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa biển báo "${name}" không?`)) {
      setIsLoading(true);
      try {
        await trafficSignService.delete(id); // Giả định service của bạn có hàm delete
        setToast({ msg: "Đã xóa biển báo thành công!", type: 'success' });
        await loadData(); // Load lại danh sách mới
      } catch (err) {
        setToast({ msg: "Lỗi khi xóa dữ liệu!", type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    data.append('Name', formData.name);
    data.append('Description', formData.description);
    data.append('CategoryId', formData.categoryId);

    if (editingId) {
      data.append('Id', editingId.toString());
      data.append('RemoveImage', formData.isImageChanged.toString());
      if (formData.isImageChanged && formData.imageFile) data.append('Image', formData.imageFile);
    } else {
      if (formData.imageFile) data.append('Image', formData.imageFile);
    }

    try {
      if (editingId) await trafficSignService.update(editingId, data);
      else await trafficSignService.create(data);

      setToast({
        msg: editingId ? "Cập nhật thành công!" : "Thêm biển báo thành công!",
        type: 'success'
      });
      setIsEditModalOpen(false);
      await loadData();
    } catch (err) {
      setToast({ msg: "Có lỗi xảy ra khi lưu!", type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans relative text-left pb-20">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col">

          {/* TOP BAR */}
          <div className="px-6 h-16 flex items-center justify-between gap-4 border-b border-slate-50">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
                <HashtagIcon className="h-6 w-6 text-white stroke-[2.5]" />
              </div>
              <span className="font-black text-slate-800 hidden lg:block uppercase tracking-tighter text-sm">Quản lý biển báo</span>
            </div>

            <div className="flex-1 max-w-2xl relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm biển báo..."
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none font-medium"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
            </div>

            <button
              onClick={() => handleOpenEditModal()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[11px] font-black shadow-xl hover:bg-indigo-700 transition-all uppercase flex items-center shrink-0"
            >
              <PlusIcon className="h-5 w-5 mr-1 stroke-[3]" /> Thêm mới
            </button>
          </div>

          {/* FILTERS & EXTENDED PAGINATION */}
          <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                <FunnelIcon className="h-4 w-4 text-indigo-500" />
                <select
                  className="bg-transparent border-none text-[11px] font-black uppercase tracking-wider text-slate-600 focus:ring-0 cursor-pointer p-0"
                  value={selectedSortCategory}
                  onChange={(e) => setSelectedSortCategory(e.target.value)}
                >
                  <option value="all">Tất cả phân loại</option>
                  {categories.map(cat => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:block">
                Tổng cộng: {filteredSigns.length} kết quả
              </p>
            </div>

            {/* NUMERIC PAGINATION */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">

                {/* Nút Về trang đầu - Sửa lỗi lệch icon */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="flex items-center justify-center p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-400 transition-all group"
                  title="Trang đầu"
                >
                  <div className="flex -space-x-2"> {/* Dùng âm margin giữa 2 div con để sát nhau hơn */}
                    <ChevronLeftIcon className="h-4 w-4 stroke-[3]" />
                    <ChevronLeftIcon className="h-4 w-4 stroke-[3]" />
                  </div>
                </button>

                {/* Nút lùi 1 trang */}
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-400 transition-all"
                >
                  <ChevronLeftIcon className="h-4 w-4 stroke-[3]" />
                </button>

                <div className="flex items-center mx-1">
                  {paginationRange.map((page, idx) => (
                    <React.Fragment key={idx}>
                      {page === '...' ? (
                        <span className="w-8 text-center text-slate-300 font-bold select-none">...</span>
                      ) : (
                        <button
                          onClick={() => setCurrentPage(Number(page))}
                          className={`min-w-[34px] h-8 mx-0.5 rounded-lg text-[11px] font-[1000] transition-all ${currentPage === page
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'hover:bg-indigo-50 text-slate-500'
                            }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Nút tiến 1 trang */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-400 transition-all"
                >
                  <ChevronRightIcon className="h-4 w-4 stroke-[3]" />
                </button>

                {/* Nút Đến trang cuối */}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="flex items-center justify-center p-2 hover:bg-slate-100 rounded-lg disabled:opacity-20 text-slate-400 transition-all"
                  title="Trang cuối"
                >
                  <div className="flex -space-x-2">
                    <ChevronRightIcon className="h-4 w-4 stroke-[3]" />
                    <ChevronRightIcon className="h-4 w-4 stroke-[3]" />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        {isLoading && signs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        ) : filteredSigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {paginatedSigns.map((sign) => (
              <div key={sign.id} className="group bg-white rounded-[2rem] border border-slate-200 overflow-hidden hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300">
                <div className="aspect-square bg-slate-50 relative flex items-center justify-center p-8">
                  <img
                    src={IMAGE_BASE_URL + sign.imageUrl}
                    alt={sign.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button onClick={() => handleOpenEditModal(sign)} className="p-3 bg-white shadow-xl rounded-2xl text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                      <PencilSquareIcon className="h-5 w-5 stroke-[2]" />
                    </button>
                    <button
                      onClick={() => handleDelete(sign.id, sign.name)}
                      className="p-3 bg-white shadow-xl rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      title="Xóa biển báo"
                    >
                      <TrashIcon className="h-5 w-5 stroke-[2]" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2 block">{sign.categoryName}</span>
                  <h3 className="font-bold text-slate-800 uppercase text-sm line-clamp-1 mb-1">{sign.name}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 h-8 leading-relaxed">{sign.description || "Không có mô tả"}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <InboxIcon className="h-16 w-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase text-xs">Không tìm thấy dữ liệu</p>
          </div>
        )}
      </main>


      {/* MODAL EDIT/ADD */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-[1000] text-slate-800 uppercase italic tracking-tighter">
                {editingId ? `Cập nhật biển #${editingId}` : 'Thêm biển báo mới'}
              </h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                <XMarkIcon className="h-6 w-6 stroke-[2.5]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <section>
                    <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Tên biển báo *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                      className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-4 font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all"
                      required
                    />
                  </section>
                  <section>
                    <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Phân loại</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(p => ({ ...p, categoryId: e.target.value }))}
                      className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-4 font-bold outline-none focus:bg-white cursor-pointer"
                    >
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                      ))}
                    </select>
                  </section>
                  <section>
                    <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                      className="w-full border border-slate-200 bg-slate-50 rounded-2xl p-4 text-sm h-32 resize-none outline-none focus:bg-white transition-all"
                    />
                  </section>
                </div>

                <div className="flex flex-col">
                  <label className="block text-[11px] font-black text-slate-400 uppercase mb-2 tracking-widest">Hình ảnh</label>
                  <div className="relative flex-1 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer overflow-hidden min-h-[300px]">
                    {formData.previewUrl ? (
                      <img
                        src={formData.previewUrl.startsWith('blob:') ? formData.previewUrl : (IMAGE_BASE_URL + formData.previewUrl)}
                        className="max-w-full max-h-full object-contain p-6"
                        alt="Preview"
                      />
                    ) : (
                      <div className="text-center">
                        <PhotoIcon className="h-16 w-16 text-slate-200 mx-auto mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tải ảnh lên</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormData(p => ({ ...p, imageFile: file, previewUrl: URL.createObjectURL(file), isImageChanged: true }));
                    }} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-slate-100 flex justify-end gap-6 items-center">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Hủy bỏ</button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-10 py-4 bg-indigo-600 text-white text-[11px] font-black rounded-2xl shadow-xl hover:bg-indigo-700 disabled:bg-slate-300 transition-all uppercase flex items-center gap-2"
                >
                  {isLoading && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                  {editingId ? 'Lưu thay đổi' : 'Tạo biển báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrafficSignAdmin;
