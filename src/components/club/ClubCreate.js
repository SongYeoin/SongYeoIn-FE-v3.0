import React, { useState } from 'react';
import axios from 'api/axios';
import { format } from 'date-fns';

const ClubCreate = ({ selectedCourseId, onClose, onSubmitSuccess }) => {
  const initialFormData = {
    participants: '',
    content: '',
    studyDate: '',
    writer: '',
    regDate: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  // 초기 데이터 설정
  React.useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/club/${selectedCourseId}/register`)
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
  }, [selectedCourseId]);

  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'writer' || name === 'regDate') return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!formData.participants || !formData.studyDate) {
      alert('참여자와 활동일은 필수 항목입니다. 입력해주세요.');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/club/${selectedCourseId}`, formData);
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