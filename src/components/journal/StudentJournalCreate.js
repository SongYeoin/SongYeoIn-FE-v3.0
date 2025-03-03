import React, { useState, useEffect } from 'react';
import { studentJournalApi } from '../../api/journalApi';
import { useUser } from '../common/UserContext';
import { parseJwt } from '../common/JwtDecoding';  // UserContext import 추가
import { getAccessToken } from '../../api/axios';

const StudentJournalCreate = ({ courseId, onClose, onSuccess }) => {
  const { user, loading } = useUser();  // useUser hook 사용
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    file: null,
    memberName: '',
    educationDate: new Date().toISOString().split('T')[0] // 오늘 날짜를 기본값으로
  });

  const [errors, setErrors] = useState({
    title: false,
    educationDate: false,
    file: false
  });

  // 컴포넌트가 마운트될 때 한번만 실행
  useEffect(() => {
    const token = getAccessToken();
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

  // loading 중이면 로딩 표시
  if (loading) {
    return <div>로딩 중 ...</div>;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      const file = files[0];
      if (file) {
        // 파일 형식 검증 로직 제거하고 바로 설정
        setFormData({
          ...formData,
          file: file
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    // 에러 상태 초기화
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // 유효성 검사
    const newErrors = {
      title: !formData.title.trim(),
      educationDate: !formData.educationDate,
      file: !formData.file
    };

    setErrors(newErrors);

    // 에러가 하나라도 있으면 제출하지 않음
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    try {
      // 파일 체크도 백엔드에서 처리하도록 수정
      const submitData = new FormData();
      submitData.append('courseId', courseId);
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('file', formData.file);
      submitData.append('educationDate', formData.educationDate);

      await studentJournalApi.create(submitData);
      onSuccess();
      onClose();
    } catch (error) {
      alert(error.message);  // 백엔드 에러 메시지 표시
    }
  };

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">교육일지 작성</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200">✕</button>
        </div>

        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <div>
            <label className="text-sm text-gray-600 font-bold">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-white mb-1"
              placeholder="제목을 입력하세요"
            />
            {errors.title && <p className="text-red-500 text-sm mb-4">제목을 입력해주세요.</p>}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">작성자</label>
              <p
                className="w-full px-3 py-2 border rounded-lg bg-gray-100">{formData.memberName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">작성일</label>
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                {new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>

          {/* 교육일자 입력 필드 추가 */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 font-bold">
              교육일자 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="educationDate"
              value={formData.educationDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-white"
              max={new Date().toISOString().split('T')[0]} // 오늘 날짜까지만 선택 가능
            />
            {errors.educationDate && <p className="text-red-500 text-sm mt-1">교육일자를 선택해주세요.</p>}
          </div>

          <div>
            <label className="text-sm text-gray-600 font-bold">내용</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-white h-[42px]"
            />
          </div>
        </div>

        {/* 첨부파일 섹션 */}
        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-600 font-bold">
              파일 첨부 <span className="text-red-500">*</span>
            </label>
            <span className="text-sm text-gray-500">
              {formData.file ? '파일 1/1개' : '파일 0/1개'}
            </span>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm text-gray-600">
            <p>• 교육일지 파일 첨부는 필수입니다</p>
            <p>• 허용 확장자: hwp, hwpx, doc, docx</p>
          </div>

          {/* 선택된 파일 표시 */}
          {formData.file && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 font-bold mb-2">첨부된 파일</p>
              <div className="flex items-center bg-gray-50 p-2 rounded">
                <span className="flex-1 text-sm truncate">{formData.file.name}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, file: null })}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <input
            type="file"
            name="file"
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            noValidate
          />
          {errors.file && <p className="text-red-500 text-sm mt-1">파일을 첨부해주세요.</p>}
        </div>

        <div className="flex justify-end gap-2 mt-4">
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

export default StudentJournalCreate;