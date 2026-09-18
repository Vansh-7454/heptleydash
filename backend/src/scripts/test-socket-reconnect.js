const { io: ioClient } = require('socket.io-client');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const BASE_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

async function testReconnect() {
  console.log('\n======================================================================');
  console.log('🔄 TESTING SOCKET.IO CLIENT DISCONNECT & RECONNECT BEHAVIOR');
  console.log('======================================================================\n');

  const sm01Res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'sales01@heptley.com', password: 'sales123' }),
  });
  const sm01Token = (await sm01Res.json()).token;

  let connectCount = 0;
  let disconnectCount = 0;
  let receivedAfterReconnect = false;

  const socket = ioClient(SOCKET_URL, {
    auth: { token: `Bearer ${sm01Token}` },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 500,
  });

  await new Promise((resolve) => {
    socket.on('connect', () => {
      connectCount++;
      console.log(`  🔌 Socket Connected [Attempt ${connectCount}]: ID = ${socket.id}`);
      resolve();
    });
  });

  socket.on('disconnect', (reason) => {
    disconnectCount++;
    console.log(`  🔌 Socket Disconnected [Count ${disconnectCount}]: Reason = ${reason}`);
  });

  socket.on('customer:created', (data) => {
    receivedAfterReconnect = true;
    console.log('  📥 Event received after reconnection for customer:', data.customerId);
  });

  // Simulate network disruption: manually disconnect
  console.log('  Simulating network drop: disconnecting socket...');
  socket.disconnect();

  await new Promise((r) => setTimeout(r, 800));

  // Reconnect
  console.log('  Restoring network connection: reconnecting socket...');
  socket.connect();

  await new Promise((resolve) => {
    if (socket.connected) resolve();
    else socket.on('connect', () => resolve());
  });

  console.log(`  Socket successfully reconnected: ID = ${socket.id}`);

  // Trigger CRM event to verify event dispatch on reconnected socket
  const uniqueNum = Date.now().toString().slice(-4);
  await fetch(`${BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${sm01Token}`,
    },
    body: JSON.stringify({
      name: `Reconnect Test Client ${uniqueNum}`,
      company: `Reconnect Co ${uniqueNum}`,
      email: `reconnect.${uniqueNum}@test.com`,
      phone: '+91 91122 33445',
      service: 'Custom Software',
      dealValue: 75000,
    }),
  });

  await new Promise((r) => setTimeout(r, 1200));

  socket.disconnect();

  if (connectCount >= 2 && receivedAfterReconnect) {
    console.log('\n🎉 RECONNECT TEST PASSED: Socket automatically rejoined rooms and received events!\n');
    process.exit(0);
  } else {
    console.error('\n❌ RECONNECT TEST FAILED!\n');
    process.exit(1);
  }
}

testReconnect().catch((err) => {
  console.error('Reconnect test error:', err);
  process.exit(1);
});
