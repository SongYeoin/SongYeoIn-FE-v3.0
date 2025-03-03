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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!support) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>문의 정보를 가져올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[9999] overflow-y-auto pt-16">
      <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg my-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold pr-8">{support.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
            >
              ✕
            </button>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-500 mt-6 mb-0.5">
            <div className="flex items-center">
              <span>{support.memberName}</span>
              <span className="mx-2 text-gray-300">|</span>
              <span>{support.regDate}</span>
            </div>
            <div className="flex items-center">
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

        {/* 본문 영역 */}
        <div className="mb-6 border border-gray-300 rounded-lg p-4">
          <div className="whitespace-pre-wrap min-h-[200px] px-3 py-2">
            {support.content}
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleDelete}
            className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            삭제
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors duration-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportDetail;