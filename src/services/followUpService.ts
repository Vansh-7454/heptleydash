import { FollowUp } from '@/types';
import { api } from './api';

export const followUpService = {
  getAll: async (
    params?: string | { salesMemberId?: string; filter?: 'today' | 'upcoming' | 'overdue' | 'completed'; status?: string }
  ): Promise<FollowUp[]> => {
    try {
      let endpoint = '/follow-ups';
      if (typeof params === 'string') {
        endpoint = `/follow-ups?salesMemberId=${params}`;
      } else if (params && typeof params === 'object') {
        const q = new URLSearchParams();
        if (params.salesMemberId) q.append('salesMemberId', params.salesMemberId);
        if (params.filter) q.append('filter', params.filter);
        if (params.status) q.append('status', params.status);
        const queryStr = q.toString();
        if (queryStr) endpoint = `/follow-ups?${queryStr}`;
      }

      const res = await api.get<{
        success: boolean;
        followUps: any[];
      }>(endpoint);

      return (res.followUps || []).map((f) => ({
        id: f.id || f._id,
        followUpId: f.followUpId,
        title: f.title,
        entityType: (f.entityType?.toLowerCase() === 'lead' ? 'lead' : 'customer') as 'customer' | 'lead',
        entityId: f.entityId || f.customerId || f.leadId || '',
        entityName: f.entityName,
        company: f.company || '',
        assignedSalesMemberId: f.salesMemberId || f.assignedSalesMemberId || 'SM-001',
        assignedSalesMemberName: f.salesMemberName || f.assignedSalesMemberName || '',
        date: f.date,
        time: f.time,
        type: f.type,
        note: f.note || '',
        status: f.status,
        createdAt: f.createdAt || new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('[followUpService.getAll] Notice:', err.message);
      throw err;
    }
  },

  create: async (data: Omit<FollowUp, 'id' | 'followUpId' | 'createdAt'>): Promise<FollowUp> => {
    try {
      const res = await api.post<{
        success: boolean;
        followUp: any;
      }>('/follow-ups', {
        ...data,
        customerId: data.entityType === 'customer' ? data.entityId : undefined,
        leadId: data.entityType === 'lead' ? data.entityId : undefined,
        salesMemberId: data.assignedSalesMemberId,
      });

      const f = res.followUp;
      return {
        id: f.id || f._id,
        followUpId: f.followUpId,
        title: f.title,
        entityType: (f.entityType?.toLowerCase() === 'lead' ? 'lead' : 'customer') as 'customer' | 'lead',
        entityId: f.entityId || f.customerId || f.leadId || data.entityId,
        entityName: f.entityName,
        company: f.company || '',
        assignedSalesMemberId: f.salesMemberId || data.assignedSalesMemberId,
        assignedSalesMemberName: f.salesMemberName || data.assignedSalesMemberName || '',
        date: f.date,
        time: f.time,
        type: f.type,
        note: f.note || '',
        status: f.status,
        createdAt: f.createdAt || new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[followUpService.create] Error:', err.message);
      throw err;
    }
  },

  update: async (id: string, updates: Partial<FollowUp>): Promise<FollowUp> => {
    try {
      const payload: any = { ...updates };
      if (updates.assignedSalesMemberId) {
        payload.salesMemberId = updates.assignedSalesMemberId;
      }

      const res = await api.patch<{
        success: boolean;
        followUp: any;
      }>(`/follow-ups/${id}`, payload);

      const f = res.followUp;
      return {
        id: f.id || f._id,
        followUpId: f.followUpId,
        title: f.title,
        entityType: (f.entityType?.toLowerCase() === 'lead' ? 'lead' : 'customer') as 'customer' | 'lead',
        entityId: f.entityId || f.customerId || f.leadId || '',
        entityName: f.entityName,
        company: f.company || '',
        assignedSalesMemberId: f.salesMemberId || f.assignedSalesMemberId || '',
        assignedSalesMemberName: f.salesMemberName || f.assignedSalesMemberName || '',
        date: f.date,
        time: f.time,
        type: f.type,
        note: f.note || '',
        status: f.status,
        createdAt: f.createdAt,
      };
    } catch (err: any) {
      console.error('[followUpService.update] Error:', err.message);
      throw err;
    }
  },

  complete: async (id: string): Promise<FollowUp> => {
    try {
      const res = await api.patch<{ success: boolean; followUp: any }>(`/follow-ups/${id}/complete`);
      const f = res.followUp;
      return {
        id: f.id || f._id,
        followUpId: f.followUpId,
        title: f.title,
        entityType: (f.entityType?.toLowerCase() === 'lead' ? 'lead' : 'customer') as 'customer' | 'lead',
        entityId: f.entityId || f.customerId || f.leadId || '',
        entityName: f.entityName,
        company: f.company || '',
        assignedSalesMemberId: f.salesMemberId,
        assignedSalesMemberName: f.salesMemberName || '',
        date: f.date,
        time: f.time,
        type: f.type,
        note: f.note || '',
        status: 'Completed',
        createdAt: f.createdAt,
      };
    } catch (err: any) {
      console.error('[followUpService.complete] Error:', err.message);
      throw err;
    }
  },

  cancel: async (id: string): Promise<FollowUp> => {
    try {
      const res = await api.patch<{ success: boolean; followUp: any }>(`/follow-ups/${id}/cancel`);
      const f = res.followUp;
      return {
        id: f.id || f._id,
        followUpId: f.followUpId,
        title: f.title,
        entityType: (f.entityType?.toLowerCase() === 'lead' ? 'lead' : 'customer') as 'customer' | 'lead',
        entityId: f.entityId || f.customerId || f.leadId || '',
        entityName: f.entityName,
        company: f.company || '',
        assignedSalesMemberId: f.salesMemberId,
        assignedSalesMemberName: f.salesMemberName || '',
        date: f.date,
        time: f.time,
        type: f.type,
        note: f.note || '',
        status: 'Cancelled',
        createdAt: f.createdAt,
      };
    } catch (err: any) {
      console.error('[followUpService.cancel] Error:', err.message);
      throw err;
    }
  },

  markComplete: async (id: string): Promise<FollowUp> => {
    return followUpService.complete(id);
  },

  markCompleted: async (id: string): Promise<FollowUp> => {
    return followUpService.complete(id);
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/follow-ups/${id}`);
      return true;
    } catch (err: any) {
      console.error('[followUpService.delete] Error:', err.message);
      return false;
    }
  },
};
