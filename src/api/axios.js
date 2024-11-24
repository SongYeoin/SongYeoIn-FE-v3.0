// src/api/axios.js
import axios from 'axios';

// Axios 기본 설정
axios.defaults.baseURL = process.env.REACT_APP_API_URL;

// 요청 인터셉터: 요청마다 토큰을 헤더에 추가
axios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token'); // sessionStorage에서 토큰 가져오기
    console.log('Token being sent:', token); // 토큰 확인
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 토큰 만료 처리
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 토큰 만료 처리
      alert('로그인이 만료되었습니다. 다시 로그인하세요.');
      sessionStorage.removeItem('token'); // 토큰 삭제
      window.location.href = '/'; // 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);

export default axios;
