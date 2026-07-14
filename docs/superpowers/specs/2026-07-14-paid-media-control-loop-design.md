# Paid Media Control Loop Design

Date: July 14, 2026

## Objective

Turn the Sacramento battery paid campaigns into one measurable acquisition system across OpenAI Ads, Meta Ads, Google Calendar, and the existing `Solar_Deal_CRM_Imported` workbook.

The system must keep total configured paid-media budget at or below $50 per day, distribute that budget according to verified appointment effectiveness, and treat $500 as the maximum acceptable cost for both a scheduled appointment and a showed appointment.

## Existing Systems

- Website: `sacramentobatteryincentive.com`, deployed from this repository.
- OpenAI Ads: `SMUD Battery Incentive | Sacramento | Clicks | Axia Solar`.
- Meta Ads: `SBI | CONV | Meta | Website Lead | 2026-06`.
- CRM: Google Sheet `Solar_Deal_CRM_Imported`.
- Scheduling: Google Calendar appointment schedule for `Free In-Home Solar + Battery Consultation`.

The existing CRM remains the system of record. No second CRM will be created.

## Conversion Truth Hierarchy

1. `calendar_booking_clicked` and Meta `BookingIntent` mean that a visitor opened the scheduling handoff. They are diagnostics, not appointments.
2. `Lead` means the visitor submitted contact details through the approved appointment-intake flow.
3. `Scheduled` means a matching Google Calendar consultation event exists.
4. `Showed` means the sales team explicitly marked the appointment as showed in the CRM.
5. `Qualified` and `Sold` come from the linked CRM deal record.

OpenAI and Meta budget decisions use only matched `Scheduled` and `Showed` records. Platform micro-conversions cannot be substituted.

## Website And Attribution

- Preserve static UTM values and the OpenAI click reference `oppref` across internal routes.
- Keep click-reference values allowlisted and length-bounded. Do not forward arbitrary query parameters.
- Route each paid message to the page that answers that intent:
  - Peak-rate intent: `/smud-solar-and-storage-rate.html`
  - Backup intent: `/battery-backup-sacramento.html`
  - Incentive intent: `/smud-battery-incentive.html`
  - Solar plus battery intent: `/solar-battery-storage-sacramento.html`
- `book.html` records booking intent only and must not emit a scheduled-appointment event.
- Browser and server events share stable event IDs when both channels are available, preventing duplicate Meta or OpenAI conversions.
- No advertising or acquisition copy may mention federal tax credits. SMUD copy uses `one-time enrollment incentive`, states eligibility and availability limits, and says Axia Solar is not SMUD.

## CRM Extension

Add three tabs to `Solar_Deal_CRM_Imported`:

### Paid Leads

One row per submitted lead with source, campaign, creative, landing route, UTM values, click references, consent, contact details, calendar event ID, and linked Deal ID.

### Appointments

One row per consultation with Lead ID, calendar event ID, scheduled date, appointment time, status, showed date, platform, campaign, creative, Deal ID, and server-event delivery state.

Allowed appointment statuses are `Scheduled`, `Showed`, `No show`, `Cancelled`, and `Rescheduled`.

### Paid Media Control

Daily platform rows with configured budget, recommended budget, spend, clicks, scheduled appointments, showed appointments, scheduled CPA, showed CPA, score, action, and reason.

The CRM stores these operating constants:

- Daily ceiling: $50
- Initial split: OpenAI $25 / Meta $25
- Maximum scheduled CPA: $500
- Maximum showed CPA: $500
- Minimum active-platform allocation: $10
- Maximum active-platform allocation during learning: $40
- Maximum daily budget movement: $5 per platform
- Evidence gate: five matched scheduled appointments across the paid system before effectiveness-based reallocation

## Allocation Logic

The allocator runs daily using a rolling 14-day window.

1. Until five paid scheduled appointments are matched, keep the initial $25 / $25 split.
2. After the evidence gate, score each platform using scheduled CPA and showed CPA, with showed CPA receiving the higher weight.
3. Move no more than $5 per platform per day.
4. Keep an active platform between $10 and $40 per day during learning.
5. Pause a creative after 100 clicks with no matched scheduled appointment, or after more than $500 spend with no matched scheduled appointment.
6. If both platforms exceed the $500 showed-CPA ceiling, reduce total active spend to $20 per day while measurement and lead quality are reviewed.
7. Never allow configured OpenAI plus Meta daily budgets to exceed $50.

Every decision is written to `Paid Media Control` before a live budget change.

## Campaign Changes

### OpenAI Ads

- Keep calendar clicks as secondary diagnostics.
- Use `Appointment Scheduled` only when it is backed by a matched calendar record and the server event is accepted.
- Fix rejected event properties and preserve `oppref` for attribution.
- Split the current mixed ad group into backup, peak-rate, and incentive/solar intent groups.
- Give every ad a static, intent-specific destination and UTM content value.
- Do not increase the bid until at least five matched scheduled appointments exist.

### Meta Ads

- Archive the legacy roofing and insurance campaign.
- Restart the Sacramento battery campaign with Ad 03 and Ad 01 only.
- Keep Ad 02 off.
- Keep Ad 04 off until its anomalous event sequence is reconciled; test it later in isolation.
- Use matching browser/server event IDs for deduplication.

## Verification

- Automated tests prove that booking handoff is not treated as scheduled, `oppref` is sanitized and propagated, and forbidden tax-credit copy is absent.
- Google Sheets readback proves the three CRM tabs, headers, validation, formulas, and operating constants exist.
- Google Calendar matching proves only consultation events become scheduled appointments.
- OpenAI and Meta readback proves final status, budget, creative selection, destinations, and conversion configuration.
- Live site checks prove all four paid landing routes return successfully and preserve allowlisted attribution.
