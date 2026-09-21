const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Activity = require('../models/Activity');
const Website = require('../models/Website');
const SalesQuestion = require('../models/SalesQuestion');

const dashboardController = {
  // GET /api/dashboard/stats
  getStats: async (req, res, next) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const role = req.user.role;

      if (role === 'sales') {
        // Sales Representative Specific Metrics (isolated to assigned member)
        const salesMemberId = req.user.salesMemberId;
        const [
          myCustomersCount,
          myOpenLeadsCount,
          todayFollowUpsCount,
          overdueFollowUpsCount,
          pendingFollowUpsCount,
          completedFollowUpsCount,
          myOpenQuestionsCount,
        ] = await Promise.all([
          Customer.countDocuments({ salesMemberId, customerStatus: { $ne: 'Inactive' } }),
          Lead.countDocuments({ salesMemberId, status: { $nin: ['Won', 'Lost'] } }),
          FollowUp.countDocuments({
            salesMemberId,
            date: todayStr,
            status: { $nin: ['Completed', 'Cancelled'] },
          }),
          FollowUp.countDocuments({
            salesMemberId,
            status: { $nin: ['Completed', 'Cancelled'] },
            $or: [{ date: { $lt: todayStr } }, { status: 'Overdue' }],
          }),
          FollowUp.countDocuments({
            salesMemberId,
            status: 'Pending',
          }),
          FollowUp.countDocuments({
            salesMemberId,
            status: 'Completed',
          }),
          SalesQuestion.countDocuments({
            askedBySalesMemberId: salesMemberId,
            status: { $in: ['OPEN', 'IN_PROGRESS'] },
          }),
        ]);

        return res.status(200).json({
          success: true,
          role: 'sales',
          stats: {
            myCustomers: myCustomersCount,
            myOpenLeads: myOpenLeadsCount,
            todayFollowUps: todayFollowUpsCount,
            overdueFollowUps: overdueFollowUpsCount,
            pendingFollowUps: pendingFollowUpsCount,
            completedFollowUps: completedFollowUpsCount,
            myOpenQuestions: myOpenQuestionsCount,
          },
        });
      }

      if (role === 'developer') {
        // Shared Developer Dashboard Metrics (All Organization Scope - No developerId filtering)
        const [
          totalWebsitesCount,
          activeDomainsCount,
          expiringDomainsCount,
          openQuestionsCount,
        ] = await Promise.all([
          Website.countDocuments({}),
          Website.countDocuments({ domainName: { $exists: true, $ne: '' }, domainStatus: 'ACTIVE' }),
          Website.countDocuments({ domainName: { $exists: true, $ne: '' }, domainStatus: 'EXPIRING_SOON' }),
          SalesQuestion.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
        ]);

        const devStats = {
          totalWebsites: totalWebsitesCount,
          totalWebsitesCount,
          myWebsites: totalWebsitesCount,
          myWebsitesCount: totalWebsitesCount,
          activeDomains: activeDomainsCount,
          activeDomainsCount,
          expiringDomains: expiringDomainsCount,
          expiringDomainsCount,
          openQuestions: openQuestionsCount,
          openQuestionsCount,
        };

        return res.status(200).json({
          success: true,
          role: 'developer',
          stats: devStats,
          developerStats: devStats,
        });
      }

      // Admin Organizational Metrics (strictly operational - 8 cards, no revenue analytics, no developer management)
      const [
        totalSalesMembers,
        totalCustomers,
        openLeads,
        pendingFollowUps,
        activeWebsites,
        activeDomains,
        expiringDomains,
        openSalesQuestions,
      ] = await Promise.all([
        User.countDocuments({ role: 'sales', status: 'active' }),
        Customer.countDocuments({ customerStatus: { $ne: 'Inactive' } }),
        Lead.countDocuments({ status: { $nin: ['Won', 'Lost'] } }),
        FollowUp.countDocuments({ status: 'Pending' }),
        Website.countDocuments({ status: { $in: ['LIVE', 'ACTIVE'] } }),
        Website.countDocuments({ domainName: { $exists: true, $ne: '' }, domainStatus: 'ACTIVE' }),
        Website.countDocuments({ domainName: { $exists: true, $ne: '' }, domainStatus: 'EXPIRING_SOON' }),
        SalesQuestion.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
      ]);

      const operationalStats = {
        totalSalesMembers,
        totalCustomers,
        openLeads,
        pendingFollowUps,
        activeWebsites,
        activeDomains,
        expiringDomains,
        openSalesQuestions,
      };

      res.status(200).json({
        success: true,
        role: 'admin',
        stats: operationalStats,
        operationalStats,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/dashboard/db-check (Comprehensive Database Audit)
  dbCheck: async (req, res, next) => {
    try {
      // 1. Fetch All Core Collections
      const [users, customers, leads, followUps, payments, activities] = await Promise.all([
        User.find().lean(),
        Customer.find().lean(),
        Lead.find().lean(),
        FollowUp.find().lean(),
        Payment.find().lean(),
        Activity.find().lean(),
      ]);

      const customerIdSet = new Set(customers.map((c) => c.customerId));
      const leadIdSet = new Set(leads.map((l) => l.leadId));
      const salesMemberIdSet = new Set(users.filter((u) => u.role === 'sales').map((u) => u.salesMemberId));

      // 2. Duplicate IDs Check
      const findDuplicates = (arr, key) => {
        const counts = {};
        const duplicates = [];
        arr.forEach((item) => {
          const val = item[key];
          if (val) {
            counts[val] = (counts[val] || 0) + 1;
            if (counts[val] === 2) duplicates.push(val);
          }
        });
        return duplicates;
      };

      const duplicateCustomerIds = findDuplicates(customers, 'customerId');
      const duplicateLeadIds = findDuplicates(leads, 'leadId');
      const duplicateFollowUpIds = findDuplicates(followUps, 'followUpId');
      const duplicatePaymentIds = findDuplicates(payments, 'paymentId');
      const duplicateEmails = findDuplicates(users, 'email');

      // 3. Relationships & Orphan Records Check
      const orphanPayments = payments.filter((p) => p.customerId && !customerIdSet.has(p.customerId));
      const orphanFollowUps = followUps.filter((f) => {
        if (f.customerId && !customerIdSet.has(f.customerId)) return true;
        if (f.leadId && !leadIdSet.has(f.leadId)) return true;
        return false;
      });
      const orphanActivities = activities.filter((a) => {
        if (a.customerId && !customerIdSet.has(a.customerId)) return true;
        if (a.leadId && !leadIdSet.has(a.leadId)) return true;
        return false;
      });
      const orphanConvertedLeads = leads.filter(
        (l) => l.isConverted && l.convertedCustomerId && !customerIdSet.has(l.convertedCustomerId)
      );

      // 4. Ownership Consistency Check
      const unassignedCustomers = customers.filter(
        (c) => !c.salesMemberId || !salesMemberIdSet.has(c.salesMemberId)
      );
      const unassignedLeads = leads.filter(
        (l) => !l.salesMemberId || !salesMemberIdSet.has(l.salesMemberId)
      );
      const unassignedFollowUps = followUps.filter(
        (f) => !f.salesMemberId || !salesMemberIdSet.has(f.salesMemberId)
      );

      // 5. Data Consistency & Financial Calculations
      const mathMismatches = customers.filter((c) => {
        const expectedFinal = Math.max(0, (c.dealValue || 0) - (c.discount || 0));
        const expectedRemaining = Math.max(0, expectedFinal - (c.amountPaid || 0));
        return (
          c.finalAmount !== expectedFinal ||
          c.remainingAmount !== expectedRemaining ||
          c.amountPaid < 0 ||
          c.remainingAmount < 0
        );
      });

      const invalidPayments = payments.filter((p) => p.amount <= 0);

      // 6. Database Indexes Check
      const [custIndexes, leadIndexes, flwIndexes, payIndexes, actIndexes, userIndexes] = await Promise.all([
        Customer.collection.getIndexes(),
        Lead.collection.getIndexes(),
        FollowUp.collection.getIndexes(),
        Payment.collection.getIndexes(),
        Activity.collection.getIndexes(),
        User.collection.getIndexes(),
      ]);

      const isHealthy =
        duplicateCustomerIds.length === 0 &&
        duplicateLeadIds.length === 0 &&
        duplicateFollowUpIds.length === 0 &&
        duplicatePaymentIds.length === 0 &&
        duplicateEmails.length === 0 &&
        orphanPayments.length === 0 &&
        orphanFollowUps.length === 0 &&
        orphanActivities.length === 0 &&
        orphanConvertedLeads.length === 0 &&
        unassignedCustomers.length === 0 &&
        unassignedLeads.length === 0 &&
        mathMismatches.length === 0 &&
        invalidPayments.length === 0;

      res.status(200).json({
        success: true,
        healthy: isHealthy,
        timestamp: new Date().toISOString(),
        summary: {
          totalUsers: users.length,
          totalCustomers: customers.length,
          totalLeads: leads.length,
          totalFollowUps: followUps.length,
          totalPayments: payments.length,
          totalActivities: activities.length,
        },
        checks: {
          duplicateIds: {
            status:
              duplicateCustomerIds.length +
                duplicateLeadIds.length +
                duplicateFollowUpIds.length +
                duplicatePaymentIds.length +
                duplicateEmails.length ===
              0
                ? 'PASSED'
                : 'FAILED',
            duplicateCustomerIds,
            duplicateLeadIds,
            duplicateFollowUpIds,
            duplicatePaymentIds,
            duplicateEmails,
          },
          relationshipsAndOrphans: {
            status:
              orphanPayments.length +
                orphanFollowUps.length +
                orphanActivities.length +
                orphanConvertedLeads.length ===
              0
                ? 'PASSED'
                : 'FAILED',
            orphanPaymentsCount: orphanPayments.length,
            orphanFollowUpsCount: orphanFollowUps.length,
            orphanActivitiesCount: orphanActivities.length,
            orphanConvertedLeadsCount: orphanConvertedLeads.length,
          },
          ownershipIntegrity: {
            status:
              unassignedCustomers.length + unassignedLeads.length + unassignedFollowUps.length === 0
                ? 'PASSED'
                : 'FAILED',
            unassignedCustomersCount: unassignedCustomers.length,
            unassignedLeadsCount: unassignedLeads.length,
            unassignedFollowUpsCount: unassignedFollowUps.length,
          },
          financialConsistency: {
            status: mathMismatches.length + invalidPayments.length === 0 ? 'PASSED' : 'FAILED',
            mathMismatchesCount: mathMismatches.length,
            invalidPaymentsCount: invalidPayments.length,
          },
          indexes: {
            status: 'VERIFIED',
            customerIndexes: Object.keys(custIndexes),
            leadIndexes: Object.keys(leadIndexes),
            followUpIndexes: Object.keys(flwIndexes),
            paymentIndexes: Object.keys(payIndexes),
            activityIndexes: Object.keys(actIndexes),
            userIndexes: Object.keys(userIndexes),
          },
        },
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = dashboardController;
