import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const Login = ({ role }) => {
  const navigate = useNavigate();

  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    try {
      // 역할에 따라 API 엔드포인트 및 리디렉션 경로 설정
      const endpoint =
        role === 'student'
          ? `${process.env.REACT_APP_API_URL}/member/login`
          : `${process.env.REACT_APP_API_URL}/admin/member/login`;
      const redirectPath = role === 'student' ? '/main' : '/admin/member';

      const response = await axios.post(endpoint, { username: id, password });

      // Access Token과 Refresh Token 가져오기
      const { accessToken, refreshToken } = response.data;

      if (!accessToken || !refreshToken) {
        setErrorMessage('서버 내부 오류가 발생했습니다.');
        return;
      }

      // 세션 스토리지에 저장
      sessionStorage.setItem('token', accessToken); // Access Token
      sessionStorage.setItem('refreshToken', refreshToken); // Refresh Token

      // 페이지 이동
      navigate(redirectPath);
    } catch (error) {
      if (error.response) {
        const { code, message } = error.response.data;

        if (code === 'USER_003') {
          setErrorMessage('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        } else if (code === 'COMMON_001') {
          setErrorMessage('아이디나 비밀번호를 입력해주세요.');
        } else {
          // 나머지는 백엔드의 메시지를 그대로 출력
          setErrorMessage(message);
        }
      } else {
        setErrorMessage('서버와의 통신에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const handleClick = () => {
    navigate('/join');
  };

  return (
    <div className="w-full h-full left-0 top-0 absolute overflow-hidden bg-white flex justify-center items-center">
      {/* 배경 이미지 */}
      <div className="w-full h-full absolute bg-no-repeat bg-center bg-cover left-0 top-0 object-cover bg-[url('./images/background_jpg.jpg')]" />

      {/* 로그인 박스 */}
      <div className="w-[690px] h-[858px] relative rounded-[80px] bg-white/20 backdrop-blur-sm flex flex-col items-center gap-11"
      >
        <p
          className="w-[172px] h-[71px] text-[46px] font-bold text-center text-black mt-20 mb-16 cursor-pointer hover:text-gray-600 transition-all duration-300"
          onClick={() => navigate('/')}
        >
          Login
        </p>

        {/* 로그인 폼 */}
        <form
          className="flex flex-col items-center gap-11"
          onSubmit={(e) => {
            e.preventDefault(); // 기본 새로고침 방지
            handleLogin(); // 로그인 함수 호출
          }}
        >
        {/* 아이디 입력칸 */}
        <div className="w-[490px] h-[74px] rounded-[20px] bg-[#fffefe]/50 flex items-center gap-5 p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]">
          <svg
            width="45"
            height="44"
            viewBox="0 0 45 44"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[45px] h-11"
            preserveAspectRatio="none"
          >
            <path
              d="M37.5 38.5V34.8333C37.5 32.8884 36.7098 31.0232 35.3033 29.6479C33.8968 28.2726 31.9891 27.5 30 27.5H15C13.0109 27.5 11.1032 28.2726 9.6967 29.6479C8.29018 31.0232 7.5 32.8884 7.5 34.8333V38.5M30 12.8333C30 16.8834 26.6421 20.1667 22.5 20.1667C18.3579 20.1667 15 16.8834 15 12.8333C15 8.78325 18.3579 5.5 22.5 5.5C26.6421 5.5 30 8.78325 30 12.8333Z"
              stroke="#757575"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <input
            className="w-[380px] h-9 text-[29px] text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>

        {/* 비밀번호 입력칸 */}
        <div
          className="w-[490px] h-[74px] rounded-[20px] bg-[#fffefe]/50 flex items-center gap-5 p-5 focus-within:ring-2 focus-within:ring-[#1e2d1f]">

          <svg
            width="49"
            height="43"
            viewBox="0 0 49 43"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[49px] h-[43px]"
            preserveAspectRatio="none"
          >
            <path
              d="M14.2917 19.709V12.5423C14.2917 10.1664 15.3672 7.88783 17.2816 6.20782C19.1961 4.52781 21.7926 3.58398 24.5 3.58398C27.2074 3.58398 29.8039 4.52781 31.7184 6.20782C33.6328 7.88783 34.7083 10.1664 34.7083 12.5423V19.709M10.2083 19.709H38.7917C41.0468 19.709 42.875 21.3133 42.875 23.2923V35.834C42.875 37.813 41.0468 39.4173 38.7917 39.4173H10.2083C7.95317 39.4173 6.125 37.813 6.125 35.834V23.2923C6.125 21.3133 7.95317 19.709 10.2083 19.709Z"
              stroke="#757575"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
          <input
            type="password"
            className="w-[380px] h-9 text-[29px] text-left text-[#1e2d1f] bg-transparent [&::placeholder]:text-grey-500 outline-none focus:outline-none border-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}

          {/* 로그인 버튼 */}
          <button
            type="submit"
            className="w-[273px] h-[74px] rounded-[20px] bg-[#1e2d1f]/80 hover:bg-[#1e2d1f] transition-all duration-300 flex justify-center items-center text-[25px] font-bold text-center text-white"
          >
            로그인
          </button>
        </form>

        {/* 회원가입 버튼 */}
        <p
          className="w-[100px] h-[30px] text-[25px] text-right text-[#1e2d1f] cursor-pointer hover:text-[#324633] hover:scale-105 transition-all duration-300"
          onClick={handleClick}
        >
          회원가입
        </p>
      </div>
    </div>
  );
};
