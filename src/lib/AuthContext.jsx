import React, { createContext, useState, useContext } from "react";

/**
 * This project runs with NO LOGIN.
 * We keep a tiny AuthContext so any legacy imports won't crash.
 */
const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoadingAuth: false,
  isLoadingPublicSettings: false,
  authError: null,
  appPublicSettings: null,
  logout: () => {},
  checkAppState: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user] = useState(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: false,
        isLoadingAuth: false,
        isLoadingPublicSettings: false,
        authError: null,
        appPublicSettings: null,
        logout: () => {},
        checkAppState: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
