import React, { useState, useEffect, useCallback } from 'react';
import { studentSupportApi } from '../../api/supportApi';
import StudentLayout from '../common/layout/student/StudentLayout';
import SupportHeader from './SupportHeader';
import SupportDetail from './SupportDetail';
import SupportCreate from './SupportCreate';
import _ from 'lodash';

const SupportList = () => {
  const [supports, setSupports] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0); // 총 항목 수 상태 추가
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const pageSize = 20; // 페이지당 항목 수 (고정값으로 설정)

  const fetchSupports = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      // 검색어 파라미터 추가
      const response = await studentSupportApi.getMyList(page, pageSize, searchTerm);
      setSupports(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements); // 총 항목 수 저장
    } catch (error) {
      console.error('문의 목록 조회 중 오류:', error);
      alert(error.message || '문의 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]); // 검색어 의존성 추가

  useEffect(() => {
    fetchSupports(currentPage);
  }, [currentPage, fetchSupports]);

  const debouncedSearch = useCallback(
    _.debounce((term) => {
      setSearchTerm(term);
      setCurrentPage(0);
      fetchSupports(0);
    }, 500),
    [fetchSupports]
  );

  // 날짜 형식 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // 백엔드에서 이미 yyyy-MM-dd 형식으로 오지만, 만약을 위해 처리
    if (dateString.includes(' ')) {
      return dateString.split(' ')[0];
    }
    return dateString;
  };

  const handleSearch = (term) => {
    debouncedSearch(term);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const openCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const openDetailModal = (support) => {
    setSelectedSupport(support);
  };

  const closeDetailModal = () => {
    setSelectedSupport(null);
  };

  return (
    <StudentLayout
      currentPage={currentPage + 1}
      totalPages={totalPages}
      onPageChange={(page) => handlePageChange(page - 1)}
    >
      <SupportHeader
        onSearch={handleSearch}
        onCreate={openCreateModal}
      />

      <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">
        {/* Table Header - 컬럼 하나 추가 (5열에서 6열로) */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4">
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
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">상태</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">개발팀</span>
            </div>
          </div>
        </div>

        {/* Table Body - 컬럼 하나 추가 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-500">로딩 중...</p>
            </div>
          ) : supports.length > 0 ? (
            supports.map((support, index) => (
              <div
                key={support.id}
                onClick={() => openDetailModal(support)}
                className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
              >
                <div className="text-sm font-medium text-gray-900 text-center">
                  {totalElements - (currentPage * pageSize + index)}
                </div>
                <div className="text-sm text-gray-600 text-center">
                  {support.title}
                </div>
                <div className="text-sm text-gray-600 text-center">
                  {support.memberName}
                </div>
                <div className="text-sm text-gray-600 text-center">
                  {formatDate(support.regDate)}
                </div>
                <div className="text-sm text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    support.isConfirmed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {support.isConfirmed ? '확인완료' : '미확인'}
                  </span>
                </div>
                <div className="text-sm text-center">
                 <span className={`px-2 py-1 rounded-full text-xs ${
                   support.developerResponse
                     ? 'bg-blue-100 text-blue-800'
                     : 'bg-gray-100 text-gray-600'
                 }`}>
                   {support.developerResponse ? '답변완료' : '대기중'}
                 </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-center text-gray-500 py-10">
              등록된 문의가 없습니다.
            </div>
          )}
        </div>
      </div>

      {selectedSupport && (
        <SupportDetail
          supportId={selectedSupport.id}
          onClose={closeDetailModal}
          refreshList={() => fetchSupports(currentPage)}
        />
      )}

      <SupportCreate
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        refreshList={() => fetchSupports(0)}
      />
    </StudentLayout>
  );
};

export default SupportList;