import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeAuth: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        setIsAuthenticated(!!token);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  const signIn = async (token: string) => {
    await AsyncStorage.setItem('userToken', token);
    setIsAuthenticated(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('userToken');
    setIsAuthenticated(false);
  };

  // Use when a token was already persisted earlier in the flow (e.g. after
  // OTP verification) and this screen just needs to flip the app over to
  // the main navigator once setup finishes - no new token to store here.
  const completeAuth = () => {
    setIsAuthenticated(true);
  };

  const value = useMemo(
    () => ({ isAuthenticated, isLoading, signIn, signOut, completeAuth }),
    [isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}