/**
 * Shared Chrome executable resolution for Puppeteer browser tests.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');

const MAC_CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LINUX_CHROME = '/usr/local/bin/google-chrome';

export function resolveChromeExecutable() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  if (process.platform === 'darwin' && fs.existsSync(MAC_CHROME)) {
    return MAC_CHROME;
  }
  if (fs.existsSync(LINUX_CHROME)) {
    return LINUX_CHROME;
  }
  throw new Error(
    'Chrome not found. Set CHROME_PATH to your Chrome/Chromium executable.'
  );
}

export function ensureScreenshotDir() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  return SCREENSHOT_DIR;
}
