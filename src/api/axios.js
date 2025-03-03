// src/api/axios.js
import axios from 'axios';

// 메모리에 저장할 access token
let inMemoryToken = null;

// 디바이스 지문을 위한 변수
let deviceFingerprint = null;

// 자동 로그아웃 타이머
let autoLogoutTimer = null;

// 초기화 함수 - 앱 로드 시 호출
export const initializeTokenSystem = () => {
  generateDeviceFingerprint();

  // 세션 스토리지에서 만료 시간 확인
  const storedExpiry = sessionStorage.getItem('tokenExpiry');

  if (storedExpiry) {
    const expiryTime = parseInt(storedExpiry);
    const now = Date.now();

    // 아직 만료되지 않은 경우 자동 로그아웃 타이머 설정
    if (expiryTime > now) {
      setupAutoLogoutTimer(expiryTime - now);
    } else {
      // 만료된 경우 세션 스토리지 초기화
      sessionStorage.removeItem('tokenExpiry');
    }
  }
};

// 디바이스 지문 생성 함수
const generateDeviceFingerprint = () => {
  const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;

  // 브라우저 플러그인 정보 (제한적으로 사용)
  const plugins = Array.from(navigator.plugins || [])
  .map(p => p.name)
  .join(';');

  // 간단한 지문 생성
  deviceFingerprint = btoa(`${screenInfo}|${timeZone}|${language}|${platform}|${plugins}`);

  return deviceFingerprint;
};

// Access Token을 메모리에서 가져오는 함수
export const getAccessToken = () => inMemoryToken;

// Device Fingerprint 가져오는 함수
export const getDeviceFingerprint = () => deviceFingerprint;

// Access Token을 메모리에 저장하는 함수
export const setAccessToken = (token, expiryTimeOverride) => {
  inMemoryToken = token;

  // 토큰에서 만료 시간 추출하여 자동 로그아웃 설정
  try {
    if (token) {
      let expiryTime;

      // 만료 시간 오버라이드가 제공되면 사용
      if (expiryTimeOverride) {
        expiryTime = expiryTimeOverride;
      } else {
        // 그렇지 않으면 토큰에서 추출
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        expiryTime = tokenData.exp * 1000; // JWT exp는 초 단위
      }

      // 토큰 자체는 저장하지 않고 만료 시간만 sessionStorage에 저장
      sessionStorage.setItem('tokenExpiry', expiryTime.toString());

      // 자동 로그아웃 타이머 설정
      setupAutoLogoutTimer(expiryTime - Date.now());
    }
  } catch (error) {
    console.error('토큰 만료 시간 설정 오류:', error);
  }
};

// 자동 로그아웃 타이머 설정
const setupAutoLogoutTimer = (timeUntilExpiry) => {
  // 기존 타이머 제거
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
  }

  // 토큰 만료 시 자동 로그아웃 (최소 0초)
  if (timeUntilExpiry > 0) {
    autoLogoutTimer = setTimeout(() => {
      console.log('토큰 만료로 인한 자동 로그아웃');
      clearAccessToken();
      // HTTP Only 쿠키 삭제를 위해 로그아웃 API 호출
      logoutAndRedirect();
    }, timeUntilExpiry);
  }
};

// Access Token 제거 함수
export const clearAccessToken = () => {
  inMemoryToken = null;

  // 자동 로그아웃 타이머 제거
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
  }

  // 세션 스토리지에서 토큰 관련 정보 제거
  sessionStorage.removeItem('tokenExpiry');
};

// 로그아웃 및 리디렉션 함수
const logoutAndRedirect = async () => {
  try {
    await axios.post('/member/logout', {}, {
      isHandled: true,
      withCredentials: true
    });

    // 세션 스토리지 초기화
    sessionStorage.removeItem('user');

    // 메인 페이지로 리디렉션
    if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
      alert('세션이 만료되었습니다. 로그인 페이지로 이동합니다.');
      window.location.href = '/';
    }
  } catch (error) {
    console.error('자동 로그아웃 처리 오류:', error);
    window.location.href = '/';
  }
};

// Axios 기본 설정
axios.defaults.baseURL = process.env.REACT_APP_API_URL.replace(/\/+$/, "");
axios.defaults.withCredentials = true;

// 요청 인터셉터: 요청마다 토큰과 디바이스 지문을 헤더에 추가
axios.interceptors.request.use(
  (config) => {
    // 메모리에서 토큰 가져오기
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 디바이스 지문 추가
    if (deviceFingerprint) {
      config.headers['X-Device-Fingerprint'] = deviceFingerprint;
    }

    // CSRF 방지 헤더 추가 (CSRF 토큰이 따로 관리되는 경우 여기에 추가)
    config.headers['X-Requested-With'] = 'XMLHttpRequest';

    // 캐시 방지 헤더
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';

    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 토큰 만료 처리
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isHandled = originalRequest?.isHandled;

    if (isHandled) {
      return Promise.reject(error);
    }

    // 401 에러이고 재시도하지 않은 요청인 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 토큰 갱신 중이면 큐에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axios(originalRequest);
        })
        .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 세션 스토리지에서 기존 만료 시간 가져오기
        const storedExpiry = sessionStorage.getItem('tokenExpiry');
        const originalExpiryTime = storedExpiry ? parseInt(storedExpiry) : null;

        // 토큰 갱신 시도 (/token/refresh 엔드포인트 사용)
        const response = await axios.post('/token/refresh', {},
          {
            isHandled: true,
            withCredentials: true, // 쿠키 전송 보장
            headers: {
              ...originalRequest.headers,
              'Authorization': undefined // 갱신 요청에는 만료된 AT 제외
            }
          }
        );

        const newToken = response.data.accessToken || response.data;

        // 새 토큰 저장 - 기존 만료 시간 유지
        if (originalExpiryTime && originalExpiryTime > Date.now()) {
          setAccessToken(newToken, originalExpiryTime);
        } else {
          setAccessToken(newToken);
        }

        // 대기 중인 요청들 처리
        processQueue(null, newToken);

        // 원래 요청 재시도
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 - 모든 대기 중인 요청 실패 처리
        processQueue(refreshError);

        // 자동 로그아웃 및 로그인 페이지로 리다이렉트
        clearAccessToken();
        logoutAndRedirect();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 그 외 에러 처리
    if (error.response) {
      const { status, data } = error.response;

      if (!isHandled) {
        switch (status) {
          case 403:
            alert(data.message || '접근 권한이 없습니다.');
            break;
          case 404:
            console.error('요청한 URL을 찾을 수 없습니다:', originalRequest.url);
            break;
          case 500:
            console.error('서버 오류가 발생했습니다:', data.message);
            break;
          default:
            // 401은 위에서 처리됨, 다른 에러는 개별 컴포넌트에서 처리
            break;
        }
      }
    } else if (error.request) {
      // 요청은 보냈지만 응답을 받지 못함
      console.error('서버에서 응답이 없습니다:', error.request);
    } else {
      // 요청 설정 중 오류 발생
      console.error('요청 설정 중 오류 발생:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axios;