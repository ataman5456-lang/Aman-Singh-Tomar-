import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  Clock,
  Heart,
  Compass,
  Star,
  Award,
} from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface AgeCalculatorProps {
  lang: Language;
}

export const AgeCalculator: React.FC<AgeCalculatorProps> = ({ lang }) => {
  const t = useTranslation(lang);

  // Default birth date: 2000-01-01
  const [dob, setDob] = useState('2000-01-01');
  const [targetDate, setTargetDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [liveSeconds, setLiveSeconds] = useState<number>(0);

  // Exact age calculation
  const ageData = useMemo(() => {
    if (!dob || !targetDate) return null;

    const birth = new Date(dob);
    const target = new Date(targetDate);

    if (birth > target) return null;

    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      // Days in previous month of target
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Total units
    const diffMs = target.getTime() - birth.getTime();
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Next Birthday calculation
    const today = new Date();
    let nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < today) {
      nextBday = new Date(today.getFullYear() + 1, birth.getMonth(), birth.getDate());
    }
    const daysUntilNextBday = Math.ceil(
      (nextBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    const nextBdayDayOfWeek = nextBday.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
      weekday: 'long',
    });

    // Zodiac & Astrology info
    const bMonth = birth.getMonth() + 1; // 1-12
    const bDay = birth.getDate();

    let zodiac = 'Aries (मेष)';
    let rashi = 'मेष (Mesh)';
    let stone = 'Diamond';
    if ((bMonth === 1 && bDay >= 20) || (bMonth === 2 && bDay <= 18)) {
      zodiac = lang === 'hi' ? 'कुंभ (Aquarius)' : 'Aquarius ♒';
      rashi = 'कुंभ (Kumbh)';
      stone = 'Amethyst';
    } else if ((bMonth === 2 && bDay >= 19) || (bMonth === 3 && bDay <= 20)) {
      zodiac = lang === 'hi' ? 'मीन (Pisces)' : 'Pisces ♓';
      rashi = 'मीन (Meen)';
      stone = 'Aquamarine';
    } else if ((bMonth === 3 && bDay >= 21) || (bMonth === 4 && bDay <= 19)) {
      zodiac = lang === 'hi' ? 'मेष (Aries)' : 'Aries ♈';
      rashi = 'मेष (Mesh)';
      stone = 'Diamond';
    } else if ((bMonth === 4 && bDay >= 20) || (bMonth === 5 && bDay <= 20)) {
      zodiac = lang === 'hi' ? 'वृषभ (Taurus)' : 'Taurus ♉';
      rashi = 'वृषभ (Vrishabh)';
      stone = 'Emerald';
    } else if ((bMonth === 5 && bDay >= 21) || (bMonth === 6 && bDay <= 20)) {
      zodiac = lang === 'hi' ? 'मिथुन (Gemini)' : 'Gemini ♊';
      rashi = 'मिथुन (Mithun)';
      stone = 'Pearl';
    } else if ((bMonth === 6 && bDay >= 21) || (bMonth === 7 && bDay <= 22)) {
      zodiac = lang === 'hi' ? 'कर्क (Cancer)' : 'Cancer ♋';
      rashi = 'कर्क (Kark)';
      stone = 'Ruby';
    } else if ((bMonth === 7 && bDay >= 23) || (bMonth === 8 && bDay <= 22)) {
      zodiac = lang === 'hi' ? 'सिंह (Leo)' : 'Leo ♌';
      rashi = 'सिंह (Singh)';
      stone = 'Peridot';
    } else if ((bMonth === 8 && bDay >= 23) || (bMonth === 9 && bDay <= 22)) {
      zodiac = lang === 'hi' ? 'कन्या (Virgo)' : 'Virgo ♍';
      rashi = 'कन्या (Kanya)';
      stone = 'Sapphire';
    } else if ((bMonth === 9 && bDay >= 23) || (bMonth === 10 && bDay <= 22)) {
      zodiac = lang === 'hi' ? 'तुला (Libra)' : 'Libra ♎';
      rashi = 'तुला (Tula)';
      stone = 'Opal';
    } else if ((bMonth === 10 && bDay >= 23) || (bMonth === 11 && bDay <= 21)) {
      zodiac = lang === 'hi' ? 'वृश्चिक (Scorpio)' : 'Scorpio ♏';
      rashi = 'वृश्चिक (Vrishchik)';
      stone = 'Topaz';
    } else if ((bMonth === 11 && bDay >= 22) || (bMonth === 12 && bDay <= 21)) {
      zodiac = lang === 'hi' ? 'धनु (Sagittarius)' : 'Sagittarius ♐';
      rashi = 'धनु (Dhanu)';
      stone = 'Turquoise';
    } else {
      zodiac = lang === 'hi' ? 'मकर (Capricorn)' : 'Capricorn ♑';
      rashi = 'मकर (Makar)';
      stone = 'Garnet';
    }

    // Chinese Zodiac
    const chineseAnimals = [
      'Rat 🐀', 'Ox 🐂', 'Tiger 🐅', 'Rabbit 🐇',
      'Dragon 🐉', 'Snake 🐍', 'Horse 🐎', 'Goat 🐐',
      'Monkey 🐒', 'Rooster 🐓', 'Dog 🐕', 'Pig 🐖'
    ];
    const chineseAnimalHindi = [
      'चूहा (Rat)', 'बैल (Ox)', 'बाघ (Tiger)', 'खरगोश (Rabbit)',
      'ड्रैगन (Dragon)', 'सांप (Snake)', 'घोड़ा (Horse)', 'बकरी (Goat)',
      'बंदर (Monkey)', 'मुर्गा (Rooster)', 'कुत्ता (Dog)', 'सूअर (Pig)'
    ];
    const chineseIndex = (birth.getFullYear() - 4) % 12;
    const chineseZodiac = lang === 'hi' ? chineseAnimalHindi[(chineseIndex + 12) % 12] : chineseAnimals[(chineseIndex + 12) % 12];

    // Milestone: 10,000 days date
    const day10k = new Date(birth.getTime() + 10000 * 24 * 60 * 60 * 1000);
    const day20k = new Date(birth.getTime() + 20000 * 24 * 60 * 60 * 1000);

    return {
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      totalMinutes,
      daysUntilNextBday,
      nextBdayDayOfWeek,
      zodiac,
      rashi,
      stone,
      chineseZodiac,
      day10k: day10k.toISOString().split('T')[0],
      day20k: day20k.toISOString().split('T')[0],
    };
  }, [dob, targetDate, lang]);

  // Live ticking seconds effect
  useEffect(() => {
    const update = () => {
      if (dob) {
        const b = new Date(dob).getTime();
        const now = Date.now();
        if (now > b) {
          setLiveSeconds(Math.floor((now - b) / 1000));
        }
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [dob]);

  return (
    <div className="space-y-6">
      {/* Date Pickers Card */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>{t.tools.age.title}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.ageText.dob}
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => {
                soundManager.playTap();
                setDob(e.target.value);
              }}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.ageText.targetDate}
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => {
                soundManager.playTap();
                setTargetDate(e.target.value);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {ageData && (
        <>
          {/* Main Hero Card: Exact Age */}
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/50 dark:via-indigo-900/40 dark:to-blue-900/50 rounded-2xl p-5 sm:p-6 border border-purple-200 dark:border-purple-500/30 text-center relative overflow-hidden shadow-sm dark:shadow-none">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 tracking-wide uppercase">
              {t.ageText.yourAgeIs}
            </span>

            {/* Big 3-number highlight */}
            <div className="grid grid-cols-3 gap-2 mt-4 max-w-md mx-auto">
              <div className="bg-white dark:bg-[#120B24]/80 rounded-xl p-3 border border-purple-200 dark:border-purple-500/20 shadow-xs dark:shadow-none">
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {ageData.years}
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold mt-1">
                  {t.ageText.years}
                </div>
              </div>

              <div className="bg-white dark:bg-[#120B24]/80 rounded-xl p-3 border border-purple-200 dark:border-purple-500/20 shadow-xs dark:shadow-none">
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {ageData.months}
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold mt-1">
                  {t.ageText.months}
                </div>
              </div>

              <div className="bg-white dark:bg-[#120B24]/80 rounded-xl p-3 border border-purple-200 dark:border-purple-500/20 shadow-xs dark:shadow-none">
                <div className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {ageData.days}
                </div>
                <div className="text-xs text-purple-700 dark:text-purple-300 font-semibold mt-1">
                  {t.ageText.days}
                </div>
              </div>
            </div>

            {/* Next Birthday banner */}
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-100/80 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-500/30 text-xs text-purple-900 dark:text-purple-200">
              <Heart className="w-3.5 h-3.5 text-pink-500 dark:text-pink-400 shrink-0" />
              <span>
                {t.ageText.nextBirthdayIn}: <strong className="font-bold text-purple-950 dark:text-white">{ageData.daysUntilNextBday} {t.ageText.days}</strong> ({ageData.nextBdayDayOfWeek})
              </span>
            </div>
          </div>

          {/* Live Ticking Seconds Strip */}
          <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {t.ageText.totalSeconds}
              </span>
            </div>
            <div className="text-base sm:text-lg font-mono font-bold text-cyan-600 dark:text-cyan-400 tabular-nums">
              {liveSeconds.toLocaleString()} s
            </div>
          </div>

          {/* Total Breakdown Units */}
          <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t.ageText.liveSummary}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-slate-200 dark:border-purple-500/10">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.ageText.totalMonths}</div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {ageData.totalMonths.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-slate-200 dark:border-purple-500/10">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.ageText.totalWeeks}</div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {ageData.totalWeeks.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-slate-200 dark:border-purple-500/10">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.ageText.totalDays}</div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {ageData.totalDays.toLocaleString()}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/30 border border-slate-200 dark:border-purple-500/10">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">{t.ageText.totalHours}</div>
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums mt-0.5">
                  {ageData.totalHours.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Zodiac & Astrology Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Compass className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{t.ageText.zodiacSign}</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {ageData.zodiac}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                {t.ageText.rashi}: <span className="text-purple-600 dark:text-purple-300 font-semibold">{ageData.rashi}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Star className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>{t.ageText.chineseZodiac}</span>
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {ageData.chineseZodiac}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                {t.ageText.birthstone}: <span className="text-amber-600 dark:text-amber-300 font-semibold">{ageData.stone}</span>
              </div>
            </div>
          </div>

          {/* Life Milestones */}
          <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white mb-3">
              <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t.ageText.milestones}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-purple-950/20 text-slate-700 dark:text-slate-300">
                <span>10,000 {t.ageText.daysOld}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{ageData.day10k}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-50 dark:bg-purple-950/20 text-slate-700 dark:text-slate-300">
                <span>20,000 {t.ageText.daysOld}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{ageData.day20k}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
