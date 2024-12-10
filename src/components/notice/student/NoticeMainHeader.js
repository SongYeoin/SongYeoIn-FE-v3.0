import React from 'react';

const NoticeMainHeader = ({ courses, selectedCourse, onSearch, onCourseChange }) => {
  const handleSearch = (e) => {
    const value = e.target.value;
    onSearch(value); // 부모로 검색어 전달
  };

  const handleCourseChange = (e) => {
    const value = e.target.value;
    onCourseChange(value); // 부모로 선택된 과정 전달
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col w-full gap-6 p-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">공지사항</h1>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          {/* 교육 과정 셀렉트 박스 */}
          <select
            className="w-80 text-center px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedCourse}
            onChange={handleCourseChange}
            disabled={courses.length === 0} // 데이터가 없으면 비활성화
          >
            <option value="" disabled hidden>
              {courses.length === 0
                ? '교육 과정이 없습니다.'
                : '교육 과정을 선택하세요'}
            </option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseName}
              </option>
            ))}
          </select>

          {/* 검색창 */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 w-64">
            <input
              className="text-sm text-gray-500 w-full"
              placeholder="검색할 제목을 입력하세요."
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeMainHeader;
