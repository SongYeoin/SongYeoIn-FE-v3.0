import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import CourseMainHeader from '../CourseMainHeader';
import axios from 'axios';
//import api from '../../common/api';
import _ from 'lodash'; // Lodash를 import


export const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [searchTerm, setSearchTerm] = useState(''); // 검색어

  // 코스 데이터를 가져오는 함수

    const fetchCourses = async (searchTerm) => {
      try {
        // axios로 GET 요청
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/course`,
          {
            params: {
              word: searchTerm,
              page: currentPage -1,
              size: 10
            },
            headers: {
              Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzMyMTIwNDE1LCJleHAiOjE3MzIxMjIyMTV9.nE_MnIhZHw-rLcVA4QToYECRh7Ux6ZOuUv7dONfhJeY`,
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
    _.debounce((search) => {
      fetchCourses(search);
    }, 500), // 500ms 대기
    []
  );

/*  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchTerm]);// currentPage가 변경될 때 데이터 로드*/

  useEffect(() => {
    debouncedFetchCourses(searchTerm);
  }, [searchTerm, currentPage]); // 검색어 또는 페이지 변경 시 실행


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
      <CourseMainHeader onSearch={handleSearch} />
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
      <ul className="space-y-9">
        {courses.map((course) => (
          <li key={course.id}>
            <div
              className="space-x-1 grid grid-cols-8 items-center text-center">
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
        ))}
      </ul>
    </AdminLayout>
  );
};

export default CourseList;