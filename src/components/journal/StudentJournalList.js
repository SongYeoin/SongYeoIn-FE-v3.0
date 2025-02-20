import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentJournalApi } from '../../api/journalApi';
import StudentLayout from '../common/layout/student/StudentLayout';
import StudentJournalHeader from './StudentJournalHeader';
import StudentJournalDetail from './StudentJournalDetail';
import { BsPaperclip } from "react-icons/bs";

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
  const [pageSize, setPageSize] = useState(20);

  useNavigate();

  const fetchJournals = async () => {
    try {
      const response = await studentJournalApi.getList(filters.courseId, {
        pageNum: currentPage,
        amount: 20,
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      setJournals(response.data.data);
      setTotalPages(response.data.pageInfo.totalPages);
      setTotalElements(response.data.pageInfo.totalElements);
      setPageSize(response.data.pageInfo.pageSize);
    } catch (error) {
      alert(error.response?.data?.message || '교육일지 목록 조회에 실패했습니다.');
    }
  };

  useEffect(() => {
    if (filters.courseId) {
      fetchJournals();
    }
  }, [filters, currentPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <StudentLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      <div className="flex flex-col h-full">
        <div className="flex-shrink-0">
          <StudentJournalHeader
            onFilterChange={handleFilterChange}
            refreshJournals={fetchJournals}
          />

          <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">
            {/* Table Header */}
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-[1fr_4fr_2fr_2fr_2fr] gap-4 px-6 py-4">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">번호</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">제목</span>
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
                    className="grid grid-cols-[1fr_4fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                  >
                    <div className="text-sm font-medium text-gray-900 text-center">
                      {totalElements - ((currentPage - 1) * pageSize + index)}
                    </div>
                    <div className="text-sm text-gray-600 text-center">{journal.title}</div>
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
        </div>

        {/* 상세보기 모달 */}
        {selectedJournal && (
          <StudentJournalDetail
            journalId={selectedJournal.id}
            courseId={filters.courseId}
            onClose={() => {
              setSelectedJournal(null);
              fetchJournals();
            }}
          />
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentJournalList;