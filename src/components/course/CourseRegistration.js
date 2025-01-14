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

  // 모달 열릴 때 담당자 정보 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchAdmins();
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
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 필수 필드 검증
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
    }

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
                과정명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                placeholder="과정명을 입력하세요"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="text-sm text-gray-600 font-bold">설명</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                placeholder="설명을 입력하세요"
              />
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
                <label className="text-sm text-gray-600 font-bold">강사</label>
                <input
                  type="text"
                  name="teacherName"
                  value={formData.teacherName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                  placeholder="강사명을 입력하세요"
                />
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
              <label className="text-sm text-gray-600 font-bold">강의실</label>
              <input
                type="text"
                name="roomName"
                value={formData.roomName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                placeholder="강의실 정보를 입력하세요 (ex. 302, 303)"
              />
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
              className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseRegistration;
