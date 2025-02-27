import React, { useState } from 'react';

const AttendancePrintPage = ({
  data,
  centerName = '송파여성새로일하기센터',
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = data?.pages?.length + 1; // +1은 요약 페이지
  // 현재 페이지가 마지막 인덱스보다 크면 요약 페이지 표시
  const isSummaryPage = currentPage >= data?.pages?.length;
  const currentPageData = isSummaryPage ? null : data?.pages[currentPage];  // PrintAttendanceDTO 형태

  if (!data) {
    return (
      <div className="text-center text-gray-500 p-8">
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  console.log('출석부 데이터:', data);

  const {
    termLabel,
    startDate,
    endDate,
    termStartDate,
    termEndDate,
    courseName,
    pages,
    summaryPage,
  } = data;

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    const parsedDate = new Date(date);
    return `${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()} 일`; // 1을 더해야 하는지 월에?
  };
  const handlePrevPage = () => {

    setCurrentPage(prev => Math.max(0, prev - 1));
  };
  const handleNextPage = () => {

    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case '출석':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
               fill="#14AE5C" className="bi bi-circle" viewBox="0 0 16 16">
            <path
              d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
          </svg>
        );
      case '지각':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
               fill="#BF6A02" className="bi bi-triangle" viewBox="0 0 16 16">
            <path
              d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
          </svg>
        );
      case '결석':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
               fill="#EC221F" className="bi bi-x-lg" viewBox="0 0 16 16">
            <path
              d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
          </svg>
        );
      case '조퇴':
        return '조퇴';
      default:
        return '-';
    }
  };



  return (
    <div className="w-full p-4 mb-8 print:mb-0 print:p-2">
      {/* A4 사이즈에 맞춘 컨테이너 max-w-[210mm] mx-auto  */}
      {!isSummaryPage ? (
        <div
          className="max-w-[210mm] mx-auto border border-gray-800 overflow-y-auto overflow-x-auto">
          {/* 헤더 영역 */}
          <div className="w-full border-gray-800">
            <div className="mb-4 text-center text-xl font-bold">
              출 석 부
            </div>
            {/*flex justify-between text-sm*/}
            <div className="grid grid-cols-4 text-sm mb-2">
              <div className="p-2">센터명: {centerName}</div>
              <div className="p-2">과정명: {courseName}</div>
              <div className="p-2">기간: {startDate} - {endDate}</div>
              <div className="p-2">{termLabel}: {termStartDate} - {termEndDate}</div>
            </div>
          </div>

          {/* 출석부 테이블 */}

          <table className="w-full border border-gray-800 text-xs">
            {/* 날짜 헤더 */}
            <thead>
            <tr className="border-b border-gray-800">
              <th rowSpan="3"
                  className="border-r border-gray-800 w-12 text-center">번호
              </th>
              <th
                className="border-r border-gray-800 text-center min-w-20 w-20 h-6">날짜
              </th>
              {currentPageData?.students[0]?.dailyAttendance.map((day) => (
                <th key={day.date} colSpan="8"
                    className="border border-gray-800 p-1 w-4 min-w-4">
                  {formatDate(day.date)}
                </th>
              ))}
              <th rowSpan="3"
                  className="border border-gray-800 [writing-mode:vertical-rl] text-center w-6 h-24">소정출석일
              </th>
              <th rowSpan="3"
                  className="border border-gray-800  [writing-mode:vertical-rl] text-center w-6 h-24">실제출석일
              </th>
              <th rowSpan="3"
                  className="border border-gray-800 [writing-mode:vertical-rl] text-center w-6 h-24">결석
              </th>
              <th rowSpan="3"
                  className="border border-gray-800  [writing-mode:vertical-rl] text-center w-6 h-24">지각
              </th>
              <th rowSpan="3"
                  className="border border-gray-800  [writing-mode:vertical-rl] text-center w-6 h-24">조퇴
              </th>
              <th rowSpan="3"
                  className="border border-gray-800  [writing-mode:vertical-rl] text-center w-6 h-24">확인
              </th>
            </tr>
            <tr>
              <th
                className="border-r border-gray-800 text-center min-w-20 w-20 h-6">
                결재
              </th>
              {currentPageData?.students[0]?.dailyAttendance.map((day, idx) => (
                <th
                  colSpan="8"
                  key={`approval-${idx}`}
                  className="border border-gray-800 h-6"
                ></th>
              ))}
            </tr>
            {/* 교시 헤더 */}
            <tr className="border-b border-gray-800">
              <th
                className="border border-r border-gray-800 min-w-20 w-20 text-center h-6">성명
              </th>
              {currentPageData?.students[0]?.dailyAttendance.map((day) =>
                Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                  <th key={`${day.date}-${num}`}
                      className="border border-gray-800 min-w-5 w-5 text-center text-sm">
                    {num}
                  </th>
                )),
              )}
            </tr>
            </thead>

            {/* 학생 목록 및 출석 체크 영역 */}
            <tbody>
            {currentPageData?.students?.map((student, idx) => (
              <tr key={`${idx}-${student.studentId}`}
                  className="border-b border-gray-800">
                <td className="border-r border-gray-800 p-2 text-center">
                  {idx + 1}
                </td>
                <td
                  className="border-r border-gray-800 text-center min-w-20 w-20">{student.studentName}</td>
                {student.dailyAttendance.map((day) => {
                  // 각 날짜별로 모든 교시(1-8)에 대한 셀을 생성
                  const periodMap = {};
                  day.periods.forEach(period => {
                    periodMap[period.period] = period.status;
                  });

                  return Array.from({ length: 8 }, (_, i) => i + 1).map(
                    periodNum => (
                      <td key={`${day.date}-${periodNum}`}
                          className="border border-gray-800 text-center">
                        {getStatusIcon(periodMap[periodNum] || '-')}
                      </td>
                    ));
                })}
                {/* 통계 열 추가 */}
                <td
                  className="border border-gray-800 p-2 text-center">{student.processedDays}
                </td>
                <td
                  className="border border-gray-800 p-2 text-center">{student.realAttendDays}
                </td>
                <td
                  className="border border-gray-800 p-2 text-center">{student.absentCount}
                </td>
                <td
                  className="border border-gray-800 p-2 text-center">{student.lateCount}
                </td>
                <td
                  className="border border-gray-800 p-2 text-center">{student.earlyLeaveCount}
                </td>
              </tr>
            ))}
            </tbody>
          </table>

          {/* 페이지 번호 (테이블 하단 중앙) */}
          <div className="flex justify-center mt-4 mb-2">
            <div className="px-4 py-2 text-sm">
              {currentPage + 1} / {totalPages}
            </div>
          </div>
        </div>
      ) : (
        // 요약 페이지
        <div className="max-w-[210mm] mx-auto border border-gray-800 p-4 overflow-y-auto overflow-x-auto">
          {/* 헤더 영역 */}
          <div className="w-full border-gray-800">
            <div className="mb-4 text-center text-xl font-bold">
              출석 요약
            </div>
            {/*flex justify-between text-sm*/}
            <div className="grid grid-cols-3 text-sm mb-2">
              <div className="p-2">센터명: {centerName}</div>
              <div className="p-2">과정명: {courseName}</div>
              <div className="p-2">기간: {startDate} - {endDate}</div>
              <div
                className="p-2">{termLabel}: {termStartDate} - {termEndDate}</div>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
            <tr className="bg-gray-50">
              <th className="p-3 border">번호</th>
              <th className="p-3 border">학생명</th>
              <th className="p-3 border">과목명</th>
              <th className="p-3 border">소정근무일수</th>
              <th className="p-3 border">실제근무일수</th>
              <th className="p-3 border">결석</th>
              <th className="p-3 border">지각</th>
              <th className="p-3 border">조퇴</th>
              <th className="p-3 border">출석률</th>
            </tr>
            </thead>
            <tbody>
            {summaryPage?.studentSummaries.map((student, idx) => (
              <tr key={student.studentId}>
                <td className="p-3 border border-gray-800 text-center">{idx
                  + 1}</td>
                <td className="p-3 border">{student.studentName}</td>
                <td className="p-3 border">{courseName}</td>
                <td
                  className="p-3 border text-center">{student.totalWorkingDays}일
                </td>
                <td className="p-3 border text-center">{student.attendanceDays}일
                </td>
                <td className="p-3 border text-center">{student.absentDays}일
                </td>
                <td className="p-3 border text-center">{student.lateDays}회</td>
                <td className="p-3 border text-center">{student.earlyLeaveDays}회
                </td>
                <td
                  className="p-3 border text-center">{student.attendanceRate.toFixed(
                  1)}%
                </td>
              </tr>
            ))}
            </tbody>
          </table>
          {/* 페이지 번호 (테이블 하단 중앙) */}
          <div className="flex justify-center mt-4 mb-2">
            <div className="px-4 py-2 text-sm">
              {currentPage + 1} / {totalPages}
            </div>
          </div>
        </div>
      )}

      {/* 페이지 네비게이션 버튼 (인쇄 시에는 숨김) */}
      <div className="flex justify-between mt-4 print:hidden">
        <button onClick={handlePrevPage} disabled={currentPage === 0}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          이전 페이지
        </button>
        <button onClick={handleNextPage}
                disabled={currentPage === totalPages - 1}
                className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          다음 페이지
        </button>
      </div>

      {/*//TODO: 위에 적었던 양식 복붙하기(최종버전으로-출력 잘 나오는지 확인하고)      */}

      {/* 인쇄용 모든 페이지 (화면에서는 숨김) */}
      <div className="hidden print:block">
        {pages?.map((page, pageIdx) => (
          <div key={pageIdx}
               className={pageIdx < pages.length - 1 ? 'page-break' : ''}>
            <div className="max-w-[210mm] mx-auto border border-gray-800">
              {/* 헤더 영역 */}
              <div className="border-b border-gray-800">
                <div className="mb-4 text-center text-xl font-bold">
                  출 석 부
                </div>
                {/*flex justify-between text-sm*/}
                <div className="grid grid-cols-3 text-sm mb-2">
                  <div className="p-2">센터명: {centerName}</div>
                  <div className="p-2">과정명: {courseName}</div>
                  <div className="p-2">기간: {startDate} - {endDate}</div>
                  <div
                    className="p-2">{termLabel}: {termStartDate} - {termEndDate}</div>
                </div>
              </div>

              {/* 출석부 테이블 */}
              <table className="w-full border border-gray-800 text-xs">
                {/* 날짜 헤더 */}
                <thead>
                <tr className="border-b border-gray-800">
                  <th rowSpan="3"
                      className="border-r border-gray-800 w-12 text-center">번호
                  </th>
                  <th
                    className="border-r border-gray-800 w-12 text-center">날짜
                  </th>
                  {page?.students[0]?.dailyAttendance.map((day) => (
                    <th key={day.date} colSpan="8"
                        className="border border-gray-800 p-1 w-4 min-w-4">
                      {formatDate(day.date)}
                    </th>
                  ))}
                  <th rowSpan="3"
                      className="border border-gray-800 [writing-mode:vertical-rl] w-6 h-24">소정출석일
                  </th>
                  <th rowSpan="3"
                      className="border border-gray-800 [writing-mode:vertical-rl] w-6 h-24">실제출석일
                  </th>
                  <th rowSpan="3"
                      className="border border-gray-800 [writing-mode:vertical-rl] w-6 h-24">결석
                  </th>
                  <th rowSpan="3"
                      className="border border-gray-800 [writing-mode:vertical-rl] w-6 h-24">지각
                  </th>
                  <th rowSpan="3"
                      className="border border-gray-800 [writing-mode:vertical-rl] w-6 h-24">조퇴
                  </th>
                  <th rowSpan="3"
                      className="border border-gray-800 [writing-mode:vertical-rl] w-6 h-24">확인
                  </th>
                </tr>
                <tr>
                  <th className="border-r border-gray-800 text-center min-w-20 w-20 h-6">
                    결재
                  </th>
                  {page?.students[0]?.dailyAttendance.map((day, idx) => (
                    <th key={`approval-print-${idx}`} colSpan="8"
                        className="border border-gray-800 h-6"></th>
                  ))}
                </tr>
                {/* 교시 헤더 */}
                <tr className="border-b border-gray-800">
                  <th className="border border-r border-gray-800 min-w-20 w-20 text-center h-6">교시</th>
                  {page?.students[0]?.dailyAttendance.map((day) =>
                    Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                      <th key={`${day.date}-${num}`}
                          className="border border-gray-800 min-w-5 w-5 text-center text-sm">
                        {num}
                      </th>
                    )),
                  )}
                </tr>
                </thead>

                {/* 학생 목록 및 출석 체크 영역 */}
                <tbody>
                {page?.students?.map((student, idx) => (
                  <tr key={`${idx}-${student.studentId}-print`}
                      className="border-b border-gray-800">
                    <td className="border-r border-gray-800 p-2 text-center">
                      {idx + 1}
                    </td>
                    <td
                      className="border-r border-gray-800 text-center min-w-20 w-20">{student.studentName}</td>
                    {student.dailyAttendance.map((day) => {
                      // 각 날짜별로 모든 교시(1-8)에 대한 셀을 생성
                      const periodMap = {};
                      day.periods.forEach(period => {
                        periodMap[period.period] = period.status;
                      });

                      return Array.from({ length: 8 }, (_, i) => i + 1).map(
                        periodNum => (
                          <td key={`${day.date}-${periodNum}`}
                              className="border border-gray-800 text-center">
                            {getStatusIcon(periodMap[periodNum] || '-')}
                          </td>
                        ));
                    })}
                    {/* 통계 열 추가 */}
                    {/*//TODO: 이 부분도 위에서 잘 나오는지 보고 교체하기 */}
                    <td
                      className="border border-gray-800 p-2 text-center">{student.processedDays}회
                    </td>
                    <td
                      className="border border-gray-800 p-2 text-center">{student.realAttendDays}회
                    </td>
                    <td
                      className="border border-gray-800 p-2 text-center">{student.absentCount}회
                    </td>
                    <td
                      className="border border-gray-800 p-2 text-center">{student.lateCount}회
                    </td>
                    <td
                      className="border border-gray-800 p-2 text-center">{student.earlyLeaveCount}회
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>

              {/* 페이지 번호 (테이블 하단 중앙) */}
              <div className="flex justify-center mt-4 mb-2">
                <div className="px-4 py-2 text-sm">
                  {pageIdx + 1} / {totalPages}
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* 요약 페이지 인쇄용*/}
        <div className="page-break">
          <div className="max-w-[210mm] mx-auto border border-gray-800 p-4">
            <div className="w-full border-gray-800">
              <div className="mb-4 text-center text-xl font-bold">
                출석 요약
              </div>
              {/*flex justify-between text-sm*/}
              <div className="grid grid-cols-3 text-sm mb-2">
                <div className="p-2">센터명: {centerName}</div>
                <div className="p-2">과정명: {courseName}</div>
                <div className="p-2">기간: {startDate} - {endDate}</div>
                <div
                  className="p-2">{termLabel}: {termStartDate} - {termEndDate}</div>
              </div>
            </div>


            <table className="w-full border-collapse">
              <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border border-gray-800">번호</th>
                <th className="p-3 border border-gray-800">학생명</th>
                <th className="p-3 border border-gray-800">과목명</th>
                <th className="p-3 border border-gray-800">소정출석일수</th>
                <th className="p-3 border border-gray-800">실제출석일수</th>
                <th className="p-3 border border-gray-800">결석</th>
                <th className="p-3 border border-gray-800">지각</th>
                <th className="p-3 border border-gray-800">조퇴</th>
                <th className="p-3 border border-gray-800">출석률</th>
              </tr>
              </thead>
              <tbody>
              {/*//TODO: DTO 에서 잘 가지고 오는 지 확인하기*/}
              {summaryPage?.studentSummaries.map((student, idx) => (
                <tr key={`${student.studentId}-print-summary`}>
                  <td className="p-3 border border-gray-800 text-center">{idx
                    + 1}</td>
                  <td
                    className="p-3 border border-gray-800 text-center">{student.studentName}</td>
                  <td
                    className="p-3 border border-gray-800 text-center">{courseName}</td>
                  <td
                    className="p-3 border border-gray-800 text-center">{student.totalWorkingDays}일
                  </td>
                  <td
                    className="p-3 border border-gray-800 text-center">{student.attendanceDays}일
                  </td>
                  <td
                    className="p-3 border border-gray-800 text-center">{student.absentDays}일
                  </td>
                  <td
                    className="p-3 border border-gray-800 text-center">{student.lateDays}회
                  </td>
                  <td
                    className="p-3 border border-gray-800 text-center">{student.earlyLeaveDays}회
                  </td>
                  <td
                    className="p-3 border border-gray-800 text-center">{student.attendanceRate.toFixed(
                    1)}%
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
            {/* 페이지 번호 (테이블 하단 중앙) */}
            <div className="flex justify-center mt-4 mb-2">
              <div className="px-4 py-2 text-sm">
                {pages.length + 1} / {totalPages}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  );
};

export default AttendancePrintPage;