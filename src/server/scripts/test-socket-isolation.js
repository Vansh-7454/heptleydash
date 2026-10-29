const { io: ioClient } = require('socket.io-client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function testSocketIsolation() {
  console.log('\n======================================================================');
  console.log('⚡ TESTING SOCKET.IO ROOM ISOLATION & REAL-TIME DISPATCH');
  console.log('======================================================================\n');

  // 1. Get tokens for Admin, SM-001, SM-002
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@heptley.com', password: 'admin123' }),
  });
  const adminToken = (await adminRes.json()).token;

  const sm01Res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sales01@heptley.com', password: 'sales123' }),
  });
  const sm01Token = (await sm01Res.json()).token;

  const sm02Res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sales02@heptley.com', password: 'sales123' }),
  });
  const sm02Token = (await sm02Res.json()).token;

  const connectUser = (token, name) => {
    return new Promise((resolve, reject) => {
      const socket = ioClient(SOCKET_URL, {
        auth: { token: `Bearer ${token}` },
        transports: ['websocket'],
      });
      socket.on('connect', () => {
        console.log(`  🔌 Connected socket: ${name} (ID: ${socket.id})`);
        resolve(socket);
      });
      socket.on('connect_error', (err) => reject(err));
    });
  };

  const adminSocket = await connectUser(adminToken, 'Admin');
  const sm01Socket = await connectUser(sm01Token, 'Sales Rep 01 (SM-001)');
  const sm02Socket = await connectUser(sm02Token, 'Sales Rep 02 (SM-002)');

  let adminReceived = false;
  let sm01Received = false;
  let sm02Received = false;

  const testEventName = 'customer:created';

  adminSocket.on(testEventName, (data) => {
    adminReceived = true;
    console.log('  📥 [Admin Room] Received customer:created event for', data.customerId);
  });

  sm01Socket.on(testEventName, (data) => {
    sm01Received = true;
    console.log('  📥 [SM-001 Room] Received customer:created event for', data.customerId);
  });

  sm02Socket.on(testEventName, (data) => {
    sm02Received = true;
    console.log('  ❌ [SM-002 Room] LEAK DETECTED! SM-002 received private event for SM-001 customer!');
  });

  // 2. Perform an action as SM-001 that triggers emitRoleAware
  console.log('\n--- Triggering CRM action as SM-001: Creating Customer ---');
  const uniqueNum = Date.now().toString().slice(-4);
  const custRes = await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sm01Token}`,
    },
    body: JSON.stringify({
      name: `Realtime Test Client ${uniqueNum}`,
      company: `Realtime Co ${uniqueNum}`,
      email: `realtime.${uniqueNum}@test.com`,
      phone: '+91 99887 76655',
      service: 'Web Development',
      dealValue: 50000,
    }),
  });
  const custData = await custRes.json();
  console.log('  Customer created via REST:', custData.customer?.customerId);

  // Wait 1.5 seconds for socket dispatch
  await new Promise((r) => setTimeout(r, 1500));

  console.log('\n--- Verification Results ---');
  console.log(`  Admin Received Event:        ${adminReceived ? '✅ YES (PASS)' : '❌ NO'}`);
  console.log(`  SM-001 Received Event:       ${sm01Received ? '✅ YES (PASS)' : '❌ NO'}`);
  console.log(`  SM-002 Received Event:       ${!sm02Received ? '✅ NO - STRICT ISOLATION PRESERVED (PASS)' : '❌ LEAK DETECTED'}`);

  adminSocket.disconnect();
  sm01Socket.disconnect();
  sm02Socket.disconnect();

  if (adminReceived && sm01Received && !sm02Received) {
    console.log('\n🎉 SOCKET.IO ROOM ISOLATION VERIFIED: 100% SECURE & ROLE-RESTRICTED\n');
    process.exit(0);
  } else {
    console.error('\n❌ SOCKET.IO ROOM ISOLATION FAILED!\n');
    process.exit(1);
  }
}

testSocketIsolation().catch((err) => {
  console.error('Socket test error:', err);
  process.exit(1);
});
