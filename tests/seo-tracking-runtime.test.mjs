import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const trackingSource = fs.readFileSync(new URL('../assets/seo-tracking.js', import.meta.url), 'utf8');

function runTracking(search) {
  const booking = {
    dataset: { track: 'hero_book' },
    href: '/book.html',
    addEventListener() {}
  };
  const quickCheck = {
    dataset: { track: 'hero_quick' },
    href: '/quick-check.html',
    addEventListener() {}
  };
  const appendedScripts = [];
  const document = {
    body: { dataset: { page: 'smud-battery-incentive', message: 'incentive' } },
    title: 'SMUD Battery Incentive',
    head: { appendChild: (element) => appendedScripts.push(element) },
    createElement: () => ({}),
    querySelector: () => null,
    querySelectorAll(selector) {
      if (selector === '.js-booking-link') return [booking];
      if (selector === '.js-quick-check-link') return [quickCheck];
      return [];
    }
  };
  const location = {
    search,
    origin: 'https://sacramentobatteryincentive.com',
    href: `https://sacramentobatteryincentive.com/smud-battery-incentive.html${search}`
  };
  const context = {
    Date,
    Math,
    URL,
    URLSearchParams,
    document,
    location,
    setTimeout() {},
    console
  };
  context.window = context;
  context.addEventListener = () => {};

  vm.runInNewContext(trackingSource, context);
  return { booking, quickCheck, appendedScripts };
}

test('SEO landing links preserve a valid oppref before the helper loads', () => {
  const { booking, quickCheck, appendedScripts } = runTracking(
    '?utm_source=openai&utm_medium=paid_ai&utm_campaign=smud_battery_sacramento&utm_content=incentive_check&oppref=opp_AbC-123._~'
  );

  const bookingUrl = new URL(booking.href, 'https://sacramentobatteryincentive.com');
  const quickCheckUrl = new URL(quickCheck.href, 'https://sacramentobatteryincentive.com');
  assert.equal(bookingUrl.searchParams.get('oppref'), 'opp_AbC-123._~');
  assert.equal(quickCheckUrl.searchParams.get('oppref'), 'opp_AbC-123._~');
  assert.equal(bookingUrl.searchParams.get('utm_medium'), 'paid_ai');
  assert.ok(appendedScripts.some((script) => script.src === '/assets/organic-attribution.js'));
});

test('SEO landing links reject malformed oppref before the helper loads', () => {
  const { booking, quickCheck } = runTracking('?utm_medium=paid_ai&oppref=contains%20spaces');

  assert.equal(new URL(booking.href, 'https://sacramentobatteryincentive.com').searchParams.has('oppref'), false);
  assert.equal(new URL(quickCheck.href, 'https://sacramentobatteryincentive.com').searchParams.has('oppref'), false);
});
