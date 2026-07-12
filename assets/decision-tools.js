(function (window) {
  'use strict';

  var PREFLIGHT = {
    scope: {
      title: 'Scope',
      prompts: [
        'Confirm the written scope, equipment, backed-up loads, electrical work, and exclusions.',
      ],
    },
    assumptions: {
      title: 'Assumptions',
      prompts: [
        'Ask what usage history and planned home or transportation changes were considered.',
      ],
    },
    agreement: {
      title: 'Agreement',
      prompts: [
        'Confirm ownership or financing terms, the warranty and service path, and important conditions in the agreement.',
      ],
    },
    process: {
      title: 'Process',
      prompts: [
        'Ask about site survey, permitting, utility interconnection, commissioning, and the records the homeowner will receive.',
      ],
    },
  };

  var BILL_DECODER = {
    weather: 'Did you compare like billing periods, and did weather change?',
    ev: 'Did EV charging change during the billing period?',
    hvac: 'Did heating or cooling use change during the billing period?',
    pool_spa: 'Did pool or spa use change during the billing period?',
    household: 'Did household size, occupancy, or appliance use change?',
    existing_solar: 'Did existing solar equipment or its operation change?',
    usage_timing: 'When did energy use happen, and did its timing change?',
  };

  var EVENTS = {
    lead_magnet_viewed: true,
    lead_magnet_started: true,
    lead_magnet_completed: true,
    lead_magnet_cta_clicked: true,
  };

  function keysFrom(selection) {
    return Array.isArray(selection) ? selection : [];
  }

  function buildPreflight(selectedKeys) {
    return keysFrom(selectedKeys).reduce(function (sections, key) {
      var section = PREFLIGHT[key];
      if (section) {
        sections.push({
          key: key,
          title: section.title,
          prompts: section.prompts.slice(),
        });
      }
      return sections;
    }, []);
  }

  function buildBillDecoder(selectedKeys) {
    return keysFrom(selectedKeys).reduce(function (prompts, key) {
      if (BILL_DECODER[key]) {
        prompts.push({ key: key, text: BILL_DECODER[key] });
      }
      return prompts;
    }, []);
  }

  function attributionProperties(tags) {
    var attribution = window.SbiAttribution;
    if (!attribution || typeof attribution.eventProperties !== 'function') return {};
    try {
      var properties = attribution.eventProperties(tags) || {};
      var sanitized = {};
      ['sbi_content', 'sbi_entry', 'sbi_tool'].forEach(function (key) {
        if (Object.prototype.hasOwnProperty.call(properties, key)) sanitized[key] = properties[key];
      });
      return sanitized;
    } catch (error) {
      return {};
    }
  }

  function track(eventName, tags) {
    if (!EVENTS[eventName]) return;
    var properties = attributionProperties(tags);
    if (typeof window.oaiq === 'function') {
      window.oaiq('measure', 'custom', { type: 'custom' }, { custom_event_name: eventName });
    }
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, properties);
    }
  }

  function isSelected(element) {
    return element.checked === true || element.getAttribute('aria-pressed') === 'true';
  }

  function selectedKeys(root) {
    var selected = [];
    if (!root || typeof root.querySelectorAll !== 'function') return selected;
    root.querySelectorAll('[data-selection-key]').forEach(function (element) {
      if (isSelected(element)) selected.push(element.getAttribute('data-selection-key'));
    });
    return selected;
  }

  function isKnownTool(tool) {
    return tool === 'preflight' || tool === 'bill_decoder';
  }

  function render(root, tool, keys) {
    if (!root || typeof root.querySelector !== 'function') return;
    var output = root.querySelector('[data-decision-tool-output="' + tool + '"]') || root.querySelector('[data-decision-tool-output]');
    if (!output) return;
    var items;
    if (tool === 'preflight') {
      items = buildPreflight(keys);
    } else if (tool === 'bill_decoder') {
      items = buildBillDecoder(keys);
    } else {
      return;
    }
    var lines = [];
    items.forEach(function (item) {
      if (item.prompts) {
        lines.push(item.title + ':');
        item.prompts.forEach(function (prompt) { lines.push('- ' + prompt); });
      } else {
        lines.push('- ' + item.text);
      }
    });
    output.textContent = lines.join('\n');
  }

  function bind(root, tags) {
    if (!root || typeof root.querySelectorAll !== 'function') return root;
    root.querySelectorAll('[data-decision-tool-event]').forEach(function (element) {
      element.addEventListener('click', function () {
        var tool = element.getAttribute('data-decision-tool-submit') || element.getAttribute('data-decision-tool');
        if (tool && !isKnownTool(tool)) return;
        track(element.getAttribute('data-decision-tool-event'), tags);
      });
    });
    root.querySelectorAll('[data-decision-tool-submit]').forEach(function (element) {
      element.addEventListener('click', function () {
        var tool = element.getAttribute('data-decision-tool-submit');
        render(root, tool, selectedKeys(root));
      });
    });
    return root;
  }

  window.SbiDecisionTools = {
    buildPreflight: buildPreflight,
    buildBillDecoder: buildBillDecoder,
    track: track,
    bind: bind,
  };
}(window));
