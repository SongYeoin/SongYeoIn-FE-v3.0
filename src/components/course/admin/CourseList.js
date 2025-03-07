import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../common/layout/admin/AdminLayout';
import CourseMainHeader from '../CourseMainHeader';
import axios from 'api/axios';
import _ from 'lodash';
import CourseDetail from '../CourseDetail'; // Lodash를 import

export const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수
  const [searchTerm, setSearchTerm] = useState(''); // 검색어
  const [selectedCourse, setSelectedCourse] = useState(null); // 선택한 과정

  // 코스 데이터를 가져오는 함수

    const fetchCourses = async (searchTerm,page) => {
      try {
        // axios로 GET 요청
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/course`,
          {
            params: {
              word: searchTerm,
              page: page -1,
              size: 20
            }
          });
        console.log(response.data.content);
        setCourses(response.data.content); // 데이터를 상태에 저장
        setTotalPages(response.data.totalPages); // 전체 페이지 수
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

  // 디바운스된 검색 함수 생성
  const debouncedFetchCourses = useCallback(
    _.debounce((search,page) => {
      fetchCourses(search,page);
    }, 200), // 200ms 대기
    []
  );


  useEffect(() => {
    debouncedFetchCourses(searchTerm,currentPage);
  }, [searchTerm, currentPage,debouncedFetchCourses]); // 검색어 또는 페이지 변경 시 실행


  // 검색어 업데이트(자식으로부터 받은 검색어 상태 업데이트)
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 페이지를 첫 페이지로 초기화
  };


  return(
      <AdminLayout
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      >
        <div className="flex flex-col h-full">
          <div className="flex-shrink-0">
            <CourseMainHeader onSearch={handleSearch} fetchCourses={fetchCourses} />

            <div className="flex flex-col w-full bg-white rounded-xl shadow-sm">
              {/* Table Header */}
              <div className="border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-8 gap-4 px-6 py-4">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">과정명</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">담당자</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">강의실</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">과정 기간</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">개강일</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">종강일</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">수강생 수</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-gray-800 uppercase tracking-wider">상태</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-y-auto">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id)}
                      className="grid grid-cols-8 gap-4 px-6 py-4 items-center cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-all duration-200 ease-in-out relative group"
                    >
                      <div className="text-sm font-medium text-gray-900 text-center group-hover:text-gray-700">{course.name}</div>
                      <div className="text-sm text-gray-600 text-center group-hover:text-gray-700">{course.adminName}</div>
                      <div className="text-sm text-gray-600 text-center group-hover:text-gray-700">{course.roomName}호</div>
                      <div className="text-sm text-gray-600 text-center group-hover:text-gray-700">{course.weeks}주</div>
                      <div className="text-sm text-gray-600 text-center group-hover:text-gray-700">{course.startDate}</div>
                      <div className="text-sm text-gray-600 text-center group-hover:text-gray-700">{course.endDate}</div>
                      <div className="text-sm text-gray-600 text-center group-hover:text-gray-700">{course.counts}</div>
                      <div className="text-sm text-center">
                        <span className={`${
                          course.status === "Y" ? "text-green-500" : "text-gray-400"
                        } group-hover:text-opacity-80`}>
                          {course.status === "Y" ? "활성" : "종강"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-center text-gray-500 py-4">교육과정 데이터가 없습니다.</div>
                )}
              </div>
            </div>
          </div>

          {/* 상세보기 모달 - 기존과 동일 */}
          {selectedCourse && (
            <CourseDetail
              courseId={selectedCourse}
              onClose={() => setSelectedCourse(null)}
              onDeleteSuccess={() => {
                setSelectedCourse(null);
                fetchCourses(searchTerm, currentPage);
              }}
            />
          )}
        </div>
      </AdminLayout>
    );
  };

  export default CourseList;