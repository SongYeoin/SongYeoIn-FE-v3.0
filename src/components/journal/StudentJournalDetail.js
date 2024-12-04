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

  const handleEdit = async () => {
    if (isEditing) {
      try {
        const formData = new FormData();
        formData.append('courseId', courseId);  // 전달받은 courseId 사용
        formData.append('title', editedData.title);
        formData.append('content', editedData.content);

        if (editedData.newFile) {
          formData.append('file', editedData.newFile);
        } else {
          // 기존 파일 정보가 있고 새 파일이 없는 경우
          // 백엔드에서 기존 파일을 유지하도록 처리
        }

        await studentJournalApi.update(journalId, formData);

        // 수정 후 상세 정보 다시 조회
        const response = await studentJournalApi.getDetail(journalId);
        setJournal(response.data);
        setEditedData(response.data);
        setIsEditing(false);

      } catch (error) {
        console.error('교육일지 수정 실패:', error);
        alert('수정에 실패했습니다.');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">교육일지 상세보기</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl font-medium transition-colors duration-200">✕</button>
        </div>

        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <div>
            <label className="text-sm text-gray-600 font-bold">제목</label>
            <p className="w-full px-3 py-2 border rounded-lg bg-gray-100 mb-4">{isEditing ?
              <input type="text" name="title" value={editedData.title} onChange={handleChange} className="w-full bg-white px-2" />
              : journal.title}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">작성자</label>
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">{journal.memberName}</p>
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
            {isEditing ? (
              <textarea
                name="content"
                value={editedData.content}
                onChange={handleChange}
                className="w-full h-[42px] px-3 py-2 border rounded-lg bg-white"
              />
            ) : (
              <p className="w-full h-[42px] px-3 py-2 border rounded-lg bg-gray-100">
                {journal.content}
              </p>
            )}
          </div>
        </div>

        {journal.file && (
          <div className="mt-4 p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-200 transition-colors duration-200">
            <p className="font-medium">첨부파일</p>
            <p className="text-blue-500 hover:text-blue-700">{journal.file.originalName}</p>
            {isEditing &&
              <input type="file" name="file" onChange={handleChange} className="mt-2" />}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          {isEditing ? (
            <>
              <button onClick={handleCancel} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">취소</button>
              <button onClick={handleEdit} className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800">저장</button>
            </>
          ) : (
            <>
              <button onClick={handleEdit} className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800">수정</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">삭제</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentJournalDetail;
