# Main-agent follow-up regression — 2026-09-14

Following `/app/test_reports/iteration_1.json`:

## Fixes
1. Memoized Gesture.LongPress handler; stable completion ref prevents handler resets when holding-state or app clock changes.
2. Closed Modal portals now unmount fully, and modal types get distinct keys. Reopened sheets cannot retain stale transition/overlay state.
3. Qibla SVG uses explicit `transform="rotate(...)"`, not `rotation/origin` props that generated invalid DOM `transform-origin`.

## Verified in phone-size browser screenshot tool
- Guest -> wait onboarding -> finish -> actual home.
- Location sheet: Bandung save, reopen Surabaya save, reopen Jakarta save. All three passed.
- Blocker short press keeps overlay open; long press crosses 3-second threshold and closes overlay.
- Alarm preferences time 04:45 / Masya Allah saved. Alarm demo short press keeps open; actionability-aware Playwright press with `delay=3300` closes it.
- Qibla rendered bearing 295.2°, distance 7,920 km for Jakarta; browser fallback is explicitly manual. No invalid transform-origin error after fix.
- Five-minute snooze: installed Playwright clock then snoozed, advanced 300001 ms, observed demonstration reopening.
- Post-snooze immediate count assertion was inconclusive because the screen entry animation had not settled (text read blank). No check-in API is called by demo handlers; backend check-in/undo tests passed separately. This was a test timing issue, not a claim of extra coverage.

## Artifacts
- `/tmp/azam-alarm-regression.jpg`
- `/tmp/azam-qibla-fixed.jpg`
- `/tmp/azam-home-verified.jpg`
- Console: `/root/.emergent/automation_output/20260914_114601/console_20260914_114601.log`

## Still requires physical/interactive verification
- Native Google OAuth account completion, GPS/heading calibration, permission dialogs and notification delivery.
- Actual system blocking, background alarm, voice recognition, system widgets, automatic rakaat are explicitly outside this agreed demo scope, not represented as working integrations.

## Final delivery pass
- Phone 390×844: guest onboarding, settled home screenshot, check-in count 1/5, undo 0/5, dark mode, return to home: all passed.
- Advanced system time to 2026-09-14T14:00Z (21:00 Jakarta): next-day API data loads and `Subuh · besok` is displayed. Passed.
- Fresh light/dark screenshots: `/tmp/azam-delivery-light.jpg`, `/tmp/azam-delivery-dark.jpg`.
- Final code compilation: `npx tsc --noEmit` passed.