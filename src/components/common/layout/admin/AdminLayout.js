import React from 'react';
import Header from '../../header';
import Footer from '../../Footer';
import AdminSidebar from '../../AdminSidebar';
import { useResponsive } from '../../../../components/common/ResponsiveWrapper';

const AdminLayout = ({ children, ...props }) => {
  const { isMobile } = useResponsive();

  return (
    <div className="w-full h-screen flex flex-col bg-white">
          <Header />
          <div className={`flex flex-1 overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
            <AdminSidebar />
            <main className={`flex flex-col ${isMobile ? 'pl-0' : 'pl-60'} w-full overflow-hidden`}>
              <div className="flex-1 overflow-y-auto">
                {children}
              </div>
              {!props.hideFooter && <Footer {...props} />}
            </main>
          </div>
        </div>
      );
    };

export default AdminLayout;