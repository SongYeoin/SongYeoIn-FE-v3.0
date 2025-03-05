import axios from './axios';

const handleJournalError = (error) => {
  if (error.response) {
    const { data } = error.response;

    // 파일 관련 에러
    if (data.code === 'FILE_EXTENSION_MISMATCH') {
      throw new Error('교육일지는 HWP, DOCX, DOC 형식만 첨부 가능합니다.');
    }

    // 교육일지 관련 에러들
    if (data.code.startsWith('JOURNAL_')) {
      throw new Error(data.message);
    }

    throw new Error(data.message || '요청 처리 중 오류가 발생했습니다.');
  }
  throw error;
};

// 학생용 교육일지 API
export const studentJournalApi = {
  // 현재 수강생의 교육과정 조회
  getCurrentEnrollment: () =>
    axios.get(`${process.env.REACT_APP_API_URL}/enrollments/my`),

  // 목록 조회
  getList: (courseId, params) =>
    axios.get(`${process.env.REACT_APP_API_URL}/journals/course/${courseId}`, { params }),

  // 상세 조회
  getDetail: (journalId) =>
    axios.get(`${process.env.REACT_APP_API_URL}/journals/${journalId}`),

  // 등록
  create: async (formData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/journals`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message;
        throw new Error(errorMessage);  // 백엔드에서 보낸 에러 메시지를 전달
      }
      throw error;  // 그 외의 에러는 그대로 전달
    }
  },

  // 수정
  update: async (journalId, formData) => {
    try {
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/journals/${journalId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response;
    } catch (error) {
      handleJournalError(error);
    }
  },

  // 삭제
  delete: (journalId) =>
    axios.delete(`${process.env.REACT_APP_API_URL}/journals/${journalId}`),

  // 파일 다운로드 API 추가
  downloadFile: async (journalId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/journals/${journalId}/download`, {
        responseType: 'blob',
        validateStatus: function (status) {
          return status < 500;
        }
      });

      // 성공적인 응답인 경우만 반환
      if (response.status === 200) {
        return response;
      }

      // 에러 응답 처리
      if (response.data instanceof Blob) {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message); // 백엔드 에러 메시지 사용
      }

    } catch (error) {
      // error.response가 있고 데이터가 Blob인 경우
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message); // 백엔드 에러 메시지 사용
      }
      // 그 외의 에러는 원본 에러 메시지 그대로 전달
      throw error;
    }
  }
};

// 관리자용 교육일지 API
export const adminJournalApi = {
  // 목록 조회
  getList: (courseId, params) =>
    axios.get(`${process.env.REACT_APP_API_URL}/admin/journals/course/${courseId}`, { params }),

  // 상세 조회
  getDetail: (journalId) =>
    axios.get(`${process.env.REACT_APP_API_URL}/admin/journals/${journalId}`),

  // 과정 목록 조회
  getCourses: () =>
    axios.get(`${process.env.REACT_APP_API_URL}/enrollments/my`),

  // 파일 다운로드 API
  downloadFile: async (journalId) => {
      try {
          const response = await axios.get(
              `${process.env.REACT_APP_API_URL}/admin/journals/${journalId}/download`,
              {
                  responseType: 'blob',
                  validateStatus: null, // 모든 상태 코드를 처리하기 위해 제거
                  headers: {
                      'Accept': 'application/json, application/octet-stream'
                  }
              }
          );

          // 성공적인 응답이 아닌 경우 에러 처리
          if (response.status !== 200) {
              const text = await response.data.text();
              const errorData = JSON.parse(text);
              throw new Error(errorData.message);
          }

          return response;
      } catch (error) {
          if (error.response?.data instanceof Blob) {
              const text = await error.response.data.text();
              const errorData = JSON.parse(text);
              throw new Error(errorData.message);
          }
          throw error;
      }
  },

  // 일괄 다운로드
  downloadZip: async (journalIds) => {
      try {
          const response = await axios.post(
              `${process.env.REACT_APP_API_URL}/admin/journals/zip-download`,
              journalIds,
              {
                  responseType: 'blob',
                  validateStatus: null, // 모든 상태 코드 허용
                  headers: {
                      'Accept': 'application/json, application/octet-stream'
                  }
              }
          );

          // 성공적인 응답이 아닌 경우 에러 처리
          if (response.status !== 200) {
              const text = await response.data.text();
              const errorData = JSON.parse(text);
              throw new Error(errorData.message || '파일 다운로드에 실패했습니다.');
          }

          return response;
      } catch (error) {
          if (error.response?.data instanceof Blob) {
              const text = await error.response.data.text();
              const errorData = JSON.parse(text);
              throw new Error(errorData.message || '파일 다운로드에 실패했습니다.');
          }
          throw error;
      }
  },

  checkMissingFiles: async (journalIds) => {
      try {
          const response = await axios.post(
              `${process.env.REACT_APP_API_URL}/admin/journals/check-missing-files`,
              journalIds
          );
          return response;
      } catch (error) {
          console.error('파일 존재 여부 확인 실패:', error);
          throw error;
      }
  }

};