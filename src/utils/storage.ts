import {
  AppBackupData,
  ExpenseItem,
  ExpenseSettings,
  GroceryItem,
  Language,
  NoteItem,
  Theme,
  TodoItem,
} from '../types';

const STORAGE_KEYS = {
  LANGUAGE: 'pocketlife_lang',
  THEME: 'pocketlife_theme',
  EXPENSES: 'pocketlife_expenses',
  EXPENSE_SETTINGS: 'pocketlife_expense_settings',
  GROCERIES: 'pocketlife_groceries',
  NOTES: 'pocketlife_notes',
  TODOS: 'pocketlife_todos',
  CALC_HISTORY: 'pocketlife_calc_history',
  CREATOR_AVATAR: 'pocketlife_creator_avatar',
  SPLASH_SEEN: 'pocketlife_splash_seen',
};

// Default seed data for a friendly first-time experience
const initialExpenses: ExpenseItem[] = [
  {
    id: 'exp-1',
    type: 'income',
    amount: 55000,
    category: 'Salary',
    date: new Date().toISOString().split('T')[0],
    note: 'Monthly salary credit',
  },
  {
    id: 'exp-2',
    type: 'expense',
    amount: 1200,
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    note: 'Family dinner & groceries',
  },
  {
    id: 'exp-3',
    type: 'expense',
    amount: 350,
    category: 'Transport',
    date: new Date().toISOString().split('T')[0],
    note: 'Fuel & metro card recharge',
  },
  {
    id: 'exp-4',
    type: 'expense',
    amount: 2400,
    category: 'Bills',
    date: new Date().toISOString().split('T')[0],
    note: 'Electricity and fiber internet',
  },
];

const initialExpenseSettings: ExpenseSettings = {
  currency: '₹',
  monthlyBudget: 25000,
};

const initialGroceries: GroceryItem[] = [
  {
    id: 'groc-1',
    name: 'Fresh Cow Milk',
    category: 'Dairy',
    quantity: 2,
    unit: 'l',
    checked: true,
    price: 120,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'groc-2',
    name: 'Brown Whole Wheat Bread',
    category: 'Bakery',
    quantity: 1,
    unit: 'pkt',
    checked: false,
    price: 50,
    createdAt: Date.now() - 3000000,
  },
  {
    id: 'groc-3',
    name: 'Farm Fresh Tomatoes',
    category: 'Vegetables',
    quantity: 1.5,
    unit: 'kg',
    checked: false,
    price: 60,
    createdAt: Date.now() - 2500000,
  },
  {
    id: 'groc-4',
    name: 'Basmati Rice',
    category: 'Pantry',
    quantity: 5,
    unit: 'kg',
    checked: false,
    price: 450,
    createdAt: Date.now() - 2000000,
  },
];

const initialNotes: NoteItem[] = [
  {
    id: 'note-1',
    title: '✨ Welcome to Pocket Life',
    content:
      'All your daily utility tools in one private app.\n\n• Works 100% offline\n• Zero login or cloud tracking\n• Installable as a PWA on your phone\n• Export & backup your data anytime via Backup & Restore',
    color: 'purple',
    pinned: true,
    updatedAt: Date.now(),
  },
  {
    id: 'note-2',
    title: 'Quick Home WiFi & Passwords',
    content: 'Guest WiFi password is taped under the router. Generate strong offline passphrases using the Password tool.',
    color: 'blue',
    pinned: false,
    updatedAt: Date.now() - 86400000,
  },
];

const initialTodos: TodoItem[] = [
  {
    id: 'todo-1',
    text: 'Explore Pocket Life tools and install to phone home screen',
    completed: true,
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    createdAt: Date.now() - 100000,
  },
  {
    id: 'todo-2',
    text: 'Review weekly grocery checklist',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: Date.now() - 50000,
  },
  {
    id: 'todo-3',
    text: 'Backup app data to local storage',
    completed: false,
    priority: 'low',
    createdAt: Date.now(),
  },
];

// Helper functions for safe local storage
export function getSavedItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

export function saveItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Storage managers for individual features
export const StorageManager = {
  getLanguage: (): Language => {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language) || 'en';
  },
  setLanguage: (lang: Language) => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  getTheme: (): Theme => {
    return (localStorage.getItem(STORAGE_KEYS.THEME) as Theme) || 'dark';
  },
  setTheme: (theme: Theme) => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getExpenses: (): ExpenseItem[] => {
    return getSavedItem<ExpenseItem[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
  },
  setExpenses: (expenses: ExpenseItem[]) => {
    saveItem(STORAGE_KEYS.EXPENSES, expenses);
  },

  getExpenseSettings: (): ExpenseSettings => {
    return getSavedItem<ExpenseSettings>(
      STORAGE_KEYS.EXPENSE_SETTINGS,
      initialExpenseSettings
    );
  },
  setExpenseSettings: (settings: ExpenseSettings) => {
    saveItem(STORAGE_KEYS.EXPENSE_SETTINGS, settings);
  },

  getGroceries: (): GroceryItem[] => {
    return getSavedItem<GroceryItem[]>(STORAGE_KEYS.GROCERIES, initialGroceries);
  },
  setGroceries: (groceries: GroceryItem[]) => {
    saveItem(STORAGE_KEYS.GROCERIES, groceries);
  },

  getNotes: (): NoteItem[] => {
    return getSavedItem<NoteItem[]>(STORAGE_KEYS.NOTES, initialNotes);
  },
  setNotes: (notes: NoteItem[]) => {
    saveItem(STORAGE_KEYS.NOTES, notes);
  },

  getTodos: (): TodoItem[] => {
    return getSavedItem<TodoItem[]>(STORAGE_KEYS.TODOS, initialTodos);
  },
  setTodos: (todos: TodoItem[]) => {
    saveItem(STORAGE_KEYS.TODOS, todos);
  },

  getCalcHistory: (): string[] => {
    return getSavedItem<string[]>(STORAGE_KEYS.CALC_HISTORY, []);
  },
  setCalcHistory: (history: string[]) => {
    saveItem(STORAGE_KEYS.CALC_HISTORY, history);
  },

  getCreatorAvatar: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.CREATOR_AVATAR);
  },
  setCreatorAvatar: (avatar: string | null): void => {
    if (avatar) {
      localStorage.setItem(STORAGE_KEYS.CREATOR_AVATAR, avatar);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CREATOR_AVATAR);
    }
  },

  getSplashSeen: (): boolean => {
    return localStorage.getItem(STORAGE_KEYS.SPLASH_SEEN) === 'true';
  },
  setSplashSeen: (seen: boolean): void => {
    localStorage.setItem(STORAGE_KEYS.SPLASH_SEEN, seen ? 'true' : 'false');
  },

  // Export all data as structured JSON
  exportAllData: (): AppBackupData => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      language: StorageManager.getLanguage(),
      theme: StorageManager.getTheme(),
      expenseSettings: StorageManager.getExpenseSettings(),
      expenses: StorageManager.getExpenses(),
      groceries: StorageManager.getGroceries(),
      notes: StorageManager.getNotes(),
      todos: StorageManager.getTodos(),
      calcHistory: StorageManager.getCalcHistory(),
    };
  },

  // Import and restore data (merge or overwrite)
  importData: (data: Partial<AppBackupData>, mode: 'merge' | 'overwrite'): boolean => {
    try {
      if (mode === 'overwrite') {
        if (data.expenses) StorageManager.setExpenses(data.expenses);
        if (data.expenseSettings) StorageManager.setExpenseSettings(data.expenseSettings);
        if (data.groceries) StorageManager.setGroceries(data.groceries);
        if (data.notes) StorageManager.setNotes(data.notes);
        if (data.todos) StorageManager.setTodos(data.todos);
        if (data.calcHistory) StorageManager.setCalcHistory(data.calcHistory);
        if (data.language) StorageManager.setLanguage(data.language);
        if (data.theme) StorageManager.setTheme(data.theme);
      } else {
        // Merge mode: combine unique IDs
        if (data.expenses) {
          const current = StorageManager.getExpenses();
          const existingIds = new Set(current.map((e) => e.id));
          const newItems = data.expenses.filter((e) => !existingIds.has(e.id));
          StorageManager.setExpenses([...newItems, ...current]);
        }
        if (data.groceries) {
          const current = StorageManager.getGroceries();
          const existingIds = new Set(current.map((g) => g.id));
          const newItems = data.groceries.filter((g) => !existingIds.has(g.id));
          StorageManager.setGroceries([...current, ...newItems]);
        }
        if (data.notes) {
          const current = StorageManager.getNotes();
          const existingIds = new Set(current.map((n) => n.id));
          const newItems = data.notes.filter((n) => !existingIds.has(n.id));
          StorageManager.setNotes([...current, ...newItems]);
        }
        if (data.todos) {
          const current = StorageManager.getTodos();
          const existingIds = new Set(current.map((t) => t.id));
          const newItems = data.todos.filter((t) => !existingIds.has(t.id));
          StorageManager.setTodos([...current, ...newItems]);
        }
        if (data.expenseSettings) {
          StorageManager.setExpenseSettings(data.expenseSettings);
        }
      }
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  },

  // Wipe all data and restore factory initial
  wipeAllData: (): void => {
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSE_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.GROCERIES);
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.TODOS);
    localStorage.removeItem(STORAGE_KEYS.CALC_HISTORY);
  },

  // Calculate local storage size in bytes
  getEstimatedStorageUsage: (): { bytes: number; formatted: string; count: number } => {
    let total = 0;
    let count = 0;
    try {
      for (const key of Object.values(STORAGE_KEYS)) {
        const item = localStorage.getItem(key);
        if (item) {
          total += key.length + item.length * 2; // UTF-16
        }
      }
      const expenses = StorageManager.getExpenses();
      const groceries = StorageManager.getGroceries();
      const notes = StorageManager.getNotes();
      const todos = StorageManager.getTodos();
      count = expenses.length + groceries.length + notes.length + todos.length;
    } catch {
      total = 0;
    }
    const kb = (total / 1024).toFixed(1);
    return {
      bytes: total,
      formatted: `${kb} KB`,
      count,
    };
  },
};
