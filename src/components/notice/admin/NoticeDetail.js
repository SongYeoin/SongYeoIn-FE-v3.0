import React, { useEffect, useState } from "react";
import axios from "api/axios";

const NoticeDetail = ({ noticeId, onClose, onEdit, onDelete }) => {
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Axios 요청 실행 함수
  const fetchNoticeDetail = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/admin/notice/${noticeId}`
      );
      setNotice(response.data);
    } catch (error) {
      console.error("Error fetching notice detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticeDetail(); // 컴포넌트가 마운트될 때 한 번만 실행
  }, [noticeId]); // 의존성을 `noticeId`로 제한

  const handleDelete = async () => {
    const confirmDelete = window.confirm("정말로 이 공지사항을 삭제하시겠습니까?");
    if (!confirmDelete) return;

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
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    }
  };

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">공지사항 상세보기</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            X
          </button>
        </div>

        {/* Notice Information */}
        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">제목</label>
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                {notice.title}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">작성자</label>
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                {notice.memberName}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">등록일</label>
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
          <div>
            <label className="text-sm text-gray-600 font-bold">내용</label>
            <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
              {notice.content}
            </p>
          </div>
        </div>

        {notice.files && notice.files.length > 0 && (
          <div className="mb-6 border border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-bold mb-4">첨부파일</h3>
            <ul className="list-disc pl-6">
              {notice.files.map((file) => (
                <li key={file.id}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    {file.originalName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
          >
            삭제
          </button>
          <button
            onClick={() => onEdit(notice)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;
