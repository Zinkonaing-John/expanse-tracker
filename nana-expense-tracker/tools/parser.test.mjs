/**
 * Unit tests for the pure expense-command parser.
 * Run: node --experimental-strip-types tools/parser.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseExpenseCommand, parseAmount, parseCategory } from '../apps/mobile/services/expenseParser.ts';

test('dollar sign amounts', () => {
  assert.equal(parseAmount('Lunch is $12.50'), 12.5);
  assert.equal(parseAmount('$ 1,200 rent'), 1200);
  assert.equal(parseAmount('coffee $5'), 5);
});

test('word amounts', () => {
  assert.equal(parseAmount('spent 20 bucks on gas'), 20);
  assert.equal(parseAmount('12.75 dollars for parking'), 12.75);
});

test('verb-led amounts', () => {
  assert.equal(parseAmount('dinner cost 45'), 45);
  assert.equal(parseAmount('paid 9.99 for netflix'), 9.99);
});

test('bare trailing number', () => {
  assert.equal(parseAmount('coffee 4.75'), 4.75);
});

test('no amount returns null', () => {
  assert.equal(parseAmount('bought some snacks'), null);
});

test('category detection', () => {
  assert.equal(parseCategory('lunch at the diner'), 'Food');
  assert.equal(parseCategory('morning latte'), 'Coffee');
  assert.equal(parseCategory('uber to the airport'), 'Transport');
  assert.equal(parseCategory('paid the electricity bill'), 'Bills');
  assert.equal(parseCategory('gym membership'), 'Health');
  assert.equal(parseCategory('movie tickets'), 'Entertainment');
  assert.equal(parseCategory('new shoes'), 'Shopping');
  assert.equal(parseCategory('mystery item'), null);
});

test('earliest keyword wins', () => {
  // "lunch" (Food) appears before "coffee" (Coffee)
  assert.equal(parseCategory('lunch then coffee'), 'Food');
});

test('full command with wake word', () => {
  const result = parseExpenseCommand('Hey Nana, lunch is $12.50');
  assert.equal(result.amount, 12.5);
  assert.equal(result.category, 'Food');
  assert.ok(result.confidence >= 0.9);
  assert.ok(result.description.toLowerCase().includes('lunch'));
});

test('full command without wake word', () => {
  const result = parseExpenseCommand('spent 20 bucks on gas');
  assert.equal(result.amount, 20);
  assert.equal(result.category, 'Transport');
});

test('amount-only command', () => {
  const result = parseExpenseCommand('$33.10');
  assert.equal(result.amount, 33.1);
  assert.equal(result.category, null);
});

test('unparseable command', () => {
  const result = parseExpenseCommand('hello there');
  assert.equal(result.amount, null);
  assert.ok(result.confidence < 0.5);
});
