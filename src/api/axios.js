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
    if (error.response && error.response.status === 403) {
      // 권한 부족 메시지 처리
      alert(error.response.data.error); // "권한이 없습니다. 이 페이지는 관리자만 접근 가능합니다."
    } else if (error.response && error.response.status === 401) {
      // 인증 실패 메시지 처리
      alert(error.response.data.error); // "로그인이 필요합니다."
    } else {
      alert('오류가 발생했습니다. 다시 시도하세요.');
    }
    if (!isRedirecting) {
      const { logout } = useUser(); // UserContext에서 로그아웃 함수 가져오기
      isRedirecting = true; // 리다이렉션 플래그 설정
      logout(); // 상태와 세션 스토리지 초기화
      window.location.href = '/'; // 로그인 페이지로 리다이렉트
    }

    return Promise.reject(error);
  }
);


export default axios;
