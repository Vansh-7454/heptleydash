import { Notification } from '@/types';
import { api } from './api';

export const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    try {
      const res = await api.get<{
        success: boolean;
        count: number;
        unreadCount: number;
        notifications: any[];
      }>('/notifications');

      return (res.notifications || []).map((n) => ({
        id: n.id || n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        timestamp: n.createdAt || n.timestamp || new Date().toISOString(),
        read: Boolean(n.read),
        targetTab: n.targetTab || undefined,
        targetId: n.targetId || undefined,
      }));
    } catch (err: any) {
      console.warn('[notificationService.getAll] Notice:', err.message);
      return [];
    }
  },

  markAsRead: async (id: string): Promise<Notification> => {
    try {
      const res = await api.patch<{
        success: boolean;
        notification: any;
      }>(`/notifications/${id}/read`);

      const n = res.notification;
      return {
        id: n.id || n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        timestamp: n.createdAt || new Date().toISOString(),
        read: true,
        targetTab: n.targetTab,
        targetId: n.targetId,
      };
    } catch (err: any) {
      console.error('[notificationService.markAsRead] Error:', err.message);
      throw err;
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await api.patch('/notifications/read-all');
    } catch (err: any) {
      console.error('[notificationService.markAllAsRead] Error:', err.message);
      throw err;
    }
  },
};
