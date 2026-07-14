(function (window) {
  'use strict';

  var CONTENT_PATTERN = /^C-\d{8}-\d{3}$/;
  var CLICK_REFERENCE_PATTERN = /^[A-Za-z0-9._~-]{1,256}$/;
  var ENTRIES = Object.freeze({ organic: true, paid: true, seo: true, direct: true });
  var TOOLS = Object.freeze({ preflight: true, bill_decoder: true, quick_check: true });
  var PAID_MEDIA = Object.freeze({
    cpc: true,
    cpm: true,
    cpa: true,
    cpv: true,
    ppc: true,
    paid: true,
    paid_ai: true,
    paid_search: true,
    paid_social: true,
    display: true,
    retargeting: true
  });
  var STORAGE_KEY = 'sbi_anonymous_attribution';

  function validContent(value) {
    return typeof value === 'string' && CONTENT_PATTERN.test(value) ? value : null;
  }

  function validEntry(value) {
    return typeof value === 'string' && ENTRIES[value] ? value : null;
  }

  function validTool(value) {
    return typeof value === 'string' && TOOLS[value] ? value : null;
  }

  function validClickReference(value) {
    return typeof value === 'string' && CLICK_REFERENCE_PATTERN.test(value) ? value : null;
  }

  function sanitize(input) {
    var tags = {};
    if (!input || typeof input !== 'object') return tags;

    var content = validContent(input.sbi_content);
    var entry = validEntry(input.sbi_entry);
    var tool = validTool(input.sbi_tool);
    var clickReference = validClickReference(input.oppref);
    if (content) tags.sbi_content = content;
    if (entry) tags.sbi_entry = entry;
    if (tool) tags.sbi_tool = tool;
    if (clickReference) tags.oppref = clickReference;
    return tags;
  }

  function readStored() {
    try {
      var raw = window.sessionStorage && window.sessionStorage.getItem(STORAGE_KEY);
      return raw ? sanitize(JSON.parse(raw)) : {};
    } catch (error) {
      return {};
    }
  }

  function writeStored(tags) {
    try {
      if (window.sessionStorage) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
    } catch (error) {
      // Attribution must not prevent the page from rendering when storage is blocked.
    }
  }

  function read(search, pageSlug) {
    void pageSlug;
    var params;
    try {
      params = new URLSearchParams(search || '');
    } catch (error) {
      params = new URLSearchParams('');
    }

    var stored = readStored();
    var tags = sanitize({
      sbi_content: params.get('sbi_content') || stored.sbi_content,
      sbi_entry: params.get('sbi_entry') || stored.sbi_entry,
      sbi_tool: params.get('sbi_tool') || stored.sbi_tool,
      oppref: params.get('oppref') || stored.oppref
    });
    var medium = (params.get('utm_medium') || '').toLowerCase();
    var requestedEntry = params.get('sbi_entry');
    if (!requestedEntry && stored.sbi_entry) {
      tags.sbi_entry = stored.sbi_entry;
    } else if (!validEntry(requestedEntry)) {
      tags.sbi_entry = PAID_MEDIA[medium] ? 'paid' : 'direct';
    }

    writeStored(tags);
    return tags;
  }

  function toUrl(path, tags) {
    var target = new URL(path || '/', window.location.origin);
    var query = new URLSearchParams();
    var safeTags = sanitize(tags);
    Object.keys(safeTags).forEach(function (key) {
      query.set(key, safeTags[key]);
    });
    var result = target.pathname + (query.toString() ? '?' + query.toString() : '');
    return result;
  }

  function eventProperties(tags) {
    var safeTags = sanitize(tags);
    var properties = {};
    ['sbi_content', 'sbi_entry', 'sbi_tool'].forEach(function (key) {
      if (safeTags[key]) properties[key] = safeTags[key];
    });
    return properties;
  }

  window.SbiAttribution = Object.freeze({
    read: read,
    toUrl: toUrl,
    eventProperties: eventProperties
  });
}(window));
