// src/api/ProtectedRoutes.js
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseJwt } from '../components/common/JwtDecoding';
import { useUser } from '../components/common/UserContext';
import { getAccessToken } from './axios';
import { refreshSilently } from './memberApi';

// 관리자 전용 라우트
export const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { logout, refreshSilently: contextRefreshSilently } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasAlerted = useRef(false);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // 메모리에서 토큰 가져오기
        let token = getAccessToken();

        // 토큰이 없으면 자동 갱신 시도
        if (!token) {
          const success = await refreshSilently();
          if (!success) {
            if (!hasAlerted.current) {
              alert('로그인이 필요합니다.');
              hasAlerted.current = true;
            }
            navigate('/', { replace: true });
            return;
          }
          token = getAccessToken(); // 갱신된 토큰 가져오기
        }

        // 토큰 디코딩
        const decoded = parseJwt(token);
        const role = decoded.role;

        if (role !== 'ADMIN') {
          if (!hasAlerted.current) {
            alert('관리자만 접근 가능한 페이지입니다.');
            hasAlerted.current = true;
          }
          logout();
          navigate('/', { replace: true });
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('토큰 검증 오류:', error);
        if (!hasAlerted.current) {
          alert('인증 오류가 발생했습니다. 다시 로그인해 주세요.');
          hasAlerted.current = true;
        }
        logout();
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [logout, navigate, contextRefreshSilently]);

  // 권한 확인 전 로딩 상태를 표시
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1e2d1f]"></div>
      <p className="ml-4 text-lg text-[#1e2d1f]">로딩 중...</p>
    </div>;
  }

  // 권한 확인 완료 후 자식 컴포넌트 렌더링
  return isAuthorized ? children : null;
};

// 학생 전용 라우트
export const StudentProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { logout, refreshSilently: contextRefreshSilently } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasAlerted = useRef(false);

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // 메모리에서 토큰 가져오기
        let token = getAccessToken();

        // 토큰이 없으면 자동 갱신 시도
        if (!token) {
          const success = await refreshSilently();
          if (!success) {
            if (!hasAlerted.current) {
              alert('로그인이 필요합니다.');
              hasAlerted.current = true;
            }
            navigate('/', { replace: true });
            return;
          }
          token = getAccessToken(); // 갱신된 토큰 가져오기
        }

        // 토큰 디코딩
        const decoded = parseJwt(token);
        const role = decoded?.role;

        if (role !== 'STUDENT') {
          if (!hasAlerted.current) {
            alert('학생만 접근 가능한 페이지입니다.');
            hasAlerted.current = true;
          }
          logout();
          navigate('/', { replace: true });
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('토큰 검증 오류:', error);
        if (!hasAlerted.current) {
          alert('인증 오류가 발생했습니다. 다시 로그인해 주세요.');
          hasAlerted.current = true;
        }
        logout();
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [logout, navigate, contextRefreshSilently]);

  // 권한 확인 전 로딩 상태를 표시
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1e2d1f]"></div>
      <p className="ml-4 text-lg text-[#1e2d1f]">로딩 중...</p>
    </div>;
  }

  // 권한 확인 완료 후 자식 컴포넌트 렌더링
  return isAuthorized ? children : null;
};
