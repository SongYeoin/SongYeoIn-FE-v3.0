import React from 'react';
import _ from 'lodash';

const SupportHeader = ({ onSearch, onCreate }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const debouncedSearch = _.debounce((value) => {
    onSearch(value);
  }, 300);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col w-full gap-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">고객센터</h1>
          <button
            onClick={onCreate}
            className="flex justify-center items-center h-10 gap-1 px-4 py-2 rounded-lg bg-[#225930]"
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path
                d="M12 5V19"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12H19"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-white">문의하기</p>
          </button>
        </div>
        <div className="flex justify-end">
          <div className="w-72 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#9A97A9"
              className="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
            <input
              className="w-full text-gray-600 focus:outline-none"
              placeholder="검색할 제목을 입력하세요."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportHeader;
