import React, { useState } from 'react';
import {
  LayoutGrid,
  Wallet,
  CheckSquare,
  ShoppingCart,
  MoreHorizontal,
  X,
  Sparkles,
  CalendarDays,
  KeyRound,
  Timer,
  FileText,
  Calculator,
  QrCode,
  Database,
  User,
} from 'lucide-react';
import { Language, ToolId } from '../types';
import { useTranslation } from '../i18n/translations';
import { soundManager } from '../utils/sound';

interface BottomNavProps {
  currentTool: ToolId;
  onNavigate: (tool: ToolId) => void;
  lang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTool,
  onNavigate,
  lang,
}) => {
  const t = useTranslation(lang);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as ToolId, label: lang === 'hi' ? 'होम' : 'Home', icon: LayoutGrid },
    { id: 'expenses' as ToolId, label: t.tools.expenses.title, icon: Wallet },
    { id: 'notes' as ToolId, label: t.tools.notes.title, icon: CheckSquare },
    { id: 'grocery' as ToolId, label: t.tools.grocery.title, icon: ShoppingCart },
  ];

  const moreTools = [
    { id: 'calculator' as ToolId, label: t.tools.calculator.title, icon: Calculator },
    { id: 'age' as ToolId, label: t.tools.age.title, icon: Sparkles },
    { id: 'date' as ToolId, label: t.tools.date.title, icon: CalendarDays },
    { id: 'stopwatch' as ToolId, label: t.tools.stopwatch.title, icon: Timer },
    { id: 'password' as ToolId, label: t.tools.password.title, icon: KeyRound },
    { id: 'qr' as ToolId, label: t.tools.qr.title, icon: QrCode },
    { id: 'text' as ToolId, label: t.tools.text.title, icon: FileText },
    { id: 'backup' as ToolId, label: t.tools.backup.title, icon: Database },
    { id: 'about' as ToolId, label: t.tools.about.title, icon: User },
  ];

  const isMoreActive = moreTools.some((tool) => tool.id === currentTool);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B071A]/95 text-slate-800 dark:text-slate-100 backdrop-blur-lg border-t border-slate-200 dark:border-purple-500/20 pb-safe transition-colors shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-5 h-14 sm:h-16 items-center px-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playTap();
                  setShowMoreSheet(false);
                  onNavigate(tab.id);
                }}
                className={`min-h-[44px] flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400 font-bold scale-105'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[10px] tracking-tight mt-1 truncate max-w-[62px]">
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More Sheet Trigger */}
          <button
            onClick={() => {
              soundManager.playTap();
              setShowMoreSheet(true);
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
              isMoreActive
                ? 'text-purple-600 dark:text-purple-400 font-bold scale-105'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight mt-1 truncate">
              {lang === 'hi' ? 'अन्य टूल्स' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Quick Launch Bottom Drawer Sheet */}
      {showMoreSheet && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 p-0 sm:p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#130D29] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-purple-500/30 rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-purple-500/30 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-purple-500/15">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {lang === 'hi' ? 'अन्य सभी टूल्स व सेटिंग्स' : 'All Utilities & Creator Info'}
                </h3>
                <p className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold">
                  {t.creatorText.creatorTitle}
                </p>
              </div>
              <button
                onClick={() => setShowMoreSheet(false)}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mt-4">
              {moreTools.map((tool) => {
                const Icon = tool.icon;
                const isSelected = currentTool === tool.id;
                const isAbout = tool.id === 'about';
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      soundManager.playTap();
                      setShowMoreSheet(false);
                      onNavigate(tool.id);
                    }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                        : isAbout
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                        : 'bg-slate-50 dark:bg-purple-950/20 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-purple-500/15 hover:bg-slate-100 dark:hover:bg-purple-900/30'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-purple-600 dark:text-purple-300" />
                    </div>
                    <span className="text-xs font-semibold truncate">
                      {tool.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Creator Footer in Drawer */}
            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-purple-500/15 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>{t.creatorText.copyright}</span>
              <span className="font-bold text-purple-600 dark:text-purple-400">{t.creatorText.versionLabel}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
