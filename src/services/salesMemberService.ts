import { SalesMember } from '@/types';
import { api } from './api';

export const salesMemberService = {
  getAll: async (): Promise<SalesMember[]> => {
    try {
      const res = await api.get<{
        success: boolean;
        salesMembers: Array<{
          id: string;
          memberId: string;
          name: string;
          email: string;
          phone: string;
          status: 'Active' | 'Inactive';
          assignedCustomersCount?: number;
          customerCount?: number;
          createdAt: string;
        }>;
      }>('/users/sales-members');

      return res.salesMembers.map((m) => ({
        id: m.id,
        memberId: m.memberId,
        name: m.name,
        email: m.email,
        phone: m.phone || '',
        status: m.status,
        customerCount: m.assignedCustomersCount || m.customerCount || 0,
        joiningDate: m.createdAt ? m.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: m.createdAt || new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('[salesMemberService.getAll] Notice:', err.message);
      throw err;
    }
  },

  getById: async (idOrMemberId: string): Promise<SalesMember | undefined> => {
    try {
      const res = await api.get<{
        success: boolean;
        salesMember: any;
      }>(`/users/sales-members/${idOrMemberId}`);

      const m = res.salesMember;
      return {
        id: m.id,
        memberId: m.memberId,
        name: m.name,
        email: m.email,
        phone: m.phone || '',
        status: m.status,
        customerCount: m.assignedCustomersCount || 0,
        joiningDate: m.createdAt ? m.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: m.createdAt,
      };
    } catch (err: any) {
      console.error('[salesMemberService.getById] Error:', err.message);
      return undefined;
    }
  },

  create: async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    status: 'Active' | 'Inactive';
  }): Promise<SalesMember> => {
    try {
      const res = await api.post<{
        success: boolean;
        salesMember: any;
      }>('/users/sales-members', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password || 'sales123',
        status: data.status ? data.status.toLowerCase() : 'active',
      });

      const m = res.salesMember;
      return {
        id: m.id,
        memberId: m.memberId,
        name: m.name,
        email: m.email,
        phone: m.phone || '',
        status: m.status,
        customerCount: 0,
        joiningDate: new Date().toISOString().split('T')[0],
        createdAt: m.createdAt || new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[salesMemberService.create] Error:', err.message);
      throw err;
    }
  },

  update: async (id: string, data: Partial<SalesMember>): Promise<SalesMember> => {
    try {
      const res = await api.patch<{
        success: boolean;
        salesMember: any;
      }>(`/users/sales-members/${id}`, data);

      const m = res.salesMember;
      return {
        id: m.id,
        memberId: m.memberId,
        name: m.name,
        email: m.email,
        phone: m.phone || '',
        status: m.status,
        customerCount: m.assignedCustomersCount || 0,
        joiningDate: m.createdAt ? m.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: m.createdAt,
      };
    } catch (err: any) {
      console.error('[salesMemberService.update] Error:', err.message);
      throw err;
    }
  },

  updateStatus: async (id: string, status: 'Active' | 'Inactive'): Promise<SalesMember> => {
    try {
      const res = await api.patch<{
        success: boolean;
        salesMember: any;
      }>(`/users/sales-members/${id}/status`, {
        status: status.toLowerCase(),
      });

      const m = res.salesMember;
      return {
        id: m.id,
        memberId: m.memberId,
        name: m.name,
        email: m.email,
        phone: m.phone || '',
        status: m.status,
        customerCount: 0,
        joiningDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[salesMemberService.updateStatus] Error:', err.message);
      throw err;
    }
  },

  toggleStatus: async (id: string): Promise<SalesMember> => {
    const member = await salesMemberService.getById(id);
    const nextStatus = member?.status === 'Active' ? 'Inactive' : 'Active';
    return salesMemberService.updateStatus(id, nextStatus);
  },
};
