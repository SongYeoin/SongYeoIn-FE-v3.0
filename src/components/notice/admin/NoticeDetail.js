import React, { useState, useEffect } from "react";
import axios from "api/axios";

const NoticeDetail = ({ noticeId, onClose, onDelete }) => {
  const [notice, setNotice] = useState(null);
  const [editedNotice, setEditedNotice] = useState(null);
  const [newFiles, setNewFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [fileErrors, setFileErrors] = useState("");
  const [titleError, setTitleError] = useState(""); // 제목 오류 메시지
  const [contentError, setContentError] = useState(""); // 내용 오류 메시지
  const [isLoading, setIsLoading] = useState(true);

  const MAX_FILE_COUNT = 5;
  const ALLOWED_EXTENSIONS = [
    "hwp", "hwpx", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf",
    "jpeg", "jpg", "png", "gif", "bmp", "tiff", "tif", "webp", "svg",
  ];

  useEffect(() => {
    fetchNoticeDetail();
  }, [noticeId]);

  const fetchNoticeDetail = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/notice/${noticeId}`
      );
      setNotice(response.data);
      setEditedNotice({
        ...response.data,
        isGlobal: response.data.global ?? false,
        files: response.data.files || [],
      });
    } catch (error) {
      console.error("Error fetching notice detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditedNotice((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "title") {
      setTitleError(value.trim() === "" ? "제목을 입력해주세요." : "");
    } else if (name === "content") {
      setContentError(value.trim() === "" ? "내용을 입력해주세요." : "");
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFileCount =
      editedNotice.files.length +
      newFiles.length -
      filesToDelete.length +
      selectedFiles.length;

    if (totalFileCount > MAX_FILE_COUNT) {
      setFileErrors(`파일은 총 ${MAX_FILE_COUNT}개까지 업로드할 수 있습니다.`);
      return;
    }

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

  const handleDeleteFile = (fileId) => {
    setFilesToDelete((prev) => [...prev, fileId]);
    setEditedNotice((prev) => ({
      ...prev,
      files: prev.files.filter((file) => file.id !== fileId),
    }));
  };

  const handleSave = async () => {
    if (!editedNotice.title || !editedNotice.content || fileErrors) {
      alert("유효하지 않은 입력입니다. 제목, 내용 또는 파일 오류를 확인해주세요.");
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

      alert("공지사항이 수정되었습니다.");
      await fetchNoticeDetail(); // 수정 완료 후 최신 데이터를 다시 로드
      setIsEditing(false); // 상세조회 모드로 전환
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("수정에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/admin/notice/${noticeId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        alert("공지사항이 삭제되었습니다.");
        onDelete();
        onClose();
      } catch (error) {
        console.error("Error deleting notice:", error);
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const isSaveDisabled =
    !editedNotice?.title ||
    !editedNotice?.content ||
    !!fileErrors;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>공지사항을 가져올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          {isEditing ? (
            <div className="w-full">
              <input
                type="text"
                name="title"
                value={editedNotice.title}
                onChange={handleChange}
                className="text-2xl font-bold w-full border rounded px-2"
              />
              {titleError && (
                <p className="text-red-500 text-sm mt-1">{titleError}</p>
              )}
            </div>
          ) : (
            <h2 className="text-2xl font-bold">{notice.title}</h2>
          )}
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Metadata */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600">
            <span>작성자: {notice.memberName}</span>
            <span>작성일: {notice.regDate}</span>
            <span>조회수: {notice.viewCount}</span>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          {isEditing ? (
            <div>
              <textarea
                name="content"
                value={editedNotice.content}
                onChange={handleChange}
                className="w-full h-[200px] border rounded p-4"
              />
              {contentError && (
                <p className="text-red-500 text-sm mt-1">{contentError}</p>
              )}
            </div>
          ) : (
            <div className="whitespace-pre-wrap border p-4 rounded min-h-[200px]">
              {notice.content}
            </div>
          )}
        </div>

        {/* Files */}
        {editedNotice.files.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">첨부파일</h3>
            <ul className="space-y-2">
              {editedNotice.files.map((file) => (
                <li key={file.id} className="flex items-center">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex-1"
                  >
                    {file.originalName}
                  </a>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleDeleteFile(file.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      🗑
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">새 파일 추가</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {fileErrors && <p className="text-red-500 text-sm">{fileErrors}</p>}
          </div>
        )}

        {/* IsGlobal */}
        {isEditing && (
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
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaveDisabled}
                className={`px-4 py-2 rounded ${
                  isSaveDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                저장
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                수정
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;
