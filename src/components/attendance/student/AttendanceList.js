import StudentLayout from '../../common/layout/student/StudentLayout';
import AttendMainHeader from '../AttendMainHeader';
import React, { useEffect, useState } from 'react';
import axios from '../../../api/axios';
import AttendanceDetail from '../student/AttendanceDetail';

const StudentAttendanceList = () => {
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [attendance, setAttendance] = useState([]);
  const [periodHeaders, setPeriodHeaders] = useState([]); // 교시 헤더
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    courseId: '',
    date: new Date().toISOString().split('T')[0],
    status: '',
    startDate: (() => {
      const date = new Date();
      date.setDate(date.getDate() - 7); // 일주일 전
      return date.toISOString().split('T')[0];
    })(), // 즉시 실행 함수로 초기화
    endDate: new Date().toISOString().split('T')[0], // 오늘 날짜를 기본값으로 설정
  });
  const [selectedAttendance, setSelectedAttendance] = useState(null); // 선택한 출석
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태 관리
  const allPeriods = ["1교시", "2교시", "3교시", "4교시", "5교시", "6교시", "7교시"];
  const filledPeriodHeaders = allPeriods.map((period) =>
    periodHeaders.includes(period) ? period : null
  );

  useEffect(() => {
    // 초기 코스 데이터 불러오기
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/attendance/courses`); // 수강생이 자기가 맡고 있는 교육과정 전체 조회
        const courseList = response.data;

        if (courseList.length > 0) {
          setCourses(courseList);
          setFilters((prev) => ({ ...prev, courseId: courseList[0].courseId }));
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    // 필터링 값이 변경될 때마다 데이터 가져오기
    if (filters.courseId && filters.date) {
      fetchAttendanceData();
    }
  }, [filters, currentPage]);

  useEffect(() => {
    if (attendance.length > 0 && attendance[0].periods.length > 0) {
      setPeriodHeaders(attendance[0].periods); // periods가 교시 이름을 포함한다고 가정
    } else {
      setPeriodHeaders([]);
    }
  }, [attendance]); // attendance가 변경될 때 실행

  const fetchAttendanceData = async () => {

    try {
      const params = {
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        status: filters.status || undefined,
        page: currentPage - 1,
        size: 10,
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/attendance/course/${filters.courseId}`,
        { params },
      );

      const { content, totalPages } = response.data;

      setAttendance(content); // 날짜별
      setTotalPages(totalPages); // 전체 페이지 수 설정

    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    setCurrentPage(1); // 필터 변경 시 페이지를 초기화
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case '출석':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    fill="#14AE5C" className="bi bi-circle"
                    viewBox="0 0 16 16">
          <path
            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        </svg>; // Circle
      case '지각':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    fill="#BF6A02" className="bi bi-triangle"
                    viewBox="0 0 16 16">
          <path
            d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
        </svg>; // Triangle
      case '결석':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    fill="#EC221F" className="bi bi-x-lg"
                    viewBox="0 0 16 16">
          <path
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
        </svg>; // Cross
      default:
        return '-'; // Empty for unknown status
    }
  };

  const handleRowClick = (courseId, studentId, date) => {
    setSelectedAttendance({ courseId, studentId, date });
    setIsModalOpen(true); // 모달 열기
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAttendance(null);
    fetchAttendanceData(); // 모달이 닫힐 때 출석 데이터를 다시 호출
  };

  return (
    <StudentLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      <AttendMainHeader
        role="student"
        courses={courses}
        onFilterChange={handleFilterChange}
      />

      <div
        className="grid grid-cols-8 gap-5 w-full p-4 bg-white rounded-xl"
      >
        <p className="text-xs font-bold text-center text-gray-700">날짜</p>
        {filledPeriodHeaders.map((period, index) => (
          <p
            key={index}
            className={`text-xs font-bold text-center text-gray-700 ${
              period ? "" : "text-gray-700"
            }`}
          >
            {period || "-"}
          </p>
        ))}
      </div>

      <ul className="space-y-4">
        {attendance.length > 0 ? (
          attendance.map((row) => (
            <li key={row.studentId}>
              <div
                className="space-x-1 grid grid-cols-8 items-center justify-center text-center cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out p-2 rounded"
                onClick={() => handleRowClick(filters.courseId, row.studentId,
                  row.date)}
              >
                <p
                  className="text-xs text-center text-gray-700">
                  {new Date(row.date).toLocaleDateString('ko-KR')}
                </p>
                {filledPeriodHeaders.map((period, index) => (
                  <p
                    key={index}
                    className="flex items-center justify-center">
                    {period
                      ? getStatusIcon(row.students[period] || "-") // 교시가 있으면 상태 아이콘 렌더링
                      : "-"}
                  </p>
                ))}
              </div>
            </li>
          ))
        ) : (
          <p className="text-xs text-center text-gray-500">출석 데이터가
            없습니다.</p>
        )}
      </ul>
      {/* 상세보기 모달 */}
      {selectedAttendance && isModalOpen && (
        <AttendanceDetail
          onClose={handleModalClose}
          attendance={selectedAttendance}
        />
      )}
    </StudentLayout>
  );

};
export default StudentAttendanceList;