//import React, { useCallback, useEffect, useState } from 'react';
//import axios from 'api/axios';
//import StudentLayout from '../common/layout/student/StudentLayout';
//import { PaperClipIcon } from '@heroicons/react/20/solid';
//import ClubHeader from './ClubHeader';
//import ClubCreate from './ClubCreate';
//import ClubDetail from './ClubDetail';
////import { CourseContext } from '../common/CourseContext';
//import { useUser } from '../common/UserContext';
//
//const ClubList = () => {
//  const [clubs, setClubs] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState(null);
//  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//  const [currentPage, setCurrentPage] = useState(1);
//  const [totalPages, setTotalPages] = useState(0);
//  const [selectedClub, setSelectedClub] = useState(null);
//  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//
//  const {user} = useUser();
//  const [courses, setCourses] = useState([]);
//  const [selectedCourse, setSelectedCourse] = useState('');
//  //const { courses = [] } = useContext(CourseContext);
//  //const [selectedCourseId, setSelectedCourseId] = useState(null);
//  //const { courseId, setCourseId } = useContext(CourseContext);
//
//  // courseId 가져오기
////  useEffect(() => {
////    const fetchCourseId = async () => {
////      try {
////        setLoading(true);
////        const result = await axios.get(`${process.env.REACT_APP_API_URL}/club`);
////        const validCourses = result.data.filter(course => course.deletedBy === null);
////
////        if (validCourses.length > 0) {
////          const mostRecentCourse = validCourses.sort(
////            (a, b) => new Date(b.enrollDate) - new Date(a.enrollDate)
////          )[0];
////          const fetchedCourseId = mostRecentCourse.courseId;
////          setCourseId(fetchedCourseId);
////        } else {
////          console.error('유효한 Course ID를 가져오지 못했습니다.');
////          setCourseId(null);
////        }
////      } catch (err) {
////        console.error('Error fetching Course ID', err);
////        setCourseId(null);
////      } finally {
////        setLoading(false);
////      }
////    };
////
////    fetchCourseId();
////  }, [setCourseId]);
//
//  // courses 가져오기
////  useEffect(() => {
////      if (Array.isArray(courses) && courses.length > 0) {
////        setSelectedCourseId(courses[0].courseId);
////        console.log("selectedCourseId1111111: ", selectedCourseId);
////      }
////      console.log('현재 로그인한 사용자 정보:', user);
////      console.log('현재 로딩상태:', userLoading);
////      console.log("selectedCourseId222222: ", selectedCourseId);
////  }, [courses, user, userLoading]);
////
////  const handleChange = (e) => {
////      setSelectedCourseId(e.target.value);
////      console.log("selectedCourseId33333: ", selectedCourseId);
////  };
//
//  useEffect(() => {
//    const fetchCourses = async () => {
//        try {
//          const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/enrollments/my`);
//          setCourses(data);
//
//          if (data.length > 0 && !selectedCourse) {
//            setSelectedCourse(data[0].courseId);
//          }
//
//        } catch (error) {
//          console.error('Error fetching courses:', error);
//        }
//      };
//
//    fetchCourses();
//  }, [selectedCourse]);
//
//
//
//  // 페이지네이션 핸들러
//  const handlePageChange = (page) => {
//    setCurrentPage(page);
//  };
//
//  // 클럽 리스트 가져오기(단일 courseId <> 리스트 selectedCourseId)
//  const fetchClubList = useCallback(async () => {
//    if (!selectedCourse) return;
//    setLoading(true);
//    try {
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourse}/list`, {
//        params: { pageNum: currentPage }
//      });
//
//      // 클럽 리스트 정렬: regDate와 studyDate 기준 내림차순
//      const sortedClubs = response.data.list.sort((a, b) => {
//        // 먼저 작성일(regDate) 기준으로 비교
//        const dateA = new Date(a.regDate);
//        const dateB = new Date(b.regDate);
//
//        // 작성일이 동일하면 활동일(studyDate) 기준으로 비교
//        if (dateB - dateA !== 0) {
//          return dateB - dateA;  // 작성일 내림차순
//        }
//
//        // 작성일이 동일하면 활동일(studyDate)로 내림차순 정렬
//        const studyDateA = new Date(a.studyDate || 0); // studyDate가 없으면 기본값 0 (즉, 1970-01-01)
//        const studyDateB = new Date(b.studyDate || 0);
//        return studyDateB - studyDateA;  // 활동일 내림차순
//      });
//
//      setClubs(sortedClubs);
//      setTotalPages(response.data.pageInfo.totalPages);
//    } catch (err) {
//      setError('데이터를 불러오는 중 오류가 발생했습니다.');
//    } finally {
//      setLoading(false);
//    }
//  }, [selectedCourse, currentPage]);
//
//  useEffect(() => {
//    fetchClubList();
//  }, [fetchClubList, selectedCourse, currentPage]);
//
//
//  // 상세보기 모달 열기
//  const openDetailModal = async (club) => {
//    if (!club.clubId) {
//      console.error("club.clubId가 유효하지 않습니다.", club);
//      return;
//    }
//    //setSelectedClub(club);
//    fetchClubDetails(club.clubId);
//    setIsDetailModalOpen(true);
//  };
//
//  const fetchClubDetails = async (clubId) => {
//    try{
//      console.log("fetchClubDetails 호출 - Club ID: ", clubId);
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${clubId}/detail`, {
//        // headers: {
//        //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
//        // }
//      });
//      console.log("받은 클럽 상세 데이터: ", response.data);
//      setSelectedClub(response.data);
//    } catch(err){
//      console.error('Error fetching club details', err);
//      alert('동아리 상세 정보를 불러오는 데 실패했습니다.');
//    }
//  };
//
//  // 파일 다운로드 핸들러
//  const handleFileDownload = async (e, club) => {
//    // 이벤트 버블링 방지
//    e.stopPropagation();
//
//    if (!club.file) {
//      return;
//    }
//
//    try {
//      // 파일 다운로드 API 호출
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${club.clubId}/download`, {
//        responseType: 'blob'
//      });
//
//      // 파일 다운로드 처리
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', club.file.originalName || 'download');
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }
//  };
//
//  return (
//    <StudentLayout currentPage={currentPage}
//                   totalPages={totalPages}
//                   onPageChange={handlePageChange}
//    >
//
//        <ClubHeader courses={courses} selectedCourse={selectedCourse} courseChange={(courseId) => {setSelectedCourse(courseId);}} onApplyClick={() => setIsCreateModalOpen(true)} />
//
//        {/* Data Table Section */}
//        <div className="flex flex-col w-full bg-white rounded-xl shadow-sm mt-6">
//          {/* Table Header */}
//          <div className="border-b border-gray-200 bg-gray-50">
//            <div className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4">
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">번호</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성자</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인자</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 상태</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 메시지</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">활동일</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성일</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">첨부파일</span>
//              </div>
//            </div>
//          </div>
//
//          {/* Table Body */}
//          <div className="flex-1 overflow-y-auto">
//            {loading ? (
//              <div className="text-sm text-center text-gray-500 py-4">데이터를 불러오는 중입니다...</div>
//            ) : error ? (
//              <div className="text-sm text-center text-red-500 py-4">{error}</div>
//            ) : clubs.length > 0 ? (
//              clubs.map((club, index) => (
//                <div
//                  key={club.clubId}
//                  onClick={() => openDetailModal(club)}
//                  className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
//                >
//                  <div className="text-sm font-medium text-gray-900 text-center">{clubs.length - index}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.writer}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.checker || '-'}</div>
//                  <div className="text-sm text-center">
//                    <span className={`${
//                      club.checkStatus === 'Y' ? 'text-green-600' : club.checkStatus === 'N' ? 'text-red-600' : 'text-gray-600'
//                    }`}>
//                      {club.checkStatus === 'W' ? '대기' :
//                       club.checkStatus === 'Y' ? '승인' : '미승인'}
//                    </span>
//                  </div>
//                  <div className="text-sm text-gray-600 text-center">{club.checkMessage || '-'}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.studyDate}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.regDate}</div>
//                  <div className="text-sm text-gray-600 text-center">
//                    {club.file ? (
//                      <div className="flex justify-center">
//                        <div
//                          onClick={(e) => handleFileDownload(e, club)}
//                          className="cursor-pointer hover:text-blue-500"
//                        >
//                        <PaperClipIcon className="h-6 w-6 rotate-0" />
//                        </div>
//                      </div>
//                    ) : '-'}
//                  </div>
//                </div>
//              ))
//            ) : (
//              <div className="text-sm text-center text-gray-500 py-4">
//                조회된 내용이 없습니다.
//              </div>
//            )}
//          </div>
//        </div>
//
//        {/* Modals */}
//        {isCreateModalOpen && (
//          <ClubCreate
//            selectedCourse={selectedCourse}
//            onClose={() => setIsCreateModalOpen(false)}
//            onSubmitSuccess={fetchClubList}
//          />
//        )}
//
//        {isDetailModalOpen && selectedClub && (
//          <ClubDetail
//            club={selectedClub}
//            courseId={selectedCourse}
//            user={user}
//            onClose={() => setIsDetailModalOpen(false)}
//            onUpdateSuccess={fetchClubList}
//          />
//        )}
//
//    </StudentLayout>
//  );
//};
//
//export default ClubList;

// 파일다운/페이지/내림차순
//import React, { useCallback, useEffect, useState } from 'react';
//import axios from 'api/axios';
//import StudentLayout from '../common/layout/student/StudentLayout';
//import { PaperClipIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/20/solid';
//import ClubHeader from './ClubHeader';
//import ClubCreate from './ClubCreate';
//import ClubDetail from './ClubDetail';
//import { useUser } from '../common/UserContext';
//
//const ClubList = () => {
//  const [clubs, setClubs] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState(null);
//  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//  const [currentPage, setCurrentPage] = useState(1);
//  const [totalPages, setTotalPages] = useState(0);
//  const [selectedClub, setSelectedClub] = useState(null);
//  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//  const [selectedItems, setSelectedItems] = useState([]);
//  const [selectAll, setSelectAll] = useState(false);
//
//  const {user} = useUser();
//  const [courses, setCourses] = useState([]);
//  const [selectedCourse, setSelectedCourse] = useState('');
//
//  useEffect(() => {
//    const fetchCourses = async () => {
//        try {
//          const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/enrollments/my`);
//          setCourses(data);
//
//          if (data.length > 0 && !selectedCourse) {
//            setSelectedCourse(data[0].courseId);
//          }
//
//        } catch (error) {
//          console.error('Error fetching courses:', error);
//        }
//      };
//
//    fetchCourses();
//  }, [selectedCourse]);
//
//  // 페이지네이션 핸들러
//  const handlePageChange = (page) => {
//    setCurrentPage(page);
//    // Reset selections when changing pages
//    setSelectedItems([]);
//    setSelectAll(false);
//  };
//
//  // 클럽 리스트 가져오기
//  const fetchClubList = useCallback(async () => {
//    if (!selectedCourse) return;
//    setLoading(true);
//    try {
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourse}/list`, {
//        params: { pageNum: currentPage }
//      });
//
//      // 클럽 리스트 정렬: regDate와 studyDate 기준 내림차순
//      const sortedClubs = response.data.list.sort((a, b) => {
//        // 먼저 작성일(regDate) 기준으로 비교
//        const dateA = new Date(a.regDate);
//        const dateB = new Date(b.regDate);
//
//        // 작성일이 동일하면 활동일(studyDate) 기준으로 비교
//        if (dateB - dateA !== 0) {
//          return dateB - dateA;  // 작성일 내림차순
//        }
//
//        // 작성일이 동일하면 활동일(studyDate)로 내림차순 정렬
//        const studyDateA = new Date(a.studyDate || 0);
//        const studyDateB = new Date(b.studyDate || 0);
//        return studyDateB - studyDateA;  // 활동일 내림차순
//      });
//
//      setClubs(sortedClubs);
//      setTotalPages(response.data.pageInfo.totalPages);
//      // Reset selections when fetching new data
//      setSelectedItems([]);
//      setSelectAll(false);
//    } catch (err) {
//      setError('데이터를 불러오는 중 오류가 발생했습니다.');
//    } finally {
//      setLoading(false);
//    }
//  }, [selectedCourse, currentPage]);
//
//  useEffect(() => {
//    fetchClubList();
//  }, [fetchClubList, selectedCourse, currentPage]);
//
//  // 상세보기 모달 열기
//  const openDetailModal = async (club) => {
//    if (!club.clubId) {
//      console.error("club.clubId가 유효하지 않습니다.", club);
//      return;
//    }
//    fetchClubDetails(club.clubId);
//    setIsDetailModalOpen(true);
//  };
//
//  const fetchClubDetails = async (clubId) => {
//    try{
//      console.log("fetchClubDetails 호출 - Club ID: ", clubId);
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${clubId}/detail`, {
//        // headers: {
//        //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
//        // }
//      });
//      console.log("받은 클럽 상세 데이터: ", response.data);
//      setSelectedClub(response.data);
//    } catch(err){
//      console.error('Error fetching club details', err);
//      alert('동아리 상세 정보를 불러오는 데 실패했습니다.');
//    }
//  };
//
//  // 체크박스 핸들러
//  const handleCheckboxChange = (clubId) => {
//    setSelectedItems(prev => {
//      if (prev.includes(clubId)) {
//        return prev.filter(id => id !== clubId);
//      } else {
//        return [...prev, clubId];
//      }
//    });
//  };
//
//  // 모든 항목 선택/해제 핸들러
//  const handleSelectAllChange = () => {
//    if (selectAll) {
//      setSelectedItems([]);
//    } else {
//      // 파일이 있는 항목만 선택
//      const clubsWithFiles = clubs.filter(club => club.file).map(club => club.clubId);
//      setSelectedItems(clubsWithFiles);
//    }
//    setSelectAll(!selectAll);
//  };
//
//  // 파일 다운로드 핸들러 (단일 파일)
//  const handleFileDownload = async (e, club) => {
//    // 이벤트 버블링 방지
//    e.stopPropagation();
//
//    if (!club.file) {
//      return;
//    }
//
//    try {
//      // 파일 다운로드 API 호출
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${club.clubId}/download`, {
//        responseType: 'blob'
//      });
//
//      // 파일 다운로드 처리
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', club.file.originalName || 'download');
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }
//  };
//
//  // 선택된 파일 다운로드 핸들러
//  const handleSelectedFilesDownload = async () => {
//    if (selectedItems.length === 0) {
//      alert('다운로드할 파일을 선택해주세요.');
//      return;
//    }
//
//    // 파일이 1개만 선택된 경우 단일 파일 다운로드 처리
//    if (selectedItems.length === 1) {
//      const selectedClub = clubs.find(club => club.clubId === selectedItems[0]);
//      if (selectedClub && selectedClub.file) {
//        // 단일 파일 다운로드 로직
//        await handleFileDownload({ stopPropagation: () => {} }, selectedClub);
//        return;
//      }
//    }
//
//    // 여러 파일이 선택된 경우 (서버에서 zip으로 압축해서 내려준다고 가정)
//    try {
//      const response = await axios.post(
//        `${process.env.REACT_APP_API_URL}/club/download/batch`,
//        { clubIds: selectedItems },
//        { responseType: 'blob' }
//      );
//
//      // 파일 다운로드 처리
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', '선택된_파일들.zip');
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }
//  };
//
//  // 항목 클릭 핸들러 (체크박스와 상세보기 분리)
//  const handleRowClick = (club) => {
//    openDetailModal(club);
//  };
//
//  // 항목 클릭 영역 핸들러 (체크박스를 제외한 영역)
//  const handleRowAreaClick = (e, club) => {
//    // 체크박스 클릭에서는 상세보기 열지 않음
//    if (e.target.type !== 'checkbox' && !e.target.closest('.checkbox-area') && !e.target.closest('.file-download-btn')) {
//      handleRowClick(club);
//    }
//  };
//
//  return (
//    <StudentLayout currentPage={currentPage}
//                   totalPages={totalPages}
//                   onPageChange={handlePageChange}
//    >
//        <ClubHeader
//          courses={courses}
//          selectedCourse={selectedCourse}
//          courseChange={(courseId) => {setSelectedCourse(courseId);}}
//          onApplyClick={() => setIsCreateModalOpen(true)}
//        />
//
//        {/* Download Button for Selected Files */}
//        <div className="mt-4 mb-2 flex justify-between items-center">
//          <div className="flex items-center">
//            <button
//              onClick={handleSelectedFilesDownload}
//              disabled={selectedItems.length === 0}
//              className={`flex items-center px-4 py-2 rounded-lg ${
//                selectedItems.length === 0
//                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                  : 'bg-blue-600 text-white hover:bg-blue-700'
//              } transition-colors duration-200`}
//            >
//              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
//              선택한 파일 다운로드 ({selectedItems.length})
//            </button>
//          </div>
//        </div>
//
//        {/* Data Table Section */}
//        <div className="flex flex-col w-full bg-white rounded-xl shadow-sm mt-2">
//          {/* Table Header */}
//          <div className="border-b border-gray-200 bg-gray-50">
//            <div className="grid grid-cols-[0.5fr_1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4">
//              <div className="flex items-center justify-center">
//                <input
//                  type="checkbox"
//                  checked={selectAll}
//                  onChange={handleSelectAllChange}
//                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                />
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">번호</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성자</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인자</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 상태</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 메시지</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">활동일</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성일</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">첨부파일</span>
//              </div>
//            </div>
//          </div>
//
//          {/* Table Body */}
//          <div className="flex-1 overflow-y-auto">
//            {loading ? (
//              <div className="text-sm text-center text-gray-500 py-4">데이터를 불러오는 중입니다...</div>
//            ) : error ? (
//              <div className="text-sm text-center text-red-500 py-4">{error}</div>
//            ) : clubs.length > 0 ? (
//              clubs.map((club, index) => (
//                <div
//                  key={club.clubId}
//                  onClick={(e) => handleRowAreaClick(e, club)}
//                  className="grid grid-cols-[0.5fr_1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
//                >
//                  <div className="flex items-center justify-center checkbox-area" onClick={(e) => e.stopPropagation()}>
//                    <input
//                      type="checkbox"
//                      checked={selectedItems.includes(club.clubId)}
//                      onChange={() => handleCheckboxChange(club.clubId)}
//                      disabled={!club.file}
//                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                    />
//                  </div>
//                  <div className="text-sm font-medium text-gray-900 text-center">{clubs.length - index}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.writer}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.checker || '-'}</div>
//                  <div className="text-sm text-center">
//                    <span className={`${
//                      club.checkStatus === 'Y' ? 'text-green-600' : club.checkStatus === 'N' ? 'text-red-600' : 'text-gray-600'
//                    }`}>
//                      {club.checkStatus === 'W' ? '대기' :
//                       club.checkStatus === 'Y' ? '승인' : '미승인'}
//                    </span>
//                  </div>
//                  <div className="text-sm text-gray-600 text-center">{club.checkMessage || '-'}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.studyDate}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.regDate}</div>
//                  <div className="text-sm text-gray-600 text-center">
//                    {club.file ? (
//                      <div className="flex justify-center space-x-2">
//                        <div
//                          onClick={(e) => handleFileDownload(e, club)}
//                          className="cursor-pointer hover:text-blue-500 file-download-btn"
//                        >
//                          <PaperClipIcon className="h-6 w-6 rotate-0" />
//                        </div>
//                        {selectedItems.includes(club.clubId) && (
//                          <CheckIcon className="h-5 w-5 text-green-500" />
//                        )}
//                      </div>
//                    ) : '-'}
//                  </div>
//                </div>
//              ))
//            ) : (
//              <div className="text-sm text-center text-gray-500 py-4">
//                조회된 내용이 없습니다.
//              </div>
//            )}
//          </div>
//        </div>
//
//        {/* Modals */}
//        {isCreateModalOpen && (
//          <ClubCreate
//            selectedCourse={selectedCourse}
//            onClose={() => setIsCreateModalOpen(false)}
//            onSubmitSuccess={fetchClubList}
//          />
//        )}
//
//        {isDetailModalOpen && selectedClub && (
//          <ClubDetail
//            club={selectedClub}
//            courseId={selectedCourse}
//            user={user}
//            onClose={() => setIsDetailModalOpen(false)}
//            onUpdateSuccess={fetchClubList}
//          />
//        )}
//
//    </StudentLayout>
//  );
//};
//
//export default ClubList;

// 컨트롤러 적용전
//import React, { useCallback, useEffect, useState } from 'react';
//import axios from 'api/axios';
//import StudentLayout from '../common/layout/student/StudentLayout';
//import { PaperClipIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/20/solid';
//import ClubHeader from './ClubHeader';
//import ClubCreate from './ClubCreate';
//import ClubDetail from './ClubDetail';
//import { useUser } from '../common/UserContext';
//
//const ClubList = () => {
//  const [clubs, setClubs] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState(null);
//  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//  const [currentPage, setCurrentPage] = useState(1);
//  const [totalPages, setTotalPages] = useState(0);
//  const [selectedClub, setSelectedClub] = useState(null);
//  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//  const [selectedItems, setSelectedItems] = useState([]);
//  const [selectAll, setSelectAll] = useState(false);
//  const [totalItems, setTotalItems] = useState(0); // 전체 아이템 개수 저장
//  const [itemsPerPage, setItemsPerPage] = useState(20); // 페이지당 아이템 수 (기본값 20)
//
//  const {user} = useUser();
//  const [courses, setCourses] = useState([]);
//  const [selectedCourse, setSelectedCourse] = useState('');
//
//  useEffect(() => {
//    const fetchCourses = async () => {
//        try {
//          const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/enrollments/my`);
//          setCourses(data);
//
//          if (data.length > 0 && !selectedCourse) {
//            setSelectedCourse(data[0].courseId);
//          }
//
//        } catch (error) {
//          console.error('Error fetching courses:', error);
//        }
//      };
//
//    fetchCourses();
//  }, [selectedCourse]);
//
//  // 페이지네이션 핸들러
//  const handlePageChange = (page) => {
//    setCurrentPage(page);
//    // Reset selections when changing pages
//    setSelectedItems([]);
//    setSelectAll(false);
//  };
//
//  // 클럽 리스트 가져오기
//  const fetchClubList = useCallback(async () => {
//    if (!selectedCourse) return;
//    setLoading(true);
//    try {
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourse}/list`, {
//        params: { pageNum: currentPage }
//      });
//
//      // 클럽 리스트 정렬: regDate와 studyDate 기준 내림차순
//      const sortedClubs = response.data.list.sort((a, b) => {
//        // 먼저 작성일(regDate) 기준으로 비교
//        const dateA = new Date(a.regDate);
//        const dateB = new Date(b.regDate);
//
//        // 작성일이 동일하면 활동일(studyDate) 기준으로 비교
//        if (dateB - dateA !== 0) {
//          return dateB - dateA;  // 작성일 내림차순
//        }
//
//        // 작성일이 동일하면 활동일(studyDate)로 내림차순 정렬
//        const studyDateA = new Date(a.studyDate || 0);
//        const studyDateB = new Date(b.studyDate || 0);
//        return studyDateB - studyDateA;  // 활동일 내림차순
//      });
//
//      setClubs(sortedClubs);
//      setTotalPages(response.data.pageInfo.totalPages);
//
//      // 전체 아이템 개수 저장 (API에서 제공한다고 가정)
//      setTotalItems(response.data.pageInfo.totalElements || 0);
//
//      // 페이지당 아이템 수 저장 (API에서 제공한다고 가정)
//      if (response.data.pageInfo.size) {
//        setItemsPerPage(response.data.pageInfo.size);
//      }
//
//      // Reset selections when fetching new data
//      setSelectedItems([]);
//      setSelectAll(false);
//    } catch (err) {
//      setError('데이터를 불러오는 중 오류가 발생했습니다.');
//    } finally {
//      setLoading(false);
//    }
//  }, [selectedCourse, currentPage]);
//
//  useEffect(() => {
//    fetchClubList();
//  }, [fetchClubList, selectedCourse, currentPage]);
//
//  // 상세보기 모달 열기
//  const openDetailModal = async (club) => {
//    if (!club.clubId) {
//      console.error("club.clubId가 유효하지 않습니다.", club);
//      return;
//    }
//    fetchClubDetails(club.clubId);
//    setIsDetailModalOpen(true);
//  };
//
//  const fetchClubDetails = async (clubId) => {
//    try{
//      console.log("fetchClubDetails 호출 - Club ID: ", clubId);
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${clubId}/detail`, {
//        // headers: {
//        //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
//        // }
//      });
//      console.log("받은 클럽 상세 데이터: ", response.data);
//      setSelectedClub(response.data);
//    } catch(err){
//      console.error('Error fetching club details', err);
//      alert('동아리 상세 정보를 불러오는 데 실패했습니다.');
//    }
//  };
//
//  // 체크박스 핸들러
//  const handleCheckboxChange = (clubId) => {
//    setSelectedItems(prev => {
//      if (prev.includes(clubId)) {
//        return prev.filter(id => id !== clubId);
//      } else {
//        return [...prev, clubId];
//      }
//    });
//  };
//
//  // 모든 항목 선택/해제 핸들러
//  const handleSelectAllChange = () => {
//    if (selectAll) {
//      setSelectedItems([]);
//    } else {
//      // 파일이 있는 항목만 선택
//      const clubsWithFiles = clubs.filter(club => club.file).map(club => club.clubId);
//      setSelectedItems(clubsWithFiles);
//    }
//    setSelectAll(!selectAll);
//  };
//
//  // 파일 다운로드 핸들러 (단일 파일)
//  const handleFileDownload = async (e, club) => {
//    // 이벤트 버블링 방지
//    e.stopPropagation();
//
//    if (!club.file) {
//      return;
//    }
//
//    try {
//      // 파일 다운로드 API 호출
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${club.clubId}/download`, {
//        responseType: 'blob'
//      });
//
//      // 파일 다운로드 처리
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', club.file.originalName || 'download');
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }
//  };
//
//  // 선택된 파일 다운로드 핸들러
//  const handleSelectedFilesDownload = async () => {
//    if (selectedItems.length === 0) {
//      alert('다운로드할 파일을 선택해주세요.');
//      return;
//    }
//
//    // 파일이 1개만 선택된 경우 단일 파일 다운로드 처리
//    if (selectedItems.length === 1) {
//      const selectedClub = clubs.find(club => club.clubId === selectedItems[0]);
//      if (selectedClub && selectedClub.file) {
//        // 단일 파일 다운로드 로직
//        await handleFileDownload({ stopPropagation: () => {} }, selectedClub);
//        return;
//      }
//    }
//
//    // 여러 파일이 선택된 경우 (서버에서 zip으로 압축해서 내려준다고 가정)
//    try {
//      const response = await axios.post(
//        `${process.env.REACT_APP_API_URL}/club/download/batch`,
//        { clubIds: selectedItems },
//        { responseType: 'blob' }
//      );
//
//      // 파일 다운로드 처리
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', '선택된_파일들.zip');
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }
//  };
//
//  // 항목 클릭 핸들러 (체크박스와 상세보기 분리)
//  const handleRowClick = (club) => {
//    openDetailModal(club);
//  };
//
//  // 항목 클릭 영역 핸들러 (체크박스를 제외한 영역)
//  const handleRowAreaClick = (e, club) => {
//    // 체크박스 클릭에서는 상세보기 열지 않음
//    if (e.target.type !== 'checkbox' && !e.target.closest('.checkbox-area') && !e.target.closest('.file-download-btn')) {
//      handleRowClick(club);
//    }
//  };
//
//  // 행 번호 계산 함수
//  const calculateRowNumber = (index) => {
//    // 전체 아이템 수에서 현재 페이지에 해당하는 아이템 인덱스를 뺌
//    // 첫 페이지의 첫번째 아이템은 인덱스 0이지만 표시는 totalItems
//    return totalItems - ((currentPage - 1) * itemsPerPage + index);
//  };
//
//  return (
//    <StudentLayout currentPage={currentPage}
//                   totalPages={totalPages}
//                   onPageChange={handlePageChange}
//    >
//        <ClubHeader
//          courses={courses}
//          selectedCourse={selectedCourse}
//          courseChange={(courseId) => {setSelectedCourse(courseId);}}
//          onApplyClick={() => setIsCreateModalOpen(true)}
//        />
//
//        {/* Download Button for Selected Files */}
//        <div className="mt-4 mb-2 flex justify-between items-center">
//          <div className="flex items-center">
//            <button
//              onClick={handleSelectedFilesDownload}
//              disabled={selectedItems.length === 0}
//              className={`flex items-center px-4 py-2 rounded-lg ${
//                selectedItems.length === 0
//                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                  : 'bg-blue-600 text-white hover:bg-blue-700'
//              } transition-colors duration-200`}
//            >
//              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
//              선택한 파일 다운로드 ({selectedItems.length})
//            </button>
//          </div>
//        </div>
//
//        {/* Data Table Section */}
//        <div className="flex flex-col w-full bg-white rounded-xl shadow-sm mt-2">
//          {/* Table Header */}
//          <div className="border-b border-gray-200 bg-gray-50">
//            <div className="grid grid-cols-[0.5fr_1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4">
//              <div className="flex items-center justify-center">
//                <input
//                  type="checkbox"
//                  checked={selectAll}
//                  onChange={handleSelectAllChange}
//                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                />
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">번호</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성자</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인자</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 상태</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 메시지</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">활동일</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성일</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">첨부파일</span>
//              </div>
//            </div>
//          </div>
//
//          {/* Table Body */}
//          <div className="flex-1 overflow-y-auto">
//            {loading ? (
//              <div className="text-sm text-center text-gray-500 py-4">데이터를 불러오는 중입니다...</div>
//            ) : error ? (
//              <div className="text-sm text-center text-red-500 py-4">{error}</div>
//            ) : clubs.length > 0 ? (
//              clubs.map((club, index) => (
//                <div
//                  key={club.clubId}
//                  onClick={(e) => handleRowAreaClick(e, club)}
//                  className="grid grid-cols-[0.5fr_1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
//                >
//                  <div className="flex items-center justify-center checkbox-area" onClick={(e) => e.stopPropagation()}>
//                    <input
//                      type="checkbox"
//                      checked={selectedItems.includes(club.clubId)}
//                      onChange={() => handleCheckboxChange(club.clubId)}
//                      disabled={!club.file}
//                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                    />
//                  </div>
//                  <div className="text-sm font-medium text-gray-900 text-center">{calculateRowNumber(index)}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.writer}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.checker || '-'}</div>
//                  <div className="text-sm text-center">
//                    <span className={`${
//                      club.checkStatus === 'Y' ? 'text-green-600' : club.checkStatus === 'N' ? 'text-red-600' : 'text-gray-600'
//                    }`}>
//                      {club.checkStatus === 'W' ? '대기' :
//                       club.checkStatus === 'Y' ? '승인' : '미승인'}
//                    </span>
//                  </div>
//                  <div className="text-sm text-gray-600 text-center">{club.checkMessage || '-'}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.studyDate}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.regDate}</div>
//                  <div className="text-sm text-gray-600 text-center">
//                    {club.file ? (
//                      <div className="flex justify-center space-x-2">
//                        <div
//                          onClick={(e) => handleFileDownload(e, club)}
//                          className="cursor-pointer hover:text-blue-500 file-download-btn"
//                        >
//                          <PaperClipIcon className="h-6 w-6 rotate-0" />
//                        </div>
//                        {selectedItems.includes(club.clubId) && (
//                          <CheckIcon className="h-5 w-5 text-green-500" />
//                        )}
//                      </div>
//                    ) : '-'}
//                  </div>
//                </div>
//              ))
//            ) : (
//              <div className="text-sm text-center text-gray-500 py-4">
//                조회된 내용이 없습니다.
//              </div>
//            )}
//          </div>
//        </div>
//
//        {/* Modals */}
//        {isCreateModalOpen && (
//          <ClubCreate
//            selectedCourse={selectedCourse}
//            onClose={() => setIsCreateModalOpen(false)}
//            onSubmitSuccess={fetchClubList}
//          />
//        )}
//
//        {isDetailModalOpen && selectedClub && (
//          <ClubDetail
//            club={selectedClub}
//            courseId={selectedCourse}
//            user={user}
//            onClose={() => setIsDetailModalOpen(false)}
//            onUpdateSuccess={fetchClubList}
//          />
//        )}
//
//    </StudentLayout>
//  );
//};
//
//export default ClubList;

// 컨트롤러 적용 후 다중배열
//import React, { useCallback, useEffect, useState } from 'react';
//import axios from 'api/axios';
//import StudentLayout from '../common/layout/student/StudentLayout';
//import { PaperClipIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/20/solid';
//import ClubHeader from './ClubHeader';
//import ClubCreate from './ClubCreate';
//import ClubDetail from './ClubDetail';
//import { useUser } from '../common/UserContext';
//
//const ClubList = () => {
//  const [clubs, setClubs] = useState([]);
//  const [loading, setLoading] = useState(false);
//  const [error, setError] = useState(null);
//  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//  const [currentPage, setCurrentPage] = useState(1);
//  const [totalPages, setTotalPages] = useState(0);
//  const [selectedClub, setSelectedClub] = useState(null);
//  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
//  const [selectedItems, setSelectedItems] = useState([]);
//  const [selectAll, setSelectAll] = useState(false);
//  const [totalItems, setTotalItems] = useState(0);
//  const [itemsPerPage, setItemsPerPage] = useState(20);
//  const [pageInfo, setPageInfo] = useState({
//    totalElements: 0,
//    totalPages: 0,
//    currentPage: 1,
//    pageSize: 20,
//    hasNext: false,
//    hasPrevious: false
//  });
//
//  const {user} = useUser();
//  const [courses, setCourses] = useState([]);
//  const [selectedCourse, setSelectedCourse] = useState('');
//
//  useEffect(() => {
//    const fetchCourses = async () => {
//        try {
//          const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/enrollments/my`);
//          setCourses(data);
//
//          if (data.length > 0 && !selectedCourse) {
//            setSelectedCourse(data[0].courseId);
//          }
//
//        } catch (error) {
//          console.error('Error fetching courses:', error);
//        }
//      };
//
//    fetchCourses();
//  }, [selectedCourse]);
//
//  // 페이지네이션 핸들러
//  const handlePageChange = (page) => {
//    if (page < 1 || page > pageInfo.totalPages) return;
//    setCurrentPage(page);
//    // Reset selections when changing pages
//    setSelectedItems([]);
//    setSelectAll(false);
//  };
//
//  // 이전 페이지로 이동
//  const handlePrevPage = () => {
//    if (pageInfo.hasPrevious) {
//      handlePageChange(currentPage - 1);
//    }
//  };
//
//  // 다음 페이지로 이동
//  const handleNextPage = () => {
//    if (pageInfo.hasNext) {
//      handlePageChange(currentPage + 1);
//    }
//  };
//
//  // 페이지 번호 배열 생성 (페이지네이션 UI용)
//  const getPageNumbers = () => {
//    const pageNumbers = [];
//    const maxPageButtons = 5; // 표시할 최대 페이지 버튼 수
//
//    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
//    let endPage = Math.min(pageInfo.totalPages, startPage + maxPageButtons - 1);
//
//    // 표시할 페이지 버튼이 maxPageButtons보다 적으면 시작 페이지 조정
//    if (endPage - startPage + 1 < maxPageButtons) {
//      startPage = Math.max(1, endPage - maxPageButtons + 1);
//    }
//
//    for (let i = startPage; i <= endPage; i++) {
//      pageNumbers.push(i);
//    }
//
//    return pageNumbers;
//  };
//
//  // 클럽 리스트 가져오기
//  const fetchClubList = useCallback(async () => {
//    if (!selectedCourse) return;
//    setLoading(true);
//    try {
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourse}/list`, {
//        params: { pageNum: currentPage }
//      });
//
//      // 클럽 리스트 정렬: regDate와 studyDate 기준 내림차순
//      const sortedClubs = response.data.list.sort((a, b) => {
//        // 먼저 작성일(regDate) 기준으로 비교
//        const dateA = new Date(a.regDate);
//        const dateB = new Date(b.regDate);
//
//        // 작성일이 동일하면 활동일(studyDate) 기준으로 비교
//        if (dateB - dateA !== 0) {
//          return dateB - dateA;  // 작성일 내림차순
//        }
//
//        // 작성일이 동일하면 활동일(studyDate)로 내림차순 정렬
//        const studyDateA = new Date(a.studyDate || 0);
//        const studyDateB = new Date(b.studyDate || 0);
//        return studyDateB - studyDateA;  // 활동일 내림차순
//      });
//
//      setClubs(sortedClubs);
//
//      // 페이지 정보 저장
//      const receivedPageInfo = response.data.pageInfo;
//      setPageInfo({
//        totalElements: receivedPageInfo.totalElements,
//        totalPages: receivedPageInfo.totalPages,
//        currentPage: receivedPageInfo.currentPage,
//        pageSize: receivedPageInfo.pageSize,
//        hasNext: receivedPageInfo.hasNext,
//        hasPrevious: receivedPageInfo.hasPrevious
//      });
//
//      setTotalPages(receivedPageInfo.totalPages);
//      setTotalItems(receivedPageInfo.totalElements);
//      setItemsPerPage(receivedPageInfo.pageSize);
//
//      // Reset selections when fetching new data
//      setSelectedItems([]);
//      setSelectAll(false);
//    } catch (err) {
//      console.error('Error fetching club list:', err);
//      setError('데이터를 불러오는 중 오류가 발생했습니다.');
//    } finally {
//      setLoading(false);
//    }
//  }, [selectedCourse, currentPage]);
//
//  useEffect(() => {
//    fetchClubList();
//  }, [fetchClubList, selectedCourse, currentPage]);
//
//  // 상세보기 모달 열기
//  const openDetailModal = async (club) => {
//    if (!club.clubId) {
//      console.error("club.clubId가 유효하지 않습니다.", club);
//      return;
//    }
//    fetchClubDetails(club.clubId);
//    setIsDetailModalOpen(true);
//  };
//
//  const fetchClubDetails = async (clubId) => {
//    try{
//      console.log("fetchClubDetails 호출 - Club ID: ", clubId);
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${clubId}/detail`);
//      console.log("받은 클럽 상세 데이터: ", response.data);
//      setSelectedClub(response.data);
//    } catch(err){
//      console.error('Error fetching club details', err);
//      alert('동아리 상세 정보를 불러오는 데 실패했습니다.');
//    }
//  };
//
//  // 체크박스 핸들러
//  const handleCheckboxChange = (clubId) => {
//    setSelectedItems(prev => {
//      if (prev.includes(clubId)) {
//        return prev.filter(id => id !== clubId);
//      } else {
//        return [...prev, clubId];
//      }
//    });
//  };
//
//  // 모든 항목 선택/해제 핸들러
//  const handleSelectAllChange = () => {
//    if (selectAll) {
//      setSelectedItems([]);
//    } else {
//      // 파일이 있는 항목만 선택
//      const clubsWithFiles = clubs.filter(club => club.file).map(club => club.clubId);
//      setSelectedItems(clubsWithFiles);
//    }
//    setSelectAll(!selectAll);
//  };
//
//  // 파일 다운로드 핸들러 (단일 파일)
//  const handleFileDownload = async (e, club) => {
//    // 이벤트 버블링 방지
//    e.stopPropagation();
//
//    if (!club.file || !club.file.fileId) {
//      alert('파일 정보가 올바르지 않습니다.');
//      return;
//    }
//
//
//    try {
//      // 파일 다운로드 API 호출
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/files/${club.file.fileId}`, {
//        params: { fileUrl: club.file.url },
//        responseType: 'blob'
//      });
//
//      // 파일 다운로드 처리
//      const contentDisposition = response.headers['content-disposition'];
//      let filename = club.file.originalName || 'download';
//
//      // content-disposition에서 파일명 추출 시도
//      if (contentDisposition) {
//        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
//        const matches = filenameRegex.exec(contentDisposition);
//        if (matches != null && matches[1]) {
//          filename = matches[1].replace(/['"]/g, '');
//        }
//      }
//
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', filename);
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }
//  };
//
//  // 선택된 파일 다운로드 핸들러
//  const handleSelectedFilesDownload = async () => {
//    if (selectedItems.length === 0) {
//      alert('다운로드할 파일을 선택해주세요.');
//      return;
//    }
//
//    // 파일이 1개만 선택된 경우 단일 파일 다운로드 처리
//    if (selectedItems.length === 1) {
//      const selectedClub = clubs.find(club => club.clubId === selectedItems[0]);
//      if (selectedClub && selectedClub.file) {
//        // 단일 파일 다운로드 로직
//        await handleFileDownload({ stopPropagation: () => {} }, selectedClub);
//        return;
//      }
//    }
//
////    // 여러 파일이 선택된 경우 (서버에서 zip으로 압축해서 내려준다고 가정)
////    try {
////      const response = await axios.post(
////        `${process.env.REACT_APP_API_URL}/club/download/batch`,
////        { clubIds: selectedItems },
////        { responseType: 'blob' }
////      );
////
////      // 파일 다운로드 처리
////      const url = window.URL.createObjectURL(new Blob([response.data]));
////      const link = document.createElement('a');
////      link.href = url;
////      link.setAttribute('download', '선택된_파일들.zip');
////      document.body.appendChild(link);
////      link.click();
////      document.body.removeChild(link);
////
////    } catch (err) {
////      console.error('파일 다운로드 중 오류 발생', err);
////      alert('파일 다운로드에 실패했습니다.');
////    }
//
//    // 여러 파일이 선택된 경우 - 각 선택된 클럽의 fileId 배열 생성
//    const fileIds = [];
//    for (const clubId of selectedItems) {
//      const club = clubs.find(c => c.clubId === clubId);
//      if (club && club.file) {
//        fileIds.push(club.file.fileId);
//      }
//    }
//
//    if (fileIds.length === 0) {
//      alert('선택한 항목 중 다운로드 가능한 파일이 없습니다.');
//      return;
//    }
//
//    try {
//      // 다중 파일 다운로드 API 호출 (백엔드 구현 필요)
//      const response = await axios.post(
//        `${process.env.REACT_APP_API_URL}/api/files/download/batch`,
//        { fileIds: fileIds },
//        { responseType: 'blob' }
//      );
//
//      // 파일 다운로드 처리
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', '선택된_파일들.zip');
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }
//
//  };
//
//  // 항목 클릭 핸들러 (체크박스와 상세보기 분리)
//  const handleRowClick = (club) => {
//    openDetailModal(club);
//  };
//
//  // 항목 클릭 영역 핸들러 (체크박스를 제외한 영역)
//  const handleRowAreaClick = (e, club) => {
//    // 체크박스 클릭에서는 상세보기 열지 않음
//    if (e.target.type !== 'checkbox' && !e.target.closest('.checkbox-area') && !e.target.closest('.file-download-btn')) {
//      handleRowClick(club);
//    }
//  };
//
//  // 행 번호 계산 함수
//  const calculateRowNumber = (index) => {
//    // 전체 아이템 수에서 현재 페이지에 해당하는 아이템 인덱스를 뺌
//    return totalItems - ((currentPage - 1) * itemsPerPage + index);
//  };
//
//  // 페이지네이션 컴포넌트
//  const renderPagination = () => {
//    if (totalPages <= 1) return null;
//
//    const pageNumbers = getPageNumbers();
//
//    return (
//      <div className="flex justify-center mt-6 mb-4">
//        <nav className="inline-flex rounded-md shadow-sm">
//          {/* 처음 페이지 버튼 */}
//          <button
//            onClick={() => handlePageChange(1)}
//            disabled={currentPage === 1}
//            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
//              currentPage === 1
//                ? 'text-gray-400 cursor-not-allowed'
//                : 'text-gray-700 hover:bg-gray-50'
//            } rounded-l-md border border-gray-300`}
//          >
//            &laquo;
//          </button>
//
//          {/* 이전 페이지 버튼 */}
//          <button
//            onClick={handlePrevPage}
//            disabled={!pageInfo.hasPrevious}
//            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
//              !pageInfo.hasPrevious
//                ? 'text-gray-400 cursor-not-allowed'
//                : 'text-gray-700 hover:bg-gray-50'
//            } border-t border-b border-gray-300`}
//          >
//            &lt;
//          </button>
//
//          {/* 페이지 번호 버튼들 */}
//          {pageNumbers.map(page => (
//            <button
//              key={page}
//              onClick={() => handlePageChange(page)}
//              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
//                currentPage === page
//                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
//                  : 'text-gray-700 hover:bg-gray-50'
//              } border border-gray-300`}
//            >
//              {page}
//            </button>
//          ))}
//
//          {/* 다음 페이지 버튼 */}
//          <button
//            onClick={handleNextPage}
//            disabled={!pageInfo.hasNext}
//            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
//              !pageInfo.hasNext
//                ? 'text-gray-400 cursor-not-allowed'
//                : 'text-gray-700 hover:bg-gray-50'
//            } border-t border-b border-gray-300`}
//          >
//            &gt;
//          </button>
//
//          {/* 마지막 페이지 버튼 */}
//          <button
//            onClick={() => handlePageChange(totalPages)}
//            disabled={currentPage === totalPages}
//            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
//              currentPage === totalPages
//                ? 'text-gray-400 cursor-not-allowed'
//                : 'text-gray-700 hover:bg-gray-50'
//            } rounded-r-md border border-gray-300`}
//          >
//            &raquo;
//          </button>
//        </nav>
//      </div>
//    );
//  };
//
//  return (
//    <StudentLayout>
//        <ClubHeader
//          courses={courses}
//          selectedCourse={selectedCourse}
//          courseChange={(courseId) => {
//            setSelectedCourse(courseId);
//            setCurrentPage(1); // 코스가 변경되면 페이지를 1로 리셋
//          }}
//          onApplyClick={() => setIsCreateModalOpen(true)}
//        />
//
//        {/* Download Button for Selected Files */}
//        <div className="mt-4 mb-2 flex justify-between items-center">
//          <div className="flex items-center">
//            <button
//              onClick={handleSelectedFilesDownload}
//              disabled={selectedItems.length === 0}
//              className={`flex items-center px-4 py-2 rounded-lg ${
//                selectedItems.length === 0
//                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
//                  : 'bg-blue-600 text-white hover:bg-blue-700'
//              } transition-colors duration-200`}
//            >
//              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
//              선택한 파일 다운로드 ({selectedItems.length})
//            </button>
//          </div>
//
//          {/* 페이지 정보 표시 */}
//          <div className="text-sm text-gray-600">
//            총 {pageInfo.totalElements}개 항목 중 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pageInfo.totalElements)}
//          </div>
//        </div>
//
//        {/* Data Table Section */}
//        <div className="flex flex-col w-full bg-white rounded-xl shadow-sm mt-2">
//          {/* Table Header */}
//          <div className="border-b border-gray-200 bg-gray-50">
//            <div className="grid grid-cols-[0.5fr_1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4">
//              <div className="flex items-center justify-center">
//                <input
//                  type="checkbox"
//                  checked={selectAll}
//                  onChange={handleSelectAllChange}
//                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                />
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">번호</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성자</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인자</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 상태</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">승인 메시지</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">활동일</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">작성일</span>
//              </div>
//              <div className="flex flex-col items-center justify-center">
//                <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">첨부파일</span>
//              </div>
//            </div>
//          </div>
//
//          {/* Table Body */}
//          <div className="flex-1 overflow-y-auto">
//            {loading ? (
//              <div className="text-sm text-center text-gray-500 py-4">데이터를 불러오는 중입니다...</div>
//            ) : error ? (
//              <div className="text-sm text-center text-red-500 py-4">{error}</div>
//            ) : clubs.length > 0 ? (
//              clubs.map((club, index) => (
//                <div
//                  key={club.clubId}
//                  onClick={(e) => handleRowAreaClick(e, club)}
//                  className="grid grid-cols-[0.5fr_1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
//                >
//                  <div className="flex items-center justify-center checkbox-area" onClick={(e) => e.stopPropagation()}>
//                    <input
//                      type="checkbox"
//                      checked={selectedItems.includes(club.clubId)}
//                      onChange={() => handleCheckboxChange(club.clubId)}
//                      disabled={!club.file}
//                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
//                    />
//                  </div>
//                  <div className="text-sm font-medium text-gray-900 text-center">{calculateRowNumber(index)}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.writer}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.checker || '-'}</div>
//                  <div className="text-sm text-center">
//                    <span className={`${
//                      club.checkStatus === 'Y' ? 'text-green-600' : club.checkStatus === 'N' ? 'text-red-600' : 'text-gray-600'
//                    }`}>
//                      {club.checkStatus === 'W' ? '대기' :
//                       club.checkStatus === 'Y' ? '승인' : '미승인'}
//                    </span>
//                  </div>
//                  <div className="text-sm text-gray-600 text-center">{club.checkMessage || '-'}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.studyDate}</div>
//                  <div className="text-sm text-gray-600 text-center">{club.regDate}</div>
//                  <div className="text-sm text-gray-600 text-center">
//                    {club.file ? (
//                      <div className="flex justify-center space-x-2">
//                        <div
//                          onClick={(e) => handleFileDownload(e, club)}
//                          className="cursor-pointer hover:text-blue-500 file-download-btn"
//                        >
//                          <PaperClipIcon className="h-6 w-6 rotate-0" />
//                        </div>
//                        {selectedItems.includes(club.clubId) && (
//                          <CheckIcon className="h-5 w-5 text-green-500" />
//                        )}
//                      </div>
//                    ) : '-'}
//                  </div>
//                </div>
//              ))
//            ) : (
//              <div className="text-sm text-center text-gray-500 py-4">
//                조회된 내용이 없습니다.
//              </div>
//            )}
//          </div>
//        </div>
//
//        {/* 페이지네이션 컴포넌트 */}
//        {renderPagination()}
//
//        {/* Modals */}
//        {isCreateModalOpen && (
//          <ClubCreate
//            selectedCourse={selectedCourse}
//            onClose={() => setIsCreateModalOpen(false)}
//            onSubmitSuccess={fetchClubList}
//          />
//        )}
//
//        {isDetailModalOpen && selectedClub && (
//          <ClubDetail
//            club={selectedClub}
//            courseId={selectedCourse}
//            user={user}
//            onClose={() => setIsDetailModalOpen(false)}
//            onUpdateSuccess={fetchClubList}
//          />
//        )}
//
//    </StudentLayout>
//  );
//};
//
//export default ClubList;

// 컨트롤러,서비스 적용,리스트정렬완
import React, { useCallback, useEffect, useState } from 'react';
import axios from 'api/axios';
import StudentLayout from '../common/layout/student/StudentLayout';
import { PaperClipIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/react/20/solid';
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
  const [totalPages, setTotalPages] = useState(0);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
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

  const {user} = useUser();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');

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

  // 페이지네이션 핸들러
  const handlePageChange = (page) => {
    if (page < 1 || page > pageInfo.totalPages) return;
    setCurrentPage(page);
    // Reset selections when changing pages
    setSelectedItems([]);
    setSelectAll(false);
  };

  // 이전 페이지로 이동
  const handlePrevPage = () => {
    if (pageInfo.hasPrevious) {
      handlePageChange(currentPage - 1);
    }
  };

  // 다음 페이지로 이동
  const handleNextPage = () => {
    if (pageInfo.hasNext) {
      handlePageChange(currentPage + 1);
    }
  };

  // 페이지 번호 배열 생성 (페이지네이션 UI용)
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // 표시할 최대 페이지 버튼 수

    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    let endPage = Math.min(pageInfo.totalPages, startPage + maxPageButtons - 1);

    // 표시할 페이지 버튼이 maxPageButtons보다 적으면 시작 페이지 조정
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  // 클럽 리스트 가져오기
  const fetchClubList = useCallback(async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      // 항상 최신 데이터를 확인하기 위해 서버에 요청할 때 캐시를 방지하는 타임스탬프
      const timestamp = new Date().getTime();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourse}/list`, {
        params: { pageNum: currentPage,
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
  }, [selectedCourse, currentPage]);

  useEffect(() => {
    fetchClubList();
  }, [fetchClubList, selectedCourse, currentPage]);

  // 항목 생성 후 처리
  const handleCreateSuccess = async () => {
    // 새 항목 추가 후 항상 첫 페이지로 이동하여 최신 항목을 볼 수 있게 함
    setCurrentPage(1);
    await fetchClubList();
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
      const clubsWithFiles = clubs.filter(club => club.file).map(club => club.clubId);
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
  const downloadFile = async (url, defaultFilename) => {
    try {
      setDownloadLoading(true);
      const response = await axios.get(url, {
        responseType: 'blob'
      });

      // 파일 다운로드 처리
      const contentDisposition = response.headers['content-disposition'];
      let filename = extractFilenameFromContentDisposition(contentDisposition) || defaultFilename;

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

      return true;
    } catch (err) {
      console.error('File download error:', err);
      alert('파일 다운로드에 실패했습니다.');
      return false;
    } finally {
      setDownloadLoading(false);
    }
  };


  // 단일 파일 다운로드 핸들러
  const handleFileDownload = async (e, club) => {
    // 이벤트 버블링 방지
    e.stopPropagation();

    if (!club.file || !club.file.fileId) {
      alert('다운로드할 파일이 없습니다.');
      return;
    }

    await downloadFile(
      `${process.env.REACT_APP_API_URL}/api/files/${club.file.fileId}`,
      club.file.originalName || `club_file_${club.clubId}.pdf`
    );

//    try {
//      // 파일 다운로드 API 호출
//      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/files/${club.file.fileId}`, {
//        params: { fileUrl: club.file.url },
//        responseType: 'blob'
//      });
//
//      // 파일 다운로드 처리
//      const contentDisposition = response.headers['content-disposition'];
//      let filename = club.file.originalName || 'download';
//
//      // content-disposition에서 파일명 추출 시도
//      if (contentDisposition) {
//        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
//        const matches = filenameRegex.exec(contentDisposition);
//        if (matches != null && matches[1]) {
//          filename = matches[1].replace(/['"]/g, '');
//        }
//      }
//
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', filename);
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }
  };

  // 선택된 파일 다운로드 핸들러
  const handleSelectedFilesDownload = async () => {
    if (selectedItems.length === 0) {
      alert('다운로드할 파일을 선택해주세요.');
      return;
    }

    // 파일이 1개만 선택된 경우 단일 파일 다운로드 처리
    if (selectedItems.length === 1) {
      const selectedClub = clubs.find(club => club.clubId === selectedItems[0]);
      if (selectedClub && selectedClub.file && selectedClub.file.fileId) {
        // 단일 파일 다운로드 로직
        await handleFileDownload({ stopPropagation: () => {} }, selectedClub);
        return;
      }
    }

//    // 여러 파일이 선택된 경우 (서버에서 zip으로 압축해서 내려준다고 가정)
//    try {
//      const response = await axios.post(
//        `${process.env.REACT_APP_API_URL}/club/download/batch`,
//        { clubIds: selectedItems },
//        { responseType: 'blob' }
//      );
//
//      // 파일 다운로드 처리
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', '선택된_파일들.zip');
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }

//  // 여러 파일이 선택된 경우 - 각 선택된 클럽의 fileId 배열 생성
//    const fileIds = [];
//    for (const clubId of selectedItems) {
//      const club = clubs.find(c => c.clubId === clubId);
//      if (club && club.file) {
//        fileIds.push(club.file.fileId);
//      }
//    }

    // 선택된 파일 ID 배열 생성
    const fileIds = selectedItems
      .map(clubId => {
        const club = clubs.find(c => c.clubId === clubId);
        return club && club.file ? club.file.fileId : null;
      })
      .filter(fileId => fileId !== null);

    if (fileIds.length === 0) {
      alert('선택한 항목 중 다운로드 가능한 파일이 없습니다.');
      return;
    }

    try {
      setDownloadLoading(true);
      // 다중 파일 다운로드 API 호출
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/files/download/batch`,
        { fileIds },
        { responseType: 'blob' }
      );

//      // 파일 다운로드 처리
//      const url = window.URL.createObjectURL(new Blob([response.data]));
//      const link = document.createElement('a');
//      link.href = url;
//      link.setAttribute('download', '선택된_파일들.zip');
//      document.body.appendChild(link);
//      link.click();
//      document.body.removeChild(link);
//
//    } catch (err) {
//      console.error('파일 다운로드 중 오류 발생', err);
//      alert('파일 다운로드에 실패했습니다.');
//    }

      const contentDisposition = response.headers['content-disposition'];
      let filename = extractFilenameFromContentDisposition(contentDisposition) || '선택된_파일들.zip';

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
          const club = clubs.find(c => c.clubId === clubId);
          if (club && club.file) {
            await handleFileDownload({ stopPropagation: () => {} }, club);
          }
        }
      } else {
        alert('파일 다운로드에 실패했습니다.');
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

  // 페이지네이션 컴포넌트
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();

    return (
      <div className="flex justify-center mt-6 mb-4">
        <nav className="inline-flex rounded-md shadow-sm">
          {/* 처음 페이지 버튼 */}
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
              currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-l-md border border-gray-300`}
          >
            &laquo;
          </button>

          {/* 이전 페이지 버튼 */}
          <button
            onClick={handlePrevPage}
            disabled={!pageInfo.hasPrevious}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
              !pageInfo.hasPrevious
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            &lt;
          </button>

          {/* 페이지 번호 버튼들 */}
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                currentPage === page
                  ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              } border border-gray-300`}
            >
              {page}
            </button>
          ))}

          {/* 다음 페이지 버튼 */}
          <button
            onClick={handleNextPage}
            disabled={!pageInfo.hasNext}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
              !pageInfo.hasNext
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            } border-t border-b border-gray-300`}
          >
            &gt;
          </button>

          {/* 마지막 페이지 버튼 */}
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-3 py-2 text-sm font-medium ${
              currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-50'
            } rounded-r-md border border-gray-300`}
          >
            &raquo;
          </button>
        </nav>
      </div>
    );
  };

  return (
    <StudentLayout>
        <ClubHeader
          courses={courses}
          selectedCourse={selectedCourse}
          courseChange={(courseId) => {
            setSelectedCourse(courseId);
            setCurrentPage(1); // 코스가 변경되면 페이지를 1로 리셋
          }}
          onApplyClick={() => setIsCreateModalOpen(true)}
        />

        {/* Download Button for Selected Files */}
        <div className="mt-4 mb-2 flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={handleSelectedFilesDownload}
              disabled={selectedItems.length === 0 || downloadLoading}
              className={`flex items-center px-4 py-2 rounded-lg ${
                selectedItems.length === 0 || downloadLoading
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } transition-colors duration-200`}
            >
              {downloadLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              )}
              {downloadLoading ? '다운로드 중...' : `선택한 파일 다운로드 (${selectedItems.length})`}
            </button>
          </div>


          {/* 페이지 정보 표시 */}
          <div className="text-sm text-gray-600">
            총 {pageInfo.totalElements}개 항목 중 {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, pageInfo.totalElements)}
          </div>
        </div>

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
            ) : clubs.length > 0 ? (
              clubs.map((club, index) => (
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
                          <PaperClipIcon className="h-6 w-6 rotate-0" />
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
                조회된 내용이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 페이지네이션 컴포넌트 */}
        {renderPagination()}

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