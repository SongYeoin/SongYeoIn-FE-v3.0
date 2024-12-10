import React, { useEffect, useState } from 'react';
import NoticeRegistration from './NoticeRegistration';
import axios from 'api/axios';
import _ from 'lodash';

const NoticeMainHeader = ({ onSearch, onCourseChange, fetchNotices }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [error, setError] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSearchTerm(''); // 검색어 초기화
    onSearch(''); // 부모 컴포넌트에 검색 초기화 알림
  };

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
    onCourseChange(value);
    setSearchTerm('');
  };

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

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courses.length > 0 && !selectedCourse) {
      setSelectedCourse(courses[0].id);
      onCourseChange(courses[0].id);
    }
  }, [courses, selectedCourse, onCourseChange]);

  return (
    <div className="bg-white">
      <div className="flex flex-col w-full gap-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">공지사항</h1>
          <div
            className="flex justify-center items-center px-4 py-2 rounded-lg bg-[#225930] hover:cursor-pointer transform transition-transform duration-300"
            onClick={openModal}
          >
            <svg width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-sm text-white">공지사항 등록</p>
          </div>
        </div>
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
              <option key={course.id} value={course.id}>
                {course.name}
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
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          <NoticeRegistration
            isOpen={isModalOpen}
            onClose={closeModal} // 모달 닫힘 시 검색 초기화
            selectedCourse={selectedCourse}
            fetchNotices={fetchNotices}
          />
        </div>
      </div>
    </div>
  );
};

export default NoticeMainHeader;
