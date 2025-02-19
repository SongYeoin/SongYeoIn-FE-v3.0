import StudentLayout from '../../common/layout/student/StudentLayout';
import AttendMainHeader from '../AttendMainHeader';
import React, { useCallback, useEffect, useState } from 'react';
import axios from '../../../api/axios';
import AttendanceDetail from '../student/AttendanceDetail';

// 상수로 분리
const ALL_PERIODS = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시'];

const StudentAttendanceList = () => {
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [attendance, setAttendance] = useState([]);
//  const [periodHeaders, setPeriodHeaders] = useState([]); // 교시 헤더
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
  const [attendanceRates, setAttendanceRates] = useState({
    overallAttendanceRate: null,
    twentyDayRates: [],
    twentyDayRate: null
  });

  useEffect(() => {
    // 초기 코스 데이터 불러오기
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/enrollments/my`); // 수강생이 자기가 맡고 있는 교육과정 전체 조회
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

  const fetchAttendanceRates = useCallback(async () => {
    try{

      if(!filters.courseId) return;

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/attendance/course/${filters.courseId}/rate`);
      setAttendanceRates(response.data);
    }catch (error) {
      console.error("출석률 데이터를 불러오는 중 오류 발생:", error);
    }
  },[filters.courseId]);


  const fetchAttendanceData = useCallback(async () => {

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
  },[currentPage, filters.courseId, filters.endDate, filters.startDate, filters.status]);

  useEffect(() => {
    // 필터링 값이 변경될 때마다 데이터 가져오기
    if (filters.courseId && filters.date) {
      fetchAttendanceData();
    }
    if (filters.courseId) {
      fetchAttendanceRates();
    }
  }, [filters.courseId,filters.date,currentPage, fetchAttendanceData, fetchAttendanceRates]);

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
      case '조퇴':
        return '조퇴';
      default:
        return '-'; // Empty for unknown status
    }
  };

  const handleRowClick = (courseId, date) => {
    setSelectedAttendance({ courseId, date });
    setIsModalOpen(true); // 모달 열기
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAttendance(null);
    fetchAttendanceData(); // 모달이 닫힐 때 출석 데이터를 다시 호출
  };

  return (
    <StudentLayout currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)}>
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <AttendMainHeader role="student" courses={courses} onFilterChange={handleFilterChange} attendanceRates={attendanceRates} />

          <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">
            {/* Table Header */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-9 gap-4 px-6 py-4">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">날짜</span>
                </div>
                {ALL_PERIODS.map((period, index) => (
                  <div key={index} className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">{period}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {attendance.length > 0 ? (
                attendance.map((row,index) => (
                  <div
                    key={`${row.studentId}-${row.date}-${index}`}
                    onClick={() => handleRowClick(filters.courseId, row.date)}
                    className="grid grid-cols-9 gap-4 px-6 py-3 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                  >
                    <div className="text-sm text-gray-600 text-center">
                      {new Date(row.date).toLocaleDateString('ko-KR')}
                    </div>
                    {ALL_PERIODS.map((period, index) => (
                      <div key={index} className="flex items-center justify-center">
                        {getStatusIcon(row.students[period] || '-')}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-sm text-center text-gray-500 py-4">출석 데이터가 없습니다.</div>
              )}
            </div>
          </div>

          {selectedAttendance && isModalOpen && (
            <AttendanceDetail onClose={handleModalClose} attendance={selectedAttendance} />
          )}
        </div>
      </div>
    </StudentLayout>
  );
  };
export default StudentAttendanceList;