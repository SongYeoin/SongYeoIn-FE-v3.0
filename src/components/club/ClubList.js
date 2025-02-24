import React, { useCallback, useContext, useEffect, useState } from 'react';
import axios from 'api/axios';
import StudentLayout from '../common/layout/student/StudentLayout';
import { PaperClipIcon } from '@heroicons/react/20/solid';
import ClubHeader from './ClubHeader';
import ClubCreate from './ClubCreate';
import ClubDetail from './ClubDetail';
import { CourseContext } from '../common/CourseContext';
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

  const {user, loading:userLoading} = useUser();
  const { courses = [] } = useContext(CourseContext);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
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
  useEffect(() => {
      if (Array.isArray(courses) && courses.length > 0) {
        setSelectedCourseId(courses[0].id);
      }
      console.log('현재 로그인한 사용자 정보:', user);
      console.log('현재 로딩상태:', userLoading);
  }, [courses, user, userLoading]);

  const handleChange = (e) => {
      setSelectedCourseId(e.target.value);
  };

  // 페이지네이션 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 클럽 리스트 가져오기(단일 courseId <> 리스트 selectedCourseId)
  const fetchClubList = useCallback(async () => {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourseId}/list`, {
        params: { pageNum: currentPage }
      });
      console.log('API Response:', response.data); // 응답 데이터 확인
      setClubs(response.data.list);
      setTotalPages(response.data.pageInfo.totalPages);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId, currentPage]);

  useEffect(() => {
    fetchClubList();
  }, [fetchClubList, selectedCourseId, currentPage]);


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



  return (
    <StudentLayout currentPage={currentPage}
                   totalPages={totalPages}
                   onPageChange={handlePageChange}
    >

        <ClubHeader selectedCourseId={selectedCourseId} handleChange={handleChange} onApplyClick={() => setIsCreateModalOpen(true)} />

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
                  <div className="text-sm font-medium text-gray-900 text-center">{index + 1}</div>
                  <div className="text-sm text-gray-600 text-center">{club.writer}</div>
                  <div className="text-sm text-gray-600 text-center">{club.checker || '-'}</div>
                  <div className="text-sm text-center">
                    <span className={`${
                      club.checkStatus === 'Y' ? 'text-green-500' : 'text-gray-600'
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
                        <PaperClipIcon className="h-6 w-6 rotate-0" />
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
                  selectedCourseId={selectedCourseId}
                  onClose={() => setIsCreateModalOpen(false)}
                  onSubmitSuccess={fetchClubList}
                />
              )}

              {isDetailModalOpen && selectedClub && (
                <ClubDetail
                  club={selectedClub}
                  user={user}
                  onClose={() => setIsDetailModalOpen(false)}
                  onUpdateSuccess={fetchClubList}
                />
              )}




    </StudentLayout>
  );
};

export default ClubList;

//                <div
//                  className="flex flex-col justify-start items-start w-[780px] h-[592px] absolute left-10 top-0 gap-8">
//                  <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-8">
//                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
//                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">번호</p>
//                      <div
//                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
//                      {/*<p className="absolute left-[13px] top-[35px] text-[15px] text-left text-black">{selectedClub.ClubId}</p>*/}
//                      <input
//                        type="text"
//                        value={selectedClub.clubId}
//                        name="clubId"
//                        onChange={handleInputChange}
//                        disabled
//                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
//                      />
//                    </div>
//                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
//                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">
//                        작성자/승인자
//                      </p>
//                      <div
//                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
//                      {/*<p className="absolute left-[419px] top-[35px] text-[15px] text-left text-black">*/}
//                      {/*  {selectedClub.writer || '-'} / {selectedClub.checker || '-'}*/}
//                      {/*</p>*/}
//                      <input
//                        type="text"
//                        value={`${selectedClub.writer || ""} / ${selectedClub.checker || ""}`}
//                        name="writerChecker"
//                        onChange={handleInputChange}
//                        disabled
//                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
//                      />
//                    </div>
//                  </div>
//                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[67px]">
//                    <p className="absolute left-0 top-[99px] text-sm font-black text-left text-black">참여자</p>
//                    <div
//                      className="w-[780px] h-11 absolute left-[-0.5px] top-[121.5px] rounded-2xl bg-white border border-[#efeff3]"/>
//                    {/*<p className="absolute left-[13px] top-[134px] text-[15px] text-left text-black">{selectedClub.participants || '-'}</p>*/}
//                    <input
//                      type="text"
//                      value={isEditing ? formData.participants : selectedClub.participants}
//                      name="participants"
//                      onChange={handleInputChange}
//                      disabled={!isEditing || selectedClub.checkStatus !== 'W'}
//                      className="w-[780px] h-11 absolute left-[-0.5px] top-[121.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
//                    />
//                  </div>
//                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[103px]">
//                    <p className="absolute left-0 top-[198px] text-sm font-black text-left text-black">내용</p>
//                    <div
//                      className="w-[780px] h-20 absolute left-[-0.5px] top-[220.5px] rounded-2xl bg-white border border-[#efeff3]"/>
//                    {/*<p*/}
//                    {/*  className="absolute left-[13px] top-[251px] text-[15px] text-left text-black">{selectedClub.content || '-'}</p>*/}
//                    <textarea
//                      value={isEditing ? formData.content : selectedClub.content}
//                      name="content"
//                      onChange={handleInputChange}
//                      disabled={!isEditing || selectedClub.checkStatus !== 'W'}
//                      className="w-[780px] h-20 absolute left-[-0.5px] top-[220.5px] rounded-2xl bg-white border border-[#efeff3] px-4 py-2 outline-none resize-none"
//                    />
//                  </div>
//                  <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-8">
//                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
//                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">승인상태</p>
//                      <div
//                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
//                      {/*<p className="absolute left-[13px] top-[35px] text-[15px] text-left text-black">*/}
//                      {/*  {selectedClub.checkStatus === 'Y' ? '승인' : selectedClub.checkStatus === 'N' ? '미승인' : '대기'}*/}
//                      {/*</p>*/}
//                      <input
//                        type="text"
//                        value={selectedClub.checkStatus === 'Y' ? '승인' : selectedClub.checkStatus === 'N' ? '미승인' : '대기'}
//                        name="checkStatus"
//                        onChange={handleInputChange}
//                        disabled
//                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
//                      />
//                    </div>
//                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
//                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">
//                        승인메시지
//                      </p>
//                      <div
//                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
//                      {/*<p className="absolute left-[420px] top-[35px] text-[15px] text-left text-black">{selectedClub.checkMessage || '-'}</p>*/}
//                      <input
//                        type="text"
//                        value={selectedClub.checkMessage || ""}
//                        name="checkMessage"
//                        onChange={handleInputChange}
//                        disabled
//                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
//                      />
//                    </div>
//                  </div>
//                  <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-8">
//                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
//                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">활동일</p>
//                      <div
//                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
//                      {/*<p className="absolute left-[13px] top-[35px] text-[15px] text-left text-black">*/}
//                      {/*  {selectedClub.studyDate}*/}
//                      {/*</p>*/}
//                      <input
//                        type="date"
//                        value={isEditing ? formData.studyDate : selectedClub.studyDate}
//                        name="studyDate"
//                        onChange={handleInputChange}
//                        disabled={!isEditing || selectedClub.checkStatus !== 'W'}
//                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
//                      />
//                    </div>
//                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
//                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">
//                        작성일
//                      </p>
//                      <div
//                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
//                      {/*<p className="absolute left-[419px] top-[35px] text-[15px] text-left text-black">*/}
//                      {/*  {selectedClub.regDate}*/}
//                      {/*</p>*/}
//                      <input
//                        type="date"
//                        value={
//                          isEditing
//                            ? selectedClub.checkStatus === 'W'
//                              ? new Date().toLocaleDateString('en-CA') // 승인 대기 상태일 때, 현재 날짜
//                              : selectedClub.regDate // 승인 상태일 때, 저장된 값
//                            : selectedClub.regDate // 수정 비활성화 상태일 때, 저장된 값
//                        }
//                        name="regDate"
//                        onChange={handleInputChange}
//                        disabled
//                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
//                      />
//                    </div>
//                  </div>
//                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[67px]">
//                    <p className="absolute left-0 top-[531px] text-sm font-black text-left text-black">
//                      첨부파일
//                    </p>
//                    <div
//                      className="w-[780px] h-11 absolute left-[-0.5px] top-[553.5px] rounded-2xl bg-white border border-[#efeff3]"/>
//                    <p className={`absolute left-[13px] top-[565px] text-sm text-left text-black ${isEditing && selectedClub.checkStatus === 'Y' ? 'hidden' : ''}`}>
//                      {selectedClub.file ? selectedClub.file.originalName : "첨부된 파일 없음"}
//                    </p>
//                    <input
//                      type={isEditing && selectedClub.checkStatus === 'Y' ? "file" : "text"}
//                      name="file"
//                      onChange={handleFileChange}
//                      disabled={!isEditing || selectedClub.checkStatus !== 'Y'}
//                      className={`w-[780px] h-11 absolute left-[-0.5px] top-[553.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none ${isEditing && selectedClub.checkStatus === 'Y' ? '' : 'hidden'}`}
//                    />
//                  </div>
//                </div>
//              </div>
//            </div>
//          </div>
//        )}
//    </StudentLayout>
//  );
//};
//
//export default ClubList;