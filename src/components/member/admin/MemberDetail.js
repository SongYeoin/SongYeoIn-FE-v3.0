import React, { useEffect, useState } from 'react';
import axios from 'api/axios';

const MemberDetail = ({ memberId, onClose }) => {
  const [member, setMember] = useState(null);
  const [history, setHistory] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const fetchMemberDetail = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/member/detail/${memberId}`,
        );
        setMember(response.data);
      } catch (error) {
        console.error('Error fetching member details:', error);
      }
    };

    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/enrollments?memberId=${memberId}`,
        );
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/admin/course/list`,
        );
        setAvailableCourses(response.data);
      } catch (error) {
        console.error('Error fetching available courses:', error);
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchMemberDetail(), fetchHistory(), fetchCourses()]);
      setIsLoading(false);
    };

    fetchData();
  }, [memberId]);

  const handleEnroll = async () => {
    if (!selectedCourseId) {
      return;
    }
    try {
      const requestDTO = {
        courseId: selectedCourseId,
        memberId: member.id,
      };
      await axios.post(`${process.env.REACT_APP_API_URL}/enrollments`, requestDTO);
      alert('수강 신청이 완료되었습니다');
      setSelectedCourseId('');
      const updatedHistory = await axios.get(
        `${process.env.REACT_APP_API_URL}/enrollments?memberId=${memberId}`,
      );
      setHistory(updatedHistory.data);
    } catch (error) {
      console.error('Error enrolling course:', error);
      alert('수강 신청에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/enrollments/${enrollmentId}`,
        { params: { memberId } },
      );
      alert('수강 신청이 삭제되었습니다');
      const updatedHistory = await axios.get(
        `${process.env.REACT_APP_API_URL}/enrollments?memberId=${memberId}`,
      );
      setHistory(updatedHistory.data);
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      alert('수강 신청 삭제에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>회원 정보를 가져올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">수강생 상세보기</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
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
        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4">기본 정보</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">이름</label>
              <input
                type="text"
                value={member.name || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">역할</label>
              <input
                type="text"
                value={member.role === 'ADMIN' ? '관리자' : '학생'}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">생년월일</label>
              <input
                type="text"
                value={member.birthday || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">이메일</label>
              <input
                type="text"
                value={member.email || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">가입일</label>
              <input
                type="text"
                value={member.enrollDate || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">상태</label>
              <input
                type="text"
                value={member.checkStatus === 'Y' ? '활성' : '비활성'}
                readOnly
                className={`w-full px-3 py-2 border rounded-lg ${
                  member.checkStatus === 'Y' ? 'bg-green-100' : 'bg-red-100'
                }`}
              />
            </div>
          </div>
        </div>

        {/* 수강 신청 (학생인 경우만 표시) */}
        {member.role !== 'ADMIN' && (
          <div className="mb-6 border border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4">수강 신청</h3>
            <div className="flex gap-4 items-center">
              <select
                className="px-4 py-2 border rounded-lg w-full"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="">수강신청할 과목을 선택하세요</option>
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleEnroll}
                className="px-4 py-2 bg-[#225930] text-white rounded-lg hover:bg-green-700 font-bold whitespace-nowrap"
                disabled={!selectedCourseId}
              >
                추가
              </button>
            </div>
          </div>
        )}

        {/* 수강 이력 (학생인 경우만 표시) */}
        {member.role !== 'ADMIN' && (
          <div className="mb-6 border border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4">수강 이력</h3>
            <table
              className="w-full table-auto border-collapse border border-gray-300"
            >
              <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">과정명</th>
                <th className="border border-gray-300 px-4 py-2">담당자</th>
                <th className="border border-gray-300 px-4 py-2">개강일</th>
                <th className="border border-gray-300 px-4 py-2">종강일</th>
                <th className="border border-gray-300 px-4 py-2">삭제</th>
              </tr>
              </thead>
              <tbody>
              {history.length > 0 ? (
                history.map((record) => (
                  <tr key={record.id} className="text-center">
                    <td className="border border-gray-300 px-4 py-2">
                      {record.courseName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.adminName}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.enrollDate}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {record.endDate}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <button
                        onClick={() => handleDeleteEnrollment(record.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">
                    수강 이력이 없습니다.
                  </td>
                </tr>
              )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetail;
