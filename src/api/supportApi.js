// src/api/supportApi.js
import axios from './axios';

// 에러 핸들링 함수
const handleSupportError = (error) => {
  if (error.response) {
    const { data } = error.response;
    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  throw error;
};

// 학생용 고객센터 API
export const studentSupportApi = {
  // 문의 등록
  create: async (requestData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/support`, requestData);
      return response.data;
    } catch (error) {
      handleSupportError(error);
    }
  },

  // 내 문의 목록 조회
  getMyList: async (page = 0, size = 20, keyword = '') => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/support`, {
        params: { page, size, keyword }
      });
      return response.data;
    } catch (error) {
      handleSupportError(error);
    }
  },

  // 문의 상세 조회
  getDetail: async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/support/${id}`);
      return response.data;
    } catch (error) {
      handleSupportError(error);
    }
  },

  // 문의 삭제
  delete: async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/support/${id}`);
      return true;
    } catch (error) {
      handleSupportError(error);
    }
  }
};

// 관리자용 고객센터 API
export const adminSupportApi = {
  // 문의 등록 (관리자용)
  create: async (requestData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/admin/support`, requestData);
      return response.data;
    } catch (error) {
      handleSupportError(error);
    }
  },

  // 전체 문의 목록 조회
  getAllList: async (page = 0, size = 20, keyword = '') => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/support`, {
        params: { page, size, keyword }
      });
      return response.data;
    } catch (error) {
      handleSupportError(error);
    }
  },

  // 문의 상세 조회 (관리자용)
  getDetail: async (id) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/support/${id}`);
      return response.data;
    } catch (error) {
      handleSupportError(error);
    }
  },

  // 문의 확인 처리
  confirmSupport: async (id) => {
    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/admin/support/${id}/confirm`);
      return response.data;
    } catch (error) {
      handleSupportError(error);
    }
  },

  // 문의 확인 취소 처리
  unconfirmSupport: async (id) => {
    try {
      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/admin/support/${id}/unconfirm`);
      return response.data;
    } catch (error) {
      handleSupportError(error);
    }
  },

  // 문의 삭제 (관리자용)
  delete: async (id) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/admin/support/${id}`);
      return true;
    } catch (error) {
      handleSupportError(error);
    }
  }
};