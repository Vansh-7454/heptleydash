import { api } from './api';

export interface DashboardStats {
  role: 'admin' | 'sales' | 'developer';
  // Admin operational metrics
  totalSalesMembers?: number;
  totalDevelopers?: number;
  totalCustomers?: number;
  openLeads?: number;
  pendingFollowUps?: number;
  activeWebsites?: number;
  activeDomains?: number;
  expiringDomains?: number;
  openSalesQuestions?: number;

  // Sales operational metrics
  myCustomers?: number;
  myOpenLeads?: number;
  todayFollowUps?: number;
  overdueFollowUps?: number;
  completedFollowUps?: number;
  myOpenQuestions?: number;

  // Developer operational metrics
  myWebsites?: number;
  openQuestions?: number;

  operationalStats?: any;
  developerStats?: any;
  [key: string]: any;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats | null> => {
    try {
      const res = await api.get<{
        success: boolean;
        role: 'admin' | 'sales' | 'developer';
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
