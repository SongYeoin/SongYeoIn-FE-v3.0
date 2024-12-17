import React, { createContext, useState, useEffect, useContext } from 'react';
import { parseJwt } from './JwtDecoding';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');

    if (storedUser) {
      // 먼저 세션 스토리지의 사용자 정보 사용
      setUser(JSON.parse(storedUser));
      setLoading(false);
    }
    else if (token) {
      try {
        const decodedUser = parseJwt(token);
        console.log('Decoded User:', decodedUser); // 디코딩된 사용자 정보 확인
        setUser(decodedUser);
        setLoading(false);
      } catch (error) {
        console.error('JWT 디코딩 오류:', error);
        setLoading(false);
      }
    }else{
      setLoading(false);
    }
  }, []);

  // useEffect(() => {
  //   // user 정보가 있을 때 sessionStorage에 저장, 없으면 삭제
  //   if (user) {
  //     sessionStorage.setItem('user', JSON.stringify(user));
  //   } else {
  //     sessionStorage.removeItem('user');
  //   }
  // }, [user]);

  return <UserContext.Provider value={{user, loading}}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
