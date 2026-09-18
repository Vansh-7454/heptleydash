const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const idService = require('../services/idService');
const { emitRoleAware, emitNotification } = require('../socket');

const followUpController = {
  // GET /api/follow-ups
  getAll: async (req, res, next) => {
    try {
      const query = {};
      const todayStr = new Date().toISOString().split('T')[0];

      // 1. Role Isolation
      if (req.user.role === 'sales') {
        query.salesMemberId = req.user.salesMemberId;
      } else if (req.query.salesMemberId) {
        query.salesMemberId = req.query.salesMemberId;
      }

      // 2. Filter tabs: today, upcoming, overdue, completed
      if (req.query.filter === 'today') {
        query.date = todayStr;
        query.status = { $nin: ['Completed', 'Cancelled'] };
      } else if (req.query.filter === 'upcoming') {
        query.date = { $gt: todayStr };
        query.status = { $nin: ['Completed', 'Cancelled'] };
      } else if (req.query.filter === 'overdue') {
        query.$or = [{ date: { $lt: todayStr } }, { status: 'Overdue' }];
        query.status = { $nin: ['Completed', 'Cancelled'] };
      } else if (req.query.filter === 'completed') {
        query.status = 'Completed';
      } else if (req.query.status) {
        query.status = req.query.status;
      }

      if (req.query.type) {
        query.type = req.query.type;
      }

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit))) : 50;
      const skip = (page - 1) * limit;

      const total = await FollowUp.countDocuments(query);
      const followUps = await FollowUp.find(query)
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        success: true,
        count: followUps.length,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        followUps: followUps.map((f) => ({
          ...f.toObject(),
          id: f._id.toString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/follow-ups
  create: async (req, res, next) => {
    try {
      const {
        customerId,
        leadId,
        entityType,
        entityName,
        company,
        title,
        type,
        priority,
        date,
        time,
        note,
        salesMemberId: requestedSalesMemberId,
      } = req.body;

      if (!entityName || !title || !date) {
        return res.status(400).json({
          success: false,
          message: 'Entity name, title, and scheduled date are required.',
        });
      }

      const assignedMemberId =
        req.user.role === 'sales'
          ? req.user.salesMemberId
          : requestedSalesMemberId || 'SM-001';

      const followUpId = await idService.getNextFollowUpId();

      const followUp = await FollowUp.create({
        followUpId,
        customerId: customerId || null,
        leadId: leadId || null,
        entityType: entityType || (customerId ? 'Customer' : 'Lead'),
        entityName: entityName.trim(),
        company: company ? company.trim() : '',
        salesMemberId: assignedMemberId,
        title: title.trim(),
        type: type || 'Call',
        priority: priority || 'Medium',
        date,
        time: time || '11:00 AM',
        note: note || '',
        status: 'Pending',
        createdBy: req.user.id,
      });

      const followUpObj = {
        ...followUp.toObject(),
        id: followUp._id.toString(),
      };

      // 1. Log scheduled activity
      const activity = await Activity.create({
        customerId: followUp.customerId,
        leadId: followUp.leadId,
        salesMemberId: assignedMemberId,
        salesMemberName: req.user.name,
        entityName: followUp.entityName,
        title: `Follow-up Scheduled: ${followUp.type}`,
        type: 'Follow-up',
        description: `Scheduled ${followUp.type} with ${followUp.entityName} on ${followUp.date} at ${followUp.time}: "${followUp.title}".`,
        createdBy: req.user.id,
      });

      // 2. Notification if due today
      const todayStr = new Date().toISOString().split('T')[0];
      if (date === todayStr) {
        const notif = await Notification.create({
          recipientRole: 'sales',
          recipientSalesMemberId: assignedMemberId,
          type: 'followup_due',
          title: 'Follow-up Due Today',
          message: `Scheduled ${followUp.type} today at ${followUp.time} with ${followUp.entityName}.`,
          targetTab: 'follow-ups',
          targetId: followUp.followUpId,
        });
        emitNotification(notif);
      }

      // 3. Emit real-time socket events
      emitRoleAware('followup:created', followUpObj, assignedMemberId);
      emitRoleAware('activity:created', { ...activity.toObject(), id: activity._id.toString() }, assignedMemberId);

      res.status(201).json({
        success: true,
        message: 'Follow-up scheduled successfully.',
        followUp: followUpObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/follow-ups/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('FLW-') ? { followUpId: id } : { _id: id };
      const followUp = await FollowUp.findOne(query);

      if (!followUp) {
        return res.status(404).json({
          success: false,
          message: `Follow-up '${id}' not found.`,
        });
      }

      if (req.user.role === 'sales' && followUp.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to modify this follow-up.',
        });
      }

      const prevStatus = followUp.status;
      const allowedFields = ['title', 'type', 'priority', 'date', 'time', 'note', 'status'];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          followUp[field] = req.body[field];
        }
      });

      if (req.body.status === 'Completed' && prevStatus !== 'Completed') {
        followUp.completedAt = new Date();
      }

      await followUp.save();

      const followUpObj = {
        ...followUp.toObject(),
        id: followUp._id.toString(),
      };

      if (req.body.status === 'Completed' && prevStatus !== 'Completed') {
        const act = await Activity.create({
          customerId: followUp.customerId,
          leadId: followUp.leadId,
          salesMemberId: followUp.salesMemberId,
          salesMemberName: req.user.name,
          entityName: followUp.entityName,
          title: `Follow-up Completed: ${followUp.title}`,
          type: 'Follow-up',
          description: `Completed ${followUp.type} with ${followUp.entityName}. Note: ${followUp.note || 'No additional remarks.'}`,
          createdBy: req.user.id,
        });
        emitRoleAware('activity:created', { ...act.toObject(), id: act._id.toString() }, followUp.salesMemberId);
        emitRoleAware('followup:completed', followUpObj, followUp.salesMemberId);
      } else {
        emitRoleAware('followup:updated', followUpObj, followUp.salesMemberId);
      }

      res.status(200).json({
        success: true,
        message: 'Follow-up updated successfully.',
        followUp: followUpObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/follow-ups/:id/complete
  complete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('FLW-') ? { followUpId: id } : { _id: id };
      const followUp = await FollowUp.findOne(query);

      if (!followUp) {
        return res.status(404).json({
          success: false,
          message: `Follow-up '${id}' not found.`,
        });
      }

      if (req.user.role === 'sales' && followUp.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to modify this follow-up.',
        });
      }

      followUp.status = 'Completed';
      followUp.completedAt = new Date();
      await followUp.save();

      const followUpObj = {
        ...followUp.toObject(),
        id: followUp._id.toString(),
      };

      const act = await Activity.create({
        customerId: followUp.customerId,
        leadId: followUp.leadId,
        salesMemberId: followUp.salesMemberId,
        salesMemberName: req.user.name,
        entityName: followUp.entityName,
        title: `Follow-up Completed: ${followUp.title}`,
        type: 'Follow-up',
        description: `Completed ${followUp.type} touchpoint with ${followUp.entityName}.`,
        createdBy: req.user.id,
      });

      emitRoleAware('followup:completed', followUpObj, followUp.salesMemberId);
      emitRoleAware('activity:created', { ...act.toObject(), id: act._id.toString() }, followUp.salesMemberId);

      res.status(200).json({
        success: true,
        message: 'Follow-up marked as Completed.',
        followUp: followUpObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/follow-ups/:id/cancel
  cancel: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('FLW-') ? { followUpId: id } : { _id: id };
      const followUp = await FollowUp.findOne(query);

      if (!followUp) {
        return res.status(404).json({
          success: false,
          message: `Follow-up '${id}' not found.`,
        });
      }

      if (req.user.role === 'sales' && followUp.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to cancel this follow-up.',
        });
      }

      followUp.status = 'Cancelled';
      await followUp.save();

      const followUpObj = {
        ...followUp.toObject(),
        id: followUp._id.toString(),
      };

      emitRoleAware('followup:cancelled', followUpObj, followUp.salesMemberId);

      res.status(200).json({
        success: true,
        message: 'Follow-up marked as Cancelled.',
        followUp: followUpObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/follow-ups/:id
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('FLW-') ? { followUpId: id } : { _id: id };
      const followUp = await FollowUp.findOne(query);

      if (!followUp) {
        return res.status(404).json({
          success: false,
          message: `Follow-up '${id}' not found.`,
        });
      }

      if (req.user.role === 'sales' && followUp.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to delete this follow-up.',
        });
      }

      await FollowUp.deleteOne({ _id: followUp._id });

      res.status(200).json({
        success: true,
        message: 'Follow-up deleted successfully.',
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = followUpController;
