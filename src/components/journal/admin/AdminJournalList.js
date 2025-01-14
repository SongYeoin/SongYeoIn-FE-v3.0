import React, { useState, useEffect } from 'react';
import { adminJournalApi } from '../../../api/journalApi';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import AdminJournalHeader from './AdminJournalHeader';
import AdminJournalDetail from './AdminJournalDetail';
import { BsPaperclip } from "react-icons/bs";  // 상단에 추가


const AdminJournalList = () => {
  const [journals, setJournals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [courses, setCourses] = useState([]);

  const [filters, setFilters] = useState({
    courseId: '',
    studentName: '',
    startDate: '',
    endDate: ''
  });

  // 교육과정 목록 조회
  const fetchCourses = async () => {
    try {
      const response = await adminJournalApi.getCourses();
      setCourses(response.data);
    } catch (error) {
      console.error('교육과정 목록 조회 실패:', error);
    }
  };

  // 교육일지 목록 조회
  const fetchJournals = async () => {
    try {
      const response = await adminJournalApi.getList(filters.courseId, {
        pageNum: currentPage,
        amount: 15,
        searchType: 'name',
        searchKeyword: filters.studentName,
        startDate: filters.startDate,
        endDate: filters.endDate
      });

      setJournals(response.data.data);
      setTotalPages(response.data.pageInfo.totalPages);
      setTotalElements(response.data.pageInfo.totalElements); // 추가
    } catch (error) {
      console.error('교육일지 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (filters.courseId) {
      fetchJournals();
    }
  }, [currentPage, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);  // 필터 변경 시 1페이지로 리셋
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <AdminJournalHeader
            courses={courses}
            onFilterChange={handleFilterChange}
          />

          <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">
            {/* Table Header */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-[1fr_3fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4">
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
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">교육일자</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성일</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">첨부파일</span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto">
              {journals.length > 0 ? (
                journals.map((journal, index) => (
                  <div
                    key={journal.id}
                    onClick={() => setSelectedJournal(journal)}
                    className="grid grid-cols-[1fr_3fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                  >
                    <div className="text-sm font-medium text-gray-900 text-center">
                      {totalElements - ((currentPage - 1) * 15 + index)}
                    </div>
                    <div className="text-sm text-gray-600 text-center">{journal.title}</div>
                    <div className="text-sm text-gray-600 text-center">{journal.memberName}</div>
                    <div className="text-sm text-gray-600 text-center">
                      {new Date(journal.educationDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                      {new Date(journal.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                      {journal.file ? (
                        <BsPaperclip className="w-5 h-5 mx-auto text-gray-500" />
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-center text-gray-500 py-4">교육일지 데이터가 없습니다.</div>
              )}
            </div>
          </div>
        </div> {/* 여기에 flex-shrink-0 div 닫는 태그 추가 */}

        {selectedJournal && (
          <AdminJournalDetail
            journalId={selectedJournal.id}
            onClose={() => {
              setSelectedJournal(null);
              fetchJournals();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminJournalList;