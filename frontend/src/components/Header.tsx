import React from 'react';
import { DownloadCloud, Smartphone, HelpCircle, WifiOff, Settings } from 'lucide-react';

interface HeaderProps {
  isOnline: boolean;
  canInstall: boolean;
  onInstallClick: () => void;
  onHelpClick: () => void;
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isOnline,
  canInstall,
  onInstallClick,
  onHelpClick,
  onSettingsClick,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-pink-500 rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative w-11 h-11 rounded-2xl bg-surface-100 flex items-center justify-center border border-white/10 shadow-xl">
            <DownloadCloud className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              MediaDrop
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              PWA
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            Универсальный загрузчик видео
          </p>
        </div>
      </div>

      {/* Actions and Status */}
      <div className="flex items-center gap-2">
        {/* Server Status Indicator */}
        <div
          onClick={onSettingsClick}
          className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:scale-105 ${
            isOnline
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}
          title="Нажмите, чтобы настроить адрес сервера"
        >
          {isOnline ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">Сервер онлайн</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Офлайн</span>
            </>
          )}
        </div>

        {/* Install PWA Button */}
        {canInstall && (
          <button
            onClick={onInstallClick}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Установить PWA</span>
          </button>
        )}

        {/* How to install Modal trigger */}
        <button
          onClick={onHelpClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 hover:text-white glass-button"
          title="Инструкция по установке на телефон"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden lg:inline">Как установить</span>
        </button>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-full text-slate-400 hover:text-white glass-button hover:border-cyan-500/30 transition-colors"
          title="Настройки подключения к API"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
