import React from 'react';
import { useMediaQuery } from 'react-responsive';

const ResponsiveModal = ({
  isOpen,
  onClose,
  title,
  children,
  showFooter = true,
  footerContent,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto p-4">
      <div className={`
        bg-white rounded-lg shadow-lg
        w-full
        ${isMobile ? 'max-w-[95vw]' : 'max-w-4xl'}
        my-4
        transform translate-y-0
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black">{title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4" style={{ maxHeight: 'calc(80vh - 120px)', overflowY: 'auto' }}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className="sticky bottom-0 bg-white px-6 py-4 border-t">
            {footerContent || (
              <button
                onClick={onClose}
                className="w-full bg-[#225930] text-white px-4 py-2 rounded hover:bg-[#1b4526]"
              >
                닫기
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveModal;