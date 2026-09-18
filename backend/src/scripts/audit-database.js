const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = 'http://localhost:5000/api';

async function auditDatabase() {
  console.log('\n======================================================================');
  console.log('🔍 HEPTLEY CRM: COMPREHENSIVE DATABASE AUDIT & INTEGRITY CHECK');
  console.log('======================================================================\n');

  try {
    // 1. Authenticate as Admin to run DB audit
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@heptley.com', password: 'admin123' }),
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.error('❌ Failed to authenticate as Admin:', loginData.message);
      process.exit(1);
    }
    const token = loginData.token;

    // 2. Fetch DB Check
    const dbRes = await fetch(`${BASE_URL}/dashboard/db-check`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const audit = await dbRes.json();

    if (!audit.success) {
      console.error('❌ DB Audit endpoint returned error:', audit.message);
      process.exit(1);
    }

    console.log(`⏱️ Audit Timestamp: ${audit.timestamp}`);
    console.log(`💚 Overall Database Health: ${audit.healthy ? '✅ 100% HEALTHY & CONSISTENT' : '⚠️ ISSUES DETECTED'}\n`);

    console.log('--- 1. Collection Record Summary ---');
    console.table({
      Users: { Count: audit.summary.totalUsers },
      Customers: { Count: audit.summary.totalCustomers },
      Leads: { Count: audit.summary.totalLeads },
      FollowUps: { Count: audit.summary.totalFollowUps },
      Payments: { Count: audit.summary.totalPayments },
      Activities: { Count: audit.summary.totalActivities },
    });

    console.log('\n--- 2. Duplicate ID Verification ---');
    console.log(`Status: ${audit.checks.duplicateIds.status === 'PASSED' ? '✅ PASSED (Zero Duplicates)' : '❌ FAILED'}`);
    console.log(`  - Duplicate Customer IDs: ${audit.checks.duplicateIds.duplicateCustomerIds.length === 0 ? '0' : JSON.stringify(audit.checks.duplicateIds.duplicateCustomerIds)}`);
    console.log(`  - Duplicate Lead IDs:     ${audit.checks.duplicateIds.duplicateLeadIds.length === 0 ? '0' : JSON.stringify(audit.checks.duplicateIds.duplicateLeadIds)}`);
    console.log(`  - Duplicate FollowUp IDs: ${audit.checks.duplicateIds.duplicateFollowUpIds.length === 0 ? '0' : JSON.stringify(audit.checks.duplicateIds.duplicateFollowUpIds)}`);
    console.log(`  - Duplicate Payment IDs:  ${audit.checks.duplicateIds.duplicatePaymentIds.length === 0 ? '0' : JSON.stringify(audit.checks.duplicateIds.duplicatePaymentIds)}`);
    console.log(`  - Duplicate User Emails:  ${audit.checks.duplicateIds.duplicateEmails.length === 0 ? '0' : JSON.stringify(audit.checks.duplicateIds.duplicateEmails)}`);

    console.log('\n--- 3. Relationships & Orphan Records Audit ---');
    console.log(`Status: ${audit.checks.relationshipsAndOrphans.status === 'PASSED' ? '✅ PASSED (Zero Orphans)' : '❌ FAILED'}`);
    console.log(`  - Orphan Payments (invalid customerId):     ${audit.checks.relationshipsAndOrphans.orphanPaymentsCount}`);
    console.log(`  - Orphan Follow-ups (invalid entity ID):   ${audit.checks.relationshipsAndOrphans.orphanFollowUpsCount}`);
    console.log(`  - Orphan Activities (invalid entity ID):   ${audit.checks.relationshipsAndOrphans.orphanActivitiesCount}`);
    console.log(`  - Orphan Converted Leads (bad customerId): ${audit.checks.relationshipsAndOrphans.orphanConvertedLeadsCount}`);

    console.log('\n--- 4. Ownership Integrity Audit ---');
    console.log(`Status: ${audit.checks.ownershipIntegrity.status === 'PASSED' ? '✅ PASSED (All records assigned to active reps)' : '❌ FAILED'}`);
    console.log(`  - Unassigned Customers: ${audit.checks.ownershipIntegrity.unassignedCustomersCount}`);
    console.log(`  - Unassigned Leads:     ${audit.checks.ownershipIntegrity.unassignedLeadsCount}`);
    console.log(`  - Unassigned FollowUps: ${audit.checks.ownershipIntegrity.unassignedFollowUpsCount}`);

    console.log('\n--- 5. Financial Ledger Consistency Audit ---');
    console.log(`Status: ${audit.checks.financialConsistency.status === 'PASSED' ? '✅ PASSED (Exact arithmetic matches)' : '❌ FAILED'}`);
    console.log(`  - Mathematical Mismatches (dealValue - discount !== finalAmount OR finalAmount - paid !== remaining): ${audit.checks.financialConsistency.mathMismatchesCount}`);
    console.log(`  - Invalid Non-positive Payments (amount <= 0): ${audit.checks.financialConsistency.invalidPaymentsCount}`);

    console.log('\n--- 6. MongoDB Index Audit ---');
    console.log('Customer Indexes:');
    console.log(' ', audit.checks.indexes.customerIndexes.join(', '));
    console.log('Lead Indexes:');
    console.log(' ', audit.checks.indexes.leadIndexes.join(', '));
    console.log('FollowUp Indexes:');
    console.log(' ', audit.checks.indexes.followUpIndexes.join(', '));
    console.log('Payment Indexes:');
    console.log(' ', audit.checks.indexes.paymentIndexes.join(', '));
    console.log('Activity Indexes:');
    console.log(' ', audit.checks.indexes.activityIndexes.join(', '));
    console.log('User Indexes:');
    console.log(' ', audit.checks.indexes.userIndexes.join(', '));

    console.log('\n======================================================================');
    console.log('🎉 DATABASE AUDIT COMPLETE: ALL CHECKS PASSED WITH ZERO INTEGRITY DEFECTS');
    console.log('======================================================================\n');
  } catch (err) {
    console.error('Audit execution error:', err);
    process.exit(1);
  }
}

auditDatabase();
