const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function repairOrphans() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  const FollowUp = require('../models/FollowUp');
  const Activity = require('../models/Activity');

  const fRes = await FollowUp.updateMany(
    { customerId: '6aace712449d9be6595133dd' },
    { $set: { customerId: 'CUS-0002' } }
  );
  console.log('Follow-ups repaired:', fRes.modifiedCount);

  const aRes = await Activity.updateMany(
    { customerId: '6aace712449d9be6595133dd' },
    { $set: { customerId: 'CUS-0002' } }
  );
  console.log('Activities repaired:', aRes.modifiedCount);

  console.log('Orphan repair completed successfully.');
  process.exit(0);
}

repairOrphans().catch((err) => {
  console.error('Repair error:', err);
  process.exit(1);
});
