// src/api/axios.js
import axios from 'axios';
import { useUser } from '../components/common/UserContext';

// Axios 기본 설정
axios.defaults.baseURL = process.env.REACT_APP_API_URL.replace(/\/+$/, "");

// 요청 인터셉터: 요청마다 토큰을 헤더에 추가
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); // sessionStorage에서 토큰 가져오기
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 토큰 만료 처리
let isRedirecting = false; // 중복 리다이렉션 방지 플래그

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isHandled = error.config?.isHandled;

    if (isHandled) {
      // 예외가 개별적으로 처리된 경우 인터셉터에서 추가 작업하지 않음
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          alert(data.message || '인증이 필요합니다. 로그인 페이지로 이동합니다.');
          if (!isRedirecting) {
            const { logout } = useUser(); // UserContext에서 로그아웃 함수 가져오기
            isRedirecting = true; // 리다이렉션 플래그 설정
            logout(); // 상태와 세션 스토리지 초기화
            window.location.href = '/'; // 로그인 페이지로 리다이렉트
          }
          break;

        case 403:
          alert(data.message || '접근 권한이 없습니다.');
          break;

        case 404:
          alert(data.message || '요청한 URL을 찾을 수 없습니다.');
          break;

        default:
          // 공통 처리되지 않은 에러
          alert(data.message || '알 수 없는 오류가 발생했습니다.');
      }
    } else {
      // 네트워크 오류 처리
      alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인하세요.');
    }
    return Promise.reject(error);
  }
);

export default axios;
