// src/services/intelligenceApi.ts
import { apiClient } from './api';
import { CommonApiResponse, IntelligenceMetricsDto } from '../types/api';

export const intelligenceApi = {
  // GET /intelligence/celebrations
  getUpcomingCelebrations: async (): Promise<CommonApiResponse<any[]>> => {
    const res = await apiClient.get<CommonApiResponse<any[]>>('/intelligence/celebrations');
    return res.data;
  },

  // GET /intelligence/metrics
  getDashboardMetrics: async (): Promise<CommonApiResponse<IntelligenceMetricsDto>> => {
    const res = await apiClient.get<CommonApiResponse<IntelligenceMetricsDto>>('/intelligence/metrics');
    return res.data;
  },

  // GET /intelligence/notifications
  getNotifications: async (): Promise<CommonApiResponse<any[]>> => {
    const res = await apiClient.get<CommonApiResponse<any[]>>('/intelligence/notifications');
    return res.data;
  },
};
