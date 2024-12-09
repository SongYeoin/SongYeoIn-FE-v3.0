import React, { useEffect, useState, useCallback } from 'react';
import axios from 'api/axios';
import StudentJournalCreate from './StudentJournalCreate';

const StudentJournalHeader = ({ onFilterChange, refreshJournals }) => {
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    courseId: '',
    startDate: '',
    endDate: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 과정 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value,
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters); // 모든 변경사항을 한번에 전달
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // 교육과정 목록 가져오기
  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get('/api/enrollments/my');
      if (response.status === 200) {
        setCourses(response.data);
        if(response.data.length > 0) {
          const initialFilters = {
            ...filters,
            courseId: response.data[0].courseId
          };
          setFilters(initialFilters);
          onFilterChange(initialFilters);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, [filters, onFilterChange]);

  return (
    <div className="bg-white">
      <div className="flex flex-col w-full gap-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">교육일지</h1>
          <button
            onClick={() => setIsCreateModalOpen(true)}
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
          <p className="text-sm text-white">교육일지 등록</p>
        </button>
        </div>
        <div className="flex flex-wrap gap-4 justify-between items-center">
        <select
          name="courseId"
          value={filters.courseId}
          onChange={handleInputChange}
          className="w-80 text-center px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={courses.length === 0}
        >
          <option value="" disabled hidden>
            {courses.length === 0 ? '교육 과정이 없습니다.' : '교육 과정을 선택하세요'}
          </option>
          {courses.map((course) => (
            <option key={course.courseId} value={course.courseId}
                    className="text-sm text-black">
              {course.courseName}
            </option>
          ))}
        </select>

        {/* 날짜 범위 선택 */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            name="startDate"
            value={filters.startDate}
            onChange={handleInputChange}
            className="border rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-500">~</span>
          <input
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleInputChange}
            className="border rounded-lg px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 작성 모달 */}
      {isCreateModalOpen && (
        <StudentJournalCreate
          courseId={filters.courseId}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            refreshJournals();
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </div>
    </div>
  );
};

export default StudentJournalHeader;