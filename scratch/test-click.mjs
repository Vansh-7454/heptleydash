import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9225',
  '--no-sandbox',
  '--disable-gpu',
  'http://localhost:3001'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await fetch('http://localhost:9225/json').then(r => r.json());
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

    // Wait for hydration
    await new Promise(r => setTimeout(r, 2500));

    // Check DOM elements
    const evalRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('#hero-open-login-btn');
        const adminBtn = document.querySelector('#hero-instant-admin-btn');
        const salesBtn = document.querySelector('#hero-instant-sales01-btn');
        const allButtons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
        return {
          hasOpenLogin: !!btn,
          hasAdmin: !!adminBtn,
          hasSales: !!salesBtn,
          buttonsCount: allButtons.length,
          buttons: allButtons.slice(0, 10)
        };
      })()`,
      returnByValue: true
    });
    console.log('DOM Evaluation Result:', evalRes?.result?.value);

    // Now click the #hero-open-login-btn
    console.log('--- Clicking #hero-open-login-btn ---');
    const clickRes = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('#hero-open-login-btn');
        if (!btn) return 'BUTTON NOT FOUND';
        btn.click();
        return 'CLICKED SUCCESSFULLY';
      })()`,
      returnByValue: true
    });
    console.log('Click result:', clickRes?.result?.value);

    await new Promise(r => setTimeout(r, 1000));

    // Check if viewMode changed to login
    const checkView = await send('Runtime.evaluate', {
      expression: `(() => {
        const backBtn = document.querySelector('#login-back-to-home-btn');
        const heading = document.querySelector('h1')?.innerText;
        return {
          hasBackBtn: !!backBtn,
          h1: heading
        };
      })()`,
      returnByValue: true
    });
    console.log('View after click:', checkView?.result?.value);

    ws.close();
    edge.kill();
    process.exit(0);
  };
} catch (err) {
  console.error('Error:', err);
  edge.kill();
  process.exit(1);
}
