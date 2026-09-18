const Customer = require('../../models/Customer');
const Payment = require('../../models/Payment');
const Activity = require('../../models/Activity');

/**
 * Validates whether userCtx has permission to view/interact with the customer.
 * Throws an explicit error if a sales rep attempts to access another rep's customer.
 */
const verifyCustomerAccess = (customer, userCtx) => {
  if (!customer) return false;
  if (userCtx.role === 'admin') return true;
  if (userCtx.role === 'sales') {
    return customer.salesMemberId === userCtx.salesMemberId;
  }
  return false;
};

const customerTools = {
  getCustomer: async ({ customerId }, userCtx) => {
    if (!customerId) throw new Error('customerId is required');

    const cleanId = String(customerId).trim();
    const query = cleanId.startsWith('CUS-') ? { customerId: cleanId } : { _id: cleanId };
    const customer = await Customer.findOne(query);

    if (!customer) {
      return { found: false, message: `Customer with ID '${cleanId}' not found.` };
    }

    if (!verifyCustomerAccess(customer, userCtx)) {
      const err = new Error(`Access Denied: You do not have permission to access customer '${customer.customerId}'.`);
      err.statusCode = 403;
      throw err;
    }

    return {
      found: true,
      customer: {
        id: customer._id.toString(),
        customerId: customer.customerId,
        name: customer.name,
        company: customer.company,
        email: customer.email,
        phone: customer.phone,
        location: customer.location,
        service: customer.service,
        package: customer.package,
        startDate: customer.startDate,
        endDate: customer.endDate,
        status: customer.status,
        projectStatus: customer.projectStatus,
        customerStatus: customer.customerStatus,
        dealValue: customer.dealValue,
        discount: customer.discount,
        finalAmount: customer.finalAmount,
        amountPaid: customer.amountPaid,
        remainingAmount: customer.remainingAmount,
        paymentStatus: customer.paymentStatus,
        paymentMethod: customer.paymentMethod,
        lastPaymentDate: customer.lastPaymentDate,
        salesMemberId: customer.salesMemberId,
        salesMemberName: customer.salesMemberName,
        leadSource: customer.leadSource,
        notes: customer.notes,
        internalRemarks: customer.internalRemarks,
      },
    };
  },

  searchCustomers: async ({ query: searchText, status, service, paymentStatus }, userCtx) => {
    const filter = {};

    if (userCtx.role === 'sales') {
      filter.salesMemberId = userCtx.salesMemberId;
    }

    if (status && status !== 'all') filter.customerStatus = status;
    if (service && service !== 'all') filter.service = service;
    if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

    if (searchText && searchText.trim()) {
      const regex = new RegExp(searchText.trim(), 'i');
      filter.$or = [
        { name: regex },
        { company: regex },
        { customerId: regex },
        { email: regex },
        { service: regex },
      ];
    }

    const customers = await Customer.find(filter)
      .sort({ updatedAt: -1 })
      .limit(15);

    return {
      count: customers.length,
      customers: customers.map((c) => ({
        customerId: c.customerId,
        name: c.name,
        company: c.company,
        service: c.service,
        projectStatus: c.projectStatus,
        finalAmount: c.finalAmount,
        amountPaid: c.amountPaid,
        remainingAmount: c.remainingAmount,
        paymentStatus: c.paymentStatus,
        salesMemberName: c.salesMemberName,
      })),
    };
  },

  getCustomerPayments: async ({ customerId }, userCtx) => {
    // First verify customer access
    const { found, customer } = await customerTools.getCustomer({ customerId }, userCtx);
    if (!found) return { found: false, payments: [] };

    const payments = await Payment.find({
      $or: [{ customerId: customer.customerId }, { customerId: customer.id }],
    }).sort({ createdAt: -1 });

    return {
      found: true,
      customerId: customer.customerId,
      count: payments.length,
      payments: payments.map((p) => ({
        paymentRef: p.paymentId || p.paymentRef,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        paymentDate: p.paymentDate,
        reference: p.reference,
        notes: p.notes,
      })),
    };
  },

  getCustomerTimeline: async ({ customerId }, userCtx) => {
    const { found, customer } = await customerTools.getCustomer({ customerId }, userCtx);
    if (!found) return { found: false, activities: [] };

    const activities = await Activity.find({
      $or: [{ customerId: customer.customerId }, { customerId: customer.id }],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    return {
      found: true,
      customerId: customer.customerId,
      count: activities.length,
      timeline: activities.map((a) => ({
        id: a._id.toString(),
        type: a.type,
        title: a.title,
        description: a.description,
        salesMemberName: a.salesMemberName,
        timestamp: a.createdAt,
      })),
    };
  },
};

module.exports = customerTools;
