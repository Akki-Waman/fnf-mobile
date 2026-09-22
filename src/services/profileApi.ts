import { Platform } from 'react-native';
import { apiClient } from './api';
import {
  CommonApiResponse,
  UserProfilesResponseDto,
  UserProfileResponseDto,
  UpdateUserProfileRequestDto,
  UpdatePrivacyRequestDto,
} from '../types/api';

export const profileApi = {
  // GET /user/profile/me
  getMyProfile: async (): Promise<CommonApiResponse<UserProfilesResponseDto>> => {
    const res = await apiClient.get<CommonApiResponse<UserProfilesResponseDto>>('/user/profile/me');
    return res.data;
  },

  // PUT /user/profile/update
  updateProfile: async (
    payload: UpdateUserProfileRequestDto,
  ): Promise<CommonApiResponse<UserProfileResponseDto>> => {
    const res = await apiClient.put<CommonApiResponse<UserProfileResponseDto>>(
      '/user/profile/update',
      payload,
    );
    return res.data;
  },

  // PUT /user/profile/photo (multipart/form-data)
  uploadProfilePhoto: async (
    photoUri: string,
  ): Promise<CommonApiResponse<any>> => {
    const formData = new FormData();
    const filename = photoUri.split('/').pop() || 'profile.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const photoObj = {
      uri: Platform.OS === 'android' ? photoUri : photoUri.replace('file://', ''),
      name: filename,
      type: type,
    } as any;

    formData.append('photo', photoObj);
    formData.append('profilePhoto', photoObj);

    try {
      const res = await apiClient.put<CommonApiResponse<any>>('/user/profile/photo', formData);
      return res.data;
    } catch (err: any) {
      try {
        const resPost = await apiClient.post<CommonApiResponse<any>>('/user/profile/photo', formData);
        return resPost.data;
      } catch {
        return { success: false, message: 'Server photo upload bypassed', data: null };
      }
    }
  },

  // PUT /user/profile/privacy
  updatePrivacy: async (
    payload: UpdatePrivacyRequestDto,
  ): Promise<CommonApiResponse<string>> => {
    const res = await apiClient.put<CommonApiResponse<string>>('/user/profile/privacy', payload);
    return res.data;
  },
};

