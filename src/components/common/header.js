import React from 'react';
import axios from 'api/axios';

/**
 * JWT 디코딩 함수
 * @param {string} token - JWT 토큰
 * @returns {object|null} 디코딩된 JSON 페이로드
 */
const parseJwt = (token) => {
  if (!token) return null;

  try {
    const base64Url = token.split('.')[1]; // JWT의 Payload 추출
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Base64 URL 디코딩
    const jsonPayload = decodeURIComponent(
      atob(base64)
      .split('')
      .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
    );
    return JSON.parse(jsonPayload); // JSON 형태로 변환
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
};

const Header = () => {
  const token = sessionStorage.getItem('token'); // 세션 스토리지에서 Access Token 가져오기
  const refreshToken = sessionStorage.getItem('refreshToken'); // 세션 스토리지에서 Refresh Token 가져오기
  const user = token ? parseJwt(token) : {}; // JWT 디코딩하여 사용자 정보 추출

  const handleLogout = async () => {
    try {
      if (!token) throw new Error('토큰이 없습니다.');

      // 백엔드 로그아웃 API 호출
      await axios.post(
        `${process.env.REACT_APP_API_URL}/member/logout`, // 백엔드 로그아웃 API 엔드포인트
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`, // Access Token 포함
            'Refresh-Token': refreshToken, // Refresh Token
          },
        }
      );

      // 성공 시 토큰 삭제 및 리다이렉트
      sessionStorage.removeItem('token');
      alert('로그아웃 되었습니다.');
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <header
      className="w-full px-5 py-2 bg-[#ebf1e8] flex items-center justify-between top-0">
      {/* 왼쪽: 제목 */}
      <h1 className="text-[25px] text-[#1e2d1f]">
        SONGYEOIN
      </h1>

      {/* 오른쪽: 사용자 정보와 로그아웃 버튼 */}
      <div className="flex items-center gap-4">
        {/* 프로필 이미지 */}
        <img
          src={user?.profileImage
            || '/images/default_profile.png'} // 사용자 프로필 이미지
          alt="Profile"
          className="w-[38px] h-[38px] rounded-full object-cover"
        />
        {/* 사용자 이름 */}
        <span className="text-[#1e2d1f] text-[18px]">
          {user?.role === 'ADMIN' ? `${user?.name} 관리자님` : `${user?.name} 님`}
        </span>
        {/* 로그아웃 버튼 */}
        <i
          className="bi bi-box-arrow-right text-3xl cursor-pointer"
          title="로그아웃"
          onClick={handleLogout}
        />
      </div>
    </header>
  );
};

export default Header;
