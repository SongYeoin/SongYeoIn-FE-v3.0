import { useEffect, useState } from 'react';
import axios from 'api/axios';

const CourseDetail = ({ courseId, onClose }) => {
  console.log('courseId :' + courseId);


  const [course, setCourse] = useState(null); //courseDTO 형태
  const [schedule, setSchedule] = useState([]);   //List 형태
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
              Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzMyMTk5NzMwLCJleHAiOjE3MzIyMDE1MzB9.RgHUaQZl-fJkKvpercJ8KClG5b_qyE8S1cq5tApF2m4`,
            },
          },
        );

        const { course, schedule } = response.data;
        setCourse(course);
        setSchedule(schedule.periods || []);
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
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzMyMTk5NzMwLCJleHAiOjE3MzIyMDE1MzB9.RgHUaQZl-fJkKvpercJ8KClG5b_qyE8S1cq5tApF2m4`,
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
    return null;
  }
  

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleScheduleChange = (index, field, value) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index][field] = value;
    setSchedule(updatedSchedule);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/course/${courseId}`,
        course,
        {
        },
      );
      setCourse(response.data); // 업데이트된 데이터 반영
    } catch (err) {
      console.error(err);
    }
  };

  if (!course) {
    return <p>Loading...</p>;
  }

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
                  name="description"
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
          {schedule.length > 0 ? (
            <ul className="list-disc list-inside">
              {schedule.map((period, index) => (
                <li key={index} className="flex gap-2 items-center">
                  <input
                    value={period.dayOfWeek}
                    onChange={(e) =>
                      handleScheduleChange(index, 'dayOfWeek', e.target.value)
                    }
                    className="text-base font-normal border border-gray-300 rounded-lg p-2 w-1/5"
                  />
                  <input
                    value={period.name}
                    onChange={(e) =>
                      handleScheduleChange(index, 'name', e.target.value)
                    }
                    className="text-base font-normal border border-gray-300 rounded-lg p-2 w-1/5"
                  />
                  <input
                    type="time"
                    value={period.startTime}
                    onChange={(e) =>
                      handleScheduleChange(index, 'startTime', e.target.value)
                    }
                    className="text-base font-normal border border-gray-300 rounded-lg p-2 w-1/4"
                  />
                  <input
                    type="time"
                    value={period.endTime}
                    onChange={(e) =>
                      handleScheduleChange(index, 'endTime', e.target.value)
                    }
                    className="text-base font-normal border border-gray-300 rounded-lg p-2 w-1/4"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">시간표 정보가 없습니다.</p>
          )}
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
        <div className="grid grid-col-2 gap-4">
              <button
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
