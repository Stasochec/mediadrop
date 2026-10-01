import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressBarProps {
  progress: number;
  statusText: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, statusText }) => {
  return (
    <div className="w-full space-y-2 mt-4 animate-fadeIn">
      <div className="flex justify-between items-center text-xs font-medium text-slate-300">
        <div className="flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
          <span>{statusText}</span>
        </div>
        <span className="font-mono text-cyan-400">{Math.round(progress)}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden p-0.5 border border-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-pink-500 transition-all duration-300 shadow-lg shadow-cyan-500/50"
          style={{ width: `${Math.max(5, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
};
