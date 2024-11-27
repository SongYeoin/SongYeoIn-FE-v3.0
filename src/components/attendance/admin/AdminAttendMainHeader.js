import React, { useEffect, useState } from 'react';

const AdminAttendMainHeader = ({ courses, onFilterChange }) => {
  console.log("header에서 받은 courses:", JSON.stringify(courses, null, 2));

  // 필터링 상태 관리
  const [filters, setFilters] = useState({
    courseId: '',
    studentName: '',
    date: new Date().toISOString().split('T')[0], // 오늘 날짜를 기본값으로 설정
    status: '',
  });

  /// 코스가 로드되면 첫 번째 코스 ID를 기본값으로 설정
  useEffect(() => {
    if (courses.length > 0) {
      const updatedFilters = {
        ...filters,
        courseId: courses[0].courseId,
      };
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
    }
  }, [courses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 상태 업데이트
    const updatedFilters = {
      ...filters,
      [name]: value,
    };

    setFilters(updatedFilters);

    // 부모 컴포넌트로 필터 값 전달
    onFilterChange(updatedFilters);
  };

  const handleStatusToggle = (status) => {
    const updatedFilters = {
      ...filters,
      status: filters.status === status ? '' : status, // 토글 로직
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };


  return (
    <div className="flex flex-col w-full gap-6 pr-4">
      {/* Header Title */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">
          출석&&nbsp;관리
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
              key={course.courseId}
              value={course.courseId}
            className="text-sm text-black"
            >
              {course.courseName}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-4">
          {/* 학생명 Filter */}
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
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
            </svg>
            <input
              type="text"
              name="studentName"
              value={filters.studentName}
              onChange={handleInputChange}
              placeholder="검색할 학생명을 입력해주세요."
              className="w-full"
            />
          </div>

          {/* 날짜 Filter */}
          <div>
            {/*<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                 fill="currentColor" className="bi bi-calendar-check"
                 viewBox="0 0 16 16">
              <path
                d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0" />
              <path
                d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
            </svg>*/}
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={handleInputChange}
              placeholder="조회할 날짜를 선택해주세요."
              className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

            />
          </div>

          {/* 출석 상태 Selector */}
          <div className="flex space-x-2">
            {/* Present Button */}
            <button
              className={`px-4 py-2 rounded ${
                filters.status === "PRESENT"
                  ? "bg-[#47DA5E] bg-opacity-50 text-black" // 초록색 배경과 흰색 텍스트
                  : "bg-gray-200" // 기본 배경과 검정 텍스트
              }`}
              onClick={() => handleStatusToggle('PRESENT')}
            >
              출석
            </button>

            {/* Late Button */}
            <button
              className={`px-4 py-2 rounded ${
                filters.status === "LATE" 
                  ? "bg-[#F1B747] bg-opacity-60 text-black"
                  : "bg-gray-200"
              }`}
              onClick={() => handleStatusToggle('LATE')}
            >
              지각
            </button>

            {/* Absent Button */}
            <button
              className={`px-4 py-2 rounded ${
                filters.status === "ABSENT" 
                  ? "bg-[#FF0000] bg-opacity-50 text-black"
                  : "bg-gray-200"
              }`}
              onClick={() => handleStatusToggle('ABSENT')}
            >
              결석
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminAttendMainHeader;
