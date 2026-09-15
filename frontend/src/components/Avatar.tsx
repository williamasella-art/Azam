import { Image } from 'expo-image';
import React from 'react';
import { Image as RNImage, View } from 'react-native';
import { fileUrl } from '../api';
import { IMG } from '../assets';
import { makeStyles } from '../theme';

/** Profile avatar: uploaded photo when available, otherwise the Azam logo as the default. */
export function Avatar({ photoPath, size = 44, testID }: { name?: string; photoPath?: string | null; size?: number; testID?: string }) {
  const s = useStyles(); const url = fileUrl(photoPath);
  return <View testID={testID} style={[s.wrap, { width: size, height: size, borderRadius: size / 2 }]}>
    {url ? <Image source={{ uri: url }} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" transition={150} cachePolicy="memory-disk" />
      : <RNImage source={IMG.logo} style={{ width: size * 0.66, height: size * 0.66 }} resizeMode="contain" accessibilityLabel="Logo Azam" />}
  </View>;
}

const useStyles = makeStyles(colors => ({
  wrap: { backgroundColor: colors.brandSecondary, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: colors.borderStrong },
}));
