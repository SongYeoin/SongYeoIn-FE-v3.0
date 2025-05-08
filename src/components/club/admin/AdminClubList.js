import React, {useCallback, useEffect, useState} from "react";
import axios from 'api/axios';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import { CheckIcon } from '@heroicons/react/20/solid';
import { BsPaperclip } from "react-icons/bs";
import {useUser} from '../../common/UserContext';
import AdminClubHeader from './AdminClubHeader';
import AdminClubDetail from './AdminClubDetail';

const AdminClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    totalElements: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 20,
    hasNext: false,
    hasPrevious: false
  });

const [filteredClubs, setFilteredClubs] = useState([]);
const [filterStatus, setFilterStatus] = useState('ALL');

  const {user} = useUser();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
        try {
          const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/enrollments/my`);
          setCourses(data);

          if (data.length > 0 && !selectedCourse) {
            setSelectedCourse(data[0].id);
          }

        } catch (error) {
          console.error('Error fetching courses:', error);
        }
      };
    fetchCourses();
  }, [selectedCourse]);

  // 페이지네이션 핸들러
  const handlePageChange = (page) => {
    if (page < 1 || page > pageInfo.totalPages) return;
    setCurrentPage(page);
    // Reset selections when changing pages
    setSelectedItems([]);
    setSelectAll(false);
  };

  // 클럽 리스트 가져오기
  const fetchClubList = useCallback(async() => {
    if(!selectedCourse) return;
    setLoading(true);
    try {
      // 항상 최신 데이터를 확인하기 위해 서버에 요청할 때 캐시를 방지하는 타임스탬프
      const timestamp = new Date().getTime();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/club/${selectedCourse}/list`, {
        params: { pageNum: currentPage,
                  status: filterStatus !== 'ALL' ? filterStatus : undefined, // 필터 상태
                  _t: timestamp // 캐시 방지 파라미터
        }
      });

      // 클럽 리스트 정렬: regDate와 studyDate 기준 내림차순
      const sortedClubs = response.data.list.sort((a, b) => {
        // 먼저 작성일(regDate) 기준으로 비교
        const dateA = new Date(a.regDate);
        const dateB = new Date(b.regDate);

        // 작성일이 동일하면 활동일(studyDate) 기준으로 비교
        if (dateB - dateA !== 0) {
          return dateB - dateA;  // 작성일 내림차순
        }

        // 작성일이 동일하면 활동일(studyDate)로 내림차순 정렬
        const studyDateA = new Date(a.studyDate || 0); // studyDate가 없으면 기본값 0 (즉, 1970-01-01)
        const studyDateB = new Date(b.studyDate || 0);
        return studyDateB - studyDateA;  // 활동일 내림차순
      });

      setClubs(sortedClubs);

      // 페이지 정보 저장
      const receivedPageInfo = response.data.pageInfo;
      setPageInfo({
        totalElements: receivedPageInfo.totalElements,
        totalPages: receivedPageInfo.totalPages,
        currentPage: receivedPageInfo.currentPage,
        pageSize: receivedPageInfo.pageSize,
        hasNext: receivedPageInfo.hasNext,
        hasPrevious: receivedPageInfo.hasPrevious
      });

      setTotalPages(receivedPageInfo.totalPages);
      setTotalItems(receivedPageInfo.totalElements);
      setItemsPerPage(receivedPageInfo.pageSize);

      // Reset selections when fetching new data
      setSelectedItems([]);
      setSelectAll(false);
    } catch (err) {
      console.error('Error fetching club list:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, currentPage, filterStatus]);

  useEffect(() => {
    fetchClubList();
    setSelectedItems([]);
      setSelectAll(false);
  }, [fetchClubList, selectedCourse, currentPage, filterStatus]);

useEffect(() => {
  setFilteredClubs(clubs);
}, [clubs]);

  // 필터 변경 핸들러
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1);
  };


  const fetchClubDetails = async (clubId) => {
    try{
      console.log("fetchClubDetails 호출 - Club ID: ", clubId);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/club/${clubId}/detail`);
      setSelectedClub(response.data);
    } catch(err){
      console.error('Error fetching club details', err);
      alert('동아리 상세 정보를 불러오는 데 실패했습니다.');
    }
  };

  // 상세보기 모달 열기
  const openDetailModal = (club) => {
    if (!club.clubId) {
      console.error("club.clubId가 유효하지 않습니다.", club);
      return;
    }
    fetchClubDetails(club.clubId);
    setIsDetailModalOpen(true);
  };

  // 체크박스 핸들러
  const handleCheckboxChange = (clubId) => {
    setSelectedItems(prev => {
      if (prev.includes(clubId)) {
        return prev.filter(id => id !== clubId);
      } else {
        return [...prev, clubId];
      }
    });
  };

  // 모든 항목 선택/해제 핸들러
  const handleSelectAllChange = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      // 파일이 있는 항목만 선택
      const clubsWithFiles = filteredClubs.filter(club => club.file).map(club => club.clubId);
      setSelectedItems(clubsWithFiles);
    }
    setSelectAll(!selectAll);
  };

  // 파일명 추출 헬퍼 함수
  const extractFilenameFromContentDisposition = (contentDisposition) => {
    if (!contentDisposition) return null;

    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(contentDisposition);
    if (matches && matches[1]) {
      return matches[1].replace(/['"]/g, '');
    }
    return null;
  };

  // 파일 다운로드 공통 함수
  const downloadFile = async (url, defaultFilename, downloadType = 'batch') => {
    try {
      if (downloadType === 'batch') {
            setDownloadLoading(true);
          }

      const response = await axios.get(url, {
        responseType: 'blob',
        validateStatus: function (status) {
          return status < 500; // 500 미만의 상태 코드는 정상 처리하여 에러 메시지를 확인할 수 있도록 함
        },
      });

      // 에러 응답인 경우 (JSON으로 응답 예상)
      if (response.status !== 200) {
        const reader = new FileReader();
        reader.onload = function() {
          try {
            const errorData = JSON.parse(reader.result);
            const errorMessage = errorData.message || '파일 다운로드에 실패했습니다.';
            alert(errorMessage);
          } catch (e) {
            alert('파일 다운로드에 실패했습니다.');
          }
        };
        reader.readAsText(response.data);
        return false;
      }

      // 파일 다운로드 처리
      const contentDisposition = response.headers['content-disposition'];
      let filename = extractFilenameFromContentDisposition(contentDisposition) || defaultFilename;

      // URL 디코딩 처리
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
        console.warn('Filename decoding failed, using original value', e);
      }

      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      return true;
    } catch (err) {
      console.error('File download error:', err);

      // 서버에서 반환한 에러 메시지가 있는 경우
      if (err.response && err.response.data) {
        try {
          // JSON 객체인 경우
          if (typeof err.response.data === 'object') {
            alert(err.response.data.message || '파일 다운로드에 실패했습니다.');
            return false;
          }

          // Blob 데이터인 경우
          const reader = new FileReader();
          reader.onload = function() {
            try {
              const errorData = JSON.parse(reader.result);
              alert(errorData.message || '파일 다운로드에 실패했습니다.');
            } catch (e) {
              alert('파일 다운로드에 실패했습니다.');
            }
          };
          reader.readAsText(err.response.data);
        } catch (e) {
          alert('파일 다운로드에 실패했습니다.');
        }
      } else {
        // 서버 에러 응답이 없는 경우 기본 메시지 표시
        alert('파일 다운로드에 실패했습니다.');
      }
      return false;
    } finally {
      if (downloadType === 'batch') {
            setDownloadLoading(false);
          }
    }
  };

  // 단일 파일 다운로드 핸들러
  const handleFileDownload = async (e, club) => {
    // 이벤트 버블링 방지
    e.stopPropagation();

    if (!club.file || !club.file.id) {
      alert('다운로드할 파일이 없습니다.');
      return;
    }

    await downloadFile(
      `${process.env.REACT_APP_API_URL}/admin/club/${club.clubId}/download`,
      club.file.originalName || `club_file_${club.clubId}.pdf`,
      'single'
    );
  };

  // 선택된 파일 다운로드 핸들러
  const handleSelectedFilesDownload = async () => {
    if (selectedItems.length === 0) {
      alert('다운로드할 파일을 선택해주세요.');
      return;
    }

    // 파일이 1개만 선택된 경우 단일 파일 다운로드 처리
    if (selectedItems.length === 1) {
      const selectedClub = filteredClubs.find(club => club.clubId === selectedItems[0]);
      if (selectedClub && selectedClub.file && selectedClub.file.id) {
        // 일괄 다운로드 상태를 사용하여 다운로드
        await downloadFile(
                `${process.env.REACT_APP_API_URL}/admin/club/${selectedClub.clubId}/download`,
                selectedClub.file.originalName || `club_file_${selectedClub.clubId}.pdf`,
                'batch'
              );
        return;
      }
    }

     // 선택된 파일 ID 배열 생성
     const clubIds = selectedItems
       .map(clubId => {
         const club = filteredClubs.find(c => c.clubId === clubId);
         return club && club.file ? club.clubId : null;
       })
       .filter(clubId => clubId !== null);

     if (clubIds.length === 0) {
       alert('선택한 항목 중 다운로드 가능한 파일이 없습니다.');
       return;
     }

     try {
         setDownloadLoading(true);
         const response = await axios.post(
           `${process.env.REACT_APP_API_URL}/admin/club/download-batch`,
           clubIds,
           { responseType: 'blob',
             validateStatus: function (status) {
               return status < 500; // 500 미만의 상태 코드는 정상 처리
             }
           }
         );

         // 에러 응답인 경우 (JSON으로 응답 예상)
         if (response.status !== 200) {
           const reader = new FileReader();
           reader.onload = function() {
             try {
               const errorData = JSON.parse(reader.result);
               const errorMessage = errorData.message || '파일 일괄 다운로드에 실패했습니다.';
               alert(errorMessage);
             } catch (e) {
               alert('파일 일괄 다운로드에 실패했습니다.');
             }
           };
           reader.readAsText(response.data);
           return;
         }

         // 파일명 직접 지정
         const filename = '동아리일지_일괄다운로드.zip';

         const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
         const link = document.createElement('a');
         link.href = blobUrl;
         link.setAttribute('download', filename);
         document.body.appendChild(link);
         link.click();
         link.remove();
         window.URL.revokeObjectURL(blobUrl);
       } catch (err) {
       console.error('파일 일괄 다운로드 실패:', err);

       // 서버에 배치 다운로드 API가 없는 경우 개별 파일 다운로드로 대체
       if (err.response && err.response.status === 404) {
         alert('일괄 다운로드 기능을 사용할 수 없어 개별 파일을 차례로 다운로드합니다.');
         for (const clubId of selectedItems) {
           const club = filteredClubs.find(c => c.clubId === clubId);
           if (club && club.file) {
             await handleFileDownload({ stopPropagation: () => {} }, club);
           }
         }
       } else if (err.response && err.response.data) {
         try {
           // JSON 객체인 경우
           if (typeof err.response.data === 'object') {
             alert(err.response.data.message || '파일 일괄 다운로드에 실패했습니다.');
             return;
           }

           // Blob 데이터인 경우
           const reader = new FileReader();
           reader.onload = function() {
             try {
               const errorData = JSON.parse(reader.result);
               alert(errorData.message || '파일 일괄 다운로드에 실패했습니다.');
             } catch (e) {
               alert('파일 일괄 다운로드에 실패했습니다.');
             }
           };
           reader.readAsText(err.response.data);
         } catch (e) {
           alert('파일 일괄 다운로드에 실패했습니다.');
         }
       } else {
         alert('파일 일괄 다운로드에 실패했습니다.');
       }
     } finally {
       setDownloadLoading(false);
     }
  };

  // 항목 클릭 핸들러 (체크박스와 상세보기 분리)
  const handleRowClick = (club) => {
    openDetailModal(club);
  };

  // 항목 클릭 영역 핸들러 (체크박스를 제외한 영역)
  const handleRowAreaClick = (e, club) => {
    // 체크박스 클릭에서는 상세보기 열지 않음
    if (e.target.type !== 'checkbox' && !e.target.closest('.checkbox-area') && !e.target.closest('.file-download-btn')) {
      handleRowClick(club);
    }
  };

  // 행 번호 계산 함수
  const calculateRowNumber = (index) => {
    // 전체 아이템 수에서 현재 페이지에 해당하는 아이템 인덱스를 뺌
    return totalItems - ((currentPage - 1) * itemsPerPage + index);
  };

  return (
    <AdminLayout
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
    >
        <AdminClubHeader
          courses={courses}
          selectedCourse={selectedCourse}
          courseChange={(courseId) => {
            setSelectedCourse(courseId);
            setCurrentPage(1); // 코스가 변경되면 페이지를 1로 리셋
          }}
          selectedItems={selectedItems} // 선택된 항목 배열 전달
            downloadSelectedFiles={handleSelectedFilesDownload} // 다운로드 함수 전달
            downloadLoading={downloadLoading} // 다운로드 상태 전달
            filterStatus={filterStatus} // 필터 상태 전달
                    onFilterChange={handleFilterChange} // 필터 변경 핸들러 전달
        />

        {/* Data Table Section */}
        <div className="flex flex-col w-full bg-white rounded-xl shadow-sm mt-2">
          {/* Table Header */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-[0.5fr_1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">번호</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성자</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인자</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 상태</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 메시지</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">활동일</span>
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
            {loading ? (
              <div className="text-sm text-center text-gray-500 py-4">데이터를 불러오는 중입니다...</div>
            ) : error ? (
              <div className="text-sm text-center text-red-500 py-4">{error}</div>
            ) : filteredClubs.length > 0 ? (
              filteredClubs.map((club, index) => (
                <div
                  key={club.clubId}
                  onClick={(e) => handleRowAreaClick(e, club)}
                  className="grid grid-cols-[0.5fr_1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                >
                  <div className="flex items-center justify-center checkbox-area" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(club.clubId)}
                      onChange={() => handleCheckboxChange(club.clubId)}
                      disabled={!club.file}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 text-center">{calculateRowNumber(index)}</div>
                  <div className="text-sm text-gray-600 text-center">{club.writer}</div>
                  <div className="text-sm text-gray-600 text-center">{club.checker || '-'}</div>
                  <div className="text-sm text-center">
                    <span className={`${
                      club.checkStatus === 'Y' ? 'text-green-600' : club.checkStatus === 'N' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {club.checkStatus === 'W' ? '대기' :
                       club.checkStatus === 'Y' ? '승인' : '미승인'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 text-center">{club.checkMessage || '-'}</div>
                  <div className="text-sm text-gray-600 text-center">{club.studyDate}</div>
                  <div className="text-sm text-gray-600 text-center">{club.regDate}</div>
                  <div className="text-sm text-gray-600 text-center">
                    {club.file ? (
                      <div className="flex justify-center space-x-2">
                        <div
                          onClick={(e) => handleFileDownload(e, club)}
                          className="cursor-pointer hover:text-blue-500 file-download-btn"
                        >
                          <BsPaperclip className="h-6 w-6 rotate-0" />
                        </div>
                        {selectedItems.includes(club.clubId) && (
                          <CheckIcon className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                    ) : '-'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-center text-gray-500 py-4">
                {filterStatus !== 'ALL' ? `${filterStatus === 'Y' ? '승인' : filterStatus === 'N' ? '미승인' : '대기'} 상태의 항목이 없습니다.` : '조회된 내용이 없습니다.'}
              </div>
            )}
          </div>
        </div>

        {isDetailModalOpen && selectedClub && (
          <AdminClubDetail
            club={selectedClub}
            onClose={() => setIsDetailModalOpen(false)}
            user={user}
            onUpdateSuccess={fetchClubList}
            courseId={selectedCourse}
          />
        )}
    </AdminLayout>
  );
};

export default AdminClubList;



