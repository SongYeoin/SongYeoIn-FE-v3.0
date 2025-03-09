// components/member/StudentMainPage.js
import React, { useCallback, useEffect, useState } from 'react';
import StudentMainCalendar from './StudentMainCalendar';
import StudentLayout from '../common/layout/student/StudentLayout';
import StudentMainHeader from './StudentMainHeader';
import { studentJournalApi } from '../../api/journalApi';
import axios from 'axios';
import { useResponsive } from '../common/ResponsiveWrapper';

const StudentMainPage = () => {
 const { isDesktop } = useResponsive();

 /* ===== SHARED STATE SECTION START =====
  * Description: 공통으로 사용되는 상태 관리
  */
 const [currentCourse, setCurrentCourse] = useState(null);
 const [error] = useState(null);
 const [selectedDate, setSelectedDate] = useState(() => {
   const today = new Date();
   const year = today.getFullYear();
   const month = String(today.getMonth() + 1).padStart(2, '0');
   const day = String(today.getDate()).padStart(2, '0');
   return `${year}-${month}-${day}`;
 });
  const [availableCourses, setAvailableCourses] = useState([]);
 /* ===== SHARED STATE SECTION END ===== */

 /* ===== ATTENDANCE SECTION START =====
  * Owner: [소연]
  * Description: 출석 관련 로직 및 상태 관리
  */
 const [attendanceData, setAttendanceData] = useState([]);
  const [enterTime, setEnterTime] = useState(null);
  const [exitTime, setExitTime] = useState(null);
  const today = new Date().toLocaleDateString('ko-KR',
    { timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit', // 두 자리로 설정
      day: '2-digit',   // 두 자리로 설정
    }).replace(/\./g, '').replace(/\s/g, '-').trim();
  const [allPeriodData, setAllPeriodData] = useState([]);
  const [filteredPeriodData, setFilteredPeriodData] = useState([]); // 선택된 날짜의 시간표 데이터
  const [dayOfWeek, setDayOfWeek] = useState('');

  // 요일 계산 함수
  const getDayOfWeek = (dateString) => {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };
  const [showPeriodSelection, setShowPeriodSelection] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null); // 선택한 교시 ID
  const [selectedPeriodName, setSelectedPeriodName] = useState(""); // 선택한 교시 이름

  // 교시 선택 핸들러
  const handlePeriodSelect = (periodId, periodName) => {
    setSelectedPeriod(periodId);
    setSelectedPeriodName(periodName);
  };

  const handleEarlyExitClick = () => {
    if (!showPeriodSelection) {
      setShowPeriodSelection(true); // 첫 클릭 시 시간표 표시
    } else if (selectedPeriod) {
      handleAttendanceClick('EARLY_EXIT', selectedPeriod, selectedPeriodName); // 선택한 경우 조퇴 처리
      setShowPeriodSelection(false);
      setSelectedPeriod(null);
    }
  };

  // 코스 변경 핸들러
  const handleCourseChange = (courseId) => {
    const selectedCourse = availableCourses.find(course => course.id === courseId);
    if (selectedCourse) {
      setCurrentCourse(selectedCourse);
      // 코스 변경 시 관련 데이터 초기화
      setAttendanceData([]);
      setEnterTime(null);
      setExitTime(null);
      setAllPeriodData([]);
      setFilteredPeriodData([]);
      setShowPeriodSelection(false);
      setSelectedPeriod(null);
      setSelectedPeriodName("");
    }
  };

  const fetchAttendanceData = useCallback(async () => {
   if (selectedDate && currentCourse) {
/*     console.log("선택된 날짜(부모): " + selectedDate);
     console.log("현재 courseId(부모): " + currentCourse.id);*/
     try {
       const response = await axios.get(
         `${process.env.REACT_APP_API_URL}/attendance/main/${currentCourse.id}`,
         {
           params: {
             date: selectedDate,
           },
         }
       );
       setAttendanceData(response.data);

       // 오늘 날짜의 출석 데이터 중 enterTime과 exitTime이 있는 것 찾기
       const enterRecord = response.data.find((item) => item.enterTime !== null);
       const exitRecord = response.data.find((item) => item.exitTime !== null);

       setEnterTime(enterRecord ? formatDateTime(enterRecord.enterTime) : null);
       setExitTime(exitRecord ? formatDateTime(exitRecord.exitTime) : null);

     } catch (error) {
       console.error("출석 데이터를 가져오는데 실패했습니다:", error);
     }
   }
 },[selectedDate,currentCourse]);

  const getStatusIcon = (status) => {
    switch (status) {
      case '출석':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    fill="#14AE5C" className="bi bi-circle"
                    viewBox="0 0 16 16">
          <path
            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
        </svg>;
      case '지각':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    fill="#BF6A02" className="bi bi-triangle"
                    viewBox="0 0 16 16">
          <path
            d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
        </svg>;
      case '결석':
        return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                    fill="#EC221F" className="bi bi-x-lg"
                    viewBox="0 0 16 16">
          <path
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
        </svg>;
      case '조퇴':
        return '조퇴';
      default:
        return '-';
    }
  };
  /* ===== ATTENDANCE SECTION END ===== */

  const handleAttendanceClick = async (attendanceType, periodId = null, periodName = "") => {
      try {

        if (!currentCourse) {
          alert("선택된 과정이 없습니다.");
          return;
        }

        if (attendanceType === "EARLY_EXIT") {
          if (!periodId) {
            alert("조퇴할 교시를 선택해주세요.");
            return;
          }

          const confirmExit = window.confirm(`선택한 교시 (${periodName})에 조퇴하시겠습니까?`);
          if (!confirmExit) {
            return; // 사용자가 취소하면 요청을 보내지 않음
          }
        }


        const requestData = {
          attendanceType: attendanceType,
          courseId: currentCourse.id,
        };

        // 조퇴하는 경우 periodId 추가
        if (attendanceType === "EARLY_EXIT") {
          if (!periodId) {
            alert(`조퇴 완료! (교시: ${periodName})`);
            return;
          }
          requestData.periodId = periodId; // API 요청에 선택한 교시 포함
        }

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/attendance/enroll`,
          requestData
        );

        console.log('출석 성공:', response.data);

        if (attendanceType === "ENTER") {
          alert("입실 완료!");
          //setEnterTime(formatDateTime(response.data.enterTime));
        } else if (attendanceType === "EARLY_EXIT") {
          alert("조퇴 완료!");
          //setExitTime(formatDateTime(response.data.exitTime));
        } else if (attendanceType === "EXIT") {
          alert("퇴실 완료!");
          //setExitTime(formatDateTime(response.data.exitTime));
        }


        fetchAttendanceData();

      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message;
          alert(errorMessage);
        } else {
          alert('출석 처리 중 문제가 발생했습니다.');
        }
        console.error('출석 처리 실패:', error);
      }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return null;

    // 서버에서 온 ISO 문자열 형식: "2025-03-07T14:30:45.123Z" 또는 "2025-03-07T14:30:45"
    // 날짜와 시간 부분 분리
    const [datePart, timePart] = isoString.split('T');

    // 시간 부분에서 시, 분, 초 추출 (밀리초, 시간대 정보 제거)
    const timeComponents = timePart.split('.')[0].split(':');
    const hours = timeComponents[0];
    const minutes = timeComponents[1];
    const seconds = timeComponents[2];

    return `${hours}:${minutes}:${seconds} - ${datePart}`;
  };

  /* ===== CALENDAR SECTION START =====
   * Owner: [예린]
   * Description: 달력 관련 로직 및 상태 관리
   */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await studentJournalApi.getCurrentEnrollment();
        console.log("API 전체 응답:", response);

        if (response.data && response.data.length > 0) {
          // 모든 수강 정보를 가공하여 저장
          const courses = response.data.map(enrollment => ({
            id: enrollment.courseId,
            name: enrollment.courseName,
            adminName: enrollment.adminName,
            teacherName: enrollment.teacherName,
            startDate: enrollment.startDate,
            endDate: enrollment.endDate,
            enrollDate: enrollment.enrollDate
          }));

          setAvailableCourses(courses);

          // 현재 수강 중인 과정을 찾아 현재 과정으로 설정
          const now = new Date();
          const currentEnrollment = courses.find(course => {
            const enrollDate = new Date(course.enrollDate || course.startDate);
            const endDate = new Date(course.endDate);
            return now >= enrollDate && now <= endDate;
          }) || courses[0]; // 현재 과정이 없으면 첫 번째 과정 선택

          setCurrentCourse(currentEnrollment);
          console.log("현재 선택된 과정:", currentEnrollment);
        } else {
          console.log("수강 정보가 없습니다.");
        }
      } catch (error) {
        console.error('수강 과정 조회 실패:', error);
      }
    };

    fetchCourses();
  }, []);
 /* ===== CALENDAR SECTION END ===== */

  // 전체 시간표 데이터 가져오기(초기 로드)
  const fetchAllPeriodData = useCallback(async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/attendance/period/all/${currentCourse.id}`
      );
      setAllPeriodData(response.data);
    } catch (error) {
      console.error('시간표 데이터를 가져오는 중 오류가 발생했습니다:', error);
    }
  },[currentCourse]);

  // 선택된 날짜에 따라 시간표 필터링
  useEffect(() => {

/*    console.log("today= "+ today);
    console.log("selectedDate= "+ selectedDate);*/
    if (selectedDate) {
      const day = getDayOfWeek(selectedDate);
      setDayOfWeek(day);

      // 클라이언트에서 필터링
      const filteredData = allPeriodData.filter(
        (entry) => entry.dayOfWeek === day,
      );
      setFilteredPeriodData(filteredData);

      // 과거일 경우 출석 데이터 가져오기
      if (selectedDate < today) {
        fetchAttendanceData();
      }
    }

  }, [selectedDate, allPeriodData, today, fetchAttendanceData]);

  // 초기 로딩 시 전체 시간표 데이터 가져오기
  useEffect(() => {
    if (currentCourse?.id) {
      fetchAllPeriodData();
      fetchAttendanceData();
    }
  }, [currentCourse, fetchAllPeriodData, fetchAttendanceData]);

 if (error) {
   return (
     <StudentLayout>
       <div className="p-6 text-red-500">{error}</div>
     </StudentLayout>
   );
 }

 return (
   <StudentLayout>
     <StudentMainHeader
       courseInfo={currentCourse}
       availableCourses={availableCourses}
       onCourseChange={handleCourseChange}
     />
     <div className={`
       flex
       ${isDesktop ? 'flex-row' : 'flex-col'}
       w-full gap-2 p-4
     `}>
       {/* ===== CALENDAR UI SECTION START ===== */}
       <div className={`
         ${isDesktop ? 'w-2/3' : 'w-full'}
         p-4
       `}>
         {currentCourse && (
           <StudentMainCalendar
             courseId={currentCourse.id}
             onDateChange={setSelectedDate}
           />
         )}
       </div>
       {/* ===== CALENDAR UI SECTION END ===== */}

       {/* ===== ATTENDANCE UI SECTION START ===== */}
       <div className={`
         ${isDesktop ? 'w-1/3' : 'w-full'}
         p-4 bg-white rounded-lg shadow-md border border-gray-100
       `}>
         <div className="w-full h-full">
           <h3 className="mb-4 text-xl font-bold text-gray-800 border-b pb-2">
             {selectedDate} <span className="text-indigo-600">{dayOfWeek}</span>
           </h3>

           {/* 현재날짜: 입실/퇴실 버튼 */}
           {selectedDate === today ? (
             <div className="space-y-4">
               {/* 입실하기 섹션 */}
               <div className="bg-gray-50 p-3 rounded-md">
                 {enterTime ? (
                   <div className="flex items-center text-gray-700">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                     <span className="font-medium">입실시간:</span> <span className="ml-2">{enterTime}</span>
                   </div>) : (
                   <button
                     className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-4 py-2 rounded shadow transition-colors duration-200 flex items-center justify-center"
                     onClick={() => handleAttendanceClick('ENTER')}
                     disabled={!currentCourse}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                     </svg>
                     입실하기
                   </button>
                 )}
               </div>

               {/* 시간표 선택 섹션 (조퇴용) */}
               {showPeriodSelection && (
                 <div className="bg-gray-50 p-3 rounded-md mt-4 border border-gray-200">
                   <h4 className="font-medium text-gray-700 mb-2">조퇴할 교시 선택</h4>
                   <div className="max-h-40 overflow-y-auto">
                     <table className="w-full border-collapse bg-white rounded-md overflow-hidden">
                       <thead className="bg-gray-100">
                         <tr>
                           <th className="p-2 text-sm font-medium text-gray-700">선택</th>
                           <th className="p-2 text-sm font-medium text-gray-700">교시</th>
                           <th className="p-2 text-sm font-medium text-gray-700">시간</th>
                         </tr>
                       </thead>
                       <tbody>
                       {filteredPeriodData.map((entry, index) => (
                         <tr key={index} className={`text-center ${selectedPeriod === entry.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                           <td className="p-2 text-center text-sm">
                             <input
                               type="radio"
                               name="selectedPeriod"
                               value={entry.id}
                               checked={selectedPeriod === entry.id}
                               onChange={() => handlePeriodSelect(entry.id, entry.name)}
                               className="form-radio h-4 w-4 text-indigo-600"
                             />
                           </td>
                           <td className="p-2 text-center text-sm font-medium">{entry.name}</td>
                           <td className="p-2 text-center text-sm">
                             {entry.startTime.split(':').slice(0, 2).join(':')} - {entry.endTime.split(':').slice(0, 2).join(':')}
                           </td>
                         </tr>
                       ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               )}

               {/* 조퇴하기/퇴실하기 버튼 그룹 */}
               <div className="flex space-x-2">
                 {/* 조퇴하기 Button */}
                 {enterTime && !exitTime && (
                   <button
                     className={`flex-1 text-white font-medium px-4 py-2 rounded shadow transition-colors duration-200 flex items-center justify-center
                     ${!showPeriodSelection || selectedPeriod
                       ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700'
                       : 'bg-gray-400 cursor-not-allowed'
                     }`}
                     onClick={handleEarlyExitClick}
                     disabled={showPeriodSelection && !selectedPeriod || !currentCourse}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                     </svg>
                     {showPeriodSelection ? '조퇴 확정' : '조퇴하기'}
                   </button>
                 )}

                 {/* 퇴실하기 Button */}
                 {exitTime ? (
                   <div className="flex-1 bg-gray-50 p-3 rounded-md flex items-center text-gray-700">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                     </svg>
                     <span className="font-medium">퇴실시간:</span> <span className="ml-2">{exitTime}</span>
                   </div>
                 ) : (
                   <button
                     className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium px-4 py-2 rounded shadow transition-colors duration-200 flex items-center justify-center"
                     onClick={() => handleAttendanceClick('EXIT')}
                     disabled={!currentCourse}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                     </svg>
                     퇴실하기
                   </button>
                 )}
               </div>
             </div>
           ) : selectedDate < today ? (
             // 과거 날짜인 경우: 출석 상태
             <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
               <div className="overflow-auto max-h-96">
                 <table className="w-full border-collapse">
                   <thead className="bg-gray-100">
                     <tr>
                       <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b text-left">교시</th>
                       <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b text-center">출석</th>
                     </tr>
                   </thead>
                   <tbody>
                     {attendanceData.length > 0 ? (
                       attendanceData.map((entry, index) => (
                         <tr key={index} className="hover:bg-gray-50">
                           <td className="px-4 py-3 text-sm font-medium border-b">{entry.periodName}</td>
                           <td className="border-b">
                             <div className="flex items-center justify-center py-2">
                               {entry.status !== null ? (
                                 <div className={`flex items-center justify-center px-3 py-1 rounded-full text-sm font-medium
                                   ${entry.status === '출석' ? 'bg-green-100 text-green-800' :
                                     entry.status === '지각' ? 'bg-orange-100 text-orange-800' :
                                     'bg-red-100 text-red-800'}`}>
                                   <span className="flex items-center gap-2">
                                     {getStatusIcon(entry.status)}
                                     <span>{entry.status}</span>
                                   </span>
                                 </div>
                               ) : (
                                 <span className="text-sm text-gray-500">미등록</span>
                               )}
                             </div>
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan="2" className="text-center text-gray-500 text-sm py-4">
                           출석 데이터가 없습니다.
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </div>
           ) : null}

           {/* 공통 시간표 */}
           <div className="mt-6">
             <h2 className="font-bold text-gray-800 mb-2 flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               {dayOfWeek} 시간표
             </h2>

             <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
               <div className="overflow-auto max-h-96">
                 {filteredPeriodData.length > 0 ? (
                   <table className="w-full border-collapse">
                     <thead className="bg-gray-100">
                       <tr>
                         <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">교시</th>
                         <th className="px-4 py-2 text-sm font-semibold text-gray-700 border-b">시간</th>
                       </tr>
                     </thead>
                     <tbody>
                       {filteredPeriodData.map((entry, index) => (
                         <tr key={index} className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                           <td className="px-4 py-3 text-sm font-medium border-b text-center">{entry.name}</td>
                           <td className="px-4 py-3 text-sm border-b text-center">
                             {entry.startTime.split(":").slice(0,2).join(":")} - {entry.endTime.split(":").slice(0,2).join(":")}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 ) : (
                   <p className="p-4 text-sm text-gray-500 text-center">해당 날짜의 시간표가 없습니다.</p>
                 )}
               </div>
             </div>
           </div>
         </div>
       </div>
       {/* ===== ATTENDANCE UI SECTION END ===== */}
     </div>
   </StudentLayout>
 );
};

export default StudentMainPage;