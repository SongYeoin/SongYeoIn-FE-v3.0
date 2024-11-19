import React from 'react';

const CourseMainHeader = () => {
  return (
    <div className="flex flex-col w-full gap-4 pr-4">
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
        {/* 작성자 필터 */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 w-full sm:w-auto">
          <p className="text-sm text-gray-500">작성자</p>
          <svg
            width="14"
            height="6"
            viewBox="0 0 14 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="ml-auto"
          >
            <path
              d="M8.29897 6L5.70103 6L0 0L3.20232 0L6.96392 4.26316L6.79253 4.21491L7.20747 4.21491L7.03608 4.26316L10.7977 0L14 0L8.29897 6Z"
              fill="#DADADA"
            ></path>
          </svg>
        </div>

        {/* 검색 필터 */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300">
          <p className="text-sm text-gray-500">검색할 내용을 입력하세요.</p>
        </div>
      </div>
    </div>
  );
};

export default CourseMainHeader;