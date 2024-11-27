import React, { useEffect, useState } from 'react';
import NoticeRegistration from './NoticeRegistration';
import axios from 'api/axios';
import _ from 'lodash';

const NoticeMainHeader = ({ onSearch, onCourseChange, fetchNotices = () => {} }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [error, setError] = useState(null);

  // 모달 열기/닫기
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 검색어 변경 처리 (디바운스 적용)
  const debouncedSearch = _.debounce((value) => {
    onSearch(value);
  }, 300);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // 교육 과정 선택 처리
  const handleCourseChange = (e) => {
    const value = e.target.value;
    setSelectedCourse(value);
    onCourseChange(value); // 부모 컴포넌트로 전달
  };

  // 서버에서 교육 과정 목록 가져오기
  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/course/list`
      );
      setCourses(response.data);
    } catch (error) {
      setError('교육 과정 데이터를 가져오는 중 오류가 발생했습니다.');
      console.error('Error fetching courses:', error);
    }
  };

  // 컴포넌트 마운트 시 교육 과정 가져오기
  useEffect(() => {
    fetchCourses();
  }, []);

  // 교육 과정 데이터를 가져온 후 첫 번째 항목을 기본값으로 설정
  useEffect(() => {
    if (courses.length > 0) {
      // 첫 번째 교육 과정을 기본값으로 설정
      setSelectedCourse(courses[0].id);
      onCourseChange(courses[0].id); // 부모에게 기본값 전달
    }
  }, [courses, onCourseChange]);

  return (
    <div className="flex flex-col w-full gap-6 pr-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">공지사항</h1>
        <div
          className="flex justify-center items-center px-4 py-2 rounded-lg bg-[#225930] hover:cursor-pointer transform transition-transform duration-300 hover:scale-110"
          onClick={openModal}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 5V19"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 12H19"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-sm text-white">공지사항 등록</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 justify-between items-center">
        {/* 교육 과정 셀렉트 박스 */}
        <select
          className="px-3 py-2 rounded-lg bg-white border border-gray-300 w-64 text-sm text-gray-500"
          value={selectedCourse}
          onChange={handleCourseChange}
          disabled={courses.length === 0} // 교육 과정이 없으면 비활성화
        >
          <option value="" disabled hidden>
            {courses.length === 0 ? '교육 과정이 없습니다.' : '교육 과정을 선택하세요'}
          </option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>

        {/* 검색창 */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 w-64">
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
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <NoticeRegistration
        isOpen={isModalOpen}
        onClose={closeModal}
        fetchNotices={fetchNotices}
        selectedCourse={selectedCourse} // 선택된 교육 과정 전달
      />
    </div>
  );
};

export default NoticeMainHeader;