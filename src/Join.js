import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Join = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login');
  };

  return (
    /* 전체 크기 */
    <div
      className="w-full h-full left-0 top-0 absolute overflow-hidden bg-white flex justify-center items-center">

      {/* 배경 이미지 */}
      <div
        className="w-full h-full absolute bg-no-repeat bg-center bg-cover left-0 top-0 object-cover bg-[url('./images/background_jpg.jpg')]"
      />

      {/* content 전체 담는 div */}
      <div
        className="w-[690px] h-[858px] relative rounded-[80px] bg-[#fffcfc]/10 flex flex-col items-center gap-5"
      >
        <p
          className="w-[200px] h-[71px] text-[46px] font-bold text-center text-black mt-20"
        >
          회원가입
        </p>

        {/* ID 입력칸*/}
        <div
          className="w-[490px] h-[74px] rounded-[20px] bg-[#fffefe]/50 flex flex-row gap-5 p-5"
        >
          {/* 사람 이모티콘 */}
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

          {/* ID 입력하는 input */}
          <input
            className="w-full h-11 text-[29px] text-left text-white bg-transparent"
            placeholder={'ID'}>
          </input>
        </div>

        {/* 경고문*/}
        <p
          className="w-[330px] h-9 text-[25px] text-left text-[#cc3f42]">
          이미 사용중인 아이디 입니다
        </p>

        {/* PASSWORD 입력칸*/}
        <div
          className="w-[490px] h-[74px] rounded-[20px] bg-[#fffefe]/50 flex flex-row gap-4 p-5"
        >
          {/* 자물쇠 아이콘 */}
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

          {/* PASSWORD 입력하는 input */}
          <input
            className="w-full h-11 text-[29px] text-left text-white bg-transparent"
            placeholder={'Password'}>
          </input>
        </div>

        {/* 2번째 PASSWORD 입력칸*/}
        <div
          className="w-[490px] h-[74px] rounded-[20px] bg-[#fffefe]/50 flex flex-row gap-4 p-5"
        >
          {/* 자물쇠 아이콘 */}
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

          {/* PASSWORD 입력하는 input */}
          <input
            className="w-full h-11 text-[29px] text-left text-white bg-transparent"
            placeholder={'Password'}>
          </input>
        </div>

        {/* 이름 입력칸*/}
        <div
          className="w-[490px] h-[74px] rounded-[20px] bg-[#fffefe]/50 flex flex-row gap-5 p-5"
        >
          {/* 사람 이모티콘 */}
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

          {/* 이름 입력하는 input */}
          <input
            className="w-full h-11 text-[29px] text-left text-white bg-transparent"
            placeholder={'이름'}>
          </input>
        </div>

        {/* email 입력칸*/}
        <div
          className="w-[490px] h-[74px] rounded-[20px] bg-[#fffefe]/50 flex flex-row gap-5 p-5"
        >
          {/* 사람 이모티콘 */}
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

          {/* email 입력하는 input */}
          <input
            className="w-full h-11 text-[29px] text-left text-white bg-transparent"
            placeholder={'email'}>
          </input>
        </div>

        <div className="w-[490px] h-11 flex flex-row p-2 gap-28">
          <p
            className="w-[280px] h-9 text-[25px] text-left text-white">
            이미 계정이 있으신가요?
          </p>

          <p
            className="w-25 h-9 text-[25px] text-left text-white hover:bg-white/50 hover:scale-105 cursor-pointer" onClick={handleClick}>로그인
          </p>
        </div>


        <div
          className="w-[273px] h-[74px] rounded-[20px] bg-[#6a896b]/90 flex justify-center items-center"
        >
          <p
            className="text-[25px] font-bold text-center text-white"
          >
            가입하기
          </p>
        </div>


      </div>
    </div>
  );
};