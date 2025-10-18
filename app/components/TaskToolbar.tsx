"use client";

import { TaskStatus, STATUS_LABELS } from "../types/task";

const FILTER_OPTIONS: Array<{ value: TaskStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: STATUS_LABELS.pending },
  { value: "inProgress", label: STATUS_LABELS.inProgress },
  { value: "done", label: STATUS_LABELS.done },
];

interface TaskToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: TaskStatus | "all";
  onFilterChange: (value: TaskStatus | "all") => void;
  sortBy: "title" | "dueDate";
  sortOrder: "asc" | "desc";
  onSortByChange: (value: "title" | "dueDate") => void;
  onSortOrderChange: (value: "asc" | "desc") => void;
  onCreate: () => void;
}

export function TaskToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  onCreate,
}: TaskToolbarProps) {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] md:min-w-[260px]">
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              type="button"
              key={option.value}
              onClick={() => onFilterChange(option.value)}
              className={`rounded-2xl border px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                filter === option.value
                  ? "border-transparent bg-indigo-600 text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500/40"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Sort
          </label>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value as "title" | "dueDate")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="dueDate">Due date</option>
            <option value="title">Title</option>
          </select>
          <select
            value={sortOrder}
            onChange={(event) => onSortOrderChange(event.target.value as "asc" | "desc")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-2xl border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          New Task
        </button>
      </div>
    </section>
  );
}
