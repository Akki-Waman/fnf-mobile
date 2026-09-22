import { Platform } from 'react-native';
import { apiClient } from './api';
import {
  CommonApiResponse,
  SendOtpRequestDto,
  VerifyOtpRequestDto,
  OAuthLoginRequestDto,
  LoginResponseDto,
  CreateProfileRequestDto,
} from '../types/api';

const MAX_PROFILE_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export interface ProfilePhotoFile {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
  fileSize?: number;
}

export const authApi = {
  /**
   * POST /auth/send-otp
   * Content-Type: multipart/form-data
   * Backend controller requires part "data" with Content-Type: application/json
   */
  sendOtp: async (
    payload: SendOtpRequestDto,
    profilePhoto?: ProfilePhotoFile | File | null,
  ): Promise<CommonApiResponse<string>> => {
    console.log('[authApi] Hitting POST /auth/send-otp (multipart/form-data) with payload:', payload);

    if (profilePhoto) {
      const fileSize = (profilePhoto as any).size ?? (profilePhoto as any).fileSize;
      if (fileSize && fileSize > MAX_PROFILE_PHOTO_SIZE) {
        throw new Error('Profile photo size exceeds the maximum allowed limit (10MB)');
      }
    }

    const formData = new FormData();
    const jsonString = JSON.stringify(payload);

    // Attach part "data" with Content-Type: application/json header
    if (typeof Blob !== 'undefined') {
      try {
        const jsonBlob = new Blob([jsonString], { type: 'application/json' });
        formData.append('data', jsonBlob as any);
      } catch {
        formData.append('data', {
          string: jsonString,
          type: 'application/json',
          name: 'data.json',
        } as any);
      }
    } else {
      formData.append('data', {
        string: jsonString,
        type: 'application/json',
        name: 'data.json',
      } as any);
    }

    if (profilePhoto) {
      if (typeof profilePhoto === 'object' && 'uri' in profilePhoto) {
        const photo = profilePhoto as ProfilePhotoFile;
        const filename = photo.name || photo.uri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = photo.type || (match ? `image/${match[1]}` : 'image/jpeg');

        formData.append('profilePhoto', {
          uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
          name: filename,
          type: type,
        } as any);
      } else {
        formData.append('profilePhoto', profilePhoto as any);
      }
    }

    try {
      const res = await apiClient.post<CommonApiResponse<string>>('/auth/send-otp', formData);
      return res.data;
    } catch (error: any) {
      console.log('[authApi] Send OTP error:', error?.response?.status, error?.response?.data || error.message);
      if (error?.response?.status === 413) {
        throw new Error('Profile photo size exceeds the maximum allowed limit (10MB)');
      }
      throw error;
    }
  },

  // POST /auth/verify-otp (JSON body)
  verifyOtp: async (payload: VerifyOtpRequestDto): Promise<CommonApiResponse<LoginResponseDto>> => {
    const res = await apiClient.post<CommonApiResponse<LoginResponseDto>>('/auth/verify-otp', payload);
    return res.data;
  },

  // POST /auth/oauth (JSON body)
  oauthLogin: async (payload: OAuthLoginRequestDto): Promise<CommonApiResponse<LoginResponseDto>> => {
    const res = await apiClient.post<CommonApiResponse<LoginResponseDto>>('/auth/oauth', payload);
    return res.data;
  },

  // POST /auth/create-profile (JSON body)
  createProfile: async (payload: CreateProfileRequestDto): Promise<CommonApiResponse<string>> => {
    const res = await apiClient.post<CommonApiResponse<string>>('/auth/create-profile', payload);
    return res.data;
  },
};
