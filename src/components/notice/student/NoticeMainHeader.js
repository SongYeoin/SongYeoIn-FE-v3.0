import React, { useEffect, useState, useCallback } from 'react';
import axios from 'api/axios';
import _ from 'lodash';

const NoticeMainHeader = ({ onSearch, onCourseChange }) => {
  const [searchTerm, setSearchTerm] = useState(''); // 검색어 상태
  const [courses, setCourses] = useState([]); // 교육 과정 목록
  const [selectedCourse, setSelectedCourse] = useState(''); // 선택된 교육 과정

  // 검색어 변경 처리 (디바운스 적용)
  const debouncedSearch = _.debounce((value) => {
    onSearch(value);
  }, 300);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleCourseChange = (e) => {
    const value = e.target.value;
    setSelectedCourse(value);
    onCourseChange(value); // 부모 컴포넌트로 선택된 값 전달
  };

  // 교육 과정 목록 가져오기
  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/enrollments/my`);
      if (response.status === 200) {
        setCourses(response.data); // 응답 데이터를 상태로 설정
        if (response.data.length > 0) {
          // 첫 번째 항목을 기본값으로 설정
          setSelectedCourse(response.data[0].courseId);
          onCourseChange(response.data[0].courseId);
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, [onCourseChange]);

  // 컴포넌트 마운트 시 교육 과정 가져오기
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return (
    <div className="bg-white">
      <div className="flex flex-col w-full gap-9 p-6">
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
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 w-64">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#9A97A9"
              className="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"
              />
            </svg>
            <input
              className="text-sm text-gray-500 w-full"
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
