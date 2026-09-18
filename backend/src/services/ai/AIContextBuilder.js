const customerTools = require('../../tools/crm/customerTools');
const leadTools = require('../../tools/crm/leadTools');
const followupTools = require('../../tools/crm/followupTools');
const activityTools = require('../../tools/crm/activityTools');

const aiContextBuilder = {
  buildCustomerContext: async (customerId, userCtx) => {
    // 1. Fetch customer with strict authorization check
    const { found, customer } = await customerTools.getCustomer({ customerId }, userCtx);
    if (!found) {
      const err = new Error(`Customer '${customerId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    // 2. Parallel fetch of associated items
    const [paymentsRes, timelineRes, followUpsRes] = await Promise.all([
      customerTools.getCustomerPayments({ customerId: customer.customerId }, userCtx),
      activityTools.getRecentActivities({ customerId: customer.customerId, limit: 10 }, userCtx),
      followupTools.getOpenFollowUps({ customerId: customer.customerId }, userCtx),
    ]);

    return {
      customer,
      payments: paymentsRes.payments || [],
      recentActivities: timelineRes.activities || [],
      pendingFollowUps: followUpsRes.followUps || [],
    };
  },

  buildLeadContext: async (leadId, userCtx) => {
    const leadData = await leadTools.getLead({ leadId }, userCtx);
    if (!leadData.found) {
      const err = new Error(`Lead '${leadId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    return leadData;
  },

  evaluateCustomerFollowUpFlags: (customer, followUps = [], payments = [], activities = []) => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const hasOverdueFollowUp = followUps.some(
      (f) => f.status === 'Overdue' || (f.date < todayStr && f.status === 'Pending')
    );
    const hasPendingFollowUp = followUps.length > 0;
    const hasOutstandingBalance = Number(customer.remainingAmount) > 0;
    const isPaymentOverdue = customer.paymentStatus === 'Overdue';

    let daysSinceLastActivity = null;
    if (activities.length > 0 && activities[0].timestamp) {
      const lastDate = new Date(activities[0].timestamp);
      daysSinceLastActivity = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
    }

    let daysUntilEndDate = null;
    if (customer.endDate) {
      const endDate = new Date(customer.endDate);
      daysUntilEndDate = Math.floor((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    }

    return {
      hasOverdueFollowUp,
      hasPendingFollowUp,
      pendingFollowUpCount: followUps.length,
      hasOutstandingBalance,
      remainingAmount: customer.remainingAmount,
      paymentStatus: customer.paymentStatus,
      isPaymentOverdue,
      daysSinceLastActivity,
      daysUntilEndDate,
      isInactive: customer.customerStatus === 'Inactive',
      isOnboarding: customer.status === 'Onboarding' || customer.projectStatus === 'Onboarding',
    };
  },
};

module.exports = aiContextBuilder;
