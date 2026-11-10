import React, { useState, useMemo } from 'react';
import {
  Wallet,
  CalendarDays,
  KeyRound,
  ShoppingCart,
  Timer,
  FileText,
  Calculator,
  QrCode,
  CheckSquare,
  Database,
  Search,
  ArrowRight,
  TrendingUp,
  Sparkles,
  User,
  Heart,
} from 'lucide-react';
import { Language, ToolId, ExpenseItem, GroceryItem, TodoItem } from '../types';
import { useTranslation } from '../i18n/translations';
import { soundManager } from '../utils/sound';

interface DashboardProps {
  onSelectTool: (tool: ToolId) => void;
  lang: Language;
  expenses: ExpenseItem[];
  groceries: GroceryItem[];
  todos: TodoItem[];
  currency: string;
}

interface ToolDefinition {
  id: ToolId;
  titleKey: keyof ReturnType<typeof useTranslation>['tools'];
  category: 'finance' | 'calculators' | 'productivity' | 'utilities';
  icon: React.ElementType;
  gradient: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectTool,
  lang,
  expenses,
  groceries,
  todos,
  currency,
}) => {
  const t = useTranslation(lang);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'finance' | 'calculators' | 'productivity' | 'utilities'
  >('all');

  // Quick summary calculations
  const totalBalance = useMemo(() => {
    return expenses.reduce((acc, item) => {
      return item.type === 'income' ? acc + item.amount : acc - item.amount;
    }, 0);
  }, [expenses]);

  const pendingTodos = useMemo(() => {
    return todos.filter((todo) => !todo.completed).length;
  }, [todos]);

  const pendingGroceries = useMemo(() => {
    return groceries.filter((item) => !item.checked).length;
  }, [groceries]);

  const toolsList: ToolDefinition[] = [
    {
      id: 'expenses',
      titleKey: 'expenses',
      category: 'finance',
      icon: Wallet,
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-500 dark:text-emerald-400',
    },
    {
      id: 'calculator',
      titleKey: 'calculator',
      category: 'calculators',
      icon: Calculator,
      gradient: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-500 dark:text-blue-400',
    },
    {
      id: 'age',
      titleKey: 'age',
      category: 'calculators',
      icon: Sparkles,
      gradient: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-500 dark:text-purple-400',
    },
    {
      id: 'date',
      titleKey: 'date',
      category: 'calculators',
      icon: CalendarDays,
      gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    },
    {
      id: 'notes',
      titleKey: 'notes',
      category: 'productivity',
      icon: CheckSquare,
      gradient: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'grocery',
      titleKey: 'grocery',
      category: 'productivity',
      icon: ShoppingCart,
      gradient: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-500 dark:text-rose-400',
    },
    {
      id: 'stopwatch',
      titleKey: 'stopwatch',
      category: 'utilities',
      icon: Timer,
      gradient: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-500 dark:text-violet-400',
    },
    {
      id: 'password',
      titleKey: 'password',
      category: 'utilities',
      icon: KeyRound,
      gradient: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-500 dark:text-indigo-400',
    },
    {
      id: 'qr',
      titleKey: 'qr',
      category: 'utilities',
      icon: QrCode,
      gradient: 'from-fuchsia-500/20 to-purple-500/20 border-fuchsia-500/30 text-fuchsia-500 dark:text-fuchsia-400',
    },
    {
      id: 'text',
      titleKey: 'text',
      category: 'utilities',
      icon: FileText,
      gradient: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-600 dark:text-teal-400',
    },
    {
      id: 'backup',
      titleKey: 'backup',
      category: 'utilities',
      icon: Database,
      gradient: 'from-slate-500/20 to-purple-500/20 border-slate-500/30 text-slate-600 dark:text-slate-400',
    },
  ];

  // Filter tools based on category and search query
  const filteredTools = useMemo(() => {
    return toolsList.filter((tool) => {
      const toolData = t.tools[tool.titleKey];
      const matchesCategory =
        selectedCategory === 'all' || tool.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === '' ||
        toolData.title.toLowerCase().includes(query) ||
        toolData.desc.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [toolsList, selectedCategory, searchQuery, t]);

  return (
    <div className="space-y-6 pb-28 sm:pb-32">
      {/* Clean Premium Purple-Blue Gradient Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#4C1D95] via-[#312E81] to-[#1E3A8A] text-white p-5 sm:p-7 shadow-xl shadow-indigo-950/20 border border-purple-400/25">
        {/* Soft Ambient Glow Elements */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full bg-purple-400/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-400/20 blur-3xl"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Brand & Subtitle Info with Creator Identity */}
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-semibold text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              <span>{t.creatorText.tagline}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow-sm flex items-center gap-2.5">
              <span>{t.appName}</span>
              <span className="text-xs font-semibold text-purple-200 bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
                {t.creatorText.versionLabel}
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed font-normal">
              {t.creatorText.creatorTitle} · {t.appSubtitle}
            </p>
          </div>

          {/* Quick Interactive Stat Tiles (Frosted Glass) */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
            {/* Balance Stat */}
            <div
              onClick={() => {
                soundManager.playTap();
                onSelectTool('expenses');
              }}
              className="bg-white/10 hover:bg-white/15 active:scale-95 backdrop-blur-md rounded-xl p-3 border border-white/15 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="text-[10px] text-purple-200 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
                <span className="truncate">{t.expensesText.totalBalance}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white tabular-nums truncate mt-1">
                {currency}{totalBalance.toLocaleString()}
              </div>
            </div>

            {/* Pending Tasks */}
            <div
              onClick={() => {
                soundManager.playTap();
                onSelectTool('notes');
              }}
              className="bg-white/10 hover:bg-white/15 active:scale-95 backdrop-blur-md rounded-xl p-3 border border-white/15 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="text-[10px] text-purple-200 flex items-center gap-1 font-medium">
                <CheckSquare className="w-3 h-3 text-amber-300" />
                <span className="truncate">{t.notesText.activeTasks}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white tabular-nums truncate mt-1">
                {pendingTodos} {lang === 'hi' ? 'कार्य' : 'Tasks'}
              </div>
            </div>

            {/* Grocery Checklist */}
            <div
              onClick={() => {
                soundManager.playTap();
                onSelectTool('grocery');
              }}
              className="bg-white/10 hover:bg-white/15 active:scale-95 backdrop-blur-md rounded-xl p-3 border border-white/15 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="text-[10px] text-purple-200 flex items-center gap-1 font-medium">
                <ShoppingCart className="w-3 h-3 text-rose-300" />
                <span className="truncate">{t.tools.grocery.title}</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white tabular-nums truncate mt-1">
                {pendingGroceries} {lang === 'hi' ? 'बाकी' : 'Items'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Category Filter Toolbar */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchToolsPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#140D2B]/90 border border-slate-300 dark:border-purple-500/20 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-800 dark:hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
          <button
            onClick={() => {
              soundManager.playTap();
              setSelectedCategory('all');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-purple-950/30 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.all} (11)
          </button>
          <button
            onClick={() => {
              soundManager.playTap();
              setSelectedCategory('finance');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'finance'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-purple-950/30 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.categories.finance}
          </button>
          <button
            onClick={() => {
              soundManager.playTap();
              setSelectedCategory('calculators');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'calculators'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-purple-950/30 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.categories.calculators}
          </button>
          <button
            onClick={() => {
              soundManager.playTap();
              setSelectedCategory('productivity');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'productivity'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-purple-950/30 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.categories.productivity}
          </button>
          <button
            onClick={() => {
              soundManager.playTap();
              setSelectedCategory('utilities');
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
              selectedCategory === 'utilities'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-purple-950/30 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.categories.utilities}
          </button>
        </div>
      </div>

      {/* Grid of 11 Tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {filteredTools.map((tool) => {
          const toolInfo = t.tools[tool.titleKey];
          const Icon = tool.icon;

          return (
            <div
              key={tool.id}
              onClick={() => {
                soundManager.playTap();
                onSelectTool(tool.id);
              }}
              className="group relative bg-white dark:bg-[#130D29]/90 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-950/15 transition-all duration-200 cursor-pointer flex flex-col justify-between active:scale-[0.98]"
            >
              <div className="flex items-start gap-3.5">
                {/* Icon Tile */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${tool.gradient} border flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Title & Description */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition truncate">
                      {toolInfo.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {toolInfo.desc}
                  </p>
                </div>
              </div>

              {/* Sub-footer status text */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-purple-500/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span className="capitalize">{t.categories[tool.category]}</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold group-hover:underline">
                  {lang === 'hi' ? 'खोलें' : 'Open'} →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-[#130D29]/40 rounded-2xl border border-slate-200 dark:border-purple-500/15 p-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {lang === 'hi'
              ? 'कोई टूल नहीं मिला। कृपया दूसरा शब्द खोजें।'
              : 'No utilities found matching your search.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-3 px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold cursor-pointer"
          >
            {t.clear}
          </button>
        </div>
      )}

      {/* Permanent Creator Showcase Bar at Bottom of Home */}
      <section
        onClick={() => {
          soundManager.playTap();
          onSelectTool('about');
        }}
        className="rounded-2xl p-4 bg-purple-50 dark:bg-purple-950/25 border border-purple-200 dark:border-purple-500/20 hover:border-purple-400 dark:hover:border-purple-500/40 transition cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow">
            AT
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 justify-center sm:justify-start">
              <span>{t.creatorText.creatorTitle}</span>
              <span className="text-[10px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-200/50 dark:bg-purple-900/50 px-2 py-0.2 rounded-full">
                {t.creatorText.versionLabel}
              </span>
            </div>
            <div className="text-[11px] text-purple-700 dark:text-purple-300/80 font-medium mt-0.5">
              {t.creatorText.tagline}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300 group">
          <span>{lang === 'hi' ? 'निर्माता परिचय देखें' : 'View Creator Profile'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </section>

      {/* Permanent Copyright Footer */}
      <div className="text-center pt-2 text-[11px] text-slate-500 dark:text-slate-400">
        <p>{t.creatorText.copyright}</p>
      </div>
    </div>
  );
};
