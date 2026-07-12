import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function loadHelper(overrides = {}) {
  const source = fs.readFileSync(new URL('../assets/decision-tools.js', import.meta.url), 'utf8');
  const calls = { oaiq: [], fbq: [] };
  const context = {
    window: {
      SbiAttribution: {
        eventProperties(tags) {
          return {
            sbi_content: tags?.sbi_content || 'test-content',
            sbi_entry: tags?.sbi_entry || 'test-entry',
            sbi_tool: tags?.sbi_tool || 'test-tool',
          };
        },
      },
      oaiq(...args) {
        calls.oaiq.push(args);
      },
      fbq(...args) {
        calls.fbq.push(args);
      },
      ...overrides,
    },
    console,
  };
  vm.runInNewContext(source, context);
  return { helper: context.window.SbiDecisionTools, calls };
}

test('buildPreflight covers every neutral proposal section', () => {
  const { helper } = loadHelper();
  const sections = helper.buildPreflight(['scope', 'assumptions', 'agreement', 'process']);

  assert.deepEqual(Array.from(sections, (section) => section.key), [
    'scope', 'assumptions', 'agreement', 'process',
  ]);
  assert.ok(sections.every((section) => section.prompts.length > 0));
  assert.match(JSON.stringify(sections), /written scope|equipment|exclusions/i);
  assert.match(JSON.stringify(sections), /usage history|home|transportation/i);
  assert.match(JSON.stringify(sections), /financing|warranty|service/i);
  assert.match(JSON.stringify(sections), /site survey|permitting|interconnection|commissioning/i);
});

test('buildBillDecoder covers the seven approved homeowner prompts', () => {
  const { helper } = loadHelper();
  const prompts = helper.buildBillDecoder([
    'weather', 'ev', 'hvac', 'pool_spa', 'household', 'existing_solar', 'usage_timing',
  ]);

  assert.deepEqual(Array.from(prompts, (prompt) => prompt.key), [
    'weather', 'ev', 'hvac', 'pool_spa', 'household', 'existing_solar', 'usage_timing',
  ]);
  assert.ok(prompts.every((prompt) => prompt.text.endsWith('?')));
  assert.match(JSON.stringify(prompts), /billing periods|weather|EV|HVAC|pool|spa|household|solar|timing/i);
});

test('unknown selections do not change either decision-tool output', () => {
  const { helper } = loadHelper();

  assert.deepEqual(
    helper.buildPreflight(['scope', 'not-a-real-selection']),
    helper.buildPreflight(['scope']),
  );
  assert.deepEqual(
    helper.buildBillDecoder(['weather', 'not-a-real-selection']),
    helper.buildBillDecoder(['weather']),
  );
});

test('decision-tool output contains prompts only, never a result or claim', () => {
  const { helper } = loadHelper();
  const output = JSON.stringify([
    ...helper.buildPreflight(['scope', 'assumptions', 'agreement', 'process']),
    ...helper.buildBillDecoder(['weather', 'ev', 'hvac', 'pool_spa', 'household', 'existing_solar', 'usage_timing']),
  ]).toLowerCase();

  assert.doesNotMatch(output, /score|recommendation|estimate|eligib|savings|payback|incentive|tariff/);
});

test('track uses the accepted OpenAI custom-event signature for every lead-magnet event', () => {
  const { helper, calls } = loadHelper();
  const eventNames = [
    'lead_magnet_viewed',
    'lead_magnet_started',
    'lead_magnet_completed',
    'lead_magnet_cta_clicked',
  ];

  eventNames.forEach((eventName) => helper.track(eventName, {
    sbi_content: 'community-post',
    sbi_entry: 'lead-magnet',
    sbi_tool: 'bill_decoder',
    selectedKeys: ['ev'],
    response: 'private',
  }));

  assert.equal(calls.oaiq.length, eventNames.length);
  calls.oaiq.forEach((call, index) => {
    assert.deepEqual(JSON.parse(JSON.stringify(call)), [
      'measure',
      'custom',
      { type: 'custom' },
      { custom_event_name: eventNames[index] },
    ]);
    assert.deepEqual(Object.keys(call[2]), ['type']);
  });
});

test('track passes only sanitized attribution properties to Meta', () => {
  const { helper, calls } = loadHelper({
    SbiAttribution: {
      eventProperties() {
        return {
          sbi_content: 'community-post',
          sbi_entry: 'lead-magnet',
          sbi_tool: 'bill_decoder',
          selectedKeys: ['ev'],
          response: 'private',
          text: 'Did EV charging change during the billing period?',
        };
      },
    },
  });
  helper.track('lead_magnet_completed', {});

  assert.equal(calls.fbq.length, 1);
  assert.deepEqual(JSON.parse(JSON.stringify(calls.fbq[0][2])), {
    sbi_content: 'community-post',
    sbi_entry: 'lead-magnet',
    sbi_tool: 'bill_decoder',
  });
  assert.equal(calls.fbq[0][1], 'lead_magnet_completed');
  assert.doesNotMatch(JSON.stringify(calls), /selectedKeys|response|private|Did EV charging/);
});

test('unknown submit tools render no checklist and track no completion event', () => {
  const output = { textContent: '' };
  const clickHandlers = [];
  const submit = { getAttribute: (name) => {
    if (name === 'data-decision-tool-submit' || name === 'data-decision-tool') return 'unknown-tool';
    if (name === 'data-decision-tool-event') return 'lead_magnet_completed';
    return null;
  }, addEventListener: (event, handler) => {
    if (event === 'click') clickHandlers.push(handler);
  } };
  const selection = {
    checked: true,
    getAttribute: (name) => name === 'data-selection-key' ? 'weather' : null,
  };
  const root = {
    querySelectorAll(selector) {
      if (selector === '[data-decision-tool-submit]') return [submit];
      if (selector === '[data-decision-tool-event]') return [submit];
      if (selector === '[data-selection-key]') return [selection];
      return [];
    },
    querySelector() {
      return output;
    },
  };
  const { helper, calls } = loadHelper();

  helper.bind(root, { sbi_content: 'community-post', sbi_entry: 'lead-magnet', sbi_tool: 'unknown-tool' });
  clickHandlers.forEach((handler) => handler());

  assert.equal(output.textContent, '');
  assert.deepEqual(calls.oaiq, []);
  assert.deepEqual(calls.fbq, []);
});

test('track is safe when either pixel function is unavailable', () => {
  const { helper } = loadHelper({ oaiq: undefined, fbq: undefined });
  assert.doesNotThrow(() => helper.track('lead_magnet_viewed', { source: 'organic' }));
});
