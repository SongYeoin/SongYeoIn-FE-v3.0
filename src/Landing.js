import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {

  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/login'); // Navigates to the login page
  };

  return (
    /* 전체 크기 */
    <div
      className="w-full h-full left-0 top-0 absolute overflow-hidden bg-white flex justify-center flex-col items-center">

      {/* 배경 이미지 */}
      <div
        className="w-full h-full absolute bg-no-repeat bg-center bg-cover left-0 top-0 object-cover bg-[url('./images/background_jpg.jpg')]"
      />

      {/* 송파 로고, 새일 로고와 송여인 로고 담는 div */}
      <div
        className="relative flex flex-row items-center gap-5 mt-12"
      >

        <img
          src="/images/saeil_logo.jpg"
          className="w-[90px] h-[90px]"
          alt="새일로고"
        />
        <img
          src="/images/woman_up_logo.jpg"
          className="w-[200px] h-[120px] object-cover"
          alt="송파로고"
        />

        <svg
          width="52"
          height="54"
          viewBox="0 0 52 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[52px] h-[54px]"
          preserveAspectRatio="none"
        >
          <path
            d="M39 13.5L13 40.5M13 13.5L39 40.5"
            stroke="#F5F5F5"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
        <p
          className="w-[260px] h-[81px] text-[50px] text-center text-[#1e2d1f] font-normal "
          style={{ fontFamily: 'Dokdo' }}>
          SONGYEOIN
        </p>
      </div>

      {/* 소개 글 */}
      <div className="relative flex flex-col items-center gap-5 mb-14">
        <p
          className="w-[567px] h-[71px] text-[39px] font-bold text-center text-[#fef5f5]"
        >
          COLLABORATION
        </p>
        <p
          className="w-[780px] h-[63px] text-[25px] text-center text-white"
        >
          <span className="w-[780px] h-[63px] text-[25px] text-center text-white"
          >송파여성인력개발센터와 2024 ‘자바 스프링 백엔드’ 훈련 과정 수료생</span>
          <br />
          <span className="w-[712px] h-[63px] text-[25px] text-center text-white"
          >‘송여인’ 팀 5인이 함께한 학습 관리 시스템입니다.</span>
        </p>
      </div>


      <div className="flex flex-row items-center gap-28">
        {/* 수강생 아이콘 div */}
        <div
          className="w-[502px] h-[498px] relative rounded-[80px] bg-[#fffcfc]/30 flex flex-col items-center justify-center
          hover:bg-white/50 hover:scale-105 cursor-pointer"
          onClick={handleClick}>
          <img
            src="/images/student_icon.jpg"
            className="w-[225px] h-[242px] object-cover"
          />
          <p
            className="w-[117px] h-[49px] text-4xl font-bold text-center text-[#1e2d1f]"
          >
            수강생
          </p>
        </div>

        {/* 관리자 아이콘 div */}
        <div
          className="w-[502px] h-[500px] relative rounded-[80px] bg-[#fffcfc]/30  flex flex-col items-center justify-center
          hover:bg-white/50 hover:scale-105 cursor-pointer"
          onClick={handleClick}>
          <img
            src="/images/admin_icon.jpg"
            className="w-[200px] h-52 object-cover"
          />
          <p
            className="w-[113px] h-[49px] text-4xl font-bold text-center text-[#1e2d1f]"
          >
            관리자
          </p>
        </div>

      </div>

    </div>

  );
};