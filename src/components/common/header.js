import React from 'react';

const Header = () => {
  return (
    <header
      className="w-full px-5 py-2 bg-[#ebf1e8] flex items-center justify-between top-0">
      <h1 className="text-[25px] text-[#1e2d1f]"
          style={{ fontFamily: 'Dokdo' }}
      >SONGYEOIN</h1>
      <img
        src="/images/default_profile.png"
        alt="Profile"
        className="w-[38px] h-[38px] rounded-full object-cover"
      />
    </header>
  );
};

export default Header;