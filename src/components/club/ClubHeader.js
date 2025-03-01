import React from 'react';
//import { CourseContext } from '../common/CourseContext';

const ClubHeader = ({ courses, onApplyClick, selectedCourse, courseChange }) => {
//const { courses = [] } = useContext(CourseContext);

const handleChange = (e) => {
      const courseId = e.target.value;
      courseChange(courseId);
  };

  return (
    <>
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative">
        {/* 제목과 신청 버튼 */}
        <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-6 p-6">
          <div className="flex flex-col justify-start items-start flex-grow relative gap-6">
            <div className="self-stretch flex flex-row justify-between items-start flex-grow relative">
            <h1 className="text-xl md:text-2xl lg:text-3xl text-[#16161b]">동아리 신청</h1>

            <div
              className="flex justify-center items-center flex-grow-0 flex-shrink-0 h-10 relative gap-1 px-4 py-2 rounded-lg bg-[#225930] cursor-pointer"
              onClick={onApplyClick}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="flex-grow-0 flex-shrink-0 w-6 h-6 relative"
                preserveAspectRatio="none"
              >
                <path
                  d="M12 5V19"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 12H19"
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-white">신청</p>
            </div>
            </div>


            {/* 검색 부분 */}
            <div className="self-stretch flex-grow-0 flex-shrink-0 h-10 relative flex justify-between items-center">
              <select className="w-80 text-center px-4 py-2 text-sm text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={selectedCourse || ''} // 선택된 값 반영
                                  onChange={handleChange}
                                  disabled={!courses || courses.length === 0}
              >
                {!courses || courses.length === 0 ? (
                  <option value="" disabled>교육 과정이 없습니다.</option>
                ) : (
                  courses.map((course) => (
                    <option key={course.courseId} value={course.courseId} className="text-sm text-black">
                      {course.courseName}
                    </option>
                  ))
                )}
              </select>
              <div className="flex items-center gap-4">
                <div className="flex justify-start items-center w-50 h-10 gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300">
                  <select className="text-sm text-left text-black" defaultValue="작성자">
                    <option value="작성자">작성자</option>
                    <option value="참여자">참여자</option>
                    <option value="승인상태">승인상태</option>
                  </select>
                </div>

                <div className="w-72 flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#9A97A9"
                    className="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                  </svg>
                  <input
                    type="text"
                    className="w-full text-gray-600 focus:outline-none"
                    placeholder="검색할 내용을 입력하세요."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClubHeader;

