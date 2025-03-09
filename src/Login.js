import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useResponsive } from 'components/common/ResponsiveWrapper';
import { setAccessToken, initializeTokenSystem } from 'api/axios';

export const Login = ({ role }) => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useResponsive();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 토큰 시스템 초기화
  useEffect(() => {
    initializeTokenSystem();
  }, []);

  const getResponsiveStyle = () => {
    if (isMobile) {
      return {
        container: 'w-[90%] min-h-[400px]',
        inputContainer: 'w-[90%]',
        title: 'text-2xl',
        input: 'text-base',
        button: 'text-lg'
      };
    }
    if (isTablet) {
      return {
        container: 'w-[70%] min-h-[450px]',
        inputContainer: 'w-[70%]',
        title: 'text-3xl',
        input: 'text-lg',
        button: 'text-xl'
      };
    }
    return {
      container: 'w-[600px] min-h-[500px]',
      inputContainer: 'w-[400px]',
      title: 'text-4xl',
      input: 'text-xl',
      button: 'text-2xl'
    };
  };

  const styles = getResponsiveStyle();

  const handleLogin = async () => {
    if (isLoading) return;

    // 입력값 검증
    if (!id.trim() || !password.trim()) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint =
        role === 'student'
          ? `${process.env.REACT_APP_API_URL}/member/login`
          : `${process.env.REACT_APP_API_URL}/admin/member/login`;
      const redirectPath = role === 'student' ? '/main' : '/admin/member';

      const response = await axios.post(endpoint,
        { username: id, password },
        {
          isHandled: true,
          withCredentials: true // 쿠키를 받기 위해 필요
        }
      );

      const { accessToken } = response.data;

      if (!accessToken) {
        setErrorMessage('서버 내부 오류가 발생했습니다.');
        return;
      }

      // Access Token은 메모리에만 저장
      setAccessToken(accessToken);

      // HTTP Only 쿠키로 Refresh Token을 받는 방식이므로 별도 저장 불필요

      // 로그인 성공 시 리다이렉트
      navigate(redirectPath);
    } catch (error) {
      console.error('로그인 오류:', error);

      if (error.response) {
        const { data, status } = error.response;
        const code = data?.code;
        const message = data?.message || '';

        // 아이디 없음 또는 비밀번호 불일치 - 보안상 같은 메시지 사용
        if (['USER_003', 'USER_NOT_FOUND', 'INVALID_PASSWORD'].includes(code) ||
          status === 401) {
          setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
        // 입력값 검증 실패 - 기존 메시지 유지
        else if (code === 'COMMON_001') {
          setErrorMessage('아이디나 비밀번호를 입력해주세요.');
        }
        // 그 외 모든 에러는 서버에서 받은 메시지 그대로 표시
        else {
          setErrorMessage(message || '로그인 중 오류가 발생했습니다.');
        }
      } else {
        setErrorMessage('서버와의 통신에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className={`${styles.inputContainer} h-[60px] rounded-[20px] 
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1e2d1f]/80 hover:bg-[#1e2d1f]'} 
            transition-all duration-300 flex justify-center items-center ${styles.button} font-bold text-center text-white`}
          >
            {isLoading ? (
              <span>로그인 중...</span>
            ) : (
              <span>{role === 'student' ? '수강생 로그인' : '관리자 로그인'}</span>
            )}
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