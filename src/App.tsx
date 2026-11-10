/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Language,
  Theme,
  ToolId,
  ExpenseItem,
  ExpenseSettings,
  GroceryItem,
  NoteItem,
  TodoItem,
} from './types';
import { StorageManager } from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SplashScreen } from './components/SplashScreen';
import { Dashboard } from './components/Dashboard';
import { ExpenseTracker } from './components/tools/ExpenseTracker';
import { AgeCalculator } from './components/tools/AgeCalculator';
import { DateCalculator } from './components/tools/DateCalculator';
import { PasswordGenerator } from './components/tools/PasswordGenerator';
import { GroceryList } from './components/tools/GroceryList';
import { StopwatchTimer } from './components/tools/StopwatchTimer';
import { TextTools } from './components/tools/TextTools';
import { SmartCalculator } from './components/tools/SmartCalculator';
import { QRCodeGenerator } from './components/tools/QRCodeGenerator';
import { NotesTodoList } from './components/tools/NotesTodoList';
import { BackupRestore } from './components/tools/BackupRestore';
import { AboutApp } from './components/tools/AboutApp';

export default function App() {
  // App State
  const [currentTool, setCurrentTool] = useState<ToolId>('dashboard');
  const [lang, setLang] = useState<Language>(StorageManager.getLanguage);
  const [theme, setTheme] = useState<Theme>(StorageManager.getTheme);

  // Splash Screen State: Show on first launch of session
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    // Check if shown in this browser session
    const sessionSeen = sessionStorage.getItem('pocketlife_splash_session');
    if (!sessionSeen) {
      sessionStorage.setItem('pocketlife_splash_session', 'true');
      return true;
    }
    return false;
  });

  // Feature Data States
  const [expenses, setExpenses] = useState<ExpenseItem[]>(StorageManager.getExpenses);
  const [expenseSettings, setExpenseSettings] = useState<ExpenseSettings>(
    StorageManager.getExpenseSettings
  );
  const [groceries, setGroceries] = useState<GroceryItem[]>(StorageManager.getGroceries);
  const [notes, setNotes] = useState<NoteItem[]>(StorageManager.getNotes);
  const [todos, setTodos] = useState<TodoItem[]>(StorageManager.getTodos);
  const [calcHistory, setCalcHistory] = useState<string[]>(StorageManager.getCalcHistory);

  // Sync theme to HTML documentElement and meta theme-color
  useEffect(() => {
    const root = document.documentElement;
    const themeColorMeta = document.getElementById('theme-color-meta');
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#0B071A');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      if (themeColorMeta) themeColorMeta.setAttribute('content', '#F8FAFC');
    }
    StorageManager.setTheme(theme);
  }, [theme]);

  // Sync language
  const handleToggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    StorageManager.setLanguage(newLang);
  };

  // Sync theme
  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Register service worker for offline PWA compliance
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('Pocket Life Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
    }
  }, []);

  // Update handlers with localStorage persistence
  const handleUpdateExpenses = (newExpenses: ExpenseItem[]) => {
    setExpenses(newExpenses);
    StorageManager.setExpenses(newExpenses);
  };

  const handleUpdateExpenseSettings = (newSettings: ExpenseSettings) => {
    setExpenseSettings(newSettings);
    StorageManager.setExpenseSettings(newSettings);
  };

  const handleUpdateGroceries = (newGroceries: GroceryItem[]) => {
    setGroceries(newGroceries);
    StorageManager.setGroceries(newGroceries);
  };

  const handleUpdateNotes = (newNotes: NoteItem[]) => {
    setNotes(newNotes);
    StorageManager.setNotes(newNotes);
  };

  const handleUpdateTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    StorageManager.setTodos(newTodos);
  };

  const handleUpdateCalcHistory = (newHistory: string[]) => {
    setCalcHistory(newHistory);
    StorageManager.setCalcHistory(newHistory);
  };

  // Reload all states after Backup Restore or Factory Reset
  const handleReloadAllData = useCallback(() => {
    setExpenses(StorageManager.getExpenses());
    setExpenseSettings(StorageManager.getExpenseSettings());
    setGroceries(StorageManager.getGroceries());
    setNotes(StorageManager.getNotes());
    setTodos(StorageManager.getTodos());
    setCalcHistory(StorageManager.getCalcHistory());
    setLang(StorageManager.getLanguage());
    setTheme(StorageManager.getTheme());
  }, []);

  // Scroll to top on navigation
  const handleNavigate = (tool: ToolId) => {
    setCurrentTool(tool);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B071A] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Opening Splash Screen with Creator Branding */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          lang={lang}
        />
      )}

      {/* Top App Header */}
      <Header
        currentTool={currentTool}
        onNavigate={handleNavigate}
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Viewport Content with proper bottom padding so BottomNav never overlaps */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-28 sm:pb-32">
        {currentTool === 'dashboard' && (
          <Dashboard
            onSelectTool={handleNavigate}
            lang={lang}
            expenses={expenses}
            groceries={groceries}
            todos={todos}
            currency={expenseSettings.currency}
          />
        )}

        {currentTool === 'expenses' && (
          <ExpenseTracker
            expenses={expenses}
            onUpdateExpenses={handleUpdateExpenses}
            settings={expenseSettings}
            onUpdateSettings={handleUpdateExpenseSettings}
            lang={lang}
          />
        )}

        {currentTool === 'age' && <AgeCalculator lang={lang} />}

        {currentTool === 'date' && <DateCalculator lang={lang} />}

        {currentTool === 'password' && <PasswordGenerator lang={lang} />}

        {currentTool === 'grocery' && (
          <GroceryList
            groceries={groceries}
            onUpdateGroceries={handleUpdateGroceries}
            lang={lang}
            currency={expenseSettings.currency}
          />
        )}

        {currentTool === 'stopwatch' && <StopwatchTimer lang={lang} />}

        {currentTool === 'text' && <TextTools lang={lang} />}

        {currentTool === 'calculator' && (
          <SmartCalculator
            calcHistory={calcHistory}
            onUpdateHistory={handleUpdateCalcHistory}
            lang={lang}
          />
        )}

        {currentTool === 'qr' && <QRCodeGenerator lang={lang} />}

        {currentTool === 'notes' && (
          <NotesTodoList
            notes={notes}
            onUpdateNotes={handleUpdateNotes}
            todos={todos}
            onUpdateTodos={handleUpdateTodos}
            lang={lang}
          />
        )}

        {currentTool === 'backup' && (
          <BackupRestore lang={lang} onDataReloaded={handleReloadAllData} />
        )}

        {currentTool === 'about' && (
          <AboutApp
            lang={lang}
            onReplaySplash={() => setShowSplash(true)}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        currentTool={currentTool}
        onNavigate={handleNavigate}
        lang={lang}
      />

      {/* Offline Toast Indicator */}
      <OfflineIndicator lang={lang} />
    </div>
  );
}
