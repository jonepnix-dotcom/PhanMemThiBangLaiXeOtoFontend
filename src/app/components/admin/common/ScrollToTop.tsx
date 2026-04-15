import React, { useState, useEffect } from 'react';
import { ChevronUpIcon } from '@heroicons/react/24/outline';

export const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Hiện nút khi cuộn xuống 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed z-[60] p-3 rounded-2xl shadow-2xl border border-slate-100 bg-white text-indigo-600 
        transition-all duration-300 hover:scale-110 active:scale-95
        /* Mobile: Cách đáy 85px để vượt lên trên Bottom Nav (thường cao ~64px) */
        bottom-[85px] right-6 
        /* Desktop: Quay về vị trí góc dưới bình thường */
        md:bottom-8 md:right-8
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
      `}
    >
      <ChevronUpIcon className="h-6 w-6 stroke-[3]" />
    </button>
  );
};
