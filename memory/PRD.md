# Azam — Product Requirements & Progress

## Original problem statement (this iteration)
Imported from GitHub (williamasella-art/Azam, branch main). Requests:
1. Full translation of the Hajj, Qur'an, Qibla, and Alarm screens into English, Malay, and Arabic.
2. Smart reminder: motivational push when the user misses Tahajud or Dhuha two days in a row.
3. Story cover: add light Islamic filters and stickers to the Seayat (share verse) card to make it more shareable.
4. Home: remove the person photo, put the Azam logo + "Azam" title top-left (pre-revision look), greeting lower.
5. Profile photo: place elsewhere; default to the Azam logo; Settings shows the Azam logo before a photo is uploaded.
6. Soften the Subuh–Isya prayer icons to match the sky-blue theme.
7. Redesign the App Blocker on/off toggle to be smooth and theme-aligned.

User choices: language switch both manual + device; push notifications; preset built-in stickers; self-generated translations; full RTL for Arabic.

## Architecture
- Frontend: Expo Router (React Native), single-index screen router with internal navigation (AppContext `go`), @tanstack/react-query, theme tokens in src/theme.ts.
- Backend: FastAPI (server.py + worship.py), MongoDB (motor). All routes under /api.
- i18n: src/i18n.ts (typed UI strings, 4 langs) + new src/screenText.ts (Hajj/Qur'an/Qibla/Alarms deep content, 4 langs). Base <T> component applies RTL (right align + writingDirection) when language is Arabic.
- Push: Emergent-managed relay via backend send_push(); tokens registered by device on app open (permission-gated).

## User personas
- Indonesian/Malay/Arabic-speaking Muslims wanting prayer times, Qur'an reading, qibla, dhikr alarms, sunnah tracking, and screen-time focus during prayer.

## Implemented (2026-09-15)
- Recreated missing .env for backend & frontend; installed hijridate; app restored to running.
- [1] Translated Hajj, Qur'an (list + reader), Qibla, Alarms screens to EN/MS/AR with source-Indonesian fallback; RTL text for Arabic (verified EN & AR on Qur'an; Settings fully localized).
- [2] Backend: /api/register-push, /api/sunnah/checkin, /api/sunnah/status, /api/sunnah/nudge-check (2-day-miss detection for enabled Tahajud/Dhuha, deduped per day, non-blocking push). Frontend: device token registration + nudge-check on app open; Sunnah screen check-in UI. (19/19 backend tests passed.)
- [3] ShareComposer: 5 preset photo filters + 7 Islamic vector stickers (crescent/star/mosque/lantern/glow/frame), localized labels; overlays captured in the shared image. (Verified.)
- [4] Home header: Azam logo + wordmark top-left, greeting moved into content. (Verified.)
- [5] Avatar defaults to the Azam logo when no photo (used on Home entry point & Settings). (Code.)
- [6] PrayerSky recolored to soft blue-forward palette. (Verified.)
- [7] App Blocker toggle: custom animated glass pill with sliding knob, brand color when on. (Verified ON/OFF.)

## Bug fixes
- 2026-09-15: Root layout crash on Expo Go (Android, SDK 53+). `app/_layout.tsx` imported `expo-notifications` statically at module scope; the module throws on evaluation in Expo Go, making the layout module undefined ("Cannot read property 'ErrorBoundary' of undefined", "missing the required default export"). Fixed by lazy-loading `expo-notifications` inside `useEffect` with try/catch (handler, Android channel, tap listeners, permission nudge all moved there). Verified: app renders, no layout errors in Metro log.

## Backlog (not in this iteration)
- P1: Localize the relative-time / repeat helper strings in alarms.ts (currently Indonesian) for full alarm-screen translation.
- P1: Full native RTL layout mirroring (row reversal) via I18nManager on a native build.
- P2: Sunnah streak visualization based on check-in history.

## Notes / setup dependencies
- Push notifications require: (a) user provides google-services.json (Firebase, Android package `com.emergent.qurandaily.fst79v`), (b) Publish → generate build. Does NOT work in Expo Go / preview. EMERGENT_PUSH_KEY is a placeholder in preview (auto-set on deploy); /api/register-push returns 500 until then, handled gracefully.
