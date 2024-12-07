import React, { useState, useEffect } from 'react';
import { adminJournalApi } from '../../../api/journalApi';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import AdminJournalHeader from './AdminJournalHeader';
import AdminJournalDetail from './AdminJournalDetail';

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

          <div className="flex flex-col w-full gap-5 p-4 bg-white rounded-xl">
            <div>
              <div className="grid grid-cols-[1fr_3fr_2fr_2fr_2fr_2fr] gap-5">
                <p className="text-sm font-bold text-center text-gray-700">번호</p>
                <p className="text-sm font-bold text-center text-gray-700">제목</p>
                <p className="text-sm font-bold text-center text-gray-700">작성자</p>
                <p className="text-sm font-bold text-center text-gray-700">교육일자</p>
                <p className="text-sm font-bold text-center text-gray-700">작성일</p>
                <p className="text-sm font-bold text-center text-gray-700">첨부파일</p>
              </div>
              <div className="border-b border-gray-200 mt-4"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-4">
              {journals.map((journal, index) => (
                <li key={journal.id}>
                  <div
                    className="grid grid-cols-[1fr_3fr_2fr_2fr_2fr_2fr] gap-5 items-center text-center cursor-pointer hover:bg-gray-100 p-2 rounded text-sm"
                    onClick={() => setSelectedJournal(journal)}
                  >
                    <p>{totalElements - ((currentPage - 1) * 15 + index)}</p>
                    <p>{journal.title}</p>
                    <p>{journal.memberName}</p>
                    <p>{new Date(journal.educationDate).toLocaleDateString()}</p>
                    <p>{new Date(journal.createdAt).toLocaleDateString()}</p>
                    <p>{journal.file ? '첨부됨' : '-'}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

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