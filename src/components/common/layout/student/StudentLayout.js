import React from 'react';
import Header from '../../header';
import Footer from '../../Footer';
import StudentSidebar from '../../StudentSidebar';

const StudentLayout = ({ children, currentPage, totalPages, onPageChange }) => {
  return (
    <div
      className="w-full h-full absolute overflow-hidden bg-white flex flex-col">
      {/* 헤더 */}
      <Header />

      {/* 메인 영역 */}
      <div className="flex flex-1">
        {/* 사이드바 */}
        <StudentSidebar />

        {/* 메인 콘텐츠 */}
        <main
          className="flex flex-grow flex-col pl-72 pt-3">
          {/*콘텐츠 영역*/}
          <div className="flex-grow">
            {children}
          </div>

          {/* 푸터 */}
          <Footer
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;