// components/member/StudentMainPage.js
import React, { useState, useEffect } from 'react';
import StudentMainCalendar from './StudentMainCalendar';
import StudentLayout from '../common/layout/student/StudentLayout';
import StudentMainHeader from './StudentMainHeader';
import { studentJournalApi } from '../../api/journalApi';

// components/member/StudentMainPage.js
const StudentMainPage = () => {
  const [currentCourse, setCurrentCourse] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrentCourse = async () => {
      try {
        const response = await studentJournalApi.getCurrentEnrollment();
        console.log("API 응답:", response.data);  // API 응답 확인

        const currentEnrollment = response.data.find(enrollment => {
          console.log("각 enrollment 데이터:", enrollment); // 각 enrollment 데이터 확인
          const enrollDate = new Date(enrollment.enrollDate);
          const endDate = new Date(enrollment.endDate);
          const now = new Date();
          console.log("날짜 비교:", {
            enrollDate,
            endDate,
            now,
            isCurrentlyCourse: now >= enrollDate && now <= endDate
          }); // 날짜 비교 결과 확인
          return now >= enrollDate && now <= endDate;
        });

        if (currentEnrollment) {
          setCurrentCourse({
            id: currentEnrollment.courseId,
            name: currentEnrollment.courseName
          });
        } else {
          setError('현재 수강 중인 과정이 없습니다.');
        }
      } catch (error) {
        console.error('현재 수강 과정 조회 실패:', error);
        setError('현재 수강 중인 과정 정보를 불러올 수 없습니다.');
      }
    };

    fetchCurrentCourse();
  }, []);

  if (error) {
    return (
      <StudentLayout>
        <div className="p-6 text-red-500">{error}</div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <StudentMainHeader courseName={currentCourse?.name} />
      <div className="px-6 py-4">
        {currentCourse && <StudentMainCalendar courseId={currentCourse.id} />}
      </div>
    </StudentLayout>
  );
};

export default StudentMainPage;