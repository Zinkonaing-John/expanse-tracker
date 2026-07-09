/**
 * Browser smoke test for the Nana mobile app running on Expo web.
 *
 * Usage: node tools/browser-test.mjs [url] [screenshot-name]
 *
 * Loads the app, captures console messages and page errors, waits for the
 * dashboard to render, and saves a screenshot. Exits non-zero if the page
 * fails to render meaningful content or a fatal error is detected.
 */
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const URL = process.argv[2] || 'http://localhost:8081';
const NAME = process.argv[3] || 'smoke';
const OUT_DIR = new(class {
  path = '/workspace/nana-expense-tracker/tools/screenshots';
})().path;

fs.mkdirSync(OUT_DIR, { recursive: true });

const CHROME = '/usr/local/bin/google-chrome';

const consoleMessages = [];
const pageErrors = [];

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=430,932'],
  defaultViewport: { width: 430, height: 932, isMobile: true, hasTouch: true },
});

try {
  const page = await browser.newPage();

  page.on('console', (msg) => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
  });
  page.on('pageerror', (err) => {
    pageErrors.push(String(err?.message || err));
  });

  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });

  // Give React time to hydrate and run effects (DB init, etc.)
  await new Promise((r) => setTimeout(r, 6000));

  const bodyText = await page.evaluate(() => document.body.innerText);

  await page.screenshot({ path: `${OUT_DIR}/${NAME}.png` });

  console.log('=== PAGE TEXT (first 1200 chars) ===');
  console.log(bodyText.slice(0, 1200));
  console.log('=== PAGE ERRORS ===');
  console.log(pageErrors.length ? pageErrors.join('\n') : '(none)');
  console.log('=== CONSOLE (errors/warnings only) ===');
  const importantLogs = consoleMessages.filter(
    (m) => m.startsWith('[error]') || m.startsWith('[warn]')
  );
  console.log(importantLogs.length ? importantLogs.slice(0, 30).join('\n') : '(none)');

  const hasContent = bodyText.trim().length > 20;
  const hasFatal = pageErrors.length > 0;

  if (!hasContent) {
    console.log('RESULT: FAIL (page rendered no meaningful content)');
    process.exit(1);
  }
  if (hasFatal) {
    console.log('RESULT: FAIL (page threw uncaught errors)');
    process.exit(2);
  }
  console.log('RESULT: PASS');
} finally {
  await browser.close();
}
