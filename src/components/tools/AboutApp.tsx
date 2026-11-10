import React, { useState } from 'react';
import {
  User,
  Camera,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Check,
  Award,
  Layers,
  Heart,
  PlayCircle,
} from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { StorageManager } from '../../utils/storage';
import { soundManager } from '../../utils/sound';

interface AboutAppProps {
  lang: Language;
  onReplaySplash: () => void;
}

export const AboutApp: React.FC<AboutAppProps> = ({ lang, onReplaySplash }) => {
  const t = useTranslation(lang);
  const [avatar, setAvatar] = useState<string | null>(StorageManager.getCreatorAvatar);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Handle local photo upload for creator photo placeholder
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundManager.playTap();
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setAvatar(result);
        StorageManager.setCreatorAvatar(result);
        setSavedFeedback(true);
        soundManager.playSuccess();
        setTimeout(() => setSavedFeedback(false), 2500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleResetPhoto = () => {
    soundManager.playTap();
    setAvatar(null);
    StorageManager.setCreatorAvatar(null);
  };

  const utilitiesCount = 11;

  return (
    <div className="space-y-6 pb-28">
      {/* Hero Creator Showcase Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#4C1D95] via-[#312E81] to-[#1E3A8A] text-white p-6 sm:p-8 shadow-xl border border-purple-400/20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 rounded-full bg-purple-400/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Replaceable Profile Photo Placeholder Container */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-500 p-[2px] shadow-xl">
              <div className="w-full h-full rounded-[14px] bg-[#0F0824] flex items-center justify-center overflow-hidden">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={t.creatorText.creatorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <div className="w-12 h-12 rounded-full bg-purple-600/40 border border-purple-400/30 flex items-center justify-center text-xl font-extrabold text-white">
                      AT
                    </div>
                    <span className="text-[10px] text-purple-300 font-semibold mt-1">
                      Aman Tomar
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Photo Upload Overlay Button */}
            <label
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg border border-purple-400/40 cursor-pointer active:scale-95 transition"
              title={t.creatorText.changePhoto}
            >
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Identity Information */}
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-purple-200">
              <Award className="w-3.5 h-3.5 text-purple-300" />
              <span>{t.creatorText.creatorRole}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.creatorText.creatorName}
            </h2>

            <p className="text-xs sm:text-sm font-medium text-purple-200">
              {t.creatorText.creatorTitle}
            </p>

            <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed max-w-xl pt-1">
              {t.creatorText.creatorBio}
            </p>

            {/* Photo controls feedback */}
            <div className="flex flex-wrap items-center gap-2 pt-2 justify-center sm:justify-start">
              <label className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 cursor-pointer active:scale-95 transition inline-flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                <span>{t.creatorText.changePhoto}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {avatar && (
                <button
                  onClick={handleResetPhoto}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 active:scale-95 transition cursor-pointer"
                >
                  {t.creatorText.resetPhoto}
                </button>
              )}

              {savedFeedback && (
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>{t.creatorText.photoUpdated}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* App Specifications & Philosophy Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* App Overview */}
        <div className="bg-[#140D2B] dark:bg-[#140D2B] bg-white rounded-2xl p-5 border border-purple-500/20 dark:border-purple-500/20 border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white dark:text-white text-slate-900">
              {t.creatorText.aboutAppTitle}
            </h3>
          </div>

          <p className="text-xs text-slate-300 dark:text-slate-300 text-slate-700 leading-relaxed">
            {t.creatorText.aboutAppDesc}
          </p>

          <div className="pt-2 border-t border-purple-500/10 dark:border-purple-500/10 border-slate-100 space-y-1.5 text-xs text-slate-400 dark:text-slate-400 text-slate-600">
            <div className="flex justify-between">
              <span>{lang === 'hi' ? 'ऐप का नाम' : 'App Name'}:</span>
              <strong className="text-white dark:text-white text-slate-900">{t.appName}</strong>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'hi' ? 'टैगलाइन' : 'Tagline'}:</span>
              <strong className="text-purple-300 dark:text-purple-300 text-purple-700">{t.creatorText.tagline}</strong>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'hi' ? 'संस्करण' : 'Version'}:</span>
              <strong className="text-white dark:text-white text-slate-900">{t.creatorText.version}</strong>
            </div>
            <div className="flex justify-between">
              <span>{lang === 'hi' ? 'उपलब्ध टूल्स' : 'Built-in Utilities'}:</span>
              <strong className="text-emerald-400">{utilitiesCount} {lang === 'hi' ? 'ऑफलाइन टूल्स' : 'Offline Tools'}</strong>
            </div>
          </div>
        </div>

        {/* 100% Local Privacy Manifesto */}
        <div className="bg-[#140D2B] dark:bg-[#140D2B] bg-white rounded-2xl p-5 border border-purple-500/20 dark:border-purple-500/20 border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white dark:text-white text-slate-900">
              {t.creatorText.privacyPromise}
            </h3>
          </div>

          <p className="text-xs text-slate-300 dark:text-slate-300 text-slate-700 leading-relaxed">
            {t.creatorText.privacyPromiseDesc}
          </p>

          <div className="p-3 rounded-xl bg-purple-950/30 dark:bg-purple-950/30 bg-purple-50 border border-purple-500/20 text-xs text-purple-200 dark:text-purple-200 text-purple-900">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
              <span>{lang === 'hi' ? 'अमन तोमर का संकल्प' : "Aman Tomar's Commitment"}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-purple-300 dark:text-purple-300 text-purple-800">
              {lang === 'hi'
                ? 'कोई विज्ञापन नहीं, कोई सब्सक्रिप्शन नहीं, कोई गुप्त डेटा संग्रहण नहीं। हमेशा स्वतंत्र एवं सुरक्षित।'
                : 'Zero intrusive advertisements, zero subscriptions, and zero hidden telemetry. Forever offline and private.'}
            </p>
          </div>
        </div>
      </div>

      {/* Replay Intro Screen Action Card */}
      <div className="bg-[#140D2B] dark:bg-[#140D2B] bg-white rounded-2xl p-4 sm:p-5 border border-purple-500/20 dark:border-purple-500/20 border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white dark:text-white text-slate-900">
            {t.creatorText.replayIntro}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-400 text-slate-600 mt-0.5">
            {lang === 'hi'
              ? 'ऐप की सुंदर वेलकम स्क्रीन और निर्माता ब्रांडिंग को पुनः चलाएं।'
              : 'Re-experience the opening branding screen with Aman Tomar credits.'}
          </p>
        </div>

        <button
          onClick={() => {
            soundManager.playTap();
            onReplaySplash();
          }}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
        >
          <PlayCircle className="w-4 h-4" />
          <span>{t.creatorText.replayIntro}</span>
        </button>
      </div>

      {/* Official Legal & Copyright Footer */}
      <div className="text-center pt-4 pb-2 space-y-1">
        <div className="text-xs font-semibold text-purple-300 dark:text-purple-300 text-purple-800">
          {t.appName} · {t.creatorText.versionLabel}
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-400 text-slate-500">
          {t.creatorText.copyright}
        </div>
      </div>
    </div>
  );
};
