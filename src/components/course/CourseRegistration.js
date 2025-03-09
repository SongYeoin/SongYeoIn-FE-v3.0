import React, { useEffect, useState } from 'react';
import axios from 'api/axios';

const CourseRegistration = ({ isOpen, onClose,fetchCourses }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    adminName: '',
    adminId: '',
    teacherName: '',
    startDate: '',
    endDate: '',
    roomName: '',
  });
  const [errors, setErrors] = useState({});
  const [admins, setAdmins] = useState([]); // 담당자 리스트
  const [isSubmitting, setIsSubmitting] = useState(false); // 제출 중 상태 추가

  // 모달 열릴 때 담당자 정보 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchAdmins();

      // 모달이 열릴 때마다 폼 데이터와 에러 초기화
      setFormData({
        name: '',
        description: '',
        adminName: '',
        adminId: '',
        teacherName: '',
        startDate: '',
        endDate: '',
        roomName: '',
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const fetchAdmins = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/course/modal`, {
      });
      setAdmins(response.data); // 서버에서 가져온 담당자 리스트 설정
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };


  // 입력값 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'adminName') {
      // adminName 선택 시 adminId를 자동으로 설정
      const selectedAdmin = admins.find((admin) => admin.name === value);
      setFormData({
        ...formData,
        adminName: value,
        adminId: selectedAdmin ? selectedAdmin.id : '', // 선택한 admin의 id 설정
      });
    } else if (name === 'roomName') {
      // 강의실 번호는 숫자만 입력 가능하도록
      if (value === '' || /^\d+$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // 에러 상태 초기화 (해당 필드에 대해서만)
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // 유효성 검사 함수
  const validateForm = () => {
    const newErrors = {};

    // 필수 필드 검증
    if (!formData.name) newErrors.name = '과정명은 필수 입력 사항입니다.';
    else if (formData.name.length > 50) newErrors.name = '과정명은 50자 이내로 입력해야 합니다.';

    if (!formData.adminName) newErrors.adminName = '담당자명은 필수 입력 사항입니다.';

    if (formData.description && formData.description.length > 100)
      newErrors.description = '설명은 100자 이내로 입력해야 합니다.';

    if (formData.teacherName && formData.teacherName.length > 30)
      newErrors.teacherName = '강사명은 30자 이내로 입력해야 합니다.';

    if (!formData.startDate) newErrors.startDate = '시작날짜는 필수 입력 사항입니다.';
    if (!formData.endDate) newErrors.endDate = '종강날짜는 필수 입력 사항입니다.';

    // 날짜 비교
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.endDate = '종강날짜는 시작날짜보다 뒤여야 합니다.';
      }
    }

    // 강의실 번호 확인 (숫자만 입력)
    if (formData.roomName && !/^\d+$/.test(formData.roomName)) {
      newErrors.roomName = '강의실 번호는 숫자만 입력 가능합니다.';
    }

    setErrors(newErrors);

    // 에러가 없으면 true 반환
    return Object.keys(newErrors).length === 0;
  };

  // 경고창 표시 함수
  const showAlertForErrors = () => {
    // 모든 에러 메시지를 모아서 하나의 문자열로 만듦
    const errorMessages = Object.values(errors).filter(error => error).join('\n');
    if (errorMessages) {
      alert(`다음 문제를 해결해주세요:\n${errorMessages}`);
    }
  };


  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사 실행
    const isValid = validateForm();

    if (!isValid) {
      // 유효성 검사 실패 시 경고창 표시
      showAlertForErrors();
      return;
    }

    /*// 필수 필드 검증
    const newErrors = {};
    if (!formData.name) newErrors.name = '과정명은 필수 입력 사항입니다.';
    if (!formData.adminName) newErrors.adminName = '담당자명은 필수 입력 사항입니다.';
    if (!formData.startDate) newErrors.startDate = '시작날짜는 필수 입력 사항입니다.';
    if (!formData.endDate) newErrors.endDate = '종강날짜는 필수 입력 사항입니다.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // 오류 상태 업데이트
    } else {
      setErrors({});
      console.log('Form submitted:', formData);
    }*/

    setIsSubmitting(true);

    try {
      // 서버로 데이터 전송
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/admin/course`,
        {
          name: formData.name,
          description: formData.description,
          adminName: formData.adminName,
          adminId: formData.adminId,
          teacherName: formData.teacherName,
          startDate: formData.startDate,
          endDate: formData.endDate,
          roomName: formData.roomName,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Server Response:', response.data);
      fetchCourses(); // 전체 과정 데이터를 다시 가져옴
      alert('교육 과정이 성공적으로 등록되었습니다.');
      onClose(); // 모달 닫기
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('서버에 데이터를 전송하는 중 오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">교육과정 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6 border border-gray-300 rounded-lg p-4">
            <div className="mb-4">
              <label className="text-sm text-gray-600 font-bold">
                과정명 (50자 이내) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                placeholder="과정명을 입력하세요 (50자 이내)"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-600 font-bold">설명 (100자 이내)</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                placeholder="설명을 입력하세요 (100자 이내)"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 font-bold">
                  담당자 <span className="text-red-500">*</span>
                </label>
                <select
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">담당자를 선택하세요</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.name}>
                      {admin.name}
                    </option>
                  ))}
                </select>
                {errors.adminName && (
                  <p className="text-red-500 text-xs mt-1">{errors.adminName}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600 font-bold">강사 (30자 이내)</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  placeholder="강사명을 입력하세요 (30자 이내)"
                />
                {errors.teacherName && (
                  <p className="text-red-500 text-xs mt-1">{errors.teacherName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 font-bold">
                  시작날짜 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600 font-bold">
                  종강날짜 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-bold">강의실 (숫자만 입력)</label>
              <input
                type="text"
                name="roomName"
                value={formData.roomName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                placeholder="강의실 정보를 입력하세요 (ex. 302, 303)"
              />
              {errors.roomName && (
                <p className="text-red-500 text-xs mt-1">{errors.roomName}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 bg-green-800 text-white rounded-lg ${
                isSubmitting ? 'opacity-70 cursor-wait' : 'hover:bg-green-900'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                       xmlns="http://www.w3.org/2000/svg" fill="none"
                       viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                            stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  로딩 중...
                </div>
              ) : (
                "등록"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseRegistration;
