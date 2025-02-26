import React, { useState } from 'react';
import axios from 'api/axios';

const AdminClubDetail = ({ club, onClose, user, onUpdateSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(club);
  const [originalClub, setOriginalClub] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'writer' || name === 'regDate') return;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (formData.checkStatus === 'W' || !formData.checkMessage) {
      alert('승인 상태와 승인 메시지는 필수 항목입니다. 입력해주세요.');
      return;
    }

    try {
      const payload = {
        checkStatus: formData.checkStatus,
        checkMessage: formData.checkMessage
      };

      console.log("수정 데이터 전송:", payload);

      await axios.put(`${process.env.REACT_APP_API_URL}/admin/club/${club.clubId}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      alert('수정이 완료되었습니다.');
      setIsEditing(false);
      onUpdateSuccess();
      onClose();
    } catch (err) {
      console.error('수정 실패:', err);
      alert('수정에 실패했습니다.');
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm('정말로 삭제하시겠습니까?'); // 확인 다이얼로그
    if (isConfirmed) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/admin/club/${club.clubId}`);
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

  const handleEditClick = () => {
    if (!user) {
      console.error('사용자 정보가 없습니다. user 객체:', user);
      return;
    }

    setOriginalClub({...club});
    setFormData({
      ...club,
      checker: user?.name
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(originalClub);
    setIsEditing(false);
  };


return(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
            <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">신청내역 상세보기</h2>
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
                    <label className="text-sm text-gray-600 font-bold">작성자/승인자</label>
                    <input
                      type="text"
                      value={`${club.writer || ""} / ${club.checker || ""}`}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">작성일</label>
                    <input
                      type="date"
                      value={club.regDate}
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 font-bold">동아리명</label>
                    <input
                      type="text"
                      value={club.clubName}
                      name="clubName"
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">대표연락처</label>
                    <input
                      type="text"
                      value={club.contact}
                      name="contact"
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 font-bold">활동일</label>
                    <input
                      type="date"
                      value={club.studyDate}
                      name="studyDate"
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">시작 시간</label>
                    <input
                      type="time"
                      value={club.startTime}
                      name="startTime"
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">종료 시간</label>
                    <input
                      type="time"
                      value={club.endTime}
                      name="endTime"
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-sm text-gray-600 font-bold">참여자</label>
                      <input
                        type="text"
                        value={club.participants}
                        name="participants"
                        disabled
                        className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                      />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">총 인원</label>
                    <input
                      type="number"
                      value={club.participantCount}
                      name="participantCount"
                      disabled
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm text-gray-600 font-bold">목적 및 내용</label>
                    <div className={`w-full px-3 py-2 border rounded-lg bg-gray-100 whitespace-pre-wrap min-h-[120px]`}>
                      {club.content}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-600 font-bold">승인상태 {isEditing && <span className="text-red-500">*</span>}</label>
                    {!isEditing ? (
                      <p className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${
                        club.checkStatus === 'Y' ? 'text-green-600' : club.checkStatus === 'N' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {club.checkStatus === 'Y' ? '승인' :
                         club.checkStatus === 'N' ? '미승인' : '대기'}
                      </p>
                    ) : (
                      <div className="flex items-center space-x-4 mt-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="Y"
                            name="checkStatus"
                            checked={formData.checkStatus === 'Y'}
                            onChange={handleInputChange}
                            className="mr-1 w-4 h-4"
                          />
                          승인
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="N"
                            name="checkStatus"
                            checked={formData.checkStatus === 'N'}
                            onChange={handleInputChange}
                            className="mr-1 w-4 h-4"
                          />
                          미승인
                        </label>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 font-bold">승인메시지 {isEditing && <span className="text-red-500">*</span>}</label>
                    <input
                      type="text"
                      value={isEditing ? formData.checkMessage || "" : club.checkMessage || ""}
                      name="checkMessage"
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-lg ${!isEditing ? 'bg-gray-100' : 'bg-white'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600 font-bold">첨부파일</label>
                  <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 flex items-center justify-between">
                    {club.file ? (
                      <>
                      <a
                        href={`https://${process.env.REACT_APP_S3_BUCKET_URL}/api/files/download/${encodeURIComponent(club.file.fileName)}`}
                        download={club.file.originalName} // 다운로드 시 파일 이름 지정
                        className="text-blue-500 underline"
                      >{club.file.originalName}</a>
                      </>
                      ) : (
                          <span>첨부된 파일 없음</span>
                        )}

                  </div>

            </div>
          </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2">
                {!isEditing ? (
                  <>
                    {club.checkStatus === 'W' && (
                      <button
                        onClick={handleDelete}
                        className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
                      >
                        삭제
                      </button>
                    )}
                    <button
                      onClick={handleEditClick}
                      className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                    >
                      수정
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
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
            </div>
          </div>
  );
 };

 export default AdminClubDetail;
