import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { storage } from '@/src/utils/storage';
import { AyatWidget, AzanWidget } from './AzamWidgets';
import { ANDROID_WIDGETS, WIDGET_DATA_KEY, WidgetData } from './widgetData';

/** Headless task Android calls when a widget is added, resized or due for a periodic update. */
export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const data = (await storage.getItem<any>(WIDGET_DATA_KEY, null)) as WidgetData | null;
  switch (props.widgetAction) {
    case 'WIDGET_ADDED': case 'WIDGET_UPDATE': case 'WIDGET_RESIZED':
      props.renderWidget(props.widgetInfo.widgetName === ANDROID_WIDGETS.ayat ? <AyatWidget data={data} /> : <AzanWidget data={data} />);
      break;
    default: break;
  }
}
