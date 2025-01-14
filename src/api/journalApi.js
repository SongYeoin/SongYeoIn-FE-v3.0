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
    axios.delete(`${process.env.REACT_APP_API_URL}/journals/${journalId}`)
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

  // 파일 다운로드
  downloadFile: (journalId) =>
    axios.get(`${process.env.REACT_APP_API_URL}/admin/journals/${journalId}/download`, {
      responseType: 'blob'
    })
};