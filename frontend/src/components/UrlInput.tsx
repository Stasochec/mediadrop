import React, { useRef } from 'react';
import { Clipboard, X, ArrowRight, Loader2, Sparkles, Film } from 'lucide-react';
import type { PlatformType } from '../types';
import { getPlatformMeta } from '../utils/platform';
import { YouTubeIcon, TikTokIcon, XIcon } from './BrandIcons';

interface UrlInputProps {
  url: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isLoading: boolean;
  platform: PlatformType | null;
  onPasteSuccess?: () => void;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  url,
  onChange,
  onSubmit,
  onClear,
  isLoading,
  platform,
  onPasteSuccess,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const platformMeta = platform ? getPlatformMeta(platform) : null;

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          onChange(text);
          if (onPasteSuccess) onPasteSuccess();
          inputRef.current?.focus();
        }
      }
    } catch (e) {
      console.warn('Clipboard read failed:', e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && url.trim()) {
      onSubmit();
    }
  };

  const renderPlatformIcon = () => {
    if (!platform) return null;
    switch (platform) {
      case 'youtube':
        return <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />;
      case 'tiktok':
        return <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />;
      case 'twitter':
        return <XIcon className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Film className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="w-full relative">
      {/* Outer Glow container */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-pink-500 rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition duration-300"></div>

        <div className="relative glass-panel rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 shadow-2xl flex flex-col md:flex-row items-center gap-2">
          {/* Input container */}
          <div className="relative flex-1 w-full flex items-center">
            {/* Platform Badge (if detected) */}
            {platformMeta && (
              <div
                className={`absolute left-3.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${platformMeta.bg} ${platformMeta.color} animate-fadeIn`}
              >
                {renderPlatformIcon()}
                <span>{platformMeta.name}</span>
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Вставьте ссылку на YouTube, TikTok или X (Twitter)..."
              disabled={isLoading}
              className={`w-full bg-surface-100/70 border border-white/5 text-slate-100 placeholder:text-slate-500 text-sm sm:text-base rounded-xl sm:rounded-2xl py-3.5 sm:py-4 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                platformMeta ? 'pl-36 pr-24' : 'pl-4 pr-24'
              }`}
            />

            {/* Quick action buttons inside input */}
            <div className="absolute right-3 flex items-center gap-1.5">
              {url ? (
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/10 transition-colors"
                  title="Очистить"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={isLoading}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white glass-button hover:border-cyan-500/40"
                  title="Вставить из буфера обмена"
                >
                  <Clipboard className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Вставить</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !url.trim()}
            className="w-full md:w-auto px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-cyan-500/35 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shrink-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Анализ...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-200" />
                <span>Получить видео</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
