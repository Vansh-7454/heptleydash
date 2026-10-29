/**
 * Automated Verification Test Suite for Unified Website & Domain Workflow:
 * - Domain info stored directly in Website model
 * - No separate domain collections or CRUD
 * - Developer unified form submission
 * - Real MongoDB Date persistence & dynamic expiry calculation
 * - Role authorization (Sales read-only, Developer/Admin edit, Admin delete)
 * - Operational dashboard stats
 * - Regression test for existing CRM modules
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const http = require('http');

const User = require('../models/User');
const Website = require('../models/Website');
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
  console.log('\n===============================================================');
  console.log('STARTING UNIFIED WEBSITE & DOMAIN WORKFLOW TEST SUITE');
  console.log('===============================================================\n');

  // 1. Connect DB and seed
  await connectDB();
  console.log('1. Seeding database with unified websites & domains...');
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
    // TEST 1: Database Verification - Domain stored in Website model
    // ----------------------------------------------------
    console.log('--- TEST 1: Database Verification (Domain stored in Website model) ---');
    const seededWebsites = await Website.find({});
    assert(seededWebsites.length >= 3, `Seeded websites found: ${seededWebsites.length}`);

    const alphaSite = await Website.findOne({ websiteId: 'WEB-0001' });
    assert(alphaSite !== null, 'WEB-0001 found in MongoDB');
    assert(alphaSite.domainName === 'alphatech-demo.com', `domainName stored in Website record: ${alphaSite.domainName}`);
    assert(alphaSite.domainStartDate instanceof Date, 'domainStartDate is a real MongoDB Date object');
    assert(alphaSite.domainExpiryDate instanceof Date, 'domainExpiryDate is a real MongoDB Date object');
    assert(alphaSite.domainRegistrar === 'GoDaddy', `domainRegistrar stored in Website record: ${alphaSite.domainRegistrar}`);
    assert(alphaSite.domainAutoRenew === true, `domainAutoRenew stored in Website record: ${alphaSite.domainAutoRenew}`);
    assert(alphaSite.domainStatus === 'ACTIVE', `domainStatus stored as ACTIVE for >30d expiry: ${alphaSite.domainStatus}`);

    const betaSite = await Website.findOne({ websiteId: 'WEB-0002' });
    assert(betaSite.domainStatus === 'EXPIRING_SOON', `betaSite domainStatus computed as EXPIRING_SOON: ${betaSite.domainStatus}`);

    const gammaSite = await Website.findOne({ websiteId: 'WEB-0003' });
    assert(gammaSite.domainStatus === 'EXPIRED', `gammaSite domainStatus computed as EXPIRED: ${gammaSite.domainStatus}`);

    // ----------------------------------------------------
    // TEST 2: Common Developer & Admin Authentication
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Authentication ---');
    const adminLogin = await request('POST', '/api/auth/login', null, {
      email: 'admin@heptley.com',
      password: 'admin123',
    });
    assert(adminLogin.status === 200, 'Admin login succeeded (200)');
    const adminToken = adminLogin.body.token;

    const devLogin = await request('POST', '/api/auth/login', null, {
      email: 'developer@heptley.com',
      password: 'developer123',
    });
    assert(devLogin.status === 200, 'Developer login succeeded (200)');
    assert(devLogin.body.user.role === 'developer', "Role is 'developer'");
    const devToken = devLogin.body.token;

    const salesLogin = await request('POST', '/api/auth/login', null, {
      email: 'sales01@heptley.com',
      password: 'sales123',
    });
    assert(salesLogin.status === 200, 'Sales login succeeded (200)');
    const salesToken = salesLogin.body.token;

    // ----------------------------------------------------
    // TEST 3: Dashboard Stats reflect Website & Domain from Website collection
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Operational Stats from Website collection ---');
    const adminStats = await request('GET', '/api/dashboard/stats', adminToken);
    assert(adminStats.status === 200, 'Admin dashboard stats returned 200');
    const opStats = adminStats.body.operationalStats;
    assert(opStats.activeWebsites >= 2, `activeWebsites counted: ${opStats.activeWebsites}`);
    assert(opStats.activeDomains >= 1, `activeDomains counted from Website collection: ${opStats.activeDomains}`);
    assert(opStats.expiringDomains >= 1, `expiringDomains counted from Website collection: ${opStats.expiringDomains}`);

    const devStats = await request('GET', '/api/dashboard/stats', devToken);
    assert(devStats.status === 200, 'Developer dashboard stats returned 200');
    assert(devStats.body.stats.activeDomains >= 1, `Developer sees activeDomains: ${devStats.body.stats.activeDomains}`);

    // ----------------------------------------------------
    // TEST 4: Developer Submits Unified Website Details Form
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Developer Submits Complete Website Details Form ---');
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    const newWebsitePayload = {
      // Client Info
      customerId: 'CUS-0001',
      // Website Info
      websiteName: 'ABC Business Website',
      websiteUrl: 'https://abccompany.com',
      projectType: 'Corporate Website',
      status: 'LIVE',
      startDate: '2026-05-10',
      technologyStack: 'Next.js 15, Tailwind, Node.js',
      repositoryUrl: 'https://github.com/heptley-clients/abc-company',
      deploymentUrl: 'https://abccompany.com',
      description: 'Corporate business website completed by engineering team.',
      internalNotes: 'Client signed off on final QA inspection.',
      // Domain Info (PART OF SAME FORM)
      domainName: 'abccompany.com',
      domainStartDate: '2026-05-10',
      domainExpiryDate: nextYear.toISOString().split('T')[0],
      domainRegistrar: 'GoDaddy',
      domainAutoRenew: true,
      domainNotes: 'Registered with GoDaddy corporate account.',
    };

    const createRes = await request('POST', '/api/websites', devToken, newWebsitePayload);
    assert(createRes.status === 201, `Developer created website successfully (status: ${createRes.status})`);
    const createdWeb = createRes.body.website;
    assert(createdWeb.websiteId.startsWith('WEB-'), `Website ID generated: ${createdWeb.websiteId}`);
    assert(createdWeb.websiteName === 'ABC Business Website', 'Website Name persisted');
    assert(createdWeb.websiteUrl === 'https://abccompany.com', 'Website URL persisted');
    assert(createdWeb.domainName === 'abccompany.com', `Domain Name persisted in same record: ${createdWeb.domainName}`);
    assert(createdWeb.domainRegistrar === 'GoDaddy', `Domain Registrar persisted: ${createdWeb.domainRegistrar}`);
    assert(createdWeb.domainAutoRenew === true, `Domain AutoRenew persisted: ${createdWeb.domainAutoRenew}`);
    assert(createdWeb.domainStatus === 'ACTIVE', `Domain Status computed as ACTIVE: ${createdWeb.domainStatus}`);
    assert(createdWeb.domainDaysRemaining > 300, `Domain Days Remaining calculated dynamically: ${createdWeb.domainDaysRemaining}`);
    assert(createdWeb.customerName.includes('Alpha'), `Client details enriched: ${createdWeb.customerName}`);

    // Verify in MongoDB
    const webInDb = await Website.findOne({ websiteId: createdWeb.websiteId });
    assert(webInDb !== null, 'Website persisted directly in MongoDB');
    assert(webInDb.domainExpiryDate instanceof Date, 'domainExpiryDate is stored as real MongoDB Date object');

    // ----------------------------------------------------
    // TEST 5: Domain Expiry Calculation (Expiring Soon & Expired)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Domain Expiry Calculation Rules ---');
    const soonDate = new Date();
    soonDate.setDate(today.getDate() + 10); // 10 days remaining -> EXPIRING_SOON

    const expiringSoonPayload = {
      websiteName: 'Delta Staging Portal',
      websiteUrl: 'https://staging.deltaportal.com',
      domainName: 'deltaportal.com',
      domainExpiryDate: soonDate.toISOString().split('T')[0],
      domainRegistrar: 'Namecheap',
    };

    const soonRes = await request('POST', '/api/websites', devToken, expiringSoonPayload);
    assert(soonRes.status === 201, 'Expiring soon website created');
    const soonWeb = soonRes.body.website;
    assert(soonWeb.domainStatus === 'EXPIRING_SOON', `10 days expiry -> status EXPIRING_SOON (got: ${soonWeb.domainStatus})`);
    assert(soonWeb.domainDaysRemaining <= 10 && soonWeb.domainDaysRemaining >= 9, `Days remaining is ~10 (got: ${soonWeb.domainDaysRemaining})`);

    // Verify expiry notification generated
    const expiryNotif = await Notification.findOne({
      targetId: soonWeb.websiteId,
      type: 'domain_expiring_soon',
    });
    assert(expiryNotif !== null, `Notification generated for expiring domain (${expiryNotif?.title})`);

    // ----------------------------------------------------
    // TEST 6: Admin and Developer Update Website & Domain
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Update Website & Domain via PATCH ---');
    const updateRes = await request('PATCH', `/api/websites/${createdWeb.websiteId}`, devToken, {
      technologyStack: 'Next.js 15, TypeScript, Tailwind, Node.js, Redis',
      domainRegistrar: 'Cloudflare Registrar',
      internalNotes: 'Transferred DNS management to Cloudflare edge.',
    });
    assert(updateRes.status === 200, 'Developer updated website details (status 200)');
    assert(updateRes.body.website.domainRegistrar === 'Cloudflare Registrar', 'Updated domain registrar persisted');
    assert(updateRes.body.website.technologyStack.includes('Redis'), 'Updated technology stack persisted');

    // ----------------------------------------------------
    // TEST 7: Role Authorization Rules
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Role Authorization Rules ---');
    // Sales can read websites and their domain information
    const salesGet = await request('GET', '/api/websites', salesToken);
    assert(salesGet.status === 200, 'Sales member can read websites (GET 200)');
    const foundBySales = salesGet.body.websites.find((w) => w.websiteId === createdWeb.websiteId);
    assert(foundBySales !== undefined, 'Sales can view website record');
    assert(foundBySales.domainName === 'abccompany.com', 'Sales can view domain name for customer inquiries');
    assert(foundBySales.domainDaysRemaining !== null, 'Sales can view domain days remaining');

    // Sales cannot create website/domain
    const salesCreate = await request('POST', '/api/websites', salesToken, {
      websiteName: 'Unauthorized Site',
      websiteUrl: 'https://unauthorized.com',
    });
    assert(salesCreate.status === 403, 'Sales CANNOT create website (403 Forbidden)');

    // Sales cannot edit website/domain
    const salesEdit = await request('PATCH', `/api/websites/${createdWeb.websiteId}`, salesToken, {
      websiteName: 'Hacked Name',
    });
    assert(salesEdit.status === 403, 'Sales CANNOT update website/domain (403 Forbidden)');

    // Developer cannot delete website (Admin only)
    const devDelete = await request('DELETE', `/api/websites/${createdWeb.websiteId}`, devToken);
    assert(devDelete.status === 403, 'Developer CANNOT delete website (403 Forbidden - Admin only)');

    // Admin can delete website
    const adminDelete = await request('DELETE', `/api/websites/${createdWeb.websiteId}`, adminToken);
    assert(adminDelete.status === 200, 'Admin can delete website (200 OK)');
    const checkDeleted = await Website.findOne({ websiteId: createdWeb.websiteId });
    assert(checkDeleted === null, 'Website and embedded domain deleted together from MongoDB');

    // ----------------------------------------------------
    // TEST 8: Regression Checks on Existing CRM Endpoints
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Regression Checks on Existing CRM Endpoints ---');
    const custRes = await request('GET', '/api/customers', adminToken);
    assert(custRes.status === 200, `Customers API working (count: ${custRes.body.count})`);

    const leadRes = await request('GET', '/api/leads', salesToken);
    assert(leadRes.status === 200, `Leads API working (count: ${leadRes.body.count})`);

    const fupRes = await request('GET', '/api/follow-ups', salesToken);
    assert(fupRes.status === 200, `Follow-ups API working (count: ${fupRes.body.count})`);

    const payRes = await request('GET', '/api/payments', adminToken);
    assert(payRes.status === 200, `Payments API working (count: ${payRes.body.count})`);

    const actRes = await request('GET', '/api/activities', adminToken);
    assert(actRes.status === 200, `Activities API working (count: ${actRes.body.count})`);

    const qRes = await request('GET', '/api/sales-questions', devToken);
    assert(qRes.status === 200, `Sales Questions API working (count: ${qRes.body.count})`);

    console.log('\n===============================================================');
    console.log('ALL UNIFIED WEBSITE & DOMAIN WORKFLOW TESTS PASSED SUCCESSFULLY!');
    console.log(`Total assertions passed: ${testResults.filter((r) => r.passed).length}/${testResults.length}`);
    console.log('===============================================================\n');
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
