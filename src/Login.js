import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useResponsive } from 'components/common/ResponsiveWrapper';

export const Login = ({ role }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const getResponsiveStyle = () => {
    if (isMobile) {
      return {
        container: 'w-[90%] min-h-[400px]',  // 높이 감소
        inputContainer: 'w-[90%]',
        title: 'text-2xl',                    // 텍스트 크기 감소
        input: 'text-base',                   // 텍스트 크기 감소
        button: 'text-lg'                     // 버튼 텍스트 크기 감소
      };
    }
    if (isTablet) {
      return {
        container: 'w-[70%] min-h-[450px]',  // 높이 감소
        inputContainer: 'w-[70%]',
        title: 'text-3xl',                    // 텍스트 크기 감소
        input: 'text-lg',                     // 텍스트 크기 감소
        button: 'text-xl'                     // 버튼 텍스트 크기 감소
      };
    }
    return {
      container: 'w-[600px] min-h-[500px]',  // 전체 크기 감소
      inputContainer: 'w-[400px]',           // 입력창 너비 감소
      title: 'text-4xl',                     // 텍스트 크기 감소
      input: 'text-xl',                      // 텍스트 크기 감소
      button: 'text-2xl'                     // 버튼 텍스트 크기 감소
    };
  };

  const styles = getResponsiveStyle();

  const handleLogin = async () => {
    try {
      const endpoint =
        role === 'student'
          ? `${process.env.REACT_APP_API_URL}/member/login`
          : `${process.env.REACT_APP_API_URL}/admin/member/login`;
      const redirectPath = role === 'student' ? '/main' : '/admin/member';

      const response = await axios.post(endpoint, { username: id, password }, { isHandled: true });
      const { accessToken, refreshToken } = response.data;

      if (!accessToken || !refreshToken) {
        setErrorMessage('서버 내부 오류가 발생했습니다.');
        return;
      }

      sessionStorage.setItem('token', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      navigate(redirectPath);
    } catch (error) {
      if (error.response) {
        const { code, message } = error.response.data;
        if (code === 'USER_003') {
          setErrorMessage('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        } else if (code === 'COMMON_001') {
          setErrorMessage('아이디나 비밀번호를 입력해주세요.');
        } else {
          setErrorMessage(message);
        }
      } else {
        setErrorMessage('서버와의 통신에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  return (
    <div className="w-full h-full left-0 top-0 absolute overflow-hidden bg-white flex justify-center items-center">
      <div className="w-full h-full absolute bg-no-repeat bg-center bg-cover left-0 top-0 object-cover bg-[url('./images/background_jpg.jpg')]" />

      <div
        className={`${styles.container} relative rounded-[80px] bg-white/20 backdrop-blur-sm
        flex flex-col items-center gap-8 p-8 my-8`}
      >
        <p
          className={`${styles.title} font-bold text-center text-black mt-10 mb-8 cursor-pointer hover:text-gray-600 transition-all duration-300`}
          onClick={() => navigate('/')}
        >
          Login
        </p>

        <form
          className="flex flex-col items-center gap-6 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <div
            className={`${styles.inputContainer} h-[74px] rounded-[20px] bg-[#fffefe]/50 flex items-center gap-5 p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]`}
          >
            <svg width="45" height="44" viewBox="0 0 45 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M37.5 38.5V34.8333C37.5 32.8884 36.7098 31.0232 35.3033 29.6479C33.8968 28.2726 31.9891 27.5 30 27.5H15C13.0109 27.5 11.1032 28.2726 9.6967 29.6479C8.29018 31.0232 7.5 32.8884 7.5 34.8333V38.5M30 12.8333C30 16.8834 26.6421 20.1667 22.5 20.1667C18.3579 20.1667 15 16.8834 15 12.8333C15 8.78325 18.3579 5.5 22.5 5.5C26.6421 5.5 30 8.78325 30 12.8333Z"
                stroke="#757575"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              className={`flex-1 ${styles.input} text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none`}
              placeholder="ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>

          <div
            className={`${styles.inputContainer} h-[74px] rounded-[20px] bg-[#fffefe]/50 flex items-center gap-5 p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]`}
          >
            <svg width="49" height="43" viewBox="0 0 49 43" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M14.2917 19.709V12.5423C14.2917 10.1664 15.3672 7.88783 17.2816 6.20782C19.1961 4.52781 21.7926 3.58398 24.5 3.58398C27.2074 3.58398 29.8039 4.52781 31.7184 6.20782C33.6328 7.88783 34.7083 10.1664 34.7083 12.5423V19.709M10.2083 19.709H38.7917C41.0468 19.709 42.875 21.3133 42.875 23.2923V35.834C42.875 37.813 41.0468 39.4173 38.7917 39.4173H10.2083C7.95317 39.4173 6.125 37.813 6.125 35.834V23.2923C6.125 21.3133 7.95317 19.709 10.2083 19.709Z"
                stroke="#757575"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="password"
              className={`flex-1 ${styles.input} text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none`}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

          <button
            type="submit"
            className={`${styles.inputContainer} h-[60px] rounded-[20px] bg-[#1e2d1f]/80 hover:bg-[#1e2d1f] transition-all duration-300 flex justify-center items-center ${styles.button} font-bold text-center text-white`}
          >
            {role === 'student' ? '수강생 로그인' : '관리자 로그인'}
          </button>
        </form>

        <p
          className={`${styles.button} text-right text-[#1e2d1f] cursor-pointer hover:text-[#324633] hover:scale-105 transition-all duration-300 mt-8 mb-10`}
          onClick={() => navigate('/join')}
        >
          회원가입
        </p>
      </div>
    </div>
  );
};
