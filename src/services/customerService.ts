import { Customer } from '@/types';
import { api } from './api';

export const customerService = {
  getAll: async (
    params?: string | { salesMemberId?: string; search?: string; status?: string; service?: string; paymentStatus?: string }
  ): Promise<Customer[]> => {
    try {
      let endpoint = '/customers';
      if (typeof params === 'string') {
        endpoint = `/customers?salesMemberId=${params}`;
      } else if (params && typeof params === 'object') {
        const q = new URLSearchParams();
        if (params.salesMemberId) q.append('salesMemberId', params.salesMemberId);
        if (params.search) q.append('search', params.search);
        if (params.status) q.append('status', params.status);
        if (params.service) q.append('service', params.service);
        if (params.paymentStatus) q.append('paymentStatus', params.paymentStatus);
        const queryStr = q.toString();
        if (queryStr) endpoint = `/customers?${queryStr}`;
      }

      const res = await api.get<{
        success: boolean;
        customers: any[];
      }>(endpoint);
      return (res.customers || []).map((c: any) => ({
        ...c,
        id: c.id || c._id,
        status: c.status || c.customerStatus || 'Active',
        customerStatus: c.customerStatus || c.status || 'Active',
      }));
    } catch (err: any) {
      console.warn('[customerService.getAll] Notice:', err.message);
      throw err;
    }
  },

  getById: async (idOrCustomerId: string): Promise<Customer | undefined> => {
    try {
      const res = await api.get<{
        success: boolean;
        customer: any;
      }>(`/customers/${idOrCustomerId}`);
      if (!res.customer) return undefined;
      const c = res.customer;
      return {
        ...c,
        id: c.id || c._id,
        status: c.status || c.customerStatus || 'Active',
        customerStatus: c.customerStatus || c.status || 'Active',
      };
    } catch (err: any) {
      console.error('[customerService.getById] Error:', err.message);
      return undefined;
    }
  },

  create: async (data: Omit<Customer, 'id' | 'customerId' | 'createdAt'>): Promise<Customer> => {
    try {
      const res = await api.post<{
        success: boolean;
        customer: any;
      }>('/customers', data);
      const c = res.customer;
      return {
        ...c,
        id: c.id || c._id,
        status: c.status || c.customerStatus || 'Active',
        customerStatus: c.customerStatus || c.status || 'Active',
      };
    } catch (err: any) {
      console.error('[customerService.create] Error:', err.message);
      throw err;
    }
  },

  update: async (id: string, data: Partial<Customer>): Promise<Customer> => {
    try {
      const res = await api.patch<{
        success: boolean;
        customer: any;
      }>(`/customers/${id}`, data);
      const c = res.customer;
      return {
        ...c,
        id: c.id || c._id,
        status: c.status || c.customerStatus || 'Active',
        customerStatus: c.customerStatus || c.status || 'Active',
      };
    } catch (err: any) {
      console.error('[customerService.update] Error:', err.message);
      throw err;
    }
  },

  updatePayment: async (
    id: string,
    additionalAmount: number,
    paymentMethod?: string,
    paymentDate?: string
  ): Promise<Customer> => {
    try {
      const res = await api.post<{
        success: boolean;
        customerBalance: any;
      }>('/payments', {
        customerId: id,
        amount: additionalAmount,
        paymentMethod: paymentMethod || 'Bank Wire',
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      });

      // Refetch latest customer object
      const updated = await customerService.getById(id);
      if (!updated) throw new Error('Failed to refetch customer after payment.');
      return updated;
    } catch (err: any) {
      console.error('[customerService.updatePayment] Error:', err.message);
      throw err;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      // Soft-delete: update status to Inactive
      await api.patch(`/customers/${id}`, { customerStatus: 'Inactive' });
      return true;
    } catch (err: any) {
      console.error('[customerService.delete] Error:', err.message);
      return false;
    }
  },
};
