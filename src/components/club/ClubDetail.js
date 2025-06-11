import React, { useEffect, useState } from 'react';
import axios from 'api/axios';
import { isAfter, isBefore, isSameDay, parseISO, addMonths } from 'date-fns';

const ClubDetail = ({ club, courseId, user, onClose, onUpdateSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(club);
  const [originalClub, setOriginalClub] = useState(club);
  const isOwner = user?.name === club.writer;

  const [participantList, setParticipantList] = useState([]);
  const [contactNumberError, setcontactNumberError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [classmates, setClassmates] = useState([]);
  const [courseDetails, setCourseDetails] = useState({
    startDate: '',
    endDate: ''
  });
  const [isWithinCoursePeriod, setIsWithinCoursePeriod] = useState(false);

  useEffect(() => {
    console.log('club:', club);

    // Parse participants string to array when component mounts or editing starts
    if (club.participants) {
      const participants = club.participants.split(',').map(p => p.trim()).filter(p => p);
      setParticipantList(participants);
    }

    // Fetch course details on mount to check if we're within the course period
    if (courseId) {
      fetchCourseDetails(courseId);
    }

    // When editing starts, fetch classmates if needed
    if (isEditing && courseId) {
      fetchClassmates(courseId);
    }
  }, [club, isEditing, courseId]);

  const fetchCourseDetails = (courseId) => {
    console.log('Fetching course details for:', courseId);
    axios.get(`${process.env.REACT_APP_API_URL}/club/course/${courseId}`)
      .then(response => {
        console.log('Course details received:', response.data);
        const courseData = {
          startDate: response.data.course.startDate,
          endDate: response.data.course.endDate
        };
        setCourseDetails(courseData);

        // Check if current date is within course period
        const today = new Date();
        const startDate = parseISO(courseData.startDate);
        const endDate = parseISO(courseData.endDate);
        const sixMonthsAfterEndDate = addMonths(endDate, 6);

        const isWithinPeriod =
          (isAfter(today, startDate) || isSameDay(today, startDate)) &&
          (isBefore(today, sixMonthsAfterEndDate) || isSameDay(today, sixMonthsAfterEndDate));

        setIsWithinCoursePeriod(isWithinPeriod);
      })
      .catch(err => {
        console.error('Failed to fetch course details', err);
        alert('과정 정보를 불러오는 데 실패했습니다.');
      });
  }

  const fetchClassmates = (courseId) => {
    axios.get(`${process.env.REACT_APP_API_URL}/club/classmates/${courseId}`)
      .then(response => {
        if (response.data && response.data.content && Array.isArray(response.data.content)) {
          setClassmates(response.data.content);
        } else {
          console.error('Unexpected members data format:', response.data);
        }
      })
      .catch(err => {
        console.error('Failed to fetch class members', err);
        alert('수강생 정보를 불러오는 데 실패했습니다.');
      });
  };

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Skip validation for fields other than file when checkStatus is 'Y'
    if (club.checkStatus === 'Y') return;

    if (name === 'startTime' || name === 'endTime') {
      validateTime(name === 'startTime' ? value : formData.startTime,
                  name === 'endTime' ? value : formData.endTime);
    }

    if (name === 'contactNumber') {
      validatecontactNumber(value);
    }

    if (name === 'studyDate') {
      validateStudyDate(value);
    }
  };

  // 활동일 유효성 검사 함수
  const validateStudyDate = (date) => {
    if (!date) {
      setDateError('활동일을 입력해주세요.');
      return false;
    }

    const studyDate = parseISO(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 활동일이 현재 날짜 이후인지 확인
    if (isBefore(studyDate, today) && !isSameDay(studyDate, today)) {
      setDateError('활동일은 오늘 포함 이후 날짜여야 합니다.');
      return false;
    }

    // 활동일이 수강 기간 내인지 확인
    if (courseDetails.startDate && courseDetails.endDate) {
      const courseStartDate = parseISO(courseDetails.startDate);
      const courseEndDate = parseISO(courseDetails.endDate);

      if (isBefore(studyDate, courseStartDate) || isAfter(studyDate, courseEndDate)) {
        setDateError('활동일은 수강 기간 내여야 합니다.');
        return false;
      }
    }

    setDateError('');
    return true;
  };

  const validateTime = (start, end) => {
    if (!start || !end) {
      setTimeError('');
      return true;
    }

    const startHour = parseInt(start.split(':')[0]);
    const startMinute = parseInt(start.split(':')[1]);
    const endHour = parseInt(end.split(':')[0]);
    const endMinute = parseInt(end.split(':')[1]);

    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      setTimeError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return false;
    }

    setTimeError('');
    return true;
  };

  const validatecontactNumber = (contactNumber) => {
    if (!contactNumber) {
      setcontactNumberError('');
      return true;
    }

    const phoneRegex = /^010-\d{4}-\d{4}$/;
    const isValid = phoneRegex.test(contactNumber);

    if (!isValid) {
      setcontactNumberError('연락처 형식이 올바르지 않습니다. 010-XXXX-XXXX 형식으로 입력');
    } else {
      setcontactNumberError('');
    }

    return isValid;
  };

  // 참여자 선택 핸들러
  const handleParticipantSelect = (e) => {
    const selectedParticipant = e.target.value;

    // 이미 선택된 참여자인지 확인
    if (participantList.includes(selectedParticipant)) {
      alert('이미 선택된 참여자입니다.');
      e.target.value = ''; // select 초기화
      return;
    }

    if (selectedParticipant && !participantList.includes(selectedParticipant)) {
      const newList = [...participantList, selectedParticipant];
      setParticipantList(newList);

      // Update formData with string representation and count
      setFormData(prev => ({
        ...prev,
        participants: newList.join(', '),
        participantCount: newList.length
      }));
    }

    // Reset dropdown to default value
    e.target.value = "";
  };

  // 참여자 제거 핸들러
  const handleRemoveParticipant = (participant) => {
    const newList = participantList.filter(p => p !== participant);
    setParticipantList(newList);

    // Update formData with string representation and count
    setFormData(prev => ({
      ...prev,
      participants: newList.join(', '),
      participantCount: newList.length
    }));
  };

  // 파일 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  // 저장 핸들러
  const handleSaveEdit = async () => {
    // For approved clubs (Y), only validate file changes
    if (club.checkStatus === 'Y') {
      try {
        const newFormData = new FormData();
        const clubData = {
        participants: formData.participants,
              participantCount: formData.participantCount,
              content: formData.content,
              studyDate: formData.studyDate,
              startTime: formData.startTime,
              endTime: formData.endTime,
              clubName: formData.clubName,
              contactNumber: formData.contactNumber
               };

        // Only include the file in the update for approved clubs
        newFormData.append("club", new Blob([JSON.stringify(clubData)], { type: "application/json" }));
        // 파일이 있는 경우에만 추가
        if (formData.file && formData.file.size > 0) {
          newFormData.append("file", formData.file);
        }

        await axios.put(`${process.env.REACT_APP_API_URL}/club/${club.clubId}`, newFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert('수정이 완료되었습니다.');
        setIsEditing(false);
        onUpdateSuccess();
        onClose();
      } catch (err) {
        console.error('수정 실패:', err);
        alert('수정에 실패했습니다.');
        setIsEditing(false);
      }
      return;
    }

    // For pending clubs (W), validate all fields
    if (!formData.participants || !formData.studyDate || !formData.clubName || !formData.startTime || !formData.endTime) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.contactNumber && !validatecontactNumber(formData.contactNumber)) {
      alert('연락처 형식이 올바르지 않습니다. 010-XXXX-XXXX 형식으로 입력해주세요.');
      return;
    }

    if (!validateTime(formData.startTime, formData.endTime)) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }

    if (!validateStudyDate(formData.studyDate)) {
      alert(`활동일은 수강 기간 내(${courseDetails.startDate} ~ ${courseDetails.endDate})여야 합니다.`);
      return;
    }

    // 제출 전에 참여자 수가 있는지 확인하고, 없으면 다시 계산
    let submissionData = { ...formData };
    if (!submissionData.participantCount || submissionData.participantCount === '0') {
      const count = participantList.length.toString();
      submissionData.participantCount = count;
      // 로컬 상태도 업데이트
      setFormData(prev => ({
        ...prev,
        participantCount: count
      }));
    }

    try {
      const newFormData = new FormData();
      const clubData = {
        participants: formData.participants,
        participantCount: formData.participantCount,
        content: formData.content,
        studyDate: formData.studyDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        clubName: formData.clubName,
        contactNumber: formData.contactNumber
      };
      newFormData.append("club", new Blob([JSON.stringify(clubData)], { type: "application/json" }));

      if (formData.file && formData.file.size > 0) {
        newFormData.append("file", formData.file);
      }

      await axios.put(`${process.env.REACT_APP_API_URL}/club/${club.clubId}`, newFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert('수정이 완료되었습니다.');
      setIsEditing(false);
      onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정에 실패했습니다.');
      setIsEditing(false);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    const isConfirmed = window.confirm('정말로 삭제하시겠습니까?');
    if (isConfirmed) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/club/${club.clubId}`);
        alert('삭제되었습니다.');
        onUpdateSuccess();
        onClose();
      } catch (err) {
        console.error('삭제 실패:', err);
        alert('삭제에 실패했습니다.');
      }
    } else {
      alert('삭제가 취소되었습니다.');
    }
  };

  //수정 핸들러
  const handleEditClick = () => {
    if (!user) {
      console.error('사용자 정보가 없습니다. user 객체:', user);
      return;
    }

    setOriginalClub({...club});

    const participants = club.participants ?
      club.participants.split(',').map(p => p.trim()).filter(p => p) : [];
    setParticipantList(participants);

    setIsEditing(true);
    setFormData(club);

    // 수정 모드로 전환시 과정 정보를 가져옴 - 활동일 검증을 위해 필요
    fetchCourseDetails(courseId);
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

  // 파일 다운로드 핸들러
  const handleFileDownload = async (e, club) => {

    if (!club.file || !club.file.id) {
        alert('다운로드할 파일이 없습니다.');
        return;
      }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/club/${club.clubId}/download`, {
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
        return;
      }

      // 응답 헤더에서 파일 이름 추출
      const contentDisposition = response.headers['content-disposition'];
      let filename = extractFilenameFromContentDisposition(contentDisposition) || club.file.originalName || `club_file_${club.clubId}.pdf`;

      // 파일명 디코딩 (문제 발생 시 원본 값 사용)
      try {
        filename = decodeURIComponent(filename);
      } catch (e) {
        console.warn('Filename decoding failed, using original value', e);
      }

      // 파일 다운로드 처리
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename); // 다운로드할 파일명 설정
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl); // Blob URL 해제
    } catch (err) {
      console.error('File download error:', err);

      // 서버에서 반환한 에러 메시지가 있는 경우
      if (err.response && err.response.data) {
        try {
          // JSON 객체인 경우
          if (typeof err.response.data === 'object') {
            alert(err.response.data.message || '파일 다운로드에 실패했습니다.');
            return;
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
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">동아리 상세보기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">작성자/승인자</label>
              <input
                type="text"
                value={`${club.writer || ""} / ${club.checker || ""}`}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">작성일</label>
              <input
                type="date"
                value={isEditing
                  ? club.checkStatus === 'W'
                    ? new Date().toLocaleDateString('en-CA')
                    : club.regDate
                  : club.regDate
                }
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">동아리명 {isEditing && club.checkStatus === 'W' && <span className="text-red-500">*</span>}</label>
              <input
                type="text"
                value={isEditing ? formData.clubName || "" : club.clubName || ""}
                name="clubName"
                onChange={handleInputChange}
                disabled={!isEditing || club.checkStatus === 'Y'}
                className={`w-full px-3 py-2 border rounded-lg ${(!isEditing || club.checkStatus === 'Y') ? 'bg-gray-100' : 'bg-white'}`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">대표연락처</label>
              <input
                type="text"
                value={isEditing ? formData.contactNumber || "" : club.contactNumber || ""}
                name="contactNumber"
                onChange={handleInputChange}
                disabled={!isEditing || club.checkStatus === 'Y'}
                className={`w-full px-3 py-2 border rounded-lg ${(!isEditing || club.checkStatus === 'Y') ? 'bg-gray-100' : 'bg-white'} ${contactNumberError ? 'border-red-500' : ''}`}
                placeholder="010-0000-0000"
              />
              {isEditing && club.checkStatus === 'W' && contactNumberError && (
                <p className="text-red-500 text-xs mt-1">{contactNumberError}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">활동일 {isEditing && club.checkStatus === 'W' && <span className="text-red-500">*</span>}</label>
              <input
                type="date"
                value={isEditing ? formData.studyDate : club.studyDate}
                name="studyDate"
                onChange={handleInputChange}
                disabled={!isEditing || club.checkStatus === 'Y'}
                min={new Date().toLocaleDateString('en-CA')}
                className={`w-full px-3 py-2 border rounded-lg ${(!isEditing || club.checkStatus === 'Y') ? 'bg-gray-100' : 'bg-white'} ${dateError ? 'border-red-500' : ''}`}
              />
              {isEditing && club.checkStatus === 'W' && dateError && (
                <p className="text-red-500 text-xs mt-1">{dateError}</p>
              )}
              {isEditing && courseDetails.startDate && courseDetails.endDate && club.checkStatus === 'W' && (
                <p className="text-gray-500 text-xs mt-1">
                  수강 기간: {courseDetails.startDate} ~ {courseDetails.endDate}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">시작 시간 {isEditing && club.checkStatus === 'W' && <span className="text-red-500">*</span>}</label>
              <input
                type="time"
                value={isEditing ? formData.startTime || "" : club.startTime || ""}
                name="startTime"
                onChange={handleInputChange}
                disabled={!isEditing || club.checkStatus === 'Y'}
                className={`w-full px-3 py-2 border rounded-lg ${(!isEditing || club.checkStatus === 'Y') ? 'bg-gray-100' : 'bg-white'} ${timeError ? 'border-red-500' : ''}`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">종료 시간 {isEditing && club.checkStatus === 'W' && <span className="text-red-500">*</span>}</label>
              <input
                type="time"
                value={isEditing ? formData.endTime || "" : club.endTime || ""}
                name="endTime"
                onChange={handleInputChange}
                disabled={!isEditing || club.checkStatus === 'Y'}
                className={`w-full px-3 py-2 border rounded-lg ${(!isEditing || club.checkStatus === 'Y') ? 'bg-gray-100' : 'bg-white'} ${timeError ? 'border-red-500' : ''}`}
              />
              {isEditing && club.checkStatus === 'W' && timeError && (
                <p className="text-red-500 text-xs mt-1">{timeError}</p>
              )}
            </div>
          </div>

          {/* 참여자 선택 - Only shown in edit mode for pending clubs */}
          {club.checkStatus === 'W' && isEditing && (
            <div className="mb-4">
              <label className="text-sm text-gray-600 font-bold">참여자 선택 <span className="text-red-500">*</span></label>
              <select
                value=""
                onChange={handleParticipantSelect}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">참여자를 선택하세요</option>
                {classmates.length > 0 ? (
                  classmates.map((member, index) => (
                    <option key={member.id || index} value={member.name}>
                      {member.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>수강생 목록을 불러오는 중...</option>
                )}
              </select>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-sm text-gray-600 font-bold">참여자</label>
              {isEditing ? (
                club.checkStatus === 'W' ? (
                  <div className="w-full px-3 py-2 border rounded-lg min-h-[42px] bg-white">
                    {participantList.map((participant, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center bg-gray-100 rounded px-2 py-1 mr-2 mb-1"
                      >
                        {participant}
                        <button
                          onClick={() => handleRemoveParticipant(participant)}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 min-h-[42px]">
                    <div className="flex flex-wrap gap-x-1">
                      {club.participants ?
                        club.participants.split(',').map((participant, index, array) => (
                          <span key={index} className="whitespace-nowrap">
                            {participant.trim()}
                            {index < array.length - 1 && ','}
                          </span>
                        )) : ""
                      }
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 min-h-[42px]">
                  <div className="flex flex-wrap gap-x-1">
                    {club.participants ?
                      club.participants.split(',').map((participant, index, array) => (
                        <span key={index} className="whitespace-nowrap">
                          {participant.trim()}
                          {index < array.length - 1 && ','}
                        </span>
                      )) : ""
                    }
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">총 인원</label>
              <input
                type="number"
                value={isEditing ? formData.participantCount || 0 : club.participantCount || 0}
                name="participantCount"
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 font-bold">목적 및 내용</label>
            {isEditing && club.checkStatus === 'W' ? (
              <textarea
                value={formData.content || ""}
                name="content"
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg resize-y min-h-[120px] bg-white"
                placeholder="동아리 활동의 목적과 내용을 입력하세요"
              />
            ) : (
              <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 whitespace-pre-wrap min-h-[120px]">
                {club.content}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">승인상태</label>
              <input
                type="text"
                value={club.checkStatus === 'Y' ? '승인' : club.checkStatus === 'N' ? '미승인' : '대기'}
                disabled
                className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${club.checkStatus === 'Y' ? 'text-green-600' : club.checkStatus === 'N' ? 'text-red-600' : 'text-gray-600'}`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">승인메시지</label>
              <input
                type="text"
                value={club.checkMessage || ""}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 font-bold">첨부파일</label>
            {isEditing ? (
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                accept=".hwp, .hwpx, .docx, .doc"
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            ) : (
              <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 flex items-center justify-between">
                {club.file ? (
                  <div
                    onClick={(e) => handleFileDownload(e, club)}
                    className="text-blue-500 underline cursor-pointer"
                    //className="cursor-pointer hover:text-blue-500 file-download-btn"
                  >{club.file.originalName}</div>
                ) : (
                  <span>첨부된 파일 없음</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        {isOwner && (
          <div className="flex justify-end gap-2 mt-4">
            {!isEditing ? (
              <>
              {isWithinCoursePeriod && (
                <>
                {club.checkStatus === 'W' ? (
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
                ) : (club.checkStatus === 'Y' && (
                  <button
                    onClick={handleEditClick}
                    className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                  >
                    수정
                  </button>
                ))}
                </>
              )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setFormData(originalClub);
                    setParticipantList([]);
                    setIsEditing(false);
                    setcontactNumberError('');
                    setDateError('');
                    setTimeError('');
                  }}
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
  );
};

export default ClubDetail;