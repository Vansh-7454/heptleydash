import { Website } from '@/types';
import { api } from './api';

export const websiteService = {
  getAll: async (params?: { customerId?: string; developerId?: string; status?: string }): Promise<Website[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.customerId) searchParams.append('customerId', params.customerId);
      if (params?.developerId) searchParams.append('developerId', params.developerId);
      if (params?.status) searchParams.append('status', params.status);

      const qs = searchParams.toString();
      const endpoint = qs ? `/websites?${qs}` : '/websites';

      const res = await api.get<{
        success: boolean;
        websites: Website[];
      }>(endpoint);

      return res.websites || [];
    } catch (err: any) {
      console.warn('[websiteService.getAll] Error:', err.message);
      throw err;
    }
  },

  getById: async (id: string): Promise<Website | undefined> => {
    try {
      const res = await api.get<{
        success: boolean;
        website: Website;
      }>(`/websites/${id}`);
      return res.website;
    } catch (err: any) {
      console.error('[websiteService.getById] Error:', err.message);
      return undefined;
    }
  },

  create: async (data: Partial<Website>): Promise<Website> => {
    try {
      const res = await api.post<{
        success: boolean;
        website: Website;
      }>('/websites', data);
      return res.website;
    } catch (err: any) {
      console.error('[websiteService.create] Error:', err.message);
      throw err;
    }
  },

  update: async (id: string, data: Partial<Website>): Promise<Website> => {
    try {
      const res = await api.patch<{
        success: boolean;
        website: Website;
      }>(`/websites/${id}`, data);
      return res.website;
    } catch (err: any) {
      console.error('[websiteService.update] Error:', err.message);
      throw err;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/websites/${id}`);
    } catch (err: any) {
      console.error('[websiteService.delete] Error:', err.message);
      throw err;
    }
  },
};
