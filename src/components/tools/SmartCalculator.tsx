import React, { useState, useEffect, useCallback } from 'react';
import {
  Calculator as CalcIcon,
  RotateCcw,
  History,
  Delete,
  Divide,
  X as Multiply,
  Minus,
  Plus,
  Equal,
} from 'lucide-react';
import { Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface SmartCalculatorProps {
  calcHistory: string[];
  onUpdateHistory: (history: string[]) => void;
  lang: Language;
}

export const SmartCalculator: React.FC<SmartCalculatorProps> = ({
  calcHistory,
  onUpdateHistory,
  lang,
}) => {
  const t = useTranslation(lang);
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isScientific, setIsScientific] = useState(false);
  const [isRad, setIsRad] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [showHistory, setShowHistory] = useState(false);

  // Clear All
  const handleClear = () => {
    soundManager.playTap();
    setDisplay('0');
    setEquation('');
  };

  // Backspace
  const handleBackspace = () => {
    soundManager.playTap();
    setDisplay((prev) => {
      if (prev.length <= 1 || prev === 'Error') return '0';
      return prev.slice(0, -1);
    });
  };

  // Append digit or decimal
  const handleDigit = (d: string) => {
    soundManager.playTap();
    setDisplay((prev) => {
      if (prev === '0' || prev === 'Error') {
        return d === '.' ? '0.' : d;
      }
      if (d === '.' && prev.includes('.')) return prev;
      return prev + d;
    });
  };

  // Append operator
  const handleOperator = (op: string) => {
    soundManager.playTap();
    if (display === 'Error') return;
    setEquation((prev) => `${prev} ${display} ${op}`);
    setDisplay('0');
  };

  // Safe Evaluate Expression
  const handleEquals = () => {
    soundManager.playTap();
    try {
      const fullExpr = `${equation} ${display}`
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/\^/g, '**');

      // Sanitize expression: only allow math tokens
      if (!/^[0-9+\-*/().%\s*]+$/.test(fullExpr)) {
        throw new Error('Invalid tokens');
      }

      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${fullExpr})`)();

      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        setDisplay('Error');
      } else {
        const formattedResult = Number(result.toFixed(8)).toString();
        const historyRecord = `${equation} ${display} = ${formattedResult}`.trim();
        onUpdateHistory([historyRecord, ...calcHistory.slice(0, 19)]);
        setDisplay(formattedResult);
        setEquation('');
        soundManager.playSuccess();
      }
    } catch {
      setDisplay('Error');
    }
  };

  // Scientific functions
  const handleScientific = (fn: string) => {
    soundManager.playTap();
    const val = parseFloat(display);
    if (isNaN(val)) return;

    let res = 0;
    try {
      switch (fn) {
        case 'sin':
          res = isRad ? Math.sin(val) : Math.sin((val * Math.PI) / 180);
          break;
        case 'cos':
          res = isRad ? Math.cos(val) : Math.cos((val * Math.PI) / 180);
          break;
        case 'tan':
          res = isRad ? Math.tan(val) : Math.tan((val * Math.PI) / 180);
          break;
        case 'ln':
          if (val <= 0) throw new Error();
          res = Math.log(val);
          break;
        case 'log':
          if (val <= 0) throw new Error();
          res = Math.log10(val);
          break;
        case 'sqrt':
          if (val < 0) throw new Error();
          res = Math.sqrt(val);
          break;
        case 'sq':
          res = Math.pow(val, 2);
          break;
        case 'inv':
          if (val === 0) throw new Error();
          res = 1 / val;
          break;
        case 'pi':
          res = Math.PI;
          break;
        case 'e':
          res = Math.E;
          break;
        case 'sign':
          res = -val;
          break;
        case 'pct':
          res = val / 100;
          break;
        default:
          return;
      }
      const formatted = Number(res.toFixed(8)).toString();
      setDisplay(formatted);
    } catch {
      setDisplay('Error');
    }
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.'].includes(e.key)) {
        handleDigit(e.key);
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    },
    [display, equation]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="space-y-6">
      {/* Calculator Main Box */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
        {/* Top Header Toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-purple-500/15 mb-3">
          <div className="flex items-center gap-2">
            <CalcIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {t.tools.calculator.title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {/* Scientific Toggle */}
            <button
              onClick={() => {
                soundManager.playTap();
                setIsScientific(!isScientific);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                isScientific
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-950/30 text-purple-300 hover:bg-purple-900/40'
              }`}
            >
              {isScientific ? t.calcText.standard : t.calcText.scientific}
            </button>

            {/* History Toggle */}
            <button
              onClick={() => {
                soundManager.playTap();
                setShowHistory(!showHistory);
              }}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                showHistory
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-950/30 text-slate-300 hover:bg-purple-900/40'
              }`}
              title={t.calcText.historyTitle}
            >
              <History className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="p-4 rounded-xl bg-[#0C061C] border border-purple-500/20 text-right font-mono select-all">
          <div className="text-xs text-purple-300/70 h-4 truncate tabular-nums">
            {equation}
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums truncate mt-1">
            {display}
          </div>
        </div>

        {/* Scientific Toolbar (if active) */}
        {isScientific && (
          <div className="grid grid-cols-5 gap-1.5 my-3 text-xs font-semibold">
            <button
              onClick={() => setIsRad(!isRad)}
              className="py-1.5 rounded-lg bg-purple-950/40 text-purple-300 border border-purple-500/20"
            >
              {isRad ? t.calcText.rad : t.calcText.deg}
            </button>
            <button
              onClick={() => handleScientific('sin')}
              className="py-1.5 rounded-lg bg-purple-950/30 text-slate-300 hover:bg-purple-900/40"
            >
              sin
            </button>
            <button
              onClick={() => handleScientific('cos')}
              className="py-1.5 rounded-lg bg-purple-950/30 text-slate-300 hover:bg-purple-900/40"
            >
              cos
            </button>
            <button
              onClick={() => handleScientific('tan')}
              className="py-1.5 rounded-lg bg-purple-950/30 text-slate-300 hover:bg-purple-900/40"
            >
              tan
            </button>
            <button
              onClick={() => handleScientific('pi')}
              className="py-1.5 rounded-lg bg-purple-950/30 text-slate-300 hover:bg-purple-900/40"
            >
              π
            </button>

            <button
              onClick={() => handleScientific('ln')}
              className="py-1.5 rounded-lg bg-purple-950/30 text-slate-300 hover:bg-purple-900/40"
            >
              ln
            </button>
            <button
              onClick={() => handleScientific('log')}
              className="py-1.5 rounded-lg bg-purple-950/30 text-slate-300 hover:bg-purple-900/40"
            >
              log
            </button>
            <button
              onClick={() => handleScientific('sqrt')}
              className="py-1.5 rounded-lg bg-purple-950/30 text-slate-300 hover:bg-purple-900/40"
            >
              √x
            </button>
            <button
              onClick={() => handleScientific('sq')}
              className="py-1.5 rounded-lg bg-purple-950/30 text-slate-300 hover:bg-purple-900/40"
            >
              x²
            </button>
            <button
              onClick={() => handleScientific('e')}
              className="py-1.5 rounded-lg bg-purple-950/30 text-slate-300 hover:bg-purple-900/40"
            >
              e
            </button>
          </div>
        )}

        {/* Memory Bar */}
        <div className="flex items-center justify-between gap-1 my-2 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setMemory(0)}
            className="flex-1 py-1 rounded bg-purple-950/20 hover:text-white"
          >
            MC
          </button>
          <button
            onClick={() => setDisplay(memory.toString())}
            className="flex-1 py-1 rounded bg-purple-950/20 hover:text-white"
          >
            MR
          </button>
          <button
            onClick={() => setMemory((m) => m + (parseFloat(display) || 0))}
            className="flex-1 py-1 rounded bg-purple-950/20 hover:text-white"
          >
            M+
          </button>
          <button
            onClick={() => setMemory((m) => m - (parseFloat(display) || 0))}
            className="flex-1 py-1 rounded bg-purple-950/20 hover:text-white"
          >
            M-
          </button>
        </div>

        {/* Standard Keypad Grid */}
        <div className="grid grid-cols-4 gap-2 text-base font-bold select-none pt-2">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="py-3 rounded-xl bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-500/20 transition active:scale-95 cursor-pointer"
          >
            AC
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 rounded-xl bg-purple-950/40 text-slate-300 hover:bg-purple-900/40 border border-purple-500/20 transition active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScientific('pct')}
            className="py-3 rounded-xl bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-500/20 transition active:scale-95 cursor-pointer"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <Divide className="w-5 h-5" />
          </button>

          {/* Row 2 */}
          <button
            onClick={() => handleDigit('7')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('×')}
            className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <Multiply className="w-5 h-5" />
          </button>

          {/* Row 3 */}
          <button
            onClick={() => handleDigit('4')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('−')}
            className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <Minus className="w-5 h-5" />
          </button>

          {/* Row 4 */}
          <button
            onClick={() => handleDigit('1')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className="py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleScientific('sign')}
            className="py-3 rounded-xl bg-purple-950/40 text-purple-300 hover:bg-purple-900/40 border border-purple-500/20 transition active:scale-95 cursor-pointer"
          >
            ±
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="py-3 rounded-xl bg-purple-950/25 text-white hover:bg-purple-900/40 border border-purple-500/15 transition active:scale-95 cursor-pointer"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-purple-900/40 transition active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <Equal className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* History Tape Drawer */}
      {showHistory && (
        <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{t.calcText.historyTitle}</span>
            </h4>

            {calcHistory.length > 0 && (
              <button
                onClick={() => {
                  soundManager.playTap();
                  onUpdateHistory([]);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer"
              >
                {t.calcText.clearHistory}
              </button>
            )}
          </div>

          {calcHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              {t.calcText.noHistory}
            </div>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 font-mono text-xs">
              {calcHistory.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    soundManager.playTap();
                    const parts = item.split('=');
                    if (parts.length > 1) {
                      setDisplay(parts[1].trim());
                    }
                  }}
                  className="p-2.5 rounded-lg bg-purple-950/20 hover:bg-purple-900/30 text-slate-300 hover:text-white flex items-center justify-between cursor-pointer transition"
                >
                  <span className="truncate">{item}</span>
                  <span className="text-[10px] text-purple-400 shrink-0 ml-2">Re-use</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
