import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import CourseMainHeader from '../CourseMainHeader';
import axios from 'api/axios';
import _ from 'lodash';
import CourseDetail from '../CourseDetail'; // Lodash를 import

export const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [searchTerm, setSearchTerm] = useState(''); // 검색어
  const [selectedCourse, setSelectedCourse] = useState(null); // 선택한 과정

  // 코스 데이터를 가져오는 함수

    const fetchCourses = async (searchTerm,page) => {
      try {
        // axios로 GET 요청
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/course`,
          {
            params: {
              word: searchTerm,
              page: page -1,
              size: 10
            }
          });
        console.log(response.data.content);
        setCourses(response.data.content); // 데이터를 상태에 저장
        setTotalPages(response.data.totalPages); // 전체 페이지 수
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

  // 디바운스된 검색 함수 생성
  const debouncedFetchCourses = useCallback(
    _.debounce((search,page) => {
      fetchCourses(search,page);
    }, 200), // 200ms 대기
    []
  );


  useEffect(() => {
    debouncedFetchCourses(searchTerm,currentPage);
  }, [searchTerm, currentPage,debouncedFetchCourses]); // 검색어 또는 페이지 변경 시 실행


  // 검색어 업데이트(자식으로부터 받은 검색어 상태 업데이트)
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 페이지를 첫 페이지로 초기화
  };


  return(
    <AdminLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      <CourseMainHeader onSearch={handleSearch} fetchCourses={fetchCourses}/>
      <div
        className="flex flex-col w-full gap-5 p-4 bg-white rounded-xl">
        <div className="grid grid-cols-8 gap-5">
          <p className="text-xs font-bold text-center text-gray-700">과정명</p>
          <p className="text-xs font-bold text-center text-gray-700">담당자</p>
          <p className="text-xs font-bold text-center text-gray-700">강의실</p>
          <p className="text-xs font-bold text-center text-gray-700">과정 기간</p>
          <p className="text-xs font-bold text-center text-gray-700">개강일</p>
          <p className="text-xs font-bold text-center text-gray-700">종강일</p>
          <p className="text-xs font-bold text-center text-gray-700">수강생 수</p>
          <p className="text-xs font-bold text-center text-gray-700">상태</p>
        </div>
      </div>
      <ul className="space-y-4">
        {courses.length > 0 ? (
          courses.map((course) => (
          <li key={course.id}>
            <div
              className="space-x-1 grid grid-cols-8 items-center text-center cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out p-2 rounded"
              onClick={() => setSelectedCourse(course.id)} // 상세보기 클릭
            >
              <h3
                className="bg-white p-1 rounded shadow font-semibold">{course.name}</h3>
              <p>{course.adminName}</p>
              <p>{course.roomName}호</p>
              <p>{course.weeks}주</p>
              <p>{course.startDate}</p>
              <p>{course.endDate}</p>
              <p>{course.counts}</p>
              <p
                className={`${
                  course.status === "Y" ? "text-green-500" : "text-gray-400"
                }`}
              >
                {course.status === "Y" ? "활성" : "종강"}
              </p>
            </div>
          </li>
          ))
        ) : (
          <p className="text-xs text-center text-gray-500">교육과정 데이터가
            없습니다.</p>
        )}
      </ul>
      {/* 상세보기 모달 */}
      {selectedCourse && (
        <CourseDetail
          courseId={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onDeleteSuccess={() => {
            setSelectedCourse(null); // 모달 닫기
            fetchCourses(searchTerm, currentPage); // 전체 목록 새로고침
          }}
        />)}
    </AdminLayout>
  );
};

export default CourseList;