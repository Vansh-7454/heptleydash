const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const User = require('../models/User');
const idService = require('../services/idService');
const { emitRoleAware, emitNotification } = require('../socket');

const customerController = {
  // GET /api/customers (Admin: all with filters, Sales: only assigned with filters)
  getAll: async (req, res, next) => {
    try {
      const query = {};

      // 1. Role-based isolation
      if (req.user.role === 'sales') {
        query.salesMemberId = req.user.salesMemberId;
      } else if (req.query.salesMemberId) {
        query.salesMemberId = req.query.salesMemberId;
      }

      // 2. Search parameter (Name, Company, Email, Customer ID)
      if (req.query.search) {
        const searchRegex = new RegExp(req.query.search.trim(), 'i');
        query.$or = [
          { name: searchRegex },
          { company: searchRegex },
          { email: searchRegex },
          { customerId: searchRegex },
        ];
      }

      // 3. Status & Service Filters
      if (req.query.status) {
        query.customerStatus = req.query.status;
      }
      if (req.query.projectStatus) {
        query.projectStatus = req.query.projectStatus;
      }
      if (req.query.service) {
        query.service = req.query.service;
      }
      if (req.query.paymentStatus) {
        query.paymentStatus = req.query.paymentStatus;
      }

      // 4. Server-Side Pagination
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = req.query.limit ? Math.min(100, Math.max(1, parseInt(req.query.limit))) : 50;
      const skip = (page - 1) * limit;

      const total = await Customer.countDocuments(query);
      const customers = await Customer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      res.status(200).json({
        success: true,
        count: customers.length,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        customers: customers.map((c) => ({
          ...c.toObject(),
          id: c._id.toString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/customers/:id
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('CUS-') ? { customerId: id } : { _id: id };
      const customer = await Customer.findOne(query);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: `Customer '${id}' not found.`,
        });
      }

      // Role authorization
      if (req.user.role === 'sales' && customer.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have access to customer accounts assigned to other representatives.',
        });
      }

      res.status(200).json({
        success: true,
        customer: {
          ...customer.toObject(),
          id: customer._id.toString(),
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/customers
  create: async (req, res, next) => {
    try {
      const {
        name,
        company,
        email,
        phone,
        alternatePhone,
        location,
        website,
        service,
        package: pkg,
        startDate,
        endDate,
        projectStatus,
        customerStatus,
        salesMemberId: requestedSalesMemberId,
        leadSource,
        dealValue,
        discount,
        amountPaid,
        paymentMethod,
        notes,
        internalRemarks,
      } = req.body;

      if (!name || !company || !email || !phone || !service) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields: name, company, email, phone, and service.',
        });
      }

      const numDealValue = Math.max(0, Number(dealValue) || 0);
      const numDiscount = Math.max(0, Number(discount) || 0);
      const finalAmount = Math.max(0, numDealValue - numDiscount);
      let numAmountPaid = Math.max(0, Number(amountPaid) || 0);

      if (numAmountPaid > finalAmount && finalAmount > 0) {
        return res.status(400).json({
          success: false,
          message: `Amount paid (₹${numAmountPaid}) cannot exceed the final deal total (₹${finalAmount}).`,
        });
      }

      // Determine assigned Sales Member
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

      // Generate atomic CUS-XXXX ID
      const customerId = await idService.getNextCustomerId();

      const customer = new Customer({
        customerId,
        name: name.trim(),
        company: company.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        alternatePhone: alternatePhone ? alternatePhone.trim() : '',
        location: location ? location.trim() : '',
        website: website ? website.trim() : '',
        service: service.trim(),
        package: pkg ? pkg.trim() : 'Custom Engagement',
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || '',
        projectStatus: projectStatus || 'Onboarding',
        customerStatus: customerStatus || 'Active',
        salesMemberId: assignedMemberId,
        salesMemberName: assignedMemberName,
        leadSource: leadSource || 'Direct Inbound',
        dealValue: numDealValue,
        discount: numDiscount,
        amountPaid: numAmountPaid,
        paymentMethod: paymentMethod || 'Bank Wire',
        notes: notes || '',
        internalRemarks: internalRemarks || '',
        createdBy: req.user.id,
      });

      await customer.save();

      const customerObj = {
        ...customer.toObject(),
        id: customer._id.toString(),
      };

      // 1. Log activity
      const activity = await Activity.create({
        customerId: customer.customerId,
        salesMemberId: assignedMemberId,
        salesMemberName: assignedMemberName,
        entityName: customer.name,
        title: 'Customer Created',
        type: 'Note',
        description: `New customer ${customer.name} (${customer.company}) onboarded under ${assignedMemberName} (Deal: ₹${customer.finalAmount.toLocaleString('en-IN')}).`,
        createdBy: req.user.id,
      });

      // 2. Create in-app notification
      let notif;
      if (req.user.role === 'sales') {
        notif = await Notification.create({
          recipientRole: 'admin',
          type: 'customer_created',
          title: 'New Customer Registered',
          message: `${assignedMemberName} registered a new customer account: ${customer.name} (${customer.company}).`,
          targetTab: 'customers',
          targetId: customer.customerId,
        });
      } else {
        notif = await Notification.create({
          recipientRole: 'sales',
          recipientSalesMemberId: assignedMemberId,
          type: 'customer_assigned',
          title: 'New Customer Assigned',
          message: `You have been assigned as lead representative for ${customer.name} (${customer.company}).`,
          targetTab: 'my-customers',
          targetId: customer.customerId,
        });
      }

      // 3. Emit real-time Socket.IO events (strictly role-isolated)
      emitRoleAware('customer:created', customerObj, assignedMemberId);
      emitRoleAware('activity:created', { ...activity.toObject(), id: activity._id.toString() }, assignedMemberId);
      if (notif) emitNotification(notif);

      res.status(201).json({
        success: true,
        message: 'Customer created successfully.',
        customer: customerObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/customers/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('CUS-') ? { customerId: id } : { _id: id };
      const customer = await Customer.findOne(query);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: `Customer '${id}' not found.`,
        });
      }

      // Role check
      if (req.user.role === 'sales' && customer.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to modify this customer account.',
        });
      }

      const prevRep = customer.salesMemberId;
      const prevStatus = customer.projectStatus;

      // Fields allowed to update
      const allowedFields = [
        'name', 'company', 'email', 'phone', 'alternatePhone', 'location',
        'website', 'service', 'package', 'startDate', 'endDate',
        'projectStatus', 'customerStatus', 'dealValue', 'discount',
        'amountPaid', 'paymentMethod', 'notes', 'internalRemarks',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          customer[field] = req.body[field];
        }
      });

      // Admin can reassign salesMemberId
      let reassigned = false;
      if (req.user.role === 'admin' && req.body.salesMemberId && req.body.salesMemberId !== prevRep) {
        const newRep = await User.findOne({ salesMemberId: req.body.salesMemberId });
        if (newRep) {
          customer.salesMemberId = newRep.salesMemberId;
          customer.salesMemberName = newRep.name;
          reassigned = true;
        }
      }

      await customer.save();

      const customerObj = {
        ...customer.toObject(),
        id: customer._id.toString(),
      };

      // Log activity if projectStatus changed or reassigned
      if (reassigned) {
        const act = await Activity.create({
          customerId: customer.customerId,
          salesMemberId: customer.salesMemberId,
          salesMemberName: customer.salesMemberName,
          entityName: customer.name,
          title: 'Customer Reassigned',
          type: 'Status-change',
          description: `Customer account reassigned to ${customer.salesMemberName} (${customer.salesMemberId}).`,
          createdBy: req.user.id,
        });

        const notif = await Notification.create({
          recipientRole: 'sales',
          recipientSalesMemberId: customer.salesMemberId,
          type: 'customer_assigned',
          title: 'Customer Reassigned to You',
          message: `${customer.name} (${customer.company}) has been reassigned to your portfolio.`,
          targetTab: 'my-customers',
          targetId: customer.customerId,
        });

        emitRoleAware('customer:assigned', customerObj, customer.salesMemberId);
        emitRoleAware('activity:created', { ...act.toObject(), id: act._id.toString() }, customer.salesMemberId);
        emitNotification(notif);
      } else if (req.body.projectStatus && req.body.projectStatus !== prevStatus) {
        const act = await Activity.create({
          customerId: customer.customerId,
          salesMemberId: customer.salesMemberId,
          salesMemberName: customer.salesMemberName,
          entityName: customer.name,
          title: 'Project Status Changed',
          type: 'Status-change',
          description: `Project status updated to ${customer.projectStatus}.`,
          createdBy: req.user.id,
        });
        emitRoleAware('activity:created', { ...act.toObject(), id: act._id.toString() }, customer.salesMemberId);
      }

      // Emit customer:updated to authorized parties
      emitRoleAware('customer:updated', customerObj, customer.salesMemberId);

      res.status(200).json({
        success: true,
        message: 'Customer updated successfully.',
        customer: customerObj,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = customerController;
