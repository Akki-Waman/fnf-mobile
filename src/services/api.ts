import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

import { registerMockApiInterceptor } from './mockApiAdapter';

/**
 * Centralized API Base URL Configuration for Local Spring Boot Backend
 * Context path: /fnf
 * API version: /api/v1
 *
 * Reads from EXPO_PUBLIC_API_URL or API_BASE_URL in .env.
 * If not set in .env, falls back to 192.168.1.3 (or localhost for web).
 */
const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_BASE_URL;
  if (envUrl) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    // If the provided env URL already includes /api/v1, use as-is; otherwise append /api/v1
    return trimmed.endsWith('/api/v1') ? trimmed : `${trimmed}/api/v1`;
  }

  if (Platform.OS === 'web') {
    return 'http://localhost:8080/fnf/api/v1';
  }
  return 'http://192.168.1.3:8080/fnf/api/v1';
};

export const API_BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

console.log('[apiClient] Base URL configured:', API_BASE_URL);

// Register Dev Mock API Engine Interceptor
registerMockApiInterceptor(apiClient);

// Listener callback to notify AuthContext when a 401 error occurs
type UnauthorizedCallback = (message: string) => void;
let unauthorizedListener: UnauthorizedCallback | null = null;

export const setUnauthorizedListener = (listener: UnauthorizedCallback | null) => {
  unauthorizedListener = listener;
};

// Deduplication flag to prevent multiple concurrent 401 toasts/redirects
let isHandling401 = false;

/**
 * Clears all stored authentication session items from AsyncStorage.
 * Optionally saves the route to redirect back to after re-login.
 */
export const clearAuthSession = async (currentRouteName?: string) => {
  try {
    if (currentRouteName && currentRouteName !== 'Login' && currentRouteName !== 'Splash') {
      await AsyncStorage.setItem('redirectAfterLogin', currentRouteName);
    }
    await AsyncStorage.multiRemove([
      'userToken',
      'profileCompleted',
      '@user_spouse_info',
      '@custom_user_events',
      '@user_profile_photo',
    ]);
  } catch (err) {
    console.log('Error clearing auth session:', err);
  }
};

// Request Interceptor: Centralized Content-Type & Bearer Token Management
apiClient.interceptors.request.use(
  async (config) => {
    // 1. Attach JWT Bearer Token if available
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Centralized Content-Type Enforcement:
    // - For FormData requests: delete Content-Type so Axios/fetch/native sets the boundary automatically
    // - For JSON requests: explicitly set Content-Type to application/json
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    console.log(`[API Request] ${(config.method || 'GET').toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized error & 401 Unauthorized handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response Success] ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    console.log(`[API Error] Status: ${status || 'Network Error'} URL: ${url} Message:`, error.response?.data || error.message);

    if (status === 401 || status === 403) {
      // Extract exact backend error message string
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Session expired. Please login again.';

      // Deduplicate simultaneous 401 responses
      if (!isHandling401) {
        isHandling401 = true;
        console.log('Global 401 Intercepted - Backend message:', backendMessage);

        // Show exact backend error message
        Alert.alert('Session Expired', backendMessage);

        // Clear stored auth credentials
        await clearAuthSession();

        // Notify AuthContext to trigger logout state transition to Login screen
        if (unauthorizedListener) {
          unauthorizedListener(backendMessage);
        }

        // Reset deduplication lock after 2.5 seconds
        setTimeout(() => {
          isHandling401 = false;
        }, 2500);
      }
    }

    return Promise.reject(error);
  }
);