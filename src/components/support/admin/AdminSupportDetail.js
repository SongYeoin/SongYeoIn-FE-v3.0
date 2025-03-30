import React, { useState, useEffect } from "react";
import { adminSupportApi } from "../../../api/supportApi";

// 파일 다운로드 헬퍼 함수 수정
const downloadFile = async (supportId, fileId, fileName) => {
  try {
    const response = await adminSupportApi.downloadFile(supportId, fileId);
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  } catch (error) {
    console.error('파일 다운로드 중 오류 발생:', error);
    alert('파일 다운로드 중 오류가 발생했습니다.');
  }
};

const AdminSupportDetail = ({ supportId, onClose, refreshList }) => {
 const [support, setSupport] = useState(null);
 const [isLoading, setIsLoading] = useState(true);
 const [showDevTeamModal, setShowDevTeamModal] = useState(false);
 const [additionalComment, setAdditionalComment] = useState('');

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

 // 개발팀 전달 모달 표시 함수
 const handleOpenDevTeamModal = () => {
   setAdditionalComment('');
   setShowDevTeamModal(true);
 };

 // 개발팀에 문의 전달하는 함수
 const handleSendToDevTeam = async () => {
   try {
     // 백엔드 API 호출
     await adminSupportApi.sendToDevTeam(supportId, additionalComment);
     alert("개발팀에게 문의가 전송되었습니다.");
     setShowDevTeamModal(false);

     // 상태 업데이트 (필요시 다시 불러오기)
     const updatedSupport = await adminSupportApi.getDetail(supportId);
     setSupport(updatedSupport);
     refreshList();
   } catch (error) {
     console.error("Error sending to dev team:", error);
     alert(error.message || "개발팀 전송 중 오류가 발생했습니다.");
   }
 };

 useEffect(() => {
   document.body.style.overflow = 'hidden';
   return () => {
     document.body.style.overflow = 'unset';
   };
 }, []);

 // 파일 크기를 사람이 읽기 쉬운 형태로 변환하는 함수
 const formatFileSize = (sizeStr) => {
   if (!sizeStr) return '';
   return sizeStr;
 };

 // 파일 아이콘 결정 함수
 const getFileIcon = (mimeType) => {
   if (mimeType?.startsWith('image/')) {
     return (
       <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
       </svg>
     );
   } else if (mimeType?.includes('pdf')) {
     return (
       <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
       </svg>
     );
   } else if (mimeType?.includes('word') || mimeType?.includes('doc')) {
     return (
       <svg className="w-5 h-5 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
       </svg>
     );
   } else {
     return (
       <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
       </svg>
     );
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
                 : 'bg-gray-100 text-gray-600'
             }`}>
               {support.isConfirmed ? '확인완료' : '미확인'}
             </span>
             {/* 개발팀 답변 상태 아이콘 추가 */}
             <span className={`px-2 py-1 rounded-full text-xs ${
               support.developerResponse
                 ? 'bg-blue-100 text-blue-800'
                 : 'bg-gray-100 text-gray-600'
             }`}>
               {support.developerResponse ? '답변완료' : '대기중'}
             </span>
           </div>
           <div className="flex items-center gap-2">
             <button
               onClick={handleOpenDevTeamModal}
               className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors duration-200"
             >
               개발팀에게 전달
             </button>
             {!support.isConfirmed ? (
               <button
                 onClick={handleConfirm}
                 className="px-2 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors duration-200"
               >
                 확인 처리하기
               </button>
             ) : (
               <button
                 onClick={handleUnconfirm}
                 className="px-2 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors duration-200"
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

           <div className="mb-4">
             <label className="text-sm text-gray-600 font-bold">내용</label>
             <div className="w-full px-3 py-2 border rounded-lg bg-gray-100 min-h-[200px] whitespace-pre-wrap">
               {support.content}
             </div>
           </div>

           {/* 첨부 파일 목록 */}
           {support.files && support.files.length > 0 && (
             <div className="mb-4">
               <label className="text-sm text-gray-600 font-bold">첨부 파일</label>
               <div className="w-full p-3 border rounded-lg bg-gray-50">
                 <div className="space-y-2">
                   {support.files.map((file, index) => (
                     <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg">
                       <div className="flex items-center space-x-2">
                         {getFileIcon(file.mimeType)}
                         <span className="text-sm">{file.originalName}</span>
                         <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                       </div>
                       <button
                         onClick={() => downloadFile(supportId, file.id, file.originalName)}
                         className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                       >
                         다운로드
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           )}

           {/* 이미지 파일 미리보기 */}
           {support.files && support.files.filter(file => file.mimeType?.startsWith('image/')).length > 0 && (
             <div className="mb-4">
               <label className="text-sm text-gray-600 font-bold">이미지 미리보기</label>
               <div className="mt-2 grid grid-cols-2 gap-4">
                 {support.files
                   .filter(file => file.mimeType?.startsWith('image/'))
                   .map((file, index) => (
                     <div key={index} className="relative group">
                       <img
                         src={file.url}
                         alt={file.originalName}
                         className="rounded-lg shadow-md w-full h-40 object-cover cursor-pointer"
                         onClick={() => window.open(file.url, '_blank')}
                       />
                       <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                         <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex space-x-2">
                            <a
                             href={file.url}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm"
                           >
                             원본 보기
                           </a>
                         </div>
                       </div>
                     </div>
                   ))}
               </div>
             </div>
           )}

           {/* 개발팀 응답 영역 */}
           {support.developerResponse && (
             <div className="mt-4">
               <label className="text-sm text-gray-600 font-bold">개발팀 답변</label>
               <div className="w-full px-3 py-2 border rounded-lg bg-blue-50 min-h-[100px] whitespace-pre-wrap">
                 {support.developerResponse.responseContent}
               </div>
             </div>
           )}
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

     {/* 개발팀 전달 모달 */}
     {showDevTeamModal && (
       <div className="fixed inset-0 flex items-start justify-center bg-black bg-opacity-50 z-[60] overflow-y-auto">
         <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-lg my-10">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-2xl font-bold">개발팀 전달</h3>
             <button
               onClick={() => setShowDevTeamModal(false)}
               className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
             >
               ✕
             </button>
           </div>

           <div className="mb-6 border border-gray-300 rounded-lg p-4">
             <div className="mb-4">
               <label className="text-sm text-gray-600 font-bold">문의 내용</label>
               <textarea
                 value={`**[시스템 장애 문의]** ${support.title}
     > 문의 ID: ${support.id}
     > 작성자: ${support.memberName}
     > 등록일시: ${support.regDate}
     > 확인여부: ${support.isConfirmed ? '확인완료' : '미확인'}
     ${support.files && support.files.length > 0 ? `> 첨부파일: ${support.files.length}개` : ''}

     **문의내용:**
     \`\`\`
     ${support.content}
     \`\`\``}
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
               onClick={() => setShowDevTeamModal(false)}
               className="w-full py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200"
             >
               취소
             </button>
             <button
               onClick={handleSendToDevTeam}
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