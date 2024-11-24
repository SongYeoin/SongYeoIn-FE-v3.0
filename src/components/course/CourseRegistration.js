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
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzMyNDM0NzExLCJleHAiOjE3MzI0MzY1MTF9.z4ARkm-ozH4dMiLV12su1GEPhLRKMGLFTwmXLd-nb_k`,
        },
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
            Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwicm9sZSI6IkFETUlOIiwiaWF0IjoxNzMyMTc4NTk1LCJleHAiOjE3MzIxODAzOTV9.96A8p00SicVvgeaTKKQRCfw8eaMqvda8tRicoNZh-Ws`, // 실제 토큰으로 대체
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-lg font-semibold mb-4">교육과정 등록</h2>
        {/* 교육 과정 등록 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">과정명</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="과정명을 입력하세요"
            />
            {errors.courseName && (
              <p className="text-red-500 text-xs mt-1">{errors.courseName}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">설명</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="설명 입력하세요"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">담당자</label>
            <select
              name="adminName"
              value={formData.adminName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">강사</label>
            <input
              type="text"
              name="teacherName"
              value={formData.teacherName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="강사명을 입력하세요"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">시작날짜</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="시작날짜를 입력하세요"
            />
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">종강날짜</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="종강날짜를 입력하세요"
            />
            {errors.endDate && (
              <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">강의실</label>
            <input
              type="text"
              name="roomName"
              value={formData.roomName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="강의실 정보를 입력하세요 (ex. 302, 303)"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
