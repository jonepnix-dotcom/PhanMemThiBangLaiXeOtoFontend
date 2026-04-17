import React, { useEffect, useState } from 'react';
import apiClient from '../../../api/axiosClient';
import { QuestionFilter as IFilter, Category } from '../../../admin-types/question.types';
import { FunnelIcon } from '@heroicons/react/24/outline';

interface QuestionFilterProps {
  filter: IFilter;
  onFilterChange: (filter: IFilter) => void;
}

export const QuestionFilterComponent: React.FC<QuestionFilterProps> = ({
  filter,
  onFilterChange,
}) => {
  // --- THÊM STATE ĐỂ LƯU CHƯƠNG TỪ API ---
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch list of chapters/categories
    apiClient.get('/chuong')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Filter: Failed to fetch categories:", err));
  }, []);

  const handleChange = (key: keyof IFilter, value: any) => {
    onFilterChange({ ...filter, [key]: value, trang: 1 });
  };

  const selectClass = `
    w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
    focus:ring-blue-500 focus:border-blue-500 block p-2.5 
    transition-all duration-200 ease-in-out outline-none
    hover:bg-white
  `;

  const labelClass = "block mb-2 text-sm font-semibold text-gray-700 uppercase tracking-wider";

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-2 transform transition-all">
      <div className="flex items-center pb-4 mb-5 border-b border-gray-100">
        <div className="bg-blue-50 p-2 rounded-lg mr-3">
          <FunnelIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">Bộ lọc tìm kiếm</h3>
          <p className="text-xs text-gray-500">Tối ưu hóa kết quả hiển thị câu hỏi</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* CHƯƠNG - ĐÃ CẬP NHẬT ĐỂ ĐỌC TỪ API */}
        <div>
          <label className={labelClass}>Chương</label>
          <select
            value={filter.chuong || ''}
            onChange={(e) =>
              handleChange('chuong', e.target.value ? Number(e.target.value) : undefined)
            }
            className={selectClass}
          >
            <option value="">Tất cả chương</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* Loại câu hỏi - GIỮ NGUYÊN */}
        <div>
          <label className={labelClass}>Tính chất câu hỏi</label>
          <select
            value={filter.cauDiemLiet === undefined ? '' : filter.cauDiemLiet.toString()}
            onChange={(e) => {
              const value = e.target.value;
              handleChange('cauDiemLiet', value === '' ? undefined : value === 'true');
            }}
            className={selectClass}
          >
            <option value="">Tất cả độ khó</option>
            <option value="true" className="text-red-600 font-medium">⚠️ Câu điểm liệt</option>
            <option value="false">Câu hỏi thường</option>
          </select>
        </div>

        {/* Biển báo - GIỮ NGUYÊN */}
        <div>
          <label className={labelClass}>Hình ảnh/Biển báo</label>
          <select
            value={filter.bienBao === undefined ? '' : filter.bienBao.toString()}
            onChange={(e) => {
              const value = e.target.value;
              handleChange('bienBao', value === '' ? undefined : value === 'true');
            }}
            className={selectClass}
          >
            <option value="">Tất cả định dạng</option>
            <option value="true">Có hình minh họa</option>
            <option value="false">Chỉ có chữ</option>
          </select>
        </div>

        {/* Số lượng - GIỮ NGUYÊN */}
        <div>
          <label className={labelClass}>Hiển thị mỗi trang</label>
          <select
            value={filter.soLuong || 60}
            onChange={(e) => handleChange('soLuong', Number(e.target.value))}
            className={selectClass}
          >
            <option value="20">20 kết quả</option>
            <option value="50">50 kết quả</option>
            <option value="60">60 kết quả</option>
            <option value="100">100 kết quả</option>
          </select>
        </div>
      </div>

      {Object.values(filter).some(v => v !== undefined && v !== '' && v !== 60 && v !== 1) && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onFilterChange({ trang: 1, soLuong: 60 })}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium underline underline-offset-4"
          >
            Xóa tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};
