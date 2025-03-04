// src/api/memberApi.js
import axios, { getAccessToken, setAccessToken, getDeviceFingerprint } from './axios';

// 캐싱 변수 추가
let lastValidationResult = null;
let lastValidationTime = 0;
const VALIDATION_CACHE_TIME = 60000; // 60초 캐싱

// 회원 정보 조회
export const getMemberInfo = async () => {
  try {
    const response = await axios.get('/member/info');
    return response.data;
  } catch (error) {
    throw new Error('회원정보 조회 실패');
  }
};

// 회원 정보 업데이트
export const updateMemberInfo = async (data) => {
  try {
    const response = await axios.patch('/member/update', data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      const message = error.response.data.message;
      switch (message) {
        case 'INVALID_PASSWORD':
          throw new Error('현재 비밀번호가 일치하지 않습니다.');
        case 'PASSWORD_MISMATCH':
          throw new Error('새 비밀번호가 일치하지 않습니다.');
        case 'EMAIL_ALREADY_EXISTS':
          throw new Error('이미 사용 중인 이메일입니다.');
        default:
          throw new Error(message || '입력값이 올바르지 않습니다.');
      }
    }
    throw new Error('회원정보 수정 중 오류가 발생했습니다.');
  }
};

// 회원 탈퇴
export const withdrawMember = async () => {
  try {
    await axios.delete('/member/delete');
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('로그인이 필요한 서비스입니다.');
    }
    throw new Error('회원 탈퇴 처리 중 오류가 발생했습니다.');
  }
};

// 토큰 만료 시간 확인
export const checkTokenExpiry = async () => {
  try {
    const response = await axios.get('/token/info');
    return response.data;
  } catch (error) {
    console.error('토큰 만료 시간 확인 실패:', error);
    throw error;
  }
};

// 토큰 유효성 검증 - 캐싱 및 사전 검증
export const validateToken = async () => {
  try {
    const token = getAccessToken();
    if (!token) return { valid: false };

    // 캐싱: 마지막 검증 이후 60초 이내면 재검증 하지 않음
    const now = Date.now();
    if (lastValidationResult && now - lastValidationTime < VALIDATION_CACHE_TIME) {
      return lastValidationResult;
    }

    // JWT 자체에서 직접 정보 확인 (API 호출 없이)
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = tokenData.exp * 1000;

      // 만료까지 2분 이상 남은 경우 API 호출 없이 유효하다고 판단
      if (expiryTime - now > 120000) {
        const result = {
          valid: true,
          secondsRemaining: Math.floor((expiryTime - now) / 1000)
        };

        // 결과 캐싱
        lastValidationResult = result;
        lastValidationTime = now;

        return result;
      }
    } catch (err) {
      // 토큰 파싱 실패 시 서버 검증으로 진행
      console.error('토큰 사전 검증 실패:', err);
    }

    // 서버 검증 (API 호출)
    const response = await axios.post('/token/validate', {}, {
      isHandled: true
    });

    // 결과 캐싱
    lastValidationResult = response.data;
    lastValidationTime = now;

    return response.data;
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    return { valid: false };
  }
};

// 토큰 갱신 (연장)
export const refreshToken = async () => {
  try {
    // 디바이스 지문 추가
    const deviceFingerprint = getDeviceFingerprint();
    const headers = {};

    if (deviceFingerprint) {
      headers['X-Device-Fingerprint'] = deviceFingerprint;
    }

    const response = await axios.post('/token/refresh', {}, {
      headers,
      withCredentials: true // 쿠키 전송 보장
    });

    const newToken = response.data.accessToken || response.data;

    // 캐싱 무효화 - 토큰이 갱신되었으므로
    lastValidationResult = null;
    lastValidationTime = 0;

    return newToken;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    throw error;
  }
};

// 자동 토큰 갱신 (새로고침 시)
export const refreshSilently = async () => {
  try {
    // 세션 스토리지에서 기존 만료 시간 가져오기
    const storedExpiry = sessionStorage.getItem('tokenExpiry');
    const originalExpiryTime = storedExpiry ? parseInt(storedExpiry) : null;

    // 이미 메모리에 유효한 토큰이 있으면 갱신하지 않음
    const existingToken = getAccessToken();
    if (existingToken) {
      // 로컬에서 토큰 유효성 먼저 확인 (불필요한 API 호출 방지)
      try {
        const tokenData = JSON.parse(atob(existingToken.split('.')[1]));
        const expiryTime = tokenData.exp * 1000;
        const now = Date.now();

        // 만료까지 2분 이상 남았으면 그대로 사용
        if (expiryTime - now > 120000) {
          // 기존 만료 시간 유지
          if (originalExpiryTime && originalExpiryTime > now) {
            setAccessToken(existingToken, originalExpiryTime);
          }

          return true;
        }
      } catch (e) {
        console.error('토큰 사전 검증 오류:', e);
        // 오류 발생 시 서버 검증으로 진행
      }

      // API로 토큰 유효성 확인
      const validation = await validateToken();

      if (validation.valid) {
        // 토큰이 유효하면 기존 만료 시간 유지
        if (originalExpiryTime && originalExpiryTime > Date.now()) {
          setAccessToken(existingToken, originalExpiryTime);
          return true;
        }

        // 만료 임박(30초 이내)한 경우에만 갱신
        if (validation.secondsRemaining > 30) {
          return true; // 이미 유효한 토큰이 있음
        }
      }
    }

    // Refresh Token으로 새 Access Token 발급 시도
    const newToken = await refreshToken();

    if (newToken) {
      // 새 토큰 저장 (기존 만료 시간 유지)
      if (originalExpiryTime && originalExpiryTime > Date.now()) {
        setAccessToken(newToken, originalExpiryTime);
      } else {
        setAccessToken(newToken);
      }

      // 캐싱 무효화 - 토큰이 갱신되었으므로
      lastValidationResult = null;
      lastValidationTime = 0;

      return true;
    }

    return false;
  } catch (error) {
    console.error('자동 토큰 갱신 실패:', error);
    return false;
  }
};

// 로그인 함수
export const login = async (username, password, role = 'student') => {
  try {
    const endpoint = role === 'student'
      ? '/member/login'
      : '/admin/member/login';

    // 디바이스 지문 추가
    const deviceFingerprint = getDeviceFingerprint();
    const headers = {};

    if (deviceFingerprint) {
      headers['X-Device-Fingerprint'] = deviceFingerprint;
    }

    const response = await axios.post(
      endpoint,
      { username, password },
      {
        headers,
        withCredentials: true, // HTTP-only 쿠키 받기 위해 필요
      }
    );

    // 캐싱 무효화 - 새로운 로그인이므로
    lastValidationResult = null;
    lastValidationTime = 0;

    return response.data;
  } catch (error) {
    console.error('로그인 오류:', error);

    if (error.response) {
      const { code, message } = error.response.data;
      if (code === 'USER_003') {
        throw new Error('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
      } else if (code === 'COMMON_001') {
        throw new Error('아이디나 비밀번호를 입력해주세요.');
      } else {
        throw new Error(message || '로그인 중 오류가 발생했습니다.');
      }
    } else {
      throw new Error('서버와의 통신에 실패했습니다. 다시 시도해주세요.');
    }
  }
};

// 로그아웃 함수
export const logout = async () => {
  try {
    await axios.post('/member/logout', {}, {
      withCredentials: true // 쿠키 전송 보장
    });

    // 캐싱 무효화 - 로그아웃되었으므로
    lastValidationResult = null;
    lastValidationTime = 0;

    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};