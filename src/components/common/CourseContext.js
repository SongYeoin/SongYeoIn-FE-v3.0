import React, { createContext, useState } from 'react';

// Context 생성
export const CourseContext = createContext();

// Provider 컴포넌트
export const CourseProvider = ({ children }) => {
  const [courseId, setCourseId] = useState(null); // 전역 상태 관리

  return (
    <CourseContext.Provider value={{ courseId, setCourseId }}>
      {children}
    </CourseContext.Provider>
  );
};
