import React, { useState, useEffect, DragEvent, useRef } from 'react';
import axios from 'axios';
import { url } from '../../../../env.js';
import {
  XMarkIcon, PlusIcon, TrashIcon, PhotoIcon,
  TagIcon, CheckCircleIcon, ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Question } from '../../../admin-types';
import { questionService } from '../../../services/questionService';
import { IMAGE_BASE_URL } from '../../../config';

// --- THÊM COMPONENT TOAST NỘI BỘ ---
const Toast = ({ msg, type, onClose }: { msg: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-5 border backdrop-blur-md ${type === 'success' ? 'bg-indigo-950/90 text-white border-indigo-700' : 'bg-red-600/90 text-white border-red-500'
      }`}>
      {type === 'success' ? <CheckCircleIcon className="h-5 w-5 text-emerald-400" /> : <ExclamationTriangleIcon className="h-5 w-5 text-white" />}
      <span className="font-black uppercase text-[10px] tracking-widest">{msg}</span>
    </div>
  );
};

interface Category {
  categoryId: number;
  categoryName: string;
}

interface Answer {
  id?: number;
  text: string;
  isCorrect: boolean;
}

const AutoResizeTextArea: React.FC<{
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}> = ({ value, onChange, className, placeholder }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className={`${className} resize-none overflow-hidden transition-[height] duration-200`}
    />
  );
};

export const QuestionFormModal: React.FC<{ data: Question | null, onClose: () => void, onSuccess: () => void }> = ({ data, onClose, onSuccess }) => {
  const [ModalMode, setModalMode] = useState<'CREATE' | 'EDIT'>(data ? 'EDIT' : 'CREATE');
  const [content, setContent] = useState('');
  const [explain, setExplain] = useState('');
  const [isCritical, setIsCritical] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImageDeleted, setIsImageDeleted] = useState(false);
  const [answerDeletedIds, setAnswerDeletedIds] = useState<Number[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);

  // --- STATE TOAST ---
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Fetch danh sách chương
    axios.get(`${url}api/chuong`)
      .then(res => setAllCategories(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (data) {
      setContent(data.questionContent || '');
      setExplain(data.explanation || '');
      setIsCritical(data.isCritical || false);
      setPreviewUrl(data.imageUrl || '');
      let ids: number[] = [];
      if (Array.isArray(data.categories)) ids = data.categories.map(id => Number(id));
      else if (data.categoryIds) ids = data.categoryIds.map(id => Number(id));
      setSelectedCatIds(ids);
      setAnswers(data.answers?.map(a => ({ id: a.id, text: a.answerContent, isCorrect: a.isCorrect })) || []);
    } else {
      setContent(''); setExplain(''); setIsCritical(false); setPreviewUrl(''); setSelectedCatIds([]);
      setAnswers([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
    }
  }, [data]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (content.trim().length < 10) newErrors.content = "Nội dung câu hỏi phải có ít nhất 10 ký tự.";
    if (selectedCatIds.length === 0) newErrors.categories = "Vui lòng chọn ít nhất 1 chương học.";
    if (answers.some(ans => !ans.text.trim())) newErrors.answers = "Vui lòng nhập đầy đủ nội dung cho các đáp án.";
    if (!answers.some(ans => ans.isCorrect)) newErrors.correctAnswer = "Bạn phải chọn một đáp án đúng.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setPreviewUrl(URL.createObjectURL(file)); setIsImageDeleted(false); }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation(); setPreviewUrl(''); setImageFile(null); setIsImageDeleted(true);
  };

  const handleToggleCategory = (id: number) => {
    const numId = Number(id);
    if (numId === 0) setIsCritical(!isCritical);
    else setSelectedCatIds(prev => prev.includes(numId) ? prev.filter(i => i !== numId) : [...prev, numId]);
    if (errors.categories) setErrors(prev => ({ ...prev, categories: '' }));
  };

  const handleAnswerChange = (index: number, field: 'text' | 'isCorrect', value: any) => {
    const newAnswers = [...answers];
    if (field === 'isCorrect') {
      newAnswers.forEach((ans, i) => ans.isCorrect = i === index);
      if (errors.correctAnswer) setErrors(prev => ({ ...prev, correctAnswer: '' }));
    } else {
      newAnswers[index].text = value;
      if (errors.answers) setErrors(prev => ({ ...prev, answers: '' }));
    }
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('Question', content);
    formData.append('Explain', explain || '');
    formData.append('IsCritical', isCritical.toString());
    selectedCatIds.forEach(id => formData.append('CategoryIds', id.toString()));
    answers.forEach((ans, index) => {
      if (ModalMode === 'EDIT' && ans.id !== undefined) formData.append(`Answers[${index}].Id`, ans.id.toString());
      formData.append(`Answers[${index}].Text`, ans.text);
      formData.append(`Answers[${index}].IsCorrect`, ans.isCorrect.toString());
    });
    if (imageFile) formData.append('Image', imageFile);
    if (ModalMode === 'EDIT' && data) {
      if (isImageDeleted) formData.append('IsImageDeleted', isImageDeleted.toString());
      if (!isImageDeleted && previewUrl) formData.append('ImageLink', previewUrl);
      if (answerDeletedIds.length > 0) answerDeletedIds.forEach(id => formData.append('AnswerDeletedIds', id.toString()));
    }

    try {
      if (ModalMode === 'EDIT' && data) {
        await questionService.updateQuestion(data.id, formData);
        setToast({ msg: "Cập nhật câu hỏi thành công!", type: 'success' });
      } else {
        await questionService.createQuestion(formData);
        setToast({ msg: "Thêm câu hỏi mới thành công!", type: 'success' });
      }

      // Đợi toast hiển thị 1 chút rồi mới đóng modal và load lại data
      setTimeout(() => {
        onSuccess();
      }, 1000);

    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors({ server: Object.values(serverErrors).flat().join(", ") });
        setToast({ msg: "Dữ liệu không hợp lệ!", type: 'error' });
      } else {
        setToast({ msg: "Lỗi kết nối máy chủ!", type: 'error' });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      {/* HIỂN THỊ TOAST */}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {errors.server && (
          <div className="bg-red-600 text-white py-2 px-8 text-xs font-bold text-center uppercase">
            Lỗi từ máy chủ: {errors.server}
          </div>
        )}

        <div className="px-8 py-5 border-b flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
            {data ? `Sửa câu hỏi #${data.id}` : 'Thêm mới câu hỏi'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form id="modal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar text-left">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* CỘT TRÁI */}
            <div className="space-y-8">
              <section>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-3 tracking-widest">Nội dung câu hỏi *</label>
                <AutoResizeTextArea
                  value={content}
                  onChange={setContent}
                  placeholder="Nhập nội dung câu hỏi..."
                  className={`w-full border-2 rounded-2xl p-5 font-bold text-gray-700 outline-none transition-all ${errors.content ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-indigo-500 bg-gray-50/30'}`}
                />
                {errors.content && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase flex items-center gap-1"><ExclamationTriangleIcon className="h-3 w-3" /> {errors.content}</p>}
              </section>

              <section>
                <label className="text-sm font-bold text-gray-700 mb-3 flex items-center tracking-tight text-left">
                  <TagIcon className="h-4 w-4 mr-2 text-indigo-500" /> Phân loại chương & Đặc tính
                </label>
                <div className={`space-y-4 p-5 rounded-3xl border-2 transition-all ${errors.categories ? 'border-red-300 bg-red-50' : 'bg-gray-50/50 border-gray-100'}`}>
                  <button
                    type="button"
                    onClick={() => setIsCritical(!isCritical)}
                    className={`w-full py-4 rounded-xl text-xs font-black transition-all border-2 flex items-center justify-center gap-3
                      ${isCritical ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-100' : 'bg-white text-red-500 border-red-200 border-dashed hover:bg-red-50'}`}
                  >
                    CÂU HỎI ĐIỂM LIỆT
                    {isCritical && <CheckCircleIcon className="h-5 w-5 text-white" />}
                  </button>
                  <div className="flex flex-wrap gap-2 justify-start">
                    {allCategories.map(cat => (
                      <button
                        key={cat.categoryId}
                        type="button"
                        onClick={() => handleToggleCategory(cat.categoryId)}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all border-2 
                          ${selectedCatIds.includes(Number(cat.categoryId)) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white text-gray-400 border-gray-100 hover:border-indigo-300'}`}
                      >
                        {cat.categoryName.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                {errors.categories && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase text-left">{errors.categories}</p>}
              </section>

              <section>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-3 tracking-widest text-left">Giải thích đáp án</label>
                <AutoResizeTextArea
                  value={explain}
                  onChange={setExplain}
                  placeholder="Giải thích lý do chọn đáp án này..."
                  className="w-full border-2 border-gray-100 rounded-2xl p-5 text-sm italic text-gray-500 bg-gray-50/30 outline-none focus:border-indigo-200"
                />
              </section>
            </div>

            {/* CỘT PHẢI */}
            <div className="space-y-8">
              <section>
                <label className="block text-[11px] font-black text-gray-400 uppercase mb-3 tracking-widest text-left">Hình ảnh đính kèm</label>
                <div className="relative group h-52 w-full border-2 border-dashed border-gray-100 rounded-[2rem] overflow-hidden flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl.startsWith('blob:') ? previewUrl : (IMAGE_BASE_URL + previewUrl)} alt="Preview" className="h-full w-full object-contain p-4" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                        <button type="button" onClick={handleRemoveImage} className="px-6 py-2 bg-red-600 text-white text-[10px] font-black rounded-xl uppercase">Gỡ ảnh</button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <PhotoIcon className="h-10 w-10 text-gray-200 mx-auto" />
                      <p className="text-[10px] font-black text-gray-300 mt-2 uppercase tracking-widest">Tải ảnh lên</p>
                    </div>
                  )}
                  {!previewUrl && <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />}
                </div>
              </section>

              <section>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Các phương án trả lời *</label>
                  <button type="button" onClick={() => setAnswers([...answers, { text: '', isCorrect: false }])} className="text-indigo-600 text-[10px] font-black hover:underline uppercase">+ Thêm lựa chọn</button>
                </div>
                <div className="space-y-3">
                  {answers.map((ans, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all ${ans.isCorrect ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : (errors.answers && !ans.text ? 'border-red-300 bg-red-50' : 'border-gray-50 bg-gray-50/30')}`}>
                      <button type="button" onClick={() => handleAnswerChange(idx, 'isCorrect', true)} className={`mt-1 transition-transform active:scale-90 ${ans.isCorrect ? 'text-emerald-500' : 'text-gray-200 hover:text-gray-300'}`}>
                        <CheckCircleIcon className="h-7 w-7 fill-current bg-white rounded-full" />
                      </button>
                      <AutoResizeTextArea
                        value={ans.text}
                        onChange={(val) => handleAnswerChange(idx, 'text', val)}
                        placeholder={`Nội dung đáp án ${idx + 1}`}
                        className="flex-1 bg-transparent text-sm font-bold text-gray-700 outline-none pt-1 text-left"
                      />
                      {answers.length > 2 && (
                        <button type="button" onClick={() => {
                          setAnswers(answers.filter((_, i) => i !== idx));
                          if (ans.id !== undefined) setAnswerDeletedIds(prev => [...prev, ans.id!]);
                        }} className="mt-1 text-gray-300 hover:text-red-500 transition-colors">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.correctAnswer && <p className="text-red-500 text-[10px] font-bold mt-4 uppercase flex items-center gap-1 justify-start"><ExclamationTriangleIcon className="h-3 w-3" /> {errors.correctAnswer}</p>}
              </section>
            </div>
          </div>
        </form>

        <div className="px-8 py-5 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest">Hủy bỏ</button>
          <button form="modal-form" type="submit" className="px-12 py-2.5 bg-indigo-600 text-white text-[10px] font-black rounded-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all uppercase tracking-[0.2em]">
            Lưu dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
};
