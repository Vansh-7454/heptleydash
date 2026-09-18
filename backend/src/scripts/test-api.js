require('dotenv').config();
const http = require('http');
const app = require('../app');
const { connectDB, disconnectDB } = require('../config/db');
const seedDatabase = require('./seed');

async function runTests() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND API INTEGRATION TEST');
  console.log('==================================================\n');

  await connectDB();
  await seedDatabase();

  // Start test server on random high port
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;
  console.log(`[Test Server] Listening on ${baseUrl}\n`);

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

  try {
    // 1. Health Check
    console.log('--- Test Suite 1: Health & Public Endpoints ---');
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GET /api/health returns HTTP 200 OK');

    // 2. Admin Login
    console.log('\n--- Test Suite 2: Authentication & JWT ---');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@heptley.com', password: 'admin123' }),
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'Admin login succeeds with JWT token');
    assert(adminLogin.data.user.role === 'admin' && adminLogin.data.user.salesMemberId === null, 'Admin user object has role=admin and salesMemberId=null');
    const adminToken = adminLogin.data.token;

    // 3. Sales 01 Login
    const sales01Login = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'sales01@heptley.com', password: 'sales123' }),
    });
    assert(sales01Login.status === 200 && sales01Login.data.token, 'Sales 01 login succeeds with JWT token');
    assert(sales01Login.data.user.role === 'sales' && sales01Login.data.user.salesMemberId === 'SM-001', 'Sales 01 has role=sales and salesMemberId=SM-001');
    const sales01Token = sales01Login.data.token;

    // 4. GET /api/auth/me
    const meRes = await request('/auth/me', {
      headers: { Authorization: `Bearer ${sales01Token}` },
    });
    assert(meRes.status === 200 && meRes.data.user.salesMemberId === 'SM-001', 'GET /api/auth/me decodes identity and returns profile');

    // 5. Role Authorization: Sales Member Creation
    console.log('\n--- Test Suite 3: Role Authorization & Security ---');
    const salesCreateMemberAttempt = await request('/users/sales-members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales01Token}` },
      body: JSON.stringify({ name: 'Hacker Rep', email: 'hack@test.com' }),
    });
    assert(salesCreateMemberAttempt.status === 403, 'POST /api/users/sales-members returns 403 Forbidden when called by Sales user');

    const adminCreateMember = await request('/users/sales-members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ name: 'Sales Member 04', email: 'sales04@heptley.com', phone: '+91 98765 44404' }),
    });
    assert(adminCreateMember.status === 201 && adminCreateMember.data.salesMember.memberId === 'SM-004', 'POST /api/users/sales-members allows Admin and auto-generates SM-004');

    // 6. Database-Level Isolation: Customers
    console.log('\n--- Test Suite 4: Database-Level Customer Access Isolation ---');
    const salesCustomers = await request('/customers', {
      headers: { Authorization: `Bearer ${sales01Token}` },
    });
    assert(salesCustomers.status === 200, 'GET /api/customers succeeds for Sales user');
    const allBelongToSales01 = salesCustomers.data.customers.every((c) => c.salesMemberId === 'SM-001');
    assert(allBelongToSales01 && salesCustomers.data.customers.length === 3, `Sales 01 sees exactly 3 assigned customers (all SM-001, no leakage from SM-002/SM-003)`);

    const adminCustomers = await request('/customers', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminCustomers.status === 200 && adminCustomers.data.customers.length === 7, `Admin sees all 7 customer accounts across all sales reps`);

    // 7. Atomic Customer Creation
    console.log('\n--- Test Suite 5: Entity Creation & Atomic Sequential IDs ---');
    const newCustomer = await request('/customers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'Customer Demo 08',
        company: 'Theta Innovations',
        email: 'hello@theta-demo.com',
        phone: '+91 98888 88008',
        service: 'Full-Stack Web Development',
        dealValue: 500000,
        discount: 50000,
        amountPaid: 200000,
        salesMemberId: 'SM-001',
      }),
    });
    assert(newCustomer.status === 201 && newCustomer.data.customer.customerId === 'CUS-0008', 'Customer creation auto-generates sequential CUS-0008');
    assert(newCustomer.data.customer.finalAmount === 450000 && newCustomer.data.customer.remainingAmount === 250000, 'Automated financial computation: finalAmount=450000, remaining=250000');

    // 8. Lead Pipeline & Isolation
    console.log('\n--- Test Suite 6: Leads & Pipeline Access ---');
    const salesLeads = await request('/leads', {
      headers: { Authorization: `Bearer ${sales01Token}` },
    });
    const allLeadsBelongToSales01 = salesLeads.data.leads.every((l) => l.salesMemberId === 'SM-001');
    assert(allLeadsBelongToSales01 && salesLeads.data.leads.length === 2, 'Sales 01 sees exactly 2 assigned leads');

    const newLead = await request('/leads', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales01Token}` },
      body: JSON.stringify({
        name: 'Lead Prospect 07',
        company: 'Iota Energy',
        email: 'leads@iotaenergy-demo.com',
        phone: '+91 99777 77007',
        budget: 600000,
      }),
    });
    assert(newLead.status === 201 && newLead.data.lead.leadId === 'LEAD-0007', 'Lead creation auto-generates sequential LEAD-0007');
    assert(newLead.data.lead.salesMemberId === 'SM-001', 'Lead is automatically bound to authenticated sales rep SM-001');

    // 9. Follow-ups & Touchpoint Resolution
    console.log('\n--- Test Suite 7: Follow-up Scheduling & Completion ---');
    const newFollowUp = await request('/follow-ups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${sales01Token}` },
      body: JSON.stringify({
        customerId: 'CUS-0001',
        entityName: 'Customer Demo 01',
        title: 'Project Kickoff Meeting',
        type: 'Meeting',
        date: new Date().toISOString().split('T')[0],
        time: '03:00 PM',
      }),
    });
    assert(newFollowUp.status === 201 && newFollowUp.data.followUp.followUpId === 'FLW-0010', 'Follow-up created with sequential FLW-0010');

    const completeFollowUp = await request(`/follow-ups/${newFollowUp.data.followUp.followUpId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${sales01Token}` },
      body: JSON.stringify({ status: 'Completed', note: 'Meeting held successfully with positive client response.' }),
    });
    assert(completeFollowUp.status === 200 && completeFollowUp.data.followUp.status === 'Completed', 'Follow-up marked Completed and records timestamp');

    // 10. Payments & Automatic Customer Ledger Sync
    console.log('\n--- Test Suite 8: Payments & Customer Balance Updates ---');
    const paymentRes = await request('/payments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        customerId: 'CUS-0008',
        amount: 250000,
        paymentMethod: 'Bank Wire',
        reference: 'WIRE-889977',
      }),
    });
    assert(paymentRes.status === 201 && paymentRes.data.payment.paymentId === 'PAY-0001', 'Payment recorded with sequential PAY-0001');
    assert(paymentRes.data.customerBalance.remainingAmount === 0 && paymentRes.data.customerBalance.paymentStatus === 'Paid', 'Customer CUS-0008 ledger automatically updated to remainingAmount=0 and paymentStatus=Paid');

    // 11. Activity History
    console.log('\n--- Test Suite 9: Team Activities & Audit Trail ---');
    const activities = await request('/activities', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(activities.status === 200 && activities.data.activities.length > 0, `Audit activities successfully retrieved (${activities.data.activities.length} total logged events)`);
  } catch (err) {
    console.error('Test error:', err);
    failed++;
  } finally {
    server.close();
    await disconnectDB();
  }

  console.log('\n==================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('==================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
