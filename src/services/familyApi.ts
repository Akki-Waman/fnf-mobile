// src/services/familyApi.ts
import { apiClient, API_BASE_URL } from './api';
import {
  CommonApiResponse,
  HomeDashboardResponseDto,
  FamilyMemberResponseDto,
  CreateFamilyMemberRequestDto,
} from '../types/api';

/**
 * Resolves full photo URL for a family member node.
 * Supports relative path like '/api/v1/family/node/5/photo' or a nodeId number/string.
 */
export const getPhotoUrl = (
  nodeIdOrUrl?: number | string | null,
  timestamp?: number,
): string | null => {
  if (!nodeIdOrUrl) return null;
  const str = String(nodeIdOrUrl).trim();
  if (!str) return null;

  let url = '';
  if (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('file://') ||
    str.startsWith('content://') ||
    str.startsWith('ph://') ||
    str.startsWith('blob:') ||
    str.startsWith('data:')
  ) {
    url = str;
  } else if (str.startsWith('/')) {
    const matchNodeId = str.match(/\/family\/node\/(\d+)\/photo/);
    if (matchNodeId && matchNodeId[1]) {
      url = `${API_BASE_URL}/family/node/${matchNodeId[1]}/photo`;
    } else {
      const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '').replace(/\/fnf\/api\/v1\/?$/, '');
      url = `${origin}${str}`;
    }
  } else {
    url = `${API_BASE_URL}/family/node/${str}/photo`;
  }

  if (
    timestamp &&
    !url.startsWith('file://') &&
    !url.startsWith('content://') &&
    !url.startsWith('ph://') &&
    !url.startsWith('data:')
  ) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}t=${timestamp}`;
  }

  return url;
};

export const resolvePhotoUrl = getPhotoUrl;

export const familyApi = {
  // Utility photo URL resolver
  getPhotoUrl,
  resolvePhotoUrl: getPhotoUrl,

  // GET /api/v1/family/tree
  getFamilyTree: async (): Promise<CommonApiResponse<HomeDashboardResponseDto>> => {
    const res = await apiClient.get<CommonApiResponse<HomeDashboardResponseDto>>('/family/tree');
    return res.data;
  },

  /**
   * POST /api/v1/family/node (multipart/form-data)
   * Parts:
   *  1. "data" - JSON string
   *  2. "photo" - optional image file
   */
  addFamilyMember: async (
    data: CreateFamilyMemberRequestDto | FormData,
    photoFile?: any,
  ): Promise<CommonApiResponse<FamilyMemberResponseDto>> => {
    let formData: FormData;

    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();

      // Append "data" field as JSON string (React Native / Expo standard pattern)
      formData.append('data', JSON.stringify({
        familyId: data.familyId ?? 1,
        userId: data.userId ?? null,
        parentMemberId: data.parentMemberId ?? null,
        memberName: data.memberName || data.member_name || '',
        relationshipType: data.relationshipType || data.relationship_type || 'OTHER',
        gender: data.gender || 'MALE',
        dateOfBirth: data.dateOfBirth || data.date_of_birth || '1990-01-01',
      }));

      // Append optional "photo" image file
      if (photoFile) {
        if (typeof photoFile === 'string') {
          const filename = photoFile.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          formData.append('photo', {
            uri: photoFile,
            name: filename,
            type,
          } as any);
        } else if (photoFile.uri) {
          formData.append('photo', {
            uri: photoFile.uri,
            type: photoFile.mimeType || photoFile.type || 'image/jpeg',
            name: photoFile.fileName || photoFile.name || photoFile.uri.split('/').pop() || 'photo.jpg',
          } as any);
        } else {
          formData.append('photo', photoFile);
        }
      }
    }

    const res = await apiClient.post<CommonApiResponse<FamilyMemberResponseDto>>(
      '/family/node',
      formData,
    );
    return res.data;
  },

  /**
   * PUT /api/v1/family/node/{nodeId}/photo (multipart/form-data)
   * Sends ONLY the "photo" part (no "data" part needed)
   */
  updateMemberPhoto: async (
    nodeId: number | string,
    photoFile: any,
  ): Promise<CommonApiResponse<FamilyMemberResponseDto>> => {
    const formData = new FormData();

    if (typeof photoFile === 'string') {
      const filename = photoFile.split('/').pop() || 'photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      formData.append('photo', {
        uri: photoFile,
        name: filename,
        type,
      } as any);
    } else if (photoFile.uri) {
      formData.append('photo', {
        uri: photoFile.uri,
        type: photoFile.mimeType || photoFile.type || 'image/jpeg',
        name: photoFile.fileName || photoFile.name || photoFile.uri.split('/').pop() || 'photo.jpg',
      } as any);
    } else {
      formData.append('photo', photoFile);
    }

    const res = await apiClient.put<CommonApiResponse<FamilyMemberResponseDto>>(
      `/family/node/${nodeId}/photo`,
      formData,
    );
    return res.data;
  },

  // DELETE /api/v1/family/node/{nodeId}
  removeFamilyMember: async (
    nodeId: number | string,
  ): Promise<CommonApiResponse<string>> => {
    const res = await apiClient.delete<CommonApiResponse<string>>(`/family/node/${nodeId}`);
    return res.data;
  },

  // Backward compatibility aliases
  addFamilyMemberNode: async (
    dataOrFormData: CreateFamilyMemberRequestDto | FormData,
    photoFile?: any,
  ): Promise<CommonApiResponse<FamilyMemberResponseDto>> => {
    return familyApi.addFamilyMember(dataOrFormData, photoFile);
  },

  removeFamilyMemberNode: async (
    nodeId: number | string,
  ): Promise<CommonApiResponse<string>> => {
    return familyApi.removeFamilyMember(nodeId);
  },
};
