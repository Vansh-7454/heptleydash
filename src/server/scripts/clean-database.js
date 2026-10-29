require('dotenv').config();
const mongoose = require('mongoose');

async function cleanDatabase() {
  console.log('\n=============================================================');
  console.log('🧹 HEPTLEY CRM: CLEANING DATABASE (RETAINING ADMIN + 3 SALES)');
  console.log('=============================================================\n');

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ Error: MONGO_URI is not set in backend/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}/${mongoose.connection.name}`);

  const db = mongoose.connection.db;

  // 1. Clean Users: Keep only admin@heptley.com, sales01@heptley.com, sales02@heptley.com, developer@heptley.com
  const preservedEmails = [
    'admin@heptley.com',
    'sales01@heptley.com',
    'sales02@heptley.com',
    'developer@heptley.com',
  ];

  const userDeleteResult = await db.collection('users').deleteMany({
    email: { $nin: preservedEmails },
  });
  console.log(`🗑️  Deleted extra users: ${userDeleteResult.deletedCount}`);

  const remainingUsers = await db.collection('users').find({}, { projection: { name: 1, email: 1, role: 1, salesMemberId: 1 } }).toArray();
  console.log('👥 Preserved Users in Database:');
  remainingUsers.forEach((u) => {
    console.log(`   - ${u.name} (${u.email}) | Role: ${u.role} | ID: ${u.salesMemberId || 'N/A'}`);
  });

  // 2. Wipe Customers, Leads, FollowUps, Activities, Payments, Notifications, AIAuditLogs
  const collectionsToWipe = [
    'customers',
    'leads',
    'followups',
    'activities',
    'payments',
    'notifications',
    'aiauditlogs',
  ];

  for (const collName of collectionsToWipe) {
    const res = await db.collection(collName).deleteMany({});
    console.log(`🗑️  Wiped ${collName}: ${res.deletedCount} documents removed`);
  }

  // 3. Reset Counters for clean sequential numbering
  await db.collection('counters').deleteMany({});
  // Set salesMemberId seq to 3 so next member created will be SM-004
  await db.collection('counters').insertOne({ _id: 'salesMemberId', seq: 3 });
  console.log(`🔢 Reset ID Counters (salesMemberId set to 3; customer/lead/payment will start from 0001)`);

  console.log('\n=============================================================');
  console.log('🎉 DATABASE CLEANUP COMPLETE: 0 DUMMY DATA, 4 AUTH USERS READY');
  console.log('=============================================================\n');

  await mongoose.disconnect();
}

cleanDatabase().catch((err) => {
  console.error('❌ Fatal error during database cleanup:', err);
  process.exit(1);
});
