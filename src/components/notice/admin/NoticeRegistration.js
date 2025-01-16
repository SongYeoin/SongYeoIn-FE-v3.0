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
    const selectedFiles = Array.from(e.target.files);
    const totalFileCount = formData.files.length + selectedFiles.length;

    if (totalFileCount > MAX_FILE_COUNT) {
      setFileErrors(`파일은 최대 ${MAX_FILE_COUNT}개까지 업로드할 수 있습니다.`);
      return;
    }

    const invalidFiles = selectedFiles.filter((file) => {
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
    setFormData({
      ...formData,
      files: [...Array.from(formData.files), ...selectedFiles]
    });
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
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-[9999] overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg my-10">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">공지사항 등록</h2>
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

          {/* 내용 입력 */}
          <div className="mb-6 border border-gray-300 rounded-lg p-4">
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full min-h-[200px] px-3 py-2 border rounded-lg"
              placeholder="내용을 입력하세요"
            ></textarea>
            {errors.content && (
              <p className="text-red-500 text-sm mt-1">{errors.content}</p>
            )}
          </div>

          {/* 첨부파일 섹션 */}
          <div className="mb-6 border border-gray-300 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-600 font-bold">파일 첨부</label>
              <span className="text-sm text-gray-500">
                {`파일 ${formData.files.length}/${MAX_FILE_COUNT}개`}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm text-gray-600">
              <p>• 최대 5개 파일 업로드 가능</p>
              <p>• 허용 확장자: hwp, doc(x), xls(x), ppt(x), pdf, 이미지 파일</p>
            </div>

            {/* 선택된 파일 목록 */}
            {formData.files.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 font-bold mb-2">첨부된 파일</p>
                <ul className="space-y-2">
                  {Array.from(formData.files).map((file, index) => (
                    <li key={index} className="flex items-center bg-gray-50 p-2 rounded">
                      <span className="flex-1 text-sm truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = Array.from(formData.files).filter((_, i) => i !== index);
                          setFormData({ ...formData, files: newFiles });
                        }}
                        className="ml-2 text-gray-500 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <input
              type="file"
              name="files"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-lg"
              multiple
            />
            {fileErrors && (
              <p className="text-red-500 text-sm mt-1">{fileErrors}</p>
            )}
          </div>

          {/* 전체공지 체크박스 */}
          <div className="mb-6">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isGlobal"
                checked={formData.isGlobal}
                onChange={handleInputChange}
                className="form-checkbox h-5 w-5"
              />
              <span className="ml-2 text-gray-600">전체공지로 설정</span>
            </label>
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
              disabled={!!fileErrors}
              className={`w-full py-2 rounded-lg transition-colors duration-200 ${
                fileErrors
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-green-800 text-white hover:bg-green-900"
              }`}
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
