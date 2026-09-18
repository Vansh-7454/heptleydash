import { Activity } from '@/types';
import { api } from './api';

export const activityService = {
  getAll: async (salesMemberId?: string): Promise<Activity[]> => {
    try {
      const endpoint = salesMemberId ? `/activities?salesMemberId=${salesMemberId}` : '/activities';
      const res = await api.get<{
        success: boolean;
        activities: any[];
      }>(endpoint);

      return (res.activities || []).map((a) => ({
        id: a.id || a._id,
        timestamp: a.timestamp || a.createdAt || new Date().toISOString(),
        userId: a.salesMemberId || 'SM-001',
        userName: a.salesMemberName || 'Team Member',
        userRole: 'sales',
        salesMemberId: a.salesMemberId,
        entityName: a.entityName || '',
        company: '',
        type: a.type || 'Note',
        description: a.description || a.title || '',
      }));
    } catch (err: any) {
      console.warn('[activityService.getAll] Notice:', err.message);
      return [];
    }
  },

  log: async (data: any): Promise<Activity> => {
    try {
      const isLead = data.entityType === 'lead';
      const entityId = data.entityId || data.customerId || data.leadId;
      const res = await api.post<{
        success: boolean;
        activity: any;
      }>('/activities', {
        title: data.title || data.description || 'Activity logged',
        type: data.type || 'Note',
        description: data.description || '',
        entityName: data.entityName || '',
        customerId: !isLead && entityId ? entityId : (data.customerId || undefined),
        leadId: isLead && entityId ? entityId : (data.leadId || undefined),
      });

      const a = res.activity;
      return {
        id: a.id || a._id,
        timestamp: a.timestamp || a.createdAt || new Date().toISOString(),
        userId: a.salesMemberId || data.userId || 'SM-001',
        userName: a.salesMemberName || data.userName || 'Team Member',
        userRole: data.userRole || 'sales',
        salesMemberId: a.salesMemberId,
        entityName: a.entityName || '',
        company: '',
        type: a.type || 'Note',
        description: a.description || '',
      };
    } catch (err: any) {
      console.warn('[activityService.log] Error:', err.message);
      throw err;
    }
  },
};
