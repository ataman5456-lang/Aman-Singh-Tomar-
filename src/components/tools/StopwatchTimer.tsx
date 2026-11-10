import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Flag,
  BellRing,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface StopwatchTimerProps {
  lang: Language;
}

interface LapRecord {
  lapNumber: number;
  splitTime: number; // ms
  overallTime: number; // ms
}

export const StopwatchTimer: React.FC<StopwatchTimerProps> = ({ lang }) => {
  const t = useTranslation(lang);
  const [mode, setMode] = useState<'stopwatch' | 'timer'>('stopwatch');

  // --- Stopwatch State ---
  const [swTime, setSwTime] = useState(0); // in ms
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<LapRecord[]>([]);
  const swStartTimeRef = useRef<number>(0);
  const swRafRef = useRef<number | null>(null);

  // --- Timer State ---
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerTotalDuration, setTimerTotalDuration] = useState(300); // total initial in seconds
  const [timerRemaining, setTimerRemaining] = useState(300); // remaining in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  // --- Stopwatch Handlers ---
  const startStopwatch = () => {
    soundManager.playTap();
    swStartTimeRef.current = performance.now() - swTime;
    setSwRunning(true);

    const tick = () => {
      setSwTime(Math.floor(performance.now() - swStartTimeRef.current));
      swRafRef.current = requestAnimationFrame(tick);
    };
    swRafRef.current = requestAnimationFrame(tick);
  };

  const pauseStopwatch = () => {
    soundManager.playTap();
    setSwRunning(false);
    if (swRafRef.current) {
      cancelAnimationFrame(swRafRef.current);
      swRafRef.current = null;
    }
  };

  const resetStopwatch = () => {
    soundManager.playTap();
    pauseStopwatch();
    setSwTime(0);
    setLaps([]);
  };

  const recordLap = () => {
    soundManager.playTap();
    const lastLapOverall = laps.length > 0 ? laps[0].overallTime : 0;
    const split = swTime - lastLapOverall;
    const newLap: LapRecord = {
      lapNumber: laps.length + 1,
      splitTime: split,
      overallTime: swTime,
    };
    setLaps([newLap, ...laps]);
  };

  // Format Stopwatch time: HH:MM:SS.ms
  const formatSwTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);

    const pad = (n: number) => n.toString().padStart(2, '0');
    if (hours > 0) {
      return `${pad(hours)}:${pad(mins)}:${pad(secs)}.${pad(centis)}`;
    }
    return `${pad(mins)}:${pad(secs)}.${pad(centis)}`;
  };

  // --- Timer Handlers ---
  const startTimer = () => {
    soundManager.playTap();
    if (timerRemaining <= 0) {
      const total = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
      if (total <= 0) return;
      setTimerTotalDuration(total);
      setTimerRemaining(total);
    }
    setTimerRunning(true);
    setIsAlarmActive(false);
  };

  const pauseTimer = () => {
    soundManager.playTap();
    setTimerRunning(false);
  };

  const resetTimer = () => {
    soundManager.playTap();
    setTimerRunning(false);
    stopAlarm();
    const total = timerHours * 3600 + timerMinutes * 60 + timerSeconds;
    setTimerTotalDuration(total);
    setTimerRemaining(total);
  };

  const setTimerPreset = (minutesToAdd: number) => {
    soundManager.playTap();
    const newRemaining = timerRemaining + minutesToAdd * 60;
    setTimerTotalDuration(newRemaining);
    setTimerRemaining(newRemaining);
  };

  const stopAlarm = () => {
    soundManager.stopAlarm();
    setIsAlarmActive(false);
  };

  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            setIsAlarmActive(true);
            soundManager.startAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerRunning]);

  // Clean up audio & frames on unmount
  useEffect(() => {
    return () => {
      soundManager.stopAlarm();
      if (swRafRef.current) cancelAnimationFrame(swRafRef.current);
    };
  }, []);

  // Format Timer remaining: HH:MM:SS
  const formatTimerRemaining = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  const timerProgress = timerTotalDuration > 0
    ? ((timerTotalDuration - timerRemaining) / timerTotalDuration) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Sub-Tabs: Stopwatch vs Timer */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-purple-950/30 rounded-xl border border-slate-200 dark:border-purple-500/15">
        <button
          onClick={() => {
            soundManager.playTap();
            setMode('stopwatch');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'stopwatch'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>{t.stopwatchText.stopwatch}</span>
        </button>
        <button
          onClick={() => {
            soundManager.playTap();
            setMode('timer');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            mode === 'timer'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>{t.stopwatchText.timer}</span>
        </button>
      </div>

      {/* STOPWATCH MODE */}
      {mode === 'stopwatch' && (
        <div className="space-y-5">
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950/60 dark:via-indigo-950/50 dark:to-blue-950/60 rounded-2xl p-6 sm:p-8 border border-purple-200 dark:border-purple-500/30 text-center shadow-sm dark:shadow-none">
            {/* Big Millisecond Display */}
            <div className="font-mono text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums py-4">
              {formatSwTime(swTime)}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={resetStopwatch}
                disabled={swTime === 0}
                className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/50 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition active:scale-95 cursor-pointer"
                title={t.stopwatchText.reset}
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {swRunning ? (
                <button
                  onClick={pauseStopwatch}
                  className="px-6 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-900/30 transition active:scale-95 cursor-pointer"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>{t.stopwatchText.pause}</span>
                </button>
              ) : (
                <button
                  onClick={startStopwatch}
                  className="px-6 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 transition active:scale-95 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{swTime > 0 ? t.stopwatchText.resume : t.stopwatchText.start}</span>
                </button>
              )}

              <button
                onClick={recordLap}
                disabled={!swRunning}
                className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/50 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition active:scale-95 cursor-pointer"
                title={t.stopwatchText.lap}
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>{t.stopwatchText.lapTimes} ({laps.length})</span>
              </h4>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 font-mono text-xs">
                {laps.map((lap) => (
                  <div
                    key={lap.lapNumber}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/10 text-slate-700 dark:text-slate-300 tabular-nums"
                  >
                    <span className="font-semibold text-purple-300">
                      {t.stopwatchText.lapNumber} #{lap.lapNumber}
                    </span>
                    <span className="text-slate-400">
                      +{formatSwTime(lap.splitTime)}
                    </span>
                    <span className="font-bold text-white">
                      {formatSwTime(lap.overallTime)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TIMER MODE */}
      {mode === 'timer' && (
        <div className="space-y-5">
          {/* Active Alarm Banner */}
          {isAlarmActive && (
            <div className="p-4 rounded-2xl bg-rose-600 text-white flex items-center justify-between shadow-xl animate-bounce">
              <div className="flex items-center gap-2">
                <BellRing className="w-5 h-5 animate-spin" />
                <div>
                  <div className="text-sm font-bold">{t.stopwatchText.timerDone}</div>
                  <div className="text-xs text-rose-100">{t.stopwatchText.alarmSounding}</div>
                </div>
              </div>
              <button
                onClick={stopAlarm}
                className="px-4 py-2 rounded-xl bg-white text-rose-600 font-bold text-xs shadow hover:bg-rose-50 cursor-pointer"
              >
                {t.stopwatchText.stopAlarm}
              </button>
            </div>
          )}

          {/* Timer Display Card */}
          <div className="bg-gradient-to-br from-purple-950/50 via-indigo-950/40 to-blue-950/50 rounded-2xl p-6 sm:p-8 border border-purple-500/30 text-center">
            {/* Countdown Text */}
            <div className="font-mono text-5xl sm:text-7xl font-extrabold text-white tracking-tight tabular-nums py-2">
              {formatTimerRemaining(timerRemaining)}
            </div>

            {/* Circular Progress Bar */}
            <div className="w-full max-w-xs mx-auto h-2 bg-purple-950/50 rounded-full overflow-hidden mt-3 mb-5 border border-purple-500/20">
              <div
                className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${Math.min(100, timerProgress)}%` }}
              />
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={resetTimer}
                className="w-12 h-12 rounded-xl bg-purple-950/50 hover:bg-purple-900/50 text-slate-300 flex items-center justify-center transition active:scale-95 cursor-pointer"
                title={t.stopwatchText.reset}
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {timerRunning ? (
                <button
                  onClick={pauseTimer}
                  className="px-6 h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-900/30 transition active:scale-95 cursor-pointer"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span>{t.stopwatchText.pause}</span>
                </button>
              ) : (
                <button
                  onClick={startTimer}
                  className="px-6 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-900/30 transition active:scale-95 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>{t.stopwatchText.start}</span>
                </button>
              )}
            </div>

            {/* Quick Presets */}
            <div className="mt-6 pt-4 border-t border-purple-500/15">
              <div className="text-[11px] font-semibold text-slate-400 mb-2">
                {t.stopwatchText.presets}:
              </div>
              <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
                <button
                  onClick={() => setTimerPreset(1)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 border border-purple-500/20 cursor-pointer"
                >
                  +1 min
                </button>
                <button
                  onClick={() => setTimerPreset(5)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 border border-purple-500/20 cursor-pointer"
                >
                  +5 min
                </button>
                <button
                  onClick={() => setTimerPreset(10)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 border border-purple-500/20 cursor-pointer"
                >
                  +10 min
                </button>
                <button
                  onClick={() => setTimerPreset(25)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 border border-purple-500/20 cursor-pointer"
                >
                  +25m (Pomodoro)
                </button>
              </div>
            </div>
          </div>

          {/* Time Picker Inputs */}
          <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
              {t.stopwatchText.setTimer}
            </h4>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.stopwatchText.hours}</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={timerHours}
                  disabled={timerRunning}
                  onChange={(e) => {
                    const h = parseInt(e.target.value, 10) || 0;
                    setTimerHours(h);
                    const total = h * 3600 + timerMinutes * 60 + timerSeconds;
                    setTimerTotalDuration(total);
                    setTimerRemaining(total);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white font-mono text-center text-lg font-bold focus:outline-none focus:border-purple-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.stopwatchText.mins}</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerMinutes}
                  disabled={timerRunning}
                  onChange={(e) => {
                    const m = parseInt(e.target.value, 10) || 0;
                    setTimerMinutes(m);
                    const total = timerHours * 3600 + m * 60 + timerSeconds;
                    setTimerTotalDuration(total);
                    setTimerRemaining(total);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white font-mono text-center text-lg font-bold focus:outline-none focus:border-purple-500 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 dark:text-slate-400 mb-1">{t.stopwatchText.secs}</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerSeconds}
                  disabled={timerRunning}
                  onChange={(e) => {
                    const s = parseInt(e.target.value, 10) || 0;
                    setTimerSeconds(s);
                    const total = timerHours * 3600 + timerMinutes * 60 + s;
                    setTimerTotalDuration(total);
                    setTimerRemaining(total);
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white font-mono text-center text-lg font-bold focus:outline-none focus:border-purple-500 disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
