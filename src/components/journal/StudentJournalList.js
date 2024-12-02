import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentJournalApi } from '../../api/journalApi';
import StudentLayout from '../common/layout/student/StudentLayout';
import JournalMainHeader from './JournalMainHeader';
import StudentJournalDetail from './StudentJournalDetail';
import StudentJournalCreate from './StudentJournalCreate';

const StudentJournalList = () => {
  const [journals, setJournals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedJournal, setSelectedJournal] = useState(null); // 선택된 교육일지
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useNavigate();

  const fetchJournals = async () => {
    try {
      const response = await studentJournalApi.getList(selectedCourse, {
        pageNum: currentPage,
        amount: 15,
        startDate, // 날짜 파라미터 추가
        endDate
      });

      setJournals(response.data.data);
      setTotalPages(response.data.pageInfo.totalPages);
    } catch (error) {
      console.error('교육일지 목록 조회 실패:', error);
    }
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchJournals();
    }
  }, [selectedCourse, currentPage]);

  // 날짜 변경 핸들러 추가
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    setCurrentPage(1); // 날짜 검색 시 첫 페이지로 리셋
    fetchJournals();
  };

  return (
    <StudentLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
      <JournalMainHeader
        onCourseChange={(courseId) => setSelectedCourse(courseId)}
        onDateChange={handleDateChange}
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
        {journals.map((journal) => (
          <li key={journal.id}>
            <div
              className="grid grid-cols-[1fr_4fr_2fr_2fr] gap-5 items-center text-center cursor-pointer hover:bg-gray-100 p-2 rounded"
              onClick={() => setSelectedJournal(journal)}
            >
              <p>{journal.id}</p>
              <p>{journal.title}</p>
              <p>{new Date(journal.createdAt).toLocaleDateString()}</p>
              <p>{journal.file ? '첨부됨' : '-'}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          작성하기
        </button>
      </div>

      {/* 상세보기 모달 */}
      {selectedJournal && (
        <StudentJournalDetail
          journalId={selectedJournal.id}
          courseId={selectedCourse}  // 추가
          onClose={() => {
            setSelectedJournal(null);
            // 수정이나 삭제 후 목록 새로고침
            fetchJournals();
          }}
        />
      )}

      {/* 작성 모달 */}
      {isCreateModalOpen && (
        <StudentJournalCreate
          courseId={selectedCourse}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchJournals();
            setIsCreateModalOpen(false);
          }}
        />
      )}
    </StudentLayout>
  );
};

export default StudentJournalList;