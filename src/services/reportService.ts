import { customerService } from './customerService';
import { leadService } from './leadService';
import { salesMemberService } from './salesMemberService';
import { followUpService } from './followUpService';

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}

export interface MemberPerformance {
  memberId: string;
  name: string;
  activeAccounts: number;
  totalDealsValue: number;
  closedWonCount: number;
  followUpRate: number;
}

export interface ReportSummary {
  funnel: FunnelStage[];
  performance: MemberPerformance[];
  financials: {
    totalBilled: number;
    totalCollected: number;
    totalOutstanding: number;
    collectionRate: number;
  };
}

export const reportService = {
  getSummary: async (): Promise<ReportSummary> => {
    const [customers, leads, members, followUps] = await Promise.all([
      customerService.getAll(),
      leadService.getAll(),
      salesMemberService.getAll(),
      followUpService.getAll(),
    ]);

    // 1. Funnel Breakdown from real Leads collection
    const totalLeadsCount = leads.length || 1;
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal', 'Won'];
    const funnel: FunnelStage[] = stages.map((s) => {
      const count = leads.filter((l) => l.status === s).length;
      return {
        stage: s,
        count,
        percentage: Math.round((count / totalLeadsCount) * 100),
      };
    });

    // 2. Member Performance from real Customer and Follow-up records
    const performance: MemberPerformance[] = members.map((m) => {
      const memberCustomers = customers.filter((c) => c.salesMemberId === m.memberId);
      const memberLeads = leads.filter((l) => l.assignedSalesMemberId === m.memberId);
      const memberFollowUps = followUps.filter((f) => f.assignedSalesMemberId === m.memberId);

      const totalDealsValue = memberCustomers.reduce((sum, c) => sum + (c.finalAmount || 0), 0);
      const closedWonCount = memberLeads.filter((l) => l.status === 'Won').length;
      const completedFollowUps = memberFollowUps.filter((f) => f.status === 'Completed').length;
      const followUpRate =
        memberFollowUps.length > 0
          ? Math.round((completedFollowUps / memberFollowUps.length) * 100)
          : 100;

      return {
        memberId: m.memberId,
        name: m.name,
        activeAccounts: memberCustomers.filter(
          (c) => c.status === 'Active' || c.status === 'Onboarding' || c.customerStatus === 'Active'
        ).length,
        totalDealsValue,
        closedWonCount,
        followUpRate,
      };
    });

    // 3. Financial Health Realized from live Customer Accounts
    const totalBilled = customers.reduce((sum, c) => sum + (c.finalAmount || 0), 0);
    const totalCollected = customers.reduce((sum, c) => sum + (c.amountPaid || 0), 0);
    const totalOutstanding = customers.reduce((sum, c) => sum + (c.remainingAmount || 0), 0);
    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    return {
      funnel,
      performance,
      financials: {
        totalBilled,
        totalCollected,
        totalOutstanding,
        collectionRate,
      },
    };
  },
};
