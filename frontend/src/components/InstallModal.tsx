import React from 'react';
import { X, Smartphone, Share, PlusSquare, MoreVertical, Download } from 'lucide-react';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstall: boolean;
  onInstallClick: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  canInstall,
  onInstallClick,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Установка MediaDrop</h3>
            <p className="text-xs text-slate-400">
              Полноценное приложение без рекламы на вашем смартфоне
            </p>
          </div>
        </div>

        {/* 1-Click Install Button if supported by browser */}
        {canInstall && (
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2.5">
            <p className="text-xs text-cyan-200">
              Ваш браузер поддерживает прямую быструю установку:
            </p>
            <button
              onClick={() => {
                onInstallClick();
                onClose();
              }}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-95 text-white shadow-lg shadow-cyan-500/25"
            >
              <Download className="w-4 h-4" />
              <span>Установить сейчас в 1 клик</span>
            </button>
          </div>
        )}

        {/* Guide: iOS & Android */}
        <div className="space-y-4 text-sm text-slate-300">
          {/* iOS Safari */}
          <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="text-cyan-400">🍏 Apple iPhone (Safari)</span>
            </div>
            <ol className="text-xs space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">
                  1
                </span>
                <span>
                  Нажмите на кнопку <Share className="w-3.5 h-3.5 inline mx-1 text-cyan-400" />
                  <strong>«Поделиться»</strong> в нижней панели Safari.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">
                  2
                </span>
                <span>
                  Прокрутите вниз и выберите <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-cyan-400" />
                  <strong>«На экран "Домой"»</strong>.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0">
                  3
                </span>
                <span>Нажмите <strong>«Добавить»</strong> в правом верхнем углу.</span>
              </li>
            </ol>
          </div>

          {/* Android Chrome */}
          <div className="glass-card p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <span className="text-emerald-400">🤖 Android (Chrome / Яндекс)</span>
            </div>
            <ol className="text-xs space-y-2 text-slate-300">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">
                  1
                </span>
                <span>
                  Нажмите на меню <MoreVertical className="w-3.5 h-3.5 inline mx-1 text-emerald-400" />
                  (три точки в углу браузера).
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-emerald-400 shrink-0">
                  2
                </span>
                <span>
                  Выберите пункт <strong>«Установить приложение»</strong> или <strong>«Добавить на гл. экран»</strong>.
                </span>
              </li>
            </ol>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl font-medium text-xs glass-button text-slate-300 hover:text-white"
        >
          Понятно, закрыть
        </button>
      </div>
    </div>
  );
};
