import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from 'react';
import { parseJwt } from './JwtDecoding';
import axios, {
  getAccessToken,
  clearAccessToken,
  setAccessToken,
  initializeTokenSystem,
} from '../../api/axios';
import {
  refreshToken,
  refreshSilently as apiRefreshSilently,
  validateToken,
} from '../../api/memberApi';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [tokenRemainingSeconds, setTokenRemainingSeconds] = useState(null);
  const [isExtendingToken, setIsExtendingToken] = useState(false);
  const [localRemainingSeconds, setLocalRemainingSeconds] = useState(null);

  // 앱 초기화 시 토큰 시스템 초기화
  useEffect(() => {
    initializeTokenSystem();
  }, []);

  // 토큰으로부터 사용자 정보 파싱
  const parseUserFromToken = useCallback((token) => {
    try {
      if (!token) {
        return null;
      }

      const decodedUser = parseJwt(token);

      // 세션 스토리지에서 기존 만료 시간 가져오기
      const storedExpiry = sessionStorage.getItem('tokenExpiry');
      let expiryTime;

      if (storedExpiry) {
        expiryTime = parseInt(storedExpiry);
      } else {
        // 저장된 만료 시간이 없으면 토큰에서 추출
        expiryTime = decodedUser.exp * 1000;
      }

      setTokenExpiry(new Date(expiryTime));

      const now = new Date().getTime();
      const remainingSeconds = Math.floor((expiryTime - now) / 1000);
      setTokenRemainingSeconds(remainingSeconds > 0 ? remainingSeconds : 0);
      setLocalRemainingSeconds(remainingSeconds > 0 ? remainingSeconds : 0);

      return decodedUser;
    } catch (error) {
      console.error('JWT 디코딩 오류:', error);
      return null;
    }
  }, []);

  // Access Token 만료 시간 주기적 체크 및 자동 로그아웃 - 개선
  useEffect(() => {
    if (!tokenExpiry) {
      return;
    }

    // UI 업데이트용 타이머 (1초 간격, API 호출 없음)
    const uiUpdateTimer = setInterval(() => {
      setLocalRemainingSeconds(prev => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    // 실제 토큰 검증용 타이머 (10초 간격)
    const tokenCheckInterval = setInterval(() => {
      const now = new Date().getTime();
      const expiryTime = tokenExpiry.getTime();
      const remainingSeconds = Math.floor((expiryTime - now) / 1000);

      // tokenRemainingSeconds는 전역 상태로 유지
      setTokenRemainingSeconds(remainingSeconds > 0 ? remainingSeconds : 0);

      // 토큰이 만료되었다면 자동 로그아웃 및 메인 페이지로 이동
      if (remainingSeconds <= 0) {
        clearInterval(uiUpdateTimer);
        clearInterval(tokenCheckInterval);
        logout();

        // 중복 알림 방지 로직 추가
        const lastAlertTime = parseInt(
          sessionStorage.getItem('lastLoginAlertTime') || '0');

        if (now - lastAlertTime > 60000 &&
          !window.location.pathname.includes('/login') &&
          window.location.pathname !== '/') {
          sessionStorage.setItem('lastLoginAlertTime', now.toString());
          alert('세션이 만료되었습니다. 메인 페이지로 이동합니다.');
          window.location.href = '/';
        }
      }
    }, 10000); // 1초에서 10초로 변경

    return () => {
      clearInterval(uiUpdateTimer);
      clearInterval(tokenCheckInterval);
    };
  }, [tokenExpiry]);

  // 초기 로드 시 사용자 정보 설정 및 토큰 자동 갱신 - 최적화
  useEffect(() => {
    const initializeUser = async () => {
      try {
        setLoading(true);
        // 메모리에서 토큰 가져오기
        const token = getAccessToken();

        if (!token) {
          // 토큰이 없으면 자동 갱신 시도
          try {
            await refreshSilently();
          } catch (error) {
            // 갱신 실패 - 로그인 필요 상태
            setUser(null);
            setLoading(false);
            return;
          }
        } else {
          // 토큰이 있으면 로컬에서 먼저 검증
          try {
            const decodedUser = parseUserFromToken(token);
            const expiryTime = decodedUser.exp * 1000;
            const now = Date.now();

            // 만료까지 2분 이상 남았으면 사용자 정보 설정 후 종료
            if (expiryTime - now > 120000) {
              setUser(decodedUser);
              sessionStorage.setItem('user', JSON.stringify(decodedUser));
              setLoading(false);
              return;
            }

            // 만료 임박한 경우에만 서버 검증
            const validation = await validateToken();
            if (validation.valid) {
              updateUserFromToken(token);
            } else {
              await refreshSilently();
            }
          } catch (e) {
            console.error('토큰 파싱 오류:', e);
            // 파싱 실패 시 서버에 검증 요청
            const validation = await validateToken();
            if (validation.valid) {
              updateUserFromToken(token);
            } else {
              await refreshSilently();
            }
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('사용자 초기화 오류:', error);
        setLoading(false);
      }
    };

    initializeUser();
  }, [parseUserFromToken]);

  // 새 토큰에서 사용자 정보 업데이트
  const updateUserFromToken = (token) => {
    const decodedUser = parseUserFromToken(token);
    if (decodedUser) {
      setUser(decodedUser);
      sessionStorage.setItem('user', JSON.stringify(decodedUser));
    }
  };

  // 무음 갱신 - 새로고침 시 자동 갱신
  const refreshSilently = async () => {
    const success = await apiRefreshSilently();
    if (success) {
      const token = getAccessToken();
      if (token) {
        updateUserFromToken(token);
      }
    }
    return success;
  };

  // 토큰 연장 함수
  const extendToken = async () => {
    if (isExtendingToken) {
      return false;
    }

    setIsExtendingToken(true);
    try {
      const newToken = await refreshToken();
      if (!newToken) {
        throw new Error('토큰 연장 실패');
      }

      // 연장 버튼 클릭 시에는 기존 만료 시간을 무시하고 새 토큰의 만료 시간 사용
      setAccessToken(newToken);
      updateUserFromToken(newToken);

      return true;
    } catch (error) {
      console.error('토큰 연장 실패:', error);
      return false;
    } finally {
      setIsExtendingToken(false);
    }
  };

  // 로그아웃 메서드
  const logout = async () => {
    try {
      // 백엔드 로그아웃 API 호출
      await axios.post(`${process.env.REACT_APP_API_URL}/member/logout`);
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      // 사용자 상태 초기화
      setUser(null);
      setTokenExpiry(null);
      setTokenRemainingSeconds(null);
      setLocalRemainingSeconds(null);

      // 메모리에서 액세스 토큰 제거
      clearAccessToken();

      // 세션 스토리지 정리
      sessionStorage.removeItem('user');

      // 리디렉션
      window.location.href = '/';
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
        tokenRemainingSeconds,
        localRemainingSeconds, // UI 표시용 타이머 상태 추가
        tokenExpiry,
        extendToken,
        isExtendingToken,
        refreshSilently,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);