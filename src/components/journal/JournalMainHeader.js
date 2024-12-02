import React, { useEffect, useState } from 'react';
import axios from 'api/axios';

const JournalMainHeader = ({ onCourseChange, onDateChange }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 과정 변경 핸들러
  const handleCourseChange = (e) => {
    const value = e.target.value;
    setSelectedCourse(value);
    onCourseChange(value);
  };

  // 날짜 변경 핸들러
  const handleDateChange = () => {
    onDateChange(startDate, endDate);
  };

  // 교육과정 목록 가져오기
  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/enrollments/my');
      if (response.status === 200) {
        setCourses(response.data);
        if(response.data.length > 0) {
          setSelectedCourse(response.data[0].courseId);
          onCourseChange(response.data[0].courseId);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col w-full gap-6 pr-4">
      <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">교육일지</h1>
      <div className="flex flex-wrap gap-4 justify-between items-center">
        {/* 교육 과정 선택 */}
        <select
          className="px-3 py-2 rounded-lg bg-white border border-gray-300 w-64 text-sm text-gray-500"
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

        {/* 날짜 범위 선택 */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-500"
          />
          <span className="text-gray-500">~</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-500"
          />
          <button
            onClick={handleDateChange}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600"
          >
            검색
          </button>
        </div>
      </div>
    </div>
  );
};

export default JournalMainHeader;