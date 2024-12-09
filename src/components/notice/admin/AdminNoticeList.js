import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import NoticeMainHeader from './NoticeMainHeader';
import axios from 'api/axios';
import _ from 'lodash';
import NoticeDetail from './NoticeDetail';

const AdminNoticeList = () => {
  const [notices, setNotices] = useState([]); // 공지사항 리스트
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [searchTerm, setSearchTerm] = useState(''); // 검색어
  const [selectedCourse, setSelectedCourse] = useState(''); // 선택된 교육 과정
  const [selectedNotice, setSelectedNotice] = useState(null); // 선택된 공지사항

  // 공지사항 데이터를 가져오는 함수
  const fetchNotices = async (search, page, courseId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/notice`,
        {
          params: { titleKeyword: search, page: page - 1, size: 15, courseId },
        }
      );
      setNotices(response.data.content); // 데이터를 상태에 저장
      setTotalPages(response.data.totalPages); // 전체 페이지 수
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  // 디바운스된 검색 함수 생성
  const debouncedFetchNotices = useCallback(
    _.debounce((search, page, courseId) => {
      fetchNotices(search, page, courseId);
    }, 500),
    []
  );

  // 검색어가 변경되면 페이지를 초기화
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 페이지 초기화
  };

  // 셀렉트 박스 값 변경 시 검색 조건 초기화
  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    setSearchTerm(''); // 검색어 초기화
    setCurrentPage(1); // 페이지 초기화
  };

  // useEffect로 공지사항 데이터 가져오기
  useEffect(() => {
    debouncedFetchNotices(searchTerm, currentPage, selectedCourse);
  }, [searchTerm, currentPage, selectedCourse, debouncedFetchNotices]);

  return (
    <AdminLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          {/* Header */}
          <NoticeMainHeader
            onSearch={handleSearch}
            onCourseChange={handleCourseChange}
          />

          {/* Notices Table */}
          <div className="flex flex-col w-full gap-5 p-4 bg-white rounded-xl">
            <div>
              <div className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] gap-5">
                <p
                  className="text-sm font-bold text-center text-gray-700">번호</p>
                <p
                  className="text-sm font-bold text-center text-gray-700">제목</p>
                <p
                  className="text-sm font-bold text-center text-gray-700">작성자</p>
                <p
                  className="text-sm font-bold text-center text-gray-700">작성일</p>
                <p
                  className="text-sm font-bold text-center text-gray-700">조회수</p>
              </div>
              <div className="border-b border-gray-200 mt-4"></div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Table Rows */}
              <ul className="space-y-4">
                {notices.map((notice) => (
                  <li key={notice.id}>
                    <div
                      className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] items-center text-center cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out p-2 rounded text-sm"
                      onClick={() => setSelectedNotice(notice)} // 줄 클릭 시 모달 열기
                    >
                      <p>{notice.postNumber}</p>
                      <p>{notice.title}</p>
                      <p>{notice.memberName}</p>
                      <p>{notice.regDate}</p>
                      <p>{notice.viewCount}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Notice Detail Modal */}
        {selectedNotice && (
          <NoticeDetail
            noticeId={selectedNotice.id}
            onClose={(isUpdated) => {
              setSelectedNotice(null);
              if (isUpdated) {
                fetchNotices(searchTerm, currentPage, selectedCourse); // 수정 후 목록 갱신
              }
            }}
            onDelete={() => {
              setSelectedNotice(null);
              if (notices.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
              }
              fetchNotices(searchTerm, currentPage, selectedCourse); // 삭제 후 목록 갱신
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNoticeList;
