import React, { useState } from 'react';

const CourseMainHeader = ({ onSearch = () => {} }) => {
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태

  // 검색어 변경 이벤트 처리
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // 로컬 상태 업데이트
    onSearch(value); // 상위 컴포넌트에 검색어 전달
  };



  return (
    <div className="flex flex-col w-full gap-6 pr-4">
      {/* Header Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">
          교육&nbsp;과정&nbsp;관리
        </h1>
        <div
          className="flex justify-center items-center flex-grow-0 flex-shrink-0 h-10 relative gap-1 px-4 py-2 rounded-lg bg-[#225930]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
            preserveAspectRatio="none"
          >
            <path
              d="M12 5V19"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
            <path
              d="M5 12H19"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <p
            className="flex-grow-0 flex-shrink-0 text-sm text-left text-white">교육과정
            등록</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 justify-end items-center">
        {/* 검색 필터 */}

        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 w-64">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#9A97A9"
            className="bi bi-search"
            viewBox="0 0 16 16"
          >
            <path
              d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
          </svg>
          <input className="text-sm text-gray-500 w-full"
                 placeholder="검색할 과정명을 입력하세요."
                 value={searchTerm} // 검색어 상태
                 onChange={handleSearch} // 입력 이벤트 처리
          />
        </div>

      </div>
    </div>
  );
};

export default CourseMainHeader;