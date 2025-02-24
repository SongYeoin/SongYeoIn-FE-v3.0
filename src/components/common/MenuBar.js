// components/common/MenuBar.js
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useResponsive } from './ResponsiveWrapper';

const MenuBar = ({ items }) => {
  const location = useLocation();
  const { isMobile, isTablet } = useResponsive();

  const navClass = isMobile ? 'px-4' : isTablet ? 'px-[60px]' : 'px-[180px]';

  return (
    <nav className={`w-full bg-[#F5F5F5] py-2 ${navClass}`}>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:gap-8">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.link}
            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 transition-all
              ${location.pathname === item.link
                ? 'text-black font-bold'
                : 'text-gray-600 hover:text-black'}`}
          >
            <span className="text-lg md:text-base">{item.icon}</span>
            <span className="text-sm md:text-base">{item.name}</span>
          </a>
        ))}
      </div>
    </nav>
  );
};

export default MenuBar;