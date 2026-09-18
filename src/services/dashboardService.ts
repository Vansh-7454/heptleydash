import { api } from './api';

export interface DashboardStats {
  role: 'admin' | 'sales';
  totalSalesMembers?: number;
  totalCustomers?: number;
  activeCustomers?: number;
  openLeads?: number;
  pendingFollowUps?: number;
  overdueFollowUps?: number;
  totalRevenue?: number;
  totalCollected?: number;
  totalOutstanding?: number;
  myCustomers?: number;
  myOpenLeads?: number;
  todayFollowUps?: number;
  completedFollowUps?: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats | null> => {
    try {
      const res = await api.get<{
        success: boolean;
        role: 'admin' | 'sales';
        stats: any;
      }>('/dashboard/stats');

      return {
        role: res.role,
        ...res.stats,
      };
    } catch (err: any) {
      console.warn('[dashboardService.getStats] Notice:', err.message);
      return null;
    }
  },
};
