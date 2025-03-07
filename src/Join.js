import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useResponsive } from 'components/common/ResponsiveWrapper';

export const Join = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthday: '',
    email: '',
    role: 'STUDENT',
  });

  const [errors, setErrors] = useState({});

  const getResponsiveStyle = () => {
    if (isMobile) {
      return {
        container: 'w-[90%] min-h-[400px]',
        inputContainer: 'w-[90%]',
        title: 'text-2xl',
        input: 'text-sm',
        button: 'text-lg',
      };
    }
    if (isTablet) {
      return {
        container: 'w-[70%] min-h-[450px]',
        inputContainer: 'w-[70%]',
        title: 'text-3xl',
        input: 'text-base',
        button: 'text-xl',
      };
    }
    return {
      container: 'w-[600px] min-h-[300px]',
      inputContainer: 'w-[400px]',
      title: 'text-4xl',
      input: 'text-lg',
      button: 'text-2xl',
    };
  };

  const styles = getResponsiveStyle();

  // 필드 유효성 검사 규칙 정의
  const validationRules = {
    username: {
      required: '아이디는 필수 입력 항목입니다.',
      pattern: {
        regex: /^(?=.*[a-z])[a-z0-9_]{6,12}$/,
        message: '아이디는 6~12자의 영문 소문자를 포함하고, 숫자, 특수기호(_)만 사용 가능합니다.'
      }
    },
    password: {
      required: '비밀번호는 필수 입력 항목입니다.',
      pattern: {
        regex: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,16}$/,
        message: '비밀번호는 8~16자의 영문자, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다.'
      }
    },
    confirmPassword: {
      required: '비밀번호 확인은 필수 입력 항목입니다.',
      custom: (value) => value === formData.password ? '' : '비밀번호가 일치하지 않습니다.'
    },
    email: {
      required: '이메일은 필수 입력 항목입니다.',
      pattern: {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: '유효한 이메일 주소를 입력하세요.'
      }
    },
    birthday: {
      required: '생년월일은 필수 입력 항목입니다.',
      pattern: {
        regex: /^(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])$/,
        message: '생년월일은 yyyyMMdd 형식으로 입력하세요.'
      }
    },
    name: {
      required: '이름은 필수 입력 항목입니다.',
      pattern: {
        regex: /^[a-zA-Z가-힣\s-]{2,10}$/,
        message: '이름은 2~10자의 한글, 영문자, 공백, 하이픈(-)만 사용 가능합니다.'
      }
    }
  };

  // 단일 필드 유효성 검사
  const validateField = (name, value) => {
    if (!validationRules[name]) return true; // 규칙이 없는 필드는 항상 유효

    const rule = validationRules[name];
    let errorMessage = '';

    // 1. 필수 입력 검사
    if (!value.trim() && rule.required) {
      errorMessage = rule.required;
    }
    // 값이 있는 경우에만 패턴 및 커스텀 검증 수행
    else if (value.trim()) {
      // 2. 정규식 패턴 검사
      if (rule.pattern && !rule.pattern.regex.test(value)) {
        errorMessage = rule.pattern.message;
      }
      // 3. 커스텀 검증 함수
      else if (rule.custom) {
        errorMessage = rule.custom(value);
      }
    }

    // 에러 상태 업데이트
    setErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));

    return !errorMessage; // 에러 메시지가 없으면 유효함
  };

  // 모든 필드 유효성 검사
  const validateAllFields = () => {
    const fieldsToValidate = Object.keys(formData).filter(key => key !== 'role'); // role 제외
    let isValid = true;

    // 각 필드별로 유효성 검사 수행
    fieldsToValidate.forEach(field => {
      const isFieldValid = validateField(field, formData[field]);
      if (!isFieldValid) isValid = false;
    });

    return isValid;
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  // 입력 필드 포커스 아웃 핸들러
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // 회원가입 처리
  const handleSubmit = async () => {
    // 모든 필드 유효성 검사 실행
    if (!validateAllFields()) {
      return; // 유효하지 않은 경우 API 요청 중단
    }

    // 에러가 있는지 확인
    const hasErrors = Object.values(errors).some(error => error !== '');
    if (hasErrors) {
      return; // 에러가 있으면 회원가입 진행하지 않음
    }

    try {
      const [usernameCheck, emailCheck] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/member/check-username?username=${formData.username}`,
        ),
        axios.get(
          `${process.env.REACT_APP_API_URL}/member/check-email?email=${formData.email}`,
        ),
      ]);

      const newErrors = { ...errors };

      const isUsernameAvailable = usernameCheck.data?.isAvailable;
      const isEmailAvailable = emailCheck.data?.isAvailable;

      newErrors.username = isUsernameAvailable
        ? ''
        : '이미 사용 중인 아이디입니다.';
      newErrors.email = isEmailAvailable
        ? ''
        : '이미 사용 중인 이메일입니다.';

      setErrors(newErrors);

      if (!isUsernameAvailable || !isEmailAvailable) {
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_URL}/member/register`,
        formData
      );

      alert('회원가입이 완료되었습니다.');
      navigate('/');
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        apiError: error.response?.data?.message || '회원가입 실패',
      }));
    }
  };

  return (
    <div className="w-full h-full left-0 top-0 absolute overflow-hidden bg-white flex justify-center items-center">
      <div className="w-full h-full absolute bg-no-repeat bg-center bg-cover left-0 top-0 object-cover bg-[url('./images/background_jpg.jpg')]" />
      <div
        className={`${styles.container} relative rounded-[80px] bg-white/20 backdrop-blur-sm flex flex-col items-center gap-3 p-3 my-3`}
      >
        <p
          className={`${styles.title} font-bold text-center text-black mt-8 mb-8 cursor-pointer hover:text-gray-600 transition-all duration-300`}
          onClick={() => navigate('/')}
        >
          Sign Up
        </p>

        <div className="flex flex-col items-center gap-2 w-full">
          {/* 아이디 입력 */}
          <div className="w-full flex flex-col items-center">
            <div
              className={`${styles.inputContainer} h-[50px] rounded-[20px] bg-[#fffefe]/50 flex items-center p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]`}
            >
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`flex-1 ${styles.input} text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none`}
                placeholder="아이디"
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* 비밀번호 입력 */}
          <div className="w-full flex flex-col items-center">
            <div
              className={`${styles.inputContainer} h-[50px] rounded-[20px] bg-[#fffefe]/50 flex items-center p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]`}
            >
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`flex-1 ${styles.input} text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none`}
                placeholder="비밀번호"
              />
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* 비밀번호 확인 */}
          <div className="w-full flex flex-col items-center">
            <div
              className={`${styles.inputContainer} h-[50px] rounded-[20px] bg-[#fffefe]/50 flex items-center p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]`}
            >
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`flex-1 ${styles.input} text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none`}
                placeholder="비밀번호 확인"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* 이름 입력 */}
          <div className="w-full flex flex-col items-center">
            <div
              className={`${styles.inputContainer} h-[50px] rounded-[20px] bg-[#fffefe]/50 flex items-center p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]`}
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`flex-1 ${styles.input} text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none`}
                placeholder="이름"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* 생년월일 입력 */}
          <div className="w-full flex flex-col items-center">
            <div
              className={`${styles.inputContainer} h-[50px] rounded-[20px] bg-[#fffefe]/50 flex items-center p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]`}
            >
              <input
                type="text"
                name="birthday"
                value={formData.birthday}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`flex-1 ${styles.input} text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none`}
                placeholder="생년월일 (yyyyMMdd)"
              />
            </div>
            {errors.birthday && <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>}
          </div>

          {/* 이메일 입력 */}
          <div className="w-full flex flex-col items-center">
            <div
              className={`${styles.inputContainer} h-[50px] rounded-[20px] bg-[#fffefe]/50 flex items-center p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]`}
            >
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`flex-1 ${styles.input} text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none`}
                placeholder="이메일"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* API 에러 메시지 표시 */}
          {errors.apiError && (
            <div className="w-full text-center">
              <p className="text-red-500 text-sm mt-1">{errors.apiError}</p>
            </div>
          )}

          {/* 역할 선택 */}
          <div className={`${styles.inputContainer} flex justify-center items-center mt-1 mb-1`}>
            <div className="flex gap-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="STUDENT"
                  checked={formData.role === 'STUDENT'}
                  onChange={handleChange}
                  className="hidden"
                />
                <div
                  className={`w-4 h-4 rounded-full border-1 transition-all duration-300 ${
                    formData.role === 'STUDENT'
                      ? 'bg-[#228B22] border-2 border-white' // 수강생은 초록색 계열
                      : 'border-[#4B5563] border-2' // 선택 안됐을 때 회색으로 변경
                  }`}
                />
                <span
                  className={`text-sm font-medium ${formData.role === 'STUDENT' ? 'text-[#1e2d1f]' : 'text-gray-600'}`}
                >
                  수강생
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="ADMIN"
                  checked={formData.role === 'ADMIN'}
                  onChange={handleChange}
                  className="hidden"
                />
                <div
                  className={`w-4 h-4 rounded-full border-1 transition-all duration-300 ${
                    formData.role === 'ADMIN'
                      ? 'bg-[#B22222] border-2 border-white' // 관리자는 빨간색 계열
                      : 'border-[#4B5563] border-2' // 선택 안됐을 때 회색으로 변경
                  }`}
                />
                <span
                  className={`text-sm font-medium ${formData.role === 'ADMIN' ? 'text-[#1e2d1f]' : 'text-gray-600'}`}
                >
                  관리자
                </span>
              </label>
            </div>
          </div>

          {/* 회원가입 버튼 */}
          <button
            onClick={handleSubmit}
            className={`${styles.inputContainer} h-[50px] rounded-[20px] bg-[#1e2d1f]/80 hover:bg-[#1e2d1f] transition-all duration-300 flex justify-center items-center ${styles.button} font-bold text-center text-white mt-8 mb-8`}
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};