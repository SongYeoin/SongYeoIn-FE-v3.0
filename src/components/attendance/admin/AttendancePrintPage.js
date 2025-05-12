import React from 'react';
import '../../../styles/print.css';

// 인쇄용 출석부 컴포넌트
const AttendancePrintPage = ({
  data,
  centerName = '송파여성새로일하기센터',
}) => {
  if (!data) {
    return null;
  }

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
    return `${parsedDate.getMonth() + 1}월 ${parsedDate.getDate()}일`;
  };

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
        return ' ';
    }
  };

  // 실제 데이터가 있는 날만 카운트하는 함수
  const calculateActualAttendanceDays = (dailyAttendance) => {
    // 데이터가 있는 날짜만 필터링
    const daysWithData = dailyAttendance.filter(day =>
      day.periods && day.periods.some(period => period.status)
    );
    return daysWithData.length;
  };

  // 항상 15명의 학생 행을 생성하는 함수 - 빈 행 클래스 추가
  const renderStudentRows = (pageStudents, dailyAttendanceTemplate) => {
    // 항상 15개의 행을 만들기 위한 배열
    const rows = Array(15).fill(null);

    // 실제 학생 데이터로 배열 채우기
    pageStudents.forEach((student, idx) => {
      rows[idx] = student;
    });

    // 15개의 행 렌더링 (빈 행 포함)
    return rows.map((student, idx) => {
      if (student) {
        // 실제 학생 데이터가 있는 경우
        return (
          <tr key={`student-${idx}-${student.studentId || idx}`}>
            <td className="number-cell">{idx + 1}</td>
            <td className="name-cell">{student.studentName}</td>
            {student.dailyAttendance.map((day) => {
              // 각 날짜별로 모든 교시(1-8)에 대한 셀을 생성
              const periodMap = {};
              day.periods.forEach(period => {
                periodMap[period.period] = period.status;
              });

              return Array.from({ length: 8 }, (_, i) => i + 1).map(
                periodNum => (
                  <td key={`status-${day.date}-${periodNum}`} className="status-cell">
                    {getStatusIcon(periodMap[periodNum] || '-')}
                  </td>
                )
              );
            })}
            {/* 통계 열 추가 */}
            <td className="stat-cell">{student.processedDays}</td>
            <td className="stat-cell">{calculateActualAttendanceDays(student.dailyAttendance)}</td>
            <td className="stat-cell">{student.absentCount}</td>
            <td className="stat-cell">{student.lateCount}</td>
            <td className="stat-cell">{student.earlyLeaveCount}</td>
            <td className="stat-cell"></td>
          </tr>
        );
      } else {
        // 빈 행 생성 (학생 데이터가 없는 경우) - empty-row 클래스 추가
        return (
          <tr key={`empty-student-${idx}`} className="empty-row">
            <td className="number-cell">{idx + 1}</td>
            <td className="name-cell"></td>
            {dailyAttendanceTemplate.map((day) => (
              Array.from({ length: 8 }, (_, i) => i + 1).map(
                periodNum => (
                  <td key={`empty-status-${day.date}-${periodNum}`} className="status-cell">

                  </td>
                )
              )
            ))}
            {/* 빈 통계 열 */}
            <td className="stat-cell"></td>
            <td className="stat-cell"></td>
            <td className="stat-cell"></td>
            <td className="stat-cell"></td>
            <td className="stat-cell"></td>
            <td className="stat-cell"></td>
          </tr>
        );
      }
    });
  };

  // 인쇄용 출력물
  return (
    <div className="print-content">
      {/* 출석부 페이지들 (5일씩 구분) */}
      {(pages || []).map((page, pageIdx) => {

        // 각 페이지별 날짜 데이터 확인
        const pageAttendanceData = page.students
          && page.students[0]?.dailyAttendance;

        // 페이지에 데이터가 없는 경우 처리
        if (!pageAttendanceData || pageAttendanceData.length === 0) {
          return null;
        }

        return (
          <div key={`print-page-${pageIdx}`} className="page-break">
            <div className="attendance-sheet">
              {/* 헤더 영역 */}
              <div className="header">
                <div className="title">출 석 부</div>
                <div className="info-grid">
                  <div>센터명: {centerName}</div>
                  <div>과정명: {courseName}</div>
                  <div>기간: {startDate} - {endDate}</div>
                  <div>{termLabel}: {termStartDate} - {termEndDate}</div>
                </div>
              </div>

              {/* 테이블 컨테이너 추가 */}
              <div className="table-container">
                {/* 출석부 테이블 */}
                <table className="attendance-table">
                  <thead>
                  <tr>
                    <th rowSpan="3" className="number-col">번호</th>
                    <th className="date-header">날짜</th>
                    {pageAttendanceData.map((day) => (
                      <th key={`date-${day.date}`} colSpan="8"
                          className="date-col">
                        {formatDate(day.date)}
                      </th>
                    ))}
                    <th rowSpan="3" className="vertical-text">소정출석일</th>
                    <th rowSpan="3" className="vertical-text">실제출석일</th>
                    <th rowSpan="3" className="vertical-text">결석</th>
                    <th rowSpan="3" className="vertical-text">지각</th>
                    <th rowSpan="3" className="vertical-text">조퇴</th>
                    <th rowSpan="3" className="vertical-text">확인</th>
                  </tr>
                  <tr>
                    <th className="approval-header">결재</th>
                    {pageAttendanceData.map((day, idx) => (
                      <th key={`approval-${idx}`} colSpan="8"
                          className="approval-col"></th>
                    ))}
                  </tr>
                  <tr>
                    <th className="name-header">성명</th>
                    {pageAttendanceData.map((day) =>
                      Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                        <th key={`period-${day.date}-${num}`}
                            className="period-col">
                          {num}
                        </th>
                      ))
                    )}
                  </tr>
                  </thead>
                  <tbody>
                  {renderStudentRows(page.students || [], pageAttendanceData)}
                  </tbody>
                </table>
              </div>

              {/* 페이지 번호 (절대 위치로 바닥에 고정) */}
              <div className="page-footer">
                {pageIdx + 1} / {pages.length + 1}
              </div>
            </div>
          </div>
        );
      })}

      {/* 요약 페이지 (마지막 페이지) */}
      {summaryPage && (
      <div className="page-break">
        <div className="summary-sheet">
          <div className="header">
            <div className="title">출석 요약</div>
            <div className="info-grid">
              <div>센터명: {centerName}</div>
              <div>과정명: {courseName}</div>
              <div>기간: {startDate} - {endDate}</div>
              <div>{termLabel}: {termStartDate} - {termEndDate}</div>
            </div>
          </div>

          <div className="table-container">
            <table className="summary-table">
              <thead>
              <tr>
                <th>번호</th>
                <th>학생명</th>
                <th>과목명</th>
                <th>소정출석일수</th>
                <th>실제출석일수</th>
                <th>결석</th>
                <th>지각</th>
                <th>조퇴</th>
                <th>출석률</th>
              </tr>
              </thead>
              <tbody>
              {summaryPage?.studentSummaries.map((student, idx) => (
                <tr key={`summary-${student.studentId}`}>
                  <td>{idx + 1}</td>
                  <td className="course-name-cell">{student.studentName}</td>
                  <td>{courseName}</td>
                  <td>{student.totalWorkingDays}일</td>
                  <td>{student.attendanceDays}일</td>
                  <td>{student.absentDays}일</td>
                  <td>{student.lateDays}회</td>
                  <td>{student.earlyLeaveDays}회</td>
                  <td>{student.attendanceRate.toFixed(1)}%</td>
                </tr>
              ))}

              {/* 학생 수가 15명 미만인 경우 빈 행 추가 */}
              {Array.from({ length: Math.max(0, 15 - summaryPage.studentSummaries.length) }).map((_, idx) => (
                <tr key={`empty-summary-${idx}`} className="empty-row">
                  <td>{summaryPage.studentSummaries.length + idx + 1}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          {/* 페이지 번호 (절대 위치로 바닥에 고정) */}
          <div className="page-footer">
            {(pages || []).length + 1} / {(pages || []).length + 1}
          </div>
        </div>
      </div>
        )}
    </div>
  );
};

export default AttendancePrintPage;