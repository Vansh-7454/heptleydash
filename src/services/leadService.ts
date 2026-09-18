import { Lead, Customer } from '@/types';
import { api } from './api';

export const leadService = {
  getAll: async (params?: string | { salesMemberId?: string; status?: string; search?: string }): Promise<Lead[]> => {
    try {
      let endpoint = '/leads';
      if (typeof params === 'string') {
        endpoint = `/leads?salesMemberId=${params}`;
      } else if (params && typeof params === 'object') {
        const q = new URLSearchParams();
        if (params.salesMemberId) q.append('salesMemberId', params.salesMemberId);
        if (params.status) q.append('status', params.status);
        if (params.search) q.append('search', params.search);
        const queryStr = q.toString();
        if (queryStr) endpoint = `/leads?${queryStr}`;
      }

      const res = await api.get<{
        success: boolean;
        leads: any[];
      }>(endpoint);

      return (res.leads || []).map((l) => ({
        id: l.id || l._id,
        leadId: l.leadId,
        name: l.name,
        company: l.company,
        email: l.email,
        phone: l.phone,
        interestedService: l.interestedService,
        source: l.source,
        status: l.status,
        assignedSalesMemberId: l.salesMemberId || l.assignedSalesMemberId || 'SM-001',
        assignedSalesMemberName: l.salesMemberName || l.assignedSalesMemberName || '',
        dealEstimate: l.dealEstimate || l.budget || 0,
        lastContactDate: l.lastContactAt || l.lastContactDate || '',
        nextFollowUpDate: l.nextFollowUpAt || l.nextFollowUpDate || '',
        notes: l.notes || '',
        isConverted: Boolean(l.isConverted),
        convertedCustomerId: l.convertedCustomerId || undefined,
        createdAt: l.createdAt || new Date().toISOString(),
      }));
    } catch (err: any) {
      console.warn('[leadService.getAll] Notice:', err.message);
      throw err;
    }
  },

  getById: async (idOrLeadId: string): Promise<Lead | undefined> => {
    try {
      const res = await api.get<{
        success: boolean;
        lead: any;
      }>(`/leads/${idOrLeadId}`);

      const l = res.lead;
      return {
        id: l.id || l._id,
        leadId: l.leadId,
        name: l.name,
        company: l.company,
        email: l.email,
        phone: l.phone,
        interestedService: l.interestedService,
        source: l.source,
        status: l.status,
        assignedSalesMemberId: l.salesMemberId || l.assignedSalesMemberId || 'SM-001',
        assignedSalesMemberName: l.salesMemberName || l.assignedSalesMemberName || '',
        dealEstimate: l.dealEstimate || l.budget || 0,
        lastContactDate: l.lastContactAt || '',
        nextFollowUpDate: l.nextFollowUpAt || '',
        notes: l.notes || '',
        isConverted: Boolean(l.isConverted),
        convertedCustomerId: l.convertedCustomerId || undefined,
        createdAt: l.createdAt,
      };
    } catch (err: any) {
      console.error('[leadService.getById] Error:', err.message);
      return undefined;
    }
  },

  create: async (data: Omit<Lead, 'id' | 'leadId' | 'createdAt'>): Promise<Lead> => {
    try {
      const res = await api.post<{
        success: boolean;
        lead: any;
      }>('/leads', {
        ...data,
        salesMemberId: data.assignedSalesMemberId,
      });

      const l = res.lead;
      return {
        id: l.id || l._id,
        leadId: l.leadId,
        name: l.name,
        company: l.company,
        email: l.email,
        phone: l.phone,
        interestedService: l.interestedService,
        source: l.source,
        status: l.status,
        assignedSalesMemberId: l.salesMemberId || data.assignedSalesMemberId,
        assignedSalesMemberName: l.salesMemberName || data.assignedSalesMemberName,
        dealEstimate: l.dealEstimate || data.dealEstimate || 0,
        lastContactDate: l.lastContactAt || '',
        nextFollowUpDate: l.nextFollowUpAt || '',
        notes: l.notes || '',
        isConverted: false,
        convertedCustomerId: undefined,
        createdAt: l.createdAt,
      };
    } catch (err: any) {
      console.error('[leadService.create] Error:', err.message);
      throw err;
    }
  },

  update: async (id: string, updates: Partial<Lead>): Promise<Lead> => {
    try {
      const payload: any = { ...updates };
      if (updates.assignedSalesMemberId) {
        payload.salesMemberId = updates.assignedSalesMemberId;
      }

      const res = await api.patch<{
        success: boolean;
        lead: any;
      }>(`/leads/${id}`, payload);

      const l = res.lead;
      return {
        id: l.id || l._id,
        leadId: l.leadId,
        name: l.name,
        company: l.company,
        email: l.email,
        phone: l.phone,
        interestedService: l.interestedService,
        source: l.source,
        status: l.status,
        assignedSalesMemberId: l.salesMemberId || l.assignedSalesMemberId,
        assignedSalesMemberName: l.salesMemberName || l.assignedSalesMemberName,
        dealEstimate: l.dealEstimate || 0,
        lastContactDate: l.lastContactAt || '',
        nextFollowUpDate: l.nextFollowUpAt || '',
        notes: l.notes || '',
        isConverted: Boolean(l.isConverted),
        convertedCustomerId: l.convertedCustomerId || undefined,
        createdAt: l.createdAt,
      };
    } catch (err: any) {
      console.error('[leadService.update] Error:', err.message);
      throw err;
    }
  },

  convert: async (
    id: string,
    customerData?: Partial<any>
  ): Promise<{ customer: Customer; lead: Lead }> => {
    try {
      const res = await api.post<{
        success: boolean;
        message: string;
        customer: any;
        lead: any;
      }>(`/leads/${id}/convert`, customerData || {});

      const c = res.customer;
      const l = res.lead;

      return {
        customer: {
          id: c.id || c._id,
          customerId: c.customerId,
          name: c.name,
          company: c.company,
          email: c.email,
          phone: c.phone,
          alternatePhone: c.alternatePhone,
          location: c.location,
          website: c.website,
          service: c.service,
          package: c.package,
          startDate: c.startDate,
          endDate: c.endDate,
          projectStatus: c.projectStatus,
          customerStatus: c.customerStatus,
          status: c.projectStatus,
          salesMemberId: c.salesMemberId,
          salesMemberName: c.salesMemberName,
          leadSource: c.leadSource,
          dealValue: c.dealValue,
          discount: c.discount,
          finalAmount: c.finalAmount,
          totalAmount: c.totalAmount,
          amountPaid: c.amountPaid,
          remainingAmount: c.remainingAmount,
          paymentStatus: c.paymentStatus,
          paymentMethod: c.paymentMethod,
          lastPaymentDate: c.lastPaymentDate,
          notes: c.notes,
          internalRemarks: c.internalRemarks,
          createdAt: c.createdAt,
        },
        lead: {
          id: l.id || l._id,
          leadId: l.leadId,
          name: l.name,
          company: l.company,
          email: l.email,
          phone: l.phone,
          interestedService: l.interestedService,
          source: l.source,
          status: l.status,
          assignedSalesMemberId: l.salesMemberId,
          assignedSalesMemberName: l.salesMemberName,
          dealEstimate: l.dealEstimate,
          isConverted: Boolean(l.isConverted),
          convertedCustomerId: l.convertedCustomerId || undefined,
          createdAt: l.createdAt,
        },
      };
    } catch (err: any) {
      console.error('[leadService.convert] Error:', err.message);
      throw err;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      await api.patch(`/leads/${id}`, { status: 'Lost' });
      return true;
    } catch (err: any) {
      console.error('[leadService.delete] Error:', err.message);
      return false;
    }
  },
};
