import axios from './axios';

export const getMemberInfo = async () => {
  try {
    const response = await axios.get('/member/info');
    return response.data;
  } catch (error) {
    throw new Error('회원정보 조회 실패');
  }
};

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