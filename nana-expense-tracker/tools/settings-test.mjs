/**
 * Browser test for the settings slice: toggle persistence, CSV export
 * download, and clear-all-data.
 *
 * Usage: node tools/settings-test.mjs [url]
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const URL = process.argv[2] || 'http://localhost:8081';
const OUT_DIR = '/workspace/nana-expense-tracker/tools/screenshots';
const DL_DIR = '/tmp/nana-downloads';
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.rmSync(DL_DIR, { recursive: true, force: true });
fs.mkdirSync(DL_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 430, height: 932, isMobile: true, hasTouch: true },
});

const pageErrors = [];
let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => pageErrors.push(String(e?.message || e)));
  page.on('dialog', (d) => d.accept());

  const client = await page.createCDPSession();
  await client.send('Browser.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: DL_DIR,
  });

  async function clickText(text) {
    return page.evaluate((t) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let el;
      const matches = [];
      while ((el = walker.nextNode())) {
        if (el.childElementCount === 0 && el.textContent.trim() === t) matches.push(el);
      }
      if (!matches.length) return false;
      matches[matches.length - 1].click();
      return true;
    }, text);
  }
  const pageText = () => page.evaluate(() => document.body.innerText);
  const gotoTab = (part) =>
    page.evaluate((p) => {
      const link = [...document.querySelectorAll('a')].find((el) => {
        const href = el.getAttribute('href') || '';
        return p === '/' ? href === '/' : href.includes(p);
      });
      link?.click();
    }, part);

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(5000);

  // Seed one expense through the UI so there is data to export.
  await gotoTab('add');
  await sleep(2500);
  await page.evaluate(() => {
    const input = [...document.querySelectorAll('input')].find((i) => i.placeholder === '0.00');
    input?.focus();
  });
  await page.keyboard.type('9.99');
  await clickText('Coffee');
  await clickText('Save Expense');
  await sleep(3000);

  // Settings
  await gotoTab('settings');
  await sleep(2500);
  let text = await pageText();
  check('Settings renders', text.includes('Export as CSV'));
  check('Expense count shown', text.includes('1 expenses') || text.includes('1 expense'));
  await page.screenshot({ path: `${OUT_DIR}/settings.png` });

  // Toggle "Hey Nana" off, reload, and verify persistence
  const toggled = await page.evaluate(() => {
    const switches = [...document.querySelectorAll('[role="switch"], input[type="checkbox"]')];
    if (!switches.length) return null;
    const first = switches[0];
    const before = first.getAttribute('aria-checked') ?? String(first.checked);
    first.click();
    return before;
  });
  await sleep(1500);
  check('Voice toggle clicked (was on)', toggled === 'true', `before=${toggled}`);

  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(5000);
  await gotoTab('settings');
  await sleep(2500);
  const persisted = await page.evaluate(() => {
    const switches = [...document.querySelectorAll('[role="switch"], input[type="checkbox"]')];
    if (!switches.length) return null;
    const first = switches[0];
    return first.getAttribute('aria-checked') ?? String(first.checked);
  });
  check('Voice toggle persisted off after reload', persisted === 'false', `after=${persisted}`);

  // CSV export triggers a download
  await clickText('Export as CSV');
  await sleep(3000);
  const downloads = fs.readdirSync(DL_DIR).filter((f) => f.endsWith('.csv'));
  check('CSV file downloaded', downloads.length === 1, downloads.join(','));
  if (downloads.length) {
    const csv = fs.readFileSync(`${DL_DIR}/${downloads[0]}`, 'utf8');
    check('CSV contains the expense', csv.includes('9.99') && csv.includes('Coffee'));
    console.log('--- CSV content ---\n' + csv + '\n-------------------');
  }

  // Clear all data (confirm dialog auto-accepted)
  await clickText('Clear All Data');
  await sleep(3000);
  await gotoTab('/');
  await sleep(2500);
  text = await pageText();
  const beforeTip = text.slice(0, text.indexOf('Voice Command Tip'));
  check('Data cleared — dashboard back to $0.00', beforeTip.includes('$0.00') && !beforeTip.includes('9.99'));

  console.log('\n=== PAGE ERRORS ===');
  console.log(pageErrors.length ? pageErrors.join('\n') : '(none)');
  console.log(`\nRESULT: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
  process.exit(failures === 0 ? 0 : 1);
} finally {
  await browser.close();
}
