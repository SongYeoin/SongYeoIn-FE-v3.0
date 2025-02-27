// src/api/memberApi.js
import axios, { getAccessToken, setAccessToken, getDeviceFingerprint } from './axios';

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
    return newToken;
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    throw error;
  }
};

// 자동 토큰 갱신 (새로고침 시)
export const refreshSilently = async () => {
  try {
    // 이미 메모리에 유효한 토큰이 있으면 갱신하지 않음
    const existingToken = getAccessToken();
    if (existingToken) {
      try {
        // 토큰 유효성 확인
        const tokenInfo = await checkTokenExpiry();

        // 만료 임박(30초 이내)한 경우에만 갱신
        if (tokenInfo.secondsRemaining > 30) {
          return true; // 이미 유효한 토큰이 있음
        }
      } catch (error) {
        // 토큰이 유효하지 않음, 갱신 시도
        console.log('기존 토큰 만료, 갱신 시도');
      }
    }

    // Refresh Token으로 새 Access Token 발급 시도
    const newToken = await refreshToken();

    if (newToken) {
      // 새 토큰 저장
      setAccessToken(newToken);
      return newToken;
    }

    return null;
  } catch (error) {
    console.error('자동 토큰 갱신 실패:', error);
    return null;
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
    return true;
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};
