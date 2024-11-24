import { useEffect, useState } from 'react';
import axios from 'api/axios';

const CourseDetail = ({ courseId, onClose }) => {
  //console.log('courseId :' + courseId);

  const [originalCourse, setOriginalCourse] = useState(null); // 원래 course 데이터
  const [originalSchedule, setOriginalSchedule] = useState([]); // 원래 schedule 데이터

  const [course, setCourse] = useState(null); //courseDTO 형태
  const [schedule, setSchedule] = useState([]);   //List 형태
  const [newPeriod, setNewPeriod] = useState({
    dayOfWeek: "",
    name: "",
    startTime: "",
    endTime: "",
  });
  const [deletedPeriods, setDeletedPeriods] = useState([]);

  const [members, setMembers] = useState(null);   // Page<MemberDTO> 형태
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  
  //const [editedCourse, setEditedCourse] = useState(null); // 수정된 값 관리

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 초기 데이터 로드 (course, schedule, members)
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/course/${courseId}`,
          {
            headers: {
              Authorization: `Bearer `,
            },
          },
        );

        const { course, schedule } = response.data;
        setCourse(course);
        setOriginalCourse(course); // 원본 데이터 저장
        setSchedule(schedule.periods || []);
        setOriginalSchedule(schedule.periods || []); // 원본 데이터 저장
      } catch (err) {
        setError(err.message || 'Error fetching course details');
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    if (courseId) {
      fetchCourseDetail();
      fetchMembersByPage();
    }
  }, [courseId]); //courseId가 변경될 때마다 실행

  // 수강생 목록 페이징 처리
  const fetchMembersByPage = async (page) => {
    try {
      setIsLoading(true);

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/course/${courseId}/members`,
        {
          params: {
            page: page - 1, // 0-based index
            size: 5, // 한 페이지에 5개
          },
          headers: {
            Authorization: `Bearer `,
          },
        },
      );

      const { content, totalPages } = response.data;
      setMembers(content);
      setTotalPages(totalPages);
    } catch (err) {
      setError(err.message || 'Error fetching members');
    } finally {
      setIsLoading(false);
    }
  };

  const onPageChange = (page) => {
    setCurrentPage(page);
    fetchMembersByPage(page); // 페이지 변경 시 호출
  };

  if (isLoading) {
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

  if (!course) {
    return <p>과정 정보를 불러오는 중입니다...</p>;
  }



  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse((prev) => ({ ...prev, [name]: value }));
  };

  const handlePeriodChange  = (index, field, value) => {
    const updatedPeriods = [...schedule];
    updatedPeriods[index] = { ...updatedPeriods[index], [field]: value };
    setSchedule(updatedPeriods);
  };

  const getUpdatedFields = (original, updated) => {
    const updatedFields = {};
    Object.keys(updated).forEach((key) => {
      if (original[key] !== updated[key]) {
        updatedFields[key] = updated[key];
      }
    });
    return updatedFields;
  };


  const handleAddPeriod = () => {
    if (!newPeriod.dayOfWeek || !newPeriod.name || !newPeriod.startTime || !newPeriod.endTime) {
      alert('모든 필드를 입력해야 합니다.');
      return;
    }
    /*setSchedule([
      ...schedule,
      { ...newPeriod, id: null }, // New periods have no ID
    ]);*/

    // 새 교시 추가
    const newSchedule = [
      ...schedule,
      { ...newPeriod, id: null }, // New periods have no ID
    ];
    setSchedule(newSchedule);

    setNewPeriod({
      dayOfWeek: "",
      name: "",
      startTime: "",
      endTime: "",
    });
  };

  const handleDeletePeriod = (index) => {
    const period = schedule[index];
    if (period.id) {
      setDeletedPeriods([...deletedPeriods, period.id]); // Track deleted periods
    }
    setSchedule(schedule.filter((_, i) => i !== index));
  };


  const handleSave = async () => {
    try {
      // schedule이 정의되지 않았거나 빈 배열일 경우 처리
      if (!schedule || schedule.length === 0) {
        alert("시간표 데이터가 없습니다.");
        return;
      }


      // 수정된 Course 필드만 추출
      const updatedCourse = getUpdatedFields(originalCourse, course);

      // 수정된 Schedule 필드만 추출
      const updatedPeriods = schedule.filter((period) => {
        if (period.id) {
          // 기존 교시와 비교해 변경 사항이 있는 경우만 포함
          const originalPeriod = originalSchedule.find((p) => p.id === period.id);
          return originalPeriod && JSON.stringify(originalPeriod) !== JSON.stringify(period);
        }
        return false; // 새 교시는 제외
      });

      // 새로 추가된 Period 추출
      const newPeriods = schedule.filter((period) => !period.id);

      // payload의 scheduleId 포함 여부 결정
      const schedulePayload = {
        updatedPeriods,
        newPeriods,
        deletedPeriodIds: deletedPeriods,
      };

      // 수정사항이 있는 경우에만 scheduleId 추가
      if (updatedPeriods.length > 0 || newPeriods.length > 0 || deletedPeriods.length > 0) {
        schedulePayload.scheduleId = schedule[0]?.scheduleId || null;
      }

      // payload 생성
      const payload = {
        course: updatedCourse, // 수정된 course 필드만 포함
        schedule: schedulePayload, // 조건에 따라 scheduleId 포함
      };

      const response = await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/course/${courseId}`,
        payload,
        {
        },
      );
      // 업데이트된 데이터 반영
      const { course: updatedCourseResponse, updatedPeriods: updatedPeriodsResponse } = response.data;

      // 상태 업데이트
      if (updatedCourseResponse) {
        setCourse(updatedCourseResponse);
        setOriginalCourse(updatedCourseResponse); // 초기 값 갱신
      }

      // 받아온 schedule이 null일 경우 기존 schedule 유지
      /*if (updatedPeriodsResponse) {
        setSchedule(updatedPeriodsResponse);
        setOriginalSchedule(updatedPeriodsResponse); // 초기 값 갱신
      } else {
        setSchedule(originalSchedule); // 수정된 schedule이 없으면 기존 값 유지
      }*/
      // 서버에서 반환된 교시와 추가된 교시를 병합
      const mergedSchedule = [
        ...(updatedPeriodsResponse || []),
        ...newPeriods, // 추가된 교시 유지
      ];

      setSchedule(mergedSchedule);
      setOriginalSchedule(mergedSchedule);

      alert("저장되었습니다!");
    } catch (err) {
      console.error("Error saving course details:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  if (!course) {
    return <p>Loading...</p>;
  }

  /* courseId를 가지고 가서 교육과정 관련 정보와 시간표, enroll에서 해당 반으로 된 레코드 모두 지우기 */
  const handleCourseDelete = async () => {
    const confirmDelete = window.confirm("해당 교육과정과 관련된 정보와 시간표, 수강생 목록이 삭제됩니다. 정말 이 과정을 삭제하시겠습니까?");
    if (!confirmDelete) {
      // 사용자가 삭제를 취소한 경우
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/admin/course/${courseId}`, {
        headers: {
          Authorization: `Bearer `,
        },
      });

      alert("과정이 성공적으로 삭제되었습니다.");
      onClose(); // 삭제 후 모달 닫기
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("과정을 삭제하는 중 오류가 발생했습니다.");
    }
  };



  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black">교육 과정 상세보기</h2>
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

        {/* 기본 정보 */}
        <div className="mb-5 border border-gray-300 rounded-lg p-4">
          <h3
            className="text-lg font-bold mb-2 border-b border-gray-300 pb-2">기본
            정보</h3>
          <div className="">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-bold">과정명</p>
                <input
                  name="name"
                  value={course.name || ""}
                  onChange={handleCourseChange}
                  className="text-base font-normal border border-gray-300 rounded-lg p-2">
                </input>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">강의실</p>
                <input
                  name="roomName"
                  value={course.roomName || ''}
                  onChange={handleCourseChange}
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-1">
              <div>
                <p className="text-sm text-gray-600 font-bold">상세 설명</p>
                <input
                  name="description"
                  value={course.description || ''}
                  onChange={handleCourseChange}
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-bold">강사명</p>
                <input
                  name="teacherName"
                  value={course.teacherName || ''}
                  onChange={handleCourseChange}
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">담당자</p>
                <p
                  className="bg-gray-500 text-base font-normal border border-gray-300 rounded-lg p-2">{course.adminName}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-bold">개강일</p>
                <input
                  type="date"
                  name="startDate"
                  value={course.startDate || ''}
                  onChange={handleCourseChange}
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">종강일</p>
                <input
                  type="date"
                  name="endDate"
                  value={course.endDate || ''}
                  onChange={handleCourseChange}
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-full"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-bold">상태</p>
                <p
                  className={`bg-gray-500 text-base font-font-normal border border-gray-300 rounded-lg p-2 ${course.status
                  === 'Y' ? 'text-green-500' : 'text-gray-400'}`}>
                  {course.status === 'Y' ? '활성' : '종강'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 시간표 */}
        <div className="mb-5 border border-gray-300 rounded-lg p-4">
          <div>
            <h3
              className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">시간표</h3>
            <button className="border border-gray-300 font-bold">추가</button>
          </div>
          {schedule && schedule.length > 0 ? (
            schedule.map((period, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={period.dayOfWeek}
                  onChange={(e) =>
                    handlePeriodChange(index, 'dayOfWeek', e.target.value)
                  }
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-1/5"
                  placeholder="요일"
                />
                <input
                  type="text"
                  value={period.name}
                  onChange={(e) =>
                    handlePeriodChange(index, 'name', e.target.value)
                  }
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-1/5"
                  placeholder="교시명"
                />
                <input
                  type="time"
                  value={period.startTime}
                  onChange={(e) =>
                    handlePeriodChange(index, 'startTime', e.target.value)
                  }
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-1/4"
                  placeholder="시작시간"
                />
                <input
                  type="time"
                  value={period.endTime}
                  onChange={(e) =>
                    handlePeriodChange(index, 'endTime', e.target.value)
                  }
                  className="text-base font-normal border border-gray-300 rounded-lg p-2 w-1/4"
                  placeholder="종료시간"
                />
                <button
                  className="ml-2 text-red-500"
                  onClick={() => handleDeletePeriod(index)}
                >
                  삭제
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">시간표 정보가 없습니다.</p>
          )}
        </div>
        <div className="mt-4">
          <h4 className="font-bold">새 교시 추가</h4>
          <input
            type="text"
            value={newPeriod.dayOfWeek}
            onChange={(e) =>
              setNewPeriod({ ...newPeriod, dayOfWeek: e.target.value })
            }
            placeholder="요일"
          />
          <input
            type="text"
            value={newPeriod.name}
            onChange={(e) =>
              setNewPeriod({ ...newPeriod, name: e.target.value })
            }
            placeholder="교시명"
          />
          <input
            type="time"
            value={newPeriod.startTime}
            onChange={(e) =>
              setNewPeriod({ ...newPeriod, startTime: e.target.value })
            }
            placeholder="시작시간"
          />
          <input
            type="time"
            value={newPeriod.endTime}
            onChange={(e) =>
              setNewPeriod({ ...newPeriod, endTime: e.target.value })
            }
            placeholder="종료시간"
          />
          <button onClick={handleAddPeriod} className="text-red-500">
            추가
          </button>
        </div>

        {/* 수강생 목록 */}
        <div className="mb-5 border border-gray-300 rounded-lg p-4">
          <h3
            className="text-lg font-bold mb-4 border-b border-gray-300 pb-2">수강생
            목록</h3>
          {members != null ? (
            <>
              <table
                className="w-full table-auto">
                <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td
                      className="px-4 py-2">{member.name}</td>
                    <td
                      className="px-4 py-2">{member.birthday}</td>
                    <td
                      className="px-4 py-2">{member.email}</td>
                  </tr>
                ))}
                </tbody>
              </table>
              <footer className="flex justify-center items-center p-1 bg-white">
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
            <p className="text-gray-500">수강생 정보가 없습니다.</p>
          )}
        </div>

        {/* 저장 버튼 */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleCourseDelete}
            className="bg-[#225930] font-bold text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            삭제
          </button>
          <button
            onClick={handleSave}
            className="bg-[#225930] font-bold text-white px-4 py-2 rounded hover:bg-blue-600">
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
