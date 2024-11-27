import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import NoticeMainHeader from './NoticeMainHeader';
import NoticeDetail from './NoticeDetail';
import NoticeEdit from './NoticeEdit';
import axios from 'api/axios';
import _ from 'lodash';

const AdminNoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null); // 현재 선택된 공지사항
  const [isEditing, setIsEditing] = useState(false); // 수정 모달 활성화 여부

  // 공지사항 데이터 가져오기
  const fetchNotices = async (searchTerm, page, courseId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/notice`,
        {
          params: { titleKeyword: searchTerm, page: page - 1, size: 10, courseId },
        }
      );
      setNotices(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  // 디바운스된 공지사항 데이터 요청
  const debouncedFetchNotices = useCallback(
    _.debounce((search, page, courseId) => {
      fetchNotices(search, page, courseId);
    }, 500),
    []
  );

  useEffect(() => {
    debouncedFetchNotices(searchTerm, currentPage, selectedCourse);
  }, [searchTerm, currentPage, selectedCourse, debouncedFetchNotices]);

  return (
    <AdminLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      {/* Header Component */}
      <NoticeMainHeader
        onSearch={(value) => setSearchTerm(value)}
        onCourseChange={(value) => setSelectedCourse(value)}
        fetchNotices={fetchNotices}
      />

      {/* Notices Table */}
      <div className="flex flex-col w-full gap-5 p-4 bg-white rounded-xl">
        <div className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] gap-5">
          <p className="text-xs font-bold text-center text-gray-700">번호</p>
          <p className="text-xs font-bold text-center text-gray-700">제목</p>
          <p className="text-xs font-bold text-center text-gray-700">작성자</p>
          <p className="text-xs font-bold text-center text-gray-700">작성일</p>
          <p className="text-xs font-bold text-center text-gray-700">조회수</p>
        </div>
      </div>
      <ul className="space-y-4">
        {notices.map((notice) => (
          <li key={notice.id}>
            <div
              className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] gap-5 items-center text-center cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => setSelectedNotice(notice)}
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

      {/* Notice Detail Modal */}
      {selectedNotice && !isEditing && (
        <NoticeDetail
          noticeId={selectedNotice.id}
          onClose={() => setSelectedNotice(null)}
          onEdit={() => setIsEditing(true)} // 수정 버튼 클릭 시 수정 모달 활성화
          onDelete={() => {
            // 삭제 후 상태 업데이트
            setSelectedNotice(null); // 모달 닫기
            fetchNotices(searchTerm, currentPage, selectedCourse); // 목록 갱신
          }}
        />
      )}

      {/* Notice Edit Modal */}
      {selectedNotice && isEditing && (
        <NoticeEdit
          notice={selectedNotice}
          onClose={() => {
            setIsEditing(false); // 수정 모달 닫기
          }}
          onSave={() => {
            setIsEditing(false); // 저장 후 수정 모달 닫기
            fetchNotices(searchTerm, currentPage, selectedCourse); // 데이터 갱신
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminNoticeList;
