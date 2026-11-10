import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Check,
  Share2,
  Copy,
  Tag,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { GroceryItem, Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface GroceryListProps {
  groceries: GroceryItem[];
  onUpdateGroceries: (items: GroceryItem[]) => void;
  lang: Language;
  currency: string;
}

export const GroceryList: React.FC<GroceryListProps> = ({
  groceries,
  onUpdateGroceries,
  lang,
  currency,
}) => {
  const t = useTranslation(lang);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [copiedShare, setCopiedShare] = useState(false);

  const categories = [
    'Vegetables',
    'Dairy',
    'Fruits',
    'Pantry',
    'Bakery',
    'Snacks',
    'Household',
    'Personal',
    'Other',
  ];

  const units = ['kg', 'g', 'l', 'ml', 'pcs', 'pkt', 'doz'];

  const quickSuggestions = [
    { name: lang === 'hi' ? 'ताज़ा दूध' : 'Milk', cat: 'Dairy', qty: 2, u: 'l', p: 120 },
    { name: lang === 'hi' ? 'अंडे' : 'Eggs', cat: 'Dairy', qty: 12, u: 'pcs', p: 90 },
    { name: lang === 'hi' ? 'ब्रेड' : 'Bread', cat: 'Bakery', qty: 1, u: 'pkt', p: 45 },
    { name: lang === 'hi' ? 'टमाटर' : 'Tomatoes', cat: 'Vegetables', qty: 1, u: 'kg', p: 40 },
    { name: lang === 'hi' ? 'प्याज' : 'Onions', cat: 'Vegetables', qty: 2, u: 'kg', p: 60 },
    { name: lang === 'hi' ? 'आलू' : 'Potatoes', cat: 'Vegetables', qty: 3, u: 'kg', p: 75 },
    { name: lang === 'hi' ? 'बासमती चावल' : 'Rice', cat: 'Pantry', qty: 5, u: 'kg', p: 400 },
    { name: lang === 'hi' ? 'केले' : 'Bananas', cat: 'Fruits', qty: 1, u: 'doz', p: 50 },
    { name: lang === 'hi' ? 'चाय पत्ती' : 'Tea Leaves', cat: 'Pantry', qty: 500, u: 'g', p: 180 },
  ];

  // Budget sum
  const totalEstimatedCost = useMemo(() => {
    return groceries.reduce((sum, item) => sum + (item.price || 0), 0);
  }, [groceries]);

  const completedCount = useMemo(() => {
    return groceries.filter((i) => i.checked).length;
  }, [groceries]);

  // Handle Add Item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    soundManager.playTap();
    const newItem: GroceryItem = {
      id: `groc-${Date.now()}`,
      name: name.trim(),
      category,
      quantity: parseFloat(quantity) || 1,
      unit,
      checked: false,
      price: price ? parseFloat(price) : undefined,
      createdAt: Date.now(),
    };

    onUpdateGroceries([newItem, ...groceries]);
    setName('');
    setPrice('');
  };

  // Quick suggestion click
  const handleAddSuggestion = (s: typeof quickSuggestions[0]) => {
    soundManager.playTap();
    const newItem: GroceryItem = {
      id: `groc-${Date.now()}`,
      name: s.name,
      category: s.cat,
      quantity: s.qty,
      unit: s.u,
      checked: false,
      price: s.p,
      createdAt: Date.now(),
    };
    onUpdateGroceries([newItem, ...groceries]);
  };

  // Toggle checked state
  const handleToggleCheck = (id: string) => {
    soundManager.playTap();
    onUpdateGroceries(
      groceries.map((item) => {
        if (item.id === id) {
          return { ...item, checked: !item.checked };
        }
        return item;
      })
    );
  };

  // Delete item
  const handleDelete = (id: string) => {
    soundManager.playTap();
    onUpdateGroceries(groceries.filter((item) => item.id !== id));
  };

  // Clear completed items
  const handleClearCompleted = () => {
    soundManager.playTap();
    onUpdateGroceries(groceries.filter((item) => !item.checked));
  };

  // Share or Copy formatted list
  const handleShareList = () => {
    soundManager.playTap();
    const header = `🛒 ${t.appName} – ${t.tools.grocery.title}\n`;
    const pendingLines = groceries
      .filter((i) => !i.checked)
      .map((i) => `• [ ] ${i.name} - ${i.quantity} ${i.unit}${i.price ? ` (${currency}${i.price})` : ''}`)
      .join('\n');
    const checkedLines = groceries
      .filter((i) => i.checked)
      .map((i) => `• [✓] ${i.name} (${lang === 'hi' ? 'खरीद लिया' : 'bought'})`)
      .join('\n');

    const fullText = `${header}\n${pendingLines}${checkedLines ? `\n\n${lang === 'hi' ? 'खरीदी गई वस्तुएं' : 'Completed'}:\n${checkedLines}` : ''}\n\n${t.groceryText.totalEstimate}: ${currency}${totalEstimatedCost}`;

    if (navigator.share) {
      navigator.share({
        title: t.tools.grocery.title,
        text: fullText,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(fullText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const filteredGroceries = useMemo(() => {
    if (filterCategory === 'all') return groceries;
    return groceries.filter((item) => item.category === filterCategory);
  }, [groceries, filterCategory]);

  return (
    <div className="space-y-6">
      {/* Top Summary Banner */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-purple-600 dark:text-rose-400" />
            <span>{t.tools.grocery.title}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {groceries.length - completedCount} {lang === 'hi' ? 'सामान बाकी' : 'items pending'} · {completedCount} {t.groceryText.completedItems}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {totalEstimatedCost > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/25 text-xs text-purple-800 dark:text-purple-200">
              <span className="text-slate-500 dark:text-slate-400">{t.groceryText.totalEstimate}: </span>
              <strong className="font-bold text-emerald-600 dark:text-emerald-400">{currency}{totalEstimatedCost.toLocaleString()}</strong>
            </div>
          )}

          {groceries.length > 0 && (
            <button
              onClick={handleShareList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow transition cursor-pointer"
            >
              {copiedShare ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedShare ? t.copied : t.groceryText.shareList}</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Item Form */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
        <form onSubmit={handleAddItem} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {/* Item Name */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.groceryText.itemName}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.groceryText.itemName}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Quantity & Unit */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.groceryText.quantity}
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-16 px-2 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500 text-center tabular-nums"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="flex-1 px-2 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                >
                  {units.map((u) => (
                    <option key={u} value={u} className="bg-white dark:bg-[#120B24] text-slate-900 dark:text-white">
                      {t.groceryText.unitsList[u as keyof typeof t.groceryText.unitsList] || u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Estimated Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.groceryText.estimatedPrice} ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500 tabular-nums"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Category Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 text-xs">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] shrink-0">{t.expensesText.category}:</span>
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    category === cat
                      ? 'bg-purple-600 text-white font-semibold'
                      : 'bg-slate-100 dark:bg-purple-950/30 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
                  }`}
                >
                  {t.groceryText.categoriesList[cat as keyof typeof t.groceryText.categoriesList] || cat}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.groceryText.addItem}</span>
            </button>
          </div>
        </form>

        {/* Quick Suggestions Carousel */}
        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-purple-500/15">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
            {t.groceryText.quickSuggestions}:
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {quickSuggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddSuggestion(s)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-purple-950/30 hover:bg-slate-200 dark:hover:bg-purple-900/40 border border-slate-200 dark:border-purple-500/20 text-slate-700 dark:text-purple-200 whitespace-nowrap transition cursor-pointer flex items-center gap-1"
              >
                <span>+ {s.name}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">({s.qty} {s.u})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Checklist Display */}
      <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            {lang === 'hi' ? 'आपकी खरीदारी सूची' : 'Items Checklist'}
          </h4>

          {completedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="text-xs text-rose-500 dark:text-rose-400 hover:underline transition cursor-pointer"
            >
              {t.groceryText.clearChecked} ({completedCount})
            </button>
          )}
        </div>

        {filteredGroceries.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
            {t.groceryText.noItems}
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredGroceries.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition ${
                  item.checked
                    ? 'bg-slate-100/60 dark:bg-purple-950/10 border-slate-200 dark:border-purple-500/10 opacity-60'
                    : 'bg-slate-50 dark:bg-purple-950/20 border-slate-200 dark:border-purple-500/20 hover:border-purple-500/40'
                }`}
              >
                <div
                  onClick={() => handleToggleCheck(item.id)}
                  className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 select-none"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                      item.checked
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-purple-400/50 bg-white dark:bg-purple-950/40'
                    }`}
                  >
                    {item.checked && <Check className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`text-xs sm:text-sm font-semibold truncate block ${
                        item.checked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {item.quantity} {item.unit} · {t.groceryText.categoriesList[item.category as keyof typeof t.groceryText.categoriesList] || item.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-2">
                  {item.price && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {currency}{item.price}
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    title={t.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
