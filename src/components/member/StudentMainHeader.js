// components/member/StudentMainHeader.js
import React from 'react';

const StudentMainHeader = ({ courseInfo }) => {
  return (
    <div className="flex justify-between items-center p-6 bg-white border-b">
      <div>
        <h1 className="text-2xl font-bold mb-3">{courseInfo?.name}</h1>
        <div className="text-sm text-gray-600">
          <span className="mr-4">강사: {courseInfo?.teacherName}</span>
          <span className="mr-4">담당자: {courseInfo?.adminName}</span>
          <span>수강기간: {new Date(courseInfo?.enrollDate).toLocaleDateString()} - {new Date(courseInfo?.endDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentMainHeader;