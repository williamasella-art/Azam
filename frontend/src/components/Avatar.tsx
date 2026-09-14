import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';
import { fileUrl } from '../api';
import { makeStyles } from '../theme';

/** Profile avatar: uploaded photo when available, otherwise a soft initial. */
export function Avatar({ name, photoPath, size = 44, testID }: { name?: string; photoPath?: string | null; size?: number; testID?: string }) {
  const s = useStyles(); const url = fileUrl(photoPath);
  const initial = (name || 'A').trim().charAt(0).toUpperCase();
  return <View testID={testID} style={[s.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
    {url ? <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" transition={150} cachePolicy="memory-disk" />
      : <Text style={[s.initial, { fontSize: size * 0.42 }]}>{initial}</Text>}
  </View>;
}

const useStyles = makeStyles(colors => ({
  wrap: { backgroundColor: colors.brandSecondary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: colors.borderStrong },
  initial: { color: colors.onBrandSecondary, fontWeight: '800' },
}));
