import React, { useState, useEffect, useRef } from "react";
import axios from "api/axios";

const NoticeDetail = ({ noticeId, onClose, onDelete, refreshNoticeList }) => {
  const [notice, setNotice] = useState(null);
  const [editedNotice, setEditedNotice] = useState(null);
  const [newFiles, setNewFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [fileErrors, setFileErrors] = useState("");
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);

  const MAX_FILE_COUNT = 5;
  const ALLOWED_EXTENSIONS = [
    "hwp", "hwpx", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "pdf",
    "jpeg", "jpg", "png", "gif", "bmp", "tiff", "tif", "webp", "svg",
  ];

  // 스크롤 제어를 위한 useEffect 추가
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 컨텐츠 높이 체크를 위한 useEffect 추가
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [notice, isEditing]); // notice나 editing 상태가 변경될 때마다 높이 체크

  // 공지사항 상세 조회
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
        isPinned: response.data.isPinned ?? false,
        courseId: response.data.courseId,
        files: response.data.files || [],
      });
      refreshNoticeList();
    } catch (error) {
      console.error("Error fetching notice detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDownload = async (fileId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/notice/${notice.id}/files/${fileId}/download`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"]
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      const fileName = contentDisposition
        ? decodeURIComponent(contentDisposition.split("filename=")[1].replace(/['"]/g, ""))
        : notice.files.find((file) => file.id === fileId)?.originalName || `파일_${fileId}`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("File download failed:", error);
      alert("파일 다운로드에 실패했습니다.");
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

    try {
      const formData = new FormData();

      formData.append(
        "request",
        new Blob(
          [
            JSON.stringify({
              title: editedNotice.title,
              content: editedNotice.content,
              isPinned: editedNotice.isPinned,
              courseId: notice.courseId,
            }),
          ],
          { type: "application/json" }
        )
      );

      newFiles.forEach((file) => formData.append("newFiles", file));
      filesToDelete.forEach((fileId) => formData.append("deleteFileIds", fileId));

      await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/notice/${editedNotice.id}`,
        formData
      );

      alert("공지사항이 수정되었습니다.");
      refreshNoticeList();
      setNotice((prev) => ({
        ...prev,
        title: editedNotice.title,
        content: editedNotice.content,
        isPinned: editedNotice.isPinned,
        files: [...prev.files.filter(file => !filesToDelete.includes(file.id)), ...newFiles],
      }));
      setIsEditing(false); // 수정 모드 해제
      setNewFiles([]);
      setFilesToDelete([]);
    } catch (error) {
      console.error("Error saving notice:", error);
      alert("공지사항 수정 중 오류가 발생했습니다.");
    }
  };

  const handleCancelEdit = () => {
    setEditedNotice({
      ...notice,
      isPinned: notice.isPinned ?? false,
      courseId: notice.courseId,
      files: notice.files || [],
    });
    setNewFiles([]);
    setFilesToDelete([]);
    setTitleError("");
    setContentError("");
    setFileErrors("");
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/admin/notice/${noticeId}`,
          {
          }
        );
        alert("공지사항이 삭제되었습니다.");
        onDelete();
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
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p>공지사항을 가져올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div
        ref={contentRef}
        className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10"
        style={{
          minHeight: 'min-content',
          maxHeight: '90vh',
          margin: contentHeight > window.innerHeight * 0.8 ? '5vh auto' : 'auto'
        }}
      >
        {isEditing ? (
          // 수정 모드 - 현재 디자인 유지
          <>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">공지사항 상세</h2>
              <button
                onClick={() => onClose(false)}
                className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            {/* 내용 영역 */}
            <div className="mb-6 border border-gray-300 rounded-lg p-4">
              <div>
                <label className="text-sm text-gray-600 font-bold">
                  제목 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={editedNotice.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white mb-1"
                />
                {titleError && <p className="text-red-500 text-sm mb-4">{titleError}</p>}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm text-gray-600 font-bold">작성자</label>
                  <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                    {notice.memberName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-bold">작성일</label>
                  <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                    {notice.regDate}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-bold">조회수</label>
                  <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                    {notice.viewCount}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-600 font-bold">
                  내용 <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={editedNotice.content}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white min-h-[200px]"
                />
                {contentError && <p className="text-red-500 text-sm mt-1">{contentError}</p>}
              </div>

              {/* 첨부파일 섹션 */}
              {editedNotice.files.length > 0 && (
                <div className="mb-4">
                  <label className="text-sm text-gray-600 font-bold">첨부파일</label>
                  <div className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                    <ul className="space-y-2">
                      {editedNotice.files.map((file) => (
                        <li key={file.id} className="flex items-center">
                          <button
                            onClick={() => handleFileDownload(file.id)}
                            className="flex-1 p-1 text-blue-500 hover:text-blue-700 text-left"
                          >
                            {file.originalName || `파일_${file.id}`}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* 파일 업로드 섹션 */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-600 font-bold">새 파일 추가</label>
                  <span className="text-sm text-gray-500">
                    {`파일 ${editedNotice.files.length + newFiles.length}/${MAX_FILE_COUNT}개`}
                  </span>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg mb-3 text-sm text-gray-600">
                  <p>• 최대 5개 파일 업로드 가능</p>
                  <p>• 허용 확장자: hwp(x), doc(x), xls(x), ppt(x), pdf, 이미지 파일</p>
                </div>

                {/* 새로 추가된 파일 목록 */}
                {newFiles.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 font-bold mb-2">추가된 파일</p>
                    <ul className="space-y-2">
                      {newFiles.map((file, index) => (
                        <li key={index} className="flex items-center bg-gray-50 p-2 rounded">
                          <span className="flex-1 text-sm truncate">{file.name}</span>
                          <button
                            onClick={() => setNewFiles(newFiles.filter((_, i) => i !== index))}
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
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {fileErrors && <p className="text-red-500 text-sm mt-1">{fileErrors}</p>}
              </div>

              {/* 상단고정 체크박스 */}
              <div>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isPinned"
                    checked={!!editedNotice?.isPinned}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5"
                  />
                  <span className="ml-2 text-gray-600">상단고정 설정</span>
                </label>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCancelEdit}
                className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaveDisabled}
                className={`w-full py-2 rounded-lg ${
                  isSaveDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-800 text-white hover:bg-green-900"
                }`}
              >
                저장
              </button>
            </div>
          </>
        ) : (
          // 읽기 모드 - 원래 디자인으로 복원
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold pr-8">{notice.title}</h2>
                <button
                  onClick={() => onClose(false)}
                  className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 mt-6 mb-0.5">
                <div className="flex items-center">
                  <span>{notice.memberName}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span>{notice.regDate}</span>
                </div>
                <div className="flex items-center">
                  <span>조회 {notice.viewCount}</span>
                </div>
              </div>
            </div>

            {/* 본문 영역 */}
            <div className="mb-6 border border-gray-300 rounded-lg p-4">
              <div className="whitespace-pre-wrap min-h-[200px] px-3 py-2">
                {notice.content}
              </div>
            </div>

            {/* 첨부파일 섹션 */}
            {editedNotice.files.length > 0 && (
              <div className="mt-4 mb-4 p-4 bg-gray-50 rounded">
                <p className="font-bold mb-2">첨부파일</p>
                <ul className="space-y-2">
                  {editedNotice.files.map((file) => (
                    <li key={file.id} className="flex items-center">
                      <button
                        onClick={() => handleFileDownload(file.id)}
                        className="flex-1 p-2 rounded hover:bg-gray-200 transition-colors duration-200 cursor-pointer text-blue-500 hover:text-blue-700 text-left"
                      >
                        {file.originalName || `파일_${file.id}`}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleDelete}
                className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                삭제
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200"
              >
                수정
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NoticeDetail;