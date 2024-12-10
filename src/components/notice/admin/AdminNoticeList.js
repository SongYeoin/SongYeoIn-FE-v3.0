import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import NoticeMainHeader from './NoticeMainHeader';
import axios from 'api/axios';
import _ from 'lodash';
import NoticeDetail from './NoticeDetail';

const AdminNoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedNotice, setSelectedNotice] = useState(null);

  const fetchNotices = async (search, page, courseId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/notice`,
        {
          params: { titleKeyword: search, page: page - 1, size: 15, courseId },
        }
      );
      setNotices(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

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
      <div className="flex flex-col h-full">
        <NoticeMainHeader
          onSearch={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          onCourseChange={(courseId) => {
            setSelectedCourse(courseId);
            setSearchTerm('');
            setCurrentPage(1);
          }}
          fetchNotices={fetchNotices} // 추가
        />
        <div className="flex flex-col w-full gap-5 p-4 bg-white rounded-xl">
          <div>
            <div className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] gap-5">
              <p className="text-sm font-bold text-center text-gray-700">번호</p>
              <p className="text-sm font-bold text-center text-gray-700">제목</p>
              <p className="text-sm font-bold text-center text-gray-700">작성자</p>
              <p className="text-sm font-bold text-center text-gray-700">작성일</p>
              <p className="text-sm font-bold text-center text-gray-700">조회수</p>
            </div>
            <div className="border-b border-gray-200 mt-4"></div>
          </div>
          <ul className="space-y-4">
            {notices.map((notice) => (
              <li key={notice.id}>
                <div
                  className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] items-center text-center cursor-pointer hover:bg-gray-100 transition duration-200 ease-in-out p-2 rounded text-sm"
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
        </div>
        {selectedNotice && (
          <NoticeDetail
            noticeId={selectedNotice.id}
            onClose={(isUpdated) => {
              setSelectedNotice(null);
              if (isUpdated) {
                fetchNotices(searchTerm, currentPage, selectedCourse);
              }
            }}
            onDelete={() => {
              setSelectedNotice(null);
              if (notices.length === 1 && currentPage > 1) {
                setCurrentPage((prev) => prev - 1);
              }
              fetchNotices(searchTerm, currentPage, selectedCourse);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNoticeList;
