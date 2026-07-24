import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const disclosure = 'Provided by Axia Solar Corp, CSLB #1090641. Axia by Qcells is not SMUD and does not represent SMUD.';
const contractorIdentity = 'Axia Solar Corp | CSLB #1090641 | HIS #156520 SP';
const extractFooters = (source) => [...source.matchAll(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi)].map(([footer]) => footer);

test('public pages identify the contractor and privacy policy discloses anonymous measurement tags', () => {
  [
    '../privacy-policy.html',
    '../index.html',
    '../quick-check.html',
    '../book.html',
    '../before-you-decide.html'
  ].forEach((path) => {
    const footers = extractFooters(read(path));
    assert.ok(footers.length > 0, `${path} includes a semantic footer`);
    footers.forEach((footer, index) => assert.ok(footer.includes(contractorIdentity), `${path} footer ${index + 1} contains the approved contractor identity in its own content`));
  });

  const privacyPolicy = read('../privacy-policy.html');
  assert.match(privacyPolicy, /We use the OpenAI Ads measurement pixel to understand advertising performance and site usage\./);
  assert.match(privacyPolicy, /We use existing OpenAI and Meta measurement tools to understand page use and advertising performance\./);
  assert.match(privacyPolicy, /published content identifier, entry type, and educational tool name/);
  assert.match(privacyPolicy, /do not include your answers, utility account information, address, bill amount, or proposal content/);

  [
    '../privacy-policy.html',
    '../index.html',
    '../quick-check.html',
    '../book.html',
    '../before-you-decide.html'
  ].forEach((path) => {
    const page = read(path);
    assert.doesNotMatch(page, /HIS #156520 SP[^<.]{0,120}(?:CSLB|contractor(?:'s)? license)/i, `${path} does not describe HIS #156520 SP as a CSLB or contractor license`);
    assert.doesNotMatch(page, /(?:CSLB[^#<.]{0,40}license|contractor(?:'s)? license)[^<.]{0,120}HIS #156520 SP/i, `${path} does not describe HIS #156520 SP as a CSLB or contractor license`);
  });
});

test('Before You Decide is a no-contact decision page with neutral tool integrations', () => {
  const page = read('../before-you-decide.html');

  assert.match(page, /Proposal Preflight/);
  assert.match(page, /Bill Decoder/);
  assert.ok(page.includes(disclosure));
  assert.ok(page.includes(contractorIdentity));
  assert.match(page, /assets\/organic-attribution\.js/);
  assert.match(page, /assets\/decision-tools\.js/);
  assert.doesNotMatch(page, /<(?:form|input|textarea|select)\b|type\s*=\s*["']file["']|mailto:|https?:\/\/[^"']*(?:contact|lead|submit)/i);
  assert.match(page, /href=["']\/quick-check\.html/);
  assert.match(page, /href=["']\/book\.html/);
  assert.doesNotMatch(page, /calendar\.app\.google/i);
  assert.match(page, /SbiAttribution\.read\(location\.search,\s*["']before_you_decide["']\)/);
  assert.match(page, /lead_magnet_viewed/);
  assert.match(page, /SbiDecisionTools\.(?:track|bind)/);
  assert.match(page, /function updateNextActionUrls\(/);
  assert.match(page, /function setActive\(tool\)\{[\s\S]*?updateNextActionUrls\(\)/);
});

test('Before You Decide forwards only established paid keys alongside sanitized attribution', () => {
  const page = read('../before-you-decide.html');

  assert.match(page, /function nextActionUrl\(path,tool\)/);
  assert.match(page, /var legacyKeys=\['utm_source','utm_medium','utm_campaign','utm_content','utm_term','message','source'\]/);
  assert.match(page, /var url=new URL\(SbiAttribution\.toUrl\(path,tagsFor\(tool\)\),location\.origin\)/);
  assert.match(page, /legacyKeys\.forEach\(function\(key\)\{var value=currentParams\.get\(key\);if\(value\)url\.searchParams\.set\(key,value\)\}\)/);
  assert.doesNotMatch(page, /currentParams\.forEach|location\.hash/);
});

test('Before You Decide initializes the existing site tracking after attribution', () => {
  const page = read('../before-you-decide.html');
  const organicIndex = page.indexOf('/assets/organic-attribution.js');
  const trackingIndex = page.indexOf('/assets/seo-tracking.js');
  const toolsIndex = page.indexOf('/assets/decision-tools.js');

  assert.match(page, /<body data-page="before_you_decide">/);
  assert.ok(organicIndex >= 0 && organicIndex < trackingIndex && trackingIndex < toolsIndex);
});

test('Before You Decide places the required disclosure immediately after its H1', () => {
  const page = read('../before-you-decide.html');

  assert.match(page, /<h1>Before You Decide<\/h1>\s*<p class="disclosure">[\s\S]*?<\/p>\s*<p class="intro-copy">/);
});

test('homepage exposes Before You Decide beside Quick Check and uses the booking handoff', () => {
  const page = read('../index.html');

  assert.match(page, /Before You Decide/);
  assert.match(page, /before-you-decide\.html/);
  assert.match(page, /assets\/organic-attribution\.js/);
  assert.match(page, /SbiAttribution\.toUrl\(['"]\/before-you-decide\.html/);
  assert.match(page, /["']source["']/);
  assert.match(page, /querySelectorAll\("\.js-booking-link"\)\.forEach\(function\(link\)\{link\.href=withCurrentParams/);
  assert.doesNotMatch(page, /href=["']https:\/\/calendar\.app\.google\/oNAhhCBMu13PSRtc7/);
  assert.match(page, /href=["']\/book\.html/);
  assert.doesNotMatch(page, /appointment_scheduled/);
  assert.match(page, /["']sbi_content["'],["']sbi_entry["'],["']sbi_tool["'],["']oppref["']/);
});

test('homepage does not dereference the removed year element before wiring handoffs', () => {
  const page = read('../index.html');

  assert.doesNotMatch(page, /document\.getElementById\(["']year["']\)\.textContent/);
});

test('homepage places Before You Decide beneath the Quick Check section', () => {
  const page = read('../index.html');

  assert.ok(page.indexOf('id="before-you-decide-title"') > page.indexOf('See whether a battery is worth a closer look.'));
});

test('homepage header Before You Decide link uses the allowlisted attribution wrapper', () => {
  const page = read('../index.html');

  assert.match(page, /<a[^>]+class="[^"]*js-before-you-decide-link[^"]*"[^>]+href="\/before-you-decide\.html"[^>]*>Before You Decide<\/a>/);
  assert.match(page, /querySelectorAll\("\.js-before-you-decide-link"\)\.forEach\(function\(link\)\{link\.href=withCurrentParams\(SbiAttribution\.toUrl\("\/before-you-decide\.html",sbiAttributionTags\)\)\}\)/);
});

test('Before You Decide header Quick Check link uses the allowlisted attribution wrapper', () => {
  const page = read('../before-you-decide.html');

  assert.match(page, /<a[^>]+class="[^"]*js-quick-check-link[^"]*"[^>]+href="\/quick-check\.html"[^>]*>Quick Check<\/a>/);
  assert.match(page, /querySelectorAll\('\.js-quick-check-link'\)\.forEach\(function\(link\)\{link\.href=nextActionUrl\(link\.getAttribute\('href'\),activeTool\)\}\)/);
  assert.match(page, /function reviewActionUrl\(tool\)\{var url=new URL\(SbiAttribution\.toUrl\('\/book\.html',tagsFor\(tool\)\),location\.origin\);return url\.pathname\+url\.search\}/);
  assert.match(page, /document\.querySelectorAll\('\[data-review-action\]'\)\.forEach\(function\(link\)\{link\.href=reviewActionUrl\(link\.dataset\.reviewAction\)\}\)/);
});

test('Quick Check keeps its qualification state machine and adds sanitized decision and booking handoffs', () => {
  const page = read('../quick-check.html');

  assert.match(page, /smudQualification/);
  assert.match(page, /Before You Decide/);
  assert.match(page, /before-you-decide\.html/);
  assert.match(page, /SbiAttribution\.toUrl\(path,\s*sbiAttributionTags\)/);
  assert.match(page, /["']utm_source["'],["']utm_medium["'],["']utm_campaign["'],["']utm_content["'],["']utm_term["'],["']message["'],["']source["']/);
  assert.match(page, /href=["']\/book\.html/);
  assert.doesNotMatch(page, /href=["']https:\/\/calendar\.app\.google\/oNAhhCBMu13PSRtc7/);
  assert.doesNotMatch(page, /appointment_scheduled/);
  assert.match(page, /["']sbi_content["'],["']sbi_entry["'],["']sbi_tool["'],["']oppref["']/);
});

test('booking records an affirmative Calendar handoff without claiming a scheduled appointment', () => {
  const page = read('../book.html');

  assert.match(page, /897444143385193/);
  assert.match(page, /fbq\(["']track["'],\s*["']PageView["']\)/);
  assert.match(page, /calendarLink\.addEventListener\(["']click["']/);
  assert.match(page, /fbq\(["']track["'],\s*["']Schedule["']/);
  assert.doesNotMatch(page, /BookingIntent/);
  assert.doesNotMatch(page, /setTimeout\([^)]*location\.href/);
  assert.doesNotMatch(page, /appointment_scheduled/);
  assert.match(page, /https:\/\/calendar\.app\.google\/oNAhhCBMu13PSRtc7/);
  assert.match(page, /assets\/organic-attribution\.js/);
  assert.match(page, /SbiAttribution\.read/);
});

test('SEO tracking retains pixels and keeps internal attribution allowlisted', () => {
  const source = read('../assets/seo-tracking.js');

  assert.match(source, /RxXCMNBMFuUL7hstTXrvD9/);
  assert.match(source, /897444143385193/);
  assert.match(source, /SbiAttribution\.read/);
  assert.match(source, /SbiAttribution\.toUrl/);
  assert.match(source, /\/quick-check\.html/);
  assert.match(source, /\/book\.html/);
  assert.doesNotMatch(source, /searchParams\.forEach|params\.forEach/);
  assert.match(source, /oaiq\('measure','custom',\{type:'custom'\},\{custom_event_name:n\}\)/);
  assert.doesNotMatch(source, /custom_event_name:n,event_id/);
  assert.doesNotMatch(source, /oaiq\([^\n]*event_id/);
});

test('SEO tracking uses a constant variant for the decision page', () => {
  const source = read('../assets/seo-tracking.js');

  assert.match(source, /var sbiPageSlug=document\.body\.dataset\.page\|\|'';var msg=.*?;window\.sbiVariant=sbiPageSlug==='before_you_decide'\?'decision_tools':/);
});

test('SEO tracking defers organic attribution loading without replacing paid propagation', () => {
  const source = read('../assets/seo-tracking.js');

  assert.match(source, /function loadOrganicAttribution\(\)/);
  assert.match(source, /script\.src='\/assets\/organic-attribution\.js'/);
  assert.match(source, /script\.onload=function\(\)\{rewriteInternalTrackingLinks\(\)\}/);
  assert.match(source, /function rewriteInternalTrackingLinks\(\)\{if\(!window\.SbiAttribution\)return/);
  assert.match(source, /rewriteInternalTrackingLinks\(\);loadOrganicAttribution\(\)/);
});

test('only the active decision tab is initially focusable', () => {
  const page = read('../before-you-decide.html');

  assert.match(page, /id="preflight-tab"[^>]*aria-selected="true"[^>]*tabindex="0"/);
  assert.match(page, /id="bill-decoder-tab"[^>]*aria-selected="false"[^>]*tabindex="-1"/);
});

test('sitemap includes the decision page canonical URL', () => {
  const sitemap = read('../sitemap.xml');
  assert.match(sitemap, /https:\/\/sacramentobatteryincentive\.com\/before-you-decide\.html/);
});
