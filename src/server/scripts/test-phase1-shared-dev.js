/**
 * Comprehensive Automated Test Suite for Phase 1:
 * Shared Developer Dashboard + Website/Domain Management + Sales Questions
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const http = require('http');

const User = require('../models/User');
const Website = require('../models/Website');
const Domain = require('../models/Domain');
const SalesQuestion = require('../models/SalesQuestion');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Payment = require('../models/Payment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const { connectDB } = require('../config/db');
const seedDatabase = require('./seed');
const app = require('../app');
const { initSocket } = require('../socket');

let server;
let baseUrl;

async function request(method, path, token, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const testResults = [];

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    testResults.push({ message, passed: true });
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testResults.push({ message, passed: false });
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log('\n==================================================');
  console.log('STARTING PHASE 1 SHARED DEVELOPER TEST SUITE');
  console.log('==================================================\n');

  // 1. Connect DB and seed
  await connectDB();
  console.log('1. Seeding database with single shared developer...');
  await seedDatabase();

  // Start temporary HTTP server on random port
  await new Promise((resolve) => {
    server = http.createServer(app);
    initSocket(server);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`Test server running at ${baseUrl}\n`);
      resolve();
    });
  });

  try {
    // ----------------------------------------------------
    // TEST 1: Common Developer Account & Database Validation
    // ----------------------------------------------------
    console.log('--- TEST 1: Common Developer Account & Database Validation ---');
    const devUsers = await User.find({ role: 'developer' });
    assert(devUsers.length === 1, `Exactly ONE developer user exists in DB (found: ${devUsers.length})`);

    const devUser = devUsers[0];
    assert(devUser.email === 'developer@heptley.com', `Developer email is 'developer@heptley.com' (found: ${devUser.email})`);
    assert(devUser.developerId === null, `Developer has NO individual developerId (found: ${devUser.developerId})`);
    assert(devUser.password.startsWith('$2'), `Developer password is secure bcrypt hash (not plain text)`);

    const isMatch = await bcrypt.compare('developer123', devUser.password);
    assert(isMatch, 'Developer password correctly verifies against bcrypt hash');

    // Verify NO Dev 1, Dev 2, DEV-001, DEV-002
    const dev01 = await User.findOne({ email: 'dev01@heptley.com' });
    const dev02 = await User.findOne({ email: 'dev02@heptley.com' });
    const devCode1 = await User.findOne({ developerId: 'DEV-001' });
    const devCode2 = await User.findOne({ developerId: 'DEV-002' });
    assert(!dev01, 'No individual dev01@heptley.com account exists');
    assert(!dev02, 'No individual dev02@heptley.com account exists');
    assert(!devCode1, 'No user with developerId DEV-001 exists');
    assert(!devCode2, 'No user with developerId DEV-002 exists');

    // ----------------------------------------------------
    // TEST 2: Authentication (Admin, Sales, Common Developer)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Authentication Flows ---');
    const adminLogin = await request('POST', '/api/auth/login', null, {
      email: 'admin@heptley.com',
      password: 'admin123',
    });
    assert(adminLogin.status === 200, `Admin login succeeded with status 200`);
    assert(adminLogin.body.user.role === 'admin', `Admin role returned: 'admin'`);
    const adminToken = adminLogin.body.token;

    const salesLogin = await request('POST', '/api/auth/login', null, {
      email: 'sales01@heptley.com',
      password: 'sales123',
    });
    assert(salesLogin.status === 200, `Sales login succeeded with status 200`);
    assert(salesLogin.body.user.role === 'sales', `Sales role returned: 'sales'`);
    const salesToken = salesLogin.body.token;

    const devLogin = await request('POST', '/api/auth/login', null, {
      email: 'developer@heptley.com',
      password: 'developer123',
    });
    assert(devLogin.status === 200, `Common Developer login succeeded with status 200`);
    assert(devLogin.body.user.role === 'developer', `Developer role returned: 'developer'`);
    assert(devLogin.body.user.developerId === null, `Developer token payload has null developerId`);
    const devToken = devLogin.body.token;

    // ----------------------------------------------------
    // TEST 3: Admin Dashboard Operational Stats (NO REVENUE, 8 CARDS)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Admin Dashboard Operational Stats (No Revenue, 8 Cards) ---');
    const adminStats = await request('GET', '/api/dashboard/stats', adminToken);
    assert(adminStats.status === 200, 'Admin stats request succeeded');
    const opStats = adminStats.body.operationalStats;
    assert(opStats !== undefined, 'operationalStats object returned');
    assert(typeof opStats.totalSalesMembers === 'number', `totalSalesMembers: ${opStats.totalSalesMembers}`);
    assert(typeof opStats.totalCustomers === 'number', `totalCustomers: ${opStats.totalCustomers}`);
    assert(typeof opStats.openLeads === 'number', `openLeads: ${opStats.openLeads}`);
    assert(typeof opStats.pendingFollowUps === 'number', `pendingFollowUps: ${opStats.pendingFollowUps}`);
    assert(typeof opStats.activeWebsites === 'number', `activeWebsites: ${opStats.activeWebsites}`);
    assert(typeof opStats.activeDomains === 'number', `activeDomains: ${opStats.activeDomains}`);
    assert(typeof opStats.expiringDomains === 'number', `expiringDomains: ${opStats.expiringDomains}`);
    assert(typeof opStats.openSalesQuestions === 'number', `openSalesQuestions: ${opStats.openSalesQuestions}`);

    // Verify STRICTLY NO REVENUE ANALYTICS returned in admin stats
    assert(adminStats.body.totalRevenue === undefined, 'No totalRevenue field in stats response');
    assert(adminStats.body.revenueGrowth === undefined, 'No revenueGrowth field in stats response');
    assert(adminStats.body.revenueAnalytics === undefined, 'No revenueAnalytics field in stats response');
    assert(adminStats.body.totalDevelopers === undefined, 'No totalDevelopers field in stats response');

    // ----------------------------------------------------
    // TEST 4: Shared Developer Dashboard Stats (Organization Totals)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Developer Dashboard Stats (Shared Totals) ---');
    const devStats = await request('GET', '/api/dashboard/stats', devToken);
    assert(devStats.status === 200, 'Developer stats request succeeded');
    const dStats = devStats.body.stats;
    assert(dStats.totalWebsites > 0, `totalWebsites: ${dStats.totalWebsites} (not filtered by individual dev)`);
    assert(dStats.activeDomains > 0, `activeDomains: ${dStats.activeDomains}`);
    assert(typeof dStats.expiringDomains === 'number', `expiringDomains: ${dStats.expiringDomains}`);
    assert(typeof dStats.openQuestions === 'number', `openQuestions: ${dStats.openQuestions}`);

    // ----------------------------------------------------
    // TEST 5: Domain Management & Real Date Persistence
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Domain Management & Expiry Dates ---');
    const today = new Date();
    const expirySoon = new Date();
    expirySoon.setDate(today.getDate() + 15); // 15 days -> EXPIRING_SOON

    const createDomainRes = await request('POST', '/api/domains', adminToken, {
      domainName: 'testphase1-expiring.com',
      websiteId: 'WEB-0001',
      startDate: today.toISOString(),
      expiryDate: expirySoon.toISOString(),
      registrar: 'GoDaddy',
      autoRenew: true,
    });
    assert(createDomainRes.status === 201, 'Domain created successfully');
    const createdDom = createDomainRes.body.domain;
    assert(createdDom.status === 'EXPIRING_SOON', `Domain status correctly computed as EXPIRING_SOON (got: ${createdDom.status})`);
    assert(createdDom.daysRemaining <= 15 && createdDom.daysRemaining >= 14, `Days remaining correctly computed (~15 days, got: ${createdDom.daysRemaining})`);

    // Verify DB types
    const domInDb = await Domain.findOne({ domainName: 'testphase1-expiring.com' });
    assert(domInDb.startDate instanceof Date, 'startDate is stored as MongoDB Date object');
    assert(domInDb.expiryDate instanceof Date, 'expiryDate is stored as MongoDB Date object');

    // Developer views domains (shared, sees start and expiry dates)
    const devDomains = await request('GET', '/api/domains', devToken);
    assert(devDomains.status === 200, 'Developer can view all domains');
    const devFoundDom = devDomains.body.domains.find((d) => d.domainName === 'testphase1-expiring.com');
    assert(devFoundDom !== undefined, 'Developer sees the newly created domain');
    assert(devFoundDom.startDate !== undefined, 'Developer sees domain startDate');
    assert(devFoundDom.expiryDate !== undefined, 'Developer sees domain expiryDate');
    assert(devFoundDom.daysRemaining !== undefined, 'Developer sees domain daysRemaining');

    // ----------------------------------------------------
    // TEST 6: Sales Question Flow (Create -> Developer Answer -> Realtime)
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Sales Question Workflow ---');
    const createQuestionRes = await request('POST', '/api/sales-questions', salesToken, {
      subject: 'Phase 1 Payment Integration Feasibility',
      question: 'Client is asking when their domain will expire and if we support recurring subscriptions.',
      priority: 'URGENT',
    });
    assert(createQuestionRes.status === 201, 'Sales question created successfully');
    const qData = createQuestionRes.body.salesQuestion || createQuestionRes.body.question || createQuestionRes.body;
    assert(qData.questionId.startsWith('Q-'), `Question ID sequence generated: ${qData.questionId}`);
    assert(qData.priority === 'URGENT', `Question priority is URGENT`);
    assert(qData.status === 'OPEN', `Question default status is OPEN`);

    // Developer answers question
    const answerRes = await request('POST', `/api/sales-questions/${qData.questionId}/answer`, devToken, {
      answer: 'Domain expiry is visible on their portal. Recurring subscriptions are scheduled for Next.js gateway phase.',
      status: 'ANSWERED',
    });
    assert(answerRes.status === 200, 'Developer answered question successfully');
    const answeredQ = answerRes.body.salesQuestion || answerRes.body.question || answerRes.body;
    assert(answeredQ.status === 'ANSWERED', `Question status updated to ANSWERED`);
    assert(answeredQ.answer.length > 10, 'Answer content persisted');
    assert(answeredQ.answeredByName === 'Developer' || answeredQ.answeredBy === 'Developer', `Answered by: ${answeredQ.answeredByName || answeredQ.answeredBy}`);
    assert(answeredQ.answeredAt !== undefined, 'answeredAt timestamp stored');

    // Sales member retrieves question
    const salesQList = await request('GET', '/api/sales-questions', salesToken);
    const qList = salesQList.body.salesQuestions || salesQList.body.questions || [];
    const salesFoundQ = qList.find((q) => q.questionId === qData.questionId);
    assert(salesFoundQ !== undefined, 'Sales member can retrieve their question');
    assert(salesFoundQ.status === 'ANSWERED', 'Sales member sees answered status');
    assert(salesFoundQ.answer === answeredQ.answer, 'Sales member sees developer answer');

    // ----------------------------------------------------
    // TEST 7: Regression Tests (Customers, Leads, Follow-ups, Payments)
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Regression Checks ---');
    const custRes = await request('GET', '/api/customers', adminToken);
    assert(custRes.status === 200, `Existing Customers API functional (count: ${custRes.body.count})`);

    const leadRes = await request('GET', '/api/leads', salesToken);
    assert(leadRes.status === 200, `Existing Leads API functional (count: ${leadRes.body.count})`);

    const fupRes = await request('GET', '/api/follow-ups', salesToken);
    assert(fupRes.status === 200, `Existing Follow-ups API functional (count: ${fupRes.body.count})`);

    const payRes = await request('GET', '/api/payments', adminToken);
    assert(payRes.status === 200, `Existing Payments API functional (count: ${payRes.body.count})`);

    const actRes = await request('GET', '/api/activities', adminToken);
    assert(actRes.status === 200, `Existing Activities API functional (count: ${actRes.body.count})`);

    console.log('\n==================================================');
    console.log('ALL PHASE 1 AUTOMATED TESTS PASSED SUCCESSFULLY!');
    console.log(`Total checks passed: ${testResults.filter((r) => r.passed).length}/${testResults.length}`);
    console.log('==================================================\n');
  } finally {
    if (server) server.close();
    await mongoose.connection.close();
  }
}

runTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nTest Suite Failed:', err);
    process.exit(1);
  });
