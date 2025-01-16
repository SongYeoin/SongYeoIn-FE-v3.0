import React, {useCallback, useContext, useEffect, useState} from 'react';
import axios from 'api/axios';
import StudentLayout from '../common/layout/student/StudentLayout';
import { format } from 'date-fns';
import {CourseContext} from '../common/CourseContext';
import {useUser} from '../common/UserContext';
import { PaperClipIcon } from '@heroicons/react/20/solid';
import ClubHeader from './ClubHeader';

const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const {user, loading:userLoading} = useUser();
  const [originalClub, setOriginalClub] = useState(null);
  //const [file, setFile] = useState(null);

  const initialFormData = {
    participants: '',
    content: '',
    studyDate: '',
    writer: '',
    regDate: ''
  };

  // Form state
  const [formData, setFormData] = useState(initialFormData);

  const {courseId, setCourseId} = useContext(CourseContext);


  // 프로그램id
  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        setLoading(true);

        const result = await axios.get(`${process.env.REACT_APP_API_URL}/club`);
        console.log("Fetched course list:", result.data);  // 응답 데이터 확인

        // 필터링: deletedBy가 null인 항목만 추출
        const validCourses = result.data.filter(course => course.deletedBy === null);
        console.log("Valid courses:", validCourses);

        //const fetchedCourseId = result.data.course?.id;
        //console.log(fetchedCourseId);

        // if (fetchedCourseId) {
        //   setCourseId(fetchedCourseId); // 전역 상태에 저장
        //   console.log(`Fetched and set Course ID: ${fetchedCourseId}`);
        if (validCourses.length > 0) {
          // 가장 최근 개강일을 가진 courseId를 추출
          const mostRecentCourse = validCourses.sort(
            (a, b) => new Date(b.enrollDate) - new Date(a.enrollDate)
          )[0];
          console.log("Most recent course:", mostRecentCourse);

          // 유효한 courseId 설정
          const fetchedCourseId = mostRecentCourse.courseId;
          setCourseId(fetchedCourseId);
          console.log(`Fetched and set Course ID: ${fetchedCourseId}`);
        } else {
          console.error('유효한 Course ID를 가져오지 못했습니다.');
          setCourseId(null); // 유효한 데이터가 없을 경우 null로 초기화
        }
      } catch (err) {
        console.error('Error fetching Course ID', err);
        setCourseId(null); // 실패 시 초기화
      }finally {
        setLoading(false);
      }
    };

    // if (user) {
    //   fetchCourseId(); // 사용자 로그인 상태에서만 호출
    // } else {
    //   setCourseId(null); // 로그아웃 상태에서 초기화
    // }

    fetchCourseId();
    console.log('현재 로그인한 사용자 정보:', user);
    console.log('현재 로딩상태:', userLoading);
  }, [setCourseId, user, userLoading]);

  // Pagination change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchClubList = useCallback (async() => {
    if(!courseId) return; // courseId가 없으면 실행하지 않음
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${courseId}/list`, {
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
  }, [setLoading, courseId, currentPage]);

  // useEffect에서 fetchClubList 호출
  useEffect(() => {
    fetchClubList();
  }, [fetchClubList, courseId, currentPage]);

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

  // 동아리 신청 (작성자, 참여자, 내용, 활동일, 작성일)
  const openApplyModal = () => {
    // Fetch current user's name and set automatically
    axios.get(`${process.env.REACT_APP_API_URL}/club/${courseId}/register`, {
      // headers: {
      //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      // }
    })
      .then(response => {
        setFormData(prev => ({
          ...prev,
          writer: response.data.name,
          regDate: format(new Date(), 'yyyy-MM-dd')
        }));
        setIsModalOpen(true);
      })
      .catch(err => {
        console.error('Failed to fetch user details', err);
        alert('사용자 정보를 불러오는 데 실패했습니다.');
      });
  };

  // 동아리 상세 정보 (참여자, 내용 포함)
  const openDetailModal = (club) => {

    if (!club.clubId) {
      console.error("club.clubId가 유효하지 않습니다.", club); // club.id가 없으면 에러 로그
      return;
    }
    console.log("Club ID 전달: ", club.clubId);

    // 작성자와 로그인 사용자 비교
    console.log("현재 로그인한 사용자 이름:", user?.name);
    console.log("클럽 작성자 이름:", club.writer);

    const isOwnerCheck = user?.name === club.writer;
    console.log("사용자와 작성자 동일 여부 (상세보기):", isOwnerCheck);
    setIsOwner(isOwnerCheck); // 로컬 상태로 관리

    fetchClubDetails(club.clubId);
    setIsDetailModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setIsDetailModalOpen(false);
  };

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

  // 등록
  const handleSubmit = async () => {
    // 필수 항목 체크
    if (!formData.participants || !formData.studyDate) {
      alert('참여자와 활동일은 필수 항목입니다. 입력해주세요.');
      return;
    }

    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        //courseId: courseId
      };

      console.log("Submitting club data: ", submitData); // 데이터 확인

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/club/${courseId}`, submitData, {
        //params: { courseId: courseId },  // courseId를 쿼리 파라미터로 전달
        // headers: {
        //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        // }
      });

      console.log("Response from server: ", response); // 서버 응답 확인

      // 리스트 갱신
      await fetchClubList();

      // Update club list after successful submission
      //setClubs(prev => [response.data, ...prev]);
      closeModal();
    } catch (err) {
      console.error('Club creation failed', err);
      alert('동아리 신청에 실패했습니다.');
      closeModal(); // 실패 시에도 모달 닫기
    }
  };

  // 저장 버튼 클릭 핸들러
  const handleSaveEdit = async () => {
    // 필수 항목 체크
    if (!formData.participants || !formData.studyDate) {
      alert('참여자와 활동일은 필수 항목입니다. 입력해주세요.');
      return;
    }

    try {
      const newFormData = new FormData();

      // JSON 데이터 추가
      const clubData = {
        participants: formData.participants,
        content: formData.content,
        studyDate: formData.studyDate,
      };
      newFormData.append("club", new Blob([JSON.stringify(clubData)], { type: "application/json" }));

      // 파일 추가 (선택적으로)
      if (formData.file && formData.file.size > 0) {
        newFormData.append("file", formData.file);
      }
      console.log("수정데이터:", clubData);
      console.log("FormData payload:", newFormData);

      await axios.put(`${process.env.REACT_APP_API_URL}/club/${selectedClub.clubId}`, newFormData, {
        // headers: {
        //   'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        // }
        headers: {
          "Content-Type": "multipart/form-data",
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
      await axios.delete(`${process.env.REACT_APP_API_URL}/club/${selectedClub.clubId}`, {
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
    // setSelectedClub((prev) => ({
    //   ...prev,
    //   checker: user?.name // 승인자 정보에 관리자 이름 추가
    // }));

    setIsEditing(true); // 수정 모드 활성화
    setFormData(selectedClub);
  };

  //취소 버튼 클릭 핸들러
  const handleCancelEdit = () => {
    setSelectedClub(originalClub);
    setIsEditing(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file, // 파일 객체를 상태에 저장
      }));
      console.log("선택된 파일:", file.name); // 디버깅용
    }
  };

  return (
    <StudentLayout currentPage={currentPage}
                   totalPages={totalPages}
                   onPageChange={handlePageChange}
    >

        <ClubHeader onApplyClick={openApplyModal} />

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

        {/* Modal Section */}
        {/* Apply Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">동아리 신청</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200">✕</button>
              </div>

              <div className="mb-6 border border-gray-300 rounded-lg p-4">
                {/* 작성자 */}
                <div className="mb-4">
                  <label className="text-sm text-gray-600 font-bold">작성자</label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    value={formData.writer}
                    readOnly
                  />
                </div>

                {/* 참여자 */}
                <div className="mb-4">
                  <label className="text-sm text-gray-600 font-bold">
                    참여자 <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    name="participants"
                    value={formData.participants}
                    onChange={handleInputChange}
                  />
                </div>

                {/* 내용 */}
                <div className="mb-4">
                  <label className="text-sm text-gray-600 font-bold">내용</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-lg bg-white resize-y min-h-[42px]"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    style={{
                      height: '42px',
                      overflow: 'hidden',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* 활동일 및 작성일 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 font-bold">
                      활동일 <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      name="studyDate"
                      type="date"
                      value={formData.studyDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">작성일</label>
                    <input
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                      value={formData.regDate}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* 버튼 영역 */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeModal}
                  className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                >
                  저장
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {isDetailModalOpen && selectedClub && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">동아리 상세보기</h2>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="mb-6 border border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 font-bold">번호</label>
                    <input
                      type="text"
                      value={selectedClub.clubId}
                      name="clubId"
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">작성자/승인자</label>
                    <input
                      type="text"
                      value={`${selectedClub.writer || ""} / ${selectedClub.checker || ""}`}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-600 font-bold">참여자</label>
                  <input
                    type="text"
                    value={isEditing ? formData.participants : selectedClub.participants}
                    name="participants"
                    onChange={handleInputChange}
                    disabled={!isEditing || selectedClub.checkStatus !== 'W'}
                    className={`w-full px-3 py-2 border rounded-lg ${(!isEditing || selectedClub.checkStatus !== 'W') ? 'bg-gray-100' : 'bg-white'}`}
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-600 font-bold">내용</label>
                  {isEditing ? (
                    <textarea
                      value={isEditing ? formData.content : selectedClub.content}
                      name="content"
                      onChange={handleInputChange}
                      disabled={!isEditing || selectedClub.checkStatus !== 'W'}
                      className={`w-full px-3 py-2 border rounded-lg resize-y min-h-[42px] ${
                        (!isEditing || selectedClub.checkStatus !== 'W') ? 'bg-gray-100' : 'bg-white'
                      }`}
                      style={{
                        height: '42px',
                        overflow: 'hidden',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <div className={`w-full px-3 py-2 border rounded-lg bg-gray-100 whitespace-pre-wrap min-h-[42px]`}>
                      {selectedClub.content}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 font-bold">승인상태</label>
                    <input
                      type="text"
                      value={selectedClub.checkStatus === 'Y' ? '승인' : selectedClub.checkStatus === 'N' ? '미승인' : '대기'}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">승인메시지</label>
                    <input
                      type="text"
                      value={selectedClub.checkMessage || ""}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 font-bold">활동일</label>
                    <input
                      type="date"
                      value={isEditing ? formData.studyDate : selectedClub.studyDate}
                      name="studyDate"
                      onChange={handleInputChange}
                      disabled={!isEditing || selectedClub.checkStatus !== 'W'}
                      className={`w-full px-3 py-2 border rounded-lg ${(!isEditing || selectedClub.checkStatus !== 'W') ? 'bg-gray-100' : 'bg-white'}`}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">작성일</label>
                    <input
                      type="date"
                      value={
                        isEditing
                          ? selectedClub.checkStatus === 'W'
                            ? new Date().toLocaleDateString('en-CA')
                            : selectedClub.regDate
                          : selectedClub.regDate
                      }
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-bold">첨부파일</label>
                  {isEditing && selectedClub.checkStatus === 'Y' ? (
                    <input
                      type="file"
                      name="file"
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                    />
                  ) : (
                    <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                      {selectedClub.file ? selectedClub.file.originalName : "첨부된 파일 없음"}
                    </p>
                  )}
                </div>
              </div>

              {/* Buttons */}
              {isOwner && (
                <div className="flex justify-end gap-2 mt-4">
                  {!isEditing ? (
                    selectedClub.checkStatus === 'W' ? (
                      <>
                        <button
                          onClick={handleDelete}
                          className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
                        >
                          삭제
                        </button>
                        <button
                          onClick={handleEditClick}
                          className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                        >
                          수정
                        </button>
                      </>
                    ) : selectedClub.checkStatus === 'Y' && (
                      <button
                        onClick={handleEditClick}
                        className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                      >
                        수정
                      </button>
                    )
                  ) : (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                      >
                        저장
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
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