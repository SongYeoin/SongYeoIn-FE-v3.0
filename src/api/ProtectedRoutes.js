//import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useUser } from '../components/common/UserContext';
import { useEffect, useState } from 'react';

// 관리자 전용 라우트
export const AdminProtectedRoute = ({ children }) => {
  const { logout } = useUser(); // UserContext에서 로그아웃 함수 가져오기
  const [isAuthorized, setIsAuthorized] = useState(false); // 권한 확인 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const verifyAccess = async () => {
      if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/';
        return;
      }
      try {
        const decoded = jwtDecode(token); // 토큰 디코드
        const role = decoded.role;

        if (role !== 'ADMIN') {
          alert('관리자만 접근 가능한 페이지입니다.');
          logout(); // 상태와 세션 스토리지 초기화
          window.location.href = '/';
          return;
        }

        setIsAuthorized(true); // 권한 확인 완료
      } catch (error) {
        console.error('토큰 디코드 중 오류 발생:', error);
        alert('유효하지 않은 토큰입니다.');
        window.location.href = '/';
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    verifyAccess();
  }, [token, logout]);

  // 권한 확인 전 로딩 상태를 표시
  if (isLoading) {
    return <div>로딩 중...</div>;
  }


  // 권한 확인 완료 후 자식 컴포넌트 렌더링
  return isAuthorized ? children : null;
};


// 학생 전용 라우트
export const StudentProtectedRoute = ({ children }) => {
  const { logout } = useUser(); // UserContext에서 로그아웃 함수 가져오기
  const [isAuthorized, setIsAuthorized] = useState(false); // 권한 확인 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const verifyAccess = () => {
      if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/';
        return;
      }

      try {
        const decoded = jwtDecode(token); // 토큰 디코드
        const role = decoded.role;

        if (role !== 'STUDENT') {
          alert('학생만 접근 가능한 페이지입니다.');
          logout(); // 상태와 세션 스토리지 초기화
          window.location.href = '/';
          return;
        }

        setIsAuthorized(true); // 권한 확인 완료
      } catch (error) {
        console.error('토큰 디코드 중 오류 발생:', error);
        alert('유효하지 않은 토큰입니다.');
        window.location.href = '/';
      } finally {
        setIsLoading(false); // 로딩 종료
      }
    };

    verifyAccess();
  }, [token, logout]);

  // 권한 확인 전 로딩 상태를 표시
  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  // 권한 확인 완료 후 자식 컴포넌트 렌더링
  return isAuthorized ? children : null;
};