import React, { useState, useEffect } from "react";
import { adminSupportApi } from "../../../api/supportApi";

const AdminSupportDetail = ({ supportId, onClose, refreshList }) => {
  const [support, setSupport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [discordContent, setDiscordContent] = useState('');
  const [additionalComment, setAdditionalComment] = useState('');

  // 환경변수에서 디스코드 웹훅 URL 가져오기
  const discordWebhookUrl = process.env.REACT_APP_DISCORD_WEBHOOK_URL;

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

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 개발팀에 디스코드로 전달하는 함수
  const handleSendToDiscord = () => {
    if (!support) return;

    // 디스코드 메시지 내용 설정
    const content = `
**[시스템 장애 문의]** ${support.title}
> 문의 ID: ${support.id}
> 작성자: ${support.memberName}
> 등록일시: ${support.regDate}
> 확인여부: ${support.isConfirmed ? '확인완료' : '미확인'}

**문의내용:**
\`\`\`
${support.content}
\`\`\`
    `;

    setDiscordContent(content);
    setAdditionalComment('');
    setShowDiscordModal(true);
  };

  // 디스코드로 메시지 전송하는 함수
  const sendToDiscord = async () => {
    // 전송 전 확인 창 표시
    if (!window.confirm("해당 문의글을 개발팀에게 전송하시겠습니까?")) {
      return; // 사용자가 취소를 누르면 함수 실행 중단
    }

    try {
      // 기본 컨텐츠와 추가 코멘트를 합친 내용
      let finalContent = discordContent;

      if (additionalComment.trim() !== '') {
        finalContent += `\n**관리자 코멘트:**\n${additionalComment}`;
      }

      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: finalContent,
        }),
      });
      alert("디스코드로 문의가 전송되었습니다.");
      setShowDiscordModal(false);
    } catch (error) {
      console.error("디스코드 전송 오류:", error);
      alert("디스코드로 전송 중 오류가 발생했습니다.");
    }
  };

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
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">관리자 문의 상세</h2>
              <span className={`px-2 py-1 rounded-full text-xs ${
                support.isConfirmed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {support.isConfirmed ? '확인완료' : '미확인'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSendToDiscord}
                className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                개발팀에게 전달
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
                  className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-lg hover:bg-yellow-600 transition-colors duration-200"
                >
                  확인 취소하기
                </button>
              )}
              <button
                onClick={onClose}
                className="ml-4 text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
              >
                ✕
              </button>
            </div>
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

      {/* 디스코드 정보 모달 */}
      {showDiscordModal && (
        <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-[60] overflow-y-auto">
          <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">개발팀 전달</h3>
              <button
                onClick={() => setShowDiscordModal(false)}
                className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-6 border border-gray-300 rounded-lg p-4">
              <div className="mb-4">
                <label className="text-sm text-gray-600 font-bold">문의 내용</label>
                <textarea
                  value={discordContent}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 h-72 resize-none focus:outline-none cursor-default"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 font-bold">추가 메시지 (선택사항)</label>
                <textarea
                  value={additionalComment}
                  onChange={(e) => setAdditionalComment(e.target.value)}
                  placeholder="개발팀에게 전달할 추가 메시지를 입력하세요"
                  className="w-full px-3 py-2 border rounded-lg bg-white h-20 resize-none focus:outline-none focus:border-2 focus:border-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowDiscordModal(false)}
                className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={sendToDiscord}
                className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminSupportDetail;