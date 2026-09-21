import { Domain } from '@/types';
import { api } from './api';

export const domainService = {
  getAll: async (params?: { websiteId?: string; customerId?: string; status?: string }): Promise<Domain[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.websiteId) searchParams.append('websiteId', params.websiteId);
      if (params?.customerId) searchParams.append('customerId', params.customerId);
      if (params?.status) searchParams.append('status', params.status);

      const qs = searchParams.toString();
      const endpoint = qs ? `/domains?${qs}` : '/domains';

      const res = await api.get<{
        success: boolean;
        domains: Domain[];
      }>(endpoint);

      return res.domains || [];
    } catch (err: any) {
      console.warn('[domainService.getAll] Error:', err.message);
      throw err;
    }
  },

  getById: async (id: string): Promise<Domain | undefined> => {
    try {
      const res = await api.get<{
        success: boolean;
        domain: Domain;
      }>(`/domains/${id}`);
      return res.domain;
    } catch (err: any) {
      console.error('[domainService.getById] Error:', err.message);
      return undefined;
    }
  },

  create: async (data: Partial<Domain>): Promise<Domain> => {
    try {
      const res = await api.post<{
        success: boolean;
        domain: Domain;
      }>('/domains', data);
      return res.domain;
    } catch (err: any) {
      console.error('[domainService.create] Error:', err.message);
      throw err;
    }
  },

  update: async (id: string, data: Partial<Domain>): Promise<Domain> => {
    try {
      const res = await api.patch<{
        success: boolean;
        domain: Domain;
      }>(`/domains/${id}`, data);
      return res.domain;
    } catch (err: any) {
      console.error('[domainService.update] Error:', err.message);
      throw err;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/domains/${id}`);
    } catch (err: any) {
      console.error('[domainService.delete] Error:', err.message);
      throw err;
    }
  },
};
