import React, {useCallback, useContext, useEffect, useState} from 'react';
import axios from 'api/axios';
import StudentLayout from '../common/layout/student/StudentLayout';
import { format } from 'date-fns';
import {CourseContext} from '../common/CourseContext';
import {useUser} from '../common/UserContext';

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
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative">

        <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-4 py-7 pr-4">
          <div className="flex flex-col justify-start items-start flex-grow relative gap-4">
            <p className="self-stretch flex-grow-0 flex-shrink-0 w-[1498px] text-[28px] text-left text-[#16161b]">
              동아리
            </p>
          </div>

          <div
            className="flex justify-center items-center flex-grow-0 flex-shrink-0 h-10 relative gap-1 px-4 py-2 rounded-lg bg-[#225930] cursor-pointer" onClick={openApplyModal}>
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
              preserveAspectRatio="none"
            >
              <path
                d="M12 5V19"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12H19"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-white">신청</p>
          </div>
        </div>

        <div className="self-stretch flex-grow-0 flex-shrink-0 h-10 relative flex justify-end items-center pr-4">
          <div className="flex items-center gap-4">
            <div
              className="flex justify-start items-center w-50 gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300">
              <select className="text-sm text-left text-black" defaultValue="작성자">
                      <option value="작성자">작성자</option>
                      <option value="참여자">참여자</option>
                      <option value="승인상태">승인상태</option>
              </select>
            </div>
            {/*<svg*/}
            {/*  width={14}*/}
            {/*  height={6}*/}
            {/*  viewBox="0 0 14 6"*/}
            {/*  fill="none"*/}
            {/*  xmlns="http://www.w3.org/2000/svg"*/}
            {/*  className="absolute left-[1268.5px] top-[22.5px]"*/}
            {/*  preserveAspectRatio="none"*/}
            {/*>*/}
            {/*  <path*/}
            {/*    d="M8.29897 6L5.70103 6L-2.62268e-07 9.53674e-07L3.20232 8.13697e-07L6.96392 4.26316L6.79253 4.21491L7.20747 4.21491L7.03608 4.26316L10.7977 4.81693e-07L14 3.41715e-07L8.29897 6Z"*/}
            {/*    fill="#DADADA"*/}
            {/*  />*/}
            {/*</svg>*/}

          <div
            className="flex justify-start items-center w-72 gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="#9A97A9"
              className="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
            </svg>
            <input
              type="text"
              className="w-full"
              placeholder="검색할 내용을 입력하세요."
            />
          </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="overflow-x-auto w-full mt-6 px-6">
          {/*{loading && <p className="text-sm text-gray-500">데이터를 불러오는 중입니다...</p>}*/}
          {/*{error && <p className="text-sm text-red-500">{error}</p>}*/}

          <table className="w-full text-sm text-[#16161b]">
            <thead>
            <tr className="border-b border-[#ebebeb]">
              <th className="py-4 w-[130px] text-center">번호</th>
              <th className="py-4 w-[150px] text-center">작성자</th>
              <th className="py-4 w-[150px] text-center">승인자</th>
              <th className="py-4 w-[130px] text-center">승인 상태</th>
              <th className="py-4 w-[200px] text-center">승인 메시지</th>
              <th className="py-4 w-[130px] text-center">활동일</th>
              <th className="py-4 w-[130px] text-center">작성일</th>
              <th className="py-4 w-[130px] text-center">첨부파일</th>
            </tr>
            </thead>
            <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">데이터를 불러오는 중입니다...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-red-500">{error}</td>
              </tr>
            ) : clubs.length > 0 ? (
              clubs.map((club, index) => (
                <tr key={club.clubId} className="border-b border-[#ebebeb]"
                    style={{cursor: 'pointer'}} onClick={() => openDetailModal(club)}>
                  <td className="py-4 text-center">{index + 1}</td>
                  <td className="py-4 text-center">{club.writer}</td>
                  <td className="py-4 text-center">{club.checker || '-'}</td>
                  <td className="py-4 text-center">
                    {club.checkStatus === 'W' ? '대기' :
                      club.checkStatus === 'Y' ? '승인' : '미승인'}
                  </td>
                  <td className="py-4 text-center">{club.checkMessage || '-'}</td>
                  <td className="py-4 text-center">{club.studyDate}</td>
                  <td className="py-4 text-center">{club.regDate}</td>
                  <td className="py-4 text-center">{club.attachmentFileName || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-4 text-center text-gray-500">
                  조회된 내용이 없습니다.
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>

        {/* Modal Section */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className="flex flex-col justify-start items-start w-[860px] h-[700px] relative overflow-hidden rounded-[28px] bg-white">
              {/* Modal Header */}
              <div
                className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 h-[76px] gap-1 p-6">
                <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative">
                  <p className="flex-grow-0 flex-shrink-0 text-[22px] font-black text-left text-[#101828]">
                    동아리 신청
                  </p>
                  <svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-grow-0 flex-shrink-0 w-6 h-6 relative cursor-pointer"
                    preserveAspectRatio="none"
                    onClick={closeModal}
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
              <div className="flex-grow-0 flex-shrink-0 w-[860px] h-[650px] relative overflow-hidden bg-white">
                <div className="flex justify-start items-center w-[820px] absolute left-5 top-[516px] gap-5 py-9">
                  <div className="flex-grow-0 flex-shrink-0 w-[400px] h-12 cursor-pointer"
                       onClick={closeModal}
                  >
                    <div className="w-[400px] h-12 absolute left-[-0.5px] top-[35.5px] rounded-2xl bg-[#d9d9d9]"/>
                    <p
                      className="w-[35.93px] absolute left-[182.04px] top-12 text-base font-semibold text-left text-black">
                      취소
                    </p>
                  </div>
                  <div className="flex-grow-0 flex-shrink-0 w-[400px] h-12 cursor-pointer"
                       onClick={handleSubmit}
                  >
                    <div className="w-[400px] h-12 absolute left-[419.5px] top-[35.5px] rounded-2xl bg-[#225930]"/>
                    <p className="absolute left-[605px] top-12 text-base font-semibold text-left text-white">
                      저장
                    </p>
                  </div>
                </div>

                <div
                  className="flex flex-col justify-start items-start w-[780px] h-[492px] absolute left-10 top-0 gap-8">
                  {/* 작성자 */}
                  <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-8">
                    <div className="flex-grow-0 flex-shrink-0 w-[780px] h-12">
                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">작성자</p>
                      <input
                        className="w-[780px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"
                        value={formData.writer}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* 참여자 */}
                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[67px]">
                    <p className="absolute left-0 top-[99px] text-sm font-black text-left text-black">참여자<span
                      className="text-red-500">*</span></p>
                    <input
                      className={`w-[780px] h-11 absolute left-[-0.5px] top-[121.5px] rounded-2xl bg-white border ${formData.participants ? 'border-[#efeff3]' : 'border-red-500'}`}
                      name="participants"
                      value={formData.participants}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* 내용 */}
                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[103px]">
                    <p className="absolute left-0 top-[198px] text-sm font-black text-left text-black">내용</p>
                    <textarea
                      className="w-[780px] h-20 absolute left-[-0.5px] top-[220.5px] rounded-2xl bg-white border border-[#efeff3]"
                      name="content"
                      value={formData.content}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* 활동일 및 작성일 */}
                  <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-8">
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">활동일<span
                        className="text-red-500">*</span></p>
                      <input
                        className={`w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border ${formData.studyDate ? 'border-[#efeff3]' : 'border-red-500'}`}
                        name="studyDate"
                        type="date"
                        value={formData.studyDate}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">작성일</p>
                      <input
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"
                        value={formData.regDate}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {isOwner && (
                  <div className="flex justify-start items-center w-[820px] absolute left-5 top-[616px] gap-5 py-9">
                      {!isEditing ? (
                        <>
                          {selectedClub.checkStatus === 'W' ? (
                            <>
                              {/* 삭제 버튼 */}
                              <div className="flex-grow-0 flex-shrink-0 w-[400px] h-12 cursor-pointer"
                                   onClick={handleDelete}
                              >
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
                          ) : selectedClub.checkStatus === 'Y' ? (
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
                          ) : null}
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
                )}
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
                      value={isEditing ? formData.participants : selectedClub.participants}
                      name="participants"
                      onChange={handleInputChange}
                      disabled={!isEditing || selectedClub.checkStatus !== 'W'}
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
                      value={isEditing ? formData.content : selectedClub.content}
                      name="content"
                      onChange={handleInputChange}
                      disabled={!isEditing || selectedClub.checkStatus !== 'W'}
                      className="w-[780px] h-20 absolute left-[-0.5px] top-[220.5px] rounded-2xl bg-white border border-[#efeff3] px-4 py-2 outline-none resize-none"
                    />
                  </div>
                  <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-8">
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">승인상태</p>
                      <div
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      {/*<p className="absolute left-[13px] top-[35px] text-[15px] text-left text-black">*/}
                      {/*  {selectedClub.checkStatus === 'Y' ? '승인' : selectedClub.checkStatus === 'N' ? '미승인' : '대기'}*/}
                      {/*</p>*/}
                      <input
                        type="text"
                        value={selectedClub.checkStatus === 'Y' ? '승인' : selectedClub.checkStatus === 'N' ? '미승인' : '대기'}
                        name="checkStatus"
                        onChange={handleInputChange}
                        disabled
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                      />
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
                        value={selectedClub.checkMessage || ""}
                        name="checkMessage"
                        onChange={handleInputChange}
                        disabled
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
                        value={isEditing ? formData.studyDate : selectedClub.studyDate}
                        name="studyDate"
                        onChange={handleInputChange}
                        disabled={!isEditing || selectedClub.checkStatus !== 'W'}
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
                        value={
                          isEditing
                            ? selectedClub.checkStatus === 'W'
                              ? new Date().toLocaleDateString('en-CA') // 승인 대기 상태일 때, 현재 날짜
                              : selectedClub.regDate // 승인 상태일 때, 저장된 값
                            : selectedClub.regDate // 수정 비활성화 상태일 때, 저장된 값
                        }
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
                    <p className="absolute left-[13px] top-[565px] text-sm text-left text-black">
                      {formData.file ? formData.file.name : "첨부된 파일 없음"}
                    </p>
                    <input
                      type={isEditing && selectedClub.checkStatus === 'Y' ? "file" : "text"}
                      name="file"
                      onChange={handleFileChange}
                      disabled={!isEditing || selectedClub.checkStatus !== 'Y'}
                      className="w-[780px] h-11 absolute left-[-0.5px] top-[553.5px] rounded-2xl bg-white border border-[#efeff3] px-4 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default ClubList;