// src/services/mockApiAdapter.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import {
  MOCK_PERSONAS,
  MockUserAccount,
  MOCK_INTELLIGENCE_METRICS,
  MOCK_CELEBRATIONS,
  MOCK_NOTIFICATIONS,
  MOCK_MEMORIES,
} from './mockData';
import { CommonApiResponse } from '../types/api';

const MOCK_MODE_STORAGE_KEY = '@dev_mock_mode_active';
const MOCK_PERSONA_STORAGE_KEY = '@dev_mock_active_persona_id';
const MOCK_LATENCY_STORAGE_KEY = '@dev_mock_latency_ms';
const MOCK_SIMULATED_STATUS_KEY = '@dev_mock_simulated_status';

let mockModeEnabled = false; // Default OFF so requests go to live Spring Boot backend
let activePersonaId = 'persona_admin';
let simulatedLatencyMs = 300;
let simulatedHttpStatus = 200;

// Memory cache of family trees for mutations during session
let activeFamilyMembersStore: { [userId: number]: any[] } = {};

export const initMockStore = () => {
  MOCK_PERSONAS.forEach((p) => {
    activeFamilyMembersStore[p.profile.userId] = [...p.familyDashboard.familyMembers];
  });
};

initMockStore();

export const getMockConfig = () => ({
  enabled: mockModeEnabled,
  personaId: activePersonaId,
  latencyMs: simulatedLatencyMs,
  status: simulatedHttpStatus,
  activePersona: MOCK_PERSONAS.find((p) => p.id === activePersonaId) || MOCK_PERSONAS[0],
});

export const setMockModeEnabled = async (enabled: boolean) => {
  mockModeEnabled = enabled;
  await AsyncStorage.setItem(MOCK_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
};

export const setActivePersona = async (personaId: string) => {
  const found = MOCK_PERSONAS.find((p) => p.id === personaId);
  if (found) {
    activePersonaId = personaId;
    await AsyncStorage.setItem(MOCK_PERSONA_STORAGE_KEY, personaId);
    await AsyncStorage.setItem('userToken', found.token);
    await AsyncStorage.setItem('profileCompleted', found.profile.profileCompleted ? 'true' : 'false');
  }
};

export const setSimulatedLatency = async (ms: number) => {
  simulatedLatencyMs = ms;
  await AsyncStorage.setItem(MOCK_LATENCY_STORAGE_KEY, ms.toString());
};

export const setSimulatedHttpStatus = async (status: number) => {
  simulatedHttpStatus = status;
  await AsyncStorage.setItem(MOCK_SIMULATED_STATUS_KEY, status.toString());
};

export const loadSavedMockState = async () => {
  try {
    const savedMode = await AsyncStorage.getItem(MOCK_MODE_STORAGE_KEY);
    if (savedMode !== null) {
      mockModeEnabled = savedMode === 'true';
    }
    const savedPersona = await AsyncStorage.getItem(MOCK_PERSONA_STORAGE_KEY);
    if (savedPersona && MOCK_PERSONAS.some((p) => p.id === savedPersona)) {
      activePersonaId = savedPersona;
    }
    const savedLatency = await AsyncStorage.getItem(MOCK_LATENCY_STORAGE_KEY);
    if (savedLatency) {
      simulatedLatencyMs = parseInt(savedLatency, 10) || 300;
    }
    const savedStatus = await AsyncStorage.getItem(MOCK_SIMULATED_STATUS_KEY);
    if (savedStatus) {
      simulatedHttpStatus = parseInt(savedStatus, 10) || 200;
    }
  } catch (err) {
    console.log('[MockAdapter] Error loading saved mock state:', err);
  }
};

const getActivePersonaData = (): MockUserAccount => {
  return MOCK_PERSONAS.find((p) => p.id === activePersonaId) || MOCK_PERSONAS[0];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Main Mock Interceptor function for AxiosApiClient
 */
export const registerMockApiInterceptor = (axiosInstance: AxiosInstance) => {
  // Load saved state asynchronously
  loadSavedMockState();

  axiosInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (!mockModeEnabled) {
        return config; // Pass-through to real backend
      }

      console.log(`[Mock API Engine] Intercepting ${config.method?.toUpperCase()} ${config.url}`);

      // Simulate artificial network latency
      if (simulatedLatencyMs > 0) {
        await delay(simulatedLatencyMs);
      }

      // Simulate forced HTTP Status Errors if configured (e.g. 500)
      if (simulatedHttpStatus !== 200) {
        const errorRes = {
          status: simulatedHttpStatus,
          statusText: simulatedHttpStatus === 500 ? 'Internal Server Error' : 'Unauthorized',
          data: {
            success: false,
            message: `Simulated ${simulatedHttpStatus} Error from Dev Harness`,
          },
          headers: {},
          config,
        };
        return Promise.reject({ response: errorRes, message: errorRes.data.message });
      }

      const url = config.url || '';
      const method = (config.method || 'get').toLowerCase();
      const persona = getActivePersonaData();
      const currentUserId = persona.profile.userId;

      let mockResponseData: CommonApiResponse<any> = {
        success: true,
        message: 'Mock response success',
        data: null,
      };

      // Route Matching Logic:
      if (url.includes('/auth/send-otp')) {
        mockResponseData = {
          success: true,
          message: 'OTP sent successfully to your mobile. Code: 123456',
          data: '123456',
        };
      } else if (url.includes('/auth/verify-otp')) {
        await AsyncStorage.setItem('userToken', persona.token);
        await AsyncStorage.setItem('profileCompleted', persona.profile.profileCompleted ? 'true' : 'false');
        mockResponseData = {
          success: true,
          message: 'OTP verified successfully',
          data: {
            jwt_token: persona.token,
            profile_completed: persona.profile.profileCompleted,
            user_id: persona.profile.userId,
          },
        };
      } else if (url.includes('/auth/oauth')) {
        await AsyncStorage.setItem('userToken', persona.token);
        await AsyncStorage.setItem('profileCompleted', 'true');
        mockResponseData = {
          success: true,
          message: 'OAuth login successful',
          data: {
            jwt_token: persona.token,
            profile_completed: true,
            user_id: persona.profile.userId,
          },
        };
      } else if (url.includes('/auth/create-profile')) {
        persona.profile.profileCompleted = true;
        await AsyncStorage.setItem('profileCompleted', 'true');
        mockResponseData = {
          success: true,
          message: 'Profile created successfully',
          data: 'Profile created',
        };
      } else if (url.includes('/family/tree')) {
        const memberList = activeFamilyMembersStore[currentUserId] || persona.familyDashboard.familyMembers;
        mockResponseData = {
          success: true,
          message: 'Family tree retrieved',
          data: {
            ...persona.familyDashboard,
            familyMembers: memberList,
          },
        };
      } else if (url.includes('/family/node') && method === 'post') {
        const currentList = activeFamilyMembersStore[currentUserId] || [];
        let newMemberName = 'New Family Member';
        let relType = 'OTHER';

        try {
          if (config.data instanceof FormData) {
            // Extract from FormData if available
            const dataPart = (config.data as any)._parts?.find((p: any) => p[0] === 'data');
            if (dataPart && dataPart[1]) {
              const parsed = JSON.parse(dataPart[1]);
              newMemberName = parsed.memberName || newMemberName;
              relType = parsed.relationshipType || relType;
            }
          }
        } catch (e) {
          console.log('[MockAdapter] Form parse fallback');
        }

        const newId = Date.now();
        const newMember = {
          familyMemberId: newId,
          userId: null,
          parentMemberId: currentUserId,
          memberName: newMemberName,
          relationshipType: relType,
          gender: 'MALE',
          dateOfBirth: '1995-05-15',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        };

        activeFamilyMembersStore[currentUserId] = [...currentList, newMember];
        mockResponseData = {
          success: true,
          message: 'Family member added',
          data: newMember,
        };
      } else if (url.includes('/family/node') && method === 'delete') {
        const parts = url.split('/');
        const nodeId = parseInt(parts[parts.length - 1], 10);
        const currentList = activeFamilyMembersStore[currentUserId] || [];
        activeFamilyMembersStore[currentUserId] = currentList.filter((m) => m.familyMemberId !== nodeId);

        mockResponseData = {
          success: true,
          message: 'Family member removed successfully',
          data: 'Success',
        };
      } else if (url.includes('/user/profile/me')) {
        mockResponseData = {
          success: true,
          message: 'Profile retrieved',
          data: persona.profile,
        };
      } else if (url.includes('/user/profile/update')) {
        const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
        if (body) {
          if (body.firstName) persona.profile.firstName = body.firstName;
          if (body.lastName) persona.profile.lastName = body.lastName;
          if (body.gender) persona.profile.gender = body.gender;
        }
        mockResponseData = {
          success: true,
          message: 'Profile updated successfully',
          data: {
            user_id: persona.profile.userId,
            first_name: persona.profile.firstName,
            last_name: persona.profile.lastName,
            email_address: persona.profile.emailAddress,
            mobile_number: persona.profile.mobileNumber,
            gender: persona.profile.gender,
            date_of_birth: persona.profile.dateOfBirth,
            profile_completed: persona.profile.profileCompleted,
          },
        };
      } else if (url.includes('/user/profile/photo')) {
        mockResponseData = {
          success: true,
          message: 'Profile photo updated',
          data: persona.profile.profilePhotoUrl,
        };
      } else if (url.includes('/intelligence/metrics')) {
        mockResponseData = {
          success: true,
          message: 'Metrics fetched',
          data: MOCK_INTELLIGENCE_METRICS,
        };
      } else if (url.includes('/intelligence/celebrations')) {
        mockResponseData = {
          success: true,
          message: 'Celebrations fetched',
          data: MOCK_CELEBRATIONS,
        };
      } else if (url.includes('/intelligence/notifications')) {
        mockResponseData = {
          success: true,
          message: 'Notifications fetched',
          data: MOCK_NOTIFICATIONS,
        };
      } else if (url.includes('/memories')) {
        mockResponseData = {
          success: true,
          message: 'Memories fetched',
          data: MOCK_MEMORIES,
        };
      }

      // Convert mock response into full AxiosResponse object
      const customAxiosResponse: AxiosResponse = {
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config,
      };

      // Throw custom adapter resolution so Axios returns custom response
      config.adapter = async () => customAxiosResponse;

      return config;
    },
    (error) => Promise.reject(error)
  );
};
