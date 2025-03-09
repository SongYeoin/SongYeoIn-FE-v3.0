import React, { useEffect, useState } from 'react';
import PrintDialog from './admin/PrintDialog';

const AttendMainHeader = ({ role, courses, onFilterChange, attendanceRates, terms, selectedTerm,
  attendancePrintData,
  isLoading,
  onTermSelect
}) => {

  // 날짜 포맷팅 헬퍼 함수
  const formatDateToYYYYMMDD = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const [filters, setFilters] = useState({
    courseId: '',
    studentName: '',
    date: formatDateToYYYYMMDD(new Date()), // 오늘 날짜
    status: '',
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 7); // 일주일 전
      return formatDateToYYYYMMDD(date);
    })(),
    endDate: formatDateToYYYYMMDD(new Date()), // 오늘 날짜
  });

  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  useEffect(() => {
    if (courses.length > 0 && filters.courseId === "") {
      setFilters((prevFilters) => {
        if (prevFilters.courseId === courses[0].courseId) return prevFilters; // ✅ 상태 변경 필요 없으면 그대로 반환
        const updatedFilters = { ...prevFilters, courseId: courses[0].courseId };
        onFilterChange(updatedFilters);
        return updatedFilters;
      });
    }
  }, [courses, filters.courseId, onFilterChange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // 상태 업데이트
    const updatedFilters = {
      ...filters,
      [name]: value,
    };

    setFilters(updatedFilters);

    // 부모 컴포넌트로 필터 값 전달
    // 두 날짜가 모두 선택된 경우만 부모로 전달
    if (role === 'student' && updatedFilters.startDate
      && updatedFilters.endDate) {
      onFilterChange(updatedFilters);
    } else if (role === 'admin') {
      onFilterChange(updatedFilters);
    }
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
    <div className="bg-white">
      <div className="flex flex-col w-full gap-6 p-6">
        {/* Header Title and Print Button */}
        <div className="flex justify-between items-center min-h-[40px]">
          <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">
            {role === 'admin' ? '출석 관리' : '출석'}
          </h1>

          {role === 'student' && (
            <div className="flex gap-4 items-center">
              <div className="flex items-center px-4 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm">
                  전체 출석률 (115일) {" "}
                  <span className="font-bold text-blue-600 ml-1">
                    {attendanceRates.overallAttendanceRate !== null
                      ? `${attendanceRates.overallAttendanceRate}%`
                      : "없음"}
                  </span>
                </span>
              </div>
              <div className="flex items-center px-4 py-2 bg-green-50 rounded-lg">
                <span className="text-sm">
                  한달 출석률 (20일) {" "}
                  <span className="font-bold text-green-600 ml-1">
                    {attendanceRates.twentyDayRate !== null
                      ? `${attendanceRates.twentyDayRate}%`
                      : "없음"}
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* ADMIN일 때만 인쇄 버튼 표시 - 상단 우측에 배치 */}
          {role === 'admin' && (
            <button
              className="flex items-center px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
              onClick={() => setIsPrintDialogOpen(true)}>
              출석부 인쇄
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-between items-center">
          {/* 교육 과정 필터 */}
          <select
            name="courseId"
            value={filters.courseId}
            onChange={(e) =>{
              handleInputChange(e);
            }}
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

          {/* 필터링 요소들 우측 정렬 */}
          <div className="flex items-center gap-4">
            {/* 날짜 Filter */}
            <div>
              {role === 'admin' ? (
                // Admin용 날짜 필터
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleInputChange}
                  placeholder="조회할 날짜를 선택해주세요."
                  className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                // Student용 날짜 필터 (시작 날짜와 끝 날짜)
                <div className="flex flex-col md:flex-row gap-2">
                  <input
                    type="date"
                    name="startDate"
                    value={filters.startDate || ''}
                    onChange={handleInputChange}
                    placeholder="시작 날짜를 선택해주세요."
                    className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="date"
                    name="endDate"
                    value={filters.endDate || ''}
                    onChange={handleInputChange}
                    placeholder="끝 날짜를 선택해주세요."
                    className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            {/* 출석 상태 Selector */}
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  filters.status === 'PRESENT'
                    ? 'bg-[#228B22] bg-opacity-50 text-black'
                    : 'bg-gray-200 hover:bg-[#228B22] hover:bg-opacity-30'
                }`}
                onClick={() => handleStatusToggle('PRESENT')}
              >
                출석
              </button>
              <button
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  filters.status === 'LATE'
                    ? 'bg-[#F1B747] bg-opacity-60 text-black'
                    : 'bg-gray-200 hover:bg-[#F1B747] hover:bg-opacity-40'
                }`}
                onClick={() => handleStatusToggle('LATE')}
              >
                지각
              </button>
              <button
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  filters.status === 'ABSENT'
                    ? 'bg-[#FF0000] bg-opacity-50 text-black'
                    : 'bg-gray-200 hover:bg-[#FF0000] hover:bg-opacity-30'
                }`}
                onClick={() => handleStatusToggle('ABSENT')}
              >
                결석
              </button>
              <button
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  filters.status === 'EARLY_EXIT'
                    ? 'bg-[#FF0000] bg-opacity-50 text-black'
                    : 'bg-gray-200 hover:bg-[#FF0000] hover:bg-opacity-30'
                }`}
                onClick={() => handleStatusToggle('EARLY_EXIT')}
              >
                조퇴
              </button>
            </div>

            {/* 학생명 Filter */}
            {role === 'admin' && (
              <div
                className="w-72 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
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
                  placeholder="검색할 학생명을 입력해주세요."
                  className="w-full text-gray-600 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PrintDialog 컴포넌트 */}
      {role === 'admin' && (
        <PrintDialog
          isOpen={isPrintDialogOpen}
          onClose={() => setIsPrintDialogOpen(false)}
          courseName={courses.find(
            c => c.courseId === filters.courseId)?.courseName}
          terms={terms}
          selectedTerm={selectedTerm}
          attendanceData={attendancePrintData}
          isLoading={isLoading}
          onTermSelect={onTermSelect}
        />
      )}
    </div>
  );
};

export default AttendMainHeader;