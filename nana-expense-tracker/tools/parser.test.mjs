/**
 * Unit tests for the locale-aware expense-command parser.
 * Run: node --experimental-strip-types tools/parser.test.mjs
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseExpenseCommand, parseAmount, parseCategory } from '../apps/mobile/i18n/parser.ts';
import { containsWakeWord, extractCommandAfterWakeWord } from '../apps/mobile/services/wakeWord.ts';

test('dollar sign amounts (en)', () => {
  assert.equal(parseAmount('Lunch is $12.50', 'en'), 12.5);
  assert.equal(parseAmount('$ 1,200 rent', 'en'), 1200);
  assert.equal(parseAmount('coffee $5', 'en'), 5);
});

test('word amounts (en)', () => {
  assert.equal(parseAmount('spent 20 bucks on gas', 'en'), 20);
  assert.equal(parseAmount('12.75 dollars for parking', 'en'), 12.75);
});

test('verb-led amounts (en)', () => {
  assert.equal(parseAmount('dinner cost 45', 'en'), 45);
  assert.equal(parseAmount('paid 9.99 for netflix', 'en'), 9.99);
});

test('bare trailing number (en)', () => {
  assert.equal(parseAmount('coffee 4.75', 'en'), 4.75);
});

test('large trailing number (en)', () => {
  assert.equal(parseAmount('food 11000', 'en'), 11000);
});

test('free-form name and price (en)', () => {
  const result = parseExpenseCommand('Walmart 11000', 'en');
  assert.equal(result.amount, 11000);
  assert.equal(result.category, null);
  assert.equal(result.description, 'Walmart');
});

test('keyword category is optional (en)', () => {
  const result = parseExpenseCommand('food 11000', 'en');
  assert.equal(result.amount, 11000);
  assert.equal(result.category, 'food');
  assert.equal(result.description, 'food');
});

test('no amount returns null (en)', () => {
  assert.equal(parseAmount('bought some snacks', 'en'), null);
});

test('category detection (en)', () => {
  assert.equal(parseCategory('lunch at the diner', 'en'), 'food');
  assert.equal(parseCategory('morning latte', 'en'), 'coffee');
  assert.equal(parseCategory('uber to the airport', 'en'), 'transport');
  assert.equal(parseCategory('paid the electricity bill', 'en'), 'bills');
  assert.equal(parseCategory('gym membership', 'en'), 'health');
  assert.equal(parseCategory('movie tickets', 'en'), 'entertainment');
  assert.equal(parseCategory('new shoes', 'en'), 'shopping');
  assert.equal(parseCategory('mystery item', 'en'), null);
});

test('earliest keyword wins (en)', () => {
  assert.equal(parseCategory('lunch then coffee', 'en'), 'food');
});

test('full command with wake word (en)', () => {
  const result = parseExpenseCommand('Hey Nana, lunch is $12.50', 'en');
  assert.equal(result.amount, 12.5);
  assert.equal(result.category, 'food');
  assert.ok(result.confidence >= 0.9);
  assert.ok(result.description?.toLowerCase().includes('lunch'));
});

test('full command without wake word (en)', () => {
  const result = parseExpenseCommand('spent 20 bucks on gas', 'en');
  assert.equal(result.amount, 20);
  assert.equal(result.category, 'transport');
});

test('amount-only command (en)', () => {
  const result = parseExpenseCommand('$33.10', 'en');
  assert.equal(result.amount, 33.1);
  assert.equal(result.category, null);
});

test('unparseable command (en)', () => {
  const result = parseExpenseCommand('hello there', 'en');
  assert.equal(result.amount, null);
  assert.ok(result.confidence < 0.5);
});

test('myanmar thousand suffix', () => {
  const result = parseExpenseCommand('ကော်ဖီ ၃ ထောင်', 'my');
  assert.equal(result.amount, 3000);
  assert.equal(result.category, 'coffee');
});

test('korean won amount', () => {
  const result = parseExpenseCommand('커피 5000원', 'ko');
  assert.equal(result.amount, 5000);
  assert.equal(result.category, 'coffee');
});

test('chinese yuan amount', () => {
  const result = parseExpenseCommand('咖啡 35元', 'zh');
  assert.equal(result.amount, 35);
  assert.equal(result.category, 'coffee');
});

test('khmer riel amount', () => {
  const result = parseExpenseCommand('កាហ្វេ 10000 រៀល', 'km');
  assert.equal(result.amount, 10000);
  assert.equal(result.category, 'coffee');
});

test('wake word detection', () => {
  assert.equal(containsWakeWord('Hey Nana pizza 11000'), true);
  assert.equal(containsWakeWord('pizza 11000'), false);
  assert.equal(extractCommandAfterWakeWord('Hey Nana pizza 11000'), 'pizza 11000');
  assert.equal(extractCommandAfterWakeWord('ok nana'), null);
});
