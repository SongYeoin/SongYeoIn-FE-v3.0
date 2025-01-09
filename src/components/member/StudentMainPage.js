// components/member/StudentMainPage.js
import React, { useEffect, useState } from 'react';
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
       setAttendanceData(response.data);
     } catch (error) {
       console.error("출석 데이터를 가져오는데 실패했습니다:", error);
     }
   }
 };

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
       if (error.response && error.response.data) {
         const errorMessage = error.response.data.message;
         alert(errorMessage);
       } else {
         alert("출석 처리 중 문제가 발생했습니다.");
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

 useEffect(() => {
   fetchAttendanceData();
 }, [selectedDate, currentCourse]);

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
                             <td className="border text-center">
                               {entry.periodName}
                             </td>
                             <td className="flex items-center justify-center">
                               {entry.status !== null ? (
                                 getStatusIcon(entry.status)
                               ) : (
                                 <button
                                   className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-2 rounded"
                                   onClick={() => handleAttendanceClick(entry.periodId)}
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
       {/* ===== ATTENDANCE UI SECTION END ===== */}
     </div>
   </StudentLayout>
 );
};

export default StudentMainPage;