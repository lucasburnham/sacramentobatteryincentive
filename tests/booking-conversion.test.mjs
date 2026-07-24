import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const calendarUrl = 'https://calendar.app.google/oNAhhCBMu13PSRtc7';

test('book page presents an optional Bill and Usage Review without requiring documents', () => {
  const page = read('../book.html');

  assert.match(page, /Bill and Usage Review/);
  assert.match(page, /(?:bill|usage)[^.]{0,90}optional|optional[^.]{0,90}(?:bill|usage)/i);
  assert.match(page, /no upload(?: is)? required/i);
  assert.doesNotMatch(page, /<(?:form|input|textarea|select)\b|type\s*=\s*["']file["']/i);
});

test('book page preserves its existing measurement and Calendar destination', () => {
  const page = read('../book.html');

  assert.match(page, /897444143385193/);
  assert.match(page, /assets\/organic-attribution\.js/);
  assert.match(page, new RegExp(calendarUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('book page hands off to Calendar only after an affirmative click and tracks Schedule there', () => {
  const page = read('../book.html');

  assert.match(page, /<a[^>]+id=["']calendarLink["'][^>]*>\s*Continue to choose a time\s*<\/a>/i);
  assert.doesNotMatch(page, /(?:location(?:\.href)?\s*=|window\.location(?:\.href)?\s*=|location\.assign\s*\(|location\.replace\s*\(|window\.open\s*\()\s*[^;]*(?:calendar\.app\.google|calendarUrl)/i);
  const clickIndex = page.search(/calendarLink\.addEventListener\(\s*["']click["']/i);
  const scheduleIndex = page.search(/fbq\(\s*["']track["']\s*,\s*["']Schedule["']/i);
  assert.ok(clickIndex >= 0, 'Calendar handoff has a click listener');
  assert.ok(scheduleIndex > clickIndex, 'Schedule fires from the affirmative Calendar handoff, not page load');
});

test('entry pages measure a Calendar handoff rather than an appointment conversion', () => {
  ['../index.html', '../quick-check.html'].forEach((path) => {
    const page = read(path);

    assert.match(page, /calendar_handoff_clicked/);
    assert.doesNotMatch(page, /calendar_booking_clicked/);
    assert.doesNotMatch(page, /(?:appointment|booking)_(?:scheduled|conversion)|appointment conversion/i);
  });
});

test('Before You Decide exposes booking only after a nonempty generated checklist', () => {
  const page = read('../before-you-decide.html');

  assert.match(page, /data-next-action=["']book["'][^>]*(?:hidden|aria-hidden=["']true["']|disabled)/i);
  assert.match(page, /function\s+(?:update|set)[A-Za-z]*Booking[A-Za-z]*\([\s\S]{0,900}?(?:checklist|output)[\s\S]{0,900}?\.trim\(\)\.length\s*>\s*0/i);
  assert.match(page, /(?:data-decision-tool-submit|lead_magnet_completed)[\s\S]{0,1500}?(?:update|set)[A-Za-z]*Booking[A-Za-z]*\(/i);
});
