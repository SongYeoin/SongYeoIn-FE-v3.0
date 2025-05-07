import React, { useState, useEffect, useCallback } from 'react';
import { studentSupportApi } from '../../api/supportApi';
import StudentLayout from '../common/layout/student/StudentLayout';
import SupportHeader from './SupportHeader';
import SupportDetail from './SupportDetail';
import SupportCreate from './SupportCreate';

const SupportList = () => {
  const [supports, setSupports] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const pageSize = 20;

  const fetchSupports = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      console.log("API 검색 요청:", searchTerm);
      const response = await studentSupportApi.getMyList(page, pageSize, searchTerm);
      console.log("API 응답:", response);
      setSupports(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('문의 목록 조회 중 오류:', error);
      alert(error.message || '문의 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchSupports(currentPage);
  }, [currentPage, searchTerm, fetchSupports]);

  const handleSearch = (term) => {
    console.log("검색어 변경:", term);
    setSearchTerm(term);
    setCurrentPage(0); // 검색어 변경 시 첫 페이지로 이동
  };

  // 날짜 형식 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    // 백엔드에서 이미 yyyy-MM-dd 형식으로 오지만, 만약을 위해 처리
    if (dateString.includes(' ')) {
      return dateString.split(' ')[0];
    }
    return dateString;
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

  // 상태 결정 함수 (admin에서 가져옴)
  const getStatus = (support) => {
    // developerResponse가 있고 responseContent가 "해결중"인 경우
    if (support.developerResponse && support.developerResponse.responseContent === "해결중") {
      return 'IN_PROGRESS';
    }
    // developerResponse가 있고 다른 응답 내용인 경우 (완료로 간주)
    else if (support.developerResponse) {
      return 'RESOLVED';
    }
    // 확인은 됐지만 개발자 응답이 없는 경우
    else if (support.isConfirmed) {
      return 'CONFIRMED';
    }
    // 아무것도 없는 경우
    else {
      return 'UNCONFIRMED';
    }
  };

  // 상태에 따른 스타일 및 텍스트 반환 함수 (admin에서 가져옴)
  const getStatusStyle = (status) => {
    switch (status) {
      case 'UNCONFIRMED':
        return { className: 'bg-gray-100 text-gray-600', text: '미확인' };
      case 'CONFIRMED':
        return { className: 'bg-green-100 text-green-800', text: '확인완료' };
      case 'IN_PROGRESS':
        return { className: 'bg-yellow-100 text-yellow-800', text: '해결중' };
      case 'RESOLVED':
        return { className: 'bg-blue-100 text-blue-800', text: '해결완료' };
      default:
        return { className: 'bg-gray-100 text-gray-600', text: '미확인' };
    }
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
        {/* Table Header - 컬럼 수정 (6열에서 5열로) */}
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
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">상태</span>
            </div>
          </div>
        </div>

        {/* Table Body - 상태 관리 로직 변경 */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
              <p className="mt-2 text-gray-500">로딩 중...</p>
            </div>
          ) : supports.length > 0 ? (
            supports.map((support, index) => {
              const status = getStatus(support);
              const statusStyle = getStatusStyle(status);

              return (
                <div
                  key={support.id}
                  onClick={() => openDetailModal(support)}
                  className="grid grid-cols-[1fr_4fr_1fr_1fr_1fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
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
                    <span className={`px-2 py-1 rounded-full text-xs ${statusStyle.className}`}>
                      {statusStyle.text}
                    </span>
                  </div>
                </div>
              );
            })
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