import React, { useState } from 'react';
import { X, Server, Check, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { getApiBase, setApiBase, checkServerHealth } from '../api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [apiUrl, setApiUrlState] = useState(getApiBase() || '');
  const [isChecking, setIsChecking] = useState(false);
  const [checkStatus, setCheckStatus] = useState<'success' | 'error' | null>(null);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsChecking(true);
    setCheckStatus(null);
    setStatusMsg('');

    // Temporarily test with the typed URL
    const original = getApiBase();
    setApiBase(apiUrl);
    const ok = await checkServerHealth();
    setApiBase(original);

    setIsChecking(false);
    if (ok) {
      setCheckStatus('success');
      setStatusMsg('Соединение успешно установлено! Сервер отвечает.');
    } else {
      setCheckStatus('error');
      setStatusMsg('Не удалось подключиться к серверу. Проверьте адрес и CORS.');
    }
  };

  const handleSave = () => {
    setApiBase(apiUrl);
    onSaved();
    onClose();
  };

  const handleReset = () => {
    setApiUrlState('');
    setApiBase('');
    setCheckStatus(null);
    setStatusMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Настройки подключения к API</h3>
            <p className="text-xs text-slate-400">
              Для работы сайта на GitHub Pages или мобильном приложении
            </p>
          </div>
        </div>

        {/* API URL Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Адрес бэкенд-сервера (API URL):</span>
            <button
              onClick={handleReset}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              Сброс (по умолчанию)
            </button>
          </label>
          <div className="relative">
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => {
                setApiUrlState(e.target.value);
                setCheckStatus(null);
              }}
              placeholder="Оставьте пустым для локального, либо https://..."
              className="w-full bg-surface-100 border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Если сайт запущен на GitHub Pages, укажите здесь адрес вашего бесплатного бэкенда (например на <strong>Render.com</strong> или <strong>Hugging Face</strong>).
          </p>
        </div>

        {/* Status Message */}
        {checkStatus && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              checkStatus === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {checkStatus === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Free Cloud Guide Callout */}
        <div className="glass-card p-3.5 rounded-2xl border border-white/5 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-bold text-cyan-400 text-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Где взять бесплатный бэкенд 24/7?</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Вы можете бесплатно выложить папку <code>/backend</code> на <strong>Render.com</strong> (Free Web Service) или <strong>Hugging Face Spaces</strong> (Free Docker) за 2 минуты, скопировать полученный URL сюда — и ваш сайт на GitHub будет работать автономно навсегда.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isChecking}
            className="flex-1 py-3 rounded-xl font-semibold text-xs glass-button text-slate-200 hover:text-white flex items-center justify-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            <span>{isChecking ? 'Проверка...' : 'Проверить связь'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:opacity-95 shadow-lg shadow-cyan-500/20"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
