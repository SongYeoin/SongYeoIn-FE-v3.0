import React, { useState, useEffect, useRef } from "react";
import axios from "api/axios";

const NoticeDetail = ({ noticeId, onClose, refreshNoticeList }) => {
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchNoticeDetail = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/notice/${noticeId}`
        );
        setNotice(response.data);
        refreshNoticeList();
      } catch (error) {
        console.error("Error fetching notice detail:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoticeDetail();
  }, [noticeId]);


  const handleFileDownload = async (fileId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/notice/${notice.id}/files/${fileId}/download`,
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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [notice]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>공지사항을 가져올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[9999] overflow-y-auto">
      <div
        ref={contentRef}
        className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg my-10"
        style={{
          minHeight: 'min-content',
          maxHeight: '90vh',
          margin: contentHeight > window.innerHeight * 0.8 ? '5vh auto' : 'auto'
        }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold pr-8">{notice.title}</h2>
            <button
              onClick={onClose}
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
        {notice.files && notice.files.length > 0 && (
          <div className="mt-4 mb-4 p-4 bg-gray-50 rounded">
            <p className="font-bold mb-2">첨부파일</p>
            <ul className="space-y-2">
              {notice.files.map((file) => (
                <li key={file.id} className="flex items-center p-2 rounded hover:bg-gray-200 transition-colors duration-200">
                  <button
                    onClick={() => handleFileDownload(file.id, file.originalName)}
                    className="text-blue-500 hover:text-blue-700 flex-1 text-left"
                  >
                    {file.originalName || `파일_${file.id}`}
                  </button>
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