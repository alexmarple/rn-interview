import React, { useMemo } from 'react';
import { View, Image } from 'react-native';

export function CenteredPhoto({
  uri,
  width,
  height,
  centerX,
  centerY,
  frameWidth,
  frameHeight,
}: {
  uri: string;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  frameWidth: number;
  frameHeight: number;
}) {
  const { scale, tx, ty } = useMemo(() => {
    const s = Math.max(frameWidth / width, frameHeight / height);
    const rawTx = frameWidth / 2 - centerX * s;
    const rawTy = frameHeight / 2 - centerY * s;
    const minTx = frameWidth - width * s;
    const maxTx = 0;
    const minTy = frameHeight - height * s;
    const maxTy = 0;
    return {
      scale: s,
      tx: Math.min(maxTx, Math.max(minTx, rawTx)),
      ty: Math.min(maxTy, Math.max(minTy, rawTy)),
    };
  }, [width, height, centerX, centerY, frameWidth, frameHeight]);

  return (
    <View style={{ width: frameWidth, height: frameHeight, overflow: 'hidden' }}>
      <Image
        source={{ uri }}
        style={{ width: width * scale, height: height * scale, transform: [{ translateX: tx }, { translateY: ty }] }}
      />
    </View>
  );
}


