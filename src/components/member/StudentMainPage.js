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
 /* ===== SHARED STATE SECTION END ===== */

 /* ===== ATTENDANCE SECTION START =====
  * Owner: [소연]
  * Description: 출석 관련 로직 및 상태 관리
  */
 const [attendanceData, setAttendanceData] = useState([]);
  const [enterTime, setEnterTime] = useState(null);
  const [exitTime, setExitTime] = useState(null);
  const today = new Date().toLocaleDateString('ko-KR',
    { timeZone: 'Asia/Seoul' }).replace(/\./g, '').replace(/\s/g, '-').trim();
  const [allPeriodData, setAllPeriodData] = useState([]);
  const [filteredPeriodData, setFilteredPeriodData] = useState([]); // 선택된 날짜의 시간표 데이터
  const [dayOfWeek, setDayOfWeek] = useState('');

  // 요일 계산 함수
  const getDayOfWeek = (dateString) => {
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  const fetchAttendanceData = useCallback(async () => {
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
       setAttendanceData(response.data);
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
      default:
        return '-';
    }
  };
  /* ===== ATTENDANCE SECTION END ===== */

  const handleAttendanceClick = async (isEntering) => {
    if (isEntering) {
      try {
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/attendance/enroll/${currentCourse.id}`,
        );

        console.log('출석 성공:', response.data);
        /*fetchAttendanceData();*/
        alert(isEntering ? '입실 완료!' : '퇴실 완료!');
        isEntering ? setEnterTime(response.data.enterTime) : setExitTime(
          response.data.exitTime);
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message;
          alert(errorMessage);
        } else {
          alert('출석 처리 중 문제가 발생했습니다.');
        }
        console.error('출석 처리 실패:', error);
      }
    }
  };

 /* ===== CALENDAR SECTION START =====
  * Owner: [예린]
  * Description: 달력 관련 로직 및 상태 관리
  */
 useEffect(() => {
   const fetchCurrentCourse = async () => {
     try {
       const response = await studentJournalApi.getCurrentEnrollment();
       console.log("API 전체 응답:", response);

       if (response.data && response.data.length > 0) {
         console.log("첫 번째 수강 정보:", response.data[0]);

         const currentEnrollment = response.data.find(enrollment => {
           const enrollDate = new Date(enrollment.enrollDate);
           const endDate = new Date(enrollment.endDate);
           const now = new Date();
           console.log("날짜 비교:", {
             enrollDate,
             endDate,
             now,
             isValid: now >= enrollDate && now <= endDate
           });
           return now >= enrollDate && now <= endDate;
         });

         console.log("찾은 현재 수강 정보:", currentEnrollment);

         if (currentEnrollment) {
           setCurrentCourse({
             id: currentEnrollment.courseId,
             name: currentEnrollment.courseName,
             adminName: currentEnrollment.adminName,
             teacherName: currentEnrollment.teacherName,
             startDate: currentEnrollment.startDate,
             endDate: currentEnrollment.endDate
           });
         } else {
           console.log("현재 수강 중인 과정을 찾을 수 없습니다.");
         }
       } else {
         console.log("수강 정보가 없습니다.");
       }
     } catch (error) {
       console.error('현재 수강 과정 조회 실패:', error);
     }
   };

   fetchCurrentCourse();
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
    }
  }, [currentCourse, fetchAllPeriodData]);

 if (error) {
   return (
     <StudentLayout>
       <div className="p-6 text-red-500">{error}</div>
     </StudentLayout>
   );
 }

 return (
   <StudentLayout>
     <StudentMainHeader courseInfo={currentCourse} />
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
         p-4 bg-[#F9F7F7] rounded-lg
       `}>
         <div className="mt-2 pb-4 w-full h-full">
           <h3
             className="mb-4 text-xl font-bold">{selectedDate} {dayOfWeek}</h3>

             {/* 현재날짜: 입실/퇴실 버튼 */}
             {selectedDate === today ? (
               <>
                 {/* 입실하기 Button */}
                 {enterTime ? (
                   <div className="mb-4 text-sm text-gray-700">
                     입실시간: {enterTime}
                   </div>) : (
                   <button
                     className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-2 rounded mb-4 transition-colors duration-200"
                     onClick={handleAttendanceClick(true)} // 입실 처리 핸들러
                   >
                     입실하기
                   </button>
                 )}


                 {/* 퇴실하기 Button */}
                 {exitTime ? (
                   <div className="mb-6 text-sm text-gray-700">
                     퇴실시간: {exitTime}
                   </div>
                 ) : (
                   <button
                     className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded mb-6 transition-colors duration-200"
                     onClick={handleAttendanceClick(false)} // 퇴실 처리 핸들러
                   >
                     퇴실하기
                   </button>
                 )}
               </>
             ) : selectedDate < today ? (
               <>
                 {/*과거 날짜인 경우: 출석 상태*/}
               <div className="overflow-auto max-h-96">
                 <table
                   className="table-auto w-full border-collapse bg-white">
                   <thead>
                     <tr className="bg-gray-50">
                       <th
                         className="border px-4 py-2 text-sm font-semibold text-gray-700">교시
                       </th>
                       <th
                         className="border px-4 py-2 text-sm font-semibold text-gray-700">출석
                       </th>
                     </tr>
                   </thead>
                   <tbody>
                     {attendanceData.length > 0 ? (
                       attendanceData.map((entry, index) => (
                         <tr key={index} className="border-b hover:bg-gray-50">
                           <td className="border text-center text-sm py-3">
                             {entry.periodName}
                           </td>
                           <td className="border">
                             <div
                               className="flex items-center justify-center h-full min-h-[2.5rem]">
                               {entry.status !== null ? (
                                 <div
                                   className="flex items-center justify-center">
                              <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm
                                ${entry.status === '출석' ? 'text-green-600' :
                                entry.status === '지각' ? 'text-orange-600' :
                                  'text-red-600'}`
                              }>
                                {getStatusIcon(entry.status)}
                              </span>
                                 </div>
                               ) : (
                                 <span>
                                   해당 날짜의 출석 정보가 없습니다.
                                 </span>
                               )}
                             </div>
                           </td>
                         </tr>
                       ))
                     ) : (
                       <tr>
                         <td colSpan="2"
                             className="text-center text-gray-500 text-sm py-4">
                           출석 데이터가 없습니다.
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             </>
             ) : null}

             {/* 공통 시간표*/}
             <div className="overflow-auto max-h-96">
               <h2>{dayOfWeek} 시간표</h2>
               {filteredPeriodData.length > 0 ? (
                 <table
                   className="table-auto w-full border-collapse bg-white">
                   <thead>
                   <tr className="bg-gray-50">
                     <th
                       className="border px-4 py-2 text-sm font-semibold text-gray-700">교시
                     </th>
                     <th
                       className="border px-4 py-2 text-sm font-semibold text-gray-700">시작
                       시간
                     </th>
                     <th
                       className="border px-4 py-2 text-sm font-semibold text-gray-700">종료
                       시간
                     </th>
                   </tr>
                   </thead>
                   <tbody>
                   {filteredPeriodData.map((entry, index) => (
                     <tr key={index} className="text-center">
                       <td className="border text-center text-sm py-3">
                         {entry.name}
                       </td>
                       <td className="border text-center text-sm py-3">
                         {entry.startTime.split(":").slice(0,2).join(":")}
                       </td>
                       <td className="border text-center text-sm py-3">
                         {entry.endTime.split(":").slice(0,2).join(":")}
                       </td>
                     </tr>
                   ))}
                   </tbody>
                 </table>
               ) : (
                 <p>해당 날짜의 시간표가 없습니다.</p>
               )}
             </div>
         </div>
       </div>
       {/* ===== ATTENDANCE UI SECTION END ===== */}
     </div>
   </StudentLayout>
 );
};

export default StudentMainPage;