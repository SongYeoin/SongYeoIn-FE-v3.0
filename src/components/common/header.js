import React from 'react';
import axios from 'api/axios';
//import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

/**
 * JWT 디코딩 함수
 * @param {string} token - JWT 토큰
 * @returns {object|null} 디코딩된 JSON 페이로드
 */
/*const parseJwt = (token) => {
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
};*/

const Header = () => {
  const { user, logout } = useUser(); // 사용자 상태와 로그아웃 메서드 가져오기
  //const navigate = useNavigate();
  //const user = token ? parseJwt(token) : {}; // JWT 디코딩하여 사용자 정보 추출

  const handleLogout = async () => {
    const token = sessionStorage.getItem('token'); // 세션 스토리지에서 Access Token 가져오기
    const refreshToken = sessionStorage.getItem('refreshToken'); // 세션 스토리지에서 Refresh Token 가져오기
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
      logout(); // 상태와 세션 스토리지 초기화
      //sessionStorage.removeItem('token');
      alert('로그아웃 되었습니다.');
      window.location.href = '/';
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 문제가 발생했습니다.');
    }
  };

  return (
    <header className="w-full px-5 py-2 bg-[#ebf1e8] flex items-center justify-between top-0">
      {/* 왼쪽: 제목 */}
      <h1 className="text-[25px] text-[#1e2d1f]">
        <img
          src="/images/songyeoin_title.png" // 이미지 경로
          alt="SONGYEOIN"
          className="h-[30px]" // 적절한 높이 설정
          style={{
                transform: 'scale(1.8)',  // 로고 크기
                transformOrigin: 'left center', // 왼쪽을 기준으로 확대
                position: 'relative',
                top: '-2px'  // 이 줄을 추가
              }}
        />
      </h1>

      {/* 오른쪽: 사용자 정보와 로그아웃 버튼 */}
      <div className="flex items-center h-[38px]">
        {/* 프로필 이미지 */}
        <img
          src={user?.profileImage
            || '/images/default_profile.png'} // 사용자 프로필 이미지
          alt="Profile"
          className="w-[25px] h-[25px] rounded-full object-cover mr-1 my-auto"
        />
        {/* 사용자 이름 */}
        <span className="text-[#1e2d1f] text-[18px] mr-5 leading-[30px] flex items-center mt-1">
          {user?.role === 'ADMIN' ? `${user?.name} 관리자님` : `${user?.name} 님`}
        </span>
        {/* 로그아웃 버튼 */}
        <i
          className="bi bi-box-arrow-right text-2xl cursor-pointer flex items-center"
          title="로그아웃"
          onClick={handleLogout}
        />
      </div>
    </header>
  );
};

export default Header;
