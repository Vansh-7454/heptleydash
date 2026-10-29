const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const idService = require('../services/idService');
const { emitRoleAware, emitNotification } = require('../socket');

const leadController = {
  // GET /api/leads
  getAll: async (req, res, next) => {
    try {
      const query = {};

      if (req.user.role === 'sales') {
        query.salesMemberId = req.user.salesMemberId;
      } else if (req.query.salesMemberId) {
        query.salesMemberId = req.query.salesMemberId;
      }

      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search.trim(), 'i');
        query.$or = [
          { name: searchRegex },
          { company: searchRegex },
          { email: searchRegex },
          { leadId: searchRegex },
          { interestedService: searchRegex },
        ];
      }

      if (req.query.status) {
        query.status = req.query.status;
      }
      if (req.query.service) {
        query.interestedService = req.query.service;
      }
      if (req.query.source) {
        query.source = req.query.source;
      }

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit))) : 50;
      const skip = (page - 1) * limit;

      const total = await Lead.countDocuments(query);
      const leads = await Lead.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        success: true,
        count: leads.length,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        leads: leads.map((l) => ({
          ...l.toObject(),
          id: l._id.toString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/leads/:id
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('LEAD-') ? { leadId: id } : { _id: id };
      const lead = await Lead.findOne(query);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: `Lead '${id}' not found.`,
        });
      }

      if (req.user.role === 'sales' && lead.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to view leads assigned to other representatives.',
        });
      }

      res.status(200).json({
        success: true,
        lead: {
          ...lead.toObject(),
          id: lead._id.toString(),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/leads
  create: async (req, res, next) => {
    try {
      const {
        name,
        company,
        email,
        phone,
        interestedService,
        source,
        status,
        requirements,
        budget,
        dealEstimate,
        salesMemberId: requestedSalesMemberId,
        notes,
      } = req.body;

      if (!name || !company || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Lead name, company, email, and phone are required.',
        });
      }

      let assignedMemberId;
      let assignedMemberName = '';

      if (req.user.role === 'sales') {
        assignedMemberId = req.user.salesMemberId;
        assignedMemberName = req.user.name;
      } else {
        assignedMemberId = requestedSalesMemberId || 'SM-001';
        const rep = await User.findOne({ salesMemberId: assignedMemberId });
        assignedMemberName = rep ? rep.name : 'Assigned Sales Member';
      }

      const leadId = await idService.getNextLeadId();

      const lead = await Lead.create({
        leadId,
        name: name.trim(),
        company: company.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        interestedService: interestedService || 'Custom Solution',
        source: source || 'Website Inbound',
        status: status || 'New',
        requirements: requirements || '',
        budget: Number(budget) || 0,
        dealEstimate: Number(dealEstimate) || Number(budget) || 0,
        salesMemberId: assignedMemberId,
        salesMemberName: assignedMemberName,
        notes: notes || '',
        createdBy: req.user.id,
      });

      const leadObj = {
        ...lead.toObject(),
        id: lead._id.toString(),
      };

      // 1. Log creation activity
      const activity = await Activity.create({
        leadId: lead.leadId,
        salesMemberId: assignedMemberId,
        salesMemberName: assignedMemberName,
        entityName: lead.name,
        title: 'New Lead Registered',
        type: 'Note',
        description: `Lead prospect added for ${lead.company} (Budget: ₹${lead.dealEstimate.toLocaleString('en-IN')}).`,
        createdBy: req.user.id,
      });

      // 2. In-app notification
      let notif;
      if (req.user.role === 'sales') {
        notif = await Notification.create({
          recipientRole: 'admin',
          type: 'lead_created',
          title: 'New Inbound Lead',
          message: `${assignedMemberName} registered a new prospect lead: ${lead.name} (${lead.company}).`,
          targetTab: 'leads',
          targetId: lead.leadId,
        });
      }

      // 3. Emit real-time Socket.IO events (strictly isolated)
      emitRoleAware('lead:created', leadObj, assignedMemberId);
      emitRoleAware('activity:created', { ...activity.toObject(), id: activity._id.toString() }, assignedMemberId);
      if (notif) emitNotification(notif);

      res.status(201).json({
        success: true,
        message: 'Lead created successfully.',
        lead: leadObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/leads/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('LEAD-') ? { leadId: id } : { _id: id };
      const lead = await Lead.findOne(query);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: `Lead '${id}' not found.`,
        });
      }

      if (req.user.role === 'sales' && lead.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to modify this lead.',
        });
      }

      const prevStatus = lead.status;
      const prevRep = lead.salesMemberId;

      const allowedFields = [
        'name', 'company', 'email', 'phone', 'interestedService',
        'source', 'status', 'requirements', 'budget', 'dealEstimate',
        'lastContactAt', 'nextFollowUpAt', 'notes',
      ];

      if (req.user.role === 'admin' && req.body.salesMemberId && req.body.salesMemberId !== prevRep) {
        lead.salesMemberId = req.body.salesMemberId;
        const rep = await User.findOne({ salesMemberId: req.body.salesMemberId });
        if (rep) lead.salesMemberName = rep.name;
      }

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          lead[field] = req.body[field];
        }
      });

      await lead.save();

      const leadObj = {
        ...lead.toObject(),
        id: lead._id.toString(),
      };

      if (req.body.status && req.body.status !== prevStatus) {
        const act = await Activity.create({
          leadId: lead.leadId,
          salesMemberId: lead.salesMemberId,
          salesMemberName: lead.salesMemberName,
          entityName: lead.name,
          title: 'Lead Stage Updated',
          type: 'Status-change',
          description: `Lead moved from "${prevStatus}" to "${lead.status}".`,
          createdBy: req.user.id,
        });
        emitRoleAware('activity:created', { ...act.toObject(), id: act._id.toString() }, lead.salesMemberId);
      }

      emitRoleAware('lead:updated', leadObj, lead.salesMemberId);

      res.status(200).json({
        success: true,
        message: 'Lead updated successfully.',
        lead: leadObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/leads/:id/convert (Lead -> Customer atomic conversion)
  convertLead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('LEAD-') ? { leadId: id } : { _id: id };
      const lead = await Lead.findOne(query);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: `Lead '${id}' not found.`,
        });
      }

      if (req.user.role === 'sales' && lead.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot convert leads assigned to another sales representative.',
        });
      }

      // Concurrency / Duplicate Prevention Check
      if (lead.isConverted || lead.convertedCustomerId) {
        return res.status(400).json({
          success: false,
          message: `This lead has already been converted to Customer account ${lead.convertedCustomerId}.`,
        });
      }

      // Generate atomic CUS-XXXX ID
      const customerId = await idService.getNextCustomerId();

      const val = req.body.dealValue !== undefined ? Number(req.body.dealValue) : (lead.dealEstimate || lead.budget || 0);
      const disc = Number(req.body.discount) || 0;
      const paid = Number(req.body.amountPaid) || 0;

      const customer = new Customer({
        customerId,
        name: (req.body.name || lead.name).trim(),
        company: (req.body.company || lead.company).trim(),
        email: (req.body.email || lead.email).trim().toLowerCase(),
        phone: (req.body.phone || lead.phone).trim(),
        alternatePhone: req.body.alternatePhone || '',
        location: req.body.location || 'Bangalore, Karnataka',
        website: req.body.website || '',
        service: req.body.service || lead.interestedService || 'Custom Solution',
        package: req.body.package || 'Standard Engagement',
        startDate: req.body.startDate || new Date().toISOString().split('T')[0],
        endDate: req.body.endDate || '',
        projectStatus: 'Onboarding',
        customerStatus: 'Active',
        salesMemberId: lead.salesMemberId,
        salesMemberName: lead.salesMemberName,
        leadSource: lead.source || 'Website Inbound',
        dealValue: val,
        discount: disc,
        amountPaid: paid,
        paymentMethod: req.body.paymentMethod || 'Bank Wire',
        notes: req.body.notes || lead.notes || '',
        internalRemarks: `Converted from Lead ${lead.leadId}. Original requirements: ${lead.requirements || 'N/A'}.`,
        createdBy: req.user.id,
      });

      await customer.save();

      // Mark Lead as Converted & Won
      lead.status = 'Won';
      lead.isConverted = true;
      lead.convertedCustomerId = customer.customerId;
      await lead.save();

      const customerObj = {
        ...customer.toObject(),
        id: customer._id.toString(),
      };
      const leadObj = {
        ...lead.toObject(),
        id: lead._id.toString(),
      };

      // Log Conversion Activity
      const activity = await Activity.create({
        customerId: customer.customerId,
        leadId: lead.leadId,
        salesMemberId: lead.salesMemberId,
        salesMemberName: lead.salesMemberName,
        entityName: customer.name,
        title: 'Lead Converted to Customer',
        type: 'Status-change',
        description: `Lead ${lead.leadId} successfully converted into active Customer account ${customer.customerId} (${customer.company}).`,
        createdBy: req.user.id,
      });

      // Send notification
      const notif = await Notification.create({
        recipientRole: 'admin',
        type: 'lead_converted',
        title: 'Lead Converted to Customer',
        message: `${lead.salesMemberName} converted lead ${lead.name} (${lead.company}) into customer ${customer.customerId}.`,
        targetTab: 'customers',
        targetId: customer.customerId,
      });

      // Emit real-time events to Admin and the assigned rep
      emitRoleAware('lead:converted', { lead: leadObj, customer: customerObj }, lead.salesMemberId);
      emitRoleAware('customer:created', customerObj, lead.salesMemberId);
      emitRoleAware('activity:created', { ...activity.toObject(), id: activity._id.toString() }, lead.salesMemberId);
      emitNotification(notif);

      res.status(201).json({
        success: true,
        message: `Lead ${lead.leadId} converted to customer ${customer.customerId} successfully.`,
        customer: customerObj,
        lead: leadObj,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = leadController;
