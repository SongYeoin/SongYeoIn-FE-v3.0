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
  <div className="w-screen min-h-screen flex flex-col bg-white overflow-y-auto">
    {/* 배경 이미지 */}
    <div className="fixed inset-0 bg-no-repeat bg-center bg-cover bg-[url('./images/background_jpg.jpg')] z-0" />

    {/* 메인 컨텐츠 영역 */}
    <div className="flex-1 flex items-center z-10">
      <div className="relative w-full max-w-7xl mx-auto min-h-[90vh] flex flex-col items-center justify-center gap-8">
        {/* 로고 섹션 */}
        <div className="flex items-center justify-center w-full max-w-[1200px] mx-auto px-4 pt-16">
          <div className="flex items-center justify-center">
            {/* 새일+송파 로고 그룹 */}
            <div className="flex items-center -space-x-2">
              <img
                src="/images/saeil_logo.png"
                className="w-[55px] h-[55px] object-contain"
                alt="새일로고"
              />
              <img
                src="/images/woman_up_logo.png"
                className="w-[130px] object-contain"
                alt="송파로고"
              />
            </div>

            {/* x 표시와 송여인 로고 */}
            <div className="flex items-center">
              <span className="text-2xl font-light text-gray-300 mx-3 translate-y-2.5">×</span>
              <img
                src="/images/songyeoin_title.png"
                className="h-[40px] object-contain translate-y-1"
                alt="SONGYEOIN"
              />
            </div>
          </div>
        </div>

        {/* 텍스트 섹션 */}
        <div className="flex flex-col items-center gap-4">
          <p className={`font-bold text-center text-[#1e2d1f] ${
            getResponsiveSize('text-[28px]', 'text-[24px]', 'text-[20px]')
          }`}>
            COLLABORATION
          </p>
          <div className={`flex flex-col gap-1 text-center text-[#2d3436] ${
            getResponsiveSize('text-[18px]', 'text-[16px]', 'text-[14px]')
          }`}>
            <p>송파여성인력개발센터와 2024 &apos;자바 스프링 백엔드&apos; 훈련 과정 수료생</p>
            <p>&apos;송여인&apos; 팀 5인이 함께한 학습 관리 시스템입니다.</p>
          </div>
        </div>

        {/* 아이콘 섹션 */}
        <div className={`flex ${isMobile ? 'flex-col' : ''} gap-6`}>
          {/* 수강생 카드 */}
          <div
            className={`${getResponsiveSize(
              'w-[350px] h-[350px]',
              'w-[300px] h-[300px]',
              'w-[250px] h-[250px]'
            )} rounded-[40px] bg-[#fffcfc]/30
                flex flex-col items-center justify-center
                hover:bg-white/50 hover:scale-105 transition-all cursor-pointer`}
            onClick={() => navigate('/login/student')}
          >
            <div className="flex flex-col items-center">
              <img
                src="/images/student_icon.png"
                className={`object-contain ${getResponsiveSize('w-[160px]', 'w-[140px]', 'w-[120px]')} mb-3`}
                alt="학생 아이콘"
              />
              <p className={`font-bold text-[#1e2d1f] ${
                getResponsiveSize('text-3xl', 'text-2xl', 'text-xl')
              }`}>수강생</p>
            </div>
          </div>

          {/* 관리자 카드 */}
          <div
            className={`${getResponsiveSize(
              'w-[350px] h-[350px]',
              'w-[300px] h-[300px]',
              'w-[250px] h-[250px]'
            )} rounded-[40px] bg-[#fffcfc]/30
                flex flex-col items-center justify-center
                hover:bg-white/50 hover:scale-105 transition-all cursor-pointer`}
            onClick={() => navigate('/login/admin')}
          >
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center ${getResponsiveSize('h-[160px]', 'h-[140px]', 'h-[120px]')} mb-3`}>
                <img
                  src="/images/admin_icon.png"
                  className={`object-contain ${getResponsiveSize('w-[140px]', 'w-[120px]', 'w-[100px]')}`}
                  alt="관리자 아이콘"
                />
              </div>
              <p className={`font-bold text-[#1e2d1f] ${
                getResponsiveSize('text-3xl', 'text-2xl', 'text-xl')
              }`}>관리자</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* 회사 정보 섹션 */}
       <div className="relative w-full z-10 mt-16">
         <div className="max-w-7xl mx-auto px-4 py-8 text-center">
           <div className="flex justify-center mb-6">
             <img
               src="/images/songyeoin_title.png"
               alt="songyeoin"
               className={`${getResponsiveSize('h-8', 'h-7', 'h-6')}`}
             />
           </div>

           <div className={`flex flex-col gap-2 text-[#1e2d1f] ${
             getResponsiveSize('text-sm', 'text-sm', 'text-xs')
           }`}>

             <p>서울특별시 송파구 중대로9길 34(가락동) 대호빌딩2층</p>
             <p>담당자: 송파여성인력개발센터 황경미&nbsp;&nbsp;&nbsp;&nbsp;전화번호: 070-4322-3011</p>
             <p>개발팀: 김도연, 김예린, 이유진, 최소연</p>
           </div>
         </div>
       </div>
     </div>
    );
    };