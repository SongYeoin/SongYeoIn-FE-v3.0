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
  const [selectedIds, setSelectedIds] = useState([]);


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
        amount: 20,
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

  // 다운로드 함수 추가
  const handleDownloadZip = async () => {
    try {
      const response = await adminJournalApi.downloadZip(selectedIds);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', '교육일지_일괄다운로드.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('일괄 다운로드 실패:', error);
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
    setCurrentPage(1);
    setSelectedIds([]); // 필터 변경 시 선택된 항목 초기화
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
            selectedIds={selectedIds}
            handleDownloadZip={handleDownloadZip}
          />
          <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-[0.5fr_1fr_3fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4">
                <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      setSelectedIds(e.target.checked ? journals.map(j => j.id) : []);
                    }}
                    checked={selectedIds.length === journals.length}
                  />
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 tracking-wider">번호</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 tracking-wider">제목</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 tracking-wider">작성자</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 tracking-wider">교육일자</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 tracking-wider">작성일</span>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-bold text-gray-800 tracking-wider">첨부파일</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {journals.length > 0 ? (
                journals.map((journal, index) => (
                  <div
                    key={journal.id}
                    onClick={() => setSelectedJournal(journal)}
                    className="grid grid-cols-[0.5fr_1fr_3fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                  >
                    <div
                      className="flex items-center justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(journal.id)}
                        onChange={(e) => {
                          setSelectedIds(e.target.checked
                            ? [...selectedIds, journal.id]
                            : selectedIds.filter(id => id !== journal.id)
                          );
                        }}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 text-center">
                      {totalElements - ((currentPage - 1) * 15 + index)}
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                      {journal.title}
                    </div>
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