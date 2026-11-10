import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Hash,
  Sliders,
} from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface PasswordGeneratorProps {
  lang: Language;
}

const PASSPHRASE_WORDS = [
  'amber', 'anchor', 'breeze', 'bridge', 'cactus', 'canyon', 'cedar', 'cloud',
  'comet', 'coral', 'cosmos', 'crater', 'crystal', 'delta', 'desert', 'diamond',
  'dolphin', 'dragon', 'echo', 'ember', 'falcon', 'feather', 'forest', 'fossil',
  'galaxy', 'glacier', 'granite', 'harbor', 'horizon', 'island', 'jasper', 'jungle',
  'lagoon', 'lantern', 'meadow', 'meteor', 'mirage', 'monarch', 'nebula', 'oasis',
  'ocean', 'orbit', 'orchid', 'pebble', 'phoenix', 'planet', 'polar', 'prism',
  'quantum', 'quartz', 'rainbow', 'ravine', 'reef', 'river', 'rocket', 'ruby',
  'safari', 'sapphire', 'shadow', 'sierra', 'silver', 'solar', 'spark', 'summit',
  'thunder', 'timber', 'topaz', 'valley', 'velvet', 'vortex', 'voyage', 'whisper',
  'willow', 'zenith', 'zephyr', 'zodiac'
];

export const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ lang }) => {
  const t = useTranslation(lang);

  const [mode, setMode] = useState<'password' | 'passphrase' | 'pin'>('password');
  const [length, setLength] = useState(16);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(true);

  const [wordCount, setWordCount] = useState(4);
  const [pinLength, setPinLength] = useState(6);

  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [recentPasswords, setRecentPasswords] = useState<string[]>([]);

  // Generator function
  const generate = () => {
    soundManager.playTap();
    let result = '';

    if (mode === 'password') {
      let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
      let numberChars = '0123456789';
      let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (avoidAmbiguous) {
        upperChars = upperChars.replace(/[IO]/g, '');
        lowerChars = lowerChars.replace(/[l1o]/g, '');
        numberChars = numberChars.replace(/[01]/g, '');
        symbolChars = symbolChars.replace(/[|]/g, '');
      }

      let charset = '';
      const guaranteed: string[] = [];

      if (includeUpper && upperChars) {
        charset += upperChars;
        guaranteed.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
      }
      if (includeLower && lowerChars) {
        charset += lowerChars;
        guaranteed.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
      }
      if (includeNumbers && numberChars) {
        charset += numberChars;
        guaranteed.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
      }
      if (includeSymbols && symbolChars) {
        charset += symbolChars;
        guaranteed.push(symbolChars[Math.floor(Math.random() * symbolChars.length)]);
      }

      if (!charset) {
        charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
      }

      const randomBytes = new Uint32Array(length);
      window.crypto.getRandomValues(randomBytes);

      const passChars: string[] = [...guaranteed];
      for (let i = guaranteed.length; i < length; i++) {
        passChars.push(charset[randomBytes[i] % charset.length]);
      }

      // Shuffle array
      for (let i = passChars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passChars[i], passChars[j]] = [passChars[j], passChars[i]];
      }
      result = passChars.join('');
    } else if (mode === 'passphrase') {
      const chosenWords: string[] = [];
      const randomIndices = new Uint32Array(wordCount);
      window.crypto.getRandomValues(randomIndices);
      for (let i = 0; i < wordCount; i++) {
        chosenWords.push(PASSPHRASE_WORDS[randomIndices[i] % PASSPHRASE_WORDS.length]);
      }
      result = chosenWords.join('-');
    } else if (mode === 'pin') {
      const digits = new Uint32Array(pinLength);
      window.crypto.getRandomValues(digits);
      result = Array.from(digits)
        .map((d) => d % 10)
        .join('');
    }

    setGeneratedPassword(result);
    setRecentPasswords((prev) => [result, ...prev.slice(0, 4)]);
  };

  // Generate on initial load or mode toggle
  useEffect(() => {
    generate();
  }, [mode, length, includeUpper, includeLower, includeNumbers, includeSymbols, avoidAmbiguous, wordCount, pinLength]);

  // Entropy and Strength calculation
  const strengthInfo = useMemo(() => {
    if (!generatedPassword) {
      return { score: 0, label: t.passwordText.strengthLevels.weak, color: 'bg-rose-500' };
    }

    let pool = 0;
    if (mode === 'password') {
      if (includeUpper) pool += 26;
      if (includeLower) pool += 26;
      if (includeNumbers) pool += 10;
      if (includeSymbols) pool += 30;
      if (pool === 0) pool = 10;
    } else if (mode === 'passphrase') {
      pool = PASSPHRASE_WORDS.length;
    } else {
      pool = 10;
    }

    const entropy = mode === 'passphrase'
      ? wordCount * Math.log2(pool)
      : generatedPassword.length * Math.log2(pool);

    if (entropy < 35) {
      return { score: 20, label: t.passwordText.strengthLevels.veryWeak, color: 'bg-rose-500' };
    } else if (entropy < 55) {
      return { score: 45, label: t.passwordText.strengthLevels.weak, color: 'bg-amber-500' };
    } else if (entropy < 75) {
      return { score: 75, label: t.passwordText.strengthLevels.strong, color: 'bg-blue-500' };
    } else {
      return { score: 100, label: t.passwordText.strengthLevels.veryStrong, color: 'bg-emerald-500' };
    }
  }, [generatedPassword, mode, includeUpper, includeLower, includeNumbers, includeSymbols, wordCount, t]);

  const handleCopy = () => {
    if (!generatedPassword) return;
    navigator.clipboard.writeText(generatedPassword);
    soundManager.playSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Generated Password Showcase Card */}
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/60 dark:via-indigo-950/50 dark:to-blue-950/60 rounded-2xl p-5 border border-purple-200 dark:border-purple-500/30 text-center relative shadow-sm dark:shadow-none">
        <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 tracking-wide uppercase">
          {mode === 'password' ? t.passwordText.modePassword : mode === 'passphrase' ? t.passwordText.modePassphrase : t.passwordText.modePin}
        </span>

        {/* Display Box */}
        <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#0F0824]/90 border border-slate-200 dark:border-purple-500/30 shadow-xs dark:shadow-none flex items-center justify-between gap-3">
          <div className="font-mono text-base sm:text-xl font-bold text-slate-900 dark:text-white break-all select-all text-left">
            {generatedPassword}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={generate}
              className="p-2 rounded-lg bg-slate-100 dark:bg-purple-950/50 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-purple-900/50 transition cursor-pointer"
              title={t.passwordText.regenerate}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.copy}</span>
            </button>
          </div>
        </div>

        {/* Strength Meter Bar */}
        <div className="mt-4 text-left">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium mb-1.5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{t.passwordText.strength}: <strong>{strengthInfo.label}</strong></span>
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{generatedPassword.length} chars</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-purple-950/50 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${strengthInfo.color}`}
              style={{ width: `${strengthInfo.score}%` }}
            />
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-purple-950/30 rounded-xl border border-slate-200 dark:border-purple-500/15">
        <button
          onClick={() => {
            soundManager.playTap();
            setMode('password');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            mode === 'password'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          {t.passwordText.modePassword}
        </button>
        <button
          onClick={() => {
            soundManager.playTap();
            setMode('passphrase');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            mode === 'passphrase'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          {t.passwordText.modePassphrase}
        </button>
        <button
          onClick={() => {
            soundManager.playTap();
            setMode('pin');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            mode === 'pin'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          {t.passwordText.modePin}
        </button>
      </div>

      {/* Controls & Configuration */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none space-y-4">
        {mode === 'password' && (
          <>
            {/* Length Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>{t.passwordText.length}</span>
                <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-sm">{length}</span>
              </div>
              <input
                type="range"
                min="6"
                max="48"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 hover:bg-slate-100 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-purple-500/15 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-purple-950 border-slate-300 dark:border-purple-500/30"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t.passwordText.uppercase}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 hover:bg-slate-100 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-purple-500/15 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-purple-950 border-slate-300 dark:border-purple-500/30"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t.passwordText.lowercase}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 hover:bg-slate-100 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-purple-500/15 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-purple-950 border-slate-300 dark:border-purple-500/30"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t.passwordText.numbers}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 hover:bg-slate-100 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-purple-500/15 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-purple-950 border-slate-300 dark:border-purple-500/30"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t.passwordText.symbols}</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 hover:bg-slate-100 dark:hover:bg-purple-950/30 border border-slate-200 dark:border-purple-500/15 cursor-pointer sm:col-span-2">
                <input
                  type="checkbox"
                  checked={avoidAmbiguous}
                  onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-white dark:bg-purple-950 border-slate-300 dark:border-purple-500/30"
                />
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{t.passwordText.avoidAmbiguous}</span>
              </label>
            </div>
          </>
        )}

        {mode === 'passphrase' && (
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>{t.passwordText.wordCount}</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-sm">{wordCount} words</span>
            </div>
            <input
              type="range"
              min="3"
              max="7"
              value={wordCount}
              onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        )}

        {mode === 'pin' && (
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              <span>{t.passwordText.pinLength}</span>
              <span className="text-purple-600 dark:text-purple-400 font-mono font-bold text-sm">{pinLength} digits</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              value={pinLength}
              onChange={(e) => setPinLength(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Session History List */}
      {recentPasswords.length > 1 && (
        <div className="bg-[#140D2B] rounded-2xl p-4 border border-purple-500/20">
          <h4 className="text-xs font-bold text-slate-300 mb-2.5">
            {t.passwordText.recentPasswords}
          </h4>
          <div className="space-y-1.5 font-mono text-xs text-slate-400">
            {recentPasswords.slice(1).map((pass, i) => (
              <div
                key={i}
                onClick={() => {
                  navigator.clipboard.writeText(pass);
                  soundManager.playSuccess();
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center justify-between p-2 rounded-lg bg-purple-950/20 hover:bg-purple-900/30 cursor-pointer transition"
              >
                <span className="truncate mr-2 text-slate-300">{pass}</span>
                <Copy className="w-3 h-3 text-slate-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
