export const validateEmail = (email) => {
  const regex = /^[A-Za-z0-9+_.-]+@(.+)$/;
  if (!email) return '이메일을 입력해주세요.';
  if (!regex.test(email)) return '올바른 이메일 형식이 아닙니다.';
  return '';
};

export const validatePassword = (password) => {
  const regex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,16}$/;
  if (!password) return '비밀번호를 입력해주세요.';
  if (!regex.test(password)) {
    return '비밀번호는 8~16자의 영문자, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다.';
  }
  return '';
};