# Task 4 Privacy and Identity Report

## Scope

- Added the approved contractor identity text to the assigned public-page identity/footer locations. `before-you-decide.html` already contained the required identity and its required decision-page disclosure, so it was intentionally left unchanged.
- Added privacy wording in the existing automatic-measurement section without removing the existing disclosure.
- Did not modify tracking helpers, booking attribution behavior, Calendar URL, Quick Check state/logic, sitemap, or GitHub.

## Red/Green Evidence

- RED: `node --test tests/decision-tools-pages.test.mjs` failed as intended before public copy changes. The new test reported that `privacy-policy.html` did not include `Axia Solar Corp | CSLB #1090641 | HIS #156520 SP`.
- GREEN: the same focused command passed after the copy changes: 14 tests passed, 0 failed.
- Full suite: `node --test tests/organic-attribution.test.mjs tests/decision-tools.test.mjs tests/decision-tools-pages.test.mjs` passed: 29 tests passed, 0 failed.
- `git diff --check` completed with no whitespace errors.

## Compliance Audits

- Pixel audit confirmed the existing OpenAI pixel ID `RxXCMNBMFuUL7hstTXrvD9` and Meta pixel ID `897444143385193` remain in their existing pages/tracking file.
- Attribution audit found only neutral decision-tool dictionary wording; attribution/event logic remains restricted to the established sanitized tags.
- Decision-tool claim audit found no unsupported savings, payback, incentive, guarantee, or SMUD-affiliation claims in `before-you-decide.html` or `assets/decision-tools.js`.
- The exact decision-page disclosure remains: `Provided by Axia Solar Corp, CSLB #1090641. Axia by Qcells is not SMUD and does not represent SMUD.`

## Browser Checks

- Desktop: `/before-you-decide.html?sbi_content=C-20260712-001&sbi_entry=organic` rendered both tabs and sequential page sections without overlap; no contact fields were present.
- Tab behavior: selecting Bill Decoder made its panel visible, hid Proposal Preflight, and preserved only `sbi_content`, `sbi_entry`, and `sbi_tool=bill_decoder` in the Quick Check and booking handoff URLs.
- Mobile: at 390 x 844, the tabs stacked without overlap and the optional next actions remained usable; no contact fields were present.
- Booking handoff: `/book.html` retained `https://calendar.app.google/oNAhhCBMu13PSRtc7` as the calendar destination and displayed the approved identity text.

## Task 4 Test-Coverage Finding Resolution

- RED: after strengthening `tests/decision-tools-pages.test.mjs`, `node --test tests/decision-tools-pages.test.mjs` failed only the public-page identity test for `../book.html` because its existing identity was not inside a semantic `<footer>`; the other 13 tests passed.
- GREEN: after wrapping the existing Book identity paragraph in a semantic footer, the focused suite passed: 14 tests passed, 0 failed.
- Added coverage now proves the exact contractor identity appears inside a semantic footer on privacy policy, homepage, Quick Check, Book, and Before You Decide; preserves the existing sentence containing `OpenAI Ads measurement pixel`; and rejects descriptions that characterize `HIS #156520 SP` as a CSLB or contractor license.
- Full suite: `node --test tests/organic-attribution.test.mjs tests/decision-tools.test.mjs tests/decision-tools-pages.test.mjs` passed: 29 tests passed, 0 failed.
- `git diff --check` completed with no whitespace errors.

## Task 4 Test-Quality Finding Resolution

- RED: temporarily removing `Meta` from the privacy-policy measurement sentence caused the focused suite to fail the explicit Meta disclosure assertion: 13 passed, 1 failed.
- RED: temporarily adding a second footer without the contractor identity caused the focused suite to fail on `privacy-policy.html footer 2`; the check did not accept identity text spanning footer boundaries: 13 passed, 1 failed.
- GREEN: restored the production source and ran `node --test tests/decision-tools-pages.test.mjs`: 14 tests passed, 0 failed.
- Full suite: `node --test tests/organic-attribution.test.mjs tests/decision-tools.test.mjs tests/decision-tools-pages.test.mjs`: 29 tests passed, 0 failed.
- `git diff --check` completed with no whitespace errors after restoring all temporary source mutations.
