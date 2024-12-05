import React, { createContext, useState, useEffect, useContext } from 'react';
import { parseJwt } from './JwtDecoding';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      const decodedUser = parseJwt(token);
      setUser(decodedUser);
    }
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);