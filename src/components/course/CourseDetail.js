import { useEffect, useState } from 'react';
import axios from 'api/axios';

const CourseDetail = ({ courseId, onClose,onDeleteSuccess }) => {
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

  // 모달창 관련 코드
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 초기 데이터 로드 (course, schedule, members)
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/course/${courseId}`,
          {
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
          }
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

      // 서버에서 반환된 교시와 추가된 교시를 병합
      // 병합된 시간표
      const mergedSchedule = [
        ...originalSchedule.filter((period) =>
          !deletedPeriods.includes(period.id)
        ), // 삭제되지 않은 기존 교시 유지
        ...(updatedPeriodsResponse || []), // 백엔드에서 반환된 수정된 교시
        ...newPeriods, // 새로 추가된 교시
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
      });

      alert("과정이 성공적으로 삭제되었습니다.");
      onClose(); // 삭제 후 모달 닫기
      if (onDeleteSuccess) onDeleteSuccess(); // 부모 컴포넌트에 성공 알림
    } catch (err) {
      console.error("Error deleting course:", err);
      alert("과정을 삭제하는 중 오류가 발생했습니다.");
    }
  };



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
        <h2 className="text-2xl font-bold">교육 과정 상세보기</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
        >
          ✕
        </button>
      </div>

      {/* 기본 정보 */}
      <div className="mb-6 border border-gray-300 rounded-lg p-4">
        <h3 className="text-sm text-gray-600 font-bold mb-4">기본 정보</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600 font-bold">과정명</label>
            <input
              name="name"
              value={course.name || ""}
              onChange={handleCourseChange}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 font-bold">강의실</label>
            <input
              name="roomName"
              value={course.roomName || ''}
              onChange={handleCourseChange}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 font-bold">상세 설명</label>
          <input
            name="description"
            value={course.description || ''}
            onChange={handleCourseChange}
            className="w-full px-3 py-2 border rounded-lg bg-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600 font-bold">강사명</label>
            <input
              name="teacherName"
              value={course.teacherName || ''}
              onChange={handleCourseChange}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 font-bold">담당자</label>
            <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
              {course.adminName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600 font-bold">개강일</label>
            <input
              type="date"
              name="startDate"
              value={course.startDate || ''}
              onChange={handleCourseChange}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 font-bold">종강일</label>
            <input
              type="date"
              name="endDate"
              value={course.endDate || ''}
              onChange={handleCourseChange}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 font-bold">상태</label>
            <p className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${course.status === 'Y' ? 'text-green-600' : 'text-gray-600'}`}>
              {course.status === 'Y' ? '활성' : '종강'}
            </p>
          </div>
        </div>
      </div>

      {/* 시간표 */}
      <div className="mb-6 border border-gray-300 rounded-lg p-4">
        <h3 className="text-sm text-gray-600 font-bold mb-4">시간표</h3>
        <div className="max-h-64 overflow-y-auto">
          {schedule && schedule.length > 0 ? (
            schedule.map((period, index) => (
              <div key={index} className="flex gap-2 items-center mb-2">
                <input
                  type="text"
                  value={period.dayOfWeek}
                  onChange={(e) => handlePeriodChange(index, 'dayOfWeek', e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-white w-1/5"
                />
                <input
                  type="text"
                  value={period.name}
                  onChange={(e) => handlePeriodChange(index, 'name', e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-white w-1/5"
                />
                <input
                  type="time"
                  value={period.startTime}
                  onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-white w-1/4"
                />
                <input
                  type="time"
                  value={period.endTime}
                  onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-white w-1/4"
                />
                <button
                  onClick={() => handleDeletePeriod(index)}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  삭제
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">시간표 정보가 없습니다.</p>
          )}
        </div>

        {/* 새 교시 추가 */}
        <div className="mt-4">
          <h4 className="text-sm text-gray-600 font-bold mb-2">새 교시 추가</h4>
          <div className="flex gap-2">
            <select
              value={newPeriod.dayOfWeek}
              onChange={(e) => setNewPeriod(
                { ...newPeriod, dayOfWeek: e.target.value })}
              className="px-3 py-2 border rounded-lg bg-white w-1/5"
            >
              <option value="" disabled>요일 선택</option>
              <option value="월요일">월요일</option>
              <option value="화요일">화요일</option>
              <option value="수요일">수요일</option>
              <option value="목요일">목요일</option>
              <option value="금요일">금요일</option>
              <option value="토요일">토요일</option>
              <option value="일요일">일요일</option>
              <option value="월~금">월~금</option>
              <option value="월~일">월~일</option>
              <option value="주말">주말</option>
            </select>
            <select
              value={newPeriod.name}
              onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })}
              className="px-3 py-2 border rounded-lg bg-white w-1/5"
            >
              <option value="" disabled>교시명 선택</option>
              <option value="1교시">1교시</option>
              <option value="2교시">2교시</option>
              <option value="3교시">3교시</option>
              <option value="4교시">4교시</option>
              <option value="5교시">5교시</option>
              <option value="6교시">6교시</option>
              <option value="7교시">7교시</option>
              <option value="8교시">8교시</option>
            </select>
            <input
              type="time"
              value={newPeriod.startTime}
              onChange={(e) => setNewPeriod({ ...newPeriod, startTime: e.target.value })}
              className="px-3 py-2 border rounded-lg bg-white w-1/4"
            />
            <input
              type="time"
              value={newPeriod.endTime}
              onChange={(e) => setNewPeriod({ ...newPeriod, endTime: e.target.value })}
              className="px-3 py-2 border rounded-lg bg-white w-1/4"
            />
            <button
              onClick={handleAddPeriod}
              className="text-green-800 hover:text-green-900 transition-colors duration-200"
            >
              추가
            </button>
          </div>
        </div>
      </div>

      {/* 수강생 목록 */}
      <div className="mb-6 border border-gray-300 rounded-lg p-4">
        <h3 className="text-sm text-gray-600 font-bold mb-4">수강생 목록</h3>
        {members != null ? (
          <>
            <table className="w-full mb-4">
              <thead>
                <tr className="border-b">
                  <th className="text-sm text-gray-600 font-bold py-2 px-4 text-center w-1/4">이름</th>
                  <th className="text-sm text-gray-600 font-bold py-2 px-4 text-center w-1/3">생년월일</th>
                  <th className="text-sm text-gray-600 font-bold py-2 px-4 text-center w-5/12">이메일</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b">
                    <td className="py-2 px-4 text-center w-1/4">{member.name}</td>
                    <td className="py-2 px-4 text-center w-1/3">{member.birthday}</td>
                    <td className="py-2 px-4 text-center w-5/12">{member.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-center items-center">
              <nav className="flex items-center gap-2">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50"
                  onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <svg width="6" height="10" fill="none" stroke="currentColor">
                    <path d="M5 9L1 5L5 1" />
                  </svg>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                      currentPage === page
                        ? 'bg-green-800 text-white'
                        : 'border border-gray-300'
                    }`}
                    onClick={() => onPageChange(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 disabled:opacity-50"
                  onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <svg width="6" height="10" fill="none" stroke="currentColor">
                    <path d="M1 9L5 5L1 1" />
                  </svg>
                </button>
              </nav>
            </div>
          </>
        ) : (
          <p className="text-gray-500">수강생 정보가 없습니다.</p>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="flex justify-end gap-2">
        <button
          onClick={handleCourseDelete}
          className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          삭제
        </button>
        <button
          onClick={handleSave}
          className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200"
        >
          저장
        </button>
      </div>
    </div>
  </div>
);
};

export default CourseDetail;
