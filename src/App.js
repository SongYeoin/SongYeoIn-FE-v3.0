// import logo from './logo.svg';
//import './App.css';
//
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }
//
// export default App;

// App.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./styles.css";
import { XSize48 } from './XSize48';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/test`);
        setMessage(response.data);
      } catch (error) {
        if (error.response) {
          console.error("Error fetching data:", error.response.status, error.response.data);
        } else if (error.request) {
          console.error("Error with request:", error.request);
        } else {
          console.error("Error:", error.message);
        }
      }
    };

    fetchData();
  }, []);

  return (

    <div className="App">
      <div>
        <h1>Message from Spring Boot:</h1>
        <p>{message}</p>
      </div>
      <div className="total_body">
        {/* 상단 영역 */}
        <header className="header">
          <div className="woman_up_logo"></div>
          <XSize48 className="x-instance"></XSize48>
          <span className="songyeoin_txt">SONGYEOIN</span>
          <span className="collaboration_txt">COLLABORATION</span>
          <span className="introduce_txt">
            송파여성인력개발센터와 ‘자바 스프링 백엔드’ 훈련 과정 수료생
            ‘송여인’ 팀 5인이 함께한 학습 관리 시스템입니다.
          </span>
        </header>

        {/* 중앙 이미지 및 텍스트 영역 */}
        <main className="main-content">
          <div className="image-container">
            <div className="background_jpg"></div>
            <div className="student_icon_div"></div>
            <div className="admin_icon_div"></div>
            <div className="student_icon"></div>
            <div className="admin_icon"></div>
          </div>
          <div className="text-container">
            <span className="student_txt">수강생</span>
            <span className="admin_txt">관리자</span>
          </div>
        </main>

      </div>
    </div>

  );
}

export default App;
