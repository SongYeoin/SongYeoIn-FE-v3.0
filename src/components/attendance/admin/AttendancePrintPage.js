import React from 'react';

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
        return '●';
      case '지각':
        return '▲';
      case '결석':
        return '✕';
      case '조퇴':
        return '조퇴';
      default:
        return '-';
    }
  };

  // 인쇄용으로 데이터를 5일씩 페이지로 재구성
  const createPrintPages = () => {
    if (!pages || pages.length === 0 || !pages[0].students || pages[0].students.length === 0) {
      return [];
    }

    // 모든 날짜 수집
    const allDates = [];
    const allStudents = [];

    // 모든 페이지의 모든 날짜 수집
    pages.forEach(page => {
      if (page.students && page.students.length > 0 && page.students[0].dailyAttendance) {
        page.students[0].dailyAttendance.forEach(day => {
          if (!allDates.includes(day.date)) {
            allDates.push(day.date);
          }
        });
      }
    });

    // 모든 학생 정보 수집 (첫 페이지에서만 가져옴)
    if (pages[0].students) {
      pages[0].students.forEach(student => {
        allStudents.push(student);
      });
    }

    // 날짜를 정렬
    allDates.sort();

    // 5일씩 분할하여 페이지 생성
    const printPages = [];
    for (let i = 0; i < allDates.length; i += 5) {
      const dateBatch = allDates.slice(i, i + 5);

      const pageStudents = allStudents.map(student => {
        const filteredAttendance = [];

        // 해당 페이지에 포함될 날짜만 필터링
        dateBatch.forEach(date => {
          const dayData = student.dailyAttendance.find(day => day.date === date);
          if (dayData) {
            filteredAttendance.push(dayData);
          }
        });

        return {
          ...student,
          dailyAttendance: filteredAttendance
        };
      });

      printPages.push({
        ...pages[0], // 기본 페이지 정보 복사
        students: pageStudents
      });
    }

    return printPages;
  };

  const printPages = createPrintPages();

  // 인쇄용 출력물
  return (
    <div className="print-content" style={{ width: '100%', maxWidth: '297mm', margin: '0 auto' }}>
      {/* 출석부 페이지들 (5일씩 구분) */}
      {printPages.map((page, pageIdx) => (
        <div key={`print-page-${pageIdx}`} className={pageIdx < printPages.length - 1 ? 'page-break-after' : ''} style={{ marginBottom: '50px', pageBreakAfter: 'always' }}>
          <div className="w-full mx-auto" style={{width: '100%', border: '1px solid #333', maxWidth: '297mm' }}>
            {/* 헤더 영역 */}
            <div className="mb-4" style={{ width: '100%',padding: '10px' }}>
              <div className="text-center text-xl font-bold mb-4" style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'center' }}>출 석 부</div>
              <div className="w-full grid grid-cols-4" style={{ width: '100%',fontSize: '10px'}}>
                <div className="p-2" style={{ padding: '8px' }}>센터명: {centerName}</div>
                <div className="p-2" style={{ padding: '8px' }}>과정명: {courseName}</div>
                <div className="p-2" style={{ padding: '8px' }}>기간: {startDate} - {endDate}</div>
                <div className="p-2" style={{ padding: '8px' }}>{termLabel}: {termStartDate} - {termEndDate}</div>
              </div>
            </div>

            {/* 출석부 테이블 */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: '1px solid #333',
              fontSize: '10px',
              tableLayout: 'fixed'
            }}>
              {/* 날짜 헤더 */}
              <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th rowSpan="3" style={{ border: '1px solid #333', width: '30px', textAlign: 'center', verticalAlign: 'middle' }}>번호</th>
                <th style={{ border: '1px solid #333', textAlign: 'center', width: '60px', height: '24px', verticalAlign: 'middle' }}>날짜</th>
                {page.students[0]?.dailyAttendance.map((day) => (
                  <th key={`print-date-${day.date}`} colSpan="8" style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>
                    {formatDate(day.date)}
                  </th>
                ))}
                <th rowSpan="3" style={{ border: '1px solid #333', width: '20px', height: '70px', textAlign: 'center', verticalAlign: 'middle', writingMode: 'vertical-rl' }}>소정출석일</th>
                <th rowSpan="3" style={{ border: '1px solid #333', width: '20px', height: '70px', textAlign: 'center', verticalAlign: 'middle', writingMode: 'vertical-rl' }}>실제출석일</th>
                <th rowSpan="3" style={{ border: '1px solid #333', width: '20px', height: '70px', textAlign: 'center', verticalAlign: 'middle', writingMode: 'vertical-rl' }}>결석</th>
                <th rowSpan="3" style={{ border: '1px solid #333', width: '20px', height: '70px', textAlign: 'center', verticalAlign: 'middle', writingMode: 'vertical-rl' }}>지각</th>
                <th rowSpan="3" style={{ border: '1px solid #333', width: '20px', height: '70px', textAlign: 'center', verticalAlign: 'middle', writingMode: 'vertical-rl' }}>조퇴</th>
                <th rowSpan="3" style={{ border: '1px solid #333', width: '20px', height: '70px', textAlign: 'center', verticalAlign: 'middle', writingMode: 'vertical-rl' }}>확인</th>
              </tr>
              <tr>
                <th style={{ border: '1px solid #333', textAlign: 'center', width: '60px', height: '24px', verticalAlign: 'middle' }}>결재</th>
                {page.students[0]?.dailyAttendance.map((day, idx) => (
                  <th colSpan="8" key={`print-approval-${idx}`} style={{ border: '1px solid #333', height: '24px' }}></th>
                ))}
              </tr>
              {/* 교시 헤더 */}
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ border: '1px solid #333', width: '60px', textAlign: 'center', height: '24px', verticalAlign: 'middle' }}>성명</th>
                {page.students[0]?.dailyAttendance.map((day) =>
                  Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                    <th key={`print-period-${day.date}-${num}`} style={{ border: '1px solid #333', width: '15px', textAlign: 'center', fontSize: '9px', verticalAlign: 'middle' }}>
                      {num}
                    </th>
                  ))
                )}
              </tr>
              </thead>

              {/* 학생 목록 및 출석 체크 영역 */}
              <tbody>
              {page.students?.map((student, idx) => (
                <tr key={`print-student-${idx}-${student.studentId}`} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #333', textAlign: 'center', width: '60px', verticalAlign: 'middle' }}>{student.studentName}</td>
                  {student.dailyAttendance.map((day) => {
                    // 각 날짜별로 모든 교시(1-8)에 대한 셀을 생성
                    const periodMap = {};
                    day.periods.forEach(period => {
                      periodMap[period.period] = period.status;
                    });

                    return Array.from({ length: 8 }, (_, i) => i + 1).map(
                      periodNum => (
                        <td key={`print-status-${day.date}-${periodNum}`} style={{ border: '1px solid #333', textAlign: 'center', width: '15px', verticalAlign: 'middle' }}>
                          {getStatusIcon(periodMap[periodNum] || '-')}
                        </td>
                      )
                    );
                  })}
                  {/* 통계 열 추가 */}
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>{student.processedDays}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>{student.realAttendDays}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>{student.absentCount}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>{student.lateCount}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}>{student.earlyLeaveCount}</td>
                  <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', verticalAlign: 'middle' }}></td>
                </tr>
              ))}
              </tbody>
            </table>

            {/* 페이지 번호 */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', marginBottom: '8px' }}>
              <div style={{ padding: '8px 16px', fontSize: '12px' }}>
                {pageIdx + 1} / {printPages.length + 1}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* 요약 페이지 (마지막 페이지) */}
      <div style={{ pageBreakAfter: 'always', marginTop: '50px', marginBottom: '50px' }}>
        <div style={{ width: '100%', maxWidth: '210mm', margin: '0 auto', border: '1px solid #333' }}>
          <div style={{ marginBottom: '16px', padding: '10px' }}>
            <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>출석 요약</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', fontSize: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '8px' }}>센터명: {centerName}</div>
              <div style={{ padding: '8px' }}>과정명: {courseName}</div>
              <div style={{ padding: '8px' }}>기간: {startDate} - {endDate}</div>
              <div style={{ padding: '8px' }}>{termLabel}: {termStartDate} - {termEndDate}</div>
            </div>
          </div>

          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #333',
            fontSize: '12px'
          }}>
            <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>번호</th>
              <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>학생명</th>
              <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>과목명</th>
              <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>소정출석일수</th>
              <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>실제출석일수</th>
              <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>결석</th>
              <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>지각</th>
              <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>조퇴</th>
              <th style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>출석률</th>
            </tr>
            </thead>
            <tbody>
            {summaryPage?.studentSummaries.map((student, idx) => (
              <tr key={`print-summary-${student.studentId}`}>
                <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>{idx + 1}</td>
                <td style={{ padding: '12px', border: '1px solid #333', verticalAlign: 'middle' }}>{student.studentName}</td>
                <td style={{ padding: '12px', border: '1px solid #333', verticalAlign: 'middle' }}>{courseName}</td>
                <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>{student.totalWorkingDays}일</td>
                <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>{student.attendanceDays}일</td>
                <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>{student.absentDays}일</td>
                <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>{student.lateDays}회</td>
                <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>{student.earlyLeaveDays}회</td>
                <td style={{ padding: '12px', border: '1px solid #333', textAlign: 'center', verticalAlign: 'middle' }}>{student.attendanceRate.toFixed(1)}%</td>
              </tr>
            ))}
            </tbody>
          </table>

          {/* 페이지 번호 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', marginBottom: '8px' }}>
            <div style={{ padding: '8px 16px', fontSize: '12px' }}>
              {printPages.length + 1} / {printPages.length + 1}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePrintPage;