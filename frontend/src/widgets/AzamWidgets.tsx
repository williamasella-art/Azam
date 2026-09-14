import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { themes } from '@/src/theme';
import { nextPrayer, WidgetData } from './widgetData';

// Widgets render natively outside React; they use the app's static "Langit" tokens.
const c = themes.light as unknown as Record<keyof typeof themes.light, `#${string}`>;
const FONT = 'PlusJakartaSans-Bold';

/** Home/lock-screen widget: today's verse. */
export function AyatWidget({ data }: { data: WidgetData | null }) {
  const verse = data?.verse;
  return <FlexWidget clickAction="OPEN_APP" style={{ height: 'match_parent', width: 'match_parent', backgroundColor: c.pageTop, borderRadius: 24, padding: 16, flexDirection: 'column', justifyContent: 'space-between' }}>
    <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 'match_parent' }}>
      <TextWidget text="AZAM · SEAYAT HARI INI" style={{ fontSize: 10, color: c.brandTertiary, fontFamily: FONT, letterSpacing: 0.6 }} />
      <TextWidget text={verse ? `QS. ${verse.surah} : ${verse.nomorAyat}` : ''} style={{ fontSize: 10, color: c.goldText, fontFamily: FONT }} />
    </FlexWidget>
    <TextWidget text={verse?.teksArab || 'Buka Azam untuk memuat ayat'} maxLines={2} style={{ fontSize: 20, color: c.onSurface, textAlign: 'right', width: 'match_parent', fontFamily: 'Amiri' }} />
    <TextWidget text={verse ? `“${verse.teksIndonesia}”` : 'Ayat harian tampil setelah aplikasi dibuka sekali.'} maxLines={3} style={{ fontSize: 11, color: c.onSurfaceSecondary, width: 'match_parent', fontFamily: 'PlusJakartaSans-Medium' }} />
  </FlexWidget>;
}

/** Home/lock-screen widget: next prayer countdown. */
export function AzanWidget({ data }: { data: WidgetData | null }) {
  const next = data ? nextPrayer(data) : null;
  return <FlexWidget clickAction="OPEN_APP" style={{ height: 'match_parent', width: 'match_parent', backgroundColor: c.brandDeep, borderRadius: 24, padding: 16, flexDirection: 'column', justifyContent: 'space-between' }}>
    <TextWidget text={next ? `SALAT BERIKUTNYA${next.tomorrow ? ' · BESOK' : ''}` : 'AZAM'} style={{ fontSize: 10, color: c.onBrand, fontFamily: FONT, letterSpacing: 0.6 }} />
    <FlexWidget style={{ flexDirection: 'row', alignItems: 'flex-end', width: 'match_parent', justifyContent: 'space-between' }}>
      <FlexWidget style={{ flexDirection: 'column' }}>
        <TextWidget text={next?.name || 'Jadwal salat'} style={{ fontSize: 16, color: c.onBrand, fontFamily: FONT }} />
        <TextWidget text={next ? next.time.replace(':', '.') : '--.--'} style={{ fontSize: 36, color: c.white, fontFamily: 'PlusJakartaSans-ExtraBold' }} />
      </FlexWidget>
      <FlexWidget style={{ backgroundColor: c.pageTop, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8 }}>
        <TextWidget text={next ? `dalam ${next.label}` : 'buka aplikasi'} style={{ fontSize: 12, color: c.brandTertiary, fontFamily: FONT }} />
      </FlexWidget>
    </FlexWidget>
    <TextWidget text={data ? `${data.city} · diperbarui saat Azam dibuka` : 'Buka Azam sekali untuk memuat jadwal.'} style={{ fontSize: 10, color: c.onBrand, fontFamily: 'PlusJakartaSans-Medium' }} />
  </FlexWidget>;
}
