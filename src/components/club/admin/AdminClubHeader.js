import React from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/20/solid';

const AdminClubHeader = ({
  courses,
  selectedCourse,
  courseChange,
  selectedItems, // 선택된 항목 배열 추가
  downloadSelectedFiles, // 파일 다운로드 함수 추가
  downloadLoading // 다운로드 상태 추가
}) => {

  const handleChange = (e) => {
        const courseId = e.target.value;
        courseChange(courseId);
    };

  return (
    <>
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative">
        {/* 제목과 신청 버튼 */}
        <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6 p-6">
          <div className="flex flex-col justify-start items-start flex-grow relative gap-6">
            <div className="self-stretch flex flex-row justify-between items-start flex-grow relative">
              <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">동아리 신청</h1>
                <button
                  onClick={downloadSelectedFiles}
                  disabled={selectedItems.length === 0 || downloadLoading}
                  className={`flex items-center px-4 py-2 rounded-lg ${
                    selectedItems.length === 0 || downloadLoading
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-[#225930] text-white hover:bg-[#1e4d27]'
                      //: 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors duration-200`}
                >
                  {downloadLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  )}
                  {downloadLoading ? '다운로드 중...' : `선택한 파일 다운로드 (${selectedItems.length})`}
                </button>
            </div>

            {/* 검색 부분 */}
            <div className="self-stretch flex-grow-0 flex-shrink-0 h-10 relative flex justify-between items-center">
              <select className="w-80 text-center px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={selectedCourse || ''} // 선택된 값 반영
                                  onChange={handleChange}
                                  disabled={!courses || courses.length === 0}
              >
                {!courses || courses.length === 0 ? (
                  <option value="" disabled>교육 과정이 없습니다.</option>
                ) : (
                  courses.map((course) => (
                    <option key={course.id} value={course.id} className="text-sm text-black">
                      {course.name}
                    </option>
                  ))
                )}
              </select>
              <div className="flex items-center gap-4">
                <div className="flex justify-start items-center w-50 h-10 gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300">
                  <select className="text-sm text-left text-black" defaultValue="작성자">
                    <option value="작성자">작성자</option>
                    <option value="참여자">참여자</option>
                    <option value="승인상태">승인상태</option>
                  </select>
                </div>

                <div className="w-72 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#9A97A9"
                    className="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                  <input
                    type="text"
                    className="w-full text-gray-600 focus:outline-none"
                    placeholder="검색할 내용을 입력하세요."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminClubHeader;