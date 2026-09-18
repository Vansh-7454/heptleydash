const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const idService = require('../services/idService');
const { emitRoleAware, emitNotification } = require('../socket');

const paymentController = {
  // GET /api/payments
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

      const payments = await Payment.find(query).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        count: payments.length,
        payments: payments.map((p) => ({
          ...p.toObject(),
          id: p._id.toString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/payments
  create: async (req, res, next) => {
    try {
      const rawAmount = req.body.amount !== undefined ? req.body.amount : req.body.amountPaid;
      const { customerId, paymentMethod, paymentDate, reference, notes } = req.body;
      const amount = rawAmount;

      if (!customerId || amount === undefined || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valid customer ID and positive payment amount are required.',
        });
      }

      // Verify customer exists
      const query = customerId.startsWith('CUS-') ? { customerId } : { _id: customerId };
      const customer = await Customer.findOne(query);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: `Customer '${customerId}' not found.`,
        });
      }

      // Role authorization
      if (req.user.role === 'sales' && customer.salesMemberId !== req.user.salesMemberId) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You cannot record payments for customers assigned to other sales members.',
        });
      }

      const numAmount = Number(amount);

      // Financial check: amount paid cannot exceed remaining balance
      if (numAmount > customer.remainingAmount && customer.remainingAmount > 0) {
        return res.status(400).json({
          success: false,
          message: `Payment amount of ₹${numAmount.toLocaleString('en-IN')} exceeds the outstanding balance of ₹${customer.remainingAmount.toLocaleString('en-IN')}.`,
        });
      }

      const paymentId = await idService.getNextPaymentId();

      const payment = await Payment.create({
        paymentId,
        customerId: customer.customerId,
        customerName: customer.name,
        amount: numAmount,
        paymentMethod: paymentMethod || 'Bank Wire',
        paymentDate: paymentDate || new Date().toISOString().split('T')[0],
        reference: reference || '',
        salesMemberId: customer.salesMemberId,
        notes: notes || '',
        createdBy: req.user.id,
      });

      // Update customer ledger
      customer.amountPaid = (Number(customer.amountPaid) || 0) + numAmount;
      customer.lastPaymentDate = payment.paymentDate;
      await customer.save(); // triggers pre-save paymentStatus and remainingAmount recalculation

      const paymentObj = {
        ...payment.toObject(),
        id: payment._id.toString(),
        paymentRef: payment.paymentId,
        amountPaid: payment.amount,
      };
      const customerObj = {
        ...customer.toObject(),
        id: customer._id.toString(),
      };

      // Log payment activity
      const activity = await Activity.create({
        customerId: customer.customerId,
        salesMemberId: customer.salesMemberId,
        salesMemberName: customer.salesMemberName,
        entityName: customer.name,
        title: `Payment Received: ₹${numAmount.toLocaleString('en-IN')}`,
        type: 'Payment',
        description: `Payment of ₹${numAmount.toLocaleString('en-IN')} received via ${payment.paymentMethod} (Ref: ${payment.reference || 'N/A'}). Balance: ₹${customer.remainingAmount.toLocaleString('en-IN')}.`,
        createdBy: req.user.id,
      });

      // Create notification
      const notif = await Notification.create({
        recipientRole: 'all',
        recipientSalesMemberId: customer.salesMemberId,
        type: 'payment_received',
        title: 'Payment Received',
        message: `₹${numAmount.toLocaleString('en-IN')} received for ${customer.name} (${customer.company}).`,
        targetTab: 'payments',
        targetId: payment.paymentId,
      });

      // Emit real-time Socket.IO updates
      emitRoleAware('payment:created', paymentObj, customer.salesMemberId);
      emitRoleAware('customer:updated', customerObj, customer.salesMemberId);
      emitRoleAware('activity:created', { ...activity.toObject(), id: activity._id.toString() }, customer.salesMemberId);
      emitNotification(notif);

      res.status(201).json({
        success: true,
        message: 'Payment recorded and customer ledger updated successfully.',
        payment: paymentObj,
        customerBalance: {
          totalAmount: customer.totalAmount,
          amountPaid: customer.amountPaid,
          remainingAmount: customer.remainingAmount,
          paymentStatus: customer.paymentStatus,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = paymentController;
