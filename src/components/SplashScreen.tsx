import React, { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { useTranslation } from '../i18n/translations';
import { soundManager } from '../utils/sound';

interface SplashScreenProps {
  onComplete: () => void;
  lang: Language;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, lang }) => {
  const t = useTranslation(lang);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Auto-dismiss after 2.2 seconds for a fast, snappy experience
    const timer = setTimeout(() => {
      setFading(true);
      setTimeout(onComplete, 400);
    }, 2200);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleEnter = () => {
    soundManager.playTap();
    setFading(true);
    setTimeout(onComplete, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-b from-[#0B071A] via-[#140D2B] to-[#0A0518] text-white transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-purple-600/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/3 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl"
      />

      {/* Top spacer */}
      <div className="w-full flex justify-end pt-safe">
        <button
          onClick={handleEnter}
          className="text-xs font-semibold text-purple-300/80 hover:text-white px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
        >
          {lang === 'hi' ? 'छोड़ें' : 'Skip'} →
        </button>
      </div>

      {/* Center Branding Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-4">
        {/* Glowing Logo Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 p-[2px] shadow-2xl shadow-purple-600/40">
            <div className="w-full h-full rounded-[22px] bg-[#0B071A] flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent select-none">
                P
              </span>
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-[#0B071A] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
          {t.appName}
        </h1>

        {/* Official Tagline */}
        <p className="text-sm sm:text-base font-semibold text-purple-200 tracking-wide mb-6">
          {t.creatorText.tagline}
        </p>

        {/* Creator Identity Credit Pill */}
        <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-purple-100 space-y-0.5">
          <div className="text-[11px] text-purple-300/90 font-medium uppercase tracking-wider">
            {lang === 'hi' ? 'निर्माता एवं डेवलपर' : 'Created & Developed by'}
          </div>
          <div className="text-sm font-bold text-white tracking-wide">
            {t.creatorText.creatorName}
          </div>
        </div>
      </div>

      {/* Bottom Footer & Start Action */}
      <div className="w-full max-w-xs relative z-10 flex flex-col items-center gap-3 pb-safe">
        <button
          onClick={handleEnter}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-purple-950/40 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
        >
          <span>{lang === 'hi' ? 'ऐप शुरू करें' : 'Get Started'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="text-[11px] text-purple-300/60 font-medium text-center">
          {t.creatorText.copyright}
        </div>
      </div>
    </div>
  );
};
