import React, { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import AttendancePrintPage from './AttendancePrintPage';
//import { useEffect } from 'react';

const PrintDialog = ({
  isOpen,
  onClose,
  courseName,
  terms,
  selectedTerm,
  attendanceData,
  isLoading,
  onTermSelect,
}) => {

  //const [isPrintPageOpen, setIsPrintPageOpen] = useState(false);
  // const [attendancePrintData, setAttendancePrintData] = useState(null);
  const [attendancePrintData, setAttendancePrintData] = useState(null);
  useEffect(() => {
    if (selectedTerm && attendanceData) {
      setAttendancePrintData(attendanceData);
    }
  }, [selectedTerm, attendanceData]);

  const handlePrint = () => {
    window.print();
  };

  // 모달 외부 클릭 시 닫기
  const handleOutsideClick = (e) => {
    if (e.target.className.includes('modal-overlay')) {
      onClose();
    }
  };

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-[9999] overflow-y-auto"
      onClick={handleOutsideClick}
    >
      <div
        className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-lg my-10 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6"
             style={{
               minHeight: 'min-content',
               maxHeight: '90vh',
               margin: '5vh auto',
             }}>
          <h2 className="text-2xl font-bold">출석부 인쇄</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-xl font-extrabold transition-colors duration-200"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {terms && terms.length > 0 ? (
                terms.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => onTermSelect(term)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${selectedTerm && selectedTerm['차수'] === term['차수']
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {term['차수']}
                    <span className="ml-2 text-xs">
                      ({term['시작일']}~{term['종료일']})
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-gray-500">차수 정보가 없습니다.</div>
              )}
            </div>

            <button
              onClick={handlePrint}
              disabled={!selectedTerm || isLoading}
              className="ml-4 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 flex items-center justify-center"
            >
              <Printer className="w-4 h-4 mr-2" />
              인쇄하기
            </button>
          </div>


          {/* 출석부 내용 영역 */}
          <div className="border rounded-lg p-4 mt-4">
            {isLoading ? (
              <div
                className="flex items-center justify-center p-8 text-gray-500">
                <div
                  className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                데이터를 불러오는 중입니다...
              </div>
            ) : attendanceData ? (
              <AttendancePrintPage
                data={attendancePrintData}
                courseName={courseName}
                selectedTerm={selectedTerm}
              />
            ) : (
              <div className="text-center text-gray-500 p-8">
                차수를 선택하면 출석부가 표시됩니다.
              </div>
            )}
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            닫기
          </button>
        </div>

      </div>
    </div>
  );
};

export default PrintDialog;