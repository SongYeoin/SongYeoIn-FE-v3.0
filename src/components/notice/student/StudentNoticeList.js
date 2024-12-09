import React, { useCallback, useEffect, useState } from 'react';
import StudentLayout from '../../common/layout/student/StudentLayout';
import NoticeMainHeader from './NoticeMainHeader';
import NoticeDetail from './NoticeDetail';
import axios from 'api/axios';
import _ from 'lodash';

const StudentNoticeList = () => {
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
        `${process.env.REACT_APP_API_URL}/notice`,
        {
          params: {
            titleKeyword: search,
            page: page - 1, // 0-based 페이지 번호 사용
            size: 15,
            courseId,
          },
        },
      );
      setNotices(response.data.content); // 데이터를 상태에 저장
      setTotalPages(response.data.totalPages); // 전체 페이지 수 설정
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  // 디바운스된 공지사항 데이터 요청
  const debouncedFetchNotices = useCallback(
    _.debounce((search, page, courseId) => {
      fetchNotices(search, page, courseId);
    }, 500),
    [],
  );

  // 검색어가 변경되면 페이지를 1로 초기화
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 페이지 초기화
  };

  // useEffect로 공지사항 데이터 가져오기
  useEffect(() => {
    debouncedFetchNotices(searchTerm, currentPage, selectedCourse);
  }, [searchTerm, currentPage, selectedCourse, debouncedFetchNotices]);

  return (
    <StudentLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          {/* Header Component */}
          <NoticeMainHeader
            onSearch={handleSearch}
            onCourseChange={(value) => setSelectedCourse(value)}
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
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-4">
              {notices.map((notice) => (
                <li key={notice.id}>
                  <div
                    className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] gap-5 items-center text-center cursor-pointer hover:bg-gray-100 p-2 rounded text-sm"
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
        </div>

        {/* Notice Detail Modal */}
        {selectedNotice && (
          <NoticeDetail
            noticeId={selectedNotice.id}
            onClose={() => setSelectedNotice(null)}
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentNoticeList;
