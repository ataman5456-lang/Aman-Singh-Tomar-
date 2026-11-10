export type Language = 'en' | 'hi';
export type Theme = 'dark' | 'light';

export type Currency = '₹' | '$' | '€' | '£' | '¥' | 'AED';

export type ToolId =
  | 'dashboard'
  | 'expenses'
  | 'age'
  | 'date'
  | 'password'
  | 'grocery'
  | 'stopwatch'
  | 'text'
  | 'calculator'
  | 'qr'
  | 'notes'
  | 'backup'
  | 'about';

// Expense Tracker Types
export interface ExpenseItem {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note: string;
}

export interface ExpenseSettings {
  currency: Currency;
  monthlyBudget: number;
}

// Grocery Item
export interface GroceryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  checked: boolean;
  price?: number;
  createdAt: number;
}

// Notes & To-Do
export type NoteColor = 'purple' | 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  color: NoteColor;
  pinned: boolean;
  updatedAt: number;
}

export type TodoPriority = 'high' | 'medium' | 'low';

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: TodoPriority;
  dueDate?: string;
  createdAt: number;
}

// Password Generator History
export interface SavedPassword {
  id: string;
  password: string;
  strength: string;
  createdAt: number;
}

// Full App Local State for Export/Import
export interface AppBackupData {
  version: number;
  exportedAt: string;
  language: Language;
  theme: Theme;
  expenseSettings: ExpenseSettings;
  expenses: ExpenseItem[];
  groceries: GroceryItem[];
  notes: NoteItem[];
  todos: TodoItem[];
  calcHistory: string[];
}
