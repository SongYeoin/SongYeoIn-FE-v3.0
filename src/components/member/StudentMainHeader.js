// components/member/StudentMainHeader.js
import React from 'react';

const StudentMainHeader = ({ courseInfo }) => {
  console.log('courseInfo:', courseInfo); // 추가

  return (
    <div className="flex justify-between items-center p-6 bg-white border-b">
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">{courseInfo?.name}</h1>
        <div className="text-sm text-gray-600">
          <span className="mr-4">강사: {courseInfo?.teacherName}</span>
          <span className="mr-4">담당자: {courseInfo?.adminName}</span>
          <span>수강기간: {new Date(courseInfo?.startDate).toLocaleDateString()} - {new Date(courseInfo?.endDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentMainHeader;