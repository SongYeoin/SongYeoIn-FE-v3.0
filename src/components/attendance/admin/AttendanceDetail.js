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
  const [totalPages, setTotalPages] = useState(1);
  const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
  const periods = ['1교시', '2교시', '3교시', '4교시', '5교시', '6교시', '7교시'];

  useEffect(() => {
    if (!attendance) {
      return null;
    }

    fetchAttendanceDetails(currentPage);
  }, [attendance, currentPage]);

  const fetchAttendanceDetails = async (page) => {
    try {
      setIsLoading(true);
      setError(null);

      // 백엔드에서 상세 데이터 조회
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/attendance/course/${attendance.courseId}/member/${attendance.studentId}`,
        {
          params: { date: attendance.date, page: page - 1, size: 5 },
        },
      );

      setAttendanceDetails({
        memberInfo: response.data.memberInfo, // 학생 정보 및 과정 정보
        periodList: response.data.periodList, // 교시 목록
        attendances: response.data.attendances, // 출석 상태 페이지
      });
      setCurrentPage(response.data.attendances.currentPage);
      setTotalPages(response.data.attendances.totalPages);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
    //fetchAttendanceDetails(page);
  };

  if (!attendanceDetails) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
    console.log("수정할 출석ID:"+ attendanceId+ "변경할 상태값: "+ newStatus)
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
        return '-'; // Empty for unknown status
    }
  };



  const formatTime = (time) => {
    if (!time || typeof time !== "string") return ""; // `time`이 없거나 문자열이 아니면 빈 문자열 반환
    if (time.includes("T")) {
      const timePart = time.split("T")[1]; // ISO-8601 형식 처리
      return timePart.split(":").slice(0, 2).join(":"); // "10:00"
    }
    if (time.includes(":")) {
      return time.split(":").slice(0, 2).join(":"); // 이미 "10:00:00" 형식일 경우 처리
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
      timetableData[period.dayOfWeek][period.name] = `${formatTime(
        period.startTime
      )}~${formatTime(period.endTime)}`;
    }else{
      timetableData[period.dayOfWeek][period.name] = null;
    }
  });


  return (
    <div
      className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">출석 관리 상세보기</h2>
          <button onClick={onClose}
                  className="text-gray-500 hover:text-gray-800">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/*수강생 정보*/}
        <div className="mb-5 border border-gray-300 rounded-lg p-4">
          <h3
            className="text-lg font-bold mb-2 border-b border-gray-300 pb-2">수강생
            정보</h3>
          <div className="">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-bold">수강생명</p>
                <p
                  className="text-base font-normal border border-gray-300 rounded-lg p-2">
                  {attendanceDetails.memberInfo.studentName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">과정명</p>
                <p
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-full">
                  {attendanceDetails.memberInfo.courseName}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-bold">날짜</p>
                <p
                  className="text-base font-normal border border-gray-300 rounded-lg p-2">
                  {attendanceDetails.memberInfo.date}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">담당자</p>
                <p
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-full">
                  {attendanceDetails.memberInfo.adminName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 시간표 */}
        <div className="mb-5 border border-gray-300 rounded-lg p-4">
          <h3
            className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">시간표</h3>

          {attendanceDetails.periodList
          && attendanceDetails.periodList.length > 0 ? (
            <div
              className="grid grid-cols-8 border bg-white rounded-lg">
              {/* 헤더 행 */}
              <div
                className="font-bold text-center border bg-gray-100">교시/요일
              </div>
              {days.map((day) => (
                <div key={day}
                     className="font-bold text-center border bg-gray-100">
                  {day}
                </div>
              ))}

              {/* 데이터 행 */}
              {periods.map((period) => (
                <React.Fragment key={period}>
                  {/* 교시 열 */}
                  <div
                    className="font-bold text-center border bg-gray-50">{period}</div>
                  {/* 요일 데이터 */}
                  {days.map((day) => (
                    <div key={`${day}-${period}`}
                         className="text-center border">
                      {timetableData[day][period] || ''}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">시간표 정보가 없습니다.</p>
          )}
        </div>

        {/*출석 상태 목록*/}
        <div className="mb-5 border border-gray-300 rounded-lg p-4">
          <h3
            className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">출석
            상태 목록</h3>
          {!isLoading && !error && attendanceDetails ? (
            attendanceDetails.attendances.content.length > 0 ? (
              <>
                <ul>
                  {attendanceDetails.attendances.content.map(
                    (attendance, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded"
                      >
                        <div className="flex items-center gap-4">
                          <p className="text-sm">
                            {attendance.periodName} ({attendance.startTime} ~ {attendance.endTime})
                          </p>
                          <p>
                            {renderStatusIcon(attendance.status)}
                          </p>
                          <p>
                            출석한 시간: {new Date(
                            attendance.enrollDate).toLocaleString()}
                          </p>
                        </div>
                        {editingIndex === index ? (
                          <div className="gap-2 flex items-center">
                            <label>
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
                            <label>
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
                            <label>
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
                            <button
                              className="bg-blue-500 text-white px-4 py-2 rounded ml-4"
                              onClick={() => handleStatusChange(
                                attendance.attendanceId, selectedStatus)}
                              disabled={isSaving || selectedStatus
                                === ''} // 선택 상태가 없거나 저장 중일 때 비활성화
                            >
                              {isSaving ? '저장 중...' : '저장'}
                            </button>
                          </div>
                        ) : (

                          <button
                            className="bg-[#D9D9D9] px-4 py-2 rounded ml-4"
                            onClick={() => setEditingIndex(index)}
                          >
                            변경
                          </button>
                        )}
                      </li>
                    ))}
                </ul>
                <footer
                  className="flex justify-center items-center p-1 bg-white">
                  <nav className="flex items-center gap-2">
                    {/* 이전 페이지 화살표 */}
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-50"
                      onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <svg width="6" height="10" fill="none"
                           stroke="currentColor">
                        <path d="M5 9L1 5L5 1" />
                      </svg>
                    </button>

                    {/* 페이지 번호 */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            currentPage === page
                              ? 'bg-[#225930] text-white font-bold'
                              : 'border border-gray-300'
                          }`}
                          onClick={() => onPageChange(page)}
                        >
                          {page}
                        </button>
                      ))}

                    {/* 다음 페이지 화살표 */}
                    <button
                      className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-300 disabled:opacity-50"
                      onClick={() => onPageChange(
                        Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <svg width="6" height="10" fill="none"
                           stroke="currentColor">
                        <path d="M1 9L5 5L1 1" />
                      </svg>
                    </button>
                  </nav>
                </footer>
              </>
            ) : (
              <p className="text-gray-500">출석 정보가 없습니다.</p>
            )
          ) : isLoading ? (
            <p className="text-gray-500">로딩 중...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : null}
        </div>
        {/* 닫기 버튼 */}
        <div className="grid grid-cols-1">
          <button
            onClick={onClose}
            className="bg-[#225930] font-bold text-white px-4 py-2 rounded hover:bg-blue-600">
            닫기
          </button>
          {/*<button
              onClick={handleSave}
              className="bg-[#225930] font-bold text-white px-4 py-2 rounded hover:bg-blue-600">
              저장
            </button>*/}
        </div>
      </div>
    </div>
  );
};

export default AttendanceDetail;
