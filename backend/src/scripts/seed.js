require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const Activity = require('../models/Activity');
const Payment = require('../models/Payment');
const Counter = require('../models/Counter');
const { connectDB, disconnectDB } = require('../config/db');

const seedDatabase = async () => {
  console.log('[Seed] Starting database population with neutral demo data...');

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Lead.deleteMany({}),
    FollowUp.deleteMany({}),
    Activity.deleteMany({}),
    Payment.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  // 2. Seed Users
  const users = await User.create([
    {
      name: 'Admin Executive',
      email: 'admin@heptley.com',
      password: 'admin123',
      phone: '+91 98765 00000',
      role: 'admin',
      salesMemberId: null,
      status: 'active',
    },
    {
      name: 'Sales Member 01',
      email: 'sales01@heptley.com',
      password: 'sales123',
      phone: '+91 98765 11101',
      role: 'sales',
      salesMemberId: 'SM-001',
      status: 'active',
    },
    {
      name: 'Sales Member 02',
      email: 'sales02@heptley.com',
      password: 'sales123',
      phone: '+91 98765 22202',
      role: 'sales',
      salesMemberId: 'SM-002',
      status: 'active',
    },
    {
      name: 'Sales Member 03',
      email: 'sales03@heptley.com',
      password: 'sales123',
      phone: '+91 98765 33303',
      role: 'sales',
      salesMemberId: 'SM-003',
      status: 'active',
    },
  ]);

  const adminUser = users[0];
  console.log(`[Seed] Seeded ${users.length} user accounts (1 Admin, 3 Sales Members).`);

  // 3. Seed Customers
  const customerData = [
    {
      customerId: 'CUS-0001',
      name: 'Customer Demo 01',
      company: 'Alpha Tech Enterprises',
      email: 'contact@alphatech-demo.com',
      phone: '+91 98111 00001',
      location: 'Bangalore, India',
      website: 'https://alphatech-demo.com',
      service: 'Full-Stack Web Application',
      package: 'Enterprise Tier',
      startDate: '2026-01-15',
      endDate: '2026-06-30',
      projectStatus: 'In Progress',
      customerStatus: 'Active',
      salesMemberId: 'SM-001',
      salesMemberName: 'Sales Member 01',
      leadSource: 'Website Inbound',
      dealValue: 450000,
      discount: 25000,
      amountPaid: 300000,
      paymentMethod: 'Bank Wire',
      notes: 'Custom B2B portal development with SLA agreement.',
    },
    {
      customerId: 'CUS-0002',
      name: 'Customer Demo 02',
      company: 'Beta Logistics Solutions',
      email: 'ops@betalogistics-demo.com',
      phone: '+91 98222 00002',
      location: 'Mumbai, India',
      website: 'https://betalogistics-demo.com',
      service: 'Cloud Architecture & DevOps',
      package: 'Standard Cloud',
      startDate: '2026-02-01',
      endDate: '2026-05-15',
      projectStatus: 'In Progress',
      customerStatus: 'Active',
      salesMemberId: 'SM-002',
      salesMemberName: 'Sales Member 02',
      leadSource: 'Referral',
      dealValue: 320000,
      discount: 20000,
      amountPaid: 200000,
      paymentMethod: 'Bank Wire',
      notes: 'Kubernetes container migration and automated CI/CD pipeline.',
    },
    {
      customerId: 'CUS-0003',
      name: 'Customer Demo 03',
      company: 'Gamma Financial Services',
      email: 'accounts@gammafin-demo.com',
      phone: '+91 98333 00003',
      location: 'Delhi NCR, India',
      website: 'https://gammafin-demo.com',
      service: 'SEO & Performance Audit',
      package: 'Quarterly Growth',
      startDate: '2026-02-15',
      endDate: '2026-08-15',
      projectStatus: 'In Progress',
      customerStatus: 'Active',
      salesMemberId: 'SM-001',
      salesMemberName: 'Sales Member 01',
      leadSource: 'Cold Outreach',
      dealValue: 180000,
      discount: 10000,
      amountPaid: 170000,
      paymentMethod: 'UPI / NetBanking',
      notes: 'Organic search optimization and core web vitals speed enhancement.',
    },
    {
      customerId: 'CUS-0004',
      name: 'Customer Demo 04',
      company: 'Delta Retail Brands',
      email: 'hello@deltaretail-demo.com',
      phone: '+91 98444 00004',
      location: 'Hyderabad, India',
      website: 'https://deltaretail-demo.com',
      service: 'Mobile Application (iOS/Android)',
      package: 'Mobile Premier',
      startDate: '2026-03-01',
      endDate: '2026-09-01',
      projectStatus: 'Onboarding',
      customerStatus: 'Onboarding',
      salesMemberId: 'SM-003',
      salesMemberName: 'Sales Member 03',
      leadSource: 'LinkedIn Campaign',
      dealValue: 550000,
      discount: 50000,
      amountPaid: 250000,
      paymentMethod: 'Bank Wire',
      notes: 'React Native eCommerce app with payment gateway integration.',
    },
    {
      customerId: 'CUS-0005',
      name: 'Customer Demo 05',
      company: 'Epsilon Healthcare Systems',
      email: 'tech@epsilonhealth-demo.com',
      phone: '+91 98555 00005',
      location: 'Chennai, India',
      website: 'https://epsilonhealth-demo.com',
      service: 'Custom CRM System',
      package: 'Bespoke Build',
      startDate: '2026-01-10',
      endDate: '2026-04-30',
      projectStatus: 'Delivered',
      customerStatus: 'Completed',
      salesMemberId: 'SM-002',
      salesMemberName: 'Sales Member 02',
      leadSource: 'Partner Network',
      dealValue: 600000,
      discount: 0,
      amountPaid: 600000,
      paymentMethod: 'Bank Wire',
      notes: 'Complete clinic management portal delivered and fully paid.',
    },
    {
      customerId: 'CUS-0006',
      name: 'Customer Demo 06',
      company: 'Zeta Real Estate Group',
      email: 'contact@zetagroup-demo.com',
      phone: '+91 98666 00006',
      location: 'Pune, India',
      website: 'https://zetagroup-demo.com',
      service: 'Lead Generation & Landing Pages',
      package: 'Campaign Growth',
      startDate: '2026-02-20',
      endDate: '2026-05-20',
      projectStatus: 'In Progress',
      customerStatus: 'Active',
      salesMemberId: 'SM-001',
      salesMemberName: 'Sales Member 01',
      leadSource: 'Google Ads',
      dealValue: 220000,
      discount: 15000,
      amountPaid: 85000,
      paymentMethod: 'UPI / NetBanking',
      notes: 'High-converting luxury residential landing page campaigns.',
    },
    {
      customerId: 'CUS-0007',
      name: 'Customer Demo 07',
      company: 'Eta EduTech Academy',
      email: 'info@etaedutech-demo.com',
      phone: '+91 98777 00007',
      location: 'Jaipur, India',
      website: 'https://etaedutech-demo.com',
      service: 'Learning Management System',
      package: 'EdTech Core',
      startDate: '2026-03-05',
      endDate: '2026-07-15',
      projectStatus: 'Onboarding',
      customerStatus: 'Onboarding',
      salesMemberId: 'SM-003',
      salesMemberName: 'Sales Member 03',
      leadSource: 'Website Inbound',
      dealValue: 390000,
      discount: 40000,
      amountPaid: 0,
      paymentMethod: 'Bank Wire',
      notes: 'Interactive student test portal with video course modules.',
    },
  ];

  for (const c of customerData) {
    const cust = new Customer({ ...c, createdBy: adminUser._id });
    await cust.save();
  }
  console.log(`[Seed] Seeded ${customerData.length} customer accounts.`);

  // 4. Seed Leads
  const leadData = [
    {
      leadId: 'LEAD-0001',
      name: 'Lead Prospect 01',
      company: 'Apex Industrial Tools',
      email: 'procurement@apexindustrial-demo.com',
      phone: '+91 99111 11001',
      interestedService: 'Full-Stack Web Application',
      source: 'Website Inbound',
      status: 'Proposal',
      budget: 350000,
      dealEstimate: 350000,
      salesMemberId: 'SM-001',
      salesMemberName: 'Sales Member 01',
      notes: 'Requested proposal for dealer distributor management portal.',
    },
    {
      leadId: 'LEAD-0002',
      name: 'Lead Prospect 02',
      company: 'Beacon Solar Tech',
      email: 'inquiry@beaconsolar-demo.com',
      phone: '+91 99222 22002',
      interestedService: 'SEO & Performance Audit',
      source: 'Referral',
      status: 'Contacted',
      budget: 150000,
      dealEstimate: 150000,
      salesMemberId: 'SM-001',
      salesMemberName: 'Sales Member 01',
      notes: 'Initial discovery call held. Interested in national search visibility.',
    },
    {
      leadId: 'LEAD-0003',
      name: 'Lead Prospect 03',
      company: 'Crestline Logistics',
      email: 'partner@crestline-demo.com',
      phone: '+91 99333 33003',
      interestedService: 'Cloud Architecture & DevOps',
      source: 'Cold Outreach',
      status: 'Qualified',
      budget: 280000,
      dealEstimate: 280000,
      salesMemberId: 'SM-002',
      salesMemberName: 'Sales Member 02',
      notes: 'Needs cloud migration for fleet tracking database.',
    },
    {
      leadId: 'LEAD-0004',
      name: 'Lead Prospect 04',
      company: 'Dynamic Apparel Export',
      email: 'sales@dynamicapparel-demo.com',
      phone: '+91 99444 44004',
      interestedService: 'eCommerce Web Platform',
      source: 'LinkedIn Campaign',
      status: 'New',
      budget: 400000,
      dealEstimate: 400000,
      salesMemberId: 'SM-002',
      salesMemberName: 'Sales Member 02',
      notes: 'Inbound message requesting B2B catalog ordering system.',
    },
    {
      leadId: 'LEAD-0005',
      name: 'Lead Prospect 05',
      company: 'Evergreen Organic Farms',
      email: 'hello@evergreenfarms-demo.com',
      phone: '+91 99555 55005',
      interestedService: 'Mobile Application',
      source: 'Google Ads',
      status: 'Proposal',
      budget: 320000,
      dealEstimate: 320000,
      salesMemberId: 'SM-003',
      salesMemberName: 'Sales Member 03',
      notes: 'Direct-to-consumer organic grocery subscription app.',
    },
    {
      leadId: 'LEAD-0006',
      name: 'Lead Prospect 06',
      company: 'Falcon Security Devices',
      email: 'info@falcondevices-demo.com',
      phone: '+91 99666 66006',
      interestedService: 'Custom IoT Dashboard',
      source: 'Website Inbound',
      status: 'Qualified',
      budget: 500000,
      dealEstimate: 500000,
      salesMemberId: 'SM-003',
      salesMemberName: 'Sales Member 03',
      notes: 'Telemetry dashboard for smart lock enterprise monitoring.',
    },
  ];

  for (const l of leadData) {
    await Lead.create({ ...l, createdBy: adminUser._id });
  }
  console.log(`[Seed] Seeded ${leadData.length} active leads.`);

  // 5. Seed Follow-ups
  const todayStr = new Date().toISOString().split('T')[0];
  const followUpData = [
    {
      followUpId: 'FLW-0001',
      customerId: 'CUS-0001',
      entityType: 'Customer',
      entityName: 'Customer Demo 01',
      company: 'Alpha Tech Enterprises',
      salesMemberId: 'SM-001',
      title: 'Milestone 2 Sprint Review',
      type: 'Meeting',
      priority: 'High',
      date: todayStr,
      time: '02:00 PM',
      note: 'Review prototype frontend and obtain client feedback on user flow.',
      status: 'Pending',
    },
    {
      followUpId: 'FLW-0002',
      leadId: 'LEAD-0001',
      entityType: 'Lead',
      entityName: 'Lead Prospect 01',
      company: 'Apex Industrial Tools',
      salesMemberId: 'SM-001',
      title: 'Commercial Proposal Walkthrough',
      type: 'Call',
      priority: 'High',
      date: todayStr,
      time: '04:30 PM',
      note: 'Walk client procurement team through proposal deliverables.',
      status: 'Pending',
    },
    {
      followUpId: 'FLW-0003',
      customerId: 'CUS-0003',
      entityType: 'Customer',
      entityName: 'Customer Demo 03',
      company: 'Gamma Financial Services',
      salesMemberId: 'SM-001',
      title: 'Monthly SEO Performance Report',
      type: 'Email',
      priority: 'Medium',
      date: todayStr,
      time: '11:00 AM',
      note: 'Send keyword rankings report for February and March.',
      status: 'Pending',
    },
    {
      followUpId: 'FLW-0004',
      customerId: 'CUS-0002',
      entityType: 'Customer',
      entityName: 'Customer Demo 02',
      company: 'Beta Logistics Solutions',
      salesMemberId: 'SM-002',
      title: 'DevOps Cluster Security Check',
      type: 'Meeting',
      priority: 'High',
      date: todayStr,
      time: '03:00 PM',
      note: 'Review security scan findings with customer CTO.',
      status: 'Pending',
    },
    {
      followUpId: 'FLW-0005',
      leadId: 'LEAD-0003',
      entityType: 'Lead',
      entityName: 'Lead Prospect 03',
      company: 'Crestline Logistics',
      salesMemberId: 'SM-002',
      title: 'Requirements Clarification Call',
      type: 'Call',
      priority: 'Medium',
      date: todayStr,
      time: '05:00 PM',
      note: 'Verify database volume and estimated read/write operations.',
      status: 'Pending',
    },
    {
      followUpId: 'FLW-0006',
      customerId: 'CUS-0005',
      entityType: 'Customer',
      entityName: 'Customer Demo 05',
      company: 'Epsilon Healthcare Systems',
      salesMemberId: 'SM-002',
      title: 'Post-Delivery Feedback Call',
      type: 'Call',
      priority: 'Low',
      date: todayStr,
      time: '12:30 PM',
      note: 'Confirm that system adoption across medical staff is on track.',
      status: 'Pending',
    },
    {
      followUpId: 'FLW-0007',
      customerId: 'CUS-0004',
      entityType: 'Customer',
      entityName: 'Customer Demo 04',
      company: 'Delta Retail Brands',
      salesMemberId: 'SM-003',
      title: 'App Wireframes Sign-off',
      type: 'Meeting',
      priority: 'High',
      date: todayStr,
      time: '01:30 PM',
      note: 'Present interactive mobile screens and confirm color schemes.',
      status: 'Pending',
    },
    {
      followUpId: 'FLW-0008',
      leadId: 'LEAD-0005',
      entityType: 'Lead',
      entityName: 'Lead Prospect 05',
      company: 'Evergreen Organic Farms',
      salesMemberId: 'SM-003',
      title: 'Proposal Budget Negotiation',
      type: 'Call',
      priority: 'Medium',
      date: todayStr,
      time: '04:00 PM',
      note: 'Discuss phased delivery options to match current budget.',
      status: 'Pending',
    },
    {
      followUpId: 'FLW-0009',
      customerId: 'CUS-0007',
      entityType: 'Customer',
      entityName: 'Customer Demo 07',
      company: 'Eta EduTech Academy',
      salesMemberId: 'SM-003',
      title: 'Advance Payment Reminder',
      type: 'Email',
      priority: 'Medium',
      date: todayStr,
      time: '10:00 AM',
      note: 'Send invoice copy and bank transfer instructions for project kickoff.',
      status: 'Pending',
    },
  ];

  for (const f of followUpData) {
    await FollowUp.create({ ...f, createdBy: adminUser._id });
  }
  console.log(`[Seed] Seeded ${followUpData.length} scheduled follow-ups.`);

  // 6. Initialize Atomic Counters
  await Counter.create([
    { _id: 'salesMemberId', seq: 3 },
    { _id: 'customerId', seq: 7 },
    { _id: 'leadId', seq: 6 },
    { _id: 'followUpId', seq: 9 },
    { _id: 'paymentId', seq: 0 },
    { _id: 'activityId', seq: 0 },
  ]);
  console.log('[Seed] Atomic sequence counters initialized.');

  console.log('[Seed] Database population complete!\n');
};

if (require.main === module) {
  connectDB()
    .then(seedDatabase)
    .then(disconnectDB)
    .then(() => {
      console.log('[Seed] Process terminated cleanly.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
