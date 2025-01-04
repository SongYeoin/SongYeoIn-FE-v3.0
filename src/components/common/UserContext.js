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

  // 로그아웃 메서드
  const logout = () => {
    setUser(null); // 사용자 상태 초기화
    sessionStorage.removeItem('token'); // 토큰 삭제
    sessionStorage.removeItem('refreshToken'); // 리프레시 토큰 삭제
    sessionStorage.removeItem('user'); // 사용자 정보 삭제
    window.location.href = '/';
  };

  return <UserContext.Provider value={{user, loading, setUser, logout}}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
