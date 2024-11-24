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
      {/* Header */}
      <MemberMainHeader onSearch={handleSearch} />
      <div className="flex flex-col w-full gap-5 p-4 bg-white rounded-xl">
        {/* Table Header */}
        <div className="grid grid-cols-7 gap-5">
          <p className="text-xs font-bold text-center text-gray-700">이름</p>
          <p className="text-xs font-bold text-center text-gray-700">생년월일</p>
          <p className="text-xs font-bold text-center text-gray-700">이메일</p>
          <p className="text-xs font-bold text-center text-gray-700">가입일</p>
          <p className="text-xs font-bold text-center text-gray-700">역할</p>
          <p className="text-xs font-bold text-center text-gray-700">승인 상태</p>
        </div>
        {/* Table Rows */}
        <ul className="space-y-4">
          {members.map((member) => (
            <li key={member.id}>
              <div
                className="grid grid-cols-7 items-center text-center cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out p-2 rounded"
                onClick={() => setSelectedMember(member)} // 줄 클릭 시 모달 열기
              >
                <h3 className="bg-white p-1 rounded shadow font-semibold">
                  {member.name}
                </h3>
                <p>{member.birthday}</p>
                <p>{member.email}</p>
                <p>{member.enrollDate}</p>
                {/* 역할 변경 드롭다운 */}
                <select
                  value={member.role}
                  onClick={(e) => e.stopPropagation()} // 드롭다운 클릭 시 모달 방지
                  onChange={(e) => handleRoleChange(member.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm bg-white"
                >
                  <option value="ADMIN">관리자</option>
                  <option value="STUDENT">학생</option>
                </select>
                {/* 승인 상태 변경 드롭다운 */}
                <select
                  value={member.checkStatus}
                  onClick={(e) => e.stopPropagation()} // 드롭다운 클릭 시 모달 방지
                  onChange={(e) => handleApprovalChange(member.id, e.target.value)}
                  className="border rounded px-2 py-1 text-sm bg-white"
                >
                  <option value="Y">승인</option>
                  <option value="N">미승인</option>
                  <option value="W">대기</option>
                </select>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {/* Member Detail Modal */}
      {selectedMember && (
        <MemberDetail
          memberId={selectedMember.id}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </AdminLayout>
  );
};

export default MemberList;
