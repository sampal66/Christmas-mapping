// Headless smoke test for the Mapper app.
// Usage: node tools/smoke-test.js [screenshotDir]
// Serves app/ on a free port, loads it in Chromium, exercises calibrate/test/demo/show, the media pack
// and offline reload,
// and fails on any page error or console error.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..', 'app');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
// 1×1 PNG used to exercise the media-pack import.
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

// Every shell file (.html/.css/.js) must be precached by sw.js, or the app breaks offline.
function missingFromShell() {
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.relative(ROOT, path.join(dir, d.name))]);
  return walk(ROOT).filter((f) => /\.(html|css|js)$/.test(f) && f !== 'sw.js' && !sw.includes(`'${f}'`));
}

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

    // Show mode: play advances time; hold point loops until Continue.
    await page.click('[data-mode=show]');
    const label = () => page.locator('#timeLabel').textContent();
    check((await label()).startsWith('pre-show'), 'pre-show shown before play');
    await page.click('#playBtn');
    await page.waitForTimeout(1600);
    check(/^0:0[1-9]/.test(await label()), `show time advances (got "${await label()}")`);
    if (shots) await page.screenshot({ path: path.join(shots, 'show.png') });
    // jump into the hold window (hold at 0:15, loop 13–15)
    await page.selectOption('#sceneSelect', { index: 2 });   // scene B starts at 0:10
    await page.waitForTimeout(6000);
    check(await page.locator('#continueBtn').isEnabled(), 'hold point reached, Continue enabled');
    check(/^0:1[345]/.test(await label()), `looping inside hold window (got "${await label()}")`);
    await page.click('#continueBtn');
    await page.waitForTimeout(1500);
    check(/^0:1[6-9]/.test(await label()), `continues past hold (got "${await label()}")`);
    // delay persists
    await page.locator('#delayRange').fill('120');
    await page.waitForTimeout(300);
    const off = await page.evaluate(() => JSON.parse(localStorage.getItem('christmas-mapping.layout.v1')).audioOffsetMs);
    check(off === 120, `audio delay saved (got ${off})`);

    // Media pack: import a file, survive a reload, delete it.
    const missing = missingFromShell();
    check(!missing.length, `sw.js SHELL is missing: ${missing.join(', ')}`);
    page.on('dialog', (d) => d.accept());
    await page.locator('#mediaPack summary').click();
    await page.setInputFiles('#mediaFiles', { name: 'photo-1.png', mimeType: 'image/png', buffer: TINY_PNG });
    await page.locator('#mediaList li[data-name="photo-1"]').waitFor({ timeout: 3000 });
    check(/storage used/i.test(await page.locator('#mediaStatus').textContent()), 'storage readout shown');
    if (shots) await page.screenshot({ path: path.join(shots, 'media.png') });
    await page.reload();
    await page.locator('#mediaPack summary').click();
    await page.locator('#mediaList li[data-name="photo-1"]').waitFor({ timeout: 3000 })
      .catch(() => errors.push('assert: photo-1 still listed after reload'));
    const size = await page.evaluate(async () => (await (await import('./js/media.js')).get('photo-1'))?.size);
    check(size === TINY_PNG.length, `stored blob intact (got ${size} bytes)`);

    // Offline: once the service worker controls the page, a reload with no network still opens the app.
    await page.evaluate(() => navigator.serviceWorker.ready);
    if (!(await page.evaluate(() => !!navigator.serviceWorker.controller))) await page.reload();
    check(await page.evaluate(() => !!navigator.serviceWorker.controller), 'service worker controls the page');
    await page.context().setOffline(true);
    await page.reload();
    await page.waitForTimeout(600);
    check(await page.locator('canvas.zone').count() >= 8, 'app opens offline');
    await page.context().setOffline(false);

    await page.locator('#mediaPack summary').click();
    await page.locator('#mediaList li[data-name="photo-1"] button').click();
    await page.waitForTimeout(300);
    check(await page.locator('#mediaList li[data-name="photo-1"]').count() === 0, 'delete removes the file');

    // Room model page: renders, reports the fit, and pushes model-generated zones into the Mapper.
    await page.goto(url + 'model.html');
    await page.waitForTimeout(500);
    check(/throw ratio/.test(await page.locator('#verdict').textContent()), 'model page shows the projector fit');
    check(await page.locator('#coverage li').count() >= 6, 'model page lists coverage points');
    if (shots) await page.screenshot({ path: path.join(shots, 'model.png'), fullPage: true });
    await page.click('#useBtn');
    await page.waitForURL(url);
    const zones = await page.evaluate(() => JSON.parse(localStorage.getItem('christmas-mapping.layout.v1')).zones);
    check(zones.length === 8 && zones.every((z) => z.quad.flat().every(Number.isFinite)), 'model zones saved to the Mapper');
    await page.waitForTimeout(300);
    check(await page.locator('canvas.zone').count() >= 8, 'Mapper renders the model zones');
  } catch (e) {
    errors.push(e.message);
  } finally {
    await browser.close();
    server.close();
  }

  if (errors.length) { console.error('SMOKE TEST FAILED\n' + errors.join('\n')); process.exit(1); }
  console.log('smoke test passed');
})();
