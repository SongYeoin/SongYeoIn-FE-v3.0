import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

export const Landing = () => {
  const navigate = useNavigate();

  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const getResponsiveSize = (desktop, tablet, mobile) => {
    if (isDesktop) return desktop;
    if (isTablet) return tablet;
    return mobile;
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-white overflow-hidden">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 bg-no-repeat bg-center bg-cover bg-[url('./images/background_jpg.jpg')]" />

      {/* 메인 컨텐츠 컨테이너 */}
      <div className="relative w-full h-[85vh] flex flex-col items-center justify-between py-6">
        {/* 로고 섹션 */}
        <div className="flex items-center gap-4">
          <img
            src="/images/saeil_logo.jpg"
            className={`object-contain ${getResponsiveSize('w-[60px] h-[60px]', 'w-[50px] h-[50px]', 'w-[40px] h-[40px]')}`}
            alt="새일로고"
          />
          <img
            src="/images/woman_up_logo.jpg"
            className={`object-cover ${getResponsiveSize('w-[140px] h-[80px]', 'w-[120px] h-[70px]', 'w-[100px] h-[60px]')}`}
            alt="송파로고"
          />
          {/* X 표시 추가 */}
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

          <p className={`text-center text-[#1e2d1f] ${
            getResponsiveSize('text-[40px]', 'text-[35px]', 'text-[30px]')
          }`} style={{ fontFamily: 'LOTTERIACHAB' }}>
            SONGYEOIN
          </p>
        </div>

        {/* 텍스트 섹션 */}
        <div className="flex flex-col items-center gap-4">
          <p className={`font-bold text-center text-[#1e2d1f] ${
            getResponsiveSize('text-[32px]', 'text-[28px]', 'text-[24px]')
          }`}>
            COLLABORATION
          </p>
          <div className={`flex flex-col gap-1 text-center text-[#2d3436] ${
            getResponsiveSize('text-[20px]', 'text-[18px]', 'text-[16px]')
          }`}>
            <p>송파여성인력개발센터와 2024 &apos;자바 스프링 백엔드&apos; 훈련 과정 수료생</p>
            <p>&apos;송여인&apos; 팀 5인이 함께한 학습 관리 시스템입니다.</p>
          </div>
        </div>

        {/* 아이콘 섹션 */}
        <div className={`flex ${isMobile ? 'flex-col' : ''} gap-6`}>
          <div
            className={`${getResponsiveSize(
              'w-[350px] h-[350px]',
              'w-[300px] h-[300px]',
              'w-[250px] h-[250px]'
            )} rounded-[40px] bg-[#fffcfc]/30
              flex flex-col items-center justify-center gap-4
              hover:bg-white/50 hover:scale-105 transition-all cursor-pointer`}
            onClick={() => navigate('/login/student')}
          >
            <img
              src="/images/student_icon.jpg"
              className={`object-contain ${getResponsiveSize('w-[160px]', 'w-[140px]', 'w-[120px]')}`}
              alt="학생 아이콘"
            />
            <p className={`font-bold text-[#1e2d1f] ${
              getResponsiveSize('text-3xl', 'text-2xl', 'text-xl')
            }`}>수강생</p>
          </div>

          <div
            className={`${getResponsiveSize(
              'w-[350px] h-[350px]',
              'w-[300px] h-[300px]',
              'w-[250px] h-[250px]'
            )} rounded-[40px] bg-[#fffcfc]/30
              flex flex-col items-center justify-center gap-4
              hover:bg-white/50 hover:scale-105 transition-all cursor-pointer`}
            onClick={() => navigate('/login/admin')}
          >
            <img
              src="/images/admin_icon.jpg"
              className={`object-contain ${getResponsiveSize('w-[140px]', 'w-[120px]', 'w-[100px]')}`}
              alt="관리자 아이콘"
            />
            <p className={`font-bold text-[#1e2d1f] ${
              getResponsiveSize('text-3xl', 'text-2xl', 'text-xl')
            }`}>관리자</p>
          </div>
        </div>
      </div>
    </div>
  );
};