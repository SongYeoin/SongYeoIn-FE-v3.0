import React, { useEffect, useState } from 'react';
import axios from 'api/axios';

const ClubDetail = ({ club, user, onClose, onUpdateSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(club);
  const [originalClub] = useState(club);
  const isOwner = user?.name === club.writer;

useEffect(() => {
  console.log('club:', club); // 클럽 객체가 정상적으로 전달되는지 확인
}, [club]);



  // 입력 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 파일 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  // 저장 핸들러
  const handleSaveEdit = async () => {
    if (!formData.participants || !formData.studyDate) {
      alert('참여자와 활동일은 필수 항목입니다. 입력해주세요.');
      return;
    }

    try {
      const newFormData = new FormData();
      const clubData = {
        participants: formData.participants,
        content: formData.content,
        studyDate: formData.studyDate,
      };
      newFormData.append("club", new Blob([JSON.stringify(clubData)], { type: "application/json" }));

      if (formData.file && formData.file.size > 0) {
        newFormData.append("file", formData.file);
      }

      await axios.put(`${process.env.REACT_APP_API_URL}/club/${club.clubId}`, newFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert('수정이 완료되었습니다.');
      setIsEditing(false);
      onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정에 실패했습니다.');
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    const isConfirmed = window.confirm('정말로 삭제하시겠습니까?'); // 확인 다이얼로그
    if (isConfirmed) {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/club/${club.clubId}`);
      alert('삭제되었습니다.');
      onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제에 실패했습니다.');
    }
    } else {
        alert('삭제가 취소되었습니다.'); // 취소 시 메시지 표시
      }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">동아리 상세보기</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">번호</label>
              <input
                type="text"
                value={club.clubId}
                name="clubId"
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">작성자/승인자</label>
              <input
                type="text"
                value={`${club.writer || ""} / ${club.checker || ""}`}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 font-bold">참여자</label>
            <input
              type="text"
              value={isEditing ? formData.participants : club.participants}
              name="participants"
              onChange={handleInputChange}
              disabled={!isEditing || club.checkStatus !== 'W'}
              className={`w-full px-3 py-2 border rounded-lg ${(!isEditing || club.checkStatus !== 'W') ? 'bg-gray-100' : 'bg-white'}`}
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-gray-600 font-bold">내용</label>
            {isEditing ? (
              <textarea
                value={isEditing ? formData.content : club.content}
                name="content"
                onChange={handleInputChange}
                disabled={!isEditing || club.checkStatus !== 'W'}
                className={`w-full px-3 py-2 border rounded-lg resize-y min-h-[42px] ${
                  (!isEditing || club.checkStatus !== 'W') ? 'bg-gray-100' : 'bg-white'
                }`}
                style={{
                  height: '42px',
                  overflow: 'hidden',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div className={`w-full px-3 py-2 border rounded-lg bg-gray-100 whitespace-pre-wrap min-h-[42px]`}>
                {club.content}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">승인상태</label>
              <input
                type="text"
                value={club.checkStatus === 'Y' ? '승인' : club.checkStatus === 'N' ? '미승인' : '대기'}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">승인메시지</label>
              <input
                type="text"
                value={club.checkMessage || ""}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-600 font-bold">활동일</label>
              <input
                type="date"
                value={isEditing ? formData.studyDate : club.studyDate}
                name="studyDate"
                onChange={handleInputChange}
                disabled={!isEditing || club.checkStatus !== 'W'}
                className={`w-full px-3 py-2 border rounded-lg ${(!isEditing || club.checkStatus !== 'W') ? 'bg-gray-100' : 'bg-white'}`}
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 font-bold">작성일</label>
              <input
                type="date"
                value={isEditing
                                                 ? club.checkStatus === 'W'
                                                   ? new Date().toLocaleDateString('en-CA')
                                                   : club.regDate
                                                 : club.regDate
}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 font-bold">첨부파일</label>
            {isEditing && club.checkStatus === 'Y' ? (
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              />
            ) : (
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                {club.file ? club.file.originalName : "첨부된 파일 없음"}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
                {isOwner && (
                  <div className="flex justify-end gap-2 mt-4">
                    {!isEditing ? (
                      club.checkStatus === 'W' ? (
                        <>
                          <button
                            onClick={handleDelete}
                            className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
                          >
                            삭제
                          </button>
                          <button
                            onClick={() => setIsEditing(true)}
                            className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                          >
                            수정
                          </button>
                        </>
                      ) : club.checkStatus === 'Y' && (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                        >
                          수정
                        </button>
                      )
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setFormData(originalClub);
                            setIsEditing(false);
                          }}
                          className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                        >
                          저장
                        </button>
                      </>
                    )}
                  </div>
                )}
      </div>
    </div>
  );
};

export default ClubDetail;