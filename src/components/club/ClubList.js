import React, { useCallback, useEffect, useState } from 'react';
import axios from 'api/axios';
import StudentLayout from '../common/layout/student/StudentLayout';
import { PaperClipIcon } from '@heroicons/react/20/solid';
import ClubHeader from './ClubHeader';
import ClubCreate from './ClubCreate';
import ClubDetail from './ClubDetail';
//import { CourseContext } from '../common/CourseContext';
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

  const {user} = useUser();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  //const { courses = [] } = useContext(CourseContext);
  //const [selectedCourseId, setSelectedCourseId] = useState(null);
  //const { courseId, setCourseId } = useContext(CourseContext);

  // courseId 가져오기
//  useEffect(() => {
//    const fetchCourseId = async () => {
//      try {
//        setLoading(true);
//        const result = await axios.get(`${process.env.REACT_APP_API_URL}/club`);
//        const validCourses = result.data.filter(course => course.deletedBy === null);
//
//        if (validCourses.length > 0) {
//          const mostRecentCourse = validCourses.sort(
//            (a, b) => new Date(b.enrollDate) - new Date(a.enrollDate)
//          )[0];
//          const fetchedCourseId = mostRecentCourse.courseId;
//          setCourseId(fetchedCourseId);
//        } else {
//          console.error('유효한 Course ID를 가져오지 못했습니다.');
//          setCourseId(null);
//        }
//      } catch (err) {
//        console.error('Error fetching Course ID', err);
//        setCourseId(null);
//      } finally {
//        setLoading(false);
//      }
//    };
//
//    fetchCourseId();
//  }, [setCourseId]);

  // courses 가져오기
//  useEffect(() => {
//      if (Array.isArray(courses) && courses.length > 0) {
//        setSelectedCourseId(courses[0].courseId);
//        console.log("selectedCourseId1111111: ", selectedCourseId);
//      }
//      console.log('현재 로그인한 사용자 정보:', user);
//      console.log('현재 로딩상태:', userLoading);
//      console.log("selectedCourseId222222: ", selectedCourseId);
//  }, [courses, user, userLoading]);
//
//  const handleChange = (e) => {
//      setSelectedCourseId(e.target.value);
//      console.log("selectedCourseId33333: ", selectedCourseId);
//  };

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
    setCurrentPage(page);
  };

  // 클럽 리스트 가져오기(단일 courseId <> 리스트 selectedCourseId)
  const fetchClubList = useCallback(async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourse}/list`, {
        params: { pageNum: currentPage }
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
      setTotalPages(response.data.pageInfo.totalPages);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, currentPage]);

  useEffect(() => {
    fetchClubList();
  }, [fetchClubList, selectedCourse, currentPage]);


  // 상세보기 모달 열기
  const openDetailModal = async (club) => {
    if (!club.clubId) {
      console.error("club.clubId가 유효하지 않습니다.", club);
      return;
    }
    //setSelectedClub(club);
    fetchClubDetails(club.clubId);
    setIsDetailModalOpen(true);
  };

  const fetchClubDetails = async (clubId) => {
    try{
      console.log("fetchClubDetails 호출 - Club ID: ", clubId);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${clubId}/detail`, {
        // headers: {
        //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        // }
      });
      console.log("받은 클럽 상세 데이터: ", response.data);
      setSelectedClub(response.data);
    } catch(err){
      console.error('Error fetching club details', err);
      alert('동아리 상세 정보를 불러오는 데 실패했습니다.');
    }
  };

  // 파일 다운로드 핸들러
  const handleFileDownload = async (e, club) => {
    // 이벤트 버블링 방지
    e.stopPropagation();

    if (!club.file) {
      return;
    }

    try {
      // 파일 다운로드 API 호출
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${club.clubId}/download`, {
        responseType: 'blob'
      });

      // 파일 다운로드 처리
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', club.file.originalName || 'download');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('파일 다운로드 중 오류 발생', err);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  return (
    <StudentLayout currentPage={currentPage}
                   totalPages={totalPages}
                   onPageChange={handlePageChange}
    >

        <ClubHeader courses={courses} selectedCourse={selectedCourse} courseChange={(courseId) => {setSelectedCourse(courseId);}} onApplyClick={() => setIsCreateModalOpen(true)} />

        {/* Data Table Section */}
        <div className="flex flex-col w-full bg-white rounded-xl shadow-sm mt-6">
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
            ) : clubs.length > 0 ? (
              clubs.map((club, index) => (
                <div
                  key={club.clubId}
                  onClick={() => openDetailModal(club)}
                  className="grid grid-cols-[1fr_2fr_2fr_2fr_2fr_2fr_2fr_2fr] gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                >
                  <div className="text-sm font-medium text-gray-900 text-center">{clubs.length - index}</div>
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
                          className="cursor-pointer hover:text-blue-500"
                        >
                        <PaperClipIcon className="h-6 w-6 rotate-0" />
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
            onSubmitSuccess={fetchClubList}
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