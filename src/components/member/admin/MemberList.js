import React, { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../common/layout/admin/AdminLayout";
import MemberMainHeader from "./MemberMainHeader";
import axios from "api/axios";
import _ from "lodash";
import MemberDetail from "./MemberDetail";

export const MemberList = () => {
  const [members, setMembers] = useState([]); // 회원 리스트
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [selectedMember, setSelectedMember] = useState(null); // 선택된 회원

  // 회원 데이터를 가져오는 함수
  const fetchMembers = async (search, page) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/member`,
        {
          params: { word: search, page: page - 1, size: 15 },
        }
      );
      setMembers(response.data.content); // 데이터를 상태에 저장
      setTotalPages(response.data.totalPages); // 전체 페이지 수
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  // 디바운스된 검색 함수 생성
  const debouncedFetchMembers = useCallback(
    _.debounce((search, page) => {
      fetchMembers(search, page);
    }, 500),
    []
  );

  // useEffect로 회원 데이터 가져오기
  useEffect(() => {
    debouncedFetchMembers(searchTerm, currentPage);
  }, [searchTerm, currentPage, debouncedFetchMembers]);

  // 검색어 업데이트 함수
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 페이지 초기화
  };

  // 승인 상태 변경 함수
  const handleApprovalChange = async (id, newStatus) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/member/approve/${id}`,
        {},
        { params: { newStatus } }
      );
      fetchMembers(searchTerm, currentPage); // 데이터 새로고침
    } catch (error) {
      console.error("Error updating approval status:", error);
    }
  };

  // 역할 변경 함수
  const handleRoleChange = async (id, newRole) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/admin/member/change-role/${id}`,
        {},
        { params: { newRole } }
      );
      fetchMembers(searchTerm, currentPage); // 데이터 새로고침
    } catch (error) {
      console.error("Error updating member role:", error);
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >

      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          {/* Header */}
          <MemberMainHeader onSearch={handleSearch} />

          <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">
            {/* Table Header - 더 강조된 디자인 */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-6 gap-4 px-6 py-4">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">이름</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">생년월일</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">이메일</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">가입일</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">역할</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 상태</span>
                  </div>
                </div>
              </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="grid grid-cols-6 gap-4 px-6 py-3 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out relative group"
                >
                  <div className="text-sm font-medium text-gray-900 text-center group-hover:text-gray-700">{member.name}</div>
                  <div className="text-sm text-gray-600 text-center group-hover:text-gray-700">{member.birthday}</div>
                  <div className="text-sm text-gray-600 text-center group-hover:text-gray-700">{member.email}</div>
                  <div className="text-sm text-gray-600 text-center group-hover:text-gray-700">{member.enrollDate}</div>
                  <div className="text-center">
                    <select
                      value={member.role}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="w-4/5 px-2 py-0.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mx-auto text-center hover:border-gray-400"
                    >
                      <option value="ADMIN">관리자</option>
                      <option value="STUDENT">학생</option>
                    </select>
                  </div>
                  <div className="text-center">
                    <select
                      value={member.checkStatus}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleApprovalChange(member.id, e.target.value)}
                      className="w-4/5 px-2 py-0.5 text-sm bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 mx-auto text-center hover:border-gray-400"
                    >
                      <option value="Y">승인</option>
                      <option value="N">미승인</option>
                      <option value="W">대기</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
            </div>

            {selectedMember && (
              <MemberDetail
                memberId={selectedMember.id}
                onClose={() => setSelectedMember(null)}
              />
            )}
          </div>
    </AdminLayout>
);
};

export default MemberList;
