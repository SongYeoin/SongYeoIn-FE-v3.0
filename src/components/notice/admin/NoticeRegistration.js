import React, { useState, useEffect } from 'react';
import axios from 'api/axios';

const NoticeRegistration = ({ isOpen, onClose, fetchNotices, selectedCourse }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    files: [],
    isGlobal: false,
    courseId: selectedCourse || '',
  });
  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState('');

  const MAX_FILE_COUNT = 5;
  const ALLOWED_EXTENSIONS = [
    'hwp', 'hwpx', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf',
    'jpeg', 'jpg', 'png', 'gif', 'bmp', 'tiff', 'tif', 'webp', 'svg',
  ];

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, selectedCourse]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      files: [],
      isGlobal: false,
      courseId: selectedCourse || '',
    });
    setErrors({});
    setFileErrors('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox' && name === 'isGlobal') {
      setFormData({
        ...formData,
        isGlobal: checked,
        courseId: checked ? selectedCourse : selectedCourse, // 전체 공지여도 selectedCourse 유지
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length > MAX_FILE_COUNT) {
      setFileErrors(`파일은 최대 ${MAX_FILE_COUNT}개까지 업로드할 수 있습니다.`);
      return;
    }

    const invalidFiles = files.filter((file) => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      return !ALLOWED_EXTENSIONS.includes(fileExtension);
    });

    if (invalidFiles.length > 0) {
      setFileErrors(
        `허용되지 않은 파일 형식입니다: ${invalidFiles
        .map((file) => file.name)
        .join(', ')}`
      );
      return;
    }

    setFileErrors('');
    setFormData({ ...formData, files });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title) newErrors.title = '제목을 입력해주세요.';
    if (!formData.content) newErrors.content = '내용을 입력해주세요.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const data = new FormData();

      data.append(
        'request',
        new Blob(
          [JSON.stringify({
            title: formData.title,
            content: formData.content,
            isGlobal: formData.isGlobal,
            courseId: formData.courseId,
          })],
          { type: 'application/json' }
        )
      );

      formData.files.forEach((file) => data.append('files', file));

      await axios.post(`${process.env.REACT_APP_API_URL}/admin/notice`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      alert('공지사항이 성공적으로 등록되었습니다.');

      // 선택된 과정의 공지사항을 다시 불러옴
      fetchNotices('', 1, formData.courseId);

      handleClose();
    } catch (error) {
      console.error('Error submitting notice:', error);
      alert('공지사항 등록 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-lg font-semibold mb-4">공지사항 등록</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">제목</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="제목을 입력하세요"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">내용</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="내용을 입력하세요"
              rows="4"
            ></textarea>
            {errors.content && (
              <p className="text-red-500 text-xs mt-1">{errors.content}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">첨부 파일</label>
            <input
              type="file"
              name="files"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              multiple
            />
            {fileErrors && (
              <p className="text-red-500 text-xs mt-1">{fileErrors}</p>
            )}
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isGlobal"
                checked={formData.isGlobal}
                onChange={handleInputChange}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">전체공지로 등록</span>
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              disabled={!!fileErrors}
            >
              등록
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeRegistration;
