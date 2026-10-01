import React, { useState } from 'react';
import { Download, CheckCircle2, Film, Music, Clock, User, Crown } from 'lucide-react';
import type { MediaInfo, FormatOption } from '../types';
import { requestDownload } from '../api';
import { ProgressBar } from './ProgressBar';
import { ShareButton } from './ShareButton';
import { getPlatformMeta } from '../utils/platform';

interface MediaCardProps {
  info: MediaInfo;
  onDownloadComplete?: (filename: string, downloadUrl: string) => void;
  onError: (msg: string) => void;
  onToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  info,
  onDownloadComplete,
  onError,
  onToast,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>(
    info.formats[0]?.id || 'video_1080'
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const platformMeta = getPlatformMeta(info.platform);

  const handleDownload = async () => {
    if (isDownloading) return;

    try {
      setIsDownloading(true);
      setIsSuccess(false);
      setProgress(15);
      setStatusText('Подготовка потока на сервере...');

      // Smooth progress increments for better UX while yt-dlp processes
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev < 88) return prev + Math.random() * 10;
          return prev;
        });
      }, 350);

      const res = await requestDownload(info.url, selectedFormat);
      clearInterval(interval);

      setProgress(95);
      setStatusText('Сохранение файла...');

      // Initiate actual file download in browser
      const downloadLink = document.createElement('a');
      downloadLink.href = res.download_url;
      downloadLink.setAttribute('download', res.filename);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setProgress(100);
      setIsSuccess(true);
      setStatusText('Файл успешно сохранён!');
      onToast(`«${res.filename}» загружен!`, 'success');

      if (onDownloadComplete) {
        onDownloadComplete(res.filename, res.download_url);
      }

      setTimeout(() => {
        setIsDownloading(false);
        setIsSuccess(false);
        setProgress(0);
      }, 4000);
    } catch (err: any) {
      setIsDownloading(false);
      setProgress(0);
      onError(err.message || 'Ошибка при скачивании файла');
      onToast(err.message || 'Ошибка при скачивании', 'error');
    }
  };

  return (
    <div className="w-full glass-panel rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden animate-fadeIn border border-white/10">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Media Thumbnail & Badges */}
        <div className="relative w-full lg:w-80 shrink-0 group">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-surface-100 border border-white/10 shadow-lg">
            {info.thumbnail ? (
              <img
                src={info.thumbnail}
                alt={info.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-surface-200">
                <Film className="w-12 h-12 text-slate-500" />
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

            {/* Platform Tag */}
            <div className="absolute top-3 left-3">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md ${platformMeta.bg} ${platformMeta.color}`}
              >
                {platformMeta.badge}
              </span>
            </div>

            {/* Max Resolution Badge */}
            {info.max_resolution && (
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Макс: {info.max_resolution}</span>
              </div>
            )}

            {/* Duration Tag */}
            {info.duration_str && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/70 backdrop-blur-md text-slate-200 border border-white/10">
                <Clock className="w-3 h-3 text-cyan-400" />
                <span>{info.duration_str}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Title, Author, Dynamic Quality Selector, and Download CTA */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-2.5">
            <h2
              className="text-base sm:text-lg font-bold text-slate-100 line-clamp-2 leading-snug"
              title={info.title}
            >
              {info.title}
            </h2>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="font-medium text-slate-300">{info.author}</span>
            </div>
          </div>

          {/* Dynamic Format Selection Chips */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Доступные качества этого видео:
              </label>
              <span className="text-[11px] text-cyan-400 font-mono">
                {info.formats.length} вариантов
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
              {info.formats.map((fmt: FormatOption) => {
                const isSelected = selectedFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setSelectedFormat(fmt.id)}
                    disabled={isDownloading}
                    className={`relative p-2.5 rounded-xl text-left border transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-500/25 to-cyan-500/25 border-cyan-400/80 shadow-md shadow-cyan-500/15 ring-1 ring-cyan-400/50'
                        : 'glass-card border-white/5 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    {/* MAX Badge if applicable */}
                    {fmt.is_max && (
                      <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm">
                        MAX
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                        {fmt.is_audio_only ? (
                          <Music className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        ) : (
                          <Film className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        )}
                        <span className="truncate">{fmt.quality}</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300 uppercase">
                        {fmt.ext}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate">
                      {fmt.resolution || fmt.note || fmt.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Progress Indicator (active during download) */}
          {isDownloading && (
            <ProgressBar progress={progress} statusText={statusText} />
          )}

          {/* Action CTAs: Download & Share */}
          <div className="mt-5 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`w-full sm:flex-1 py-3.5 px-6 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl transition-all duration-200 ${
                isSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:opacity-95 text-white hover:scale-[1.01] active:scale-[0.99] shadow-cyan-500/25'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>Скачано!</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>{isDownloading ? 'Обработка потока...' : 'Скачать выбранное качество'}</span>
                </>
              )}
            </button>

            {/* Share Button */}
            <div className="w-full sm:w-auto">
              <ShareButton
                title={info.title}
                url={info.url}
                onCopied={() => onToast('Ссылка скопирована в буфер обмена!', 'success')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
