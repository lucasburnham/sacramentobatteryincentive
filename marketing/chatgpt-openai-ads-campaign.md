# ChatGPT / OpenAI Ads Campaign Plan

## Goal

Turn Sacramento-area SMUD homeowner interest into free in-home solar plus battery appointments for Axia by Qcells.

Primary live conversion: `calendar_booking_clicked`

Post-deploy standard conversion: `appointment_scheduled`

Secondary signals: `calendar_booking_clicked`, `quick_check_clicked`, `qualification_started`, `qualification_completed`, `phone_call_clicked`

## Live Site Integration

The homepage now supports customer-facing ad messages through the `message` URL parameter:

- `message=incentive` keeps the page focused on SMUD battery incentive options.
- `message=backup` shifts the hero copy toward battery backup and outage planning.
- `message=existing_solar` speaks to homeowners who already have solar.
- `message=appointment` makes the page appointment-first.
- `message=no_contact` emphasizes the no-contact quick check.

The homepage also carries current UTM parameters into the quick-check link so page visits, quick-check starts, quick-check completions, booking clicks, and phone clicks can be compared by ad variant.

The live OpenAI Ads campaign should optimize for `calendar_booking_clicked` on the Sacramento Battery Incentive Pixel because the current live site already fires that event when a visitor clicks a calendar-booking link. The prepared site patch also emits the standard `appointment_scheduled` event for the same booking clicks; once deployed, that standard event can become the primary campaign conversion while `calendar_booking_clicked` remains a secondary diagnostic signal.

The prepared Pixel calls avoid optional event IDs because this setup does not use server-side deduplication yet; that keeps the browser events simple and avoids invalid-option warnings.

## Week 1 Launch Tests

Run four starter ads: two to the quick check and two to the homepage.

### A. Incentive Fit

Headline: Check Your SMUD Battery Incentive Options

Description: Sacramento-area homeowner? Check whether solar plus battery storage is worth a closer look, then book a free Axia by Qcells home visit.

URL:

`https://sacramentobatteryincentive.com/quick-check.html?utm_source=chatgpt&utm_medium=paid_ai&utm_campaign=smud_battery_booking&utm_content=week1_quick_check_incentive&message=incentive`

### B. Up to $10,000

Headline: SMUD Battery Incentives May Reach $10,000

Description: SMUD currently lists battery incentives up to $10,000 per household, subject to program rules. Review options with Axia by Qcells.

URL:

`https://sacramentobatteryincentive.com/?utm_source=chatgpt&utm_medium=paid_ai&utm_campaign=smud_battery_booking&utm_content=week1_homepage_incentive&message=incentive`

### C. No-Contact Quick Check

Headline: 2-Minute Solar + Battery Check

Description: Check solar plus battery fit before sharing your name, phone, or email. Book a free visit only if the result looks useful.

URL:

`https://sacramentobatteryincentive.com/quick-check.html?utm_source=chatgpt&utm_medium=paid_ai&utm_campaign=smud_battery_booking&utm_content=week1_quick_check_no_contact&message=no_contact`

### D. Backup Power

Headline: Plan Battery Backup for Your SMUD Home

Description: Review solar panels, battery backup, outage priorities, and current SMUD program details in a free in-home visit.

URL:

`https://sacramentobatteryincentive.com/?utm_source=chatgpt&utm_medium=paid_ai&utm_campaign=smud_battery_booking&utm_content=week1_homepage_backup&message=backup`

## Week 1 Decision Rules

Keep each test running long enough to compare:

- Booking-click rate from page visit.
- Quick-check start rate.
- Quick-check completion rate.
- Phone-click rate.
- Any visible appointment quality differences in Google Calendar.

Early read:

- If quick-check completions are strong but bookings are weak, make the result page more direct.
- If homepage booking clicks beat quick-check booking clicks, move more budget to appointment-first homepage traffic.
- If backup-power copy brings stronger booking clicks, make backup the Week 2 control.

## Week 2 Tests

Use the strongest Week 1 path as the control. Test one change at a time.

### Timing Message

Headline: Check Battery Incentive Timing

Description: SMUD program timing matters. Review your solar plus battery options before you choose equipment or installation timing.

URL:

`https://sacramentobatteryincentive.com/?utm_source=chatgpt&utm_medium=paid_ai&utm_campaign=smud_battery_booking&utm_content=week2_timing_incentive&message=incentive`

### Appointment-First Message

Headline: Book a Free SMUD-Focused Home Visit

Description: Bring a recent SMUD bill. Axia by Qcells will review solar, battery backup, and incentive questions for your home.

URL:

`https://sacramentobatteryincentive.com/?utm_source=chatgpt&utm_medium=paid_ai&utm_campaign=smud_battery_booking&utm_content=week2_appointment_first&message=appointment`

## Week 3 Tests

Use Week 3 to separate existing-solar owners from new-solar shoppers.

### Existing Solar Owners

Headline: Already Have Solar? Check Battery Options

Description: Review storage options, SMUD rate details, and battery incentive timing for a home that already has solar panels.

URL:

`https://sacramentobatteryincentive.com/?utm_source=chatgpt&utm_medium=paid_ai&utm_campaign=smud_battery_booking&utm_content=week3_existing_solar&message=existing_solar`

### New Solar Plus Battery

Headline: Solar Panels Plus Battery Storage for SMUD Homes

Description: Compare rooftop solar, battery storage, backup needs, and current SMUD program details in a free home visit.

URL:

`https://sacramentobatteryincentive.com/quick-check.html?utm_source=chatgpt&utm_medium=paid_ai&utm_campaign=smud_battery_booking&utm_content=week3_new_solar_battery&message=incentive`

## Audience Intent Clusters

1. SMUD battery incentive shoppers
   - "Do I qualify for the SMUD battery incentive?"
   - "How much is the SMUD Powerwall incentive?"
   - "SMUD solar battery rebate Sacramento"

2. Backup power and outage planners
   - "Battery backup for Sacramento home"
   - "Powerwall for SMUD outage protection"
   - "Best home battery for solar in Sacramento"

3. Solar plus battery shoppers
   - "Should I add battery storage to solar?"
   - "Sacramento solar battery quote"
   - "SMUD solar and storage rate"

4. Existing solar owners
   - "Can I add a battery to my existing solar?"
   - "SMUD battery storage incentive after PTO"
   - "Battery storage for existing solar Sacramento"

## Audience Exclusions

- Renters without homeowner involvement.
- Non-SMUD utility searches unless conquesting is intentional.
- DIY-only battery installation intent.
- Commercial battery storage intent.
- Research-only queries that include "jobs," "wholesale," "datasheet," "manual," or "stock price."

## Compliance Notes

- Do not imply Axia is SMUD or is endorsed by SMUD.
- Do not guarantee incentive approval, savings, bill elimination, tax outcomes, or battery performance.
- Use "may qualify," "SMUD currently lists," and "subject to SMUD rules and final approval."
- Keep official-source links visible on the landing page:
  - SMUD battery storage page: https://www.smud.org/Going-Green/Battery-storage/Homeowner
  - Tesla SMUD Powerwall page: https://www.tesla.com/support/energy/virtual-power-plant/smud
  - SMUD Solar and Storage Rate page: https://www.smud.org/Rate-Information/Solar-and-Storage-Rate

## Calendar Intake

Keep scheduling questions short:

1. Name
2. Phone
3. Email
4. Property address
5. Are you a SMUD customer?
6. Average monthly electric bill
7. Existing solar? Yes / No / Not sure

Avoid technical questions until after the homeowner has selected a time.
