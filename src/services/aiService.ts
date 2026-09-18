import { api } from './api';

export interface AIServiceStatus {
  success: boolean;
  ready: boolean;
  model: string;
  message: string;
}

export interface CustomerSummaryResult {
  customerName: string;
  company: string;
  currentSituation: string;
  serviceStatus: string;
  financialSituation: string;
  recentActivity: string;
  pendingAttention: string;
  recommendedNextAction: string;
}

export interface FollowUpRecommendationResult {
  needsFollowUp: boolean;
  urgency: 'High' | 'Medium' | 'Low';
  reason: string;
  recommendedTiming: string;
  recommendedType: 'Call' | 'Email' | 'Meeting' | 'WhatsApp';
  keyDiscussionPoints: string[];
  suggestedFollowUpTitle: string;
}

export interface FollowUpMessageResult {
  purpose: string;
  channel: string;
  subject: string;
  message: string;
  keyDetailsIncluded: string[];
}

export interface LeadAnalysisResult {
  leadName: string;
  company: string;
  leadSummary: string;
  currentStage: string;
  requirements: string;
  missingInformation: string[];
  potentialConcerns: string[];
  suggestedQuestions: string[];
  recommendedNextAction: string;
}

export interface MeetingNotesResult {
  requirements: string[];
  budget: string | null;
  timeline: string | null;
  importantPoints: string[];
  nextAction: string;
  suggestedFollowUp?: {
    title: string;
    type: 'Call' | 'Email' | 'Meeting';
    recommendedDaysFromNow: number;
    agenda: string;
  };
}

export interface AgentChatResult {
  success: boolean;
  message: string;
  type: string;
  data: any;
  suggestedActions: string[];
  requiresConfirmation: boolean;
  proposedAction: {
    action: string;
    requiresConfirmation: boolean;
    proposedData: any;
    summary: string;
  } | null;
}

export const aiService = {
  getStatus: async (): Promise<AIServiceStatus> => {
    try {
      const res = await api.get<AIServiceStatus>('/ai/status', { requiresAuth: false });
      return res;
    } catch {
      return {
        success: false,
        ready: false,
        model: 'gemini-2.0-flash',
        message: 'Could not connect to backend AI service.',
      };
    }
  },

  getCustomerSummary: async (customerId: string): Promise<CustomerSummaryResult> => {
    const res = await api.post<{ success: boolean; summary: CustomerSummaryResult }>(
      '/ai/customer-summary',
      { customerId }
    );
    return res.summary;
  },

  getFollowUpRecommendation: async (customerId: string): Promise<FollowUpRecommendationResult> => {
    const res = await api.post<{ success: boolean; recommendation: FollowUpRecommendationResult }>(
      '/ai/follow-up-recommendation',
      { customerId }
    );
    return res.recommendation;
  },

  getFollowUpMessage: async (customerId: string, purpose: string): Promise<FollowUpMessageResult> => {
    const res = await api.post<{ success: boolean; draft: FollowUpMessageResult }>(
      '/ai/follow-up-message',
      { customerId, purpose }
    );
    return res.draft;
  },

  getLeadAnalysis: async (leadId: string): Promise<LeadAnalysisResult> => {
    const res = await api.post<{ success: boolean; analysis: LeadAnalysisResult }>(
      '/ai/lead-analysis',
      { leadId }
    );
    return res.analysis;
  },

  analyzeMeetingNotes: async (text: string): Promise<MeetingNotesResult> => {
    const res = await api.post<{ success: boolean; structured: MeetingNotesResult }>(
      '/ai/meeting-notes',
      { text }
    );
    return res.structured;
  },

  chatAgent: async (message: string, context?: { customerId?: string; leadId?: string }): Promise<AgentChatResult> => {
    const res = await api.post<AgentChatResult>('/ai/agent', { message, context });
    return res;
  },

  confirmAction: async (action: string, proposedData: any): Promise<{ success: boolean; message: string; entity: any }> => {
    const res = await api.post<{ success: boolean; message: string; entity: any }>(
      '/ai/confirm-action',
      { action, proposedData }
    );
    return res;
  },
};
