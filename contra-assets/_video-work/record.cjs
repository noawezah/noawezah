const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('C:/Users/HP/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const work = __dirname;
const output = path.dirname(work);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;

async function ready(page) {
  await page.evaluate(async () => {
    for (const img of document.images) img.loading = 'eager';
    for (const frame of document.querySelectorAll('iframe')) frame.loading = 'eager';
    await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 6000))]);
    await Promise.race([
      Promise.all(Array.from(document.images).map(i => i.decode().catch(() => {}))),
      new Promise(r => setTimeout(r, 7000)),
    ]);
  });
  await page.addStyleTag({ content: 'html::-webkit-scrollbar,body::-webkit-scrollbar{display:none}html,body{scrollbar-width:none}' });
  await sleep(1800);
}

async function jump(page, top) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), top);
  await sleep(1000);
}

async function glide(page, top, duration) {
  await page.evaluate(({ top, duration }) => new Promise(resolve => {
    const from = scrollY;
    const to = Math.min(top, document.documentElement.scrollHeight - innerHeight);
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 0.5 - Math.cos(Math.PI * t) / 2;
      window.scrollTo({ top: from + (to - from) * eased, behavior: 'instant' });
      if (t < 1) requestAnimationFrame(frame);
      else resolve();
    }
    requestAnimationFrame(frame);
  }), { top, duration });
  await sleep(350);
}

async function record(slug, url, itinerary) {
  const dir = path.join(work, slug);
  await fs.mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1200 },
    deviceScaleFactor: 1,
    recordVideo: { dir, size: { width: 1600, height: 1200 } },
  });
  const origin = Date.now();
  const page = await ctx.newPage();
  const video = page.video();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await ready(page);
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 1000) {
    await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), y);
    await sleep(180);
  }
  await jump(page, 0);
  await sleep(1700);
  const clips = [];
  async function clip(label, action) {
    await sleep(250);
    const start = (Date.now() - origin) / 1000;
    console.log(slug + ': ' + label);
    await action();
    const duration = (Date.now() - origin) / 1000 - start;
    clips.push({ start, duration, label });
    await page.screenshot({ path: path.join(dir, 'scene-' + clips.length + '.jpg'), type: 'jpeg', quality: 86 });
  }
  await itinerary({ page, clip });
  await ctx.close();
  const rawPath = await video.path();
  const manifest = { slug, url, rawPath, outputPath: path.join(output, slug + '-walkthrough-4x3.mp4'), clips, errors };
  await fs.writeFile(path.join(work, slug + '-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(slug + ': recording complete, ' + clips.length + ' scenes');
}

(async () => {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  await record('pebble', 'https://pebble2.vercel.app/', async ({ page, clip }) => {
    await clip('Welcome and café atmosphere', async () => { await sleep(1800); await glide(page, 650, 3000); await sleep(650); });
    await jump(page, 850);
    await clip('The space', async () => { await sleep(500); await glide(page, 1830, 5000); await sleep(650); });
    await jump(page, 1920);
    await clip('Coffee and details', async () => { await sleep(500); await glide(page, 3030, 5500); await sleep(650); });
    await jump(page, 3240);
    await clip('Reviews, location, and footer', async () => { await sleep(500); await glide(page, 100000, 5000); await sleep(1300); });
  });
  await record('noawezah', 'https://noawezah.ro/', async ({ page, clip }) => {
    await clip('Hero and horizontal work reveal', async () => { await sleep(1800); await glide(page, 1980, 5200); await sleep(1000); });
    await jump(page, 2470);
    await clip('Selected work', async () => { await sleep(1100); await glide(page, 3840, 3200); await sleep(650); });
    await jump(page, 3900);
    await clip('Desktop and mobile project previews', async () => { await sleep(500); await glide(page, 5820, 6500); await sleep(700); });
    await jump(page, 6300);
    await clip('Approach and enquiry', async () => { await sleep(500); await glide(page, 100000, 4500); await sleep(1300); });
  });
  await record('urbanist', 'https://urbanist2.vercel.app/', async ({ page, clip }) => {
    await clip('Identity, menu invitation, and sound', async () => { await sleep(1600); await glide(page, 940, 2800); await sleep(500); });
    await jump(page, 1810);
    await clip('Culture and motion', async () => { await sleep(400); await glide(page, 2930, 3000); await sleep(400); });
    await jump(page, 5440);
    await clip('Community and reviews', async () => { await sleep(350); await glide(page, 5940, 1700); await sleep(500); });
    await jump(page, 7180);
    await clip('The place', async () => { await sleep(250); await glide(page, 100000, 900); await sleep(500); });
    await page.goto('https://urbanist2.vercel.app/menu', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await ready(page);
    await clip('Menu concept and food', async () => { await sleep(900); await glide(page, 380, 1700); await sleep(550); });
    await page.locator('button[aria-label="Coffee & soft drinks"]').click();
    await sleep(2100);
    await clip('Coffee category navigation', async () => { await sleep(650); await glide(page, (await page.evaluate(() => scrollY)) + 360, 1400); await sleep(450); });
    await page.locator('button[aria-label="Bar"]').click();
    await sleep(2100);
    await page.locator('button[data-category="urbanist-specials"]').click();
    await sleep(2100);
    await clip('Bar selection and item detail', async () => {
      await sleep(650);
      await page.locator('#urbanist-specials .menu-item').first().click();
      await sleep(2200);
      await page.locator('button[aria-label="Close item details"]').click();
      await sleep(650);
    });
  });
  await browser.close();
  console.log('All three recordings are ready for encoding.');
})().catch(async error => {
  console.error(error);
  if (browser) await browser.close().catch(() => {});
  process.exitCode = 1;
});
