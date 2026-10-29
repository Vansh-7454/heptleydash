const Activity = require('../models/Activity');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const { emitRoleAware } = require('../socket');

const activityController = {
  // GET /api/activities
  getAll: async (req, res, next) => {
    try {
      const query = {};

      if (req.user.role === 'sales') {
        query.salesMemberId = req.user.salesMemberId;
      } else if (req.query.salesMemberId) {
        query.salesMemberId = req.query.salesMemberId;
      }

      if (req.query.customerId) {
        query.customerId = req.query.customerId;
      }

      if (req.query.leadId) {
        query.leadId = req.query.leadId;
      }

      if (req.query.entityId) {
        query.$or = [{ customerId: req.query.entityId }, { leadId: req.query.entityId }];
      }

      const activities = await Activity.find(query)
        .sort({ createdAt: -1 })
        .limit(req.query.limit ? parseInt(req.query.limit, 10) : 100);

      res.status(200).json({
        success: true,
        count: activities.length,
        activities: activities.map((a) => ({
          ...a.toObject(),
          id: a._id.toString(),
          timestamp: a.createdAt,
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/activities
  create: async (req, res, next) => {
    try {
      const {
        customerId,
        leadId,
        entityName,
        title,
        type,
        description,
        salesMemberId: requestedSalesMemberId,
      } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Activity title is required.',
        });
      }

      // Verify ownership & resolve canonical customerId if provided
      let resolvedCustomerId = null;
      if (customerId) {
        const custQuery = customerId.startsWith('CUS-') ? { customerId } : { _id: customerId };
        const customer = await Customer.findOne(custQuery);
        if (customer) {
          resolvedCustomerId = customer.customerId;
          if (req.user.role === 'sales' && customer.salesMemberId !== req.user.salesMemberId) {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: You do not have permission to log activities on accounts assigned to other representatives.',
            });
          }
        }
      }

      // Verify ownership & resolve canonical leadId if provided
      let resolvedLeadId = null;
      if (leadId) {
        const leadQuery = leadId.startsWith('LEAD-') ? { leadId } : { _id: leadId };
        const lead = await Lead.findOne(leadQuery);
        if (lead) {
          resolvedLeadId = lead.leadId;
          if (req.user.role === 'sales' && lead.salesMemberId !== req.user.salesMemberId) {
            return res.status(403).json({
              success: false,
              message: 'Forbidden: You do not have permission to log activities on leads assigned to other representatives.',
            });
          }
        }
      }

      const assignedMemberId =
        req.user.role === 'sales'
          ? req.user.salesMemberId
          : requestedSalesMemberId || 'SM-001';

      const activity = await Activity.create({
        customerId: resolvedCustomerId,
        leadId: resolvedLeadId,
        salesMemberId: assignedMemberId,
        salesMemberName: req.user.name,
        entityName: entityName ? entityName.trim() : '',
        title: title.trim(),
        type: type || 'Note',
        description: description || '',
        createdBy: req.user.id,
      });

      const activityObj = {
        ...activity.toObject(),
        id: activity._id.toString(),
        timestamp: activity.createdAt,
      };

      emitRoleAware('activity:created', activityObj, assignedMemberId);

      res.status(201).json({
        success: true,
        message: 'Activity recorded successfully.',
        activity: activityObj,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = activityController;
