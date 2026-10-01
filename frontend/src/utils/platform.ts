import type { PlatformType } from '../types';

export function detectPlatform(rawUrl: string): PlatformType | null {
  if (!rawUrl) return null;
  const url = rawUrl.toLowerCase().trim();

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (url.includes('twitter.com') || url.includes('x.com')) {
    return 'twitter';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return 'other';
  }
  return null;
}

export function getPlatformMeta(platform: PlatformType | null) {
  switch (platform) {
    case 'youtube':
      return {
        name: 'YouTube',
        color: 'text-red-500',
        bg: 'bg-red-500/10 border-red-500/30',
        gradient: 'from-red-600 to-rose-600',
        badge: 'YouTube / Shorts',
      };
    case 'tiktok':
      return {
        name: 'TikTok',
        color: 'text-cyan-400',
        bg: 'bg-cyan-500/10 border-cyan-500/30',
        gradient: 'from-cyan-500 to-pink-500',
        badge: 'TikTok No-Watermark',
      };
    case 'twitter':
      return {
        name: 'X (Twitter)',
        color: 'text-sky-400',
        bg: 'bg-sky-500/10 border-sky-500/30',
        gradient: 'from-sky-500 to-blue-600',
        badge: 'X / Twitter Video',
      };
    default:
      return {
        name: 'Видеосервис',
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10 border-indigo-500/30',
        gradient: 'from-indigo-500 to-purple-600',
        badge: 'Поддерживаемый ресурс',
      };
  }
}
