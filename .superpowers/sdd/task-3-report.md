# Task 3 Report: Decision Page and Navigation Integration

## Status

Implemented the Task 3 decision-page integration in the assigned files only. No helper internals, privacy-policy.html, or GitHub state were changed.

## Delivered

- Added `before-you-decide.html` with accessible Proposal Preflight and Bill Decoder tabs, broad button-only prompts, local copyable neutral output, no-contact notice, and optional internal Quick Check and booking handoffs.
- Used the approved disclosure verbatim: `Provided by Axia Solar Corp, CSLB #1090641. Axia by Qcells is not SMUD and does not represent SMUD.`
- Added the exact new-page footer identity: `Axia Solar Corp | CSLB #1090641 | HIS #156520 SP`.
- Loaded `organic-attribution.js` before all calls to `SbiAttribution` and used only `read`, `toUrl`, and `eventProperties` through the existing public helpers.
- Sent only the four allowed lead-magnet events through `SbiDecisionTools`; no selected values, checklist text, or homeowner data are included in those event calls.
- Added the Before You Decide home-page path and routed site-owned booking CTAs through `/book.html` while retaining UTM, message, source, and sanitized SBI handoffs.
- Added the Quick Check result-state link without changing its questions, state shape, `smudQualification` session key, or qualification logic.
- Preserved book.html's Meta PageView, Schedule event, source/variant behavior, and Calendar destination while adding sanitized attribution properties.
- Updated SEO tracking to preserve its pixels and paid-campaign URL behavior while appending only allowlisted SBI tags when the attribution helper is available.
- Added the decision-page canonical URL to `sitemap.xml`.

## TDD Evidence

Initial red run:

```text
node --test tests/decision-tools-pages.test.mjs
```

Failed as expected before implementation: the decision page did not exist and the homepage, Quick Check, book, SEO tracking, and sitemap assertions were missing.

Additional red regressions:

- The selected Bill Decoder tab initially left next-action links tagged as `preflight`; a focused static regression test failed before the tab-change URL update was added.
- The new `/book.html` routes initially did not retain the established campaign keys; static coverage failed before page-level UTM/message/source propagation was restored.

Final automated verification:

```text
node --test tests/organic-attribution.test.mjs tests/decision-tools.test.mjs tests/decision-tools-pages.test.mjs
```

Passed: 21 tests, 0 failures.

```text
git diff --check
```

Passed with no whitespace errors.

## Task 3 P2 Attribution-State Fix

Regression test added for the tab-selection refresh path. Initial focused run was red as expected: 12 passing, 1 failing because `updateNextActionUrls()` did not include `.js-quick-check-link`.

Fix applied: the header Quick Check link now refreshes through the same `updateNextActionUrls()` selector as `data-next-action` URLs, using `activeTool` and the existing `nextActionUrl()` legacy-key wrapper.

Focused verification:

```text
node --test tests/decision-tools-pages.test.mjs
```

Passed: 13 tests, 0 failures.

Full verification:

```text
node --test tests/organic-attribution.test.mjs tests/decision-tools.test.mjs tests/decision-tools-pages.test.mjs
```

Passed: 28 tests, 0 failures.

```text
git diff --check
```

Passed with no whitespace errors.

## Browser Verification

Verified locally at `http://localhost:4173`:

- Both accessible tabs render, switch state, and generate only neutral local checklist text.
- Proposal Preflight and Bill Decoder selections render via the public decision-tools API with no console errors.
- Next-action URLs contain only the allowed SBI attribution tags; after choosing Bill Decoder, both URLs use `sbi_tool=bill_decoder`.
- Quick Check booking handoffs preserve `utm_source`, `utm_medium`, `utm_campaign`, `message`, `source`, plus sanitized `sbi_content` and `sbi_entry` values.

## Commit

Local commit created after the final verification:

`feat: add no-contact homeowner decision page`

## Review-Finding Regression Evidence

Initial red run after adding five regression tests:

```text
node --test tests/decision-tools-pages.test.mjs
```

Failed as expected: 6 passing, 5 failing assertions for legacy paid-key forwarding, tracking bootstrap order, deferred SEO attribution loading, homepage placement, and initial tab focusability.

Final green run:

```text
node --test tests/organic-attribution.test.mjs tests/decision-tools.test.mjs tests/decision-tools-pages.test.mjs
```

Passed: 26 tests, 0 failures.

```text
git diff --check
```

Passed with no whitespace errors.

## Final Task 3 Review Finding

Initial focused red run:

```text
node --test tests/decision-tools-pages.test.mjs
```

Failed as expected: 11 passing, 2 failing assertions for the homepage header Before You Decide link and Before You Decide header Quick Check link.

Fix applied: both header links now use the existing explicit allowlisted legacy-campaign wrappers, preserving sanitized SBI tags while excluding arbitrary parameters, answers, and fragments.

Final verification:

```text
node --test tests/organic-attribution.test.mjs tests/decision-tools.test.mjs tests/decision-tools-pages.test.mjs
```

Passed: 28 tests, 0 failures.

```text
git diff --check
```

Passed with no whitespace errors.
