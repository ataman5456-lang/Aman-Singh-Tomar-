import React, { useState, useMemo } from 'react';
import {
  Wallet,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Trash2,
  Download,
  Filter,
  DollarSign,
  AlertCircle,
  PiggyBank,
} from 'lucide-react';
import { ExpenseItem, ExpenseSettings, Language, Currency } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface ExpenseTrackerProps {
  expenses: ExpenseItem[];
  onUpdateExpenses: (expenses: ExpenseItem[]) => void;
  settings: ExpenseSettings;
  onUpdateSettings: (settings: ExpenseSettings) => void;
  lang: Language;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  onUpdateExpenses,
  settings,
  onUpdateSettings,
  lang,
}) => {
  const t = useTranslation(lang);
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchFilter, setSearchFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'expense' | 'income'>('all');
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [tempBudget, setTempBudget] = useState(settings.monthlyBudget.toString());

  const categories = [
    'Food',
    'Transport',
    'Bills',
    'Shopping',
    'Health',
    'Entertainment',
    'Salary',
    'Investment',
    'Other',
  ];

  const currencies: Currency[] = ['₹', '$', '€', '£', '¥', 'AED'];

  // Financial calculations
  const totalIncome = useMemo(() => {
    return expenses
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalExpense = useMemo(() => {
    return expenses
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const netBalance = totalIncome - totalExpense;

  // Monthly expense calculation for current month
  const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentMonthExpenses = useMemo(() => {
    return expenses
      .filter((e) => e.type === 'expense' && e.date.startsWith(currentMonthKey))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonthKey]);

  const budgetProgress = settings.monthlyBudget > 0
    ? Math.min(100, Math.round((currentMonthExpenses / settings.monthlyBudget) * 100))
    : 0;
  const isOverBudget = settings.monthlyBudget > 0 && currentMonthExpenses > settings.monthlyBudget;

  // Category breakdown for expenses
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses
      .filter((e) => e.type === 'expense')
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount;
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  // Filtered transactions
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchType = typeFilter === 'all' || e.type === typeFilter;
      const q = searchFilter.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        e.note.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.amount.toString().includes(q);
      return matchType && matchSearch;
    });
  }, [expenses, typeFilter, searchFilter]);

  // Handle Add Transaction
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return;

    soundManager.playTap();
    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      type,
      amount: val,
      category,
      date: date || new Date().toISOString().split('T')[0],
      note: note.trim() || category,
    };

    onUpdateExpenses([newItem, ...expenses]);
    setAmount('');
    setNote('');
  };

  // Quick preset entry
  const handleQuickAdd = (quickAmount: number, quickCategory: string, quickNote: string) => {
    soundManager.playTap();
    const newItem: ExpenseItem = {
      id: `exp-${Date.now()}`,
      type: 'expense',
      amount: quickAmount,
      category: quickCategory,
      date: new Date().toISOString().split('T')[0],
      note: quickNote,
    };
    onUpdateExpenses([newItem, ...expenses]);
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    soundManager.playTap();
    onUpdateExpenses(expenses.filter((e) => e.id !== id));
  };

  // Export CSV
  const handleExportCSV = () => {
    soundManager.playTap();
    const headers = 'ID,Type,Amount,Currency,Category,Date,Note\n';
    const rows = expenses
      .map(
        (e) =>
          `"${e.id}","${e.type}","${e.amount}","${settings.currency}","${e.category}","${e.date}","${e.note.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pocketlife_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Total Balance */}
        <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 border border-slate-200 dark:border-purple-500/20 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t.expensesText.totalBalance}</span>
            <Wallet className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tabular-nums mt-1">
            {settings.currency}{netBalance.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'hi' ? 'संचित बचत' : 'Cumulative net savings'}
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 border border-emerald-200 dark:border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t.expensesText.totalIncome}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            +{settings.currency}{totalIncome.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {expenses.filter((e) => e.type === 'income').length} {lang === 'hi' ? 'जमा प्रविष्टियां' : 'income credits'}
          </div>
        </div>

        {/* Total Spends */}
        <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 border border-rose-200 dark:border-rose-500/20 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>{t.expensesText.totalExpense}</span>
            <TrendingDown className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 tabular-nums mt-1">
            -{settings.currency}{totalExpense.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {expenses.filter((e) => e.type === 'expense').length} {lang === 'hi' ? 'खर्च प्रविष्टियां' : 'spend entries'}
          </div>
        </div>
      </div>

      {/* Monthly Budget Tracker Bar */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              {t.expensesText.monthlyBudget}
            </h3>
          </div>
          <button
            onClick={() => {
              setTempBudget(settings.monthlyBudget.toString());
              setShowBudgetModal(true);
            }}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold cursor-pointer"
          >
            {t.expensesText.budgetSettings}
          </button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium tabular-nums mb-1.5">
            <span>
              {lang === 'hi' ? 'इस माह खर्च' : 'This Month'}: {settings.currency}{currentMonthExpenses.toLocaleString()}
            </span>
            <span>
              {t.expensesText.monthlyBudget}: {settings.currency}{settings.monthlyBudget.toLocaleString()} ({budgetProgress}%)
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-purple-950/40 overflow-hidden p-0.5 border border-slate-200 dark:border-purple-500/20">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOverBudget
                  ? 'bg-rose-500'
                  : budgetProgress > 80
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-purple-500 to-indigo-500'
              }`}
              style={{ width: `${Math.min(100, budgetProgress)}%` }}
            />
          </div>

          {isOverBudget && (
            <div className="mt-2 text-xs text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                {t.expensesText.budgetOver}: +{settings.currency}{(currentMonthExpenses - settings.monthlyBudget).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add New Transaction Form */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>{t.expensesText.addTransaction}</span>
        </h3>

        <form onSubmit={handleAddTransaction} className="space-y-3.5">
          {/* Income / Expense Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-purple-950/30 rounded-xl border border-slate-200 dark:border-purple-500/15">
            <button
              type="button"
              onClick={() => {
                soundManager.playTap();
                setType('expense');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>{t.expensesText.expense}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.playTap();
                setType('income');
              }}
              className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.expensesText.income}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.expensesText.amount} ({settings.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 dark:text-purple-400 font-bold text-sm">
                  {settings.currency}
                </span>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-300 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-purple-500 tabular-nums"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.expensesText.category}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-300 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-[#120B24] text-slate-900 dark:text-white">
                    {t.expensesText.categoriesList[cat as keyof typeof t.expensesText.categoriesList] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.expensesText.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-300 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {t.expensesText.note}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={lang === 'hi' ? 'उदा. चाय, पेट्रोल, वेतन...' : 'e.g. Groceries, Metro, Coffee...'}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-300 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 shrink-0">{t.expensesText.quickAdd}:</span>
            <button
              type="button"
              onClick={() => handleQuickAdd(50, 'Food', 'Tea / Snacks')}
              className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-800/40 whitespace-nowrap cursor-pointer font-medium"
            >
              +{settings.currency}50 Chai
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(250, 'Food', 'Groceries')}
              className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-800/40 whitespace-nowrap cursor-pointer font-medium"
            >
              +{settings.currency}250 Grocery
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(500, 'Transport', 'Vehicle Fuel')}
              className="px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 hover:bg-purple-200 dark:hover:bg-purple-800/40 whitespace-nowrap cursor-pointer font-medium"
            >
              +{settings.currency}500 Fuel
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-[0.99] cursor-pointer"
          >
            {t.expensesText.addTransaction}
          </button>
        </form>
      </div>

      {/* Category Expense Distribution */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
            {lang === 'hi' ? 'श्रेणीवार खर्च विश्लेषण' : 'Category Spending Breakdown'}
          </h4>
          <div className="space-y-2">
            {categoryBreakdown.slice(0, 5).map(([cat, amt]) => {
              const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                    <span>
                      {t.expensesText.categoriesList[cat as keyof typeof t.expensesText.categoriesList] || cat}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {settings.currency}{amt.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-purple-950/40 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>{t.history}</span>
            <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
              ({filteredExpenses.length} {lang === 'hi' ? 'प्रविष्टियां' : 'records'})
            </span>
          </h3>

          <div className="flex items-center gap-2">
            {/* Filter by Type */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-purple-950/30 border border-slate-200 dark:border-purple-500/20 text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2 py-1 rounded-md transition ${typeFilter === 'all' ? 'bg-purple-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
              >
                {t.all}
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-2 py-1 rounded-md transition ${typeFilter === 'expense' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
              >
                {t.expensesText.expense}
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-2 py-1 rounded-md transition ${typeFilter === 'income' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-600 dark:text-slate-400'}`}
              >
                {t.expensesText.income}
              </button>
            </div>

            {/* Export CSV button */}
            {expenses.length > 0 && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-500/30 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition cursor-pointer"
                title={t.expensesText.exportCSV}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">CSV</span>
              </button>
            )}
          </div>
        </div>

        {/* Search inside transactions */}
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          placeholder={lang === 'hi' ? 'विवरण या श्रेणी खोजें...' : 'Search note or category...'}
          className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/20 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
        />

        {/* Transactions List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
              {t.expensesText.noTransactions}
            </div>
          ) : (
            filteredExpenses.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-purple-950/25 border border-slate-200 dark:border-purple-500/15 hover:border-purple-500/30 transition group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.type === 'income'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {item.type === 'income' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {item.note}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{t.expensesText.categoriesList[item.category as keyof typeof t.expensesText.categoriesList] || item.category}</span>
                      <span>·</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <span
                    className={`text-xs sm:text-sm font-bold tabular-nums ${
                      item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {item.type === 'income' ? '+' : '-'}{settings.currency}{item.amount.toLocaleString()}
                  </span>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Budget & Currency Settings Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#140D2B] border border-purple-500/30 p-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-sm font-bold text-white mb-3">
              {t.expensesText.budgetSettings}
            </h3>

            <div className="space-y-4">
              {/* Currency Picker */}
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">
                  {t.expensesText.currency}
                </label>
                <div className="grid grid-cols-6 gap-1.5">
                  {currencies.map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => {
                        soundManager.playTap();
                        onUpdateSettings({ ...settings, currency: curr });
                      }}
                      className={`py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        settings.currency === curr
                          ? 'bg-purple-600 text-white'
                          : 'bg-purple-950/40 text-slate-300 hover:bg-purple-900/50'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monthly Budget Input */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {t.expensesText.monthlyBudget} ({settings.currency})
                </label>
                <input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  placeholder="25000"
                  className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/30 text-white text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const parsed = parseFloat(tempBudget);
                    onUpdateSettings({
                      ...settings,
                      monthlyBudget: isNaN(parsed) || parsed < 0 ? 0 : parsed,
                    });
                    setShowBudgetModal(false);
                    soundManager.playTap();
                  }}
                  className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-md"
                >
                  {t.save}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
