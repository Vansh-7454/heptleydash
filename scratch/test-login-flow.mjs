import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9226',
  '--no-sandbox',
  '--disable-gpu',
  'http://localhost:3001'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await fetch('http://localhost:9226/json').then(r => r.json());
  const page = targets.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let idCounter = 1;
  const send = (method, params = {}) => {
    const id = idCounter++;
    return new Promise((resolve) => {
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  ws.onopen = async () => {
    ws.send(JSON.stringify({ id: 999, method: 'Runtime.enable' }));
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Runtime.consoleAPICalled') {
        console.log('[CONSOLE]', m.params.type, m.params.args.map(a => a.value || a.description).join(' '));
      } else if (m.method === 'Runtime.exceptionThrown') {
        console.error('[EXCEPTION]', m.params.exceptionDetails.text, m.params.exceptionDetails.exception?.description);
      }
    });

    await new Promise(r => setTimeout(r, 2000));

    // Click 1-Click Admin button
    console.log('--- Clicking #hero-instant-admin-btn ---');
    const clickRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('#hero-instant-admin-btn');
        if (!btn) return 'BUTTON NOT FOUND';
        btn.click();
        return 'CLICKED ADMIN';
      })()`,
      returnByValue: true
    });
    console.log('Click result:', clickRes?.result?.value);

    // Wait for auth & data refresh
    await new Promise(r => setTimeout(r, 3500));

    // Check DOM to see if Admin Dashboard is rendered!
    const dashboardCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const sidebar = document.querySelector('aside');
        const header = document.querySelector('header');
        const h1 = document.querySelector('h1')?.innerText;
        const text = document.body.innerText;
        return {
          hasSidebar: !!sidebar,
          h1: h1,
          hasDashboardText: text.includes('Dashboard') || text.includes('Admin') || text.includes('Overview') || text.includes('Total Customers')
        };
      })()`,
      returnByValue: true
    });
    console.log('Dashboard Check after 1-Click Admin:', dashboardCheck?.result?.value);

    ws.close();
    edge.kill();
    process.exit(0);
  };
} catch (err) {
  console.error('Error:', err);
  edge.kill();
  process.exit(1);
}
