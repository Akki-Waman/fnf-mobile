// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUnauthorizedListener, clearAuthSession } from '../services/api';
import { isTokenExpired } from '../util/authUtils';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeAuth: () => void;
  checkTokenValidity: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const signOut = useCallback(async () => {
    await clearAuthSession();
    setIsAuthenticated(false);
  }, []);

  // Proactive token check: decodes JWT client-side and checks exp claim
  const checkTokenValidity = useCallback(async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const profileCompleted = await AsyncStorage.getItem('profileCompleted');

      if (!token || isTokenExpired(token)) {
        if (token) {
          console.log('Proactive Check: JWT token expired or invalid client-side.');
          await clearAuthSession();
        }
        setIsAuthenticated(false);
        return false;
      }

      if (profileCompleted === 'true') {
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.log('Error checking token validity:', error);
      setIsAuthenticated(false);
      return false;
    }
  }, []);

  useEffect(() => {
    // Register global 401 response interceptor listener
    setUnauthorizedListener(() => {
      setIsAuthenticated(false);
    });

    const bootstrap = async () => {
      await checkTokenValidity();
      setIsLoading(false);
    };

    bootstrap();

    return () => {
      setUnauthorizedListener(null);
    };
  }, [checkTokenValidity]);

  const signIn = async (token: string) => {
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('profileCompleted', 'true');
    setIsAuthenticated(true);
  };

  const completeAuth = () => {
    setIsAuthenticated(true);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      signIn,
      signOut,
      completeAuth,
      checkTokenValidity,
    }),
    [isAuthenticated, isLoading, signIn, signOut, completeAuth, checkTokenValidity]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}