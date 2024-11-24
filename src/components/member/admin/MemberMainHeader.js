import React, { useState } from 'react';

const MemberMainHeader = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value); // 상위 컴포넌트로 검색어 전달
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">회원 관리</h1>
      <input
        type="text"
        placeholder="회원 이름으로 검색하세요"
        value={searchTerm}
        onChange={handleSearch}
        className="border rounded-lg px-4 py-2 w-64"
      />
    </div>
  );
};

export default MemberMainHeader;
