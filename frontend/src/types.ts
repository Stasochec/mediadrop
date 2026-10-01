export type PlatformType = 'youtube' | 'tiktok' | 'twitter' | 'other';

export interface FormatOption {
  id: string;
  label: string;
  ext: string;
  quality: string;
  is_audio_only: boolean;
  is_max?: boolean;
  resolution?: string | null;
  note?: string | null;
}

export interface MediaInfo {
  url: string;
  platform: PlatformType;
  title: string;
  author: string;
  thumbnail?: string | null;
  duration?: number | null;
  duration_str?: string | null;
  max_resolution?: string | null;
  formats: FormatOption[];
}

export interface DownloadResponse {
  file_id: string;
  filename: string;
  download_url: string;
  title: string;
  filesize?: number | null;
}

export interface RecentDownloadItem {
  id: string;
  title: string;
  thumbnail?: string | null;
  format: string;
  date: number;
  downloadUrl: string;
}
