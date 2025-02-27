import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import MyPageModal from 'components/member/MypageModal';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout, tokenRemainingSeconds, extendToken, isExtendingToken } = useUser();
  const [showMyPageModal, setShowMyPageModal] = useState(false);

  // 남은 시간 포맷팅 함수
  const formatRemainingTime = (seconds) => {
    if (seconds === null || seconds === undefined || seconds < 0) return '만료됨';

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 토큰 연장 핸들러
  const handleExtendToken = async () => {
    if (isExtendingToken) return; // 이미 연장 중이면 중복 요청 방지

    try {
      const success = await extendToken();
      if (success) {
        alert('로그인이 연장되었습니다.');
      } else {
        alert('로그인 연장에 실패했습니다. 다시 로그인해주세요.');
        logout();
      }
    } catch (error) {
      console.error('토큰 연장 중 오류 발생:', error);
      alert('로그인 연장 중 오류가 발생했습니다.');
    }
  };

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      await logout();
      alert('로그아웃 되었습니다.');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 문제가 발생했습니다.');
    }
  };

  // 로고 클릭 시 역할에 따라 경로 설정 및 이동
  const handleTitleClick = () => {
    const targetUrl = user?.role === 'ADMIN' ? `/admin/member` : `/main`;
    navigate(targetUrl); // window.location.href 대신 navigate 사용
  };

  // 시간에 따른 색상 설정
  const getTimeColor = () => {
    if (tokenRemainingSeconds === null) return 'text-gray-600';
    if (tokenRemainingSeconds <= 60) return 'text-red-600 font-bold animate-pulse';
    if (tokenRemainingSeconds <= 300) return 'text-orange-500';
    return 'text-gray-600';
  };

  return (
    <>
      <header className={`w-full px-5 py-6 flex items-center justify-between top-0
        ${user?.role === 'ADMIN' ? 'bg-[#BCC8D1]' : 'bg-[#D3D3D3]'}`}>
        {/* 왼쪽: 제목 */}
        <h1 className="text-[25px] text-[#1e2d1f] relative group">
          <img
            src="/images/songyeoin_title.png"
            alt="SONGYEOIN"
            className="h-[30px] cursor-pointer transition-all duration-50
              group-hover:brightness-125 group-hover:scale-110
              group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            style={{
              transform: 'scale(1.5) translateY(-2px)',
              transformOrigin: 'left center',
            }}
            onClick={handleTitleClick}
          />
          {/* 전구 효과 */}
          <div className="absolute top-0 left-[18px] w-[25px] h-[25px]
            opacity-0 group-hover:opacity-60
            transition-all duration-50
            bg-yellow-200 blur-lg rounded-full pointer-events-none"
               style={{
                 transform: 'scale(1.5) translateY(-2px)',
               }}
          />
          {/* 중심 발광 효과 */}
          <div className="absolute top-1 left-[20px] w-[15px] h-[15px]
            opacity-0 group-hover:opacity-70
            transition-all duration-50
            bg-yellow-100 blur-md rounded-full pointer-events-none"
               style={{
                 transform: 'scale(1.5) translateY(-2px)',
               }}
          />
        </h1>

        {/* 오른쪽: 토큰 만료 시간과 사용자 정보 */}
        <div className="flex items-center">
          {/* 토큰 만료 시간 표시 */}
          {tokenRemainingSeconds !== null && (
            <div className="flex items-center mr-4">
              <span className={`text-sm mr-2 ${getTimeColor()}`}>
                세션 만료: {formatRemainingTime(tokenRemainingSeconds)}
              </span>
              <button
                onClick={handleExtendToken}
                disabled={isExtendingToken}
                className={`text-white text-xs py-1 px-2 rounded transition-colors
                  ${isExtendingToken
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {isExtendingToken ? '연장 중...' : '연장'}
              </button>
            </div>
          )}

          {/* 사용자 정보와 로그아웃 버튼 */}
          <img
            src={user?.profileImage || '/images/default_profile.png'}
            alt="Profile"
            title="마이페이지"
            className="w-[25px] h-[25px] rounded-full object-cover mr-1 cursor-pointer transition-transform duration-200 hover:opacity-70"
            onClick={() => setShowMyPageModal(true)}
          />
          <span className="text-[#1e2d1f] text-[15px] mr-5"
                style={{ transform: 'translateY(1px)' }}>
            {user?.role === 'ADMIN' ? `${user?.name} 관리자님` : `${user?.name} 님`}
          </span>
          <i
            className="bi bi-box-arrow-right text-2xl cursor-pointer transition-transform duration-200 hover:opacity-70"
            style={{ transform: 'translateY(2px)' }}
            title="로그아웃"
            onClick={handleLogout}
          />
        </div>
      </header>

      {showMyPageModal && (
        <MyPageModal member={user} onClose={() => setShowMyPageModal(false)} />
      )}
    </>
  );
};

export default Header;