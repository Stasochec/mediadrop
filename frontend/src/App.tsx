import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { SkeletonLoader } from './components/SkeletonLoader';
import { MediaCard } from './components/MediaCard';
import { InstallModal } from './components/InstallModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import type { ToastMessage } from './components/Toast';
import type { MediaInfo, PlatformType, RecentDownloadItem } from './types';
import { fetchMediaInfo, checkServerHealth } from './api';
import { detectPlatform } from './utils/platform';
import { YouTubeIcon, TikTokIcon, XIcon } from './components/BrandIcons';
import { Sparkles, ShieldCheck, Zap, DownloadCloud, History, Trash2, ArrowUpRight } from 'lucide-react';

export const App: React.FC = () => {
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState<PlatformType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  
  // Modals state
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Recent downloads stored in localStorage
  const [recentDownloads, setRecentDownloads] = useState<RecentDownloadItem[]>(() => {
    try {
      const saved = localStorage.getItem('mediadrop_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Update platform detection on url change
  useEffect(() => {
    setPlatform(detectPlatform(url));
    if (error) setError(null);
  }, [url]);

  const verifyHealth = useCallback(async () => {
    const ok = await checkServerHealth();
    setIsOnline(ok);
  }, []);

  // Periodic health check
  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 15000);
    return () => clearInterval(interval);
  }, [verifyHealth]);

  // PWA install prompt handler
  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        addToast('Приложение успешно установлено!', 'success');
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    } else {
      setIsHelpOpen(true);
    }
  };

  const handleSubmit = async () => {
    if (!url.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setMediaInfo(null);

      const info = await fetchMediaInfo(url);
      setMediaInfo(info);
      addToast('Видео успешно распознано!', 'info');
    } catch (err: any) {
      const msg = err.message || 'Не удалось обработать ссылку.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setMediaInfo(null);
    setError(null);
  };

  const handleDownloadSuccess = (filename: string, downloadUrl: string) => {
    if (!mediaInfo) return;
    const newItem: RecentDownloadItem = {
      id: Math.random().toString(36).substring(2, 9),
      title: mediaInfo.title,
      thumbnail: mediaInfo.thumbnail,
      format: filename.split('.').pop()?.toUpperCase() || 'MP4',
      date: Date.now(),
      downloadUrl: downloadUrl,
    };
    const updated = [newItem, ...recentDownloads.filter((x) => x.title !== newItem.title)].slice(0, 5);
    setRecentDownloads(updated);
    try {
      localStorage.setItem('mediadrop_history', JSON.stringify(updated));
    } catch {}
  };

  const clearHistory = () => {
    setRecentDownloads([]);
    try {
      localStorage.removeItem('mediadrop_history');
    } catch {}
    addToast('История очищена', 'info');
  };

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background glowing ambient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/15 blur-[128px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/15 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-pink-600/10 blur-[128px] pointer-events-none" />

      {/* Header */}
      <Header
        isOnline={isOnline}
        canInstall={canInstall}
        onInstallClick={handleInstallClick}
        onHelpClick={() => setIsHelpOpen(true)}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center justify-center gap-8 z-10">
        {/* Hero Title & Subtitle */}
        <div className="text-center space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Без водяных знаков • Максимальное качество</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Скачивай медиа{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              в один клик
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg mx-auto">
            Вставь ссылку на видео с <strong>YouTube</strong>, <strong>TikTok</strong> или <strong>X (Twitter)</strong> и получи готовый файл прямо на устройство.
          </p>
        </div>

        {/* Central Console: URL Input */}
        <div className="w-full max-w-2xl space-y-3">
          <UrlInput
            url={url}
            onChange={setUrl}
            onSubmit={handleSubmit}
            onClear={handleClear}
            isLoading={isLoading}
            platform={platform}
            onPasteSuccess={() => addToast('Ссылка вставлена из буфера', 'info')}
          />

          {/* Quick Platform Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-400">
            <span className="text-slate-500 text-[11px] uppercase font-bold tracking-wider">Поддерживается:</span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100/60 border border-white/5 text-slate-300">
              <YouTubeIcon className="w-3.5 h-3.5 text-red-500" />
              <span>YouTube & Shorts</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100/60 border border-white/5 text-slate-300">
              <TikTokIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>TikTok без водяного знака</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100/60 border border-white/5 text-slate-300">
              <XIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>X (Twitter) HD</span>
            </div>
          </div>
        </div>

        {/* Dynamic Display: Skeleton or Result Card or Error */}
        <div className="w-full max-w-2xl">
          {isLoading && <SkeletonLoader />}

          {error && !isLoading && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm text-center animate-fadeIn space-y-2">
              <p className="font-semibold">Ошибка загрузки видео</p>
              <p className="text-xs text-rose-300/80">{error}</p>
              {!isOnline && (
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="mt-2 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors"
                >
                  ⚙️ Настроить адрес бэкенда
                </button>
              )}
            </div>
          )}

          {mediaInfo && !isLoading && (
            <MediaCard
              info={mediaInfo}
              onDownloadComplete={handleDownloadSuccess}
              onError={setError}
              onToast={addToast}
            />
          )}
        </div>

        {/* Recent Downloads Section (if any) */}
        {recentDownloads.length > 0 && !mediaInfo && !isLoading && (
          <div className="w-full max-w-2xl glass-card rounded-2xl p-5 border border-white/5 animate-fadeIn">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Недавние загрузки (локально)</span>
              </div>
              <button
                onClick={clearHistory}
                className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Очистить историю"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить</span>
              </button>
            </div>

            <div className="space-y-2">
              {recentDownloads.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100/50 hover:bg-surface-100/90 border border-white/5 transition-all text-xs"
                >
                  <div className="flex items-center gap-3 truncate pr-3">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono font-semibold text-[10px]">
                      {item.format}
                    </span>
                    <span className="text-slate-200 truncate font-medium">{item.title}</span>
                  </div>
                  <a
                    href={item.downloadUrl}
                    download
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-colors shrink-0"
                    title="Скачать повторно"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feature Highlights Grid */}
        {!mediaInfo && !isLoading && (
          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4 text-left">
            <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Молниеносная скорость</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Прямая обработка без ожидания очередей и рекламы.
              </p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <DownloadCloud className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Чистый MP4 & MP3</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Скачивайте видео вплоть до 1080p или конвертируйте в звук.
              </p>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white">Полная приватность</h4>
              <p className="text-[11px] text-slate-400 leading-normal">
                Автоматическое удаление временных файлов через 20 минут.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          MediaDrop © {new Date().getFullYear()} — Универсальный PWA сервис.
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            Настройки API
          </button>
          <span>•</span>
          <button
            onClick={() => setIsHelpOpen(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            Установка на телефон
          </button>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <InstallModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        canInstall={canInstall}
        onInstallClick={handleInstallClick}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={() => {
          verifyHealth();
          addToast('Настройки API сохранены!', 'success');
        }}
      />
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
