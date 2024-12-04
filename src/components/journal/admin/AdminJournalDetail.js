import React, { useState, useEffect } from 'react';
import { adminJournalApi } from '../../../api/journalApi';

const AdminJournalDetail = ({ journalId, onClose }) => {
  const [journal, setJournal] = useState(null);

  useEffect(() => {
    const fetchJournalDetail = async () => {
      try {
        const response = await adminJournalApi.getDetail(journalId);
        setJournal(response.data);
      } catch (error) {
        console.error('교육일지 상세 조회 실패:', error);
      }
    };

    fetchJournalDetail();
  }, [journalId]);

  const handleDownload = async () => {
    try {
      const response = await adminJournalApi.downloadFile(journalId);

      // blob 데이터로 파일 생성
      const blob = new Blob([response.data], {
        type: response.headers['content-type']
      });

      // 다운로드 링크 생성
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Content-Disposition 헤더에서 파일명 추출 또는 기본 파일명 사용
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition
        ? decodeURIComponent(contentDisposition.split('filename=')[1].replace(/['"]/g, ''))
        : `${journal.file.originalName}`;

      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('파일 다운로드 실패:', error);
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  if (!journal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">교육일지 상세보기</h2>
          <button onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 text-xl font-medium transition-colors duration-200">✕
          </button>

        </div>

        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <div>
            <label className="text-sm text-gray-600 font-bold">제목</label>
            <p
              className="w-full px-3 py-2 border rounded-lg bg-gray-100 mb-4">{journal.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">작성자</label>
              <p
                className="w-full px-3 py-2 border rounded-lg bg-gray-100">{journal.memberName}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">작성일</label>
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                {new Date(journal.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 font-bold">내용</label>
            <p
              className="w-full px-3 py-2 border rounded-lg bg-gray-100">{journal.content}</p>
          </div>
        </div>

        {journal.file && (
          <div
            className="mt-4 p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
            onClick={handleDownload}>
            <p className="font-medium">첨부파일</p>
            <p
              className="text-blue-500 hover:text-blue-700">{journal.file.originalName}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminJournalDetail;