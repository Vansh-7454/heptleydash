const Counter = require('../models/Counter');

const getNextSequence = async (name) => {
  const counter = await Counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const idService = {
  getNextSalesMemberId: async () => {
    const seq = await getNextSequence('salesMemberId');
    return `SM-${String(seq).padStart(3, '0')}`;
  },

  getNextCustomerId: async () => {
    const seq = await getNextSequence('customerId');
    return `CUS-${String(seq).padStart(4, '0')}`;
  },

  getNextLeadId: async () => {
    const seq = await getNextSequence('leadId');
    return `LEAD-${String(seq).padStart(4, '0')}`;
  },

  getNextFollowUpId: async () => {
    const seq = await getNextSequence('followUpId');
    return `FLW-${String(seq).padStart(4, '0')}`;
  },

  getNextPaymentId: async () => {
    const seq = await getNextSequence('paymentId');
    return `PAY-${String(seq).padStart(4, '0')}`;
  },

  setSequence: async (name, value) => {
    await Counter.findByIdAndUpdate(
      name,
      { $set: { seq: value } },
      { new: true, upsert: true }
    );
  }
};

module.exports = idService;
