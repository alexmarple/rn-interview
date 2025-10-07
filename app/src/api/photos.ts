import { Platform } from 'react-native';
import type { APIPhoto, APIPhotoBase } from '../types/photos';

let resolvedBase: string | null = null;
const candidates: string[] =
  Platform.OS === 'android'
    ? ['http://10.0.2.2:3000', 'http://localhost:3000']
    : ['http://localhost:3000'];

async function pickReachableBase(): Promise<string> {
  if (resolvedBase) return resolvedBase;
  for (const base of candidates) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(`${base}/photos?_limit=1`, {
        signal: controller.signal,
      });
      clearTimeout(id);
      if (res.ok) {
        resolvedBase = base;
        return base;
      }
    } catch (_e) {}
  }
  resolvedBase = candidates[0];
  return resolvedBase;
}

export async function getPhotos(memberId: number): Promise<APIPhoto[]> {
  const base = await pickReachableBase();
  const res = await fetch(`${base}/photos`);
  if (!res.ok) throw new Error('Failed to load photos');
  return res.json();
}

export async function addPhoto(
  memberId: number,
  body: APIPhotoBase,
): Promise<APIPhoto> {
  const base = await pickReachableBase();
  const res = await fetch(`${base}/member/${memberId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to add photo');
  return res.json();
}

export async function updatePhoto(
  id: string,
  body: APIPhotoBase,
): Promise<APIPhoto> {
  const base = await pickReachableBase();
  const res = await fetch(`${base}/photos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to update photo');
  return res.json();
}

export async function deletePhoto(id: string): Promise<void> {
  const base = await pickReachableBase();
  const res = await fetch(`${base}/photos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete photo');
}
