// import logo from './logo.svg';
// import './App.css';
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
    <div>
      <h1>Message from Spring Boot:</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
