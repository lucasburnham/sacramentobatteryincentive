import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';

const helperSource = fs.readFileSync(new URL('../assets/organic-attribution.js', import.meta.url), 'utf8');
const plain = (value) => JSON.parse(JSON.stringify(value));

function loadHelper({ searchStorage = true } = {}) {
  const values = new Map();
  const sessionStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value))
  };
  const context = {
    URL,
    URLSearchParams,
    window: {
      location: { origin: 'https://example.test' },
      sessionStorage: searchStorage ? sessionStorage : {
        getItem() { throw new Error('blocked'); },
        setItem() { throw new Error('blocked'); }
      }
    }
  };
  vm.runInNewContext(helperSource, context);
  return { api: context.window.SbiAttribution, values };
}

test('read preserves a valid content ID and approved tags', () => {
  const { api, values } = loadHelper();
  const tags = plain(api.read(
    '?sbi_content=C-20260712-001&sbi_entry=organic&sbi_tool=quick_check',
    'quick_check'
  ));

  assert.deepEqual(tags, {
    sbi_content: 'C-20260712-001',
    sbi_entry: 'organic',
    sbi_tool: 'quick_check'
  });
  assert.deepEqual(JSON.parse(values.get('sbi_anonymous_attribution')), tags);
});

test('read preserves a valid OpenAI click reference for downstream attribution', () => {
  const { api, values } = loadHelper();
  const tags = plain(api.read(
    '?utm_medium=paid_ai&oppref=opp_AbC-123._~&sbi_tool=quick_check',
    'quick_check'
  ));

  assert.deepEqual(tags, {
    sbi_entry: 'paid',
    sbi_tool: 'quick_check',
    oppref: 'opp_AbC-123._~'
  });
  assert.equal(JSON.parse(values.get('sbi_anonymous_attribution')).oppref, 'opp_AbC-123._~');
});

test('read rejects malformed and oversized OpenAI click references', () => {
  const { api } = loadHelper();

  assert.deepEqual(
    plain(api.read('?oppref=contains%20spaces', 'home')),
    { sbi_entry: 'direct' }
  );
  assert.deepEqual(
    plain(api.read('?oppref=' + 'a'.repeat(257), 'home')),
    { sbi_entry: 'direct' }
  );
});

test('read rejects malformed content IDs and unknown enum values', () => {
  const { api } = loadHelper();
  const tags = plain(api.read(
    '?sbi_content=proposal-123&sbi_entry=affiliate&sbi_tool=calculator',
    'before_you_decide'
  ));

  assert.deepEqual(tags, { sbi_entry: 'direct' });
});

test('paid UTM media normalizes an unapproved entry to paid', () => {
  const { api } = loadHelper();
  assert.deepEqual(
    plain(api.read('?utm_medium=cpc&sbi_entry=affiliate', 'home')),
    { sbi_entry: 'paid' }
  );
  assert.deepEqual(
    plain(api.read('?utm_medium=organic&sbi_entry=affiliate', 'home')),
    { sbi_entry: 'direct' }
  );
});

test('read preserves a stored entry when the next URL omits it', () => {
  const { api } = loadHelper();
  plain(api.read('?sbi_entry=organic&sbi_tool=quick_check', 'quick_check'));

  assert.deepEqual(
    plain(api.read('?sbi_tool=preflight', 'before_you_decide')),
    { sbi_entry: 'organic', sbi_tool: 'preflight' }
  );
});

test('toUrl copies only validated attribution tags into a relative URL', () => {
  const { api } = loadHelper();
  const url = api.toUrl('/book.html', {
    sbi_content: 'C-20260712-001',
    sbi_entry: 'organic',
    sbi_tool: 'preflight',
    bill: '999',
    address: '123 Main St',
    campaign: 'leak'
  });

  assert.equal(url, '/book.html?sbi_content=C-20260712-001&sbi_entry=organic&sbi_tool=preflight');
  for (const forbidden of ['bill', 'zip', 'city', 'address', 'proposal', 'referrer', 'campaign']) {
    assert.equal(url.includes(forbidden), false, `URL leaked ${forbidden}`);
  }
});

test('toUrl forwards a validated OpenAI click reference', () => {
  const { api } = loadHelper();

  assert.equal(
    api.toUrl('/book.html', {
      sbi_entry: 'paid',
      oppref: 'opp_AbC-123._~',
      email: 'private@example.test'
    }),
    '/book.html?sbi_entry=paid&oppref=opp_AbC-123._%7E'
  );
});

test('toUrl discards caller query strings and hash fragments', () => {
  const { api } = loadHelper();
  assert.equal(
    api.toUrl('/book.html?bill=999#bill=999', {
      sbi_content: 'C-20260712-001',
      sbi_entry: 'organic',
      sbi_tool: 'preflight'
    }),
    '/book.html?sbi_content=C-20260712-001&sbi_entry=organic&sbi_tool=preflight'
  );
});

test('eventProperties returns only validated non-identifying tags', () => {
  const { api } = loadHelper();
  assert.deepEqual(
    { ...api.eventProperties({
      sbi_content: 'C-20260712-001',
      sbi_entry: 'organic',
      sbi_tool: 'bill_decoder',
      oppref: 'opp_AbC-123._~',
      bill: '999',
      zip: '95814',
      referrer: 'https://bad.test'
    }) },
    {
      sbi_content: 'C-20260712-001',
      sbi_entry: 'organic',
      sbi_tool: 'bill_decoder'
    }
  );
});

test('blocked session storage does not break reading or URL generation', () => {
  const { api } = loadHelper({ searchStorage: false });
  const tags = plain(api.read('?sbi_content=C-20260712-001&sbi_entry=seo', 'home'));

  assert.deepEqual(tags, { sbi_content: 'C-20260712-001', sbi_entry: 'seo' });
  assert.equal(api.toUrl('/quick-check.html', tags), '/quick-check.html?sbi_content=C-20260712-001&sbi_entry=seo');
});
