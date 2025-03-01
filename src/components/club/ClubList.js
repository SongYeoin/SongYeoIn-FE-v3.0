//페이지네이션 분리
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'api/axios';
import StudentLayout from '../common/layout/student/StudentLayout';
//import { PaperClipIcon } from '@heroicons/react/20/solid';
import { BsPaperclip } from "react-icons/bs";
import ClubHeader from './ClubHeader';
import ClubCreate from './ClubCreate';
import ClubDetail from './ClubDetail';
import { useUser } from '../common/UserContext';

const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const {user} = useUser();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterKeyword, setFilterKeyword] = useState('');
  const [filteredClubs, setFilteredClubs] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
        try {
          const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/enrollments/my`);
          setCourses(data);

          if (data.length > 0 && !selectedCourse) {
            setSelectedCourse(data[0].courseId);
          }

        } catch (error) {
          console.error('Error fetching courses:', error);
        }
      };

    fetchCourses();
  }, [selectedCourse]);

  // 클럽 리스트 가져오기
  const fetchClubList = useCallback(async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      // 항상 최신 데이터를 확인하기 위해 서버에 요청할 때 캐시를 방지하는 타임스탬프
      const timestamp = new Date().getTime();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourse}/list`, {
        params: { pageNum: currentPage,
                  type: filterType !== '' ? filterType : undefined,
                  keyword: filterKeyword !== '' ? filterKeyword : undefined,
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
        const studyDateA = new Date(a.studyDate || 0);
        const studyDateB = new Date(b.studyDate || 0);
        return studyDateB - studyDateA;  // 활동일 내림차순
      });

      setClubs(sortedClubs);

      setTotalPages(response.data.pageInfo.totalPages);
      setTotalElements(response.data.pageInfo.totalElements);
      setPageSize(response.data.pageInfo.pageSize);
    } catch (err) {
      console.error('Error fetching club list:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, currentPage, filterType, filterKeyword]);

  useEffect(() => {
    fetchClubList();
  }, [fetchClubList, selectedCourse, currentPage, filterType, filterKeyword]);

  // 항목 생성 후 처리
  const handleCreateSuccess = async () => {
    // 새 항목 추가 후 항상 첫 페이지로 이동하여 최신 항목을 볼 수 있게 함
    setCurrentPage(1);
    await fetchClubList();
  };

useEffect(() => {
  setFilteredClubs(clubs);
}, [clubs]);

// 필터 변경 핸들러
  const handleFilterChange = (type, keyword) => {
    setFilterType(type);
    setFilterKeyword(keyword);
    setCurrentPage(1);
  };

  const fetchClubDetails = async (clubId) => {
    try{
      console.log("fetchClubDetails 호출 - Club ID: ", clubId);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${clubId}/detail`);
      console.log("받은 클럽 상세 데이터: ", response.data);
      setSelectedClub(response.data);
    } catch(err){
      console.error('Error fetching club details', err);
      alert('동아리 상세 정보를 불러오는 데 실패했습니다.');
    }
  };

  // 상세보기 모달 열기
  const openDetailModal = async (club) => {
    if (!club.clubId) {
      console.error("club.clubId가 유효하지 않습니다.", club);
      return;
    }
    fetchClubDetails(club.clubId);
    setIsDetailModalOpen(true);
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

  // 단일 파일 다운로드 핸들러
  const handleFileDownload = async (e, club) => {
    // 이벤트 버블링 방지
    e.stopPropagation();

    if (!club.file || !club.file.fileId) {
      alert('다운로드할 파일이 없습니다.');
      return;
    }

    try {
      // 파일 다운로드 API 호출
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/files/${club.file.fileId}`, {
        responseType: 'blob'
      });

      // 파일 다운로드 처리
      const contentDisposition = response.headers['content-disposition'];
      let filename = extractFilenameFromContentDisposition(contentDisposition) || club.file.originalName || `club_file_${club.clubId}.pdf`;

      // URL 디코딩 처리
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
        console.warn('Filename decoding failed, using original value', e);
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('File download error:', err);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  // 항목 클릭 핸들러
  const handleRowClick = (club) => {
    openDetailModal(club);
  };

  // 항목 클릭 영역 핸들러 (체크박스를 제외한 영역)
  const handleRowAreaClick = (e, club) => {
    // 파일 다운로드 버튼 클릭은 제외
    if (!e.target.closest('.file-download-btn')) {
      handleRowClick(club);
    }
  };

  // 행 번호 계산 함수
  const calculateRowNumber = (index) => {
    // 전체 아이템 수에서 현재 페이지에 해당하는 아이템 인덱스를 뺌
    return totalElements - ((currentPage - 1) * pageSize + index);
  };

  return (
    <StudentLayout
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(page) => setCurrentPage(page)}
    >
        <ClubHeader
          courses={courses}
          selectedCourse={selectedCourse}
          courseChange={(courseId) => {
            setSelectedCourse(courseId);
            setCurrentPage(1); // 코스가 변경되면 페이지를 1로 리셋
          }}
          onApplyClick={() => setIsCreateModalOpen(true)}
          filterType={filterType} // 필터 상태 전달
          filterKeyword={filterKeyword}
                              onFilterChange={handleFilterChange} // 필터 변경 핸들러 전달
        />

        {/* Data Table Section */}
        <div className="flex flex-col w-full bg-white rounded-xl shadow-sm mt-2">
          {/* Table Header */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4">
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
                  className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                >
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
                      <div className="flex justify-center">
                        <div
                          onClick={(e) => handleFileDownload(e, club)}
                          className="cursor-pointer hover:text-blue-500 file-download-btn"
                        >
                          <BsPaperclip className="h-6 w-6 rotate-0" />
                        </div>
                      </div>
                    ) : '-'}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-center text-gray-500 py-4">
                조회된 내용이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {isCreateModalOpen && (
          <ClubCreate
            selectedCourse={selectedCourse}
            onClose={() => setIsCreateModalOpen(false)}
            onSubmitSuccess={handleCreateSuccess}
          />
        )}

        {isDetailModalOpen && selectedClub && (
          <ClubDetail
            club={selectedClub}
            courseId={selectedCourse}
            user={user}
            onClose={() => setIsDetailModalOpen(false)}
            onUpdateSuccess={fetchClubList}
          />
        )}

    </StudentLayout>
  );
};

export default ClubList;
