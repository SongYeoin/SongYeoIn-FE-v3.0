import React, { useCallback, useEffect, useState } from 'react';
import StudentLayout from '../../common/layout/student/StudentLayout';
import NoticeMainHeader from './NoticeMainHeader';
import NoticeDetail from './NoticeDetail';
import axios from 'api/axios';

const StudentNoticeList = () => {
  const [notices, setNotices] = useState([]); // 공지사항 리스트
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [searchTerm, setSearchTerm] = useState(''); // 검색어
  const [selectedCourse, setSelectedCourse] = useState(''); // 선택된 교육 과정
  const [courses, setCourses] = useState([]); // 교육 과정 목록
  const [selectedNotice, setSelectedNotice] = useState(null); // 선택된 공지사항

  // 공지사항 데이터 가져오기
  const fetchNotices = useCallback(
    async (search, page, courseId) => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/notice`, {
          params: {
            titleKeyword: search,
            page: page - 1, // 0-based 페이지 번호
            size: 15,
            courseId,
          },
        });
        setNotices(response.data.content); // 공지사항 목록 설정
        setTotalPages(response.data.totalPages); // 전체 페이지 수 설정
      } catch (error) {
        console.error('Error fetching notices:', error);
      }
    },
    []
  );

  // 교육 과정 목록 가져오기
  const fetchCourses = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/enrollments/my`);
      if (response.status === 200) {
        const coursesData = response.data;
        setCourses(coursesData); // 교육 과정 목록 설정
        if (coursesData.length > 0) {
          const firstCourseId = coursesData[0].courseId;
          setSelectedCourse(firstCourseId); // 첫 번째 과정으로 초기화
          fetchNotices(searchTerm, 1, firstCourseId); // 초기 공지사항 로드
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }, [fetchNotices, searchTerm]);

  // 검색어 변경 처리
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 페이지 초기화
    fetchNotices(value, 1, selectedCourse); // 검색 결과 로드
  };

  // 교육 과정 변경 처리
  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId); // 선택된 과정 상태 업데이트
    setCurrentPage(1); // 페이지 초기화
    fetchNotices(searchTerm, 1, courseId); // 선택된 과정의 공지사항 로드
  };

  // 페이지 변경 처리
  const handlePageChange = (page) => {
    setCurrentPage(page); // 페이지 상태 업데이트
    fetchNotices(searchTerm, page, selectedCourse); // 해당 페이지 데이터 로드
  };

  // 컴포넌트 마운트 시 초기 데이터 가져오기
  useEffect(() => {
    fetchCourses(); // 초기 데이터 로드
  }, [fetchCourses]);

  return (
    <StudentLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          {/* Header Component */}
          <NoticeMainHeader
            courses={courses}
            selectedCourse={selectedCourse}
            onSearch={handleSearch}
            onCourseChange={handleCourseChange}
          />

          {/* Notices Table */}
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
