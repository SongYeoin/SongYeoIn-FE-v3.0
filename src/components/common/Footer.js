import React, { useState, useEffect } from 'react';

const Footer = ({ currentPage, totalPages, onPageChange }) => {
  const [visiblePages, setVisiblePages] = useState([]);

  // 5개 단위로 페이지 그룹 계산
  useEffect(() => {
    const startPage = Math.floor((currentPage -1 )/ 5) * 5 + 1;
    const endPage = Math.min(startPage + 4, totalPages);

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    setVisiblePages(pages);
  }, [currentPage, totalPages]);


  return (
    <footer className="flex justify-center items-center p-4 bg-white border-t border-gray-200">
      {/* 페이징 처리 */}
      <nav className="flex items-center gap-2">
        {/* 이전 페이지 화살표 < */}
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-50"
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 5}>
          <svg width="6" height="10" fill="none" stroke="currentColor">
            <path d="M5 9L1 5L5 1" />
          </svg>
        </button>
        {/* 페이지 번호 */}
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`w-8 h-8 flex items-center justify-center rounded-md ${
              currentPage === page
                ? 'bg-[#225930] text-white font-bold'
                : 'border border-gray-300'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        {/* 다음 페이지 화살표 > */}
        <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-50"
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages}>
          <svg width="6" height="10" fill="none" stroke="currentColor">
            <path d="M1 9L5 5L1 1" />
          </svg>
        </button>
      </nav>
    </footer>
  );
};

export default Footer;