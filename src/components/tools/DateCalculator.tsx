import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Plus,
  Minus,
  Briefcase,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface DateCalculatorProps {
  lang: Language;
}

export const DateCalculator: React.FC<DateCalculatorProps> = ({ lang }) => {
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState<'diff' | 'add' | 'work'>('diff');

  // Tab 1: Difference
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [includeEndDay, setIncludeEndDay] = useState(false);

  // Tab 2: Add / Subtract
  const [baseDate, setBaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [opType, setOpType] = useState<'add' | 'sub'>('add');
  const [amount, setAmount] = useState('30');
  const [unit, setUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');

  // Difference computation
  const diffResult = useMemo(() => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const isNegative = start > end;
    const [early, late] = isNegative ? [end, start] : [start, end];

    let totalDays = Math.round(
      (late.getTime() - early.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (includeEndDay) totalDays += 1;

    // Count weekends vs business days
    let businessDays = 0;
    let weekendDays = 0;
    const cur = new Date(early);
    const stopTime = late.getTime() + (includeEndDay ? 86400000 : 0);

    while (cur.getTime() < stopTime) {
      const dayOfWeek = cur.getDay(); // 0 is Sunday, 6 is Saturday
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendDays++;
      } else {
        businessDays++;
      }
      cur.setDate(cur.getDate() + 1);
    }

    const weeks = Math.floor(totalDays / 7);
    const remainingDays = totalDays % 7;
    const percentOfYear = ((totalDays / 365) * 100).toFixed(1);

    return {
      totalDays,
      businessDays,
      weekendDays,
      weeks,
      remainingDays,
      percentOfYear,
      isNegative,
    };
  }, [startDate, endDate, includeEndDay]);

  // Add / Subtract computation
  const computedDate = useMemo(() => {
    if (!baseDate) return null;
    const d = new Date(baseDate);
    const val = parseInt(amount, 10);
    if (isNaN(val)) return null;

    const multiplier = opType === 'add' ? 1 : -1;

    if (unit === 'days') {
      d.setDate(d.getDate() + val * multiplier);
    } else if (unit === 'weeks') {
      d.setDate(d.getDate() + val * 7 * multiplier);
    } else if (unit === 'months') {
      d.setMonth(d.getMonth() + val * multiplier);
    } else if (unit === 'years') {
      d.setFullYear(d.getFullYear() + val * multiplier);
    }

    const formatted = d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return {
      iso: d.toISOString().split('T')[0],
      formatted,
    };
  }, [baseDate, opType, amount, unit, lang]);

  return (
    <div className="space-y-6">
      {/* Sub-Tabs: Difference | Add/Subtract | Working Days */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-purple-950/30 rounded-xl border border-slate-200 dark:border-purple-500/15">
        <button
          onClick={() => {
            soundManager.playTap();
            setActiveTab('diff');
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'diff'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t.dateText.diffTab}</span>
        </button>

        <button
          onClick={() => {
            soundManager.playTap();
            setActiveTab('add');
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'add'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.dateText.addTab}</span>
        </button>

        <button
          onClick={() => {
            soundManager.playTap();
            setActiveTab('work');
          }}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer col-span-2 sm:col-span-1 ${
            activeTab === 'work'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>{t.dateText.workTab}</span>
        </button>
      </div>

      {/* Tab 1: Date Difference */}
      {activeTab === 'diff' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t.dateText.diffTab}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t.dateText.startDate}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t.dateText.endDate}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="includeEnd"
                checked={includeEndDay}
                onChange={(e) => setIncludeEndDay(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 bg-slate-100 dark:bg-purple-950/40 border-slate-300 dark:border-purple-500/30 cursor-pointer"
              />
              <label
                htmlFor="includeEnd"
                className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none"
              >
                {t.dateText.includeEndDay}
              </label>
            </div>
          </div>

          {diffResult && (
            <div className="bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-blue-900/30 rounded-2xl p-5 border border-purple-500/25 space-y-4">
              <div className="text-center">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                  {t.dateText.totalDaysCount}
                </span>
                <div className="text-3xl sm:text-5xl font-extrabold text-white tabular-nums mt-1">
                  {diffResult.totalDays} {t.dateText.units.days}
                </div>
                <div className="text-xs text-purple-200 mt-1">
                  {diffResult.weeks} {t.dateText.units.weeks} {diffResult.remainingDays > 0 ? `+ ${diffResult.remainingDays} ${t.dateText.units.days}` : ''}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-[#120B24]/80 border border-purple-500/20 text-center">
                  <div className="text-[11px] text-slate-400">{t.dateText.businessDaysCount}</div>
                  <div className="text-lg font-bold text-emerald-400 tabular-nums mt-0.5">
                    {diffResult.businessDays}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#120B24]/80 border border-purple-500/20 text-center">
                  <div className="text-[11px] text-slate-400">{t.dateText.weekendDaysCount}</div>
                  <div className="text-lg font-bold text-amber-400 tabular-nums mt-0.5">
                    {diffResult.weekendDays}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#120B24]/80 border border-purple-500/20 text-center col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-slate-400">{lang === 'hi' ? 'वर्ष का प्रतिशत' : '% of Full Year'}</div>
                  <div className="text-lg font-bold text-cyan-400 tabular-nums mt-0.5">
                    {diffResult.percentOfYear}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Add or Subtract */}
      {activeTab === 'add' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t.dateText.addTab}</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {t.dateText.baseDate}
                </label>
                <input
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Add vs Subtract Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTap();
                    setOpType('add');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    opType === 'add'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-purple-950/30 text-slate-400 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.dateText.add}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.playTap();
                    setOpType('sub');
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    opType === 'sub'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-purple-950/30 text-slate-400 hover:text-white'
                  }`}
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>{t.dateText.subtract}</span>
                </button>
              </div>

              {/* Amount and Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {lang === 'hi' ? 'संख्या' : 'Number'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm font-semibold focus:outline-none focus:border-purple-400 tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    {lang === 'hi' ? 'इकाई' : 'Unit'}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as 'days' | 'weeks' | 'months' | 'years')}
                    className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                  >
                    <option value="days" className="bg-[#120B24]">{t.dateText.units.days}</option>
                    <option value="weeks" className="bg-[#120B24]">{t.dateText.units.weeks}</option>
                    <option value="months" className="bg-[#120B24]">{t.dateText.units.months}</option>
                    <option value="years" className="bg-[#120B24]">{t.dateText.units.years}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {computedDate && (
            <div className="bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-blue-900/30 rounded-2xl p-5 border border-purple-500/25 text-center">
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                {t.dateText.result}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {computedDate.formatted}
              </div>
              <div className="text-xs text-slate-400 mt-1 tabular-nums">
                ISO: {computedDate.iso}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Working Days / Business Days calculator */}
      {activeTab === 'work' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t.dateText.workTab}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'hi'
                ? 'कार्यालयीन कार्य दिवसों की सटीक गणना करें (शनिवार और रविवार स्वतः छूट जाते हैं)'
                : 'Calculate net corporate and professional working days, automatically excluding weekends.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.dateText.startDate}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {t.dateText.endDate}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>
          </div>

          {diffResult && (
            <div className="bg-[#140D2B] rounded-2xl p-5 border border-purple-500/25 grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                <span className="text-xs text-emerald-300 font-semibold">{t.dateText.businessDaysCount}</span>
                <div className="text-3xl font-extrabold text-emerald-400 mt-1 tabular-nums">
                  {diffResult.businessDays}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {lang === 'hi' ? 'सोमवार से शुक्रवार' : 'Mon to Fri shifts'}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30">
                <span className="text-xs text-amber-300 font-semibold">{t.dateText.weekendDaysCount}</span>
                <div className="text-3xl font-extrabold text-amber-400 mt-1 tabular-nums">
                  {diffResult.weekendDays}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  {lang === 'hi' ? 'शनि-रवि अवकाश' : 'Sat & Sun off'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
