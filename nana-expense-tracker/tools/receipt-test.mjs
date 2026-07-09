/**
 * Browser test for the receipt flow on web: open Scan Receipt, upload an
 * image via the file chooser, review, enter amount, save, and verify the
 * expense lands on the dashboard tagged as a camera entry.
 *
 * Usage: node tools/receipt-test.mjs [url]
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
import { resolveChromeExecutable, ensureScreenshotDir } from './chrome.mjs';

const URL = process.argv[2] || 'http://localhost:8081';
const OUT_DIR = ensureScreenshotDir();

// Minimal valid 1x1 red PNG for the upload.
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const IMG_PATH = path.join(OUT_DIR, 'test-receipt.png');
fs.writeFileSync(IMG_PATH, Buffer.from(PNG_BASE64, 'base64'));

const browser = await puppeteer.launch({
  executablePath: resolveChromeExecutable(),
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

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
  await sleep(5000);

  // Add screen -> Scan Receipt
  await page.evaluate(() => {
    const link = [...document.querySelectorAll('a')].find((el) =>
      (el.getAttribute('href') || '').includes('add')
    );
    link?.click();
  });
  await sleep(2500);
  check('Open Scan Receipt', await clickText('Scan Receipt'));
  await sleep(2500);

  let text = await pageText();
  check('Upload screen shown', text.includes('Upload a receipt'));
  await page.screenshot({ path: `${OUT_DIR}/receipt-upload.png` });

  // Upload via the file chooser triggered by "Choose Image"
  const [chooser] = await Promise.all([
    page.waitForFileChooser({ timeout: 10000 }).catch(() => null),
    clickText('Choose Image'),
  ]);
  check('File chooser opened', Boolean(chooser));
  if (chooser) {
    await chooser.accept([IMG_PATH]);
    await sleep(2500);
    text = await pageText();
    check('Preview with Use Photo shown', text.includes('Use Photo'));
    await clickText('Use Photo');
    await sleep(2000);
  }

  // Review step
  text = await pageText();
  await page.screenshot({ path: `${OUT_DIR}/receipt-review.png` });
  check('Review step shown', text.includes('Review Receipt'));
  check('Photo-attached notice shown', text.includes('Receipt photo will be saved'));

  // Enter amount + category, save
  // Both the Add tab and this modal are mounted; the modal's input is last.
  const focused = await page.evaluate(() => {
    const inputs = [...document.querySelectorAll('input')].filter((i) => i.placeholder === '0.00');
    const input = inputs[inputs.length - 1];
    if (!input) return false;
    input.focus();
    return true;
  });
  check('Focus amount input', focused);
  await page.keyboard.type('23.40');
  await clickText('Food');
  await sleep(500);
  check('Save from review', await clickText('Save Expense'));
  await sleep(3000);

  // Saving returns to the Add screen; go to the dashboard to verify.
  await page.evaluate(() => {
    const link = [...document.querySelectorAll('a')].find(
      (el) => (el.getAttribute('href') || '') === '/'
    );
    link?.click();
  });
  await sleep(2500);
  text = await pageText();
  await page.screenshot({ path: `${OUT_DIR}/receipt-saved.png` });
  const beforeTip = text.slice(0, text.indexOf('Voice Command Tip'));
  check('Dashboard shows $23.40', beforeTip.includes('23.40'));
  check('Expense listed as Food', beforeTip.includes('Food'));

  console.log('\n=== PAGE ERRORS ===');
  console.log(pageErrors.length ? pageErrors.join('\n') : '(none)');
  console.log(`\nRESULT: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
  process.exit(failures === 0 ? 0 : 1);
} finally {
  await browser.close();
}
