import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number; // Thêm prop này nếu bạn muốn hiện "Tổng số câu"
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}) => {
  // Thuật toán hiển thị số trang
  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) pages.push(i);

      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const btnBase = "relative inline-flex items-center text-sm font-semibold transition-all duration-200 focus:z-20";
  const btnActive = "z-10 bg-blue-600 text-white shadow-md shadow-blue-200 scale-105 rounded-md mx-1";
  const btnNormal = "text-gray-900 ring-1 ring-inset ring-gray-200 hover:bg-blue-50 hover:ring-blue-300 rounded-md mx-1 px-3";

  // --- LOGIC XỬ LÝ KHI CHỈ CÓ 1 TRANG ---
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between px-4 py-3 sm:px-0">
        <p className="text-sm text-gray-500 italic">
          Hiển thị tất cả <span className="font-bold text-gray-900">{totalItems ?? ''}</span> câu hỏi (Trang 1/1)
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-0">
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white disabled:opacity-40"
        >
          Trước
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white disabled:opacity-40"
        >
          Sau
        </button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Hiển thị trang <span className="font-bold text-gray-900">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
            {totalItems && <span className="ml-1 text-gray-400">({totalItems} câu)</span>}
          </p>
        </div>

        <nav className="isolate inline-flex items-center -space-x-px" aria-label="Pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 mr-2 text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-gray-400">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`${btnBase} px-4 py-2 ${currentPage === page ? btnActive : btnNormal}`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 ml-2 text-gray-400 hover:text-blue-600 disabled:opacity-30 transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};
