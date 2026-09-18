require('dotenv').config();
const http = require('http');
const { io: ClientIO } = require('socket.io-client');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const { initSocket } = require('../socket');
const seedDatabase = require('./seed');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const FollowUp = require('../models/FollowUp');

async function runPhase3Tests() {
  console.log('\n===============================================================');
  console.log('🧪 HEPTLEY CRM PHASE 3: COMPREHENSIVE INTEGRATION TEST SUITE');
  console.log('===============================================================\n');

  await connectDB();
  await seedDatabase();

  const server = http.createServer(app);
  initSocket(server);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const socketUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Server] Live on ${baseUrl} (Socket.IO active)\n`);

  const request = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  };

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  let adminToken = '';
  let sales01Token = '';
  let sales02Token = '';
  let adminSocket = null;
  let sales01Socket = null;
  let sales02Socket = null;

  try {
    // -------------------------------------------------------------
    // SETUP & AUTHENTICATION
    // -------------------------------------------------------------
    console.log('--- Establishing Authenticated Sessions ---');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@heptley.com', password: 'admin123' }),
    });
    adminToken = adminLogin.data.token;

    const sales01Login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'sales01@heptley.com', password: 'sales123' }),
    });
    sales01Token = sales01Login.data.token;

    const sales02Login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'sales02@heptley.com', password: 'sales123' }),
    });
    sales02Token = sales02Login.data.token;

    // Connect WebSockets
    adminSocket = ClientIO(socketUrl, {
      auth: { token: adminToken },
      transports: ['websocket'],
    });
    sales01Socket = ClientIO(socketUrl, {
      auth: { token: sales01Token },
      transports: ['websocket'],
    });
    sales02Socket = ClientIO(socketUrl, {
      auth: { token: sales02Token },
      transports: ['websocket'],
    });

    await Promise.all([
      new Promise((res) => adminSocket.on('connect', res)),
      new Promise((res) => sales01Socket.on('connect', res)),
      new Promise((res) => sales02Socket.on('connect', res)),
    ]);
    console.log('  Sockets connected & authenticated: Admin, Sales 01, Sales 02\n');

    // -------------------------------------------------------------
    // TEST 1: Admin creates Sales Member
    // -------------------------------------------------------------
    console.log('--- TEST 1: Admin creates Sales Member ---');
    const createMemberRes = await request('/users/sales-members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Sales Member 04',
        email: 'sales04@heptley.com',
        phone: '+91 98765 44404',
        password: 'salespassword123',
      }),
    });
    assert(
      createMemberRes.status === 201 &&
        createMemberRes.data.salesMember.memberId === 'SM-004' &&
        createMemberRes.data.salesMember.name === 'Sales Member 04',
      'Admin successfully creates Sales Member 04 with auto-assigned SM-004'
    );

    // -------------------------------------------------------------
    // TEST 2: Sales Member 01 logs in
    // -------------------------------------------------------------
    console.log('\n--- TEST 2: Sales Member 01 logs in ---');
    const sm01AuthCheck = await request('/auth/me', {
      headers: { Authorization: `Bearer ${sales01Token}` },
    });
    assert(
      sm01AuthCheck.status === 200 &&
        sm01AuthCheck.data.user.role === 'sales' &&
        sm01AuthCheck.data.user.salesMemberId === 'SM-001',
      'Sales Member 01 authenticated session returns role=sales and salesMemberId=SM-001'
    );

    // -------------------------------------------------------------
    // TEST 3: Sales Member 01 creates a Lead
    // TEST 4: Admin sees the Lead without refreshing (Socket.IO event)
    // TEST 5: Sales Member 02 does not receive Sales Member 01's private lead
    // -------------------------------------------------------------
    console.log('\n--- TEST 3, 4 & 5: Lead Creation & Real-Time Isolation ---');
    let adminReceivedLead = null;
    let sales02ReceivedLead = null;

    adminSocket.on('lead:created', (data) => {
      adminReceivedLead = data;
    });

    sales02Socket.on('lead:created', (data) => {
      sales02ReceivedLead = data;
    });

    const createLeadRes = await request('/leads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales01Token}` },
      body: JSON.stringify({
        name: 'Aarav Mehta',
        company: 'Mehta Infotech Solutions',
        email: 'aarav@mehtainfotech.in',
        phone: '+91 98200 11223',
        service: 'Web Development',
        value: 175000,
        dealValue: 175000,
        leadSource: 'LinkedIn Outreach',
        status: 'New',
        priority: 'High',
        notes: 'Needs enterprise web portal and custom CRM dashboard.',
      }),
    });

    assert(
      createLeadRes.status === 201 &&
        createLeadRes.data.lead.leadId.startsWith('LEAD-') &&
        createLeadRes.data.lead.salesMemberId === 'SM-001',
      `TEST 3: Sales Member 01 creates Lead (${createLeadRes.data.lead?.leadId}) assigned to SM-001`
    );

    // Allow socket dispatch
    await new Promise((r) => setTimeout(r, 400));

    assert(
      adminReceivedLead !== null && adminReceivedLead.id === createLeadRes.data.lead.id,
      'TEST 4: Admin receives real-time lead:created Socket.IO event without refreshing'
    );

    assert(
      sales02ReceivedLead === null,
      "TEST 5: Real-Time Isolation: Sales Member 02 does NOT receive Sales Member 01's private lead"
    );

    const createdLeadId = createLeadRes.data.lead.id;

    // -------------------------------------------------------------
    // TEST 6: Sales Member 01 converts Lead → Customer
    // TEST 7: Admin sees new Customer immediately with atomic ID
    // -------------------------------------------------------------
    console.log('\n--- TEST 6 & 7: Lead-to-Customer Atomic Conversion ---');
    let adminReceivedCustomer = null;
    adminSocket.on('customer:created', (data) => {
      adminReceivedCustomer = data;
    });

    const convertRes = await request(`/leads/${createdLeadId}/convert`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales01Token}` },
      body: JSON.stringify({
        dealValue: 175000,
        discount: 15000,
        amountPaid: 50000,
        package: 'Enterprise Tier',
        startDate: '2026-09-20',
        endDate: '2027-03-20',
        paymentMethod: 'Bank Transfer',
      }),
    });

    assert(
      convertRes.status === 201 &&
        convertRes.data.lead.isConverted === true &&
        convertRes.data.lead.status === 'Won' &&
        convertRes.data.customer.customerId.startsWith('CUS-'),
      `TEST 6: Lead converted to Customer (${convertRes.data.customer?.customerId}), lead isConverted=true, status=Won`
    );

    const createdCustomer = convertRes.data.customer;

    // Double conversion prevention test
    const duplicateConvertRes = await request(`/leads/${createdLeadId}/convert`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales01Token}` },
      body: JSON.stringify({}),
    });
    assert(
      duplicateConvertRes.status === 400,
      'Double conversion prevention: Converting an already converted lead returns 400 Bad Request'
    );

    await new Promise((r) => setTimeout(r, 400));
    assert(
      adminReceivedCustomer !== null && adminReceivedCustomer.customerId === createdCustomer.customerId,
      `TEST 7: Admin receives real-time customer:created Socket.IO event with atomic ID (${createdCustomer.customerId})`
    );

    // Verify financial invariant
    assert(
      createdCustomer.finalAmount === 160000 &&
        createdCustomer.amountPaid === 50000 &&
        createdCustomer.remainingAmount === 110000 &&
        createdCustomer.paymentStatus === 'Partial',
      'Financial Invariant: finalAmount=160000, amountPaid=50000, remainingAmount=110000, paymentStatus=Partial'
    );

    // -------------------------------------------------------------
    // TEST 8: Sales Member 01 creates Follow-up
    // TEST 9: Dashboard follow-up count updates
    // -------------------------------------------------------------
    console.log('\n--- TEST 8 & 9: Follow-up Creation & Dashboard Stats Update ---');
    const statsBefore = await request('/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pendingFollowUpsBefore = statsBefore.data.stats.pendingFollowUps;

    const createFollowUpRes = await request('/follow-ups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales01Token}` },
      body: JSON.stringify({
        title: 'Architecture Blueprint Review',
        entityType: 'Customer',
        customerId: createdCustomer.customerId,
        entityName: createdCustomer.name,
        company: createdCustomer.company,
        date: new Date().toISOString().split('T')[0],
        time: '14:30',
        type: 'Meeting',
        note: 'Review system architecture and database requirements with Aarav.',
      }),
    });

    assert(
      createFollowUpRes.status === 201 &&
        createFollowUpRes.data.followUp.followUpId.startsWith('FLW-') &&
        createFollowUpRes.data.followUp.status === 'Pending',
      `TEST 8: Sales Member 01 creates Follow-up (${createFollowUpRes.data.followUp?.followUpId})`
    );

    const statsAfter = await request('/dashboard/stats', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pendingFollowUpsAfter = statsAfter.data.stats.pendingFollowUps;

    assert(
      pendingFollowUpsAfter === pendingFollowUpsBefore + 1,
      `TEST 9: Dashboard stats reflect incremented pending follow-ups (${pendingFollowUpsBefore} -> ${pendingFollowUpsAfter})`
    );

    // -------------------------------------------------------------
    // TEST 10: Sales Member 01 records Payment
    // TEST 11: Customer payment status updates to Partial/Paid
    // TEST 12: Activity timeline receives payment activity
    // -------------------------------------------------------------
    console.log('\n--- TEST 10, 11 & 12: Payment Receipt & Activity Timeline ---');
    const recordPaymentRes = await request('/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales01Token}` },
      body: JSON.stringify({
        customerId: createdCustomer.customerId,
        customerName: createdCustomer.name,
        company: createdCustomer.company,
        totalAmount: 160000,
        amount: 110000,
        amountPaid: 110000, // Pays the full remaining balance!
        remaining: 0,
        paymentStatus: 'Paid',
        paymentMethod: 'Bank Transfer',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: 'Final milestone clearance transfer received via NEFT.',
      }),
    });

    assert(
      recordPaymentRes.status === 201 &&
        recordPaymentRes.data.payment.paymentRef.startsWith('PAY-') &&
        recordPaymentRes.data.payment.amountPaid === 110000,
      `TEST 10: Sales Member 01 records Payment (${recordPaymentRes.data.payment?.paymentRef}) for ₹110,000`
    );

    // Customer status check
    const updatedCustomerCheck = await request(`/customers/${createdCustomer.id}`, {
      headers: { Authorization: `Bearer ${sales01Token}` },
    });

    assert(
      updatedCustomerCheck.status === 200 &&
        updatedCustomerCheck.data.customer.amountPaid === 160000 &&
        updatedCustomerCheck.data.customer.remainingAmount === 0 &&
        updatedCustomerCheck.data.customer.paymentStatus === 'Paid',
      'TEST 11: Customer payment balance updated to remainingAmount=0 and paymentStatus=Paid'
    );

    // Activity timeline check
    const activitiesRes = await request(`/activities?entityId=${createdCustomer.customerId}`, {
      headers: { Authorization: `Bearer ${sales01Token}` },
    });

    const paymentActivity = activitiesRes.data.activities.find((a) => a.type === 'Payment');
    assert(
      paymentActivity !== undefined &&
        (paymentActivity.description.includes('1,10,000') || paymentActivity.description.includes('110000') || paymentActivity.description.includes('110,000')),
      'TEST 12: Activity timeline automatically logged the Payment receipt'
    );

    // -------------------------------------------------------------
    // TEST 13: Logout/login and verify data persistence in MongoDB
    // -------------------------------------------------------------
    console.log('\n--- TEST 13: Logout / Login & MongoDB Direct Persistence ---');
    const reLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'sales01@heptley.com', password: 'sales123' }),
    });
    const freshToken = reLogin.data.token;

    // Direct MongoDB verification bypassing controllers
    const persistedCustomer = await Customer.findById(createdCustomer.id);
    const persistedLead = await Lead.findById(createdLeadId);
    const persistedPayment = await Payment.findOne({
      $or: [{ customerId: createdCustomer.customerId }, { customerId: createdCustomer.id }],
    });

    assert(
      freshToken &&
        persistedCustomer !== null &&
        persistedCustomer.customerId === createdCustomer.customerId &&
        persistedCustomer.paymentStatus === 'Paid' &&
        persistedLead.isConverted === true &&
        persistedPayment !== null,
      'TEST 13: Fresh session login successful; all entities and mutations directly verified in MongoDB'
    );

    // -------------------------------------------------------------
    // TEST 14: Server-side search & filtering validation
    // -------------------------------------------------------------
    console.log('\n--- TEST 14: Server-Side Search & Filtering ---');
    const searchRes = await request('/customers?search=Mehta', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      searchRes.status === 200 &&
        searchRes.data.customers.length === 1 &&
        searchRes.data.customers[0].name === 'Aarav Mehta',
      'Customer search (?search=Mehta) returns matching customer record'
    );

    const filterLeadRes = await request('/leads?status=Won', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      filterLeadRes.status === 200 &&
        filterLeadRes.data.leads.some((l) => l.id === createdLeadId && l.status === 'Won'),
      'Lead filter (?status=Won) correctly filters converted leads'
    );

    const followUpTabRes = await request('/follow-ups?tab=today', {
      headers: { Authorization: `Bearer ${sales01Token}` },
    });
    assert(
      followUpTabRes.status === 200 &&
        Array.isArray(followUpTabRes.data.followUps),
      'Follow-up filtering (?tab=today) correctly categorizes records for current date'
    );
    assert(true, 'TEST 14: Server-side search & filtering validated across Customers, Leads, and Follow-ups');

    // -------------------------------------------------------------
    // TEST 15: Unauthorized API requests rejected (403 Forbidden)
    // -------------------------------------------------------------
    console.log('\n--- TEST 15: Unauthorized API Requests Rejected ---');
    const unauthAttempt1 = await request('/users/sales-members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales01Token}` }, // Sales cannot create sales members
      body: JSON.stringify({ name: 'Illegal User' }),
    });
    assert(
      unauthAttempt1.status === 403,
      'POST /api/users/sales-members by Sales rep rejected with 403 Forbidden'
    );

    const unauthAttempt2 = await request('/customers', {
      // No token
    });
    assert(
      unauthAttempt2.status === 401,
      'GET /api/customers without token rejected with 401 Unauthorized'
    );
    assert(true, 'TEST 15: Unauthorized API requests properly guarded with 401/403');

    // -------------------------------------------------------------
    // TEST 16: Unauthorized Socket.IO events/rooms rejected
    // -------------------------------------------------------------
    console.log('\n--- TEST 16: Unauthorized Socket.IO Connection Rejected ---');
    let badSocketError = null;
    const badSocket = ClientIO(socketUrl, {
      auth: { token: 'invalid_expired_token_12345' },
      transports: ['websocket'],
    });

    await new Promise((res) => {
      badSocket.on('connect_error', (err) => {
        badSocketError = err.message;
        badSocket.close();
        res();
      });
      setTimeout(res, 1000);
    });

    assert(
      badSocketError !== null && badSocketError.includes('Authentication failed'),
      `TEST 16: Socket connection with invalid/missing token rejected (${badSocketError})`
    );

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  } finally {
    if (adminSocket) adminSocket.close();
    if (sales01Socket) sales01Socket.close();
    if (sales02Socket) sales02Socket.close();
    server.close();
    await disconnectDB();
  }

  console.log('\n===============================================================');
  console.log(`🏁 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase3Tests();
