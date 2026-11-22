// Headless smoke test for the Mapper app.
// Usage: node tools/smoke-test.js [screenshotDir] [--no-flash]
// Serves app/ on a free port, loads it in Chromium, exercises calibrate/test/demo/show, the media pack
// and offline reload,
// and fails on any page error or console error.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { serve, ROOT } = require('./serve');

// 1×1 PNG used to exercise the media-pack import.
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

// Every shell file (.html/.css/.js) must be precached by sw.js, or the app breaks offline.
function missingFromShell() {
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.relative(ROOT, path.join(dir, d.name))]);
  return walk(ROOT).filter((f) => /\.(html|css|js|woff2|png|mp4)$/.test(f) && f !== 'sw.js' && !sw.includes(`'${f}'`));
}

// 1 s quiet 440 Hz WAV (8 kHz mono) standing in for the idle music-box loop.
function tinyWav() {
  const n = 8000, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(8000, 24); b.writeUInt32LE(16000, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(2000 * Math.sin(i * 2 * Math.PI * 440 / 8000)), 44 + i * 2);
  return b;
}

const secs = (label) => { const [m, ss] = label.split(' ')[0].split(':').map(Number); return m * 60 + ss; };

(async () => {
  const shots = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : '';
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
    check(await page.locator('canvas.zone').count() >= 10, 'zone canvases rendered (incl. box sides)');

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
    // Running order + the s09 hold window, from the app's own modules.
    const show = await page.evaluate(async () => {
      const { scenes, holds } = await import('./js/scenes/index.js');
      const last = scenes.at(-1);
      return { total: last.start + last.duration, holds, unbeaten: scenes.filter((x) => !x.placeholder && !x.story && !x.beats?.bpm && !x.beats?.times).map((x) => x.id),
        scenes: scenes.map((x) => ({ id: x.id, start: x.start, duration: x.duration })) };
    });
    const seek = (t) => page.evaluate(({ v }) => { const b = document.getElementById('seekBar'); b.value = String(v); b.dispatchEvent(new Event('change')); }, { v: t / show.total });
    check(show.scenes.length === 10 && show.holds.length === 1, 'ten scenes and one hold (s09) on the timeline');
    check(!show.unbeaten.length, `every light-show scene has a beat grid (missing: ${show.unbeaten.join(', ')})`);
    // Cut: from the start of s01, Cut jumps to its `cut` cue (0:40).
    await page.selectOption('#sceneSelect', { index: 1 });
    await page.waitForTimeout(300);
    await page.click('#cutBtn');
    await page.waitForTimeout(400);
    check(secs(await label()) >= 40 && secs(await label()) < 45, `Cut jumps to s01's cut cue (got "${await label()}")`);
    // Hold: seek just before the s09 hold point; it loops until Continue.
    const hold = show.holds[0];
    await seek(hold.at - 2);
    await page.waitForTimeout(3500);
    check(await page.locator('#continueBtn').isEnabled(), 'hold point reached, Continue enabled');
    const inLoop = secs(await label());
    check(inLoop >= Math.floor(hold.loop[0]) && inLoop <= hold.loop[1], `looping inside hold window (got "${await label()}")`);
    if (shots) await page.screenshot({ path: path.join(shots, 'hold.png') });
    await page.click('#continueBtn');
    await page.waitForTimeout(1500);
    check(secs(await label()) >= Math.floor(hold.at), `continues past hold (got "${await label()}")`);
    // Projected-star fallback toggle persists.
    await page.check('#projStar');
    check(await page.evaluate(() => JSON.parse(localStorage.getItem('christmas-mapping.show.v1')).projectedStar === true), 'projected-star option saved');
    await page.uncheck('#projStar');
    // Frame rate per scene in Show mode (logged; headless here is capped by its software compositor).
    const fpsLog = [];
    for (const sc of show.scenes) {
      await seek(sc.start + sc.duration / 2);
      await page.waitForTimeout(250);
      const ms = await page.evaluate(() => new Promise((r) => {
        const ts = []; const f = (n) => { ts.push(n); if (ts.length < 61) requestAnimationFrame(f); else r((ts.at(-1) - ts[0]) / 60); };
        requestAnimationFrame(f);
      }));
      fpsLog.push(`${sc.id} ${ms.toFixed(1)} ms (${Math.round(1000 / ms)} fps)`);
    }
    console.log('show-mode frame time:\n  ' + fpsLog.join('\n  '));
    await page.click('#restartBtn');
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

    // Idle music: the media-pack music-box loop plays in pre-show (after the first tap) and stops when the show plays.
    await page.setInputFiles('#mediaFiles', { name: 'music-box-loop.wav', mimeType: 'audio/wav', buffer: tinyWav() });
    await page.locator('#mediaList li[data-name="music-box-loop"]').waitFor({ timeout: 3000 });
    await page.click('[data-mode=show]');
    await page.waitForTimeout(800);
    const idle = () => page.evaluate(() => ({ on: window.__idleMusic.on, paused: window.__idleMusic.audio?.paused ?? true }));
    check((await idle()).on && !(await idle()).paused, 'idle music-box loop plays in pre-show');
    await page.click('#playBtn');
    await page.waitForTimeout(900);
    check(!(await idle()).on && (await idle()).paused, 'idle music stops when the show plays');
    await page.click('#restartBtn');           // was playing → restarts; pause it again
    await page.click('#playBtn');
    await page.locator('#mediaList li[data-name="music-box-loop"] button').click();
    await page.waitForTimeout(300);
    check(!(await idle()).on, 'no idle music once the file is deleted');

    // Room model page: renders, reports the fit, and pushes model-generated zones into the Mapper.
    await page.goto(url + 'model.html');
    await page.waitForTimeout(500);
    check(/throw ratio/.test(await page.locator('#verdict').textContent()), 'model page shows the projector fit');
    check(await page.locator('#coverage li').count() >= 6, 'model page lists coverage points');
    if (shots) await page.screenshot({ path: path.join(shots, 'model.png'), fullPage: true });
    await page.click('#useBtn');
    await page.waitForURL(url);
    const zones = await page.evaluate(() => JSON.parse(localStorage.getItem('christmas-mapping.layout.v1')).zones);
    check(zones.length === 12 && zones.every((z) => z.quad.flat().every(Number.isFinite)), 'model zones saved to the Mapper');
    await page.waitForTimeout(300);
    check(await page.locator('canvas.zone').count() >= 8, 'Mapper renders the model zones');

    // Beat tap tool: lists the light-show scenes, shows the current map, and edits it (insert + undo).
    await page.goto(url + 'beats.html');
    await page.waitForTimeout(500);
    check(await page.locator('#scene option').count() === 6, 'beat tool lists the 6 light-show scenes');
    const beatCount = async () => (await page.locator('#out').inputValue()).split(',').length;
    const before = await beatCount();
    check(/times: \[\d/.test(await page.locator('#out').inputValue()), 'beat tool exports the scene beat map');
    await page.click('#insert');
    check(await beatCount() === before + 1, 'beat tool inserts a beat');
    await page.click('#undo');
    check(await beatCount() === before, 'beat tool undo');
    if (shots) await page.screenshot({ path: path.join(shots, 'beats.png') });
  } catch (e) {
    errors.push(e.message);
  } finally {
    await browser.close();
    server.close();
  }

  // Flash / brightness safety for every scene (DESIGN_SYSTEM §06).
  if (!process.argv.includes('--no-flash')) {
    try { console.log(execFileSync('node', [path.join(__dirname, 'flash-check.js')], { encoding: 'utf8' }).split('\n').filter((l) => !l.startsWith('  ✓')).join('\n')); }
    catch (e) { errors.push(`flash-check failed:\n${e.stdout || ''}${e.stderr || ''}`); }
  }

  // Beat detector on a synthetic drifting 3/4 click track (tools/beats.js).
  try { console.log(execFileSync('node', [path.join(__dirname, 'beats.js'), '--self-test'], { encoding: 'utf8' }).trim()); }
  catch (e) { errors.push(`beats self-test failed:\n${e.stdout || ''}${e.stderr || ''}`); }

  if (errors.length) { console.error('SMOKE TEST FAILED\n' + errors.join('\n')); process.exit(1); }
  console.log('smoke test passed');
})();
