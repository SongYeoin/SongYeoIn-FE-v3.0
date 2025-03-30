import React, { useState, useEffect } from 'react';

const Footer = ({ currentPage, totalPages, onPageChange }) => {
  const [visiblePages, setVisiblePages] = useState([]);

  // 5개 단위로 페이지 그룹 계산
  useEffect(() => {
    if (currentPage && totalPages && onPageChange) {  // props가 모두 있을 때만 페이지 계산
      const startPage = Math.floor((currentPage - 1) / 5) * 5 + 1;
      const endPage = Math.min(startPage + 4, totalPages);

      const pages = [];
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      setVisiblePages(pages);
    }
  }, [currentPage, totalPages, onPageChange]);

  // 페이지네이션이 필요 없는 경우 빈 footer 반환
  if (!currentPage || !totalPages || !onPageChange) {
    return <footer className="flex justify-center mt-6 mb-4" />;
  }

  return (
    <footer className="flex justify-center items-center p-4 bg-white">
      <nav className="flex items-center gap-2">
        {/* 처음 페이지 버튼 */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 17L13 12L18 7M11 17L6 12L11 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 이전 페이지 버튼 */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50"
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          <svg width="6" height="10" fill="none" stroke="currentColor">
            <path d="M5 9L1 5L5 1" />
          </svg>
        </button>

        {/* 페이지 번호 */}
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`w-8 h-8 flex items-center justify-center rounded-lg ${
              currentPage === page
                ? 'bg-[#225930] text-white'
                : 'border border-gray-300'
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* 다음 페이지 버튼 */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50"
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          <svg width="6" height="10" fill="none" stroke="currentColor">
            <path d="M1 9L5 5L1 1" />
          </svg>
        </button>

        {/* 마지막 페이지 버튼 */}
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 7L11 12L6 17M13 7L18 12L13 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </nav>
    </footer>
  );
};

export default Footer;