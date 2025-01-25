import React, { useState, useEffect } from 'react';
import { studentJournalApi } from '../../api/journalApi';

const StudentJournalDetail = ({ journalId, courseId, onClose }) => {
  const [journal, setJournal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);

  useEffect(() => {
    const fetchJournalDetail = async () => {
      try {
        const response = await studentJournalApi.getDetail(journalId);
        console.log('Journal Detail:', response.data);  // 데이터 구조 확인
        setJournal(response.data);
        setEditedData(response.data);
      } catch (error) {
        console.error('교육일지 상세 조회 실패:', error);
      }
    };

    fetchJournalDetail();
  }, [journalId]);

  // 파일 다운로드
  const handleDownload = async () => {
    try {
      const response = await studentJournalApi.downloadFile(journalId);
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
      alert('파일 다운로드에 실패했습니다.');
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      try {
        const formData = new FormData();
        formData.append('courseId', courseId);
        formData.append('title', editedData.title);
        formData.append('content', editedData.content);
        formData.append('educationDate', editedData.educationDate);

        if (editedData.newFile) {
          formData.append('file', editedData.newFile);
        }

        await studentJournalApi.update(journalId, formData);

        // 수정 후 상세 정보 다시 조회
        const response = await studentJournalApi.getDetail(journalId);
        setJournal(response.data);
        setEditedData(response.data);
        setIsEditing(false);

      } catch (error) {
        alert(error.message);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await studentJournalApi.delete(journalId);
        onClose();  // 모달 닫기
      } catch (error) {
        console.error('교육일지 삭제 실패:', error);
        alert('교육일지 삭제에 실패했습니다.');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(journal);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setEditedData({
        ...editedData,
        newFile: files[0]
      });
    } else {
      setEditedData({
        ...editedData,
        [name]: value
      });
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
                    {isEditing ? (
                      <input
                        type="text"
                        name="title"
                        value={editedData.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg bg-white mb-4"
                      />
                    ) : (
                      <p className="w-full px-3 py-2 border rounded-lg bg-gray-100 mb-4">
                        {journal.title}
                      </p>
                    )}
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

          {/* 교육일자 필드 추가 */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 font-bold">교육일자</label>
            {isEditing ? (
              <input
                type="date"
                name="educationDate"
                value={editedData.educationDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
                max={new Date().toISOString().split('T')[0]}
              />
            ) : (
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                {new Date(journal.educationDate).toLocaleDateString()}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-600 font-bold">내용</label>
            {isEditing ? (
              <textarea
                name="content"
                value={editedData.content}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg bg-white resize-y ${
                  editedData.content ? 'min-h-[200px]' : 'min-h-[42px]'
                }`}
              />
            ) : (
              <div
                className={`w-full px-3 py-2 border rounded-lg bg-gray-100 whitespace-pre-wrap ${
                  journal.content ? 'min-h-[200px]' : 'min-h-[42px]'
                }`}
              >
                {journal.content}
              </div>
            )}
          </div>
          </div>


        {journal.file && (
          <div
            className="mt-4 p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-200 transition-colors duration-200"
            onClick={!isEditing ? handleDownload : undefined}  // 수정 모드가 아닐 때만 다운로드 가능
          >
            <p className="font-medium">첨부파일</p>
            <p className="text-blue-500 hover:text-blue-700">
              {journal.file.originalName}
            </p>
            {isEditing &&
              <input type="file" name="file" onChange={handleChange}
                     className="mt-2" />}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
              >
                저장
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleDelete}
                className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
              >
                삭제
              </button>
              <button
                onClick={handleEdit}
                className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
              >
                수정
              </button>

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentJournalDetail;