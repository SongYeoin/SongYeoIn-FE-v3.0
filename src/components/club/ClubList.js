import React from 'react';

const ClubList = () => {
  return (
    <div className="flex flex-col items-center justify-start mx-auto w-[1680px] h-[1000px]">
      {/* Header Section */}
      <div className="flex justify-between w-full mt-10 px-6">
        <h1 className="text-2xl font-bold">동아리</h1>
        <button className="bg-[#225930] text-white flex items-center justify-center p-2 rounded-md">
          <span className="mr-2">+</span> 신청
        </button>
      </div>

      {/* Search Section */}
      <div className="flex justify-start items-center gap-2 mt-4 px-6">
        <div className="flex items-center gap-2">
          <label className="text-[#9a97a9]">작성자</label>
          <select className="w-[130px] h-[35px] bg-white text-[#16161b] border border-[#ebebeb] text-sm rounded-md px-2">
            <option value="all">전체</option>
            <option value="author1">박준수</option>
            <option value="author2">황경미</option>
          </select>
        </div>
        <input
          className="w-[180px] h-[35px] bg-white border border-[#ebebeb] text-[#16161b] text-sm rounded-md px-2"
          type="text"
          placeholder="검색할 내용을 입력하세요."
        />
      </div>

      {/* Data Table Section */}
      <div className="overflow-x-auto w-full mt-6 px-6">
        <table className="w-full text-sm text-[#16161b]">
          <thead>
          <tr className="border-b border-[#ebebeb]">
            <th className="py-4 w-[130px] text-center">번호</th>
            <th className="py-4 w-[150px] text-center">작성자</th>
            <th className="py-4 w-[150px] text-center">승인자</th>
            <th className="py-4 w-[130px] text-center">승인 상태</th>
            <th className="py-4 w-[200px] text-center">승인 메시지</th>
            <th className="py-4 w-[130px] text-center">활동일</th>
            <th className="py-4 w-[130px] text-center">작성일</th>
            <th className="py-4 w-[130px] text-center">첨부파일</th>
          </tr>
          </thead>
          <tbody>
          {/* Data Row 1 */}
          <tr className="border-b border-[#ebebeb]">
            <td className="py-4 text-center">1</td>
            <td className="py-4 text-center">박준수</td>
            <td className="py-4 text-center">황경미</td>
            <td className="py-4 text-center text-[#47da5e]">승인</td>
            <td className="py-4 text-center text-[#9a97a9]">대기</td>
            <td className="py-4 text-center">2024.02.11</td>
            <td className="py-4 text-center">2024.02.02</td>
            <td className="py-4 text-center">대기</td>
          </tr>
          {/* Data Row 2 */}
          <tr className="border-b border-[#ebebeb]">
            <td className="py-4 text-center">2</td>
            <td className="py-4 text-center">이정민</td>
            <td className="py-4 text-center">박준수</td>
            <td className="py-4 text-center text-[#fb3434]">미승인</td>
            <td className="py-4 text-center text-[#9a97a9]">미승인</td>
            <td className="py-4 text-center">2024.02.15</td>
            <td className="py-4 text-center">2024.02.03</td>
            <td className="py-4 text-center">대기</td>
          </tr>
          {/* Data Row 3 */}
          <tr>
            <td className="py-4 text-center">3</td>
            <td className="py-4 text-center">황경미</td>
            <td className="py-4 text-center">김영수</td>
            <td className="py-4 text-center text-[#47da5e]">승인</td>
            <td className="py-4 text-center text-[#9a97a9]">승인 완료</td>
            <td className="py-4 text-center">2024.02.18</td>
            <td className="py-4 text-center">2024.02.04</td>
            <td className="py-4 text-center">대기</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClubList;
