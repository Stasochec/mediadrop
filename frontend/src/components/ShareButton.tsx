import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';

interface ShareButtonProps {
  title: string;
  url: string;
  onCopied?: () => void;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ title, url, onCopied }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // Check if Web Share API is available (smartphones & supported browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Скачать: ${title}`,
          text: `Смотри видео: ${title}`,
          url: url || window.location.href,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // Fallback: Copy to clipboard on PC
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url || window.location.href);
        setCopied(true);
        if (onCopied) onCopied();
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium glass-button text-slate-200 hover:text-white transition-all duration-200 hover:border-cyan-500/40"
      title="Поделиться видео с друзьями"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">Ссылка скопирована!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4 text-cyan-400" />
          <span>Поделиться</span>
        </>
      )}
    </button>
  );
};
