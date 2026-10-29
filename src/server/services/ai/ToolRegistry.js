const customerTools = require('../../tools/crm/customerTools');
const leadTools = require('../../tools/crm/leadTools');
const followupTools = require('../../tools/crm/followupTools');
const activityTools = require('../../tools/crm/activityTools');

const toolRegistry = {
  definitions: [
    {
      name: 'getCustomer',
      description: 'Retrieve full details for a customer account by customerId (e.g. CUS-0001). Ownership verified.',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'The unique customer identifier, e.g. CUS-0001' },
        },
        required: ['customerId'],
      },
      handler: customerTools.getCustomer,
    },
    {
      name: 'searchCustomers',
      description: 'Search customers by keyword, service, status, or payment status. Results scoped to authorized rep.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text search keyword' },
          status: { type: 'string', description: 'Customer status (Active, Onboarding, Inactive)' },
          service: { type: 'string', description: 'Service deliverable' },
          paymentStatus: { type: 'string', description: 'Payment status (Paid, Partial, Overdue)' },
        },
      },
      handler: customerTools.searchCustomers,
    },
    {
      name: 'getCustomerPayments',
      description: 'Get transaction payment records and invoice history for a customer. Ownership verified.',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'The unique customer identifier, e.g. CUS-0001' },
        },
        required: ['customerId'],
      },
      handler: customerTools.getCustomerPayments,
    },
    {
      name: 'getCustomerTimeline',
      description: 'Get chronological activity history and touchpoints for a customer. Ownership verified.',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'The customer identifier' },
        },
        required: ['customerId'],
      },
      handler: customerTools.getCustomerTimeline,
    },
    {
      name: 'getLead',
      description: 'Retrieve full details for a sales pipeline lead by leadId (e.g. LEAD-0001). Ownership verified.',
      parameters: {
        type: 'object',
        properties: {
          leadId: { type: 'string', description: 'The unique lead identifier, e.g. LEAD-0001' },
        },
        required: ['leadId'],
      },
      handler: leadTools.getLead,
    },
    {
      name: 'searchLeads',
      description: 'Search leads by keyword, pipeline status, or priority. Scoped to authenticated rep.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text search keyword' },
          status: { type: 'string', description: 'Lead status (New, Contacted, Qualified, Proposal, Won, Lost)' },
          priority: { type: 'string', description: 'Lead priority (High, Medium, Low)' },
        },
      },
      handler: leadTools.searchLeads,
    },
    {
      name: 'getOpenFollowUps',
      description: 'Get all pending follow-up consultations and reminders for a customer.',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'The customer identifier' },
        },
        required: ['customerId'],
      },
      handler: followupTools.getOpenFollowUps,
    },
    {
      name: 'getOverdueFollowUps',
      description: 'Get all overdue follow-ups needing immediate attention. Scoped to authenticated rep or team (admin).',
      parameters: {
        type: 'object',
        properties: {},
      },
      handler: followupTools.getOverdueFollowUps,
    },
    {
      name: 'getRecentActivities',
      description: 'Get recent team interaction notes for a customer.',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'The customer identifier' },
          limit: { type: 'number', description: 'Max items to retrieve (default 10)' },
        },
        required: ['customerId'],
      },
      handler: activityTools.getRecentActivities,
    },
    {
      name: 'proposeFollowUp',
      description: 'Propose scheduling a follow-up task or meeting. Does NOT write to database without user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Purpose or title of follow-up' },
          customerId: { type: 'string', description: 'Target customer ID' },
          leadId: { type: 'string', description: 'Target lead ID' },
          date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
          time: { type: 'string', description: 'Time, e.g. 11:00 AM' },
          type: { type: 'string', description: 'Call, Email, Meeting, WhatsApp, Other' },
          note: { type: 'string', description: 'Internal agenda note' },
        },
      },
      handler: followupTools.proposeFollowUp,
    },
    {
      name: 'proposeActivity',
      description: 'Propose logging a client note or interaction record. Does NOT write to database without user confirmation.',
      parameters: {
        type: 'object',
        properties: {
          customerId: { type: 'string', description: 'Target customer ID' },
          title: { type: 'string', description: 'Activity headline' },
          type: { type: 'string', description: 'Note, Call, Email, Meeting' },
          description: { type: 'string', description: 'Detailed notes' },
        },
        required: ['customerId', 'description'],
      },
      handler: activityTools.proposeActivity,
    },
  ],

  getTool: (name) => {
    return toolRegistry.definitions.find((t) => t.name === name);
  },

  executeTool: async (toolName, params = {}, userCtx) => {
    const tool = toolRegistry.getTool(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' is not registered in ToolRegistry.`);
    }

    if (!userCtx || !userCtx.role) {
      throw new Error('Authenticated user context is required to execute CRM tools.');
    }

    return await tool.handler(params, userCtx);
  },

  getGeminiToolDeclarations: () => {
    return toolRegistry.definitions.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
  },
};

module.exports = toolRegistry;
