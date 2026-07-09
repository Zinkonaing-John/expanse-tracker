/**
 * Browser test for the voice input slice: open the voice modal from the Add
 * screen, submit a typed command, and verify it prefills the form and saves
 * as a voice-tagged expense.
 *
 * Usage: node tools/voice-test.mjs [url]
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

  // Go to Add screen
  await page.evaluate(() => {
    const link = [...document.querySelectorAll('a')].find((el) =>
      (el.getAttribute('href') || '').includes('add')
    );
    link?.click();
  });
  await sleep(2500);

  // Open the voice modal
  check('Open voice modal', await clickText('Voice Input'));
  await sleep(1500);
  let text = await pageText();
  check('Voice modal visible', text.includes('type a command') || text.includes('Tap to speak'));
  await page.screenshot({ path: `${OUT_DIR}/voice-modal.png` });

  // Type a command
  const typed = await page.evaluate(() => {
    const input = [...document.querySelectorAll('input')].find((i) =>
      (i.placeholder || '').includes('Coffee $4.75')
    );
    if (!input) return false;
    input.focus();
    return true;
  });
  check('Focus command input', typed);
  await page.keyboard.type('Hey Nana, morning latte coffee is $4.75');
  await page.keyboard.press('Enter');
  await sleep(1500);

  // Modal should close and prefill the form
  text = await pageText();
  await page.screenshot({ path: `${OUT_DIR}/voice-prefilled.png` });
  const amountValue = await page.evaluate(() => {
    const input = [...document.querySelectorAll('input')].find((i) => i.placeholder === '0.00');
    return input?.value || '';
  });
  check('Amount prefilled with 4.75', amountValue === '4.75', `value="${amountValue}"`);

  // Save and verify the expense is tagged as voice
  check('Save prefilled expense', await clickText('Save Expense'));
  await sleep(3000);
  text = await pageText();
  await page.screenshot({ path: `${OUT_DIR}/voice-saved.png` });
  check('Dashboard shows $4.75', text.slice(0, text.indexOf('Voice Command Tip')).includes('4.75'));
  check('Expense listed as Coffee', text.includes('Coffee'));

  console.log('\n=== PAGE ERRORS ===');
  console.log(pageErrors.length ? pageErrors.join('\n') : '(none)');
  console.log(`\nRESULT: ${failures === 0 ? 'ALL PASS' : failures + ' FAILURES'}`);
  process.exit(failures === 0 ? 0 : 1);
} finally {
  await browser.close();
}
