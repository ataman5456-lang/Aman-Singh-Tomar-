import React from 'react';
import {
  ArrowLeft,
  Moon,
  Sun,
  Languages,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Language, Theme, ToolId } from '../types';
import { useTranslation } from '../i18n/translations';
import { PWAInstallButton } from './PWAInstallButton';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  currentTool: ToolId;
  onNavigate: (tool: ToolId) => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTool,
  onNavigate,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
}) => {
  const t = useTranslation(lang);
  const isDashboard = currentTool === 'dashboard';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0B071A]/95 text-slate-900 dark:text-white backdrop-blur-md border-b border-slate-200 dark:border-purple-500/20 transition-colors shadow-sm">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Left: Brand or Back Button */}
        <div className="flex items-center gap-2 min-w-0">
          {!isDashboard ? (
            <button
              onClick={() => {
                soundManager.playTap();
                onNavigate('dashboard');
              }}
              className="min-h-[44px] min-w-[44px] -ml-1 flex items-center justify-center rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-95 transition cursor-pointer"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : null}

          <div
            onClick={() => {
              soundManager.playTap();
              onNavigate('dashboard');
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group min-w-0"
          >
            {/* Logo Icon */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-[1.5px] shadow-md shadow-purple-900/30 shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#0B071A] flex items-center justify-center">
                <span className="text-base sm:text-lg font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  P
                </span>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap truncate">
                {t.appName}
              </span>
              <span className="hidden sm:inline text-[10px] text-purple-700 dark:text-purple-300 font-semibold truncate">
                {t.creatorText.tagline}
              </span>
            </div>
          </div>
        </div>

        {/* Right Zone: Controls (Install, Language, Theme, About Creator) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Subtle Creator Credit Pill */}
          <button
            onClick={() => {
              soundManager.playTap();
              onNavigate('about');
            }}
            className={`min-h-[40px] px-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 ${
              currentTool === 'about'
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-500/25 text-purple-800 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/40'
            }`}
            title={t.creatorText.creatorTitle}
          >
            <User className="w-3.5 h-3.5 text-purple-600 dark:text-purple-300" />
            <span className="hidden md:inline">{t.creatorText.creatorName}</span>
            <span className="md:hidden">Aman</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton lang={lang} />

          {/* Language Toggle (Hindi / English) */}
          <button
            onClick={() => {
              soundManager.playTap();
              onToggleLang();
            }}
            className="min-h-[40px] px-2.5 sm:px-3 rounded-xl border border-slate-300 dark:border-purple-500/25 bg-slate-100 dark:bg-purple-950/30 hover:bg-slate-200 dark:hover:bg-purple-900/30 text-slate-800 dark:text-purple-200 text-xs font-bold flex items-center gap-1 active:scale-95 transition cursor-pointer"
            title={lang === 'en' ? 'Switch to Hindi (हिंदी)' : 'Switch to English'}
          >
            <Languages className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Theme Toggle (Dark / Light) */}
          <button
            onClick={() => {
              soundManager.playTap();
              onToggleTheme();
            }}
            className="min-h-[40px] min-w-[40px] rounded-xl border border-slate-300 dark:border-purple-500/25 bg-slate-100 dark:bg-purple-950/30 hover:bg-slate-200 dark:hover:bg-purple-900/30 text-slate-700 dark:text-purple-300 flex items-center justify-center active:scale-95 transition cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
