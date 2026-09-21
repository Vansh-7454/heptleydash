import { SalesQuestion, SalesQuestionPriority, SalesQuestionStatus } from '@/types';
import { api } from './api';

export const salesQuestionService = {
  getAll: async (params?: { status?: string; priority?: string; websiteId?: string; customerId?: string }): Promise<SalesQuestion[]> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append('status', params.status);
      if (params?.priority) searchParams.append('priority', params.priority);
      if (params?.websiteId) searchParams.append('websiteId', params.websiteId);
      if (params?.customerId) searchParams.append('customerId', params.customerId);

      const qs = searchParams.toString();
      const endpoint = qs ? `/sales-questions?${qs}` : '/sales-questions';

      const res = await api.get<{
        success: boolean;
        questions: SalesQuestion[];
      }>(endpoint);

      return res.questions || [];
    } catch (err: any) {
      console.warn('[salesQuestionService.getAll] Error:', err.message);
      throw err;
    }
  },

  getById: async (id: string): Promise<SalesQuestion | undefined> => {
    try {
      const res = await api.get<{
        success: boolean;
        question: SalesQuestion;
      }>(`/sales-questions/${id}`);
      return res.question;
    } catch (err: any) {
      console.error('[salesQuestionService.getById] Error:', err.message);
      return undefined;
    }
  },

  create: async (data: {
    question: string;
    subject?: string;
    customerId?: string;
    websiteId?: string;
    priority?: SalesQuestionPriority;
    assignedDeveloperId?: string;
  }): Promise<SalesQuestion> => {
    try {
      const res = await api.post<{
        success: boolean;
        question: SalesQuestion;
      }>('/sales-questions', data);
      return res.question;
    } catch (err: any) {
      console.error('[salesQuestionService.create] Error:', err.message);
      throw err;
    }
  },

  answer: async (id: string, answer: string, status: SalesQuestionStatus = 'ANSWERED'): Promise<SalesQuestion> => {
    try {
      const res = await api.post<{
        success: boolean;
        question: SalesQuestion;
      }>(`/sales-questions/${id}/answer`, { answer, status });
      return res.question;
    } catch (err: any) {
      console.error('[salesQuestionService.answer] Error:', err.message);
      throw err;
    }
  },

  update: async (id: string, data: Partial<SalesQuestion>): Promise<SalesQuestion> => {
    try {
      const res = await api.patch<{
        success: boolean;
        question: SalesQuestion;
      }>(`/sales-questions/${id}`, data);
      return res.question;
    } catch (err: any) {
      console.error('[salesQuestionService.update] Error:', err.message);
      throw err;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/sales-questions/${id}`);
    } catch (err: any) {
      console.error('[salesQuestionService.delete] Error:', err.message);
      throw err;
    }
  },
};
