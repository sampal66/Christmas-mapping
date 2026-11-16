// Headless smoke test for the Mapper app.
// Usage: node tools/smoke-test.js [screenshotDir]
// Serves app/ on a free port, loads it in Chromium, exercises calibrate/test/demo,
// and fails on any page error or console error.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..', 'app');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html');
      const file = path.join(ROOT, path.normalize(rel));
      if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    });
    server.listen(0, () => resolve(server));
  });
}

(async () => {
  const shots = process.argv[2];
  const server = await serve();
  const url = `http://localhost:${server.address().port}/`;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1180, height: 820 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  const check = (cond, msg) => { if (!cond) errors.push(`assert: ${msg}`); };
  try {
    await page.goto(url);
    await page.waitForTimeout(600);
    check(await page.locator('canvas.zone').count() >= 8, 'zone canvases rendered');

    // drag the first corner handle and confirm the layout is saved
    const h = await page.locator('.handle').first().boundingBox();
    await page.mouse.move(h.x + h.width / 2, h.y + h.height / 2);
    await page.mouse.down(); await page.mouse.move(h.x + 60, h.y + 40, { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(300);
    const saved = await page.evaluate(() => localStorage.getItem('christmas-mapping.layout.v1'));
    check(saved && JSON.parse(saved).version === 1, 'layout saved after drag');

    await page.selectOption('#zoneSelect', 'tree');
    await page.click('#maskBtn');
    check(await page.locator('.handle.small').count() > 3, 'tree outline handles shown');
    if (shots) await page.screenshot({ path: path.join(shots, 'calibrate.png') });

    for (const m of ['test', 'demo']) {
      await page.click(`[data-mode=${m}]`);
      await page.waitForTimeout(800);
      if (shots) await page.screenshot({ path: path.join(shots, `${m}.png`) });
    }
  } catch (e) {
    errors.push(e.message);
  } finally {
    await browser.close();
    server.close();
  }

  if (errors.length) { console.error('SMOKE TEST FAILED\n' + errors.join('\n')); process.exit(1); }
  console.log('smoke test passed');
})();
