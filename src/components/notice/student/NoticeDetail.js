import React, { useState, useEffect } from "react";
import axios from "api/axios";

const NoticeDetail = ({ noticeId, onClose }) => {
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNoticeDetail = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/notice/${noticeId}`
        );
        setNotice(response.data);
      } catch (error) {
        console.error("Error fetching notice detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoticeDetail();
  }, [noticeId]);

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
          <h2 className="text-2xl font-bold">{notice.title}</h2>
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
          <div className="whitespace-pre-wrap border p-4 rounded min-h-[200px]">
            {notice.content}
          </div>
        </div>

        {/* Files */}
        {notice.files && notice.files.length > 0 && (
          <div className="mb-4">
            <h3 className="text-lg font-bold mb-2">첨부파일</h3>
            <ul className="space-y-2">
              {notice.files.map((file) => (
                <li key={file.id} className="flex items-center">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex-1"
                  >
                    {file.originalName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoticeDetail;
