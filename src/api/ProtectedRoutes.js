// src/api/ProtectedRoutes.js
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseJwt } from '../components/common/JwtDecoding';
import { useUser } from '../components/common/UserContext';
import { getAccessToken } from './axios';
import { refreshSilently, validateToken } from './memberApi';

// 관리자 전용 라우트
export const AdminProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { logout, refreshSilently: contextRefreshSilently } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasAlerted = useRef(false);

  // 마지막 검증 시간을 저장하는 ref 추가
  const lastVerificationTime = useRef(0);
  const VERIFICATION_INTERVAL = 60000; // 30초에서 60초로 확장

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // 이미 인증이 완료된 경우 스킵
        if (isAuthorized && !isLoading) {
          return;
        }

        // 일정 시간 내에 이미 검증된 경우 중복 검증 방지
        const now = Date.now();
        if (now - lastVerificationTime.current < VERIFICATION_INTERVAL) {
          // 이미 최근에 검증되었다면 로딩 상태만 해제
          if (isLoading) {
            setIsLoading(false);
          }
          return;
        }

        lastVerificationTime.current = now;

        // 토큰이 없으면 바로 리디렉션
        let token = getAccessToken();
        if (!token) {
          const success = await refreshSilently();
          if (!success) {
            // 중복 알림 방지 로직
            const lastAlertTime = parseInt(
              sessionStorage.getItem('lastLoginAlertTime') || '0');

            if (now - lastAlertTime > 60000 && !hasAlerted.current) {
              sessionStorage.setItem('lastLoginAlertTime', now.toString());
              alert('로그인이 필요합니다.');
              hasAlerted.current = true;
            }

            navigate('/', { replace: true });
            return;
          }
          token = getAccessToken();
        }

        // JWT에서 역할 정보 직접 확인 (API 호출 없이)
        try {
          const decoded = parseJwt(token);

          // 만료 시간 확인
          const expiryTime = decoded.exp * 1000;
          if (expiryTime <= now) {
            // 토큰 만료된 경우 갱신 시도
            const success = await refreshSilently();
            if (!success) {
              if (!hasAlerted.current) {
                const lastAlertTime = parseInt(
                  sessionStorage.getItem('lastLoginAlertTime') || '0');
                if (now - lastAlertTime > 60000) {
                  sessionStorage.setItem('lastLoginAlertTime', now.toString());
                  alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
                  hasAlerted.current = true;
                }
              }
              logout();
              navigate('/', { replace: true });
              return;
            }

            // 갱신 후 새 토큰에서 정보 다시 확인
            token = getAccessToken();
            const refreshedDecoded = parseJwt(token);
            if (refreshedDecoded.role !== 'ADMIN') {
              if (!hasAlerted.current) {
                alert('관리자만 접근 가능한 페이지입니다.');
                hasAlerted.current = true;
              }
              logout();
              navigate('/', { replace: true });
              return;
            }
          } else {
            // 토큰이 유효한 경우 역할 확인
            if (decoded.role !== 'ADMIN') {
              if (!hasAlerted.current) {
                alert('관리자만 접근 가능한 페이지입니다.');
                hasAlerted.current = true;
              }
              logout();
              navigate('/', { replace: true });
              return;
            }
          }

          // 토큰이 유효하고 권한도 맞음
          setIsAuthorized(true);
        } catch (parseError) {
          console.error('토큰 파싱 오류:', parseError);

          // 파싱 실패 시 서버에 검증 요청
          const validation = await validateToken();
          if (!validation.valid) {
            const success = await refreshSilently();
            if (!success) {
              if (!hasAlerted.current) {
                const lastAlertTime = parseInt(
                  sessionStorage.getItem('lastLoginAlertTime') || '0');
                if (now - lastAlertTime > 60000) {
                  sessionStorage.setItem('lastLoginAlertTime', now.toString());
                  alert('인증에 실패했습니다. 다시 로그인해 주세요.');
                  hasAlerted.current = true;
                }
              }
              logout();
              navigate('/', { replace: true });
              return;
            }
          }

          // 서버 검증에 성공하면 권한 확인
          try {
            const newToken = getAccessToken();
            const newDecoded = parseJwt(newToken);
            if (newDecoded.role !== 'ADMIN') {
              if (!hasAlerted.current) {
                alert('관리자만 접근 가능한 페이지입니다.');
                hasAlerted.current = true;
              }
              logout();
              navigate('/', { replace: true });
              return;
            }
            setIsAuthorized(true);
          } catch (e) {
            // 최종 파싱 실패 시 로그아웃
            if (!hasAlerted.current) {
              alert('인증 오류가 발생했습니다. 다시 로그인해 주세요.');
              hasAlerted.current = true;
            }
            logout();
            navigate('/', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('토큰 검증 오류:', error);
        if (!hasAlerted.current) {
          const lastAlertTime = parseInt(
            sessionStorage.getItem('lastLoginAlertTime') || '0');
          const now = Date.now();
          if (now - lastAlertTime > 60000) {
            sessionStorage.setItem('lastLoginAlertTime', now.toString());
            alert('인증 오류가 발생했습니다. 다시 로그인해 주세요.');
            hasAlerted.current = true;
          }
        }
        logout();
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [logout, navigate, contextRefreshSilently, isLoading]);

  // 권한 확인 전 로딩 상태를 표시
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div
        className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1e2d1f]"></div>
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

  // 마지막 검증 시간을 저장하는 ref 추가
  const lastVerificationTime = useRef(0);
  const VERIFICATION_INTERVAL = 60000; // 30초에서 60초로 확장

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        // 이미 인증이 완료된 경우 스킵
        if (isAuthorized && !isLoading) {
          return;
        }

        // 일정 시간 내에 이미 검증된 경우 중복 검증 방지
        const now = Date.now();
        if (now - lastVerificationTime.current < VERIFICATION_INTERVAL) {
          // 이미 최근에 검증되었다면 로딩 상태만 해제
          if (isLoading) {
            setIsLoading(false);
          }
          return;
        }

        lastVerificationTime.current = now;

        // 토큰이 없으면 바로 리디렉션
        let token = getAccessToken();
        if (!token) {
          const success = await refreshSilently();
          if (!success) {
            // 중복 알림 방지 로직
            const lastAlertTime = parseInt(
              sessionStorage.getItem('lastLoginAlertTime') || '0');

            if (now - lastAlertTime > 60000 && !hasAlerted.current) {
              sessionStorage.setItem('lastLoginAlertTime', now.toString());
              alert('로그인이 필요합니다.');
              hasAlerted.current = true;
            }

            navigate('/', { replace: true });
            return;
          }
          token = getAccessToken();
        }

        // JWT에서 역할 정보 직접 확인 (API 호출 없이)
        try {
          const decoded = parseJwt(token);

          // 만료 시간 확인
          const expiryTime = decoded.exp * 1000;
          if (expiryTime <= now) {
            // 토큰 만료된 경우 갱신 시도
            const success = await refreshSilently();
            if (!success) {
              if (!hasAlerted.current) {
                const lastAlertTime = parseInt(
                  sessionStorage.getItem('lastLoginAlertTime') || '0');
                if (now - lastAlertTime > 60000) {
                  sessionStorage.setItem('lastLoginAlertTime', now.toString());
                  alert('세션이 만료되었습니다. 다시 로그인해 주세요.');
                  hasAlerted.current = true;
                }
              }
              logout();
              navigate('/', { replace: true });
              return;
            }

            // 갱신 후 새 토큰에서 정보 다시 확인
            token = getAccessToken();
            const refreshedDecoded = parseJwt(token);
            if (refreshedDecoded.role !== 'STUDENT') {
              if (!hasAlerted.current) {
                alert('학생만 접근 가능한 페이지입니다.');
                hasAlerted.current = true;
              }
              logout();
              navigate('/', { replace: true });
              return;
            }
          } else {
            // 토큰이 유효한 경우 역할 확인
            if (decoded.role !== 'STUDENT') {
              if (!hasAlerted.current) {
                alert('학생만 접근 가능한 페이지입니다.');
                hasAlerted.current = true;
              }
              logout();
              navigate('/', { replace: true });
              return;
            }
          }

          // 토큰이 유효하고 권한도 맞음
          setIsAuthorized(true);
        } catch (parseError) {
          console.error('토큰 파싱 오류:', parseError);

          // 파싱 실패 시 서버에 검증 요청
          const validation = await validateToken();
          if (!validation.valid) {
            const success = await refreshSilently();
            if (!success) {
              if (!hasAlerted.current) {
                const lastAlertTime = parseInt(
                  sessionStorage.getItem('lastLoginAlertTime') || '0');
                if (now - lastAlertTime > 60000) {
                  sessionStorage.setItem('lastLoginAlertTime', now.toString());
                  alert('인증에 실패했습니다. 다시 로그인해 주세요.');
                  hasAlerted.current = true;
                }
              }
              logout();
              navigate('/', { replace: true });
              return;
            }
          }

          // 서버 검증에 성공하면 권한 확인
          try {
            const newToken = getAccessToken();
            const newDecoded = parseJwt(newToken);
            if (newDecoded.role !== 'STUDENT') {
              if (!hasAlerted.current) {
                alert('학생만 접근 가능한 페이지입니다.');
                hasAlerted.current = true;
              }
              logout();
              navigate('/', { replace: true });
              return;
            }
            setIsAuthorized(true);
          } catch (e) {
            // 최종 파싱 실패 시 로그아웃
            if (!hasAlerted.current) {
              alert('인증 오류가 발생했습니다. 다시 로그인해 주세요.');
              hasAlerted.current = true;
            }
            logout();
            navigate('/', { replace: true });
            return;
          }
        }
      } catch (error) {
        console.error('토큰 검증 오류:', error);
        if (!hasAlerted.current) {
          const lastAlertTime = parseInt(
            sessionStorage.getItem('lastLoginAlertTime') || '0');
          const now = Date.now();
          if (now - lastAlertTime > 60000) {
            sessionStorage.setItem('lastLoginAlertTime', now.toString());
            alert('인증 오류가 발생했습니다. 다시 로그인해 주세요.');
            hasAlerted.current = true;
          }
        }
        logout();
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    verifyAccess();
  }, [logout, navigate, contextRefreshSilently, isLoading]);

  // 권한 확인 전 로딩 상태를 표시
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div
        className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#1e2d1f]"></div>
      <p className="ml-4 text-lg text-[#1e2d1f]">로딩 중...</p>
    </div>;
  }

  // 권한 확인 완료 후 자식 컴포넌트 렌더링
  return isAuthorized ? children : null;
};