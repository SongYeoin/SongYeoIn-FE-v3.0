import React, { createContext, useState, useEffect } from 'react';
import axios from 'api/axios';

// Context 생성
export const CourseContext = createContext();

// Provider 컴포넌트
export const CourseProvider = ({ children }) => {
  const [courseId, setCourseId] = useState(null); // 단일 선택한 Course ID
  const [courses, setCourses] = useState([]); // 전역으로 관리할 Course 리스트

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/club`); // 서버 요청
        console.log(response.data);  // 응답 데이터 확인
        setCourses(response.data); // 서버 데이터 설정
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, [setCourses]);

  return (
    <CourseContext.Provider value={{ courseId, setCourseId, courses }}>
      {children}
    </CourseContext.Provider>
  );
};
