/**
 * Unit tests for locale formatting (pure functions).
 * Run: node --experimental-strip-types tools/i18n.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCurrency } from '../apps/mobile/i18n/formatCurrency.ts';

test('formatCurrency formats USD for English', () => {
  const result = formatCurrency(12.5, 'en');
  assert.match(result, /\$12\.50/);
});

test('formatCurrency formats MMK for Myanmar', () => {
  const result = formatCurrency(3000, 'my');
  assert.match(result, /[၃3][,.]?[၀0]{3}/);
  assert.match(result, /K|ကျပ်|MMK/i);
});

test('formatCurrency formats KRW for Korean', () => {
  const result = formatCurrency(5000, 'ko');
  assert.match(result, /5[,.]?000/);
});

test('formatCurrency formats KHR for Khmer', () => {
  const result = formatCurrency(10000, 'km');
  assert.match(result, /10[,.]?000/);
});

test('formatCurrency formats CNY for Chinese', () => {
  const result = formatCurrency(35, 'zh');
  assert.match(result, /35/);
});
