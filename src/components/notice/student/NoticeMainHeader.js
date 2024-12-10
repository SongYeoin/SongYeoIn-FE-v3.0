import React, { useEffect, useState } from 'react';
import _ from 'lodash';

const NoticeMainHeader = ({ onSearch, onCourseChange, courses, selectedCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = _.debounce((value) => {
    onSearch(value);
  }, 300);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    onCourseChange(courseId);
    setSearchTerm('');
  };

  useEffect(() => {
    setSearchTerm(''); // 초기화
  }, [selectedCourse]);

  return (
    <div className="bg-white">
      <div className="flex flex-col w-full gap-6 p-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">공지사항</h1>
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <select
            className="w-80 text-center px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedCourse}
            onChange={handleCourseChange}
            disabled={courses.length === 0}
          >
            <option value="" disabled hidden>
              {courses.length === 0 ? '교육 과정이 없습니다.' : '교육 과정을 선택하세요'}
            </option>
            {courses.map((course) => (
              <option key={course.courseId} value={course.courseId}>
                {course.courseName}
              </option>
            ))}
          </select>
          <div className="w-72 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300">
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
              className="text-gray-500 w-full"
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

export default NoticeMainHeader;
