import React, { useEffect, useState } from 'react';
import axios from 'api/axios';

const MemberDetail = ({ memberId, onClose }) => {
  const [member, setMember] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 회원 상세 정보와 수강 이력 데이터를 로드
  useEffect(() => {
    const fetchMemberDetail = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/member/detail/${memberId}`, {
        });
        setMember(response.data);
      } catch (error) {
        console.error('Error fetching member details:', error);
      }
    };

    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/member/${memberId}/history`, {
        });
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    const fetchData = async () => {
      setIsLoading(true);
      await fetchMemberDetail();
      await fetchHistory();
      setIsLoading(false);
    };

    fetchData();
  }, [memberId]);

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
            닫기
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

        {/* 수강 이력 */}
        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-4">수강 이력</h3>
          <table className="w-full table-auto border-collapse border border-gray-300">
            <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">날짜</th>
              <th className="border border-gray-300 px-4 py-2">수강 항목</th>
              <th className="border border-gray-300 px-4 py-2">강사</th>
              <th className="border border-gray-300 px-4 py-2">상태</th>
            </tr>
            </thead>
            <tbody>
            {history.length > 0 ? (
              history.map((record, index) => (
                <tr key={index} className="text-center">
                  <td className="border border-gray-300 px-4 py-2">{record.date}</td>
                  <td className="border border-gray-300 px-4 py-2">{record.courseName}</td>
                  <td className="border border-gray-300 px-4 py-2">{record.instructor}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {record.status === 'ACTIVE' ? '활성' : '비활성'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center text-gray-500 py-4">
                  수강 이력이 없습니다.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* 저장 버튼 */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-[#225930] text-white rounded-lg hover:bg-green-700 font-bold"
          >
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetail;
