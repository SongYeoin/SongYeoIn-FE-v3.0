import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import CourseMainHeader from '../CourseMainHeader';



export const CourseList = () => {
  const [courses, setCourses] = useState([]);
  // 코스 데이터를 가져오는 함수
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // axios로 GET 요청
        const response = await axios.get('/admin/course');
        setCourses(response.data); // 데이터를 상태에 저장
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  return(
    <AdminLayout>
      <CourseMainHeader />
      <div
        className="flex flex-col w-full gap-4 p-4 bg-white rounded-xl">
        <div className="grid grid-cols-8 gap-4">
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
        {courses.map((course) => (
          <li key={course.id} className="bg-white p-4 rounded shadow">
            <h3 className="text-xl font-semibold">{course.name}</h3>
            <p>{course.description}</p>
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
};

export default CourseList;