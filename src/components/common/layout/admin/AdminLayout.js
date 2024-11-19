import React from 'react';
import Header from '../../header';
import Footer from '../../Footer';
import AdminSidebar from '../../AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div
      className="w-full h-full absolute overflow-hidden bg-white flex flex-col">
      {/* 헤더 */}
      <Header />

      {/* 메인 영역 */}
      <div className="flex flex-1">
        {/* 사이드바 */}
        <AdminSidebar />

        {/* 메인 콘텐츠 */}
        <main
          className="flex flex-grow flex-col pl-72 pt-3">
          {/*콘텐츠 영역*/}
          <div className="flex-grow">
            {children}
          </div>

            {/* 푸터 */}
            <Footer />
        </main>
      </div>
    </div>
);
};

export default AdminLayout;