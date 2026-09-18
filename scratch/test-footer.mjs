import { spawn } from 'child_process';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9229',
  '--no-sandbox',
  '--disable-gpu',
  'http://localhost:3000'
]);

await new Promise(r => setTimeout(r, 2000));

try {
  const targets = await fetch('http://localhost:9229/json').then(r => r.json());
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

    const checkFooter = await send('Runtime.evaluate', {
      expression: `(() => {
        const footer = document.querySelector('footer');
        const adminBtn = document.querySelector('#footer-btn-admin');
        const salesBtn = document.querySelector('#footer-btn-sales01');
        const topBtn = document.querySelector('#footer-back-to-top');
        return {
          hasFooter: !!footer,
          hasAdminBtn: !!adminBtn,
          hasSalesBtn: !!salesBtn,
          hasTopBtn: !!topBtn,
          footerTextSnippet: footer?.innerText.slice(0, 150).replace(/\\n/g, ' ')
        };
      })()`,
      returnByValue: true
    });
    console.log('Footer Evaluation:', checkFooter?.result?.value);

    ws.close();
    edge.kill();
    process.exit(0);
  };
} catch (err) {
  console.error('Error:', err);
  edge.kill();
  process.exit(1);
}
