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
        alert(error.response?.data?.message || '교육일지 조회에 실패했습니다.');
      }
    };

    fetchJournalDetail();
  }, [journalId]);

// 파일 다운로드
const handleDownload = async () => {
  try {
    const response = await adminJournalApi.downloadFile(journalId);
    const blob = response.data;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = journal.file.originalName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('파일 다운로드 실패:', error);
    alert(error.message || '파일 다운로드에 실패했습니다.'); // error.message 사용
  }
};

  if (!journal) return null;

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[9999] overflow-y-auto">
        <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">교육일지 상세보기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
            >
              ✕
            </button>
          </div>

          <div className="mb-6 border border-gray-300 rounded-lg p-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">제목</label>
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100 mb-4">{journal.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 font-bold">작성자</label>
                <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">{journal.memberName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-bold">작성일</label>
                <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                  {new Date(journal.createdAt).toISOString().split('T')[0]}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-gray-600 font-bold">교육일자</label>
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                {new Date(journal.educationDate).toISOString().split('T')[0]}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">내용</label>
              <div className={`w-full px-3 py-2 border rounded-lg bg-gray-100 whitespace-pre-wrap ${
                journal.content ? 'min-h-[200px]' : 'min-h-[42px]'
              }`}>
                {journal.content}
              </div>
            </div>
          </div>

          {journal.file && (
            <div className="mt-4 p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-200 transition-colors duration-200" onClick={handleDownload}>
              <p className="font-medium">첨부파일</p>
              <p className="text-blue-500 hover:text-blue-700">{journal.file.originalName}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

export default AdminJournalDetail;