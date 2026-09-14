# Azam – App Blocker

## Problem statement
Indonesian Muslim companion app: reduce distracting app use at prayer times, wake with gratitude, locate qibla, read the complete Quran with Indonesian translation, record prayer consistency, earn Awan/Bintang/Purnama/Syams milestones and share progress. Light-blue/white original mobile UI, smooth lightweight animations, Google or guest entry, contextual notification/location onboarding, settings and Pro previews.

## Confirmed scope
- User named app **Azam-App Blocker**.
- User explicitly chose complete flows with **clearly labeled in-app blocker demonstrations**, real worship features, native system integrations later.
- User explicitly chose **Pro preview without payment**, **hold-to-dismiss alarm demo**, voice verification later.
- Full Quran and Indonesian translations are free, not Pro.

## Architecture
- Expo React Native, project-installed Expo SDK 57, Expo Router single entry with app-level screen state, TypeScript.
- React Query for read data, AppContext for session/settings/navigation, theme.ts shared light/dark tokens.
- FastAPI /api; Motor MongoDB; custom user_id strings and Bearer sessions. Query projections exclude BSON _id; Pydantic API responses.
- Emergent-managed Google OAuth, guest sessions; native token via pre-shipped secure storage helper.
- AlAdhan method 20 Kemenag for prayer times/timezone/Hijri; EQuran.id v2 Arabic/translation/murotal, MongoDB cache.
- Local geodesic bearing to Kaaba; expo-location GPS, native heading if permissions and sensor available.
- Original SVG mosque/celestial illustrations; bundled Jakarta/Amiri fonts; original locally synthesized rain and chime audio. No external image assets.

## Personas
- Muslim student/professional reducing screen distraction at salat times.
- New habit builder tracking five prayers without judgment.
- Quran reader wanting Arabic, Indonesian translation, bookmarks and calm audio.

## Core requirements (static)
1. Guest/Google onboarding and contextual, optional device permissions.
2. Real location-based times and five-prayer check-ins.
3. Quran 114 surahs, translation, search, filters, bookmark, audio.
4. Qibla automatic coordinates or manual input; honest sensor fallback.
5. Focus app selection and prayer schedule preferences; in-app blocker demonstration, 3-second hold, five-minute in-session snooze.
6. Alarm time/phrase preferences and audible foreground demo; no false voice-recognition claim.
7. Calendar, true streaks, statistics, milestones at 1/7/30/100 complete days; native text sharing.
8. Settings, Pro dark-theme preview, explicit nonfunctional native feature previews, no payments or ads network.

## Implemented — 2026-09-14
- Original blue-white mobile onboarding/home, sticky headers, four-tab navigation, animated entrance/press/hold states, themed sheets and toasts.
- Guest auth persisted, managed Google exchange/redirect protocol, logout and isolated settings/log storage.
- Real prayer times, daily verse, location editor and coordinate validation, manual preset cities, permission denial/settings fallback.
- Quran list, filtering/search, Arabic/translation reader, bookmarks/continue, full-surah murotal, loopable rain sound.
- Qibla degree/distance calculation, compass sensor heading on native when available, manual instructions on preview.
- Check-in/undo, streak/best/total/full-day stats, month calendar/history editing, seven-day chart, achievements and text share cards.
- Focus preferences stored; foreground scheduled in-app demos only; selectable example apps clearly labeled, no installed-app scanning claim.
- Alarm demo with original looped chime and true 3-second hold; alarm preferences validate HH:MM.
- Five-minute demo snooze while session remains open. Closing a demo never records a prayer as completed.
- Pro theme preview functional/persisted. Widget/icon visual preview only; automatic rakaat unavailable. No charges or ads.
- Optional native local notifications schedule the remaining prayers for the current day while opening app; device verification pending.

## Verification
- Python lint and TypeScript compilation pass; initial frontend lint warnings cleaned.
- Live API prayer times verified via curl (Kemenag/Jakarta); EQuran API Al-Fatihah verified.
- Screenshot smoke tests: first guest login revealed stale manifest missing API extra; fixed API base lookup with env fallback and JSON guard, then guest onboarding/home/Quran/reader passed.
- Full testing agent run: `/app/test_reports/iteration_1.json`; **15/15 backend tests passed**. Verified guest/session persistence, Quran search/filter/bookmark, progress, dark theme, Google redirect, mobile widths 390/360.
- Follow-up fixes: stable memoized long-press gesture (avoid handler reset by state/clock rerenders), unmount closed Modal portals to avoid stale overlays on reopen, SVG transform matrices instead of origin props to eliminate React DOM warning.
- Self-regression: location saved/reopened for Bandung/Surabaya/Jakarta; blocker and alarm short-vs-long presses verified; qibla renders without transform warning; in-session five-minute snooze verified with advanced test clock. Full details: `/app/test_reports/self_regression.md`.
- Final polish: seamless full-bleed sky illustration on home; toast moved above tab bar, no longer covering navigation.
- Final screenshot regression passed: check-in increases count, undo restores it, dark theme/navigation stable. Simulated after-Isya time confirms actual next-day prayer request and `Subuh · besok` label (not today's repeated Fajr). TypeScript compilation still passes.
- Delivery screenshots: `/tmp/azam-delivery-light.jpg`, `/tmp/azam-delivery-dark.jpg`; browser console `/root/.emergent/automation_output/20260914_114900/console_20260914_114900.log`.

## Implemented — 2026-09-14 (session 2: GitHub import & "lebih matang" polish)
- Imported repo state verified; fixed broken bundle (src/assets.ts used `../../assets`, should be `../assets`) and cleared stale Metro caches.
- Typography switched to Plus Jakarta Sans (static Regular/Medium/SemiBold/Bold/ExtraBold, `assets/fonts`), Poppins removed; `fontFor()` in theme.ts maps weights.
- App identity: icon.png / adaptive-icon.png / splash-image.png / favicon regenerated from the Gemini logo; app.json name "Azam", navy #08223B splash/adaptive background.
- Home hero: `SkyLife` layer with gliding, wing-flapping birds and twinkling stars over the illustration; streak pill uses breathing `PulseFlame`.
- Buttons: `Tap` now spring-animated (scale + dim on press) via Reanimated `AnimatedPressable` — applies to every interactive element.
- Qibla: critically-damped spring glide for dial and needle, low-pass filtered sensor heading, Kaaba marker stays upright, success haptic when aligned, drag-to-rotate gesture on the dial in simulation mode (plus slider).
- Share story: new `ShareComposer` (4 image backgrounds, 3 tints, 4 captions, stats/name toggles, animated 4:5 card with SkyLife) for streak, check-in success and verse sharing.
- Tab label "Blokir" → "Blocker". Intro-seen flag also marks the account onboarded so the guide isn't repeated after login.
- Testing agent iteration 2: 15/15 backend tests, all frontend flows verified (`/app/test_reports/iteration_2.json`).

## Implemented — 2026-09-14 (session 3: kucing animasi, konfeti level, widget native)
- `AnimatedCat` (SVG + Reanimated: bernapas, ekor mengibas, kedip, menguap tiap ~7 dtk) di kartu alarm Blocker, kartu Suasana tenang (mengantuk saat suara kucing tidak aktif), dan layar demo alarm.
- Level-up: `AppContext` menyimpan `levels-seen:<user_id>` di storage; level baru memicu modal `levelup` → `LevelUpOverlay` full-screen (konfeti 44 keping, lencana besar berdenyut, tombol Bagikan ke Story / Lanjutkan, haptic sukses).
- Widget layar kunci & beranda (hanya build native, no-op di Expo Go/web):
  - Android: `react-native-android-widget` plugin di app.config.ts (widget `AzamAzan` & `AzamAyat`, font Plus Jakarta Sans/Amiri), komponen `src/widgets/AzamWidgets.tsx`, headless task `src/widgets/widget-task-handler.tsx` didaftarkan lewat entry kustom `frontend/index.js` (package.json `main` → `index.js`, tetap memuat `expo-router/entry`).
  - iOS: `@bacons/apple-targets` + `targets/widget/` (WidgetKit bundle: systemSmall/Medium/Large + accessoryInline/Rectangular lock-screen, data via App Group `group.com.emergent.qurandaily.fst79v` & `ExtensionStorage`). Entitlement App Group ditambahkan di app.config.ts.
  - `WidgetSync` (di app/index.tsx) menulis jadwal salat + ayat harian setiap kali berubah; `syncWidgets()` memanggil requestWidgetUpdate / ExtensionStorage.reloadWidget.
  - Sheet "Widget & ikon" kini menjelaskan cara pasang widget di perangkat (atau pratinjau desain di web/Expo Go).
- RevenueCat: dilewati atas permintaan pengguna (RevenueCat belum terkoneksi). Saat lanjut: klik Connect RevenueCat di panel payments, lalu jalankan playbook Emergent-managed RevenueCat (paket bulanan + tahunan).
- Testing agent iteration 3: 15/15 backend, semua alur baru lolos (`/app/test_reports/iteration_3.json`).

## Implemented — 2026-09-14 (session 4: pindah workspace & verifikasi ShareComposer)
- Repo GitHub `williamasella-art/Azam` mengembalikan 404 (privat/dihapus); workspace ini sudah berisi codebase lengkap pada state sesi 3, jadi dilanjutkan dari kode lokal. `react-native-android-widget@0.22.1` terpasang di node_modules.
- `ShareComposer.tsx`: `tsc --noEmit` dan ESLint bersih; wiring di `GlobalOverlay` (mode `success`, `share-verse`, `share-progress`) utuh.
- Testing agent iteration 4 (`/app/test_reports/iteration_4.json`): 15/15 backend; 3 pintu masuk share (Progres → Story, check-in sukses, ayat harian), 4 latar, 3 nuansa, 4 caption, 2 toggle, fallback teks di web + toast gagal + reset loading semuanya lolos, 0 console error.
- Catatan minor non-blocking: `accessibilityState.selected` pada `Tap` tidak menghasilkan `aria-selected` di RN-web.

## Backlog additions
- Migrate web `shadow*` → `boxShadow` and `pointerEvents` prop → style (web warnings only).
- Real Pro sounds (thunder/waves/campfire/birds) when payment is added; RevenueCat deferred by user choice.

## Prioritized backlog
### P0 — Native core integration (explicitly deferred)
- Actual Android app interception/usage/accessibility permissions with strict user consent; iOS FamilyControls/ManagedSettings entitlement path.
- Reliable native scheduled/background alarm and notification lifecycle on physical devices.
- Google OAuth full interactive and native sensor/device permission testing.
### P1
- Phrase verification with microphone permission and chosen speech service.
- Real lock-screen widget/icon native extensions and daily timeline updates.
- Rakaat sensing research/calibration/false-positive validation; must never imply ritual correctness.
- App Store/Google Play purchase entitlement integration if later requested; no payments now.
### P2
- Image-template export for social sharing (currently native text share).
- Additional real ambient sound library (thunder/cat), richer achievement animation.
- Guest-to-Google data migration with explicit confirmation; today guest sign-out warns data cannot be restored.
- Offline Quran downloads, expanded statistics, longer notification horizon.

## Next tasks
1. User validation of mobile design/flows.
2. Physical-device check of native permissions, compass and notification delivery, plus interactive Google login.
3. Prioritize real native Android blocking as next main product enhancement.