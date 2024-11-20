import React, { useEffect, useState } from 'react';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import CourseMainHeader from '../CourseMainHeader';
import axios from 'axios';
//import api from '../../common/api';


export const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수

  // 코스 데이터를 가져오는 함수
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // axios로 GET 요청
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/course`,
          {
            params: {
              page: currentPage -1,
              size: 10
            },
            headers: {
              Authorization: `Bearer `,
            }
          });
        console.log(response.data.content);
        setCourses(response.data.content); // 데이터를 상태에 저장
        setTotalPages(response.data.totalPages); // 전체 페이지 수
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, [currentPage]);// currentPage가 변경될 때 데이터 로드

  return(
    <AdminLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      <CourseMainHeader />
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