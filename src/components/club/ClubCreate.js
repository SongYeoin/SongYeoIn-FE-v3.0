import React, { useState } from 'react';
import axios from 'api/axios';
import { format, isAfter, isBefore, isSameDay, parseISO, addMonths } from 'date-fns';

const ClubCreate = ({ selectedCourse, onClose, onSubmitSuccess }) => {
  const initialFormData = {
    writer: '',
    regDate: '',
    clubName: '',
    contactNumber: '',
    studyDate: '',
    startTime: '',
    endTime: '',
    participants: '',
    participantCount: '',
    content: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [participantList, setParticipantList] = useState([]);
  const [contactNumberError, setContactNumberError] = useState('');
  const [dateError, setDateError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [courseDetails, setCourseDetails] = useState({
    startDate: '',
    endDate: ''
  });
  const [classmates, setClassmates] = useState([]);

  // 초기 데이터 설정
  React.useEffect(() => {
  console.log("selectedCourse: ", selectedCourse);
    // 사용자 정보 가져오기
    axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourse}/register`)
      .then(response => {
        setFormData(prev => ({
          ...prev,
          writer: response.data.name,
          regDate: format(new Date(), 'yyyy-MM-dd')
        }));
      })
      .catch(err => {
        console.error('Failed to fetch user details', err);
        alert('사용자 정보를 불러오는 데 실패했습니다.');
      });

    // 과정 기간 정보 가져오기
    axios.get(`${process.env.REACT_APP_API_URL}/club/course/${selectedCourse}`)
      .then(response => {
        setCourseDetails({
          startDate: response.data.course.startDate,
          endDate: response.data.course.endDate
        });
      })
      .catch(err => {
              console.error('Failed to fetch course details', err);
              alert('과정 정보를 불러오는 데 실패했습니다.');
      });

    // 동기 목록 정보 가져오기
    axios.get(`${process.env.REACT_APP_API_URL}/club/classmates/${selectedCourse}`)
      .then(response => {
          // 클래스메이트 정보 저장
          if (response.data && response.data.content && Array.isArray(response.data.content)) {
            // MemberDTO 객체 배열에서 이름만 추출
            setClassmates(response.data.content);
          } else {
            console.error('Unexpected members data format:', response.data);
          }
        })
        .catch(err => {
          console.error('Failed to fetch class members', err);
          alert('수강생 정보를 불러오는 데 실패했습니다.');
        });

  }, [selectedCourse]);

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'writer' || name === 'regDate') return;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 시간 입력 필드가 변경되었다면 시간 검증 실행
    if (name === 'startTime' || name === 'endTime') {
      // 시작 시간과 종료 시간이 모두 입력된 경우에만 검증
      if (formData.startTime && formData.endTime ||
          (name === 'startTime' && formData.endTime) ||
          (name === 'endTime' && formData.startTime)) {
        validateTime();
      }
    }
  };

  // 시간 유효성 검사 함수
  const validateTime = () => {
    // 시작 시간이나 종료 시간이 비어있으면 검증 통과
    if (!formData.startTime || !formData.endTime) {
      setTimeError('');
      return true;
    }

    // 시간 비교를 위해 문자열을 숫자로 변환
    const startHour = parseInt(formData.startTime.split(':')[0]);
    const startMinute = parseInt(formData.startTime.split(':')[1]);
    const endHour = parseInt(formData.endTime.split(':')[0]);
    const endMinute = parseInt(formData.endTime.split(':')[1]);

    // 종료 시간이 시작 시간보다 이른 경우
    if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
      setTimeError('종료 시간은 시작 시간보다 늦어야 합니다.');
      return false;
    }

    // 검증 통과
    setTimeError('');
    return true;
  };

  // 연락처 유효성 검사
  const validateContactNumber = () => {
    // 연락처가 비어있는 경우는 허용 (필수 필드가 아니므로)
    if (!formData.contactNumber) {
          setContactNumberError('');
          return true;
    }

    // 한국 휴대폰 번호 형식 검사 (010-XXXX-XXXX)
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    const isValid = phoneRegex.test(formData.contactNumber);

      if (!isValid) {
        setContactNumberError('연락처 형식이 올바르지 않습니다. 010-XXXX-XXXX 형식으로 입력');
      } else {
        setContactNumberError('');
      }

      return isValid;
  };

  // 활동일 유효성 검사
  const validateStudyDate = () => {
    if (!formData.studyDate) return { isValid: false, message: '활동일을 입력해주세요.' };

    const studyDate = parseISO(formData.studyDate);
    const regDate = new Date().toLocaleDateString('en-CA');

    // 활동일이 작성일 이후인지 확인
    if (isBefore(studyDate, regDate) && !isSameDay(studyDate, regDate)) {
      const errorMsg = '활동일은 오늘 포함 이후 날짜여야 합니다.';
      setDateError(errorMsg);
      return { isValid: false, message: errorMsg };
    }

    // 활동일이 수강 기간 내인지 확인
    if (courseDetails.startDate && courseDetails.endDate) {
      const courseStartDate = parseISO(courseDetails.startDate);
      const courseEndDate = parseISO(courseDetails.endDate);
      const sixMonthsAfterEndDate = addMonths(courseEndDate, 6);

      if (isBefore(studyDate, courseStartDate) || isAfter(studyDate, sixMonthsAfterEndDate)) {
        const errorMsg = `활동일은 수강 기간 내 또는 종강 후 6개월 이내(${courseDetails.startDate} ~ ${format(sixMonthsAfterEndDate, 'yyyy-MM-dd')})여야 합니다.`;
        setDateError('활동일은 수강 기간 내 또는 종강 후 6개월 이내여야 합니다.');
        return { isValid: false, message: errorMsg };
      }
    }

    setDateError(''); // 에러가 없으면 에러 메시지 초기화
    return { isValid: true, message: '' };
  };

  // 참여자 선택 핸들러
  const handleParticipantSelect = (e) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    // 이미 선택된 참여자인지 확인
    if (participantList.includes(selectedValue)) {
      alert('이미 선택된 참여자입니다.');
      e.target.value = ''; // select 초기화
      return;
    }

    const newParticipantList = [...participantList, selectedValue];
    setParticipantList(newParticipantList);
    setFormData(prev => ({
      ...prev,
      participants: newParticipantList.join(', '),
      participantCount: newParticipantList.length
    }));
    e.target.value = ''; // select 초기화
  };

  // 참여자 삭제 핸들러
  const handleRemoveParticipant = (participantToRemove) => {
    const newParticipantList = participantList.filter(p => p !== participantToRemove);
    setParticipantList(newParticipantList);
    setFormData(prev => ({
      ...prev,
      participants: newParticipantList.join(', '),
      participantCount: newParticipantList.length
    }));
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!formData.participants || !formData.studyDate || !formData.clubName || !formData.startTime || !formData.endTime) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    // 연락처 형식 검사
    if (formData.contactNumber && !validateContactNumber()) {
      alert('연락처 형식이 올바르지 않습니다. 010-XXXX-XXXX 형식으로 입력해주세요.');
      return;
    }

    // 활동일 유효성 검사
    const dateValidation = validateStudyDate();
    if (!dateValidation.isValid) {
      alert(dateValidation.message);
      return;
    }

    // 시간 유효성 검사
    if (!validateTime()) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
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
      await axios.post(`${process.env.REACT_APP_API_URL}/club/${selectedCourse}`, submissionData);
      onSubmitSuccess();
      onClose();
    } catch (err) {
      console.error('Club creation failed', err);
      alert('동아리 신청에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">동아리 신청</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200">✕</button>
        </div>

        <div className="mb-6 border border-gray-300 rounded-lg p-4 space-y-4">
          {/* 작성자/작성일 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">작성자</label>
              <input
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                value={formData.writer}
                readOnly
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

          {/* 동아리명/대표연락처 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">
                동아리명 <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2 border rounded-lg bg-white"
                name="clubName"
                value={formData.clubName}
                onChange={handleInputChange}
                placeholder="동아리명을 입력하세요"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">
                대표연락처
              </label>
              <input
                className={`w-full px-3 py-2 border rounded-lg bg-white ${contactNumberError ? 'border-red-500' : ''}`}
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="010-0000-0000"
                onBlur={validateContactNumber}
              />
              {contactNumberError && (
                <p className="text-red-500 text-xs mt-1">{contactNumberError}</p>
              )}
            </div>
          </div>

          {/* 활동일/시작시간/종료시간 */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">
                활동일 <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full px-3 py-2 border rounded-lg bg-white ${dateError ? 'border-red-500' : ''}`}
                name="studyDate"
                type="date"
                value={formData.studyDate}
                onChange={handleInputChange}
                min={formData.regDate} // 작성일 이전 날짜 선택 방지 (HTML5 제약)
                onBlur={validateStudyDate}
              />
              {dateError && (
                <p className="text-red-500 text-xs mt-1">{dateError}</p>
              )}
              {courseDetails.startDate && courseDetails.endDate && (
                <p className="text-gray-500 text-xs mt-1">
                  신청 가능 기간: {courseDetails.startDate} ~ {format(addMonths(parseISO(courseDetails.endDate), 6), 'yyyy-MM-dd')}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">
                시작 시간 <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full px-3 py-2 border rounded-lg bg-white ${timeError ? 'border-red-500' : ''}`}
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                onBlur={validateTime}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">
                종료 시간 <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full px-3 py-2 border rounded-lg bg-white ${timeError ? 'border-red-500' : ''}`}
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                onBlur={validateTime}
              />
              {timeError && (
                <p className="text-red-500 text-xs mt-1">{timeError}</p>
              )}
            </div>
          </div>

          {/* 참여자 선택 */}
          <div>
            <label className="text-sm text-gray-600 font-bold">
              참여자 선택 <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border rounded-lg bg-white"
              onChange={handleParticipantSelect}
              value=""
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

          {/* 참여자/총 수 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-sm text-gray-600 font-bold">
                참여자
              </label>
              <div className="w-full px-3 py-2 border rounded-lg bg-white min-h-[42px]">
                {participantList.length > 0 ? (
                  participantList.map((participant, index) => (
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
                  ))
                ) : (
                  <span className="text-gray-400">선택된 참여자가 없습니다</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">총 인원</label>
              <input
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                name="participantCount"
                type="number"
                value={formData.participantCount}
                readOnly
              />
            </div>
          </div>

          {/* 목적 및 내용 */}
          <div>
            <label className="text-sm text-gray-600 font-bold">목적 및 내용</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg bg-white resize-y min-h-[100px]"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="동아리 활동의 목적과 내용을 입력하세요"
            />
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
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
  );
};

export default ClubCreate;