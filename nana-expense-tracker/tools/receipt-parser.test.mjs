/**
 * Unit tests for the pure receipt-text parser.
 * Run: node --experimental-strip-types tools/receipt-parser.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractPricesFromText, findLikelyTotal, parseReceiptText } from '../apps/mobile/services/receiptParser.ts';

const SAMPLE_RECEIPT = `
  CORNER CAFE
  123 Main St

  Latte             4.75
  Croissant         3.25
  Tax               0.64

  TOTAL           $ 8.64
  VISA ****1234
`;

test('extracts all prices from receipt text', () => {
  const prices = extractPricesFromText(SAMPLE_RECEIPT);
  assert.ok(prices.includes(4.75));
  assert.ok(prices.includes(3.25));
  assert.ok(prices.includes(8.64));
});

test('prices sorted descending', () => {
  const prices = extractPricesFromText(SAMPLE_RECEIPT);
  assert.deepEqual(prices, [...prices].sort((a, b) => b - a));
});

test('finds the total near the TOTAL keyword', () => {
  const { suggestedTotal } = parseReceiptText(SAMPLE_RECEIPT);
  assert.equal(suggestedTotal, 8.64);
});

test('grand total keyword takes priority', () => {
  const text = 'Subtotal 10.00\nGrand Total 11.25\nCash 20.00';
  const { suggestedTotal } = parseReceiptText(text);
  assert.equal(suggestedTotal, 11.25);
});

test('falls back to highest price without keywords', () => {
  const total = findLikelyTotal([42.1, 9.99, 3.5], 'no keywords here');
  assert.equal(total, 42.1);
});

test('empty text produces no prices and null total', () => {
  const { prices, suggestedTotal } = parseReceiptText('');
  assert.deepEqual(prices, []);
  assert.equal(suggestedTotal, null);
});
