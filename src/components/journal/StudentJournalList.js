import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentJournalApi } from '../../api/journalApi';
import StudentLayout from '../common/layout/student/StudentLayout';
import StudentJournalMainHeader from './StudentJournalMainHeader';
import StudentJournalDetail from './StudentJournalDetail';

const StudentJournalList = () => {
  const [journals, setJournals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    courseId: '',
    startDate: '',
    endDate: ''
  });
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [totalElements, setTotalElements] = useState(0);

  useNavigate();

  const fetchJournals = async () => {
    try {
      const response = await studentJournalApi.getList(filters.courseId, {
        pageNum: currentPage,
        amount: 15,
        startDate: filters.startDate,
        endDate: filters.endDate
      });

      setJournals(response.data.data);
      setTotalPages(response.data.pageInfo.totalPages);
      setJournals(response.data.data);
      setTotalPages(response.data.pageInfo.totalPages);
      setTotalElements(response.data.pageInfo.totalElements);
    } catch (error) {
      console.error('교육일지 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    if (filters.courseId) {
      fetchJournals();
    }
  }, [filters, currentPage]); // filters가 변경될 때마다 fetchJournals 호출

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 리셋
  };

  return (
    <StudentLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      <StudentJournalMainHeader
        onFilterChange={handleFilterChange}
        refreshJournals={fetchJournals}
      />

      <div className="flex flex-col w-full gap-5 p-4 bg-white rounded-xl">
        <div className="grid grid-cols-[1fr_4fr_2fr_2fr] gap-5">
          <p className="text-xs font-bold text-center text-gray-700">번호</p>
          <p className="text-xs font-bold text-center text-gray-700">제목</p>
          <p className="text-xs font-bold text-center text-gray-700">작성일</p>
          <p className="text-xs font-bold text-center text-gray-700">첨부파일</p>
        </div>
      </div>

      <ul className="space-y-4">
        {journals.map((journal, index) => (
          <li key={journal.id}>
            <div
              className="grid grid-cols-[1fr_4fr_2fr_2fr] gap-5 items-center text-center cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => setSelectedJournal(journal)}
            >
              <p>{totalElements - ((currentPage - 1) * 15 + index)}</p>
              <p>{journal.title}</p>
              <p>{new Date(journal.createdAt).toLocaleDateString()}</p>
              <p>{journal.file ? '첨부됨' : '-'}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* 상세보기 모달 */}
      {selectedJournal && (
        <StudentJournalDetail
          journalId={selectedJournal.id}
          courseId={filters.courseId}  // selectedCourse를 filters.courseId로 변경
          onClose={() => {
            setSelectedJournal(null);
            // 수정이나 삭제 후 목록 새로고침
            fetchJournals();
          }}
        />
      )}
    </StudentLayout>
  );
};

export default StudentJournalList;