import { Payment } from '@/types';
import { api } from './api';

export const paymentService = {
  getAll: async (salesMemberId?: string): Promise<Payment[]> => {
    try {
      const endpoint = salesMemberId ? `/payments?salesMemberId=${salesMemberId}` : '/payments';
      const res = await api.get<{
        success: boolean;
        payments: any[];
      }>(endpoint);

      return (res.payments || []).map((p) => ({
        id: p.id || p._id,
        paymentRef: p.paymentId || p.reference || `PAY-${p.id}`,
        customerId: p.customerId,
        customerName: p.customerName || 'Customer',
        company: p.company || '',
        totalAmount: p.totalAmount || p.amount || 0,
        amountPaid: p.amount || p.amountPaid || 0,
        remaining: p.remaining || 0,
        paymentStatus: p.paymentStatus || 'Paid',
        paymentMethod: p.paymentMethod || 'Bank Transfer',
        paymentDate: p.paymentDate || (p.createdAt ? p.createdAt.split('T')[0] : ''),
        dueDate: p.dueDate || '',
        notes: p.notes || '',
        createdAt: p.createdAt || new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('[paymentService.getAll] Notice:', err.message);
      return [];
    }
  },

  create: async (data: Omit<Payment, 'id' | 'paymentRef' | 'createdAt'>): Promise<Payment> => {
    try {
      const res = await api.post<{
        success: boolean;
        payment: any;
        customerBalance?: any;
      }>('/payments', {
        customerId: data.customerId,
        amount: data.amountPaid || (data as any).amount || 0,
        paymentMethod: data.paymentMethod || 'Bank Transfer',
        paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
        reference: (data as any).reference || '',
        notes: data.notes || '',
      });

      const p = res.payment;
      return {
        id: p.id || p._id,
        paymentRef: p.paymentId || p.reference || 'PAY-NEW',
        customerId: p.customerId,
        customerName: p.customerName || data.customerName,
        company: data.company || '',
        totalAmount: data.totalAmount || p.amount,
        amountPaid: p.amount || data.amountPaid,
        remaining: res.customerBalance?.remainingAmount ?? data.remaining,
        paymentStatus: (res.customerBalance?.paymentStatus as any) || data.paymentStatus || 'Paid',
        paymentMethod: p.paymentMethod || data.paymentMethod,
        paymentDate: p.paymentDate || data.paymentDate,
        dueDate: data.dueDate || '',
        notes: p.notes || data.notes || '',
        createdAt: p.createdAt || new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[paymentService.create] Error:', err.message);
      throw err;
    }
  },
};
