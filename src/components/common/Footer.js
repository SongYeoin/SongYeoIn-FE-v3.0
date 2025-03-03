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
      {/* 페이징 처리 */}
      <nav className="inline-flex rounded-md shadow-sm">
        {/* 처음 페이지 버튼 */}
        <button
          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
                                currentPage === 1
                                  ? 'text-gray-400 cursor-default'
                                  : 'text-gray-700 hover:bg-gray-50'
                              } rounded-l-md border border-gray-300`}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>

        {/* 이전 페이지 화살표 < */}
        <button
          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
                                currentPage === 1
                                  ? 'text-gray-400 cursor-default'
                                  : 'text-gray-700 hover:bg-gray-50'
                              } border-t border-b border-gray-300`}
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        {/* 페이지 번호 */}
        {visiblePages.map((page) => (
          <button
            key={page}
            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                    currentPage === page
                                      ? 'bg-[#225930] text-white font-bold'
                                      : 'text-gray-700 hover:bg-gray-50'
                                  } border border-gray-300`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {/* 다음 페이지 화살표 > */}
        <button
          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
                                currentPage === totalPages
                                  ? 'text-gray-400 cursor-default'
                                  : 'text-gray-700 hover:bg-gray-50'
                              } border-t border-b border-gray-300`}
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>

        {/* 마지막 페이지 버튼 */}
        <button
          className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
                                currentPage === totalPages
                                  ? 'text-gray-400 cursor-default'
                                  : 'text-gray-700 hover:bg-gray-50'
                              } rounded-r-md border border-gray-300`}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
      </nav>
    </footer>
  );
};

export default Footer;