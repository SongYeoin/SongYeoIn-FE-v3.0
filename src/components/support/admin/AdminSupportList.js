import React, { useState, useEffect, useCallback } from 'react';
import { adminSupportApi } from '../../../api/supportApi';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import AdminSupportHeader from './AdminSupportHeader';
import AdminSupportDetail from './AdminSupportDetail';
import AdminSupportCreate from './AdminSupportCreate';

const AdminSupportList = () => {
  const [supports, setSupports] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // 수정된 부분: 대괄호 제거
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const pageSize = 20;

  const fetchSupports = useCallback(async (page = 0) => {
    setLoading(true);
    try {
      // 수정: 페이지, 사이즈, 검색어 순서로 파라미터 전달
      const response = await adminSupportApi.getAllList(page, pageSize, searchTerm);
      setSupports(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('문의 목록 조회 중 오류:', error);
      alert(error.message || '문의 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pageSize]); // pageSize 의존성 추가

  useEffect(() => {
    fetchSupports(currentPage);
  }, [currentPage, fetchSupports]);

  // 단순 검색 함수로 수정
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(0);
    fetchSupports(0);
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
    <AdminLayout
      currentPage={currentPage + 1}
      totalPages={totalPages}
      onPageChange={(page) => handlePageChange(page - 1)}
    >
      <AdminSupportHeader
        onSearch={handleSearch}
        onCreate={openCreateModal}
      />

      <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">
        {/* Table Header */}
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

        {/* Table Body */}
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
                  {support.regDate}
                </div>
                <div className="text-sm text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    support.isConfirmed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {support.isConfirmed ? '확인완료' : '미확인'}
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
        <AdminSupportDetail
          supportId={selectedSupport.id}
          onClose={closeDetailModal}
          refreshList={() => fetchSupports(currentPage)}
        />
      )}

      <AdminSupportCreate
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        refreshList={() => fetchSupports(0)}
      />
    </AdminLayout>
  );
};

export default AdminSupportList;