/**
 * End-to-end flow test: full manual expense lifecycle on Expo web.
 *
 * add expense -> auto-return to dashboard -> totals update -> persists after
 * reload -> shows in history -> delete from history -> totals reset.
 *
 * Usage: node tools/flow-test.mjs [url]
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { resolveChromeExecutable, ensureScreenshotDir } from './chrome.mjs';

const URL = process.argv[2] || 'http://localhost:8081';
const OUT_DIR = ensureScreenshotDir();

const browser = await puppeteer.launch({
  executablePath: resolveChromeExecutable(),
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
  // Auto-accept window.confirm dialogs (used by the delete flow on web).
  page.on('dialog', (d) => d.accept());

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

  async function gotoTab(hrefPart) {
    return page.evaluate((part) => {
      const links = [...document.querySelectorAll('a')];
      const link = links.find((el) => {
        const href = el.getAttribute('href') || '';
        return part === '/' ? href === '/' : href.includes(part);
      });
      if (link) {
        link.click();
        return true;
      }
      return false;
    }, hrefPart);
  }

  const pageText = () => page.evaluate(() => document.body.innerText);

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(5000);

  // 1. Dashboard renders
  let text = await pageText();
  check('Dashboard renders', text.includes('Nana') && text.includes('THIS MONTH'));

  // 2. Add an expense
  await gotoTab('add');
  await sleep(2500);
  text = await pageText();
  check('Navigate to Add screen', text.includes('AMOUNT'));

  const amountFocused = await page.evaluate(() => {
    const input = [...document.querySelectorAll('input')].find((i) => i.placeholder === '0.00');
    if (!input) return false;
    input.focus();
    return true;
  });
  if (amountFocused) await page.keyboard.type('12.50');
  check('Enter amount 12.50', amountFocused);

  const catClicked = await clickText('Coffee');
  await sleep(500);
  check('Select Coffee category', catClicked);

  const noteFocused = await page.evaluate(() => {
    const area = [...document.querySelectorAll('textarea, input')].find(
      (i) => i.placeholder === 'What was this expense for?'
    );
    if (!area) return false;
    area.focus();
    return true;
  });
  if (noteFocused) await page.keyboard.type('Morning latte');
  check('Enter note', noteFocused);

  check('Click Save Expense', await clickText('Save Expense'));
  await sleep(3000);

  // 3. Saving should return to the dashboard automatically with updated totals
  text = await pageText();
  await page.screenshot({ path: `${OUT_DIR}/flow-dashboard-after.png` });
  const backOnDashboard = text.includes('WELCOME BACK') && text.includes('Recent Transactions');
  check('Auto-returned to dashboard after save', backOnDashboard);
  const monthSection = text.slice(text.indexOf('THIS MONTH'), text.indexOf('Recent Transactions'));
  check('Dashboard totals show $12.50', monthSection.includes('12.50'), monthSection.replace(/\n/g, ' | ').slice(0, 200));
  check('Recent transactions lists Coffee + note', text.includes('Coffee') && text.includes('Morning latte'));

  // 4. Persistence across reload
  await page.reload({ waitUntil: 'networkidle2' });
  await sleep(5000);
  text = await pageText();
  check('Expense persists after reload', text.includes('Morning latte'));

  // 5. History shows the expense
  await gotoTab('history');
  await sleep(2500);
  text = await pageText();
  await page.screenshot({ path: `${OUT_DIR}/flow-history.png` });
  check('History lists the expense', text.includes('Morning latte') && text.includes('Today'));
  check('History summary shows 1 expense', /1\s*\n?\s*expense/.test(text));

  // 6. Delete the expense (tap card, auto-accepted confirm).
  // Note: all tab screens stay mounted in the DOM, so scope the check to the
  // history screen's own empty state + summary rather than global text.
  await clickText('Morning latte');
  await sleep(2500);
  text = await pageText();
  await page.screenshot({ path: `${OUT_DIR}/flow-history-after-delete.png` });
  check(
    'Expense removed from history',
    text.includes('No expenses for this period') && /0\s*\n?\s*expenses/.test(text)
  );

  // 7. Dashboard totals reset
  await gotoTab('/');
  await sleep(2500);
  text = await pageText();
  const monthAfter = text.slice(text.indexOf('THIS MONTH'), text.indexOf('Recent Transactions'));
  check('Dashboard totals reset to $0.00', monthAfter.includes('$0.00') && !monthAfter.includes('12.50'));

  console.log('\n=== PAGE ERRORS ===');
  console.log(pageErrors.length ? pageErrors.join('\n') : '(none)');
  console.log('=== CONSOLE ERRORS (first 10) ===');
  console.log(consoleErrors.length ? consoleErrors.slice(0, 10).join('\n') : '(none)');

  console.log(`\nRESULT: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
  process.exit(failures === 0 ? 0 : 1);
} finally {
  await browser.close();
}
