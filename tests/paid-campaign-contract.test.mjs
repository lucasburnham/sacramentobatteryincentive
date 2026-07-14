import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('OpenAI campaign uses one intent-specific destination per creative', () => {
  const campaign = read('../marketing/chatgpt-openai-ads-campaign.md');
  const destinations = [
    'https://sacramentobatteryincentive.com/smud-solar-and-storage-rate.html?utm_source=openai&utm_medium=paid_ai&utm_campaign=smud_battery_sacramento&utm_content=peak_hours&message=peak_rate',
    'https://sacramentobatteryincentive.com/battery-backup-sacramento.html?utm_source=openai&utm_medium=paid_ai&utm_campaign=smud_battery_sacramento&utm_content=backup_power&message=backup',
    'https://sacramentobatteryincentive.com/smud-battery-incentive.html?utm_source=openai&utm_medium=paid_ai&utm_campaign=smud_battery_sacramento&utm_content=incentive_check&message=incentive',
    'https://sacramentobatteryincentive.com/solar-battery-storage-sacramento.html?utm_source=openai&utm_medium=paid_ai&utm_campaign=smud_battery_sacramento&utm_content=solar_battery&message=solar_battery'
  ];

  destinations.forEach((url) => assert.ok(campaign.includes(url), `missing ${url}`));
  assert.doesNotMatch(campaign, /https:\/\/sacramentobatteryincentive\.com\/\?utm_source=/);
});

test('campaign and homepage use the approved SMUD incentive wording', () => {
  const campaign = read('../marketing/chatgpt-openai-ads-campaign.md');
  const homepage = read('../index.html');
  const incentiveLandingPage = read('../smud-battery-incentive.html');
  const approvedPhrase = /one-time enrollment incentive (?:of )?up to \$10,000/i;

  assert.match(campaign, approvedPhrase);
  assert.match(homepage, approvedPhrase);
  assert.match(incentiveLandingPage, approvedPhrase);
  assert.match(campaign, /eligible new battery systems/i);
  assert.match(incentiveLandingPage, /eligible new battery systems/i);
  assert.match(campaign, /Axia (?:Solar|by Qcells) is not SMUD/i);
});

test('paid acquisition materials contain no expired federal credit messaging', () => {
  const acquisitionCopy = [
    '../index.html',
    '../quick-check.html',
    '../battery-backup-sacramento.html',
    '../smud-battery-incentive.html',
    '../smud-solar-and-storage-rate.html',
    '../solar-battery-storage-sacramento.html',
    '../marketing/chatgpt-openai-ads-campaign.md'
  ].map(read).join('\n');

  assert.doesNotMatch(acquisitionCopy, /\b(?:IRS|federal|ITC)\b|30%\s+(?:credit|tax)/i);
});
