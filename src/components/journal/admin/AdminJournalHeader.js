import React, { useEffect, useState } from 'react';

const AdminJournalHeader = ({ courses, onFilterChange }) => {
  const [filters, setFilters] = useState({
    courseId: '',
    studentName: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    if (courses.length > 0) {
      const updatedFilters = {
        ...filters,
        courseId: courses[0].id,  // courseId -> id
      };
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
    }
  }, [courses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputChange(e);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6 pr-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">
          교육일지 관리
        </h1>
      </div>
      <div className="flex flex-wrap gap-4 justify-between items-center">
        {/* 교육 과정 필터 */}
        <select
          name="courseId"
          value={filters.courseId}
          onChange={handleInputChange}
          className="w-80 text-center px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {courses.map((course) => (
            <option
              key={course.id}
              value={course.id}
              className="text-sm text-black"
            >
              {course.name}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-4">
          {/* 학생명 검색 */}
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
              type="text"
              name="studentName"
              value={filters.studentName}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="검색할 학생명을 입력해주세요."
              className="w-full"
            />
          </div>

          {/* 교육일자 범위 선택 */}
          <div className="flex items-center gap-2">
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="교육 시작일"
              title="교육 시작일"
            />
            <span className="text-gray-500">~</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleInputChange}
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="교육 종료일"
              title="교육 종료일"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJournalHeader;