import React, { useState, useMemo } from 'react';
import {
  FileText,
  CheckSquare,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Check,
  Calendar,
  AlertCircle,
  Search,
  Sparkles,
} from 'lucide-react';
import { NoteItem, TodoItem, NoteColor, TodoPriority, Language } from '../../types';
import { useTranslation } from '../../i18n/translations';
import { soundManager } from '../../utils/sound';

interface NotesTodoListProps {
  notes: NoteItem[];
  onUpdateNotes: (notes: NoteItem[]) => void;
  todos: TodoItem[];
  onUpdateTodos: (todos: TodoItem[]) => void;
  lang: Language;
}

export const NotesTodoList: React.FC<NotesTodoListProps> = ({
  notes,
  onUpdateNotes,
  todos,
  onUpdateTodos,
  lang,
}) => {
  const t = useTranslation(lang);
  const [activeTab, setActiveTab] = useState<'notes' | 'todo'>('notes');

  // --- Notes State ---
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteColor, setNoteColor] = useState<NoteColor>('purple');
  const [noteSearch, setNoteSearch] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // --- Todo State ---
  const [todoText, setTodoText] = useState('');
  const [todoPriority, setTodoPriority] = useState<TodoPriority>('medium');
  const [todoDueDate, setTodoDueDate] = useState('');
  const [todoFilter, setTodoFilter] = useState<'all' | 'active' | 'done'>('all');

  const colorStyles: Record<NoteColor, { bg: string; border: string; text: string; dot: string }> = {
    purple: {
      bg: 'bg-purple-50/70 dark:bg-purple-950/25',
      border: 'border-purple-200 dark:border-purple-500/30',
      text: 'text-purple-900 dark:text-purple-300',
      dot: 'bg-purple-500',
    },
    blue: {
      bg: 'bg-blue-50/70 dark:bg-blue-950/25',
      border: 'border-blue-200 dark:border-blue-500/30',
      text: 'text-blue-900 dark:text-blue-300',
      dot: 'bg-blue-500',
    },
    emerald: {
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/25',
      border: 'border-emerald-200 dark:border-emerald-500/30',
      text: 'text-emerald-900 dark:text-emerald-300',
      dot: 'bg-emerald-500',
    },
    amber: {
      bg: 'bg-amber-50/70 dark:bg-amber-950/25',
      border: 'border-amber-200 dark:border-amber-500/30',
      text: 'text-amber-900 dark:text-amber-300',
      dot: 'bg-amber-500',
    },
    rose: {
      bg: 'bg-rose-50/70 dark:bg-rose-950/25',
      border: 'border-rose-200 dark:border-rose-500/30',
      text: 'text-rose-900 dark:text-rose-300',
      dot: 'bg-rose-500',
    },
    slate: {
      bg: 'bg-slate-100/70 dark:bg-slate-900/40',
      border: 'border-slate-200 dark:border-slate-700/50',
      text: 'text-slate-800 dark:text-slate-300',
      dot: 'bg-slate-500',
    },
  };

  // --- Note Actions ---
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    soundManager.playTap();
    if (editingNoteId) {
      onUpdateNotes(
        notes.map((n) =>
          n.id === editingNoteId
            ? {
                ...n,
                title: noteTitle.trim(),
                content: noteContent.trim(),
                color: noteColor,
                updatedAt: Date.now(),
              }
            : n
        )
      );
      setEditingNoteId(null);
    } else {
      const newNote: NoteItem = {
        id: `note-${Date.now()}`,
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent.trim(),
        color: noteColor,
        pinned: false,
        updatedAt: Date.now(),
      };
      onUpdateNotes([newNote, ...notes]);
    }

    setNoteTitle('');
    setNoteContent('');
  };

  const handleTogglePin = (id: string) => {
    soundManager.playTap();
    onUpdateNotes(
      notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const handleDeleteNote = (id: string) => {
    soundManager.playTap();
    onUpdateNotes(notes.filter((n) => n.id !== id));
  };

  const handleEditNote = (note: NoteItem) => {
    soundManager.playTap();
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteColor(note.color);
  };

  // Filter and sort notes (pinned first)
  const filteredNotes = useMemo(() => {
    const q = noteSearch.trim().toLowerCase();
    const list = notes.filter((n) => {
      return (
        q === '' ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q)
      );
    });

    return list.sort((a, b) => {
      if (a.pinned === b.pinned) return b.updatedAt - a.updatedAt;
      return a.pinned ? -1 : 1;
    });
  }, [notes, noteSearch]);

  // --- Todo Actions ---
  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoText.trim()) return;

    soundManager.playTap();
    const newTodo: TodoItem = {
      id: `todo-${Date.now()}`,
      text: todoText.trim(),
      completed: false,
      priority: todoPriority,
      dueDate: todoDueDate || undefined,
      createdAt: Date.now(),
    };

    onUpdateTodos([newTodo, ...todos]);
    setTodoText('');
    setTodoDueDate('');
  };

  const handleToggleTodo = (id: string) => {
    soundManager.playTap();
    onUpdateTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTodo = (id: string) => {
    soundManager.playTap();
    onUpdateTodos(todos.filter((t) => t.id !== id));
  };

  const handleClearCompletedTodos = () => {
    soundManager.playTap();
    onUpdateTodos(todos.filter((t) => !t.completed));
  };

  const completedTodosCount = useMemo(() => {
    return todos.filter((t) => t.completed).length;
  }, [todos]);

  const todoProgress = todos.length > 0
    ? Math.round((completedTodosCount / todos.length) * 100)
    : 0;

  const filteredTodos = useMemo(() => {
    if (todoFilter === 'active') return todos.filter((t) => !t.completed);
    if (todoFilter === 'done') return todos.filter((t) => t.completed);
    return todos;
  }, [todos, todoFilter]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Sub-Tabs: Notes vs To-Do */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-purple-950/30 rounded-xl border border-slate-200 dark:border-purple-500/15">
        <button
          onClick={() => {
            soundManager.playTap();
            setActiveTab('notes');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t.notesText.notesTab} ({notes.length})</span>
        </button>
        <button
          onClick={() => {
            soundManager.playTap();
            setActiveTab('todo');
          }}
          className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'todo'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>{t.notesText.todoTab} ({todos.filter((i) => !i.completed).length})</span>
        </button>
      </div>

      {/* NOTES TAB */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Create Note Card */}
          <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{editingNoteId ? t.edit : t.notesText.addNote}</span>
            </h3>

            <form onSubmit={handleSaveNote} className="space-y-3">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder={t.notesText.noteTitle}
                className="w-full px-3 py-2 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm font-semibold focus:outline-none focus:border-purple-400"
              />

              <textarea
                rows={3}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder={t.notesText.noteContent}
                className="w-full p-3 rounded-xl bg-purple-950/20 border border-purple-500/25 text-white text-sm focus:outline-none focus:border-purple-400 resize-none leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                {/* Color Palette Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{lang === 'hi' ? 'रंग' : 'Color'}:</span>
                  {(['purple', 'blue', 'emerald', 'amber', 'rose', 'slate'] as NoteColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNoteColor(c)}
                      className={`w-6 h-6 rounded-full ${colorStyles[c].dot} transition active:scale-95 cursor-pointer flex items-center justify-center ${
                        noteColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-[#140D2B]' : ''
                      }`}
                    >
                      {noteColor === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {editingNoteId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNoteId(null);
                        setNoteTitle('');
                        setNoteContent('');
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      {t.cancel}
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition shadow-md cursor-pointer"
                  >
                    {editingNoteId ? t.save : t.notesText.addNote}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Search Notes */}
          {notes.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={noteSearch}
                onChange={(e) => setNoteSearch(e.target.value)}
                placeholder={t.notesText.searchNotes}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#140D2B] border border-purple-500/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-purple-400"
              />
            </div>
          )}

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 bg-[#140D2B]/50 rounded-2xl border border-purple-500/15 p-6">
              {t.notesText.noNotes}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredNotes.map((note) => {
                const style = colorStyles[note.color] || colorStyles.purple;
                return (
                  <div
                    key={note.id}
                    className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${style.bg} ${style.border} relative group shadow-sm`}
                  >
                    <div>
                      {/* Note Header */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {note.title}
                        </h4>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleTogglePin(note.id)}
                            className={`p-1 rounded-md transition cursor-pointer ${
                              note.pinned
                                ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40'
                                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white'
                            }`}
                            title={note.pinned ? t.notesText.unpinNote : t.notesText.pinNote}
                          >
                            <Pin className="w-3.5 h-3.5 fill-current" />
                          </button>
                          <button
                            onClick={() => handleEditNote(note)}
                            className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                            title={t.edit}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-rose-500 transition cursor-pointer"
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed mt-2.5">
                        {note.content}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-purple-500/10 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                      {note.pinned && (
                        <span className="text-purple-600 dark:text-purple-400 font-semibold">{t.notesText.pinned}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TODO TAB */}
      {activeTab === 'todo' && (
        <div className="space-y-4">
          {/* Add Todo Card */}
          <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{t.notesText.addTodo}</span>
            </h3>

            <form onSubmit={handleAddTodo} className="space-y-3">
              <input
                type="text"
                value={todoText}
                onChange={(e) => setTodoText(e.target.value)}
                placeholder={t.notesText.todoPlaceholder}
                required
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t.notesText.priority}
                  </label>
                  <select
                    value={todoPriority}
                    onChange={(e) => setTodoPriority(e.target.value as TodoPriority)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="high" className="bg-white dark:bg-[#120B24]">{t.notesText.priorityLevels.high}</option>
                    <option value="medium" className="bg-white dark:bg-[#120B24]">{t.notesText.priorityLevels.medium}</option>
                    <option value="low" className="bg-white dark:bg-[#120B24]">{t.notesText.priorityLevels.low}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {t.notesText.dueDate}
                  </label>
                  <input
                    type="date"
                    value={todoDueDate}
                    onChange={(e) => setTodoDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-purple-950/20 border border-slate-200 dark:border-purple-500/25 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition shadow-md cursor-pointer h-[38px] flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.notesText.addTodo}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Progress Bar */}
          {todos.length > 0 && (
            <div className="bg-white dark:bg-[#140D2B] rounded-2xl p-4 border border-slate-200 dark:border-purple-500/20 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                <span>{t.notesText.taskProgress}</span>
                <span className="tabular-nums text-purple-600 dark:text-purple-400 font-bold">{todoProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-purple-950/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${todoProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Filter Bar & Clear Completed */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-purple-950/30 border border-purple-500/20 text-xs">
              <button
                onClick={() => setTodoFilter('all')}
                className={`px-2.5 py-1 rounded-md transition ${todoFilter === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
              >
                {t.notesText.allTasks} ({todos.length})
              </button>
              <button
                onClick={() => setTodoFilter('active')}
                className={`px-2.5 py-1 rounded-md transition ${todoFilter === 'active' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
              >
                {t.notesText.activeTasks} ({todos.filter((t) => !t.completed).length})
              </button>
              <button
                onClick={() => setTodoFilter('done')}
                className={`px-2.5 py-1 rounded-md transition ${todoFilter === 'done' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}
              >
                {t.notesText.doneTasks} ({completedTodosCount})
              </button>
            </div>

            {completedTodosCount > 0 && (
              <button
                onClick={handleClearCompletedTodos}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer"
              >
                {t.clear} ({completedTodosCount})
              </button>
            )}
          </div>

          {/* Todo Items List */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-[#140D2B]/40 rounded-2xl border border-purple-500/15 p-6">
                {t.notesText.noTodos}
              </div>
            ) : (
              filteredTodos.map((todo) => {
                const isOverdue =
                  todo.dueDate &&
                  !todo.completed &&
                  todo.dueDate < todayStr;

                return (
                  <div
                    key={todo.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition ${
                      todo.completed
                        ? 'bg-purple-950/10 border-purple-500/10 opacity-60'
                        : 'bg-[#140D2B] border-purple-500/20 hover:border-purple-500/40'
                    }`}
                  >
                    <div
                      onClick={() => handleToggleTodo(todo.id)}
                      className="flex items-center gap-3 cursor-pointer min-w-0 flex-1 select-none"
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition ${
                          todo.completed
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'border-purple-500/40 bg-purple-950/40'
                        }`}
                      >
                        {todo.completed && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0">
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate block ${
                            todo.completed ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {todo.text}
                        </span>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {/* Priority badge */}
                          <span
                            className={`font-semibold ${
                              todo.priority === 'high'
                                ? 'text-rose-400'
                                : todo.priority === 'medium'
                                ? 'text-amber-400'
                                : 'text-blue-400'
                            }`}
                          >
                            {t.notesText.priorityLevels[todo.priority]}
                          </span>

                          {todo.dueDate && (
                            <>
                              <span>·</span>
                              <span className={isOverdue ? 'text-rose-400 font-bold flex items-center gap-1' : ''}>
                                {isOverdue && <AlertCircle className="w-3 h-3 inline" />}
                                {todo.dueDate} {isOverdue ? `(${t.notesText.overdue})` : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition ml-2 cursor-pointer"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
