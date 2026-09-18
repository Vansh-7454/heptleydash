import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9224',
  '--no-sandbox',
  '--disable-gpu',
  'http://localhost:3001'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await fetch('http://localhost:9224/json').then(r => r.json());
  console.log('Found targets:', targets.length);

  const page = targets.find(t => t.type === 'page');
  if (!page || !page.webSocketDebuggerUrl) {
    console.error('No page websocket url found');
    edge.kill();
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
    ws.send(JSON.stringify({ id: 3, method: 'Page.enable' }));
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER CONSOLE]', msg.params.type, msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' '));
    } else if (msg.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
    }
  };

  await new Promise(r => setTimeout(r, 4000));
  ws.close();
} catch (err) {
  console.error('Error:', err.message);
} finally {
  edge.kill();
  process.exit(0);
}
