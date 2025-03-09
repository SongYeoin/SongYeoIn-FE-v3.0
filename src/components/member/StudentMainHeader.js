// components/member/StudentMainHeader.js
import React from 'react';

const StudentMainHeader = ({ courseInfo, availableCourses, onCourseChange }) => {
  //console.log('courseInfo:', courseInfo); // 추가

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white border-b">
      <div>
        <div className="flex items-center mb-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{courseInfo?.name}</h1>

          {/* 코스 선택 드롭다운 */}
          {availableCourses && availableCourses.length > 1 && (
            <div className="ml-4">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                value={courseInfo?.id || ''}
                onChange={(e) => onCourseChange(parseInt(e.target.value))}
              >
                {availableCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-600">
          <span className="mr-4">강사: {courseInfo?.teacherName || '정보 없음'}</span>
          <span className="mr-4">담당자: {courseInfo?.adminName || '정보 없음'}</span>
          <span>수강기간: {courseInfo?.startDate ? new Date(courseInfo.startDate).toLocaleDateString() : '정보 없음'} - {courseInfo?.endDate ? new Date(courseInfo.endDate).toLocaleDateString() : '정보 없음'}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentMainHeader;