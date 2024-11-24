import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import MemberMainHeader from './MemberMainHeader';
import MemberDetail from './MemberDetail';
import axios from 'api/axios';
import _ from 'lodash';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  // 회원 데이터 가져오기
  const fetchMembers = async (search, page) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/member`, {
        params: { word: search, page: page - 1, size: 10 },
      });
      setMembers(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const debouncedFetchMembers = useCallback(
    _.debounce((search, page) => fetchMembers(search, page), 500),
    []
  );

  useEffect(() => {
    debouncedFetchMembers(searchTerm, currentPage);
  }, [searchTerm, currentPage, debouncedFetchMembers]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleApprovalChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/member/approve/${id}`,
        {},
        {
          params: { newStatus },
        }
      );
      fetchMembers(searchTerm, currentPage); // 데이터 새로고침
    } catch (error) {
      console.error('Error updating approval status:', error);
    }
  };

  return (
    <AdminLayout>
      <MemberMainHeader onSearch={handleSearch} />
      <div className="bg-white rounded-lg p-6 shadow-md">
        <table className="w-full table-auto">
          <thead>
          <tr className="border-b text-left">
            <th className="px-4 py-2">이름</th>
            <th className="px-4 py-2">생년월일</th>
            <th className="px-4 py-2">이메일</th>
            <th className="px-4 py-2">가입일</th>
            <th className="px-4 py-2">역할</th>
            <th className="px-4 py-2">승인 상태</th>
          </tr>
          </thead>
          <tbody>
          {members.map((member) => (
            <tr key={member.id} className="hover:bg-gray-100">
              <td
                className="px-4 py-2 cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                {member.name}
              </td>
              <td className="px-4 py-2">{member.birthday}</td>
              <td className="px-4 py-2">{member.email}</td>
              <td className="px-4 py-2">{member.enrollDate}</td>
              <td className="px-4 py-2">{member.role === 'ADMIN' ? '관리자' : '학생'}</td>
              <td className="px-4 py-2">
                <select
                  value={member.checkStatus}
                  onChange={(e) => handleApprovalChange(member.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="Y">승인</option>
                  <option value="N">미승인</option>
                </select>
              </td>
            </tr>
          ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 mx-1 border ${
                currentPage === page ? 'bg-green-500 text-white' : 'bg-white'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetail memberId={selectedMember.id} onClose={() => setSelectedMember(null)} />
      )}
    </AdminLayout>
  );
};

export default MemberList;
