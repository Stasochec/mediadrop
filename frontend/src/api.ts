import type { MediaInfo, DownloadResponse } from './types';

const STORAGE_KEY = 'mediadrop_api_url';

export function getApiBase(): string {
  const custom = localStorage.getItem(STORAGE_KEY);
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  // If Vite env variable is set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  // Default relative proxy path
  return '/api';
}

export function setApiBase(url: string) {
  if (!url || !url.trim()) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, url.trim().replace(/\/+$/, ''));
  }
}

function resolveEndpoint(path: string): string {
  const base = getApiBase();
  if (base.endsWith('/api')) {
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return `${base}/api${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function checkServerHealth(): Promise<boolean> {
  try {
    const url = resolveEndpoint('/health');
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'ok';
  } catch (e) {
    return false;
  }
}

export async function fetchMediaInfo(url: string): Promise<MediaInfo> {
  const endpoint = resolveEndpoint('/info');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url: url.trim() }),
  });

  if (!res.ok) {
    let errorDetail = 'Не удалось получить информацию о видео.';
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch (_) {}
    throw new Error(errorDetail);
  }

  return res.json();
}

export async function requestDownload(url: string, formatId: string): Promise<DownloadResponse> {
  const endpoint = resolveEndpoint('/download');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: url.trim(),
      format_id: formatId,
    }),
  });

  if (!res.ok) {
    let errorDetail = 'Не удалось скачать видео.';
    try {
      const errJson = await res.json();
      if (errJson && errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch (_) {}
    throw new Error(errorDetail);
  }

  const data: DownloadResponse = await res.json();
  
  // If download_url is relative, make sure it points to the resolved backend URL
  if (data.download_url && data.download_url.startsWith('/')) {
    const base = getApiBase();
    if (base && !base.startsWith('/')) {
      data.download_url = `${base}${data.download_url}`;
    }
  }

  return data;
}
