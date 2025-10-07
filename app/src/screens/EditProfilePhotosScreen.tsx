import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { getPhotos, addPhoto, updatePhoto, deletePhoto } from '../api/photos';
import type { APIPhoto } from '../types/photos';
import { CenteredPhoto } from '../components/CenteredPhoto';
import { colors, radius, shadow, spacing } from '../theme';

const MEMBER_ID = 1;
const MAX_SLOTS = 9;

export default function EditProfilePhotosScreen() {
  const [photos, setPhotos] = useState<APIPhoto[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const data = await getPhotos(MEMBER_ID);
      const sorted = [...data].sort((a, b) =>
        a.position === b.position
          ? String(a.id).localeCompare(String(b.id))
          : a.position - b.position,
      );
      const normalized = sorted.map((p, idx) => ({ ...p, position: idx }));
      setPhotos(normalized);
      const changed = normalized.filter((p, idx) => p.position !== idx);
      if (changed.length > 0) {
        try {
          await Promise.all(
            normalized.map(p =>
              updatePhoto(p.id, {
                url: p.url,
                width: p.width,
                height: p.height,
                position: p.position,
                centerX: p.centerX,
                centerY: p.centerY,
              }),
            ),
          );
        } catch (e) {}
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load photos');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onAdd = useCallback(async () => {
    if (!photos) return;
    if (photos.length >= MAX_SLOTS) {
      Alert.alert('Limit reached', `You can have up to ${MAX_SLOTS} photos.`);
      return;
    }
    try {
      setBusy(true);
      const resp = await fetch('https://randomuser.me/api/');
      const json = await resp.json();
      const url: string | undefined = json?.results?.[0]?.picture?.large;
      if (!url) {
        throw new Error('No image URL');
      }
      const size = await new Promise<{ w: number; h: number }>(
        (resolve, reject) => {
          Image.getSize(
            url,
            (w, h) => resolve({ w, h }),
            e => reject(e),
          );
        },
      );
      const created = await addPhoto(MEMBER_ID, {
        url,
        width: size.w,
        height: size.h,
        position: photos.length,
        centerX: Math.round(size.w / 2),
        centerY: Math.round(size.h / 2),
      });
      const next = [...photos, created].map((p, i) => ({ ...p, position: i }));
      setPhotos(next);
    } catch (e) {
      Alert.alert('Error', 'Failed to add photo');
    } finally {
      setBusy(false);
    }
  }, [photos]);

  const onDelete = useCallback(
    async (id: string) => {
      if (!photos) return;
      try {
        setBusy(true);
        await deletePhoto(id);
        const remaining = photos
          .filter(p => p.id !== id)
          .sort((a, b) => a.position - b.position);
        const compacted = remaining.map((p, idx) => ({ ...p, position: idx }));
        setPhotos(compacted);
        await Promise.all(
          compacted.map(p =>
            updatePhoto(p.id, {
              url: p.url,
              width: p.width,
              height: p.height,
              position: p.position,
              centerX: p.centerX,
              centerY: p.centerY,
            }),
          ),
        );
      } catch (e) {
        Alert.alert('Error', 'Failed to delete photo');
      } finally {
        setBusy(false);
      }
    },
    [photos],
  );

  const windowWidth = Dimensions.get('window').width;
  const tileSize = useMemo(() => {
    const gutter = spacing.sm;
    const columns = 3;
    const totalGutter = gutter * (columns + 1);
    return (windowWidth - totalGutter) / columns;
  }, [windowWidth]);

  if (photos == null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  const data: (APIPhoto | { id: 'add' })[] = [...photos, { id: 'add' } as any];

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        contentContainerStyle={{
          paddingHorizontal: spacing.sm,
          paddingBottom: spacing.lg,
        }}
        columnWrapperStyle={{ gap: spacing.sm }}
        data={data}
        keyExtractor={(item: any) => item.id}
        numColumns={3}
        renderItem={({ item, index }: any) => {
          if (item.id === 'add') {
            return (
              <TouchableOpacity
                onPress={onAdd}
                style={{
                  width: tileSize,
                  height: tileSize,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: radius.md,
                  borderWidth: 1,
                  borderColor: colors.divider,
                }}
              >
                <Text
                  style={{
                    fontSize: 28,
                    color: colors.accent,
                    fontWeight: 'bold',
                  }}
                >
                  ＋
                </Text>
              </TouchableOpacity>
            );
          }
          const p: APIPhoto = item as APIPhoto;
          const move = async (fromIdx: number, delta: number) => {
            if (!photos) return;
            const toIdx = fromIdx + delta;
            if (toIdx < 0 || toIdx >= photos.length) return;
            const arr = photos.slice();
            const a = arr[fromIdx];
            const b = arr[toIdx];
            arr[fromIdx] = b;
            arr[toIdx] = a;
            const next = arr.map((p, idx) => ({ ...p, position: idx }));
            setPhotos(next);
            try {
              setBusy(true);
              await Promise.all([
                updatePhoto(next[fromIdx].id, {
                  url: next[fromIdx].url,
                  width: next[fromIdx].width,
                  height: next[fromIdx].height,
                  position: next[fromIdx].position,
                  centerX: next[fromIdx].centerX,
                  centerY: next[fromIdx].centerY,
                }),
                updatePhoto(next[toIdx].id, {
                  url: next[toIdx].url,
                  width: next[toIdx].width,
                  height: next[toIdx].height,
                  position: next[toIdx].position,
                  centerX: next[toIdx].centerX,
                  centerY: next[toIdx].centerY,
                }),
              ]);
            } catch (e) {
              Alert.alert('Error', 'Failed to reorder');
              load();
            } finally {
              setBusy(false);
            }
          };
          return (
            <View style={{ width: tileSize, height: tileSize }}>
              <CenteredPhoto
                uri={p.url}
                width={p.width}
                height={p.height}
                centerX={p.centerX}
                centerY={p.centerY}
                frameWidth={tileSize}
                frameHeight={tileSize}
              />
              <TouchableOpacity
                onPress={() => onDelete(p.id)}
                style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  backgroundColor: colors.overlay,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: colors.textPrimary, fontWeight: 'bold' }}>
                  ×
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  position: 'absolute',
                  bottom: 6,
                  left: 6,
                  right: 6,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <TouchableOpacity
                  onPress={() => move(index, -1)}
                  style={{
                    backgroundColor: colors.overlay,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{ color: colors.textPrimary, fontWeight: 'bold' }}
                  >
                    {'<'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => move(index, 1)}
                  style={{
                    backgroundColor: colors.overlay,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{ color: colors.textPrimary, fontWeight: 'bold' }}
                  >
                    {'>'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
      {busy ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            padding: spacing.sm,
          }}
        >
          <Text style={{ color: colors.textSecondary }}>Saving…</Text>
        </View>
      ) : null}
    </View>
  );
}
