import React, {useCallback, useEffect, useState, useContext} from "react";
import axios from 'api/axios';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import {useUser} from '../../common/UserContext';
import { CourseContext } from '../../common/CourseContext';
import AdminClubHeader from './AdminClubHeader';

const AdminClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState();
  const [selectedCourseId, setSelectedCourseId] = useState(null); // 선택된 Course ID

  const {user, loading:userLoading} = useUser();
  const [originalClub, setOriginalClub] = useState(null);
  const { courses = [] } = useContext(CourseContext);

  // courses가 변경되었을 때 기본값 설정
  useEffect(() => {
    if (Array.isArray(courses) && courses.length > 0) {
      setSelectedCourseId(courses[0].id); // 첫 번째 코스를 기본값으로 설정
    }
    console.log('현재 로그인한 사용자 정보:', user);
    console.log('현재 로딩상태:', userLoading);
  }, [courses, user, userLoading]);

  const handleChange = (e) => {
      setSelectedCourseId(e.target.value); // 선택된 Course ID 업데이트
  };

  // Pagination change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchClubList = useCallback (async() => {
    if(!selectedCourseId) return; // courseId가 없으면 실행하지 않음
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/club/${selectedCourseId}/list`, {
        params: {
          //courseId: courseId,
          pageNum: currentPage
        }
        // headers: {
        //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        // }
      });

      console.log("Fetched club list:", response.data.list);
      setClubs(response.data.list);
      setTotalPages(response.data.pageInfo.totalPages);
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [selectedCourseId, currentPage]);

  // useEffect에서 fetchClubList 호출
  useEffect(() => {
    fetchClubList();
  }, [fetchClubList, selectedCourseId, currentPage]);

  const fetchClubDetails = async (clubId) => {
    try{
      console.log("fetchClubDetails 호출 - Club ID: ", clubId);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/club/${clubId}/detail`, {
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

  // 동아리 상세 정보 (참여자, 내용 포함)
  const openDetailModal = (club) => {
    if (!club.clubId) {
      console.error("club.clubId가 유효하지 않습니다.", club); // club.id가 없으면 에러 로그
      return;
    }
    console.log("Club ID 전달: ", club.clubId);
    fetchClubDetails(club.clubId);
    setIsDetailModalOpen(true);
  };

  // Close modal
  // const closeModal = () => {
  //   setIsModalOpen(false);
  // };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Prevent changing writer and regDate
    if (name === 'writer' || name === 'regDate') return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // 저장 버튼 클릭 핸들러
  const handleSaveEdit = async () => {
    // 필수 항목 체크
    if (formData.checkStatus === 'W' || !formData.checkMessage) {
      alert('승인 상태와 승인 메시지는 필수 항목입니다. 입력해주세요.');
      return;
    }

    try {
      const payload = {
        checkStatus: formData.checkStatus,
        checkMessage: formData.checkMessage
      };

      console.log("수정 데이터 전송:", payload);

      await axios.put(`/admin/club/${selectedClub.clubId}`, payload, {
        // headers: {
        //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        // }
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('수정이 완료되었습니다.');
      setIsEditing(false); // 수정 모드 비활성화
      setIsDetailModalOpen(false); // 모달 닫기
      fetchClubList(); // 리스트 갱신
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정에 실패했습니다.');
      setIsEditing(false); // 수정 모드 비활성화
      setIsDetailModalOpen(false); // 모달 닫기
    }
  };


  //삭제
  const handleDelete = async () => {
    if (!selectedClub || !selectedClub.clubId) return;

    try {
      await axios.delete(`/admin/club/${selectedClub.clubId}`, {
        // headers: {
        //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        // }
      });
      alert('삭제되었습니다.');
      setIsDetailModalOpen(false); // 모달 닫기
      fetchClubList(); // 리스트 갱신
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
      setIsDetailModalOpen(false); // 모달 닫기
    }
  };

  //수정 버튼 클릭 핸들러
  const handleEditClick = () => {
    if (!user) {
      console.error('사용자 정보가 없습니다. user 객체:', user);
      return;
    }

    setOriginalClub({...selectedClub});

    // 승인자 정보 설정
    setSelectedClub((prev) => ({
      ...prev,
      checker: user?.name // 승인자 정보에 관리자 이름 추가
    }));

    setIsEditing(true); // 수정 모드 활성화
    setFormData(selectedClub);
  };

  //취소 버튼 클릭 핸들러
  const handleCancelEdit = () => {
    setSelectedClub(originalClub);
    setIsEditing(false);
  };


  return (
    <AdminLayout currentPage={currentPage}
                   totalPages={totalPages}
                   onPageChange={handlePageChange}
    >
        <AdminClubHeader selectedCourseId={selectedCourseId}
                         handleChange={handleChange}
        />

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
                  <div className="text-sm text-gray-600 text-center">
                    {club.checkStatus === 'W' ? '대기' :
                     club.checkStatus === 'Y' ? '승인' : '미승인'}
                  </div>
                  <div className="text-sm text-gray-600 text-center">{club.checkMessage || '-'}</div>
                  <div className="text-sm text-gray-600 text-center">{club.studyDate}</div>
                  <div className="text-sm text-gray-600 text-center">{club.regDate}</div>
                  <div className="text-sm text-gray-600 text-center">{club.attachmentFileName || '-'}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-center text-gray-500 py-4">
                조회된 내용이 없습니다.
              </div>
            )}
          </div>
        </div>

        {isDetailModalOpen && selectedClub && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="flex flex-col justify-start items-start w-[860px] h-[800px] relative overflow-hidden rounded-[28px] bg-white">
              {/* Modal Header */}
              <div
                className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 h-[76px] gap-1 p-6">
                <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative">
                  <p className="flex-grow-0 flex-shrink-0 text-[22px] font-black text-left text-[#101828]">
                    신청내역 상세보기
                  </p>
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer"
                    preserveAspectRatio="none"
                    onClick={() => setIsDetailModalOpen(false)}
                  >
                    <path
                      d="M18 6L6 18"
                      stroke="#737088"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 6L18 18"
                      stroke="#737088"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              {/* Modal Content */}
              <div className="flex-grow-0 flex-shrink-0 w-[860px] h-[750px] relative overflow-hidden bg-white">
                <div className="flex justify-start items-center w-[820px] absolute left-5 top-[616px] gap-5 py-9">

                  {!isEditing ? (
                    <>
                    {selectedClub.checkStatus === 'W' && (
                      <>
                        {/* 삭제 버튼 */}
                      <div className="flex-grow-0 flex-shrink-0 w-[400px] h-12 cursor-pointer" onClick={handleDelete}>
                        <div
                          className="w-[400px] h-12 absolute left-[-0.5px] top-[35.5px] rounded-2xl bg-[#d9d9d9]"/>
                        <p
                          className="w-[35.93px] absolute left-[182.04px] top-12 text-base font-semibold text-left text-black">
                          삭제
                        </p>
                      </div>

                    {/* 수정 버튼 */}
                    <div className="flex-grow-0 flex-shrink-0 w-[400px] h-12 cursor-pointer"
                         onClick={handleEditClick}
                    >
                      <div
                        className="w-[400px] h-12 absolute left-[419.5px] top-[35.5px] rounded-2xl bg-[#225930]"/>
                      <p
                        className="absolute left-[605px] top-12 text-base font-semibold text-left text-white">
                        수정
                      </p>
                    </div>
                    </>
                    )}

                    {(selectedClub.checkStatus === 'Y' || selectedClub.checkStatus === 'N') && (
                      <>
                        {/* 수정 버튼 */}
                        <div className="flex-grow-0 flex-shrink-0 w-[820px] h-12 cursor-pointer"
                             onClick={handleEditClick}
                        >
                          <div
                            className="w-[820px] h-12 absolute left-[-0.5px] top-[35.5px] rounded-2xl bg-[#225930]"/>
                          <p
                            className="w-[61.5px] absolute left-[379.25px] top-12 text-base font-semibold text-left text-white">
                            수정
                          </p>
                        </div>
                      </>
                    )}
                    </>
                  ) : (
                    <>
                      {/* 취소 버튼 */}
                      <div className="flex-grow-0 flex-shrink-0 w-[400px] h-12 cursor-pointer"
                           onClick={handleCancelEdit}
                      >
                        <div
                          className="w-[400px] h-12 absolute left-[-0.5px] top-[35.5px] rounded-2xl bg-[#d9d9d9]"/>
                        <p
                          className="w-[35.93px] absolute left-[182.04px] top-12 text-base font-semibold text-left text-black">
                          취소
                        </p>
                      </div>
                      {/* 저장 버튼 */}
                      <div className="flex-grow-0 flex-shrink-0 w-[400px] h-12 cursor-pointer"
                           onClick={handleSaveEdit}
                      >
                        <div
                          className="w-[400px] h-12 absolute left-[419.5px] top-[35.5px] rounded-2xl bg-[#225930]"/>
                        <p className="absolute left-[605px] top-12 text-base font-semibold text-left text-white">
                          저장
                        </p>
                      </div>
                    </>
                )}
                </div>
                <div
                  className="flex flex-col justify-start items-start w-[780px] h-[592px] absolute left-10 top-0 gap-8">
                  <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-8">
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">번호</p>
                      <div
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      {/*<p className="absolute left-[13px] top-[35px] text-[15px] text-left text-black">{selectedClub.ClubId}</p>*/}
                      <input
                        type="text"
                        value={selectedClub.clubId}
                        name="clubId"
                        onChange={handleInputChange}
                        disabled
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                      />
                    </div>
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">
                        작성자/승인자
                      </p>
                      <div
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      {/*<p className="absolute left-[419px] top-[35px] text-[15px] text-left text-black">*/}
                      {/*  {selectedClub.writer || '-'} / {selectedClub.checker || '-'}*/}
                      {/*</p>*/}
                      <input
                        type="text"
                        value={`${selectedClub.writer || ""} / ${selectedClub.checker || ""}`}
                        name="writerChecker"
                        onChange={handleInputChange}
                        disabled
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[67px]">
                    <p className="absolute left-0 top-[99px] text-sm font-black text-left text-black">참여자</p>
                    <div
                      className="w-[780px] h-11 absolute left-[-0.5px] top-[121.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                    {/*<p className="absolute left-[13px] top-[134px] text-[15px] text-left text-black">{selectedClub.participants || '-'}</p>*/}
                    <input
                      type="text"
                      value={selectedClub.participants}
                      name="participants"
                      onChange={handleInputChange}
                      disabled
                      className="w-[780px] h-11 absolute left-[-0.5px] top-[121.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                    />
                  </div>
                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[103px]">
                    <p className="absolute left-0 top-[198px] text-sm font-black text-left text-black">내용</p>
                    <div
                      className="w-[780px] h-20 absolute left-[-0.5px] top-[220.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                    {/*<p*/}
                    {/*  className="absolute left-[13px] top-[251px] text-[15px] text-left text-black">{selectedClub.content || '-'}</p>*/}
                    <textarea
                      value={selectedClub.content}
                      name="content"
                      onChange={handleInputChange}
                      disabled
                      className="w-[780px] h-20 absolute left-[-0.5px] top-[220.5px] rounded-2xl bg-white border border-[#efeff3] px-4 py-2 outline-none resize-none"
                    />
                  </div>
                  <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-8">
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">승인상태</p>
                      <div
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      {!isEditing ? (
                        <input
                          type="text"
                          value={selectedClub.checkStatus === 'Y' ? '승인' : selectedClub.checkStatus === 'N' ? '미승인' : '대기'}
                          name="checkStatus"
                          onChange={handleInputChange}
                          disabled
                          className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                        />
                      ) : (
                        <div className="flex items-center space-x-4 absolute left-[13px] top-[35px]">
                          {/*className="absolute left-[29px] top-[35px] text-[15px] text-left text-black"*/}
                          {/*w-4 h-4 absolute left-[13px] top-[39px]*/}
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="Y"
                              name="checkStatus"
                              // disabled={!isEditing || selectedClub.checkStatus !== 'W'}
                              checked={formData.checkStatus === 'Y'}
                              onChange={handleInputChange}
                              className="mr-1 w-4 h-4"
                            />
                            승인
                          </label>
                          {/*className="absolute left-[83px] top-[35px] text-[15px] text-left text-black"*/}
                          {/*w-4 h-4 absolute left-[67px] top-[39px]*/}
                          <label className="flex items-center">
                            <input
                              type="radio"
                              value="N"
                              name="checkStatus"
                              // disabled={!isEditing || selectedClub.checkStatus !== 'W'}
                              checked={formData.checkStatus === 'N'}
                              onChange={handleInputChange}
                              className="mr-1 w-4 h-4"
                            />
                            미승인
                          </label>
                        </div>
                      )}

                    </div>

                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">
                        승인메시지
                      </p>
                      <div
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      {/*<p className="absolute left-[420px] top-[35px] text-[15px] text-left text-black">{selectedClub.checkMessage || '-'}</p>*/}
                      <input
                        type="text"
                        value={isEditing ? formData.checkMessage || "" : selectedClub.checkMessage || ""}
                        name="checkMessage"
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-8">
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">활동일</p>
                      <div
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      {/*<p className="absolute left-[13px] top-[35px] text-[15px] text-left text-black">*/}
                      {/*  {selectedClub.studyDate}*/}
                      {/*</p>*/}
                      <input
                        type="date"
                        value={selectedClub.studyDate}
                        name="studyDate"
                        onChange={handleInputChange}
                        disabled
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                      />
                    </div>
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">
                        작성일
                      </p>
                      <div
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      {/*<p className="absolute left-[419px] top-[35px] text-[15px] text-left text-black">*/}
                      {/*  {selectedClub.regDate}*/}
                      {/*</p>*/}
                      <input
                        type="date"
                        value={selectedClub.regDate}
                        name="regDate"
                        onChange={handleInputChange}
                        disabled
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[67px]">
                    <p className="absolute left-0 top-[531px] text-sm font-black text-left text-black">
                      첨부파일
                    </p>
                    <div
                      className="w-[780px] h-11 absolute left-[-0.5px] top-[553.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                    {/*<p className="absolute left-[13px] top-[565px] text-sm text-left text-black">*/}
                    {/*  {selectedClub.attachment || '-'}*/}
                    {/*</p>*/}
                    <input
                      type="text"
                      value={selectedClub.attachment}
                      name="attachment"
                      onChange={handleInputChange}
                      disabled
                      className="w-[780px] h-11 absolute left-[-0.5px] top-[553.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
};

export default AdminClubList;
