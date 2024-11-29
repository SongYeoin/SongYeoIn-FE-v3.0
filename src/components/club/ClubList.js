import React, {useCallback, useContext, useEffect, useState} from 'react';
import axios from 'axios';
import StudentLayout from '../common/layout/student/StudentLayout';
import { format } from 'date-fns';
import {CourseContext} from '../common/CourseContext';

const ClubList = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedClub, setSelectedClub] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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


  // Get courseId from URL or context (adjust as needed)
  //const courseIdString = new URLSearchParams(window.location.search).get('courseId');
  //const courseIdString = "1";

  //console.log("courseId: ", courseIdString);

  // courseId를 Long(즉, 숫자) 타입으로 변환
  //const courseId = Number(courseIdString);
  //const courseId = courseIdString && !isNaN(Number(courseIdString)) ? Number(courseIdString) : 1;

  // Fetch club list
  useEffect(() => {
    const fetchCourseId = async () => {
      try {
        setLoading(true);

        const result = await axios.get('/club');
        console.log(result.data);  // 응답 데이터 확인
        const fetchedCourseId = result.data.course?.id;
        console.log(fetchedCourseId);

        //const fetchedCourseId = Number(resultCourseId);

        if (fetchedCourseId) {
          setCourseId(fetchedCourseId); // 전역 상태에 저장
          console.log(`Fetched and set Course ID: ${fetchedCourseId}`);
        } else {
          console.error('유효한 Course ID를 가져오지 못했습니다.');
        }
      } catch (err) {
        console.error('Error fetching Course ID', err);
      }
    };
    fetchCourseId();
  }, [setCourseId]);

  // if (!courseIdString) {
  //   alert("courseId가 필요합니다.");
  //   return;
  // }
  //
  // if (isNaN(courseId)) {
  //   alert("유효하지 않은 courseId입니다.");
  //   return;
  // }
  //
  // console.log("Converted courseId (Long type):", courseId);

  const fetchClubList = useCallback (async() => {
    if(!courseId) return; // courseId가 없으면 실행하지 않음
    setLoading(true);
    try {
      const response = await axios.get(`/club/${courseId}/list`, {
        params: {
          //courseId: courseId,
          pageNum: currentPage
        },
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      console.log("Fetched club list:", response.data.list);
      setClubs(response.data.list);
      setTotalPages(response.data.pageInfo.totalPages);
      setLoading(false);
    } catch (err) {
      setError('데이터를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  }, [courseId, currentPage]);

  // useEffect에서 fetchClubList 호출
  useEffect(() => {
    fetchClubList();
  }, [fetchClubList, courseId, currentPage]);

  const fetchClubDetails = async (clubId) => {
    try{
      console.log("fetchClubDetails 호출 - Club ID: ", clubId);
      const response = await axios.get(`/club/${clubId}/detail`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
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
    axios.get('/club/${courseId}/register', {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      }
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

  // Submit form
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

      const response = await axios.post(`/club/${courseId}`, submitData, {
        //params: { courseId: courseId },  // courseId를 쿼리 파라미터로 전달
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
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

  // Pagination change handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <StudentLayout currentPage={currentPage}
                   totalPages={totalPages}
                   onPageChange={handlePageChange}
    >
      <div className="flex flex-col items-center justify-start mx-auto w-[1680px] h-[1000px]">
        {/* Header Section */}
        <div className="flex justify-between w-full mt-10 px-6">
          <h1 className="text-2xl font-bold">동아리</h1>
          <button
            onClick={openApplyModal}
            className="bg-[#225930] text-white flex items-center justify-center p-2 rounded-md"
          >
            <span className="mr-2">+</span> 신청
          </button>
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
                    style={{ cursor: 'pointer' }} onClick={() => openDetailModal(club)}>
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
            <div className="flex flex-col justify-start items-start w-[860px] h-[800px] relative overflow-hidden rounded-[28px] bg-white">
              {/* Modal Header */}
              <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 h-[76px] gap-1 p-6">
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
                  <div className="flex-grow-0 flex-shrink-0 w-[400px] h-12 cursor-pointer"
                       onClick={closeModal}
                  >
                    <div className="w-[400px] h-12 absolute left-[-0.5px] top-[35.5px] rounded-2xl bg-[#d9d9d9]"/>
                    <p
                      className="w-[35.93px] absolute left-[182.04px] top-12 text-base font-semibold text-left text-black">
                      삭제
                    </p>
                  </div>
                  <div className="flex-grow-0 flex-shrink-0 w-[400px] h-12 cursor-pointer"
                       onClick={handleSubmit}
                  >
                    <div className="w-[400px] h-12 absolute left-[419.5px] top-[35.5px] rounded-2xl bg-[#225930]"/>
                    <p className="absolute left-[605px] top-12 text-base font-semibold text-left text-white">
                      수정
                    </p>
                  </div>
                </div>
                <div className="flex flex-col justify-start items-start w-[780px] h-[592px] absolute left-10 top-0 gap-8">
                  <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-8">
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">번호</p>
                      <div
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      <p className="absolute left-[13px] top-[35px] text-[15px] text-left text-black">{selectedClub.ClubId}</p>
                    </div>
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">
                        작성자/승인자
                      </p>
                      <div
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      <p className="absolute left-[419px] top-[35px] text-[15px] text-left text-black">
                        {selectedClub.writer || '-'} / {selectedClub.checker || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[67px]">
                    <p className="absolute left-0 top-[99px] text-sm font-black text-left text-black">참여자</p>
                    <div
                      className="w-[780px] h-11 absolute left-[-0.5px] top-[121.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                    <p className="absolute left-[13px] top-[134px] text-[15px] text-left text-black">{selectedClub.participants || '-'}</p>
                  </div>
                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[103px]">
                    <p className="absolute left-0 top-[198px] text-sm font-black text-left text-black">내용</p>
                    <div
                      className="w-[780px] h-20 absolute left-[-0.5px] top-[220.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                    <p
                      className="absolute left-[13px] top-[251px] text-[15px] text-left text-black">{selectedClub.content || '-'}</p>
                  </div>
                  <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-8">
                  <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">승인상태</p>
                      <div
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      <p className="absolute left-[13px] top-[35px] text-[15px] text-left text-black">
                        {selectedClub.checkStatus === 'Y' ? '승인' : selectedClub.checkStatus === 'N' ? '미승인' : '대기'}
                      </p>
                    </div>
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">
                        승인메시지
                      </p>
                      <div
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      <p className="absolute left-[420px] top-[35px] text-[15px] text-left text-black">{selectedClub.checkMessage || '-'}</p>
                    </div>
                  </div>
                  <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 relative gap-8">
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-0 top-0 text-sm font-black text-left text-black">활동일</p>
                      <div
                        className="w-[374px] h-11 absolute left-[-0.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      <p className="absolute left-[13px] top-[35px] text-[15px] text-left text-black">
                        {selectedClub.studyDate}
                      </p>
                    </div>
                    <div className="flex-grow-0 flex-shrink-0 w-[374px] h-[67px]">
                      <p className="absolute left-[406px] top-0 text-sm font-black text-left text-black">
                        작성일
                      </p>
                      <div
                        className="w-[374px] h-11 absolute left-[405.5px] top-[22.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                      <p className="absolute left-[419px] top-[35px] text-[15px] text-left text-black">
                        {selectedClub.regDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex-grow-0 flex-shrink-0 w-[780px] h-[67px]">
                    <p className="absolute left-0 top-[531px] text-sm font-black text-left text-black">
                      동아리 일지 첨부
                    </p>
                    <div
                      className="w-[780px] h-11 absolute left-[-0.5px] top-[553.5px] rounded-2xl bg-white border border-[#efeff3]"/>
                    <p className="absolute left-[13px] top-[565px] text-sm text-left text-black">
                      {selectedClub.attachment || '-'}
                    </p>
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