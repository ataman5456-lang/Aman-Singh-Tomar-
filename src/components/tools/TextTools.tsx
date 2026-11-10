import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Search,
  Sparkles,
  AlignLeft,
} from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface TextToolsProps {
  lang: Language;
}

export const TextTools: React.FC<TextToolsProps> = ({ lang }) => {
  const t = useTranslation(lang);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [findWord, setFindWord] = useState('');
  const [replaceWord, setReplaceWord] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Live Statistics
  const stats = useMemo(() => {
    if (!text) {
      return {
        words: 0,
        chars: 0,
        charsNoSpaces: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: '0 min',
        speakingTime: '0 min',
      };
    }

    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const sentences = trimmed
      ? trimmed.split(/[.!?।]+/).filter((s) => s.trim().length > 0).length
      : 0;
    const paragraphs = trimmed
      ? trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length
      : 0;

    const readMinutes = Math.ceil(words / 200);
    const speakMinutes = Math.ceil(words / 130);

    return {
      words,
      chars,
      charsNoSpaces,
      sentences,
      paragraphs,
      readingTime: `${readMinutes} min`,
      speakingTime: `${speakMinutes} min`,
    };
  }, [text]);

  // Case Conversion Functions
  const applyTransform = (type: string) => {
    soundManager.playTap();
    if (!text) return;

    let res = text;
    switch (type) {
      case 'upper':
        res = text.toUpperCase();
        break;
      case 'lower':
        res = text.toLowerCase();
        break;
      case 'title':
        res = text.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
      case 'sentence':
        res = text.toLowerCase().replace(/(^\s*\w|[.!?।]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case 'camel':
        res = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
        break;
      case 'kebab':
        res = text
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '');
        break;
      case 'snake':
        res = text
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-zA-Z0-9_]/g, '');
        break;
      case 'cleanSpaces':
        res = text.replace(/[ \t]+/g, ' ').trim();
        break;
      case 'cleanLines':
        res = text
          .split('\n')
          .filter((line) => line.trim().length > 0)
          .join('\n');
        break;
      case 'reverseText':
        res = text.split('').reverse().join('');
        break;
      case 'reverseWords':
        res = text.split(/\s+/).reverse().join(' ');
        break;
      default:
        break;
    }
    setText(res);
  };

  // Find & Replace
  const handleFindReplace = () => {
    if (!findWord) return;
    soundManager.playTap();
    const regex = new RegExp(findWord, 'gi');
    setText((prev) => prev.replace(regex, replaceWord));
  };

  // Copy
  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    soundManager.playSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text to Speech
  const toggleSpeech = () => {
    soundManager.playTap();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      if (!text.trim()) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white dark:bg-[#140D2B] p-3 rounded-xl border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.textToolsText.words}</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {stats.words.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-[#140D2B] p-3 rounded-xl border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.textToolsText.characters}</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {stats.chars.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-[#140D2B] p-3 rounded-xl border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.textToolsText.sentences}</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
            {stats.sentences.toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-[#140D2B] p-3 rounded-xl border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.textToolsText.readingTime}</div>
          <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400 tabular-nums mt-0.5">
            {stats.readingTime}
          </div>
        </div>
      </div>

      {/* Main Textarea Card */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {t.tools.text.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Listen Button */}
            <button
              onClick={toggleSpeech}
              disabled={!text.trim()}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition disabled:opacity-40 cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-500/20'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? t.textToolsText.stopSpeaking : t.textToolsText.listenText}</span>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              disabled={!text}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-40 cursor-pointer ${
                copied ? 'bg-emerald-600 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t.copied : t.copy}</span>
            </button>

            {/* Clear Button */}
            {text && (
              <button
                onClick={() => {
                  soundManager.playTap();
                  setText('');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
                title={t.clear}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.textToolsText.placeholder}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500 resize-y leading-relaxed font-sans"
        />

        {/* Case Transformations */}
        <div className="space-y-2 pt-2">
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {t.textToolsText.transforms}:
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => applyTransform('upper')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.upper}
            </button>
            <button
              onClick={() => applyTransform('lower')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.lower}
            </button>
            <button
              onClick={() => applyTransform('title')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.title}
            </button>
            <button
              onClick={() => applyTransform('sentence')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.sentence}
            </button>
            <button
              onClick={() => applyTransform('camel')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.camel}
            </button>
            <button
              onClick={() => applyTransform('kebab')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.kebab}
            </button>
            <button
              onClick={() => applyTransform('snake')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-slate-700 dark:text-purple-200 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.snake}
            </button>
          </div>
        </div>

        {/* Cleanups & Utilities */}
        <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-purple-500/15">
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
            {t.textToolsText.cleanups}:
          </div>
          <div className="flex flex-wrap gap-1.5 text-xs">
            <button
              onClick={() => applyTransform('cleanSpaces')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-slate-200 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.cleanSpaces}
            </button>
            <button
              onClick={() => applyTransform('cleanLines')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-slate-200 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.cleanLines}
            </button>
            <button
              onClick={() => applyTransform('reverseText')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-slate-200 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.reverseText}
            </button>
            <button
              onClick={() => applyTransform('reverseWords')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-slate-200 dark:hover:bg-purple-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-purple-500/20 cursor-pointer"
            >
              {t.textToolsText.reverseWords}
            </button>
          </div>
        </div>

        {/* Find & Replace Bar */}
        <div className="pt-2 border-t border-slate-200 dark:border-purple-500/15">
          <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
            {t.textToolsText.findAndReplace}:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input
              type="text"
              value={findWord}
              onChange={(e) => setFindWord(e.target.value)}
              placeholder={t.textToolsText.find}
              className="sm:col-span-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500"
            />
            <input
              type="text"
              value={replaceWord}
              onChange={(e) => setReplaceWord(e.target.value)}
              placeholder={t.textToolsText.replace}
              className="sm:col-span-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleFindReplace}
              disabled={!findWord}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-bold transition shadow cursor-pointer"
            >
              {t.textToolsText.replaceAll}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
