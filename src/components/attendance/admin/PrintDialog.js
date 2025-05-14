import React, { useEffect, useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import AttendancePrintPage from './AttendancePrintPage';

const PrintDialog = ({
  isOpen,
  onClose,
  courseName,
  terms,
  selectedTerm,
  attendanceData,
  isLoading,
  onTermSelect,
}) => {
  const [attendancePrintData, setAttendancePrintData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (selectedTerm && attendanceData) {
      // 데이터를 처리하여 5일치씩 페이지로 나누기
      const processedData = processAttendanceData(attendanceData);
      setAttendancePrintData(processedData);
    }
  }, [selectedTerm, attendanceData]);

  // 출석 데이터를 5일치씩 페이지로 나누는 함수
  const processAttendanceData = (data) => {
    if (!data || !data.students || data.students.length === 0) {
      return data;
    }

    // 일별 출석 데이터 정렬 (날짜순)
    const sortedDates = [...new Set(
      data.students.flatMap(student =>
        student.dailyAttendance.map(day => day.date)
      )
    )].sort((a, b) => new Date(a) - new Date(b));

    // 5일씩 묶어서 페이지 나누기
    const pageSize = 5;
    const pageCount = Math.ceil(sortedDates.length / pageSize);
    const pages = [];

    for (let i = 0; i < pageCount; i++) {
      const pageStartIdx = i * pageSize;
      const pageEndIdx = Math.min((i + 1) * pageSize, sortedDates.length);
      const pageDates = sortedDates.slice(pageStartIdx, pageEndIdx);

      // 현재 페이지에 표시할 학생 데이터 필터링
      const pageStudents = data.students.map(student => {
        const filteredAttendance = student.dailyAttendance.filter(day =>
          pageDates.includes(day.date)
        );

        return {
          ...student,
          dailyAttendance: filteredAttendance
        };
      });

      pages.push({
        students: pageStudents,
        dates: pageDates
      });
    }

    // 요약 데이터 생성 (이 부분이 추가됨)
    const summaryPage = {
      studentSummaries: data.students.map(student => ({
        studentId: student.studentId,
        studentName: student.studentName,
        totalWorkingDays: student.processedDays || 0,
        attendanceDays: student.realAttendDays || 0,
        absentDays: student.absentCount || 0,
        lateDays: student.lateCount || 0,
        earlyLeaveDays: student.earlyLeaveCount || 0,
        attendanceRate: student.attendanceRate ||
          ((student.realAttendDays / (student.processedDays || 1)) * 100) || 0
      }))
    };

    return {
      ...data,
      courseName,
      termLabel: selectedTerm['차수'] || '1차', // 기본값 설정
      startDate: data.startDate || selectedTerm['시작일'],
      endDate: data.endDate || selectedTerm['종료일'],
      termStartDate: selectedTerm['시작일'],
      termEndDate: selectedTerm['종료일'],
      pages,
      summaryPage
    };
  };



  // 전체 페이지 수 계산
  const totalPages = attendancePrintData?.pages?.length
    ? attendancePrintData.pages.length + 1  // +1은 요약 페이지
    : 0;

  // 현재 페이지 데이터
  const isSummaryPage = currentPage >= (attendancePrintData?.pages?.length || 0);
  const currentPageData = isSummaryPage
    ? null
    : attendancePrintData?.pages?.[currentPage];

  const handlePrint = () => {
    if (!attendancePrintData) {
      alert('출력할 데이터가 없습니다. 차수를 선택해주세요.');
      return;
    }

    setIsPrinting(true);

    // 인쇄를 위한 타임아웃 설정 - DOM에 인쇄 컨텐츠가 렌더링될 시간을 주기 위함
    setTimeout(() => {
      window.print();

      // 인쇄 다이얼로그가 닫힌 후 isPrinting 상태 복원
      setTimeout(() => {
        setIsPrinting(false);
      }, 500);
    }, 300);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    const parsedDate = new Date(date);
    return `${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일`;
  };

  // 출석 상태 아이콘 생성 함수
  const getStatusIcon = (status) => {
    switch (status) {
      case '출석':
        return '○';
      case '지각':
        return '△';
      case '결석':
        return '✕';
      case '조퇴':
        return '조퇴';
      default:
        return '-';
    }
  };

  // 모달 외부 클릭 시 닫기
  /*const handleOutsideClick = (e) => {
    if (e.target.className.includes('modal-overlay')) {
      onClose();
    }
  };*/

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // 실제 데이터가 있는 날만 카운트하는 함수
  const calculateActualAttendanceDays = (dailyAttendance) => {
    // 데이터가 있는 날짜만 필터링
    const daysWithData = dailyAttendance.filter(day =>
      day.periods && day.periods.some(period => period.status)
    );
    return daysWithData.length;
  };

  // 학생의 출석 통계를 계산하는 함수
  const calculateStudentStats = (student) => {
    // 실제 출석 데이터가 있는 날짜 수 계산
    const totalActualDays = calculateActualAttendanceDays(
      student.dailyAttendance);

    // 결석, 지각, 조퇴 횟수 계산
    const absentCount = student.absentCount;
    const lateCount = student.lateCount;
    const earlyLeaveCount = student.earlyLeaveCount;

    // 지각과 조퇴를 합쳐서 3번 이상일 경우 결석으로 처리
    const latePlusEarlyLeave = lateCount + earlyLeaveCount;
    const additionalAbsentDays = Math.floor(latePlusEarlyLeave / 3);

    // 출석해야 할 총 일수에서 결석과 지각/조퇴로 인한 추가 결석을 뺀 값
    const finalAttendanceDays = totalActualDays - absentCount
      - additionalAbsentDays;

    return {
      totalActualDays,
      absentCount,
      lateCount,
      earlyLeaveCount,
      additionalAbsentDays,
      finalAttendanceDays,
    };
  };

  return (
    <div>
      {/* 화면에 보여지는 모달 (인쇄 시에는 숨김) */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[9999] overflow-y-auto modal-overlay ${isPrinting
          ? 'print-hide' : ''}`}
        //onClick={handleOutsideClick}
        style={{ display: isPrinting ? 'none' : 'flex' }}
      >
        <div
          className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg my-10 overflow-y-auto modal-container"
          style={{
            minHeight: 'min-content',
            maxHeight: '90vh',
            margin: '5vh auto',
          }}>
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">출석부 인쇄</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {terms && terms.length > 0 ? (
                  terms.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => onTermSelect(term)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                      ${selectedTerm && selectedTerm['차수'] === term['차수']
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {term['차수']}
                      <span className="ml-2 text-xs">
                        ({term['시작일']}~{term['종료일']})
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="text-gray-500">차수 정보가 없습니다.</div>
                )}
              </div>

              <button
                onClick={handlePrint}
                disabled={!selectedTerm || isLoading}
                className="ml-4 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center justify-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                출석부 인쇄하기
              </button>
            </div>

            {/* 출석부 내용 영역 - 미리보기용 (인쇄 시 제외) */}
            <div className="border rounded-lg p-4 mt-4">
              {isLoading ? (
                <div
                  className="flex items-center justify-center p-8 text-gray-500">
                  <div
                    className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                  데이터를 불러오는 중입니다...
                </div>
              ) : !attendancePrintData ? (
                <div className="text-center text-gray-500 p-8">
                  차수를 선택하면 출석부가 표시됩니다.
                </div>
              ) : (
                <div className="w-full p-4 mb-8">
                  {/* 미리보기용 출석부 (인쇄 시 제외) */}
                  {!isSummaryPage ? (
                    <div
                      className="max-w-[210mm] mx-auto border border-gray-800 overflow-x-auto">
                      {/* 헤더 영역 */}
                      <div className="w-full border-b border-gray-800 p-4">
                        <div className="mb-4 text-center text-xl font-bold">
                          출 석 부
                        </div>
                        <div className="grid grid-cols-4 text-sm mb-2">
                          <div
                            className="p-2">센터명: {attendancePrintData.centerName
                            || '송파여성새로일하기센터'}</div>
                          <div
                            className="p-2">과정명: {attendancePrintData.courseName
                            || courseName}</div>
                          <div
                            className="p-2">기간: {attendancePrintData.startDate} - {attendancePrintData.endDate}</div>
                          <div
                            className="p-2">{attendancePrintData.termLabel}: {attendancePrintData.termStartDate} - {attendancePrintData.termEndDate}</div>
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
                          {currentPageData?.students[0]?.dailyAttendance.map(
                            (day) => (
                              <th key={day.date} colSpan="8"
                                  className="border border-gray-800 p-1 w-4 min-w-4">
                                {formatDate(day.date)}
                              </th>
                            ))}
                          <th rowSpan="3"
                              className="border border-gray-800 [writing-mode:vertical-rl] text-center w-6 h-24">소정출석일
                          </th>
                          <th rowSpan="3"
                              className="border border-gray-800 [writing-mode:vertical-rl] text-center w-6 h-24">실제출석일
                          </th>
                          <th rowSpan="3"
                              className="border border-gray-800 [writing-mode:vertical-rl] text-center w-6 h-24">결석
                          </th>
                          <th rowSpan="3"
                              className="border border-gray-800 [writing-mode:vertical-rl] text-center w-6 h-24">지각
                          </th>
                          <th rowSpan="3"
                              className="border border-gray-800 [writing-mode:vertical-rl] text-center w-6 h-24">조퇴
                          </th>
                          <th rowSpan="3"
                              className="border border-gray-800 [writing-mode:vertical-rl] text-center w-6 h-24">확인
                          </th>
                        </tr>
                        <tr>
                          <th
                            className="border-r border-gray-800 text-center min-w-20 w-20 h-6">결재
                          </th>
                          {currentPageData?.students[0]?.dailyAttendance.map(
                            (day, idx) => (
                              <th colSpan="8" key={`approval-${idx}`}
                                  className="border border-gray-800 h-6"></th>
                            ))}
                        </tr>
                        {/* 교시 헤더 */}
                        <tr className="border-b border-gray-800">
                          <th
                            className="border border-r border-gray-800 min-w-20 w-20 text-center h-6">성명
                          </th>
                          {currentPageData?.students[0]?.dailyAttendance.map(
                            (day) =>
                              Array.from({ length: 8 }, (_, i) => i + 1).map(
                                (num) => (
                                  <th key={`${day.date}-${num}`}
                                      className="border border-gray-800 min-w-5 w-5 text-center text-sm">
                                    {num}
                                  </th>
                                ))
                          )}
                        </tr>
                        </thead>

                        {/* 학생 목록 및 출석 체크 영역 */}
                        <tbody>
                        {currentPageData?.students?.map((student, idx) => (
                          <tr key={`${idx}-${student.studentId}`}
                              className="border-b border-gray-800">
                            <td
                              className="border-r border-gray-800 p-2 text-center">{idx
                              + 1}</td>
                            <td
                              className="border-r border-gray-800 text-center min-w-20 w-20">{student.studentName}</td>
                            {student.dailyAttendance.map((day) => {
                              // 각 날짜별로 모든 교시(1-8)에 대한 셀을 생성
                              const periodMap = {};
                              day.periods.forEach(period => {
                                periodMap[period.period] = period.status;
                              });

                              return Array.from({ length: 8 },
                                (_, i) => i + 1).map(
                                periodNum => (
                                  <td key={`${day.date}-${periodNum}`}
                                      className="border border-gray-800 text-center">
                                    {getStatusIcon(periodMap[periodNum] || '-')}
                                  </td>
                                )
                              );
                            })}
                            {/* 통계 열 추가 */}
                            <td
                              className="border border-gray-800 p-2 text-center">{student.processedDays}</td>
                            <td
                              className="border border-gray-800 p-2 text-center">
                              {(() => {
                                // 학생 통계 계산
                                const stats = calculateStudentStats(student);
                                // 실제 출석일수 (결석과 지각/조퇴로 인한 추가 결석을 제외한 최종 출석일)
                                return stats.finalAttendanceDays;
                              })()}
                            </td>
                            <td
                              className="border border-gray-800 p-2 text-center">{student.absentCount}</td>
                            <td
                              className="border border-gray-800 p-2 text-center">{student.lateCount}</td>
                            <td
                              className="border border-gray-800 p-2 text-center">{student.earlyLeaveCount}</td>
                            <td
                              className="border border-gray-800 p-2 text-center"></td>
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
                    // 요약 페이지 미리보기
                    <div
                      className="max-w-[210mm] mx-auto border border-gray-800 p-4">
                      {/* 헤더 영역 */}
                      <div className="w-full border-gray-800">
                        <div className="mb-4 text-center text-xl font-bold">
                          출석 요약
                        </div>
                        <div className="grid grid-cols-4 text-sm mb-2">
                          <div
                            className="p-2">센터명: {attendancePrintData.centerName
                            || '송파여성새로일하기센터'}</div>
                          <div
                            className="p-2">과정명: {attendancePrintData.courseName
                            || courseName}</div>
                          <div
                            className="p-2">기간: {attendancePrintData.startDate} - {attendancePrintData.endDate}</div>
                          <div
                            className="p-2">{attendancePrintData.termLabel}: {attendancePrintData.termStartDate} - {attendancePrintData.termEndDate}</div>
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
                        {attendancePrintData.summaryPage?.studentSummaries.map(
                          (student, idx) => (
                            <tr key={student.studentId}>
                              <td
                                className="p-3 border border-gray-800 text-center">{idx
                                + 1}</td>
                              <td
                                className="p-3 border border-gray-800">{student.studentName}</td>
                              <td
                                className="p-3 border border-gray-800">{attendancePrintData.courseName
                                || courseName}</td>
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
                          {currentPage + 1} / {totalPages}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 페이지 네비게이션 버튼 (인쇄 시에는 숨김) */}
                  <div className="flex justify-between mt-4">
                    <button onClick={handlePrevPage}
                            disabled={currentPage === 0}
                            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      이전 페이지
                    </button>
                    <button onClick={handleNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      다음 페이지
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 모달 푸터 */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* 인쇄용 컴포넌트 */}
      {attendancePrintData && (
        <div
          className={isPrinting ? 'print-only' : 'print-only-hidden'}
          style={{ display: isPrinting ? 'block' : 'none' }}
          ref={printRef}
        >
          <AttendancePrintPage
            data={attendancePrintData}
            centerName={attendancePrintData.centerName || '송파여성새로일하기센터'}
          />
        </div>
      )}


    </div>
  );
};

/*
* .page-break-after {
            page-break-after: always;
            }

            table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        th, td {
          border: 1px solid #333;
          padding: 4px;
          text-align: center;
          vertical-align: middle;
          font-size: 10px;
        }

        th {
          background-color: #f3f4f6;
        }
*
* */

export default PrintDialog;