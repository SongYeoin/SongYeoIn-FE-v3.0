import React, { useState, useEffect } from "react";
import { adminSupportApi } from "../../../api/supportApi";

const AdminSupportDetail = ({ supportId, onClose, refreshList }) => {
  const [support, setSupport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailContent, setEmailContent] = useState({ subject: '', body: '' });

  // 개발팀 이메일 주소
  const devTeamEmail = "devteam@songyeoin.com";

  useEffect(() => {
    const fetchSupportDetail = async () => {
      setIsLoading(true);
      try {
        const data = await adminSupportApi.getDetail(supportId);
        setSupport(data);
      } catch (error) {
        console.error("Error fetching support detail:", error);
        alert(error.message || "문의 세부 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSupportDetail();
  }, [supportId]);

  const handleConfirm = async () => {
    try {
      const updatedSupport = await adminSupportApi.confirmSupport(supportId);
      setSupport(updatedSupport);
      alert("문의가 확인 처리되었습니다.");
      refreshList();
    } catch (error) {
      console.error("Error confirming support:", error);
      alert(error.message || "문의 확인 처리 중 오류가 발생했습니다.");
    }
  };

  // 확인 처리 취소 함수 추가
  const handleUnconfirm = async () => {
    try {
      const updatedSupport = await adminSupportApi.unconfirmSupport(supportId);
      setSupport(updatedSupport);
      alert("문의 확인이 취소되었습니다.");
      refreshList();
    } catch (error) {
      console.error("Error unconfirming support:", error);
      alert(error.message || "문의 확인 취소 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await adminSupportApi.delete(supportId);
        alert("문의가 삭제되었습니다.");
        refreshList();
        onClose();
      } catch (error) {
        console.error("Error deleting support:", error);
        alert(error.message || "문의 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 개발팀에 이메일로 전달하는 함수
  const handleSendToDev = () => {
    if (!support) return;

    // 이메일 제목과 본문 설정
    const subject = `[시스템 장애 문의] ${support.title}`;
    const body = `
문의 ID: ${support.id}
작성자: ${support.memberName}
등록일시: ${support.regDate}
확인여부: ${support.isConfirmed ? '확인완료' : '미확인'}

문의내용:
${support.content}
    `;

    setEmailContent({ subject, body });
    setShowEmailModal(true);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!support) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p>문의 정보를 가져올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">관리자 문의 상세</h2>
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
              <p className="w-full px-3 py-2 border rounded-lg bg-gray-100 mb-4">
                {support.title}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600 font-bold">작성자</label>
                <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                  {support.memberName}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600 font-bold">작성일</label>
                <p className="w-full px-3 py-2 border rounded-lg bg-gray-100">
                  {support.regDate}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600 font-bold">상태</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSendToDev}
                    className="px-2 py-1 bg-green-800 text-white text-xs rounded-lg hover:bg-green-900 transition-colors duration-200"
                  >
                    개발팀 전달하기
                  </button>
                  {!support.isConfirmed ? (
                    <button
                      onClick={handleConfirm}
                      className="px-2 py-1 bg-gray-500 text-white text-xs rounded-lg hover:bg-gray-600 transition-colors duration-200"
                    >
                      확인 처리하기
                    </button>
                  ) : (
                    <button
                      onClick={handleUnconfirm}
                      className="px-2 py-1 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 transition-colors duration-200"
                    >
                      확인 취소하기
                    </button>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    support.isConfirmed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {support.isConfirmed ? '확인완료' : '미확인'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 font-bold">내용</label>
              <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 min-h-[200px] whitespace-pre-wrap">
                {support.content}
              </div>
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleDelete}
              className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
            >
              삭제
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* 이메일 정보 모달 */}
      {showEmailModal && (
        <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-[60] overflow-y-auto">
          <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">개발팀 전달 정보</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 border border-gray-300 rounded-lg p-4">
              <div className="mb-4">
                <label className="text-sm text-gray-600 font-bold">개발팀 이메일</label>
                <div className="flex items-center">
                  <input
                    readOnly
                    value={devTeamEmail}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-default focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(devTeamEmail);
                      alert("이메일 주소가 복사되었습니다.");
                    }}
                    className="ml-2 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 min-w-[80px]"
                  >
                    복사
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 font-bold">이메일 내용</label>
                <textarea
                  readOnly
                  value={`${emailContent.subject}\n\n${emailContent.body}`}
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 h-60 resize-none cursor-default focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${emailContent.subject}\n\n${emailContent.body}`);
                  alert("내용이 복사되었습니다.");
                }}
                className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
              >
                내용 복사
              </button>
              <button
                onClick={() => setShowEmailModal(false)}
                className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSupportDetail;