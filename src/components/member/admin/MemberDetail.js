import React, { useEffect, useState, useRef } from 'react';
import axios from 'api/axios';
import { Copy, Check } from 'lucide-react';
//import { FaTrash } from 'react-icons/fa';

const MemberDetail = ({ memberId, onClose }) => {
  const [member, setMember] = useState(null);
  const [history, setHistory] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [showCopySuccess, setShowCopySuccess] = useState(false);

  // 모달창 높이 체크
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [member, history]); // member나 history가 변경될 때마다 높이 체크

  // 모달창 관련 코드
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  // 비밀번호 초기화 처리
  const handlePasswordReset = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/member/reset-password/${memberId}`
      );
      setTemporaryPassword(response.data.temporaryPassword);
      setShowResetDialog(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('비밀번호 초기화에 실패했습니다.');
    }
  };

  // 비밀번호 복사
  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[9999] overflow-y-auto">
      <div
        ref={contentRef}
        className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg my-10"
        style={{
          minHeight: 'min-content',
          maxHeight: '90vh',
          margin: contentHeight > window.innerHeight * 0.8 ? '5vh auto' : 'auto',
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">회원 상세보기</h2>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">이름</label>
              <input
                type="text"
                value={member.name || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">아이디</label>
              <input
                type="text"
                value={member.username}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">생년월일</label>
              <input
                type="text"
                value={member.birthday || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">이메일</label>
              <input
                type="text"
                value={member.email || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">역할</label>
              <input
                type="text"
                value={member.role === 'ADMIN' ? '관리자' : '학생'}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">상태</label>
              <input
                type="text"
                value={member.checkStatus === 'Y' ? '활성' : '비활성'}
                readOnly
                className={`w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none ${
                  member.checkStatus === 'Y' ? 'text-green-600'
                    : 'text-gray-600'
                }`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">가입일</label>
              <input
                type="text"
                value={member.enrollDate || ''}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default select-none focus:outline-none"
              />
            </div>
            {member.role !== 'ADMIN' && (
              <div>
                <label className="text-sm text-gray-600 font-bold">보안</label>
                <button
                  className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  onClick={() => setShowResetDialog(true)}
                >
                  비밀번호 초기화
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 비밀번호 초기화 결과 표시 */}
        {temporaryPassword && (
          <div className="mb-6 border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg animate-in slide-in-from-top">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h4 className="font-medium text-blue-900">임시 비밀번호 생성됨</h4>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <code className="flex-1 bg-white px-3 py-2 rounded font-mono text-blue-900">
                {temporaryPassword}
              </code>
              <button
                onClick={handleCopyPassword}
                className="min-w-[80px] px-3 py-1.5 border rounded-lg bg-white hover:bg-blue-50 flex items-center justify-center"
              >
                {showCopySuccess ? (
                  <span className="flex items-center">
                    <Check className="w-4 h-4 mr-1" />
                    복사됨
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Copy className="w-4 h-4 mr-1" />
                    복사
                  </span>
                )}
              </button>
            </div>
            <p className="text-sm text-blue-700">
              ⚠️ 이 비밀번호를 안전하게 회원에게 전달해주세요. 이 창을 닫으면 다시 확인할 수 없습니다.
            </p>
          </div>
        )}

        {/* 수강 신청 (학생인 경우만 표시) */}
        {member.role !== 'ADMIN' && (
          <div className="mb-6 border border-gray-300 rounded-lg p-4">
            <h3 className="text-sm text-gray-600 font-bold mb-4">수강 신청</h3>
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
                className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200 whitespace-nowrap cursor-pointer"
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
            <h3 className="text-sm text-gray-600 font-bold mb-4">수강 이력</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                <tr className="bg-gray-50">
                  <th className="border px-4 py-2 text-sm font-bold text-gray-600">과정명</th>
                  <th className="border px-4 py-2 text-sm font-bold text-gray-600">담당자</th>
                  <th className="border px-4 py-2 text-sm font-bold text-gray-600">개강일</th>
                  <th className="border px-4 py-2 text-sm font-bold text-gray-600">종강일</th>
                  <th className="border px-4 py-2 text-sm font-bold text-gray-600">관리</th>
                </tr>
                </thead>
                <tbody>
                {history.length > 0 ? (
                  history.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2 text-sm text-center">{record.courseName}</td>
                      <td className="border px-4 py-2 text-sm text-center">{record.adminName}</td>
                      <td className="border px-4 py-2 text-sm text-center">{record.enrollDate}</td>
                      <td className="border px-4 py-2 text-sm text-center">{record.endDate}</td>
                      <td className="border px-4 py-2 text-center">
                        <button
                          onClick={() => handleDeleteEnrollment(record.id)}
                          className="text-red-500 hover:text-red-700 transition-colors duration-200 cursor-pointer"
                        >
                          삭제
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
          </div>
        )}

        {/* 비밀번호 초기화 확인 다이얼로그 */}
        {showResetDialog && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-bold">비밀번호 초기화</h3>
              <p>정말 이 회원의 비밀번호를 초기화하시겠습니까?</p>

              <div className="mt-4 flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg" onClick={() => setShowResetDialog(false)}>
                  취소
                </button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg" onClick={handlePasswordReset}>
                  초기화
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberDetail;