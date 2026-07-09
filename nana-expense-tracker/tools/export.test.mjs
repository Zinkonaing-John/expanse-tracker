/**
 * Unit tests for the pure export formatters.
 * Run: node --experimental-strip-types tools/export.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expensesToCsv, expensesToJson, calculateExpenseStats } from '../apps/mobile/services/exportFormats.ts';

const categories = [
  { id: 'cat-1', name: 'Food', icon: 'silverware-fork-knife', color: '#f97316', isDefault: true },
  { id: 'cat-2', name: 'Coffee', icon: 'coffee', color: '#92400e', isDefault: true },
];

const expenses = [
  {
    id: 'e1', amount: 12.5, category: 'cat-1', description: 'Lunch, with "quotes"',
    date: '2026-07-08', inputMethod: 'manual', createdAt: '2026-07-08T10:00:00Z', updatedAt: '2026-07-08T10:00:00Z',
  },
  {
    id: 'e2', amount: 4.75, category: 'cat-2', description: null, // null description must not crash
    date: '2026-07-07', inputMethod: 'voice', createdAt: '2026-07-07T09:00:00Z', updatedAt: '2026-07-07T09:00:00Z',
  },
  {
    id: 'e3', amount: 100, category: 'missing-cat', description: 'Unknown category',
    date: '2026-07-06', inputMethod: 'camera', createdAt: '2026-07-06T08:00:00Z', updatedAt: '2026-07-06T08:00:00Z',
  },
];

test('CSV has header and one row per expense', () => {
  const csv = expensesToCsv(expenses, categories);
  const lines = csv.split('\n');
  assert.equal(lines.length, 4);
  assert.equal(lines[0], 'Date,Amount,Category,Description,Input Method,Created At');
});

test('CSV escapes commas and quotes', () => {
  const csv = expensesToCsv(expenses, categories);
  assert.ok(csv.includes('"Lunch, with ""quotes"""'));
});

test('CSV handles null description', () => {
  const csv = expensesToCsv(expenses, categories);
  const coffeeRow = csv.split('\n').find((l) => l.includes('Coffee'));
  assert.ok(coffeeRow.includes('4.75'));
});

test('CSV maps unknown category', () => {
  const csv = expensesToCsv(expenses, categories);
  assert.ok(csv.includes('Unknown'));
});

test('JSON round-trips with category names', () => {
  const parsed = JSON.parse(expensesToJson(expenses, categories));
  assert.equal(parsed.length, 3);
  assert.equal(parsed[0].category, 'Food');
  assert.equal(parsed[1].description, '');
  assert.equal(parsed[2].category, 'Unknown');
});

test('stats computed correctly', () => {
  const stats = calculateExpenseStats(expenses);
  assert.equal(stats.count, 3);
  assert.equal(stats.total, 117.25);
  assert.equal(stats.highest, 100);
  assert.equal(stats.lowest, 4.75);
});

test('stats for empty list', () => {
  assert.deepEqual(calculateExpenseStats([]), { total: 0, average: 0, highest: 0, lowest: 0, count: 0 });
});
