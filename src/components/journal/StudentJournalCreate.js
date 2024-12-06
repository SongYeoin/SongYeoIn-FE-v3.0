import React, { useState } from 'react';
import { studentJournalApi } from '../../api/journalApi';

const StudentJournalCreate = ({ courseId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    file: null,
    memberName: ''  // memberName 추가
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setFormData({
        ...formData,
        file: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const submitData = new FormData();
      submitData.append('courseId', courseId);
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('file', formData.file);

      await studentJournalApi.create(submitData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('교육일지 등록 실패:', error);
      alert('교육일지 등록에 실패했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">교육일지 작성</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-medium transition-colors duration-200">✕</button>
        </div>

        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <div>
            <label className="text-sm text-gray-600 font-bold">제목</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg bg-white mb-4"
            />
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
                {new Date().toLocaleDateString()}
              </p>
            </div>
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

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="font-medium">첨부파일</p>
          <input
            type="file"
            name="file"
            onChange={handleChange}
            className="mt-2"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">취소</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800">등록</button>
        </div>
      </div>
    </div>
  );
};

export default StudentJournalCreate;