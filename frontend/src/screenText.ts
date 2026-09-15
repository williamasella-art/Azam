// Localized strings for the deeper screens (Hajj, Qur'an, Qibla, Alarms).
// `id` holds the source copy; en/ms/ar are full translations. Qur'an ayah text itself always stays Arabic.
import type { Lang } from './i18n';

type QuranTx = {
  title: string; subtitle: string; searchPlaceholder: string;
  filterAll: string; makki: string; madani: string;
  eyebrow: string; continueReading: string; startBismillah: string; surahVerse: (s: number, v: number) => string; fullList: string;
  empty: string; verses: string; listSource: string;
  readerTitle: string; readerSubtitle: string; translation: string; latin: string; murottal: string; pause: string;
  ayatBadge: (place: string, n: number) => string; ambientLabel: string;
  audioError: string; audioUnavailable: string; bookmarkSaved: string; readerSource: string;
};
type QiblaTx = {
  title: string; subtitle: string; deviceCompass: string; simMode: string;
  aligned: string; turnToFollow: string; clockwise: (b: number) => string; distance: (km: string) => string;
  dragHint: string; sliderNote: string; sensorHint: string; lowAccuracy: string; changeLocation: string;
};
type AlarmsTx = {
  title: string; subtitle: string; addLabel: string; nextBadge: string; noneBadge: string;
  setFirst: string; setFirstDesc: string; permissionBanner: string;
  emptyTitle: string; emptyDesc: string; add: string; tryTone: string; phoneClock: string; delete: string;
  editTitle: string; passedPickNew: string; on: (t: string) => string; off: (t: string) => string; removed: string;
  info: { web: string; android: string; ios: string };
};
type HajjTx = {
  title: string; subtitle: string; guideBadge: string; allDone: string; allDoneSub: string; nextStepOf: (phase: string) => string;
  nextStepTag: string; markDone: string; markUndone: string; forbiddenTitle: string; talbiyah: string;
  resetButton: string; resetDone: string; footer: string; doneNext: (title: string) => string; allComplete: string; progressReset: string;
  phases: Record<string, { short: string; intro: string }>;
  steps: Record<string, { title: string; text: string; duaLabel?: string; arti?: string }>;
  forbidden: string[]; talbiyahArti: string;
};

export type ScreenText = { quran: QuranTx; qibla: QiblaTx; alarms: AlarmsTx; hajj: HajjTx };

const id: ScreenText = {
  quran: {
    title: 'Al-Qur’an', subtitle: 'Setiap ayat, selangkah lebih dekat.', searchPlaceholder: 'Cari surah atau arti…',
    filterAll: 'Semua', makki: 'Makkiyah', madani: 'Madaniyah',
    eyebrow: 'RUANG UNTUK HATI', continueReading: 'Lanjutkan bacaan', startBismillah: 'Mulai dengan Bismillah', surahVerse: (s, v) => `Surah ${s} · ayat ${v}`, fullList: '114 surah, lengkap dengan terjemahan',
    empty: 'Surah tidak ditemukan. Coba nama atau nomor lain.', verses: 'ayat', listSource: 'Teks & terjemahan Indonesia · EQuran.id',
    readerTitle: 'Membaca Al-Qur’an', readerSubtitle: 'Baca perlahan, resapi maknanya.', translation: 'Terjemahan', latin: 'Latin', murottal: 'Murotal', pause: 'Jeda',
    ayatBadge: (place, n) => `${place} · ${n} AYAT`, ambientLabel: 'Suasana tenang & volume',
    audioError: 'Audio belum bisa diputar. Periksa koneksi lalu coba lagi.', audioUnavailable: 'Audio surah ini belum tersedia.', bookmarkSaved: 'Penanda bacaan disimpan.', readerSource: 'Sumber: EQuran.id · Murotal: Misyari Rasyid Alafasy',
  },
  qibla: {
    title: 'Arah kiblat', subtitle: 'Satu arah, menyatukan hati.', deviceCompass: 'KOMPAS PERANGKAT', simMode: 'MODE SIMULASI · TANPA SENSOR',
    aligned: 'Kamu menghadap kiblat ✓', turnToFollow: 'Putar perangkat mengikuti Ka’bah', clockwise: b => `Kiblat ${b}° searah jarum jam dari utara`, distance: km => `${km} km menuju Ka’bah`,
    dragHint: 'Geser kompas atau slider', sliderNote: 'Sensor kompas tidak tersedia di pratinjau ini. Geser untuk melihat animasi; di ponsel, kompas mengikuti gerakan perangkat.',
    sensorHint: 'Letakkan ponsel mendatar, jauhi benda logam, lalu gerakkan membentuk angka delapan untuk kalibrasi.', lowAccuracy: 'Akurasi sensor rendah. Kalibrasikan sebelum mengikuti arah.', changeLocation: 'Ubah lokasi otomatis / manual',
  },
  alarms: {
    title: 'Alarm dzikir', subtitle: 'Bangun dan berhenti sejenak dengan kalimat baik.', addLabel: 'Tambah alarm', nextBadge: 'ALARM BERIKUTNYA', noneBadge: 'BELUM ADA ALARM AKTIF',
    setFirst: 'Atur alarm pertamamu', setFirstDesc: 'Tentukan tanggal, jam, dan dzikir yang ingin kamu ucapkan saat bangun.', permissionBanner: 'Izin notifikasi belum aktif, jadi alarm belum bisa berbunyi di HP ini. Ketuk untuk mengizinkan.',
    emptyTitle: 'Belum ada alarm', emptyDesc: 'Tambahkan alarm untuk bangun subuh, tahajud, atau pengingat dzikir kapan pun.', add: 'Tambah alarm', tryTone: 'Coba bunyi', phoneClock: 'Jam HP', delete: 'Hapus',
    editTitle: 'Ubah alarm', passedPickNew: 'Waktu alarm ini sudah lewat. Pilih tanggal baru.', on: t => `Alarm ${t} aktif.`, off: t => `Alarm ${t} dimatikan.`, removed: 'Alarm dihapus.',
    info: {
      web: 'Di pratinjau web, alarm hanya tersimpan. Buka Azam lewat Expo Go atau build HP agar alarm benar-benar berbunyi dengan suara dan getar.',
      android: 'Alarm berbunyi sebagai notifikasi bersuara dan bergetar walau Azam ditutup. “Jam HP” juga menyetelnya di aplikasi Jam bawaan agar berbunyi maksimal.',
      ios: 'Alarm berbunyi sebagai notifikasi bersuara dan bergetar walau Azam ditutup. Pastikan mode Fokus/Senyap mengizinkan notifikasi Azam.',
    },
  },
  hajj: {
    title: 'Haji & Umrah', subtitle: 'Langkah demi langkah, doa demi doa.', guideBadge: 'PANDUAN BERTAHAP', allDone: 'Seluruh langkah selesai', allDoneSub: 'Semoga menjadi haji yang mabrur.', nextStepOf: phase => `Langkah berikutnya · ${phase}`,
    nextStepTag: 'LANGKAH BERIKUTNYA', markDone: 'Tandai selesai', markUndone: 'Tandai belum selesai', forbiddenTitle: 'Larangan saat ihram', talbiyah: 'TALBIYAH',
    resetButton: 'Reset progres manasik', resetDone: 'Progres manasik direset.', footer: 'Ringkasan edukatif berdasarkan manasik umum. Ikuti bimbingan pembimbing ibadah/KBIH resmi untuk pelaksanaan.',
    doneNext: title => `Selesai. Berikutnya: ${title}`, allComplete: 'Masya Allah, seluruh langkah selesai. Semoga haji mabrur.', progressReset: 'Progres manasik direset.',
    phases: {}, steps: {}, forbidden: [], talbiyahArti: '',
  },
};

const en: ScreenText = {
  quran: {
    title: 'Qur’an', subtitle: 'Every verse, one step closer.', searchPlaceholder: 'Search a surah or meaning…',
    filterAll: 'All', makki: 'Makki', madani: 'Madani',
    eyebrow: 'A SPACE FOR THE HEART', continueReading: 'Continue reading', startBismillah: 'Begin with Bismillah', surahVerse: (s, v) => `Surah ${s} · verse ${v}`, fullList: '114 surahs, with full translation',
    empty: 'Surah not found. Try another name or number.', verses: 'verses', listSource: 'Text & translation · EQuran.id',
    readerTitle: 'Reading the Qur’an', readerSubtitle: 'Read slowly, let it settle.', translation: 'Translation', latin: 'Latin', murottal: 'Recite', pause: 'Pause',
    ayatBadge: (place, n) => `${place} · ${n} VERSES`, ambientLabel: 'Calm ambience & volume',
    audioError: 'Audio could not play. Check your connection and try again.', audioUnavailable: 'Recitation for this surah is not available yet.', bookmarkSaved: 'Reading bookmark saved.', readerSource: 'Source: EQuran.id · Recitation: Mishary Rashid Alafasy',
  },
  qibla: {
    title: 'Qibla direction', subtitle: 'One direction, uniting hearts.', deviceCompass: 'DEVICE COMPASS', simMode: 'SIMULATION MODE · NO SENSOR',
    aligned: 'You are facing the qibla ✓', turnToFollow: 'Turn your device to follow the Kaaba', clockwise: b => `Qibla ${b}° clockwise from north`, distance: km => `${km} km to the Kaaba`,
    dragHint: 'Drag the compass or slider', sliderNote: 'The compass sensor is unavailable in this preview. Drag to see the animation; on a phone the compass follows your movement.',
    sensorHint: 'Lay the phone flat, away from metal, then move it in a figure-eight to calibrate.', lowAccuracy: 'Sensor accuracy is low. Calibrate before following the direction.', changeLocation: 'Change location · auto / manual',
  },
  alarms: {
    title: 'Dhikr alarm', subtitle: 'Wake and pause a moment with good words.', addLabel: 'Add alarm', nextBadge: 'NEXT ALARM', noneBadge: 'NO ACTIVE ALARM YET',
    setFirst: 'Set your first alarm', setFirstDesc: 'Choose the date, time, and the dhikr you want to say on waking.', permissionBanner: 'Notification permission is off, so alarms can’t ring on this phone. Tap to allow.',
    emptyTitle: 'No alarms yet', emptyDesc: 'Add an alarm for Fajr, Tahajjud, or a dhikr reminder any time.', add: 'Add alarm', tryTone: 'Try tone', phoneClock: 'Phone clock', delete: 'Delete',
    editTitle: 'Edit alarm', passedPickNew: 'This alarm time has passed. Pick a new date.', on: t => `Alarm ${t} on.`, off: t => `Alarm ${t} off.`, removed: 'Alarm deleted.',
    info: {
      web: 'In the web preview, alarms are only saved. Open Azam via Expo Go or a phone build so alarms truly ring with sound and vibration.',
      android: 'Alarms ring as a sound-and-vibrate notification even when Azam is closed. “Phone clock” also sets it in the built-in Clock app for maximum reliability.',
      ios: 'Alarms ring as a sound-and-vibrate notification even when Azam is closed. Make sure Focus/Silent mode allows Azam notifications.',
    },
  },
  hajj: {
    title: 'Hajj & Umrah', subtitle: 'Step by step, prayer by prayer.', guideBadge: 'STEP-BY-STEP GUIDE', allDone: 'All steps complete', allDoneSub: 'May it be an accepted Hajj.', nextStepOf: phase => `Next step · ${phase}`,
    nextStepTag: 'NEXT STEP', markDone: 'Mark done', markUndone: 'Mark not done', forbiddenTitle: 'Prohibitions in ihram', talbiyah: 'TALBIYAH',
    resetButton: 'Reset ritual progress', resetDone: 'Ritual progress reset.', footer: 'An educational summary based on common rites. Follow an official guide/KBIH for practice.',
    doneNext: title => `Done. Next: ${title}`, allComplete: 'Masha Allah, all steps complete. May your Hajj be accepted.', progressReset: 'Ritual progress reset.',
    phases: {
      persiapan: { short: 'Preparation', intro: 'Provisions of knowledge, body, and heart before the Holy Land.' },
      umrah: { short: 'Umrah', intro: 'Ihram → tawaf → sa’i → tahallul. Perform them in order.' },
      haji: { short: 'Hajj', intro: 'The peak: Mina, Arafah, Muzdalifah, the jamarat, tawaf ifadah.' },
    },
    steps: {
      p1: { title: 'Purify your intention & settle affairs', text: 'Intend it for Allah alone. Repay debts, seek forgiveness from family and neighbours, leave provision for those you leave behind.', duaLabel: 'Prayer for sincerity', arti: 'O Allah, make this an accepted Hajj and a forgiven sin.' },
      p2: { title: 'Learn the rites (manasik)', text: 'Follow the manasik guidance from your group/authority. Understand the pillars, obligations, sunnahs, and ihram prohibitions so worship is orderly.' },
      p3: { title: 'Health & documents', text: 'Meningitis vaccine, health check, passport, visa, ID bracelet, personal medicine, two sets of ihram, sandals, and a small bag.' },
      p4: { title: 'Prayer on leaving home & travel', text: 'Pray two rak’ahs before departing, bid farewell to family, and pray as the vehicle starts moving.', duaLabel: 'Travel prayer', arti: 'Glory to the One who subjected this to us, and to our Lord we shall surely return.' },
      u1: { title: 'Ihram from the miqat', text: 'Bathe, apply scent to the body (not the ihram cloth), wear the ihram, pray two rak’ahs, then make intention as you pass the miqat.', duaLabel: 'Intention for Umrah', arti: 'O Allah, I answer Your call to perform Umrah.' },
      u2: { title: 'Talbiyah along the way', text: 'Repeat the talbiyah until you begin tawaf. Men raise the voice, women lower it.', duaLabel: 'Talbiyah', arti: 'Here I am, O Allah, here I am. There is no partner for You. Praise, blessing, and dominion are Yours alone.' },
      u3: { title: 'Enter the Sacred Mosque', text: 'Enter with the right foot, supplicate, then head to the Kaaba. On seeing it, raise your hands and pray freely.', duaLabel: 'Prayer on entering the mosque', arti: 'In the name of Allah, peace be upon the Messenger. O Allah, open for me the gates of Your mercy.' },
      u4: { title: 'Tawaf, seven rounds', text: 'Start at the Black Stone line, Kaaba on your left. Each round gesture toward the Black Stone with takbir. Between the Yamani Corner and Black Stone recite the “rabbana” prayer.', duaLabel: 'Between the Yamani Corner & Black Stone', arti: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.' },
      u5: { title: 'Pray behind Maqam Ibrahim & drink Zamzam', text: 'Two light rak’ahs (Al-Kafirun & Al-Ikhlas), then drink Zamzam facing the Kaaba while praying.', duaLabel: 'Prayer when drinking Zamzam', arti: 'O Allah, I ask You for beneficial knowledge, ample provision, and healing from every illness.' },
      u6: { title: 'Sa’i, Safa to Marwah, seven times', text: 'Begin at Safa facing the Kaaba, make takbir and pray, then walk to Marwah (counts as one). Men jog lightly between the two green lights.', duaLabel: 'Dhikr at Safa & Marwah', arti: 'There is no god but Allah alone, no partner for Him. His is the dominion and praise, and He is capable of all things.' },
      u7: { title: 'Tahallul', text: 'Men shave or shorten all the hair; women trim a fingertip’s length. Umrah is complete; ihram prohibitions are lifted.' },
      h1: { title: '8 Dhul-Hijjah · Tarwiyah', text: 'Enter ihram for Hajj from your lodging (for tamattu’), make intention, then head to Mina. Stay overnight in Mina, praying the five prayers without combining.', duaLabel: 'Intention for Hajj', arti: 'O Allah, I answer Your call to perform Hajj.' },
      h2: { title: '9 Dhul-Hijjah · Standing at Arafah', text: 'A pillar of Hajj. Remain at Arafah from midday until sunset. Combine and shorten Dhuhr & Asr. Increase supplication, dhikr, istighfar, and talbiyah.', duaLabel: 'The best prayer at Arafah', arti: 'There is no god but Allah alone, no partner for Him. His is the dominion and praise, and He is capable of all things.' },
      h3: { title: 'Night of the 10th · Muzdalifah', text: 'Combine Maghrib & Isha. Stay past midnight (the elderly/excused may leave earlier). Gather pebbles for the jamarat.' },
      h4: { title: '10 Dhul-Hijjah · Jamrat al-Aqabah', text: 'Throw seven pebbles at Jamrat al-Aqabah, saying takbir with each. The talbiyah stops when you begin to throw.', duaLabel: 'While throwing', arti: 'In the name of Allah, Allah is the Greatest.' },
      h5: { title: 'Hadyu & first tahallul', text: 'Offer the hadyu (tamattu’/qiran), then shave the hair. First tahallul: you may remove ihram, except marital relations.' },
      h6: { title: 'Tawaf al-Ifadah & Sa’i of Hajj', text: 'A pillar of Hajj. Tawaf seven rounds then sa’i. After it the second tahallul: all ihram prohibitions are lifted.', duaLabel: 'Between the Yamani Corner & Black Stone', arti: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.' },
      h7: { title: '11–13 Dhul-Hijjah · Mina & the three jamarat', text: 'Stay in Mina. Each day after zawal throw at Ula, Wusta, then Aqabah, seven pebbles each. Nafar awwal: leave on the 12th before sunset; nafar thani: the 13th.' },
      h8: { title: 'Farewell tawaf (Wada’)', text: 'The farewell tawaf before leaving Makkah, without sa’i. Increase supplication and gratitude.', duaLabel: 'Farewell prayer', arti: 'O Allah, do not make this my last visit to Your Sacred House.' },
    },
    forbidden: ['Wearing sewn garments (men) & covering face/palms (women)', 'Cutting hair or nails', 'Applying scent after ihram', 'Hunting or killing land animals', 'Marrying, proposing, or marital relations', 'Quarrelling and foul speech'],
    talbiyahArti: 'Here I am, O Allah, here I am. There is no partner for You. Praise, blessing, and dominion are Yours alone.',
  },
};

const ms: ScreenText = {
  quran: {
    title: 'Al-Qur’an', subtitle: 'Setiap ayat, selangkah lebih dekat.', searchPlaceholder: 'Cari surah atau maksud…',
    filterAll: 'Semua', makki: 'Makkiyah', madani: 'Madaniyah',
    eyebrow: 'RUANG UNTUK HATI', continueReading: 'Sambung bacaan', startBismillah: 'Mula dengan Bismillah', surahVerse: (s, v) => `Surah ${s} · ayat ${v}`, fullList: '114 surah, lengkap dengan terjemahan',
    empty: 'Surah tidak dijumpai. Cuba nama atau nombor lain.', verses: 'ayat', listSource: 'Teks & terjemahan · EQuran.id',
    readerTitle: 'Membaca Al-Qur’an', readerSubtitle: 'Baca perlahan, hayati maknanya.', translation: 'Terjemahan', latin: 'Rumi', murottal: 'Murattal', pause: 'Jeda',
    ayatBadge: (place, n) => `${place} · ${n} AYAT`, ambientLabel: 'Suasana tenang & kelantangan',
    audioError: 'Audio belum boleh dimainkan. Semak sambungan dan cuba lagi.', audioUnavailable: 'Audio surah ini belum tersedia.', bookmarkSaved: 'Penanda bacaan disimpan.', readerSource: 'Sumber: EQuran.id · Murattal: Misyari Rasyid Alafasy',
  },
  qibla: {
    title: 'Arah kiblat', subtitle: 'Satu arah, menyatukan hati.', deviceCompass: 'KOMPAS PERANTI', simMode: 'MOD SIMULASI · TIADA SENSOR',
    aligned: 'Anda mengadap kiblat ✓', turnToFollow: 'Pusingkan peranti mengikut Kaabah', clockwise: b => `Kiblat ${b}° ikut jam dari utara`, distance: km => `${km} km ke Kaabah`,
    dragHint: 'Leret kompas atau pelungsur', sliderNote: 'Sensor kompas tiada dalam pratonton ini. Leret untuk lihat animasi; di telefon, kompas mengikut gerakan peranti.',
    sensorHint: 'Letak telefon mendatar, jauhi logam, lalu gerakkan bentuk angka lapan untuk tentukur.', lowAccuracy: 'Ketepatan sensor rendah. Tentukur sebelum mengikut arah.', changeLocation: 'Tukar lokasi · auto / manual',
  },
  alarms: {
    title: 'Penggera zikir', subtitle: 'Bangun dan berhenti sejenak dengan kalimah baik.', addLabel: 'Tambah penggera', nextBadge: 'PENGGERA SETERUSNYA', noneBadge: 'TIADA PENGGERA AKTIF',
    setFirst: 'Tetapkan penggera pertama', setFirstDesc: 'Pilih tarikh, masa, dan zikir yang ingin diucapkan ketika bangun.', permissionBanner: 'Kebenaran notifikasi tidak aktif, jadi penggera belum boleh berbunyi di telefon ini. Ketik untuk membenarkan.',
    emptyTitle: 'Tiada penggera lagi', emptyDesc: 'Tambah penggera untuk Subuh, Tahajud, atau peringatan zikir bila-bila masa.', add: 'Tambah penggera', tryTone: 'Cuba bunyi', phoneClock: 'Jam telefon', delete: 'Padam',
    editTitle: 'Ubah penggera', passedPickNew: 'Waktu penggera ini sudah berlalu. Pilih tarikh baharu.', on: t => `Penggera ${t} aktif.`, off: t => `Penggera ${t} dimatikan.`, removed: 'Penggera dipadam.',
    info: {
      web: 'Dalam pratonton web, penggera hanya disimpan. Buka Azam melalui Expo Go atau binaan telefon supaya penggera benar-benar berbunyi dengan suara dan getaran.',
      android: 'Penggera berbunyi sebagai notifikasi bersuara dan bergetar walaupun Azam ditutup. “Jam telefon” turut menetapkannya dalam aplikasi Jam terbina.',
      ios: 'Penggera berbunyi sebagai notifikasi bersuara dan bergetar walaupun Azam ditutup. Pastikan mod Fokus/Senyap membenarkan notifikasi Azam.',
    },
  },
  hajj: {
    title: 'Haji & Umrah', subtitle: 'Langkah demi langkah, doa demi doa.', guideBadge: 'PANDUAN BERPERINGKAT', allDone: 'Semua langkah selesai', allDoneSub: 'Semoga menjadi haji yang mabrur.', nextStepOf: phase => `Langkah seterusnya · ${phase}`,
    nextStepTag: 'LANGKAH SETERUSNYA', markDone: 'Tanda selesai', markUndone: 'Tanda belum selesai', forbiddenTitle: 'Larangan ketika ihram', talbiyah: 'TALBIAH',
    resetButton: 'Set semula kemajuan manasik', resetDone: 'Kemajuan manasik ditetapkan semula.', footer: 'Ringkasan pendidikan berdasarkan manasik umum. Ikut pembimbing/KBIH rasmi untuk pelaksanaan.',
    doneNext: title => `Selesai. Seterusnya: ${title}`, allComplete: 'Masya Allah, semua langkah selesai. Semoga haji mabrur.', progressReset: 'Kemajuan manasik ditetapkan semula.',
    phases: {
      persiapan: { short: 'Persiapan', intro: 'Bekal ilmu, fizikal, dan hati sebelum ke Tanah Suci.' },
      umrah: { short: 'Umrah', intro: 'Ihram → tawaf → saie → tahalul. Lakukan secara berurutan.' },
      haji: { short: 'Haji', intro: 'Kemuncak: Mina, Arafah, Muzdalifah, jamrah, tawaf ifadah.' },
    },
    steps: {
      p1: { title: 'Luruskan niat & selesaikan urusan', text: 'Niatkan hanya kerana Allah. Langsaikan hutang, minta maaf kepada keluarga dan jiran, tinggalkan nafkah untuk yang ditinggalkan.', duaLabel: 'Doa memohon keikhlasan', arti: 'Ya Allah, jadikanlah ini haji yang mabrur dan dosa yang diampuni.' },
      p2: { title: 'Belajar manasik', text: 'Ikut bimbingan manasik KBIH/pihak berkuasa. Fahami rukun, wajib, sunat, dan larangan ihram agar ibadah tertib.' },
      p3: { title: 'Kesihatan & dokumen', text: 'Vaksin meningitis, pemeriksaan kesihatan, pasport, visa, gelang pengenalan, ubat peribadi, dua set pakaian ihram, selipar, dan beg kecil.' },
      p4: { title: 'Doa keluar rumah & bermusafir', text: 'Solat dua rakaat sebelum berangkat, berpamitan dengan keluarga, dan berdoa ketika kenderaan mula bergerak.', duaLabel: 'Doa musafir', arti: 'Maha Suci Allah yang menundukkan kenderaan ini untuk kami, dan kepada Tuhan kami kami akan kembali.' },
      u1: { title: 'Ihram dari miqat', text: 'Mandi, pakai wangian pada badan (bukan kain ihram), kenakan ihram, solat dua rakaat, lalu berniat ketika melintasi miqat.', duaLabel: 'Niat umrah', arti: 'Ya Allah, aku sahut panggilan-Mu untuk berumrah.' },
      u2: { title: 'Talbiah sepanjang perjalanan', text: 'Ucapkan talbiah berulang sehingga memulakan tawaf. Lelaki menguatkan suara, wanita memperlahankan.', duaLabel: 'Talbiah', arti: 'Aku datang menyahut panggilan-Mu ya Allah. Tiada sekutu bagi-Mu. Segala puji, nikmat, dan kerajaan milik-Mu.' },
      u3: { title: 'Masuk Masjidil Haram', text: 'Masuk dengan kaki kanan, berdoa, lalu menuju Kaabah. Apabila melihat Kaabah, angkat tangan dan berdoa apa sahaja.', duaLabel: 'Doa masuk masjid', arti: 'Dengan nama Allah, selawat dan salam ke atas Rasulullah. Ya Allah, bukakan untukku pintu-pintu rahmat-Mu.' },
      u4: { title: 'Tawaf tujuh pusingan', text: 'Mula dari garisan Hajar Aswad, Kaabah di sebelah kiri. Setiap pusingan isyaratkan tangan ke Hajar Aswad sambil takbir. Antara Rukun Yamani dan Hajar Aswad baca doa sapu jagat.', duaLabel: 'Antara Rukun Yamani & Hajar Aswad', arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan akhirat, dan lindungilah kami daripada azab neraka.' },
      u5: { title: 'Solat di belakang Maqam Ibrahim & minum zamzam', text: 'Dua rakaat ringan (Al-Kafirun & Al-Ikhlas), lalu minum air zamzam mengadap Kaabah sambil berdoa.', duaLabel: 'Doa minum zamzam', arti: 'Ya Allah, aku memohon ilmu bermanfaat, rezeki luas, dan kesembuhan daripada segala penyakit.' },
      u6: { title: 'Saie Safa–Marwah tujuh kali', text: 'Mula di Safa mengadap Kaabah, bertakbir dan berdoa, lalu berjalan ke Marwah (dikira satu). Lelaki berlari kecil antara dua lampu hijau.', duaLabel: 'Zikir di Safa & Marwah', arti: 'Tiada Tuhan selain Allah Yang Esa, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Maha Kuasa atas segala sesuatu.' },
      u7: { title: 'Tahalul', text: 'Lelaki mencukur atau memendekkan seluruh rambut; wanita memotong sehujung jari. Umrah selesai, larangan ihram gugur.' },
      h1: { title: '8 Zulhijah · Tarwiah', text: 'Berihram haji dari penginapan (bagi tamattu’), berniat, lalu menuju Mina. Bermalam di Mina, solat lima waktu tanpa dijamak.', duaLabel: 'Niat haji', arti: 'Ya Allah, aku sahut panggilan-Mu untuk berhaji.' },
      h2: { title: '9 Zulhijah · Wukuf di Arafah', text: 'Rukun haji. Berada di Arafah dari gelincir matahari hingga terbenam. Solat Zohor & Asar dijamak-qasar. Perbanyak doa, zikir, istighfar, dan talbiah.', duaLabel: 'Doa terbaik di Arafah', arti: 'Tiada Tuhan selain Allah Yang Esa, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Maha Kuasa atas segala sesuatu.' },
      h3: { title: 'Malam 10 · Mabit di Muzdalifah', text: 'Solat Maghrib & Isyak dijamak. Bermalam hingga lewat tengah malam (uzur boleh awal). Kumpulkan batu kerikil untuk jamrah.' },
      h4: { title: '10 Zulhijah · Jamrah Aqabah', text: 'Lontar tujuh batu ke Jamrah Aqabah, bertakbir setiap lontaran. Talbiah berhenti apabila mula melontar.', duaLabel: 'Ketika melontar', arti: 'Dengan nama Allah, Allah Maha Besar.' },
      h5: { title: 'Hadyu & tahalul awal', text: 'Menyembelih hadyu (tamattu’/qiran), lalu mencukur rambut. Tahalul awal: boleh melepas ihram, kecuali hubungan suami isteri.' },
      h6: { title: 'Tawaf Ifadah & Saie haji', text: 'Rukun haji. Tawaf tujuh pusingan lalu saie. Selepasnya tahalul thani: seluruh larangan ihram gugur.', duaLabel: 'Antara Rukun Yamani & Hajar Aswad', arti: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan akhirat, dan lindungilah kami daripada azab neraka.' },
      h7: { title: '11–13 Zulhijah · Mabit di Mina & tiga jamrah', text: 'Bermalam di Mina. Setiap hari selepas zawal lontar Ula, Wusta, lalu Aqabah, tujuh batu setiap satu. Nafar awal: pulang 12 Zulhijah sebelum terbenam; nafar thani: 13 Zulhijah.' },
      h8: { title: 'Tawaf Wada’', text: 'Tawaf perpisahan sebelum meninggalkan Makkah, tanpa saie. Perbanyak doa dan syukur.', duaLabel: 'Doa perpisahan', arti: 'Ya Allah, jangan jadikan ini kunjungan terakhirku ke rumah-Mu yang mulia.' },
    },
    forbidden: ['Memakai pakaian berjahit (lelaki) & menutup wajah/tapak tangan (wanita)', 'Memotong rambut atau kuku', 'Memakai wangian selepas ihram', 'Memburu / membunuh haiwan darat', 'Berkahwin, meminang, atau berhubungan suami isteri', 'Bertengkar dan berkata kotor'],
    talbiyahArti: 'Aku datang menyahut panggilan-Mu ya Allah. Tiada sekutu bagi-Mu. Segala puji, nikmat, dan kerajaan milik-Mu.',
  },
};

const ar: ScreenText = {
  quran: {
    title: 'القرآن', subtitle: 'كل آية خطوة أقرب.', searchPlaceholder: 'ابحث عن سورة أو معنى…',
    filterAll: 'الكل', makki: 'مكية', madani: 'مدنية',
    eyebrow: 'مساحة للقلب', continueReading: 'متابعة القراءة', startBismillah: 'ابدأ بالبسملة', surahVerse: (s, v) => `سورة ${s} · آية ${v}`, fullList: '١١٤ سورة مع الترجمة كاملة',
    empty: 'لم يتم العثور على السورة. جرّب اسمًا أو رقمًا آخر.', verses: 'آية', listSource: 'النص والترجمة · EQuran.id',
    readerTitle: 'قراءة القرآن', readerSubtitle: 'اقرأ بتأنٍّ، وتدبّر معناه.', translation: 'الترجمة', latin: 'اللاتينية', murottal: 'تلاوة', pause: 'إيقاف',
    ayatBadge: (place, n) => `${place} · ${n} آية`, ambientLabel: 'الأجواء الهادئة والصوت',
    audioError: 'تعذّر تشغيل الصوت. تحقّق من الاتصال وحاول مجددًا.', audioUnavailable: 'تلاوة هذه السورة غير متاحة بعد.', bookmarkSaved: 'تم حفظ علامة القراءة.', readerSource: 'المصدر: EQuran.id · التلاوة: مشاري راشد العفاسي',
  },
  qibla: {
    title: 'اتجاه القبلة', subtitle: 'اتجاه واحد يوحّد القلوب.', deviceCompass: 'بوصلة الجهاز', simMode: 'وضع المحاكاة · بلا مستشعر',
    aligned: 'أنت تستقبل القبلة ✓', turnToFollow: 'أدر جهازك ليتبع الكعبة', clockwise: b => `القبلة ${b}° باتجاه عقارب الساعة من الشمال`, distance: km => `${km} كم إلى الكعبة`,
    dragHint: 'اسحب البوصلة أو المؤشر', sliderNote: 'مستشعر البوصلة غير متاح في هذه المعاينة. اسحب لرؤية الحركة؛ على الهاتف تتبع البوصلة حركة الجهاز.',
    sensorHint: 'ضع الهاتف مستويًا بعيدًا عن المعادن، ثم حرّكه على شكل رقم ثمانية للمعايرة.', lowAccuracy: 'دقة المستشعر منخفضة. عايره قبل اتباع الاتجاه.', changeLocation: 'تغيير الموقع · تلقائي / يدوي',
  },
  alarms: {
    title: 'منبّه الذكر', subtitle: 'استيقظ وتوقّف لحظة بكلمة طيبة.', addLabel: 'إضافة منبّه', nextBadge: 'المنبّه التالي', noneBadge: 'لا يوجد منبّه مفعّل بعد',
    setFirst: 'اضبط منبّهك الأول', setFirstDesc: 'اختر التاريخ والوقت والذكر الذي تودّ قوله عند الاستيقاظ.', permissionBanner: 'إذن الإشعارات متوقف، لذا لا يمكن للمنبّه أن يرنّ على هذا الهاتف. اضغط للسماح.',
    emptyTitle: 'لا توجد منبّهات بعد', emptyDesc: 'أضف منبّهًا للفجر أو التهجّد أو تذكير الذكر في أي وقت.', add: 'إضافة منبّه', tryTone: 'جرّب الصوت', phoneClock: 'ساعة الهاتف', delete: 'حذف',
    editTitle: 'تعديل المنبّه', passedPickNew: 'انقضى وقت هذا المنبّه. اختر تاريخًا جديدًا.', on: t => `المنبّه ${t} مفعّل.`, off: t => `المنبّه ${t} متوقف.`, removed: 'تم حذف المنبّه.',
    info: {
      web: 'في معاينة الويب، تُحفظ المنبّهات فقط. افتح عزم عبر Expo Go أو بنسخة الهاتف كي ترنّ المنبّهات فعليًا بالصوت والاهتزاز.',
      android: 'ترنّ المنبّهات كإشعار بصوت واهتزاز حتى مع إغلاق عزم. «ساعة الهاتف» تضبطها أيضًا في تطبيق الساعة المدمج.',
      ios: 'ترنّ المنبّهات كإشعار بصوت واهتزاز حتى مع إغلاق عزم. تأكّد أن وضع التركيز/الصامت يسمح بإشعارات عزم.',
    },
  },
  hajj: {
    title: 'الحج والعمرة', subtitle: 'خطوة بخطوة، ودعاء بدعاء.', guideBadge: 'دليل متدرّج', allDone: 'اكتملت جميع الخطوات', allDoneSub: 'نسأل الله حجًّا مبرورًا.', nextStepOf: phase => `الخطوة التالية · ${phase}`,
    nextStepTag: 'الخطوة التالية', markDone: 'تحديد كمنجز', markUndone: 'تحديد كغير منجز', forbiddenTitle: 'محظورات الإحرام', talbiyah: 'التلبية',
    resetButton: 'إعادة ضبط تقدّم المناسك', resetDone: 'أُعيد ضبط تقدّم المناسك.', footer: 'ملخّص تعليمي وفق المناسك العامة. اتبع مرشدًا رسميًا للتنفيذ.',
    doneNext: title => `تم. التالي: ${title}`, allComplete: 'ما شاء الله، اكتملت الخطوات. نسأل الله أن يتقبّل حجّك.', progressReset: 'أُعيد ضبط تقدّم المناسك.',
    phases: {
      persiapan: { short: 'الاستعداد', intro: 'زاد من العلم والبدن والقلب قبل التوجّه إلى الأرض المقدّسة.' },
      umrah: { short: 'العمرة', intro: 'الإحرام ← الطواف ← السعي ← التحلّل. أدِّها بالترتيب.' },
      haji: { short: 'الحج', intro: 'الذروة: منى، عرفة، مزدلفة، الجمرات، طواف الإفاضة.' },
    },
    steps: {
      p1: { title: 'أخلص النية وسوِّ أمورك', text: 'انوِ لله وحده. اقضِ الديون، واطلب السماح من الأهل والجيران، واترك النفقة لمن تترك.', duaLabel: 'دعاء الإخلاص', arti: 'اللهم اجعله حجًّا مبرورًا وذنبًا مغفورًا.' },
      p2: { title: 'تعلّم المناسك', text: 'اتبع إرشاد المناسك من مجموعتك/الجهة. افهم الأركان والواجبات والسنن ومحظورات الإحرام لينتظم النسك.' },
      p3: { title: 'الصحة والوثائق', text: 'تطعيم الحمى الشوكية، فحص صحي، جواز، تأشيرة، سوار تعريف، دواء شخصي، طقما إحرام، نعل، وحقيبة صغيرة.' },
      p4: { title: 'دعاء الخروج من البيت والسفر', text: 'صلِّ ركعتين قبل السفر، ودّع الأهل، وادعُ عند تحرّك المركبة.', duaLabel: 'دعاء السفر', arti: 'سبحان الذي سخّر لنا هذا وما كنا له مقرنين وإنا إلى ربنا لمنقلبون.' },
      u1: { title: 'الإحرام من الميقات', text: 'اغتسل، وتطيّب في البدن (لا في ثوب الإحرام)، والبس الإحرام، وصلِّ ركعتين، ثم انوِ عند تجاوز الميقات.', duaLabel: 'نية العمرة', arti: 'لبيك اللهم عمرةً.' },
      u2: { title: 'التلبية طوال الطريق', text: 'ردّد التلبية حتى تبدأ الطواف. يرفع الرجال أصواتهم، وتخفض النساء.', duaLabel: 'التلبية', arti: 'لبيك اللهم لبيك، لا شريك لك، إن الحمد والنعمة لك والملك، لا شريك لك.' },
      u3: { title: 'دخول المسجد الحرام', text: 'ادخل بالقدم اليمنى، وادعُ، ثم توجّه إلى الكعبة. وعند رؤيتها ارفع يديك وادعُ بما شئت.', duaLabel: 'دعاء دخول المسجد', arti: 'بسم الله والصلاة والسلام على رسول الله، اللهم افتح لي أبواب رحمتك.' },
      u4: { title: 'الطواف سبعة أشواط', text: 'ابدأ من خط الحجر الأسود والكعبة عن يسارك. في كل شوط أشر إلى الحجر مع التكبير. وبين الركن اليماني والحجر اقرأ دعاء «ربنا».', duaLabel: 'بين الركن اليماني والحجر الأسود', arti: 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.' },
      u5: { title: 'الصلاة خلف مقام إبراهيم وشرب زمزم', text: 'ركعتان خفيفتان (الكافرون والإخلاص)، ثم اشرب ماء زمزم مستقبلًا الكعبة داعيًا.', duaLabel: 'دعاء شرب زمزم', arti: 'اللهم إني أسألك علمًا نافعًا ورزقًا واسعًا وشفاءً من كل داء.' },
      u6: { title: 'السعي بين الصفا والمروة سبعًا', text: 'ابدأ عند الصفا مستقبلًا الكعبة، كبّر وادعُ، ثم امشِ إلى المروة (تُحسب واحدًا). يهرول الرجال بين العلمين الأخضرين.', duaLabel: 'ذكر الصفا والمروة', arti: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.' },
      u7: { title: 'التحلّل', text: 'يحلق الرجال أو يقصّرون كل الشعر؛ وتقصّ النساء قدر أُنملة. تمّت العمرة وسقطت محظورات الإحرام.' },
      h1: { title: '٨ ذو الحجة · التروية', text: 'أحرم بالحج من مسكنك (للمتمتّع)، وانوِ، ثم توجّه إلى منى. بت بمنى وصلِّ الخمس بلا جمع.', duaLabel: 'نية الحج', arti: 'لبيك اللهم حجًّا.' },
      h2: { title: '٩ ذو الحجة · الوقوف بعرفة', text: 'ركن الحج. الْبَث بعرفة من الزوال إلى الغروب. اجمع واقصر الظهر والعصر. أكثِر من الدعاء والذكر والاستغفار والتلبية.', duaLabel: 'خير الدعاء بعرفة', arti: 'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.' },
      h3: { title: 'ليلة العاشر · المبيت بمزدلفة', text: 'اجمع المغرب والعشاء. بت حتى منتصف الليل (ويجوز للضعفاء التقدّم). اجمع الحصى للجمرات.' },
      h4: { title: '١٠ ذو الحجة · جمرة العقبة', text: 'ارمِ سبع حصيات عند جمرة العقبة مع التكبير في كل رمية. تنقطع التلبية عند بدء الرمي.', duaLabel: 'عند الرمي', arti: 'بسم الله، الله أكبر.' },
      h5: { title: 'الهدي والتحلّل الأول', text: 'انحر الهدي (للمتمتّع/القارن)، ثم احلق الشعر. التحلّل الأول: يجوز خلع الإحرام إلا الجماع.' },
      h6: { title: 'طواف الإفاضة وسعي الحج', text: 'ركن الحج. طُف سبعًا ثم اسعَ. بعده التحلّل الثاني: تسقط كل محظورات الإحرام.', duaLabel: 'بين الركن اليماني والحجر الأسود', arti: 'ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار.' },
      h7: { title: '١١–١٣ ذو الحجة · المبيت بمنى والجمرات الثلاث', text: 'بت بمنى. كل يوم بعد الزوال ارمِ الأولى ثم الوسطى ثم العقبة، سبع حصيات لكلٍّ. النفر الأول: الخروج ١٢ قبل الغروب؛ النفر الثاني: ١٣.' },
      h8: { title: 'طواف الوداع', text: 'طواف الوداع قبل مغادرة مكة بلا سعي. أكثِر من الدعاء والشكر.', duaLabel: 'دعاء الوداع', arti: 'اللهم لا تجعله آخر العهد ببيتك الحرام.' },
    },
    forbidden: ['لبس المخيط (للرجال) وتغطية الوجه/الكفين (للنساء)', 'قص الشعر أو الأظافر', 'التطيّب بعد الإحرام', 'الصيد أو قتل حيوان البر', 'الزواج أو الخطبة أو الجماع', 'الجدال والفحش في القول'],
    talbiyahArti: 'لبيك اللهم لبيك، لا شريك لك، إن الحمد والنعمة لك والملك، لا شريك لك.',
  },
};

const SCREEN_TEXT: Record<Lang, ScreenText> = { id, en, ms, ar };
export function screenText(lang: Lang): ScreenText { return SCREEN_TEXT[lang] || id; }
