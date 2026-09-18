import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9227',
  '--no-sandbox',
  '--disable-gpu',
  'http://localhost:3001'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await fetch('http://localhost:9227/json').then(r => r.json());
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

    await new Promise(r => setTimeout(r, 2000));

    // Clear localStorage to test clean state
    await send('Runtime.evaluate', { expression: 'localStorage.clear()' });

    // Click 1-Click Sales 01 button
    console.log('--- Clicking #hero-instant-sales01-btn ---');
    const clickRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('#hero-instant-sales01-btn');
        if (!btn) return 'BUTTON NOT FOUND';
        btn.click();
        return 'CLICKED SALES 01';
      })()`,
      returnByValue: true
    });
    console.log('Click result:', clickRes?.result?.value);

    // Wait for auth & data refresh
    await new Promise(r => setTimeout(r, 3500));

    // Check DOM to see if Sales Dashboard is rendered!
    const dashboardCheck = await send('Runtime.evaluate', {
      expression: `(() => {
        const sidebar = document.querySelector('aside');
        const h1 = document.querySelector('h1')?.innerText;
        const text = document.body.innerText;
        return {
          hasSidebar: !!sidebar,
          h1: h1,
          hasSalesDashboardText: text.includes('Sales') || text.includes('Pipeline') || text.includes('Customers')
        };
      })()`,
      returnByValue: true
    });
    console.log('Dashboard Check after 1-Click Sales 01:', dashboardCheck?.result?.value);

    ws.close();
    edge.kill();
    process.exit(0);
  };
} catch (err) {
  console.error('Error:', err);
  edge.kill();
  process.exit(1);
}
