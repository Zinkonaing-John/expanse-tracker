/**
 * End-to-end flow test: add an expense through the UI and verify it appears
 * on the dashboard with updated totals.
 *
 * Usage: node tools/flow-test.mjs [url]
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const URL = process.argv[2] || 'http://localhost:8081';
const OUT_DIR = '/workspace/nana-expense-tracker/tools/screenshots';
fs.mkdirSync(OUT_DIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 430, height: 932, isMobile: true, hasTouch: true },
});

const pageErrors = [];
const consoleErrors = [];
let failures = 0;

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}: ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  const page = await browser.newPage();
  page.on('pageerror', (e) => pageErrors.push(String(e?.message || e)));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  // Helper: click the element whose visible text matches
  async function clickText(text) {
    const clicked = await page.evaluate((t) => {
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
    return clicked;
  }

  // Helper: get full page text
  const pageText = () => page.evaluate(() => document.body.innerText);

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(5000);

  // 1. Dashboard renders
  let text = await pageText();
  check('Dashboard renders', text.includes('Nana') && text.includes('THIS MONTH'));

  // 2. Navigate to Add screen via tab bar (tab buttons are links/buttons with tab names)
  const tabClicked = await page.evaluate(() => {
    // Expo router web tab bar: find anchor/button whose href or aria-label points to add
    const candidates = [...document.querySelectorAll('a[href*="add"], [role="tab"], [role="button"], a')];
    const addLink = candidates.find((el) => (el.getAttribute('href') || '').includes('add'));
    if (addLink) {
      addLink.click();
      return 'href';
    }
    return null;
  });
  await sleep(2500);
  text = await pageText();
  const onAddScreen = text.includes('AMOUNT') || text.includes('Amount');
  check('Navigate to Add screen', onAddScreen, `method=${tabClicked}`);
  await page.screenshot({ path: `${OUT_DIR}/flow-add-screen.png` });

  if (onAddScreen) {
    // 3. Type amount
    const amountTyped = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input')];
      const amountInput = inputs.find((i) => i.placeholder === '0.00');
      if (!amountInput) return false;
      amountInput.focus();
      return true;
    });
    if (amountTyped) {
      await page.keyboard.type('12.50');
    }
    await sleep(500);
    check('Enter amount 12.50', amountTyped);

    // 4. Select the Coffee category
    const catClicked = await clickText('Coffee');
    await sleep(500);
    check('Select Coffee category', catClicked);

    // 5. Save
    const saveClicked = await clickText('Save Expense');
    await sleep(3000);
    check('Click Save Expense', saveClicked);
    await page.screenshot({ path: `${OUT_DIR}/flow-after-save.png` });

    // 6. Navigate back to dashboard
    await page.evaluate(() => {
      const links = [...document.querySelectorAll('a')];
      const home = links.find((el) => {
        const href = el.getAttribute('href') || '';
        return href === '/' || href.endsWith('index');
      });
      if (home) home.click();
    });
    await sleep(3000);
    text = await pageText();
    await page.screenshot({ path: `${OUT_DIR}/flow-dashboard-after.png` });

    // 7. Verify the expense shows up
    check('Dashboard shows $12.50 total', text.includes('12.50'), text.slice(0, 300).replace(/\n/g, ' | '));
    check('Recent transactions shows Coffee', text.includes('Coffee'));

    // 8. Reload and verify persistence
    await page.reload({ waitUntil: 'networkidle2' });
    await sleep(5000);
    text = await pageText();
    check('Expense persists after reload', text.includes('12.50'));
    await page.screenshot({ path: `${OUT_DIR}/flow-after-reload.png` });
  }

  console.log('\n=== PAGE ERRORS ===');
  console.log(pageErrors.length ? pageErrors.join('\n') : '(none)');
  console.log('=== CONSOLE ERRORS (first 10) ===');
  console.log(consoleErrors.length ? consoleErrors.slice(0, 10).join('\n') : '(none)');

  console.log(`\nRESULT: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
  process.exit(failures === 0 ? 0 : 1);
} finally {
  await browser.close();
}
