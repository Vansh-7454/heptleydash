import http from 'http';
import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9223',
  '--no-sandbox',
  '--disable-gpu',
  'http://localhost:3001'
]);

await new Promise(r => setTimeout(r, 2000));

// Query CDP
const targets = await fetch('http://localhost:9223/json').then(r => r.json());
console.log('Targets:', targets);

const pageTarget = targets.find(t => t.type === 'page');
if (!pageTarget) {
  console.log('No page target found');
  edge.kill();
  process.exit(1);
}

const WebSocket = (await import('socket.io-client')).io; // wait, let's use standard ws or node ws
edge.kill();
