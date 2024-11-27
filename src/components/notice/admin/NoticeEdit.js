import React, { useState, useEffect } from "react";
import axios from "api/axios";

const NoticeEdit = ({ notice, onClose, onSave }) => {
  const [editedNotice, setEditedNotice] = useState(null);
  const [newFiles, setNewFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState("");

  const MAX_FILE_COUNT = 5; // 첨부파일 최대 개수
  const ALLOWED_EXTENSIONS = [
    "hwp", "hwpx", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf",
    "jpeg", "jpg", "png", "gif", "bmp", "tiff", "tif", "webp", "svg"
  ]; // 허용된 파일 확장자

  // 초기 데이터 설정
  useEffect(() => {
    if (notice) {
      setEditedNotice({
        ...notice,
        isGlobal: notice.global ?? false,
        files: notice.files || [],
      });
    }
  }, [notice]);

  // 입력값 변경 처리
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedNotice((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 새 파일 추가
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    // 총 파일 갯수 계산 (기존 파일 + 새로 추가된 파일 - 삭제된 파일)
    const totalFileCount =
      editedNotice.files.length +
      selectedFiles.length -
      filesToDelete.length;

    // 파일 갯수 제한 검증
    if (totalFileCount > MAX_FILE_COUNT) {
      setFileErrors(
        `파일은 총 ${MAX_FILE_COUNT}개까지 업로드할 수 있습니다. (현재 파일: ${totalFileCount})`
      );
      return;
    }

    // 파일 확장자 검증
    const invalidFiles = selectedFiles.filter((file) => {
      const fileExtension = file.name.split(".").pop().toLowerCase();
      return !ALLOWED_EXTENSIONS.includes(fileExtension);
    });

    if (invalidFiles.length > 0) {
      setFileErrors(
        `허용되지 않은 파일 형식입니다: ${invalidFiles
        .map((file) => file.name)
        .join(", ")}`
      );
      return;
    }

    setFileErrors("");
    setNewFiles((prev) => [...prev, ...selectedFiles]);
  };

  // 기존 파일 삭제 처리
  const handleDeleteFile = (fileId) => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setEditedNotice((prev) => ({
      ...prev,
      files: prev.files.filter((file) => file.id !== fileId),
    }));
  };

  // 유효성 검사
  const validate = () => {
    const validationErrors = {};
    if (!editedNotice.title) validationErrors.title = "제목을 입력해주세요.";
    if (!editedNotice.content) validationErrors.content = "내용을 입력해주세요.";
    return validationErrors;
  };

  // 저장 처리
  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const formData = new FormData();
    formData.append(
      "request",
      new Blob(
        [
          JSON.stringify({
            title: editedNotice.title,
            content: editedNotice.content,
            isGlobal: editedNotice.isGlobal,
          }),
        ],
        { type: "application/json" }
      )
    );

    newFiles.forEach((file) => formData.append("newFiles", file));
    filesToDelete.forEach((fileId) => formData.append("deleteFileIds", fileId));

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/notice/${editedNotice.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("수정이 완료되었습니다.");
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("수정에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!editedNotice) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">공지사항 수정</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            X
          </button>
        </div>

        <form>
          {/* 제목 */}
          <div className="mb-4">
            <label className="text-sm font-bold text-gray-600">제목</label>
            <input
              type="text"
              name="title"
              value={editedNotice.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
          </div>

          {/* 내용 */}
          <div className="mb-4">
            <label className="text-sm font-bold text-gray-600">내용</label>
            <textarea
              name="content"
              value={editedNotice.content}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring"
              rows="5"
            />
            {errors.content && (
              <p className="text-red-500 text-sm">{errors.content}</p>
            )}
          </div>

          {/* 파일 추가 */}
          <div className="mb-4">
            <label className="text-sm font-bold text-gray-600">새 파일 추가</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {fileErrors && <p className="text-red-500 text-sm">{fileErrors}</p>}
          </div>

          {/* 기존 첨부파일 */}
          {editedNotice.files.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-600">첨부파일</h3>
              <ul className="list-disc pl-6">
                {editedNotice.files.map((file) => (
                  <li key={file.id} className="flex justify-between items-center">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {file.originalName}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      🗑
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 전체 공지 여부 */}
          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="isGlobal"
                checked={!!editedNotice?.isGlobal}
                onChange={handleChange}
                className="form-checkbox h-5 w-5"
              />
              <span className="ml-2 text-gray-600">전체공지로 설정</span>
            </label>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-700"
              disabled={!!fileErrors}
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoticeEdit;
