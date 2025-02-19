import React, { useEffect, useState } from 'react';
import axios from 'api/axios';

const AttendanceDetail = ({ attendance, onClose }) => {
  const [attendanceDetails, setAttendanceDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
//  const [totalPages, setTotalPages] = useState(1);
  const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
  const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시', '8교시'];

  useEffect(() => {
    if (!attendance) {
      return null;
    }

    fetchAttendanceDetails(currentPage);
  }, [attendance, currentPage]);

  // 모달창 스크롤링 관련 코드 추가
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const fetchAttendanceDetails = async (page) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/attendance/course/${attendance.courseId}/member/${attendance.studentId}`,
        {
          params: { date: attendance.date, page: page - 1, size: 5 },
        }
      );

      // 서버 응답에서 number 타입으로 확실하게 변환
      const currentPageFromServer = Number(response.data.attendances.currentPage) || page;

      setAttendanceDetails({
        memberInfo: response.data.memberInfo,
        periodList: response.data.periodList,
        attendances: response.data.attendances,
      });
      setCurrentPage(currentPageFromServer);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

    const onPageChange = (page) => {
    console.log('Before change - currentPage:', currentPage, 'type:', typeof currentPage);
    console.log('Clicked page:', page, 'type:', typeof page);

    setCurrentPage(page);
    fetchAttendanceDetails(page);

    // setTimeout을 사용해 상태 업데이트 후 값 확인
    setTimeout(() => {
      console.log('After change - currentPage:', currentPage, 'type:', typeof currentPage);
    }, 0);
  };

  if (!attendanceDetails) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg">
          <p>오류 발생: {error}</p>
          <button
            onClick={onClose}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  /*const handleEditClick = (index, currentStatus) => {
    setEditingIndex(index);
    setSelectedStatus(currentStatus);
  };*/

  const handleStatusChange = async (attendanceId, newStatus) => {
    console.log("수정할 출석ID:" + attendanceId + "변경할 상태값: " + newStatus);
    try {
      setIsSaving(true); // 로딩 상태 활성화
      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/attendance/${attendanceId}?status=${newStatus}`
      );
      if (response.status === 200) {
        alert('상태가 성공적으로 업데이트되었습니다.');
        // 성공적으로 업데이트된 후 로컬 상태 업데이트

        const updatedAttendance = response.data;
        const updatedAttendanceDetails = { ...attendanceDetails };
        updatedAttendanceDetails.attendances.content = updatedAttendanceDetails.attendances.content.map(
          (attendance) =>
            attendance.attendanceId === updatedAttendance.attendanceId
              ? { ...attendance, status: updatedAttendance.status }
              : attendance
        );
        setAttendanceDetails(updatedAttendanceDetails);
        setEditingIndex(null);
      }
    } catch (error) {
      console.error('상태 업데이트 중 오류 발생:', error);
      alert('상태 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false); // 로딩 상태 해제
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case '출석':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#14AE5C"
            className="bi bi-circle"
            viewBox="0 0 16 16"
          >
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
          </svg>
        ); // Circle
      case '지각':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#BF6A02"
            className="bi bi-triangle"
            viewBox="0 0 16 16"
          >
            <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z" />
          </svg>
        ); // Triangle
      case '결석':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="#EC221F"
            className="bi bi-x-lg"
            viewBox="0 0 16 16"
          >
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
          </svg>
        ); // Cross
      case '조퇴':
        return '조퇴';
      default:
        return '-'; // Empty for unknown status
    }
  };

  const formatTime = (time) => {
    if (!time || typeof time !== 'string') return ''; // `time`이 없거나 문자열이 아니면 빈 문자열 반환
    if (time.includes('T')) {
      const timePart = time.split('T')[1]; // ISO-8601 형식 처리
      return timePart.split(':').slice(0, 2).join(':'); // "10:00"
    }
    if (time.includes(':')) {
      return time.split(':').slice(0, 2).join(':'); // 이미 "10:00:00" 형식일 경우 처리
    }
    return time; // 다른 형식일 경우 그대로 반환
  };

  // 요일과 교시에 맞는 데이터를 매핑
  const timetableData = {};
  days.forEach((day) => {
    timetableData[day] = {};
    periods.forEach((period) => {
      timetableData[day][period] = null; // 초기값 공란
    });
  });

  // 데이터 채우기
  attendanceDetails.periodList.forEach((period) => {
    if (timetableData[period.dayOfWeek]) {
      timetableData[period.dayOfWeek][period.name] = `${formatTime(period.startTime)}~${formatTime(period.endTime)}`;
    } else {
      timetableData[period.dayOfWeek][period.name] = null;
    }
  });

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[9999] overflow-y-auto">
    <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg my-10"
      style={{
        minHeight: 'min-content',
        maxHeight: '90vh',
        margin: '5vh auto'
      }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">출석 관리 상세보기</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
        >
          ✕
        </button>
      </div>

      {/* 수강생 정보 */}
      <div className="mb-6 border border-gray-300 rounded-lg p-4">
        <h3 className="text-sm text-gray-600 font-bold mb-4">수강생 정보</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600 font-bold">수강생명</label>
            <p className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none">
              {attendanceDetails.memberInfo.studentName}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 font-bold">과정명</label>
            <p className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none">
              {attendanceDetails.memberInfo.courseName}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 font-bold">날짜</label>
            <p className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none">
              {attendanceDetails.memberInfo.date}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600 font-bold">담당자</label>
            <p className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none">
              {attendanceDetails.memberInfo.adminName}
            </p>
          </div>
        </div>
      </div>

      {/* 시간표 */}
      <div className="mb-6 border border-gray-300 rounded-lg p-4">
        <h3 className="text-sm text-gray-600 font-bold mb-4">시간표</h3>
        {attendanceDetails.periodList && attendanceDetails.periodList.length > 0 ? (
          <div className="grid grid-cols-8 border rounded-lg bg-white">
            {/* 헤더 행 */}
            <div className="font-bold text-center border bg-gray-100 p-2">교시/요일</div>
            {days.map((day) => (
              <div key={day} className="font-bold text-center border bg-gray-100 p-2">
                {day}
              </div>
            ))}

            {/* 데이터 행 */}
            {periods.map((period) => (
              <React.Fragment key={period}>
                <div className="font-bold text-center border bg-gray-50 p-2">{period}</div>
                {days.map((day) => (
                  <div key={`${day}-${period}`} className="text-center border p-2 whitespace-normal">
                    {timetableData[day][period] ? (
                      <div className="text-xs">
                        {timetableData[day][period].split('~')[0]}<br />
                        ~ {timetableData[day][period].split('~')[1]} {/* ~ 뒤에 띄어쓰기 추가 */}
                      </div>
                    ) : ''}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">시간표 정보가 없습니다.</p>
        )}
      </div>

      {/* 출석 상태 목록 */}
      <div className="mb-6 border border-gray-300 rounded-lg p-4">
        <h3 className="text-sm text-gray-600 font-bold mb-4">출석 상태 목록</h3>
        {!isLoading && !error && attendanceDetails ? (
          attendanceDetails.attendances.content.length > 0 ? (
            <>
              <table className="w-full mb-4">
                <thead>
                  <tr className="border-b">
                    <th className="text-sm text-gray-600 font-bold py-2 px-4 text-center">교시</th>
                    <th className="text-sm text-gray-600 font-bold py-2 px-4 text-center">시간</th>
                    <th className="text-sm text-gray-600 font-bold py-2 px-4 text-center">상태</th>
                    <th className="text-sm text-gray-600 font-bold py-2 px-4 text-center">출석 시간</th>
                    <th className="text-sm text-gray-600 font-bold py-2 px-4 text-center">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceDetails.attendances.content.map((attendance, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2 px-4 text-center">{attendance.periodName}</td>
                      <td className="py-2 px-4 text-center">{attendance.startTime} ~ {attendance.endTime}</td>
                      <td className="py-2 px-4 text-center align-middle">
                        <div className="flex justify-center items-center h-full">
                          {renderStatusIcon(attendance.status)}
                        </div>
                      </td>
                      <td className="py-2 px-4 text-center">{new Date(attendance.enrollDate).toLocaleString()}</td>
                      <td className="py-2 px-4 text-center">
                        {editingIndex === index ? (
                          <div className="flex flex-col gap-2">
                            {/* 라디오 버튼 그룹을 수평으로 배치 */}
                            <div className="flex justify-center gap-3 text-sm">
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`status-${index}`}
                                  value="PRESENT"
                                  checked={selectedStatus === 'PRESENT'}
                                  onChange={(e) => setSelectedStatus(
                                    e.target.value)}
                                />
                                출석
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`status-${index}`}
                                  value="LATE"
                                  checked={selectedStatus === 'LATE'}
                                  onChange={(e) => setSelectedStatus(
                                    e.target.value)}
                                />
                                지각
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`status-${index}`}
                                  value="ABSENT"
                                  checked={selectedStatus === 'ABSENT'}
                                  onChange={(e) => setSelectedStatus(
                                    e.target.value)}
                                />
                                결석
                              </label>
                              <label className="flex items-center gap-1">
                                <input
                                  type="radio"
                                  name={`status-${index}`}
                                  value="EARLY_EXIT"
                                  checked={selectedStatus === 'EARLY_EXIT'}
                                  onChange={(e) => setSelectedStatus(
                                    e.target.value)}
                                />
                                조퇴
                              </label>
                            </div>
                            {/* 버튼들을 수평으로 배치 */}
                            <div className="flex justify-center gap-1">
                              <button
                                className="px-2 py-0.5 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors duration-200"
                                onClick={() => {
                                  setEditingIndex(null);
                                  setSelectedStatus('');
                                }}
                              >
                                취소
                              </button>
                              <button
                                className="px-2 py-0.5 text-sm bg-green-800 text-white rounded hover:bg-green-900 transition-colors duration-200"
                                onClick={() => handleStatusChange(attendance.attendanceId, selectedStatus)}
                                disabled={isSaving || selectedStatus === ''}
                              >
                                {isSaving ? '저장 중...' : '저장'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            className="px-3 py-1 text-sm bg-green-800 text-white rounded hover:bg-green-900 transition-colors duration-200"
                            onClick={() => setEditingIndex(index)}
                          >
                            변경
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-center items-center mt-4">
                <nav className="flex items-center gap-2">
                  {/* 이전 페이지 버튼 - currentPage가 1이면 비활성화 */}
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50"
                    onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <svg width="6" height="10" fill="none" stroke="currentColor">
                      <path d="M5 9L1 5L5 1" />
                    </svg>
                  </button>

                  {/* 페이지 번호 버튼들 - 현재 페이지는 진한 초록색으로 강조 */}
                  {Array.from({ length: attendanceDetails.attendances.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                        page === (currentPage || 1)  // currentPage가 undefined면 1을 사용
                          ? 'bg-green-800 text-white'
                          : 'border border-gray-300'
                      }`}
                      onClick={() => onPageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  {/* 다음 페이지 버튼 - 마지막 페이지면 비활성화 */}
                  <button
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50"
                    onClick={() => onPageChange(Math.min(currentPage + 1, attendanceDetails.attendances.totalPages))}
                    disabled={currentPage === attendanceDetails.attendances.totalPages}
                  >
                    <svg width="6" height="10" fill="none" stroke="currentColor">
                      <path d="M1 9L5 5L1 1" />
                    </svg>
                  </button>
                </nav>
              </div>
            </>
          ) : (
            <p className="text-gray-500">출석 상태가 없습니다.</p>
          )
        ) : (
          <p className="text-gray-500">로딩 중...</p>
        )}
      </div>
    </div>
  </div>
);
};

export default AttendanceDetail;
