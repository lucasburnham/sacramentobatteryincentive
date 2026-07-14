# Paid Media Control Loop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make OpenAI Ads and Meta Ads operate from verified scheduled and showed appointments while enforcing a dynamically allocated $50 daily ceiling.

**Architecture:** The public site carries allowlisted campaign attribution into a booking-intent handoff. Google Calendar and the existing Google Sheets CRM establish appointment truth. A daily control loop joins CRM outcomes to platform spend, logs its decision, and applies bounded budget changes.

**Tech Stack:** Static HTML and JavaScript, Node.js built-in test runner, GitHub Pages, Google Sheets, Google Calendar, OpenAI Ads Manager, Meta Marketing API, Codex automations.

## Global Constraints

- Total OpenAI plus Meta configured budget must never exceed $50 per day.
- Maximum acceptable scheduled CPA is $500.
- Maximum acceptable showed CPA is $500.
- Do not use federal tax-credit messaging.
- `calendar_booking_clicked` and Meta `BookingIntent` are diagnostics, not scheduled appointments.
- Google Calendar plus CRM status are the appointment source of truth.
- Archive the legacy roofing and insurance campaign.

---

### Task 1: Correct the website event contract

**Files:**
- Modify: `assets/organic-attribution.js`
- Modify: `assets/seo-tracking.js`
- Modify: `book.html`
- Modify: `tests/organic-attribution.test.mjs`
- Modify: `tests/decision-tools-pages.test.mjs`

**Interfaces:**
- Consumes: URL query parameters and the existing `SbiAttribution` namespace.
- Produces: sanitized `oppref` propagation and booking-intent-only browser events.

- [ ] Add failing tests that require a length-bounded `oppref`, reject malformed click references, and reject a Meta `Schedule` event on `book.html`.
- [ ] Run `node --test tests/organic-attribution.test.mjs tests/decision-tools-pages.test.mjs` and verify the new assertions fail for the missing behavior.
- [ ] Add `oppref` to the attribution allowlist and internal link propagation.
- [ ] Change `book.html` to emit `BookingIntent`, never `Schedule` or `appointment_scheduled`.
- [ ] Keep OpenAI custom-event names and event options in the exact Ads Manager Pixel contract.
- [ ] Run the focused tests and verify they pass.

### Task 2: Lock the paid landing routes and claim language

**Files:**
- Modify: `marketing/chatgpt-openai-ads-campaign.md`
- Modify: `tests/decision-tools-pages.test.mjs`

**Interfaces:**
- Consumes: the four existing intent landing pages.
- Produces: exact static destination URLs and compliant ad-copy specifications.

- [ ] Add failing assertions for the four destination paths, unique `utm_content` values, exact `one-time enrollment incentive` wording, and absence of federal tax-credit copy.
- [ ] Run the focused test and verify it fails.
- [ ] Replace homepage destinations with intent-specific routes and update conversion semantics in the campaign document.
- [ ] Run the focused test and full test suite.

### Task 3: Extend the existing CRM

**Files:**
- Live artifact: Google Sheet `Solar_Deal_CRM_Imported`

**Interfaces:**
- Consumes: paid lead attribution, Google Calendar consultation events, and platform performance.
- Produces: `Paid Leads`, `Appointments`, and `Paid Media Control` tabs.

- [ ] Re-read spreadsheet metadata and the target CRM ranges immediately before writing.
- [ ] Add the three tabs with frozen headers, filters, width constraints, and native spreadsheet styling.
- [ ] Add strict status dropdowns to appointment and event-delivery columns.
- [ ] Add formulas for scheduled CPA, showed CPA, combined budget, ceiling state, and evidence-gate state.
- [ ] Write the $50 ceiling, $500 CPA thresholds, $25 / $25 initial split, $10 / $40 bounds, $5 movement cap, and five-appointment evidence gate.
- [ ] Read back exact header and control ranges and verify formulas and validation.

### Task 4: Reconcile calendar appointments

**Files:**
- Live artifacts: Google Calendar and CRM `Appointments` tab.

**Interfaces:**
- Consumes: calendar events matching `Free In-Home Solar + Battery Consultation`.
- Produces: deduplicated scheduled appointment rows keyed by calendar event ID.

- [ ] Search a bounded calendar window for consultation events.
- [ ] Exclude unrelated solar events and recurring training events.
- [ ] Match appointments to paid leads by normalized email first, then phone.
- [ ] Insert unmatched consultations with platform `Unknown` rather than fabricating attribution.
- [ ] Verify no calendar event ID appears more than once.

### Task 5: Update OpenAI Ads

**Files:**
- Live artifact: OpenAI Ads account `adacct_6a1f24b4d01881a08de163ed07ac2fab`.

**Interfaces:**
- Consumes: Task 2 destination URLs and Task 1 measurement contract.
- Produces: three intent groups, four routed ads, and corrected conversion configuration.

- [ ] Inspect Pixel warnings and the Ads Manager installation snippets before changing the site contract.
- [ ] Make `Appointment Scheduled` the primary outcome only if a matched server event can be sent; otherwise keep the campaign on clicks and treat booking intent as secondary.
- [ ] Split backup, peak-rate, and incentive/solar intent into separate ad groups.
- [ ] Apply the four static destination URLs and unique UTM values.
- [ ] Replace `rebates` with `one-time enrollment incentive` and retain eligibility, availability, and Axia-not-SMUD caveats.
- [ ] Keep budget at $25 and do not raise the bid before the evidence gate.
- [ ] Read back campaign, group, ad, destination, and conversion state.

### Task 6: Archive and relaunch Meta routes

**Files:**
- Live artifact: Meta account `act_613406603307670`.

**Interfaces:**
- Consumes: campaign IDs and CRM measurement rules.
- Produces: archived legacy campaign and controlled Sacramento campaign delivery.

- [ ] Validate the connector and re-read campaign, ad set, and ad status.
- [ ] Archive legacy campaign `23857798965620596`.
- [ ] Keep Ad 03 and Ad 01 active; pause Ad 02 and Ad 04.
- [ ] Set the Sacramento campaign/ad set allocation to $25 per day and activate it only after website and CRM verification.
- [ ] Read back effective status, daily budget, and active creative set.

### Task 7: Create the daily budget allocator

**Files:**
- Live artifact: Codex recurring automation.
- Live artifact: CRM `Paid Media Control` tab.

**Interfaces:**
- Consumes: rolling 14-day platform spend and matched CRM appointments.
- Produces: one logged allocation decision and bounded platform-budget updates each day.

- [ ] Create a daily 6:30 AM America/Los_Angeles automation attached to this task.
- [ ] Keep $25 / $25 until five matched paid scheduled appointments exist.
- [ ] After the gate, score scheduled and showed CPA with showed CPA weighted more heavily.
- [ ] Enforce the $10 / $40 learning bounds, $5 daily movement cap, and $50 total ceiling.
- [ ] Reduce total spend to $20 when both showed CPAs exceed $500.
- [ ] Log the decision before applying writes and fail closed if CRM or platform data is incomplete.
- [ ] Read the saved automation and verify schedule, status, task target, and prompt.

### Task 8: Deploy and verify

**Files:**
- Deployment: GitHub Pages repository `lucasburnham/sacramentobatteryincentive`.

**Interfaces:**
- Consumes: tested repository changes and completed live-account updates.
- Produces: verified live landing pages and final operating state.

- [ ] Run all Node tests and copy/compliance scans.
- [ ] Commit repository changes with a scoped message and push `main`.
- [ ] Verify all four live landing routes return HTTP 200 for ordinary, OAI-AdsBot, and OAI-SearchBot requests.
- [ ] Verify internal links preserve UTM values and sanitized `oppref`.
- [ ] Read back CRM tabs, Meta state, OpenAI state, and automation state.
- [ ] Record any external authentication blocker without claiming the corresponding live change succeeded.
