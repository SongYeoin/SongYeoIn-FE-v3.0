import React from "react";

const AdminClubList = () => {
  return (
    <div className="flex flex-col justify-start items-start w-[1680px] h-[1000px] relative overflow-hidden gap-2.5 px-10">
      <div className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative">
        <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-4 py-7">
          <div className="flex flex-col justify-start items-start flex-grow relative gap-4">
            <p className="self-stretch flex-grow-0 flex-shrink-0 w-[1600px] text-[28px] text-left text-[#16161b]">
              동아리
            </p>
          </div>
        </div>
        <div className="self-stretch flex-grow-0 flex-shrink-0 h-10 relative">
          <div className="w-[329px] h-10 absolute left-0 top-0 overflow-hidden bg-white border border-[#d6d6d6]">
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 absolute left-[298px] top-2"
              preserveAspectRatio="xMidYMid meet"
            >
              <path d="M12 15L7 10H17L12 15Z" fill="#1D1B20" />
            </svg>
            <p className="w-[291px] h-[38px] absolute left-[7px] top-0.5 text-sm text-center text-black">
              자바 스프링 백엔드
            </p>
          </div>
          <div className="w-[100px] h-10">
            <div className="flex justify-start items-center w-[100px] absolute left-[1190px] top-px gap-2 p-3 rounded-lg bg-white border border-[#ebebf0]">
              <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
                <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-[#9a97a9]">작성자</p>
              </div>
            </div>
            <svg
              width={14}
              height={6}
              viewBox="0 0 14 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-[1268.5px] top-[23.5px]"
              preserveAspectRatio="none"
            >
              <path
                d="M8.29897 6L5.70103 6L-2.62268e-07 8.09772e-07L3.20232 6.69795e-07L6.96392 4.26316L6.79253 4.21491L7.20747 4.21491L7.03608 4.26316L10.7977 3.37791e-07L14 1.97813e-07L8.29897 6Z"
                fill="#DADADA"
              />
            </svg>
          </div>
          <div className="flex justify-start items-center w-[300px] absolute left-[1300px] top-px gap-2 p-3 rounded-lg bg-white border border-[#ebebf0]">
            <div className="flex justify-start items-center flex-grow-0 flex-shrink-0 relative gap-2">
              <p className="flex-grow-0 flex-shrink-0 text-sm text-left text-[#9a97a9]">
                검색할 내용을 입력하세요.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start items-start flex-grow-0 flex-shrink-0 h-[778px] gap-6">
        <div className="flex flex-col justify-start items-center flex-grow-0 flex-shrink-0 h-[778px] w-[1600px] gap-6 p-6 rounded-2xl bg-white">
          <div className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative bg-white">
            {["번호", "작성자", "승인상태", "승인메시지", "활동일", "작성일", "첨부파일"].map((header) => (
              <p key={header} className="flex-grow-0 flex-shrink-0 w-[130px] text-xs font-bold text-center text-[#454545]">
                {header}
              </p>
            ))}
          </div>

          {[...Array(14)].map((_, index) => (
            <div key={index} className="flex justify-between items-center self-stretch flex-grow-0 flex-shrink-0 relative">
              <p className="flex-grow-0 flex-shrink-0 w-[130px] text-xs text-center text-black">{index + 1}</p>
              <p className="flex-grow-0 flex-shrink-0 w-[130px] text-xs text-center text-black">박준수</p>
              <p className="flex-grow-0 flex-shrink-0 w-[130px] text-xs text-center text-black">대기</p>
              <p className="flex-grow-0 flex-shrink-0 w-[130px] text-xs text-center">대기</p>
              <p className="flex-grow-0 flex-shrink-0 w-[130px] text-xs text-center text-black">
                2024.02.11
              </p>
              <p className="flex-grow-0 flex-shrink-0 w-[130px] text-xs text-center text-black">
                2024.02.02
              </p>
              <p className="flex-grow-0 flex-shrink-0 w-[130px] text-xs text-center">대기</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminClubList;
