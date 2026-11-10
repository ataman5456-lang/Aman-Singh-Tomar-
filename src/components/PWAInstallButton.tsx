import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Language } from '../types';
import { useTranslation } from '../i18n/translations';

interface PWAInstallButtonProps {
  lang: Language;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const t = useTranslation(lang);

  // If already running in standalone PWA mode, don't show prompt
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={() => {
          install();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-md hover:opacity-95 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
        title={t.installApp}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{t.installApp}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border border-purple-500/30 text-purple-300 dark:text-purple-300 hover:bg-purple-900/30 transition-all whitespace-nowrap cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>{t.installIOS}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#140D2B] border border-purple-500/30 p-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white">{t.installIOSGuideTitle}</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5 bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20">
                  <span className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-white inline-flex items-center gap-1"><Share2 className="w-3 h-3 text-blue-400" /> Share</strong> icon in your Safari bottom toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20">
                  <span className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> (+ icon).
                  </span>
                </div>
                <div className="flex items-start gap-2.5 bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20">
                  <span className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-white">"Add"</strong> on top-right. Enjoy full offline access!
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs transition shadow-md"
              >
                {t.close}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
