import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

export default function BarbieTodoApp() {
  const LS_KEY = "barbie_todos_v1";

  const [tasks, setTasks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch (e) {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  const [dark, setDark] = useState(() => false);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-theme", dark);
  }, [dark]);

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => t.completed).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  const addTask = () => {
    if (!title.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      completed: false,
      priority: "Medium",
      due: null,
      subtasks: [],
    };
    setTasks((s) => [newTask, ...s]);
    setTitle("");
  };

  const toggleComplete = (id) => {
    setTasks((s) =>
      s.map((t) => ({ ...t, completed: t.id === id ? !t.completed : t.completed }))
    );
  };

  const deleteTask = (id) => {
    setTasks((s) => s.filter((t) => t.id !== id));
  };

  const updateTask = (id, patch) => {
    setTasks((s) => s.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const addSubtask = (taskId, text) => {
    if (!text.trim()) return;
    const st = { id: Date.now().toString() + "-st", text: text.trim(), done: false };
    setTasks((s) => s.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, st] } : t)));
  };

  const toggleSubtask = (taskId, subId) => {
    setTasks((s) =>
      s.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.map((st) => (st.id === subId ? { ...st, done: !st.done } : st)) }
          : t
      )
    );
  };

  const deleteSubtask = (taskId, subId) => {
    setTasks((s) => s.map((t) => (t.id === taskId ? { ...t, subtasks: t.subtasks.filter((st) => st.id !== subId) } : t)));
  };

  const visibleTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = filterPriority === "All" || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const isOverdue = (due) => {
    if (!due) return false;
    const now = new Date();
    return new Date(due) < now && !(new Date(due).toDateString() === now.toDateString());
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "High": return "priority-high";
      case "Medium": return "priority-medium";
      case "Low": return "priority-low";
      default: return "";
    }
  };

  return (
    <div className="todo-app">
      <div className="max-w-6xl mx-auto">
        <header className="app-header">
          <h1 className="app-title">Todo App — Advanced Version</h1>
          <div className="flex items-center gap-4">
            <div className="progress-container">
              <span>{progress}%</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <button className="theme-toggle" onClick={() => setDark((d) => !d)}>
              {dark ? "Dark Theme" : "Light Theme"}
            </button>
          </div>
        </header>

        <main className="app-main">
          {/* Left column: Add and filters */}
          <section>
            <div className="card">
              <div className="form-group">
                <label className="form-label">New Task</label>
                <div className="input-group">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="Add Tasks"
                    className="form-control"
                  />
                  <button onClick={addTask} className="btn btn-primary">
                    Add
                  </button>
                </div>
              </div>

              <hr className="my-4 border-t border-[var(--border)]" />

              {/* Search Section - Updated */}
              <div className="form-group">
                <label className="form-label">Search</label>
                <div className="input-group">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Tasks..."
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Filter by Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="form-control"
                >
                  <option>All</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold mb-3" style={{ color: "var(--text)" }}>
                Tips
              </h3>
              <ul className="text-sm space-y-2" style={{ color: "var(--muted)" }}>
                <li>• Press Enter to add tasks quickly</li>
                <li>• Use priority & due date for reminders</li>
                <li>• Toggle theme button to switch between light/dark</li>
                <li>• Complete all subtasks to mark task as done</li>
              </ul>
            </div>
          </section>

          {/* Tasks list */}
          <section>
            <div className="card">
              {visibleTasks.length === 0 ? (
                <div className="empty-state">
                  <p>No tasks match your search/filter.</p>
                  <p className="mt-2">Try adding a new task or adjusting your filters.</p>
                </div>
              ) : (
                <div className="task-list">
                  {visibleTasks.map((t) => (
                    <article key={t.id} className="task-item">
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          checked={t.completed}
                          onChange={() => toggleComplete(t.id)}
                          className="mt-1 h-5 w-5 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />

                        <div className="flex-1">
                          <div className="task-header">
                            <div>
                              <h4 className={`task-title ${t.completed ? "line-through opacity-70" : ""}`}>{t.title}</h4>
                              <div className="task-meta">
                                {t.due ? (
                                  <span className={`due-date ${isOverdue(t.due) ? "overdue" : ""}`}>
                                    {new Date(t.due).toLocaleDateString()}
                                  </span>
                                ) : (
                                  <span className="text-xs">No due date</span>
                                )}
                                <span>• Priority: <span className={getPriorityClass(t.priority)}>{t.priority}</span></span>
                              </div>
                            </div>

                            <div className="task-actions">
                              <select
                                value={t.priority}
                                onChange={(e) => updateTask(t.id, { priority: e.target.value })}
                                className="select-field text-sm py-1 px-2"
                              >
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                              </select>

                              <input
                                type="datetime-local"
                                value={t.due ? new Date(t.due).toISOString().slice(0, 16) : ""}
                                onChange={(e) => updateTask(t.id, { due: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                className="select-field text-sm py-1 px-2"
                              />

                              <button
                                onClick={() => deleteTask(t.id)}
                                className="btn btn-danger text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          {/* Subtasks */}
                          {t.subtasks.length > 0 && (
                            <div className="subtask-container">
                              <ul className="subtask-list">
                                {t.subtasks.map((st) => (
                                  <li key={st.id} className="subtask-item">
                                    <label className="subtask-label">
                                      <input
                                        type="checkbox"
                                        checked={st.done}
                                        onChange={() => toggleSubtask(t.id, st.id)}
                                        className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                      />
                                      <span className={`subtask-text ${st.done ? "completed" : ""}`}>
                                        {st.text}
                                      </span>
                                    </label>
                                    <button
                                      onClick={() => deleteSubtask(t.id, st.id)}
                                      className="btn btn-danger text-xs"
                                    >
                                      Remove
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="subtask-input-container mt-3">
                            <input
                              placeholder="Add subtask..."
                              className="input-field flex-1 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  addSubtask(t.id, e.currentTarget.value);
                                  e.currentTarget.value = "";
                                }
                              }}
                            />
                            <div className="subtask-count">
                              {t.subtasks.length} subtasks
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}