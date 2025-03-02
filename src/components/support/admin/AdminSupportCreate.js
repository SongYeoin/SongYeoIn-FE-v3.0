import React, { useState, useEffect } from 'react';
import { adminSupportApi } from '../../../api/supportApi';
import { useUser } from '../../common/UserContext';
import { parseJwt } from '../../common/JwtDecoding';

const AdminSupportCreate = ({ isOpen, onClose, refreshList }) => {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    memberName: '',
    createdDate: new Date().toLocaleDateString() // 오늘 날짜를 기본값으로
  });
  const [errors, setErrors] = useState({});

  // 컴포넌트가 마운트될 때 한번만 실행
  useEffect(() => {
    // 세션 스토리지에서 직접 토큰을 가져와서 파싱
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = parseJwt(token);
        setFormData(prev => ({
          ...prev,
          memberName: decodedUser.name || ''
        }));
      } catch (error) {
        console.error('사용자 정보 파싱 오류:', error);
      }
    }
  }, []);

  // UserContext의 user 정보가 변경될 때도 업데이트
  useEffect(() => {
    if (user?.name) {
      setFormData(prev => ({
        ...prev,
        memberName: user.name
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 유효성 검사
    if (value.trim() === '') {
      setErrors({...errors, [name]: `${name === 'title' ? '제목' : '내용'}을 입력해주세요.`});
    } else {
      const newErrors = {...errors};
      delete newErrors[name];
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 모든 필드 유효성 검사
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    }
    if (!formData.content.trim()) {
      newErrors.content = '내용을 입력해주세요.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await adminSupportApi.create(formData);
      alert('문의가 등록되었습니다.');
      refreshList();
      handleClose();
    } catch (error) {
      console.error('문의 등록 중 오류:', error);
      alert(error.message || '문의 등록 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      memberName: formData.memberName,
      createdDate: new Date().toLocaleDateString()
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999] overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">관리자 문의 등록</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 제목 입력 */}
          <div className="mb-6">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="text-2xl font-bold w-full px-3 py-2 border rounded-lg"
              placeholder="제목을 입력하세요"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* 작성자 및 작성일 정보 추가 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">작성자</label>
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                {formData.memberName}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">작성일</label>
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                {formData.createdDate}
              </p>
            </div>
          </div>

          {/* 내용 입력 */}
          <div className="mb-6 border border-gray-300 rounded-lg p-4">
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full min-h-[200px] px-3 py-2 border rounded-lg"
              placeholder="문의 내용을 입력하세요"
            ></textarea>
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              취소
            </button>
            <button
              type="submit"
              className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200"
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSupportCreate;