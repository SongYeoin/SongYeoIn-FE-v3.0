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
      <div className="bg-white rounded-lg p-8 w-3/4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          {isEditing ? (
            <input
              type="text"
              name="title"
              value={editedData.title}
              onChange={handleChange}
              className="text-2xl font-bold w-full border rounded px-2"
            />
          ) : (
            <h2 className="text-2xl font-bold">{journal.title}</h2>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>작성자: {journal.memberName}</div>
          <div>작성일: {new Date(journal.createdAt).toLocaleDateString()}</div>
        </div>

        <div className="mb-4">
          {isEditing ? (
            <textarea
              name="content"
              value={editedData.content}
              onChange={handleChange}
              className="w-full h-[200px] border rounded p-4"
            />
          ) : (
            <div className="whitespace-pre-wrap border p-4 rounded min-h-[200px]">
              {journal.content}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="font-medium">첨부파일</p>
            <div className="flex items-center gap-4 mt-2">
              <p>{journal.file.originalName}</p>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                className="mt-2"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              * 새 파일을 선택하지 않으면 기존 파일이 유지됩니다.
            </p>
          </div>
        ) : (
          journal.file && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <p className="font-medium">첨부파일</p>
              <p>{journal.file.originalName}</p>
            </div>
          )
        )}

        <div className="flex justify-end gap-2 mt-4">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                저장
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                수정
              </button>
              <button
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

export default StudentJournalDetail;
