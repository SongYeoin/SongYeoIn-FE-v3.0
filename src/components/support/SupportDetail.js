import React, { useState, useEffect } from "react";
import { studentSupportApi } from "../../api/supportApi";

const SupportDetail = ({ supportId, onClose, refreshList }) => {
  const [support, setSupport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSupportDetail = async () => {
      setIsLoading(true);
      try {
        const data = await studentSupportApi.getDetail(supportId);
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

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await studentSupportApi.delete(supportId);
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
    <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">문의 상세</h2>
            <span className={`px-2 py-1 rounded-full text-xs ${
              support.isConfirmed
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {support.isConfirmed ? '확인완료' : '미확인'}
            </span>
          </div>
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
  );
};

export default SupportDetail;