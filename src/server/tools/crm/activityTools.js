const Activity = require('../../models/Activity');
const customerTools = require('./customerTools');

const activityTools = {
  getRecentActivities: async ({ customerId, limit = 10 }, userCtx) => {
    if (!customerId) throw new Error('customerId is required');

    const { found, customer } = await customerTools.getCustomer({ customerId }, userCtx);
    if (!found) return { found: false, activities: [] };

    const activities = await Activity.find({
      $or: [{ customerId: customer.customerId }, { customerId: customer.id }],
    })
      .sort({ createdAt: -1 })
      .limit(Math.min(limit, 25));

    return {
      found: true,
      customerId: customer.customerId,
      count: activities.length,
      activities: activities.map((a) => ({
        id: a._id.toString(),
        type: a.type,
        title: a.title,
        description: a.description,
        salesMemberName: a.salesMemberName,
        timestamp: a.createdAt,
      })),
    };
  },

  proposeActivity: async ({ customerId, title, type, description }, userCtx) => {
    const { found, customer } = await customerTools.getCustomer({ customerId }, userCtx);
    if (!found) throw new Error(`Customer '${customerId}' not found.`);

    const proposedData = {
      customerId: customer.customerId,
      entityName: customer.name,
      company: customer.company,
      title: title || 'Note logged by AI Assistant',
      type: type || 'Note',
      description: description || '',
      salesMemberId: userCtx.role === 'sales' ? userCtx.salesMemberId : customer.salesMemberId,
      salesMemberName: userCtx.name || 'Team Member',
    };

    return {
      action: 'createActivity',
      requiresConfirmation: true,
      proposedData,
      summary: `Log ${proposedData.type} for ${customer.name}: "${proposedData.title}"`,
    };
  },
};

module.exports = activityTools;
