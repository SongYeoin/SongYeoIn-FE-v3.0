import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Join = () => {
  const navigate = useNavigate();

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

  // 필드 유효성 검사
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (!value.trim()) {
      newErrors[name] = `${name}은(는) 필수 입력 항목입니다.`;
    } else {
      // 유효성 검사 제거
      newErrors[name] = '';

      // 추가 유효성 검사
      if (name === 'username') {
        const usernameRegex = /^[a-z0-9_]{6,12}$/;
        newErrors.username = usernameRegex.test(value)
          ? ''
          : '아이디는 6~12자의 영문 소문자, 숫자, 특수기호(_)만 사용 가능합니다.';
      }

      if (name === 'password') {
        const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,16}$/;
        newErrors.password = passwordRegex.test(value)
          ? ''
          : '비밀번호는 8~16자의 영문자, 숫자, 특수문자(!@#$%^&*)를 포함해야 합니다.';
      }

      if (name === 'confirmPassword') {
        newErrors.confirmPassword =
          value === formData.password ? '' : '비밀번호가 일치하지 않습니다.';
      }

      if (name === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        newErrors.email = emailRegex.test(value)
          ? ''
          : '유효한 이메일 주소를 입력하세요.';
      }

      if (name === 'birthday') {
        const birthdayRegex = /^\d{8}$/;
        newErrors.birthday = birthdayRegex.test(value)
          ? ''
          : '생년월일은 yyyyMMdd 형식으로 입력하세요.';
      }

      if (name === 'name') {
        const nameRegex = /^[a-zA-Z가-힣\s-]{2,10}$/;
        newErrors.name = nameRegex.test(value)
          ? ''
          : '이름은 2~10자의 한글, 영문자, 공백, 하이픈(-)만 사용 가능합니다.';
      }
    }

    setErrors(newErrors);
  };

  // 모든 필드 유효성 검사
  const validateAllFields = () => {
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (!value.trim()) {
        if (key === 'username') {
          newErrors[key] = '아이디는 필수입니다';
        }
        if (key === 'password') {
          newErrors[key] = '비밀번호는 필수입니다';
        }
        if (key === 'confirmPassword') {
          newErrors[key] = '비밀번호 확인은 필수입니다';
        }
        if (key === 'name') {
          newErrors[key] = '이름은 필수입니다';
        }
        if (key === 'birthday') {
          newErrors[key] = '생년월일은 필수입니다';
        }
        if (key === 'email') {
          newErrors[key] = '이메일은 필수입니다';
        }
      } else {
        validateField(key, value);
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).every((key) => !newErrors[key]);
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // 실시간 유효성 검사
    validateField(name, value);
  };

  // 회원가입 처리
  const handleSubmit = async () => {
    if (!validateAllFields()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // 중복 체크 API 호출
      const [usernameCheck, emailCheck] = await Promise.all([
        axios.get(
          `${process.env.REACT_APP_API_URL}/member/check-username?username=${formData.username}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }),
        axios.get(
          `${process.env.REACT_APP_API_URL}/member/check-email?email=${formData.email}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }),
      ]);

      // 중복 체크 결과 처리
      const newErrors = { ...errors };

      const isUsernameAvailable = usernameCheck.data?.isAvailable;
      const isEmailAvailable = emailCheck.data?.isAvailable;

      newErrors.username = isUsernameAvailable ? '' : '이미 사용 중인 아이디입니다.';
      newErrors.email = isEmailAvailable ? '' : '이미 사용 중인 이메일입니다.';

      setErrors(newErrors);

      // 중복 문제가 있으면 회원가입 중단
      if (!isUsernameAvailable || !isEmailAvailable) {
        return;
      }

      // 회원가입 요청
      await axios.post(`${process.env.REACT_APP_API_URL}/member/register`,
        formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

      alert('회원가입이 완료되었습니다.');
      navigate('/');
    } catch (error) {
      console.error('회원가입 실패:', error.response?.data);
      setErrors((prev) => ({
        ...prev,
        apiError: error.response?.data?.message || '회원가입 실패',
      }));
    }
  };

  return (
    <div
      className="w-full h-full left-0 top-0 absolute overflow-hidden bg-white flex justify-center items-center">
      <div
        className="w-full h-full absolute bg-no-repeat bg-center bg-cover left-0 top-0 object-cover bg-[url('./images/background_jpg.jpg')]" />
      <div
        className="w-[690px] h-auto relative rounded-[80px] bg-[#fffcfc]/10 flex flex-col items-center gap-5 p-10">
        <p
          className="text-[46px] font-bold text-black mt-10 cursor-pointer hover:text-gray-600 hover:underline transition-all duration-300"
          onClick={() => navigate('/')}
        >
          Sign Up
        </p>

        {/* 아이디 입력 */}
        <div className="w-[490px]">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full h-[74px] rounded-[20px] bg-[#fffefe]/50 p-5 text-[20px] text-black"
            placeholder="아이디"
          />
          {errors.username && <p
            className="text-red-500 text-sm">{errors.username}</p>}
        </div>

        {/* 비밀번호 입력 */}
        <div className="w-[490px]">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full h-[74px] rounded-[20px] bg-[#fffefe]/50 p-5 text-[20px] text-black"
            placeholder="비밀번호"
          />
          {errors.password && <p
            className="text-red-500 text-sm">{errors.password}</p>}
        </div>

        {/* 비밀번호 확인 */}
        <div className="w-[490px]">
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full h-[74px] rounded-[20px] bg-[#fffefe]/50 p-5 text-[20px] text-black"
            placeholder="비밀번호 확인"
          />
          {errors.confirmPassword && <p
            className="text-red-500 text-sm">{errors.confirmPassword}</p>}
        </div>

        {/* 이름 입력 */}
        <div className="w-[490px]">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full h-[74px] rounded-[20px] bg-[#fffefe]/50 p-5 text-[20px] text-black"
            placeholder="이름"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        {/* 생년월일 입력 */}
        <div className="w-[490px]">
          <input
            type="text"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="w-full h-[74px] rounded-[20px] bg-[#fffefe]/50 p-5 text-[20px] text-black"
            placeholder="생년월일 (yyyyMMdd)"
          />
          {errors.birthday && <p
            className="text-red-500 text-sm">{errors.birthday}</p>}
        </div>

        {/* 이메일 입력 */}
        <div className="w-[490px]">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full h-[74px] rounded-[20px] bg-[#fffefe]/50 p-5 text-[20px] text-black"
            placeholder="이메일"
          />
          {errors.email && <p
            className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        {/* 역할 선택 */}
        <div className="w-[490px] mt-4 flex items-center">
          <label className="text-[16px] text-white font-bold w-[100px]">
            역할:
          </label>
          <div className="flex gap-40 flex-grow">
            {/* 수강생 라디오 버튼 */}
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
                className={`w-[28px] h-[28px] rounded-full border-2 transition-all duration-300 ${
                  formData.role === 'STUDENT'
                    ? 'bg-green-500 border-green-500'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              />
              <span
                className={`text-[18px] font-bold ${
                  formData.role === 'STUDENT' ? 'text-green-500' : 'text-gray-500'
                }`}
              >
        수강생
      </span>
            </label>

            {/* 관리자 라디오 버튼 */}
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
                className={`w-[28px] h-[28px] rounded-full border-2 transition-all duration-300 ${
                  formData.role === 'ADMIN'
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300 hover:border-gray-400'
                }`}
              />
              <span
                className={`text-[18px] font-bold ${
                  formData.role === 'ADMIN' ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
        관리자
      </span>
            </label>
          </div>
        </div>


        {/* 가입 버튼 */}
        <div
          onClick={handleSubmit}
          className="w-[273px] h-[74px] rounded-[20px] bg-[#6a896b]/90 flex justify-center items-center cursor-pointer mt-10"
        >
          <p className="text-[25px] font-bold text-white">회원가입</p>
        </div>
      </div>
    </div>
  );
};
