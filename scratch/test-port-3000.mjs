import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9228',
  '--no-sandbox',
  '--disable-gpu',
  'http://localhost:3000'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await fetch('http://localhost:9228/json').then(r => r.json());
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

    await new Promise(r => setTimeout(r, 2500));

    // Clear localStorage to test clean state
    await send('Runtime.evaluate', { expression: 'localStorage.clear()' });

    // Test 1: Click "Sign In" button in top nav
    console.log('--- Test 1: Clicking #nav-open-login in top nav ---');
    const navClick = await send('Runtime.evaluate', {
      expression: `(() => {
        const btn = document.querySelector('#nav-open-login');
        if (!btn) return 'BUTTON NOT FOUND';
        btn.click();
        return 'CLICKED NAV SIGN IN';
      })()`,
      returnByValue: true
    });
    console.log('Nav click result:', navClick?.result?.value);

    await new Promise(r => setTimeout(r, 1000));

    const checkLoginView = await send('Runtime.evaluate', {
      expression: `(() => {
        const h1 = document.querySelector('h1')?.innerText;
        const emailInput = document.querySelector('#login-email-input');
        return {
          h1: h1,
          hasEmailInput: !!emailInput
        };
      })()`,
      returnByValue: true
    });
    console.log('Login View open check:', checkLoginView?.result?.value);

    // Test 2: Click "Back to Home" button
    console.log('--- Test 2: Clicking #login-back-to-home-btn ---');
    await send('Runtime.evaluate', {
      expression: `document.querySelector('#login-back-to-home-btn')?.click()`
    });

    await new Promise(r => setTimeout(r, 1000));

    const checkHomeView = await send('Runtime.evaluate', {
      expression: `(() => {
        const heroBtn = document.querySelector('#hero-open-login-btn');
        return { hasHeroBtn: !!heroBtn };
      })()`,
      returnByValue: true
    });
    console.log('Back to Home check:', checkHomeView?.result?.value);

    // Test 3: Click 1-Click Admin button from Home
    console.log('--- Test 3: Clicking 1-Click Admin ---');
    await send('Runtime.evaluate', {
      expression: `document.querySelector('#hero-instant-admin-btn')?.click()`
    });

    await new Promise(r => setTimeout(r, 3500));

    const checkAdmin = await send('Runtime.evaluate', {
      expression: `(() => {
        const h1 = document.querySelector('h1')?.innerText;
        return { h1: h1, isDashboard: h1?.includes('Dashboard') };
      })()`,
      returnByValue: true
    });
    console.log('Admin Dashboard mounted:', checkAdmin?.result?.value);

    ws.close();
    edge.kill();
    process.exit(0);
  };
} catch (err) {
  console.error('Error:', err);
  edge.kill();
  process.exit(1);
}
