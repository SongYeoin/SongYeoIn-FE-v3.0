import axios from './axios';

// 학생용 교육일지 API
export const studentJournalApi = {
  // 현재 수강생의 교육과정 조회
  getCurrentEnrollment: () =>
    axios.get('/api/enrollments/my'),

  // 목록 조회
  getList: (courseId, params) =>
    axios.get(`/journals/course/${courseId}`, { params }),

  // 상세 조회
  getDetail: (journalId) =>
    axios.get(`/journals/${journalId}`),

  // 등록
  create: (formData) =>
    axios.post('/journals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // 수정
  update: (journalId, formData) =>
    axios.put(`/journals/${journalId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // 삭제
  delete: (journalId) =>
    axios.delete(`/journals/${journalId}`)
};

// 관리자용 교육일지 API
export const adminJournalApi = {
  // 목록 조회
  getList: (courseId, params) =>
    axios.get(`/admin/journals/course/${courseId}`, { params }),

  // 상세 조회
  getDetail: (journalId) =>
    axios.get(`/admin/journals/${journalId}`),

  // 과정 목록 조회
  getCourses: () =>
    axios.get('/admin/journals/courses'),

  // 파일 다운로드
  downloadFile: (journalId) =>
    axios.get(`/admin/journals/${journalId}/download`, {
      responseType: 'blob'
    })
};