import AdminLayout from '../../common/layout/admin/AdminLayout';
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'api/axios';
import AttendMainHeader from '../AttendMainHeader';
import AttendanceDetail from './AttendanceDetail';

// 상수로 분리
const ALL_PERIODS = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시'];

export const AttendanceList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({
    courseId: '',
    studentName: '',
    date: new Date().toISOString().split('T')[0],
    status: '',
  });
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attendanceRates, setAttendanceRates] = useState({});
  const [terms,setTerms] = useState({});
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [attendancePrintData, setAttendancePrintData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // periodHeaders 상태 제거

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/enrollments/my`);
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

  /* 출석률 조회 */
  const fetchAttendanceRates = useCallback(async () => {
    try {
      if (!filters.courseId) return;

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/attendance/course/${filters.courseId}/rate`
      );
      setAttendanceRates(prev => ({ ...prev, ...response.data }));

    } catch (error) {
      console.error("출석률 데이터를 불러오는 중 오류 발생:", error);
    }
  }, [filters.courseId]);

  // 출석부 조건을 사용하기 위해 조회하는 차수 리스트 List<Map<String, Object>>
  const fetchAttendanceTwentyTerms = useCallback( async () => {
    try {
      if (!filters.courseId) return;

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/attendance/course/${filters.courseId}/terms`);

      console.log('서버에서 받은 terms 데이터:', response.data);

      // 서버에서 바로 배열 형태로 오는 경우
      if (Array.isArray(response.data)) {
        setTerms(response.data);

        // 1차 데이터 찾기
       /* if (response.data.length > 0) {
          const firstTerm = response.data.find(term => term["차수"] === "1차" || term["차수"] === 1);
          //setSelectedTerm(firstTerm || response.data[0]);
        }*/
      } else {
        console.warn('서버에서 받은 데이터가 배열이 아닙니다:', response.data);
      }
      /*      setTerms(prev => ({ ...prev, ...response.data }));
            setSelectedTerm(response.data[0]["차"]==="1차"); // 첫 번째 차수 기본 선택*/
    } catch (error) {
      console.error('20일 단위 차수를 불러오는 중 오류 발생:', error);
    }
  }, [filters.courseId]);

  useEffect(() => {
    if (filters.courseId) {
      fetchAttendanceRates();
      fetchAttendanceTwentyTerms();
    }
  }, [fetchAttendanceRates,fetchAttendanceTwentyTerms,filters.courseId]); // useCallback을 의존성으로 추가

  // 출석부 데이터 조회 함수
  const fetchAttendancePrintData = useCallback(async (courseId, term) => {
    setIsLoading(true);
    try {
      if (!term) {
        console.error('선택된 차수 정보가 없습니다.');
        return;
      }

      const termValue = term["차수"] || term["차"] || '';
      console.log('요청할 차수 값:', termValue);

      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/attendance/course/${filters.courseId}/print`, {
        params: {
          courseId,
          term:termValue
        }
      });
      setAttendancePrintData(response.data);
    } catch (error) {
      console.error('출석 인쇄에 대한 데이터를 불러오는 중 오류 발생:', error);
    } finally {
      setIsLoading(false);
    }
  },[filters.courseId, setIsLoading,setAttendancePrintData]);


  const fetchAttendanceData = useCallback(async () => {

    try {
      const params = {
        studentName: filters.studentName || undefined,
        date: filters.date || undefined,
        status: filters.status || undefined,
        page: currentPage - 1,
        size: 10,
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/attendance/course/${filters.courseId}`,
        { params },
      );

      const { content, totalPages } = response.data;
      setAttendance(content);
      setTotalPages(totalPages);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  },[currentPage, filters.studentName, filters.date,filters.courseId, filters.status]);

  useEffect(() => {
    if (filters.courseId && filters.date) {
      fetchAttendanceData();
    }
  }, [filters.courseId, filters.date, currentPage, fetchAttendanceData]);

  const handleFilterChange = (updatedFilters) => {
    setFilters(updatedFilters);
    setCurrentPage(1);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case '출석':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#14AE5C" className="bi bi-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
          </svg>
        );
      case '지각':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#BF6A02" className="bi bi-triangle" viewBox="0 0 16 16">
            <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
          </svg>
        );
      case '결석':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#EC221F" className="bi bi-x-lg" viewBox="0 0 16 16">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
          </svg>
        );
      case '조퇴':
        return '조퇴';
      default:
        return '-';
    }
  };

  const handleRowClick = (courseId, studentId, date) => {
    setSelectedAttendance({ courseId, studentId, date });
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAttendance(null);
    fetchAttendanceData();
  };

  return (
    <AdminLayout currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)}>
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <AttendMainHeader role="admin"
                            courses={courses}
                            onFilterChange={handleFilterChange}
                            terms={terms}
                            selectedTerm={selectedTerm}
                            attendancePrintData={attendancePrintData}
                            isLoading={isLoading}
                            onTermSelect={(term) => {
                              setSelectedTerm(term);
                              fetchAttendancePrintData(filters.courseId,term);
                            }}
          />

          <div className="flex flex-col w-full bg-white rounded-xl shadow-sm relative">
            <div className="absolute top-0 bottom-0 w-0.5 bg-gray-500"
                 style={{ left: 'calc(11 * (100% / 13) - 2px)' }}></div>
            {/* Table Header */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-[repeat(13,1fr)] gap-4 px-6 py-4">
                <div className="flex flex-col items-center justify-center">
                  <span
                    className="text-sm font-bold text-gray-800 uppercase tracking-wider">이름</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span
                    className="text-sm font-bold text-gray-800 uppercase tracking-wider">과정</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span
                    className="text-sm font-bold text-gray-800 uppercase tracking-wider">날짜</span>
                </div>
                {ALL_PERIODS.map((period, index) => (
                  <div key={index} className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">{period}</span>
                  </div>
                ))}
                <div className="flex flex-col items-center justify-center">
                  <span
                    className="text-sm font-bold text-gray-800 uppercase tracking-wider">전체 출석률</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span
                    className="text-sm font-bold text-gray-800 uppercase tracking-wider">한 달 출석률</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {attendance.length > 0 ? (
                attendance.map((row) => (
                  <div
                    key={row.studentId}
                    onClick={() => handleRowClick(filters.courseId,
                      row.studentId, filters.date)}
                    className="grid grid-cols-[repeat(13,1fr)] gap-4 px-6 py-3 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                  >
                    <div
                      className="text-sm font-medium text-gray-900 text-center">{row.studentName}</div>
                    <div
                      className="text-sm text-gray-600 text-center">{row.courseName}</div>
                    <div className="text-sm text-gray-600 text-center">
                      {new Date(row.date).toLocaleDateString('ko-KR')}
                    </div>
                    {ALL_PERIODS.map((period, index) => (
                      <div key={index}
                           className="flex items-center justify-center">
                        {getStatusIcon(row.students[period] || '-')}
                      </div>
                    ))}
                    <div
                      className="text-sm text-gray-600 text-center">
                      {attendanceRates[row.studentId]?.overallAttendanceRate
                      !== undefined
                        ? `${attendanceRates[row.studentId].overallAttendanceRate}%`
                        : '없음'}
                    </div>
                    <div
                      className="text-sm text-gray-600 text-center">
                      {attendanceRates[row.studentId]?.twentyDayRate
                      !== undefined
                        ? `${attendanceRates[row.studentId].twentyDayRate}%`
                        : '없음'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-center text-gray-500 py-4">출석 데이터가
                  없습니다.</div>
              )}
            </div>
          </div>

          {selectedAttendance && isModalOpen && (
            <AttendanceDetail onClose={handleModalClose} attendance={selectedAttendance} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AttendanceList;