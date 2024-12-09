import React, { useState } from 'react';

const MemberMainHeader = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태

  // 검색어 변경 이벤트 처리
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // 로컬 상태 업데이트
    onSearch(value); // 상위 컴포넌트에 검색어 전달
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col w-full gap-6 p-6">      {/* Header Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">
          회원&nbsp;관리
        </h1>
      </div>
      <div className="flex flex-wrap gap-4 justify-end items-center">
        {/* 검색 필터 */}
        <div
          className="w-72 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#9A97A9"
            className="bi bi-search"
            viewBox="0 0 16 16"
          >
            <path
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
            />
          </svg>
          <input
            className="w-full text-gray-600"
            placeholder="검색할 이름을 입력하세요."
            value={searchTerm} // 검색어 상태
            onChange={handleSearch} // 입력 이벤트 처리
          />
        </div>
      </div>
    </div>
    </div>
  );
};

export default MemberMainHeader;
