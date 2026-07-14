# OpenAI Ads Campaign Operating Brief

## Goal and Guardrails

Turn Sacramento-area SMUD homeowner interest into scheduled and showed solar plus battery appointments for Axia by Qcells.

- Daily OpenAI budget at launch: `$25`.
- Combined OpenAI and Meta daily ceiling: `$50`.
- Maximum acceptable scheduled appointment CPA: `$500`.
- Maximum acceptable showed appointment CPA: `$500`.
- Do not increase bids or budget from micro-conversions.
- Do not use expired tax-credit messaging.
- Axia Solar is not SMUD. Incentive eligibility, availability, and approval are controlled by SMUD.

## Conversion Truth

The current OpenAI campaign remains click-optimized until a real server-side `appointment_scheduled` event has been accepted and reconciled to the CRM.

- `calendar_booking_clicked` is booking intent only.
- `appointment_scheduled` requires a matching Google Calendar event and CRM appointment record.
- `appointment_showed` requires an explicit `Showed` status in the CRM.
- Scheduled and showed events must retain the original static UTM values and valid `oppref` value when available.
- A browser click must never be counted as a scheduled or showed appointment.

After at least five matched scheduled appointments, use scheduled CPA as the first allocation signal and showed CPA as the final quality signal. Until then, keep OpenAI at `$25/day` unless a stop-loss rule fires.

## Live Ad Routing

Each creative has one intent-specific destination. Do not send paid traffic to the root homepage.

### Peak Rate | SMUD SSR

Title: Store Solar Power for Peak Hours

Description: SMUD homeowners can review when stored solar may support evening use under the Solar and Storage Rate.

URL:

`https://sacramentobatteryincentive.com/smud-solar-and-storage-rate.html?utm_source=openai&utm_medium=paid_ai&utm_campaign=smud_battery_sacramento&utm_content=peak_hours&message=peak_rate`

### Backup | Sacramento

Title: Battery Backup for Sacramento Homes

Description: Review battery options for outage planning and essential home loads with Axia Solar.

URL:

`https://sacramentobatteryincentive.com/battery-backup-sacramento.html?utm_source=openai&utm_medium=paid_ai&utm_campaign=smud_battery_sacramento&utm_content=backup_power&message=backup`

### Incentive + Solar | SMUD

Title: SMUD Battery Incentive Check

Description: SMUD lists a one-time enrollment incentive up to $10,000 for eligible new battery systems. Eligibility and availability apply.

URL:

`https://sacramentobatteryincentive.com/smud-battery-incentive.html?utm_source=openai&utm_medium=paid_ai&utm_campaign=smud_battery_sacramento&utm_content=incentive_check&message=incentive`

### Incentive + Solar | SMUD

Title: Solar + Battery for SMUD Homes

Description: Compare solar and battery options for a Sacramento-area SMUD home with Axia Solar.

URL:

`https://sacramentobatteryincentive.com/solar-battery-storage-sacramento.html?utm_source=openai&utm_medium=paid_ai&utm_campaign=smud_battery_sacramento&utm_content=solar_battery&message=solar_battery`

## Audience Intent

- SMUD battery incentive eligibility and enrollment timing.
- Battery backup and essential-load planning.
- Solar plus storage under the SMUD Solar and Storage Rate.
- Battery additions for existing solar owners.

Exclude renters without homeowner involvement, non-SMUD utility intent, commercial storage, DIY installation, jobs, wholesale, datasheets, manuals, and stock-price research.

## Decision Rules

- Keep the initial `$25/day` allocation while fewer than five scheduled appointments are matched to OpenAI.
- Pause a creative after at least 100 clicks with no matched scheduled appointment.
- Pause a creative after more than `$500` spend with no matched scheduled appointment.
- Do not scale when scheduled CPA or showed CPA exceeds `$500`.
- Move no more than `$5/day` in any daily allocation update.
- Keep the combined OpenAI and Meta budget at or below `$50/day`.
- Record the evidence and recommendation in the CRM before changing a live budget.
- If attribution or CRM data is incomplete, make no budget change.

## Compliance

- Do not imply Axia is SMUD, endorsed by SMUD, or able to approve an incentive.
- Do not guarantee approval, savings, bill elimination, tax outcomes, or battery performance.
- Use conditional language and link to the official SMUD program and rate pages.
- Keep the landing-page disclosure visible near the incentive claim.

## Calendar Intake

Keep scheduling questions limited to name, phone, email, property address, SMUD customer status, average bill, and existing-solar status. The calendar event ID becomes the durable key for the appointment record; appointment status changes are managed in the CRM.
