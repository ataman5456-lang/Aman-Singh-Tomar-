import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  HardDrive,
  FileCode,
  Check,
} from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { StorageManager } from '../../utils/storage';
import { soundManager } from '../../utils/sound';

interface BackupRestoreProps {
  lang: Language;
  onDataReloaded: () => void;
}

export const BackupRestore: React.FC<BackupRestoreProps> = ({
  lang,
  onDataReloaded,
}) => {
  const t = useTranslation(lang);
  const [jsonInput, setJsonInput] = useState('');
  const [restoreMode, setRestoreMode] = useState<'merge' | 'overwrite'>('merge');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const storageStats = StorageManager.getEstimatedStorageUsage();

  // Export JSON file download
  const handleExportBackup = () => {
    soundManager.playTap();
    const data = StorageManager.exportAllData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `pocketlife-backup-${dateStr}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    soundManager.playSuccess();
    setMessage({
      type: 'success',
      text: lang === 'hi' ? 'बैकअप फ़ाइल सफलतापूर्वक डाउनलोड हो गई!' : 'Backup file downloaded successfully!',
    });
  };

  // Restore via file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundManager.playTap();
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const success = StorageManager.importData(parsed, restoreMode);
        if (success) {
          try {
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
          } catch {}
          soundManager.playSuccess();
          setMessage({ type: 'success', text: t.backupText.backupSuccess });
          onDataReloaded();
        } else {
          setMessage({ type: 'error', text: t.backupText.invalidJson });
        }
      } catch (err) {
        setMessage({ type: 'error', text: t.backupText.invalidJson });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Restore via pasted JSON
  const handleRestorePasted = () => {
    if (!jsonInput.trim()) return;
    soundManager.playTap();
    try {
      const parsed = JSON.parse(jsonInput);
      const success = StorageManager.importData(parsed, restoreMode);
      if (success) {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {}
        soundManager.playSuccess();
        setMessage({ type: 'success', text: t.backupText.backupSuccess });
        setJsonInput('');
        onDataReloaded();
      } else {
        setMessage({ type: 'error', text: t.backupText.invalidJson });
      }
    } catch {
      setMessage({ type: 'error', text: t.backupText.invalidJson });
    }
  };

  // Factory Reset
  const handleResetAll = () => {
    soundManager.playTap();
    StorageManager.wipeAllData();
    setShowResetConfirm(false);
    setMessage({ type: 'success', text: t.backupText.resetSuccess });
    onDataReloaded();
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-2 mb-1">
          <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {t.tools.backup.title}
          </h3>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t.backupText.subtitle}
        </p>

        {/* Local storage insights strip */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-purple-950/25 border border-slate-200 dark:border-purple-500/15">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <HardDrive className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{t.backupText.storageUsed}</span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {storageStats.formatted}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-purple-950/25 border border-slate-200 dark:border-purple-500/15">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <FileCode className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.backupText.totalRecords}</span>
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
              {storageStats.count} {lang === 'hi' ? 'आइटम' : 'records'}
            </div>
          </div>
        </div>
      </div>

      {/* Status Alert Notification */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="p-1 hover:opacity-75 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>{t.backupText.exportTitle}</span>
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {t.backupText.exportDesc}
        </p>

        <button
          onClick={handleExportBackup}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>{t.backupText.downloadBackup}</span>
        </button>
      </div>

      {/* Import / Restore Section */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none space-y-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>{t.backupText.importTitle}</span>
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.backupText.importDesc}
          </p>
        </div>

        {/* Restore Mode Switch (Merge vs Overwrite) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
            {t.backupText.restoreMode}
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-purple-950/20 rounded-xl border border-purple-500/15">
            <button
              type="button"
              onClick={() => {
                soundManager.playTap();
                setRestoreMode('merge');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                restoreMode === 'merge'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.backupText.modeMerge}
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playTap();
                setRestoreMode('overwrite');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                restoreMode === 'overwrite'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.backupText.modeOverwrite}
            </button>
          </div>
        </div>

        {/* File Upload Option */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
            {t.backupText.selectFile}
          </label>
          <label className="flex items-center justify-center gap-2 w-full p-4 rounded-xl border-2 border-dashed border-purple-500/30 hover:border-purple-400 bg-purple-950/15 text-purple-300 text-xs font-semibold cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{lang === 'hi' ? 'JSON बैकअप फ़ाइल चुनें' : 'Choose JSON Backup File'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Paste JSON Option */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">
            {t.backupText.pasteJson}
          </label>
          <textarea
            rows={3}
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{"version": 1, "expenses": [...]}'
            className="w-full p-3 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white font-mono text-xs focus:outline-none focus:border-purple-400 resize-none"
          />
          {jsonInput && (
            <button
              onClick={handleRestorePasted}
              className="mt-2 w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow cursor-pointer"
            >
              {t.backupText.restoreBtn}
            </button>
          )}
        </div>
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-4 sm:p-5 border border-rose-200 dark:border-rose-500/30 space-y-3">
        <div>
          <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{t.backupText.resetTitle}</span>
          </h4>
          <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-1">
            {t.backupText.resetDesc}
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md cursor-pointer active:scale-95"
        >
          {t.backupText.resetBtn}
        </button>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#140D2B] border border-rose-500/40 p-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h3 className="text-sm font-bold text-white mb-2">
              {t.backupText.resetTitle}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              {t.backupText.confirmReset}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                {t.backupText.resetBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
