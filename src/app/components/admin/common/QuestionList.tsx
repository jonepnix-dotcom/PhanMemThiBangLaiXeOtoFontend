import React, { useState, memo, useRef, useLayoutEffect, useEffect } from 'react';
import { IMAGE_BASE_URL } from '../../../config';
import { Question, Category } from '../../../admin-types';
import {
  ChevronDownIcon,
  PhotoIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface QuestionListProps {
  questions: Question[];
  categories: Category[];
  isLoading: boolean;
  onEdit: (q: Question) => void;
  onDelete: (id: number) => void;
}

// ✅ 1. COMPONENT TOOLTIP ẢNH (Đã fix lỗi bay chéo & giữ logic tọa độ của bạn)
const QuestionImageThumbnail = ({ imageUrl }: { imageUrl: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, position: 'top' });
  const iconRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const centerX = rect.left + rect.width / 2;

      if (rect.top > viewportHeight * 0.55) {
        setCoords({ x: centerX, y: rect.top - 12, position: 'top' });
      } else {
        setCoords({ x: centerX, y: rect.bottom + 12, position: 'bottom' });
      }
    }
  };

  useEffect(() => {
    if (showTooltip) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showTooltip]);

  return (
    <div
      ref={iconRef}
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`p-2 rounded-lg transition-all duration-200 cursor-zoom-in ${showTooltip ? 'bg-indigo-100 text-indigo-600' : 'text-indigo-400'}`}>
        <PhotoIcon className="h-6 w-6 mx-auto" />
      </div>

      {showTooltip && (
        <div
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            transform: coords.position === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0%)',
            zIndex: 9999,
            pointerEvents: 'none',
            transition: 'none' // QUAN TRỌNG: Chống bay chéo
          }}
          className="w-72 animate-in fade-in zoom-in-90 duration-150"
        >
          <div className="bg-white p-1.5 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-200 ring-1 ring-black/5 relative">
            <div className={`w-3 h-3 bg-white border-l border-t border-slate-200 absolute left-1/2 -translate-x-1/2 rounded-sm z-[-1] 
              ${coords.position === 'top' ? 'rotate-[225deg] -bottom-1.5' : 'rotate-45 -top-1.5'}`} />
            <div className="bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center aspect-video shadow-inner">
              <img src={IMAGE_BASE_URL + imageUrl} alt="Preview" className="max-w-full max-h-full object-contain p-1" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ✅ 2. ROW HIỂN THỊ CÂU HỎI (Memoized)
const QuestionRow = memo(({ q, isExpanded, onToggle, onEdit, onDelete, categories }: any) => {
  const rowRef = useRef<HTMLTableRowElement>(null);
  const categoryName = q.categories && q.categories.length > 0
    ? (categories.find((c: any) => c.categoryId === Number(q.categories[0]))?.categoryName || `Chương ${q.categories[0]}`)
    : 'Chưa rõ';

  useLayoutEffect(() => {
    if (isExpanded && rowRef.current) {
      const timer = setTimeout(() => {
        rowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);

  return (
    <>
      <tr
        ref={rowRef}
        className={`transition-all duration-300 cursor-pointer border-b border-slate-100 ${isExpanded ? 'bg-indigo-600 text-white sticky top-[64px] z-[40] shadow-lg' : 'hover:bg-slate-50 bg-white text-slate-700'}`}
        onClick={onToggle}
      >
        <td className="w-[70px] px-6 py-5 text-center">
          <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDownIcon className="h-5 w-5 mx-auto" />
          </div>
        </td>
        <td className={`w-20 px-4 py-5 text-center text-xs font-mono font-bold ${isExpanded ? 'text-indigo-200' : 'text-slate-400'}`}>
          {q.id.toString().padStart(3, '0')}
        </td>
        <td className="px-6 py-5" colSpan={isExpanded ? 4 : 1}>
          <div className="flex flex-col gap-1 items-start text-left">
            {isExpanded && (
              <div className="flex gap-2 mb-1">
                <span className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-black uppercase">Đang xem</span>
                {q.isCritical && <span className="px-2 py-0.5 bg-red-500 rounded text-[10px] font-black uppercase">Điểm liệt</span>}
              </div>
            )}
            <p className={`leading-relaxed ${isExpanded ? 'text-lg font-[1000] tracking-tight' : 'text-sm font-bold line-clamp-1'}`}>
              {q.questionContent}
            </p>
          </div>
        </td>
        {!isExpanded && (
          <>
            <td className="w-24 px-4 py-5 text-center">
              {q.imageUrl ? <QuestionImageThumbnail imageUrl={q.imageUrl} /> : <div className="h-6 w-6 mx-auto border border-dashed border-slate-200 rounded opacity-50" />}
            </td>
            <td className="w-40 px-4 py-5 text-center">
              <span className="text-[10px] px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 font-black uppercase border border-slate-200 whitespace-nowrap">{categoryName}</span>
            </td>
            <td className="w-28 px-4 py-5 text-center">
              {q.isCritical ? <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase border border-red-200">Liệt</span> : <span className="text-[10px] text-slate-400 font-bold uppercase">Thường</span>}
            </td>
          </>
        )}
        <td className="w-32 px-6 py-5 text-right">
          <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onEdit(q)} className={`p-2 rounded-lg transition-colors ${isExpanded ? 'hover:bg-white/20' : 'text-indigo-600 hover:bg-indigo-50'}`}><PencilSquareIcon className="h-5 w-5" /></button>
            <button onClick={() => onDelete(q.id)} className={`p-2 rounded-lg transition-colors ${isExpanded ? 'hover:bg-white/20' : 'text-red-500 hover:bg-red-50'}`}><TrashIcon className="h-5 w-5" /></button>
          </div>
        </td>
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={7} className="p-0 border-none bg-slate-50 shadow-inner text-left">
            <div className="p-10 max-w-6xl mx-auto flex flex-col md:flex-row gap-10 animate-in slide-in-from-top-2 duration-300">
              <div className="flex-1 space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2"><CheckCircleIcon className="h-4 w-4 text-emerald-500" /> Các phương án trả lời</h4>
                {q.answers.map((a: any, i: number) => (
                  <div key={a.id} className={`flex items-start gap-4 p-5 rounded-2xl border-2 transition-all shadow-sm ${a.isCorrect ? 'bg-white border-emerald-500 ring-4 ring-emerald-50' : 'bg-white border-slate-100'}`}>
                    <div className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-xl font-black text-xs ${a.isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>{String.fromCharCode(65 + i)}</div>
                    <p className={`text-sm leading-relaxed ${a.isCorrect ? 'font-black text-slate-800' : 'text-slate-600 font-medium'}`}>{a.answerContent}</p>
                  </div>
                ))}
              </div>
              <div className="w-full md:w-80 space-y-6">
                {q.imageUrl && (
                  <div className="rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-white aspect-square flex items-center justify-center p-4">
                    <img src={IMAGE_BASE_URL + q.imageUrl} alt="preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <h4 className="text-[10px] font-black uppercase text-indigo-500 mb-3 flex items-center gap-2"><InformationCircleIcon className="h-4 w-4" /> Giải thích đáp án</h4>
                  <p className="text-xs text-slate-500 italic leading-relaxed font-medium">"{q.explanation || 'Nội dung đang được cập nhật...'}"</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

// ✅ 3. TRẠNG THÁI SKELETON LOADING (Giữ nguyên logic của bạn)
const SkeletonRow = () => (
  <tr className="animate-pulse border-b border-slate-100">
    <td className="px-6 py-5"><div className="h-5 w-5 bg-slate-200 rounded mx-auto" /></td>
    <td className="px-4 py-5"><div className="h-4 w-8 bg-slate-100 rounded mx-auto" /></td>
    <td className="px-6 py-5"><div className="h-4 w-full bg-slate-200 rounded" /></td>
    <td className="px-4 py-5"><div className="h-6 w-6 bg-slate-100 rounded mx-auto" /></td>
    <td className="px-4 py-5"><div className="h-6 w-24 bg-slate-100 rounded-full mx-auto" /></td>
    <td className="px-4 py-5"><div className="h-6 w-16 bg-slate-100 rounded mx-auto" /></td>
    <td className="px-6 py-5"><div className="h-8 w-16 bg-slate-200 rounded ml-auto" /></td>
  </tr>
);

// ✅ 4. MAIN COMPONENT
const QuestionList: React.FC<QuestionListProps> = ({ questions, categories, isLoading, onEdit, onDelete }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="w-full border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
      <table className="min-w-full table-fixed border-separate border-spacing-0">
        <thead className="bg-slate-50/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <tr className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
            <th className="w-[70px] px-6 py-5 border-b border-slate-100 text-center"></th>
            <th className="w-20 px-4 py-5 border-b border-slate-100 text-center">ID</th>
            <th className="px-6 py-5 border-b border-slate-100 text-left">Nội dung câu hỏi</th>
            <th className="w-24 px-4 py-5 border-b border-slate-100 text-center">Ảnh</th>
            <th className="w-40 px-4 py-5 border-b border-slate-100 text-center">Chủ đề</th>
            <th className="w-28 px-4 py-5 border-b border-slate-100 text-center">Loại</th>
            <th className="w-32 px-6 py-5 border-b border-slate-100 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            // ✅ Hiện 10 dòng skeleton khi đang tải như bạn yêu cầu
            [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
          ) : (
            questions.map(q => (
              <QuestionRow
                key={q.id}
                q={q}
                categories={categories}
                isExpanded={expandedId === q.id}
                onToggle={() => handleToggle(q.id)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionList;
