const FollowUp = require('../../models/FollowUp');
const customerTools = require('./customerTools');
const leadTools = require('./leadTools');

const followupTools = {
  getOpenFollowUps: async ({ customerId }, userCtx) => {
    if (!customerId) throw new Error('customerId is required');

    // Ownership check via customerTools
    const { found, customer } = await customerTools.getCustomer({ customerId }, userCtx);
    if (!found) return { found: false, followUps: [] };

    const followUps = await FollowUp.find({
      $or: [{ customerId: customer.customerId }, { customerId: customer.id }],
      status: 'Pending',
    }).sort({ date: 1 });

    return {
      found: true,
      customerId: customer.customerId,
      count: followUps.length,
      followUps: followUps.map((f) => ({
        followUpId: f.followUpId,
        title: f.title,
        date: f.date,
        time: f.time,
        type: f.type,
        priority: f.priority,
        note: f.note,
        status: f.status,
      })),
    };
  },

  getOverdueFollowUps: async (userCtx) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const filter = {
      status: { $nin: ['Completed', 'Cancelled'] },
      $or: [{ date: { $lt: todayStr } }, { status: 'Overdue' }],
    };

    if (userCtx.role === 'sales') {
      filter.salesMemberId = userCtx.salesMemberId;
    }

    const followUps = await FollowUp.find(filter)
      .sort({ date: 1 })
      .limit(20);

    return {
      count: followUps.length,
      followUps: followUps.map((f) => ({
        followUpId: f.followUpId,
        title: f.title,
        entityType: f.entityType,
        entityName: f.entityName,
        company: f.company,
        date: f.date,
        time: f.time,
        type: f.type,
        salesMemberId: f.salesMemberId,
        note: f.note,
        status: f.status,
      })),
    };
  },

  /**
   * Safe proposal generator: NEVER writes directly to DB autonomously.
   * Returns a proposal requiring explicit user confirmation.
   */
  proposeFollowUp: async ({ title, customerId, leadId, date, time, type, note }, userCtx) => {
    let entityName = '';
    let company = '';
    let entityType = 'Customer';
    let targetId = customerId || leadId;

    if (customerId) {
      const { found, customer } = await customerTools.getCustomer({ customerId }, userCtx);
      if (!found) throw new Error(`Customer '${customerId}' not found.`);
      entityName = customer.name;
      company = customer.company;
      entityType = 'Customer';
      targetId = customer.customerId;
    } else if (leadId) {
      const { found, lead } = await leadTools.getLead({ leadId }, userCtx);
      if (!found) throw new Error(`Lead '${leadId}' not found.`);
      entityName = lead.name;
      company = lead.company;
      entityType = 'Lead';
      targetId = lead.leadId;
    } else {
      entityName = 'General Account';
      company = 'Client';
      entityType = 'Customer';
      targetId = 'GENERAL';
    }

    const proposedData = {
      title: title || `Follow-up with ${entityName || 'client'}`,
      entityType,
      customerId: entityType === 'Customer' ? targetId : null,
      leadId: entityType === 'Lead' ? targetId : null,
      entityName,
      company,
      date: date || new Date(Date.now() + 86400000).toISOString().split('T')[0], // Default tomorrow
      time: time || '11:00 AM',
      type: type || 'Call',
      priority: 'Medium',
      note: note || '',
      salesMemberId: userCtx.role === 'sales' ? userCtx.salesMemberId : 'SM-001',
    };

    return {
      action: 'createFollowUp',
      requiresConfirmation: true,
      proposedData,
      summary: `Create ${proposedData.type} follow-up on ${proposedData.date} at ${proposedData.time} for ${entityName} (${company})`,
    };
  },
};

module.exports = followupTools;
