// components/member/StudentMainPage.js
import React, { useEffect, useState } from 'react';
import StudentMainCalendar from './StudentMainCalendar';
import StudentLayout from '../common/layout/student/StudentLayout';
import StudentMainHeader from './StudentMainHeader';
import { studentJournalApi } from '../../api/journalApi';
import axios from 'axios';

// components/member/StudentMainPage.js
const StudentMainPage = () => {
  const [currentCourse, setCurrentCourse] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // 로컬 시간으로 초기화
  });
  // 선택된 날짜 상태 추가 기본값: 현재 날짜
  const [attendanceData, setAttendanceData] = useState([]); // 출석 데이터 상태

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

  const fetchAttendanceData = async () => {
    if (selectedDate && currentCourse) {
      console.log("선택된 날짜(부모): " + selectedDate);
      console.log("현재 courseId(부모): " + currentCourse.id);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/attendance/main/${currentCourse.id}`,
          {
            params: {
              date: selectedDate,
            },
          }
        );
        setAttendanceData(response.data); // 출석 데이터 설정
      } catch (error) {
        console.error("출석 데이터를 가져오는데 실패했습니다:", error);
      }
    }
  };

  // 선택된 날짜에 따라 출석 데이터를 가져옴
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, currentCourse]);

  /*const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };*/

  const handleAttendanceClick = async (periodId) => {
    console.log(`출석하기 클릭됨! 교시 ID: ${periodId}`);

    if (periodId) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/attendance/enroll/${periodId}`
        );

        console.log("출석 성공:", response.data);
        fetchAttendanceData();
      } catch (error) {
        // 에러 응답에서 메시지를 가져옴
        if (error.response && error.response.data) {
          alert(error.response.data); // 백엔드에서 보낸 메시지를 경고창에 표시
        } else {
          alert("출석 처리 중 문제가 발생했습니다."); // 예상치 못한 에러 처리
        }
        console.error("출석 처리 실패:", error);
      }
    } else {
      console.error("교시 ID가 제공되지 않았습니다.");
    }
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
        return '-';
    }
  };



  return (
    <StudentLayout>
      <StudentMainHeader courseName={currentCourse?.name} />
      <div className="flex flex-row w-full gap-2">
        <div className="px-6 py-4">
          {currentCourse &&
            <StudentMainCalendar
              courseId={currentCourse.id}
              onDateChange={setSelectedDate}//캘린더에서 날짜 받아오기
            />}
        </div>
        <div className="px-6 my-4 pb-2 bg-[#F9F7F7] rounded-lg min-w-72">
          <div className="mt-2 pb-4 w-full h-full">
            {selectedDate && (
              <>
                <h3 className="mb-4 text-xl font-bold">{selectedDate}</h3>
                <div className="bg-white w-full p-4 rounded-lg">
                  <div className="overflow-auto max-h-96">
                    <table className="table-auto w-full border-collapse border">
                      <thead className="bg-gray-100">
                      <tr>
                        <th className="border text-center font-bold">교시</th>
                        <th className="border text-center font-bold">출석</th>
                      </tr>
                      </thead>
                      <tbody>
                      {attendanceData.length > 0 ? (
                        attendanceData.map((entry, index) => (
                          <tr key={index} className="border-b">
                            <td
                              className="border text-center">{entry.periodName}</td>
                            <td className="flex items-center justify-center">
                              {entry.status !== null ? (
                                getStatusIcon(entry.status) // status가 null이 아니면 아이콘 출력
                              ) : (
                                <button
                                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
                                  onClick={() => handleAttendanceClick(
                                    entry.periodId)} // 클릭 시 함수 호출
                                >
                                  출석하기
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="text-center text-gray-500">
                            출석 데이터가 없습니다.
                          </td>
                        </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </StudentLayout>
  );
};

export default StudentMainPage;