import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import NoticeMainHeader from './NoticeMainHeader';
import NoticeDetail from './NoticeDetail';
import axios from 'api/axios';
import _ from 'lodash';
import { BsPaperclip } from "react-icons/bs";

const AdminNoticeList = () => {
  const [notices, setNotices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/admin/course/list`);
      setCourses(data);

      if (data.length > 0 && !selectedCourse) {
        const firstCourseId = data[0].id;
        setSelectedCourse(firstCourseId);
        fetchNotices('', 1, firstCourseId);
      }

    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchNotices = async (search, page, courseId) => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/admin/notice`, {
        params: { titleKeyword: search, page: page - 1, size: 20, courseId },
      });

      // 상단고정과 일반 게시글 분리
      const pinnedNotices = data.content.filter((notice) => notice.isPinned);
      const regularNotices = data.content.filter((notice) => !notice.isPinned);

      // 게시글 번호 역순 계산 (상단고정 제외)
      const totalRegularNotices = data.totalElements - pinnedNotices.length;
      const paginatedRegularNotices = regularNotices.map((notice, index) => ({
        ...notice,
        postNumber: totalRegularNotices - (page - 1) * 20 - index,
      }));

      // 상단고정 + 역순 일반 게시글 병합
      const mergedNotices = [...pinnedNotices, ...paginatedRegularNotices];

      setNotices(mergedNotices);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  const refreshNoticeList = useCallback(() => {
    fetchNotices(searchTerm, currentPage, selectedCourse);
  }, [searchTerm, currentPage, selectedCourse]);

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
          courses={courses}
          selectedCourse={selectedCourse}
          onSearch={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          onCourseChange={(courseId) => {
            setSelectedCourse(courseId);
            setSearchTerm('');
            setCurrentPage(1);
          }}
          fetchNotices={fetchNotices}
        />

        <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">
          {/* Table Header */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] gap-4 px-6 py-4">
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">번호</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">제목</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성자</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성일</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">조회수</span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div
                  key={notice.id}
                  onClick={() => setSelectedNotice(notice)}
                  className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                >
                  <div className="text-sm font-medium text-gray-900 text-center">
                    {notice.isPinned ? '📌' : notice.postNumber}
                  </div>
                  <div className="text-sm text-gray-600 text-center flex items-center justify-center">
                    {notice.files && notice.files.length > 0 && (
                      <BsPaperclip className="w-5 h-5 text-gray-500 mr-1" />
                    )}
                    {notice.title}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    {notice.memberName}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    {notice.regDate}
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    {notice.viewCount}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-center text-gray-500 py-4">
                공지사항 데이터가 없습니다.
              </div>
            )}
          </div>
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
              refreshNoticeList();
            }}
            refreshNoticeList={refreshNoticeList}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNoticeList;
