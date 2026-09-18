const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const idService = require('../services/idService');

const salesMemberController = {
  // GET /api/users/sales-members
  getAll: async (req, res, next) => {
    try {
      const members = await User.find({ role: 'sales' }).sort({ salesMemberId: 1 });

      // Attach dynamic operational metrics
      const enrichedMembers = await Promise.all(
        members.map(async (m) => {
          const [customersCount, openLeadsCount, pendingFollowUpsCount] = await Promise.all([
            Customer.countDocuments({ salesMemberId: m.salesMemberId }),
            Lead.countDocuments({ salesMemberId: m.salesMemberId, status: { $nin: ['Won', 'Lost'] } }),
            FollowUp.countDocuments({ salesMemberId: m.salesMemberId, status: 'Pending' }),
          ]);

          return {
            id: m._id.toString(),
            memberId: m.salesMemberId,
            salesMemberId: m.salesMemberId,
            name: m.name,
            email: m.email,
            phone: m.phone || '',
            role: m.role,
            status: m.status === 'active' ? 'Active' : 'Inactive',
            assignedCustomersCount: customersCount,
            openLeadsCount: openLeadsCount,
            pendingFollowUpsCount: pendingFollowUpsCount,
            createdAt: m.createdAt,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: enrichedMembers.length,
        salesMembers: enrichedMembers,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/users/sales-members/:id
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('SM-') ? { salesMemberId: id } : { _id: id };
      const member = await User.findOne({ ...query, role: 'sales' });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: `Sales Member '${id}' not found.`,
        });
      }

      const [customersCount, openLeadsCount] = await Promise.all([
        Customer.countDocuments({ salesMemberId: member.salesMemberId }),
        Lead.countDocuments({ salesMemberId: member.salesMemberId, status: { $nin: ['Won', 'Lost'] } }),
      ]);

      res.status(200).json({
        success: true,
        salesMember: {
          id: member._id.toString(),
          memberId: member.salesMemberId,
          salesMemberId: member.salesMemberId,
          name: member.name,
          email: member.email,
          phone: member.phone || '',
          role: member.role,
          status: member.status === 'active' ? 'Active' : 'Inactive',
          assignedCustomersCount: customersCount,
          openLeadsCount: openLeadsCount,
          createdAt: member.createdAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/users/sales-members (Admin Only)
  create: async (req, res, next) => {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email) {
        return res.status(400).json({
          success: false,
          message: 'Name and email are required to register a Sales Member.',
        });
      }

      const cleanEmail = email.trim().toLowerCase();
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `A user with email '${cleanEmail}' already exists.`,
        });
      }

      // Generate atomic SM-00X sequence ID
      const salesMemberId = await idService.getNextSalesMemberId();

      const newMember = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: password ? password.trim() : 'sales123', // default initial password if omitted
        phone: phone ? phone.trim() : '',
        role: 'sales',
        salesMemberId,
        status: 'active',
      });

      const memberObj = {
        id: newMember._id.toString(),
        memberId: newMember.salesMemberId,
        salesMemberId: newMember.salesMemberId,
        name: newMember.name,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role,
        status: 'Active',
        createdAt: newMember.createdAt,
      };

      const { getIO } = require('../socket');
      getIO()?.to('admin-room').emit('salesMember:created', memberObj);

      res.status(201).json({
        success: true,
        message: 'Sales Member created successfully.',
        salesMember: memberObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/users/sales-members/:id
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, phone, password } = req.body;

      const query = id.startsWith('SM-') ? { salesMemberId: id } : { _id: id };
      const member = await User.findOne({ ...query, role: 'sales' });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: `Sales Member '${id}' not found.`,
        });
      }

      if (name) member.name = name.trim();
      if (email) member.email = email.trim().toLowerCase();
      if (phone !== undefined) member.phone = phone.trim();
      if (password && password.trim().length >= 6) {
        member.password = password.trim();
      }

      await member.save();

      const memberObj = {
        id: member._id.toString(),
        memberId: member.salesMemberId,
        salesMemberId: member.salesMemberId,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        status: member.status === 'active' ? 'Active' : 'Inactive',
        updatedAt: member.updatedAt,
      };

      const { getIO } = require('../socket');
      getIO()?.to('admin-room').emit('salesMember:updated', memberObj);

      res.status(200).json({
        success: true,
        message: 'Sales Member updated successfully.',
        salesMember: memberObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/users/sales-members/:id/status
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const query = id.startsWith('SM-') ? { salesMemberId: id } : { _id: id };
      const member = await User.findOne({ ...query, role: 'sales' });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: `Sales Member '${id}' not found.`,
        });
      }

      const newStatus = status ? status.toLowerCase() : (member.status === 'active' ? 'inactive' : 'active');
      if (!['active', 'inactive'].includes(newStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either 'active' or 'inactive'.",
        });
      }

      member.status = newStatus;
      await member.save();

      const memberObj = {
        id: member._id.toString(),
        memberId: member.salesMemberId,
        salesMemberId: member.salesMemberId,
        name: member.name,
        email: member.email,
        status: member.status === 'active' ? 'Active' : 'Inactive',
      };

      const { getIO } = require('../socket');
      getIO()?.to('admin-room').emit('salesMember:updated', memberObj);

      res.status(200).json({
        success: true,
        message: `Sales Member status updated to ${newStatus}.`,
        salesMember: memberObj,
      });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/users/sales-members/:id (Admin Only)
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const query = id.startsWith('SM-') ? { salesMemberId: id } : { _id: id };
      const member = await User.findOneAndDelete({ ...query, role: 'sales' });

      if (!member) {
        return res.status(404).json({
          success: false,
          message: `Sales Member '${id}' not found.`,
        });
      }

      const { getIO } = require('../socket');
      getIO()?.to('admin-room').emit('salesMember:deleted', { id: member._id.toString(), memberId: member.salesMemberId });

      res.status(200).json({
        success: true,
        message: `Sales Member '${member.name}' deleted successfully.`,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = salesMemberController;
