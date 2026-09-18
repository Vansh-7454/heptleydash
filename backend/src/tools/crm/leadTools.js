const Lead = require('../../models/Lead');
const Activity = require('../../models/Activity');
const FollowUp = require('../../models/FollowUp');

const verifyLeadAccess = (lead, userCtx) => {
  if (!lead) return false;
  if (userCtx.role === 'admin') return true;
  if (userCtx.role === 'sales') {
    return lead.salesMemberId === userCtx.salesMemberId;
  }
  return false;
};

const leadTools = {
  getLead: async ({ leadId }, userCtx) => {
    if (!leadId) throw new Error('leadId is required');

    const cleanId = String(leadId).trim();
    const query = cleanId.startsWith('LEAD-') ? { leadId: cleanId } : { _id: cleanId };
    const lead = await Lead.findOne(query);

    if (!lead) {
      return { found: false, message: `Lead with ID '${cleanId}' not found.` };
    }

    if (!verifyLeadAccess(lead, userCtx)) {
      const err = new Error(`Access Denied: You do not have permission to access lead '${lead.leadId}'.`);
      err.statusCode = 403;
      throw err;
    }

    // Also fetch any touchpoints logged for this lead
    const [activities, followUps] = await Promise.all([
      Activity.find({ leadId: lead.leadId }).sort({ createdAt: -1 }).limit(10),
      FollowUp.find({ leadId: lead.leadId }).sort({ createdAt: -1 }).limit(10),
    ]);

    return {
      found: true,
      lead: {
        id: lead._id.toString(),
        leadId: lead.leadId,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        interestedService: lead.interestedService,
        service: lead.service || lead.interestedService,
        dealEstimate: lead.dealEstimate || lead.dealValue,
        source: lead.source || lead.leadSource,
        status: lead.status,
        priority: lead.priority,
        notes: lead.notes,
        salesMemberId: lead.salesMemberId,
        assignedSalesMemberName: lead.assignedSalesMemberName || lead.salesMemberName,
        isConverted: lead.isConverted,
        convertedCustomerId: lead.convertedCustomerId,
        createdAt: lead.createdAt,
      },
      recentActivities: activities.map((a) => ({
        type: a.type,
        title: a.title,
        description: a.description,
        timestamp: a.createdAt,
      })),
      recentFollowUps: followUps.map((f) => ({
        title: f.title,
        status: f.status,
        date: f.date,
        time: f.time,
        note: f.note,
      })),
    };
  },

  searchLeads: async ({ query: searchText, status, priority }, userCtx) => {
    const filter = {};

    if (userCtx.role === 'sales') {
      filter.salesMemberId = userCtx.salesMemberId;
    }

    if (status && status !== 'all') filter.status = status;
    if (priority && priority !== 'all') filter.priority = priority;

    if (searchText && searchText.trim()) {
      const regex = new RegExp(searchText.trim(), 'i');
      filter.$or = [
        { name: regex },
        { company: regex },
        { leadId: regex },
        { email: regex },
        { interestedService: regex },
      ];
    }

    const leads = await Lead.find(filter)
      .sort({ updatedAt: -1 })
      .limit(15);

    return {
      count: leads.length,
      leads: leads.map((l) => ({
        leadId: l.leadId,
        name: l.name,
        company: l.company,
        interestedService: l.interestedService,
        status: l.status,
        priority: l.priority,
        dealEstimate: l.dealEstimate || l.dealValue,
        assignedSalesMemberName: l.assignedSalesMemberName,
        isConverted: l.isConverted,
      })),
    };
  },
};

module.exports = leadTools;
