"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Task, STATUS_LABELS, TaskStatus } from "../types/task";

interface TaskCardProps {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

const formatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function TaskCard({ task, index, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const dueDateLabel = formatter.format(new Date(task.dueDate));

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style ?? undefined}
          className={`group cursor-grab rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:cursor-grabbing dark:border-slate-800 dark:bg-slate-900 ${
            snapshot.isDragging
              ? "cursor-grabbing ring-2 ring-indigo-300 shadow-lg"
              : "hover:-translate-y-0.5 hover:shadow-md"
          }`}
        >
          <header className="mb-3 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="rounded-lg border border-transparent bg-slate-100 p-1 text-slate-400 transition dark:bg-slate-800 dark:text-slate-500"
              >
                ⠿
              </span>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {task.title}
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {STATUS_LABELS[task.status]}
            </span>
          </header>
          {task.description ? (
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
              {task.description}
            </p>
          ) : null}
          <p className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Due {dueDateLabel}
          </p>
          <footer className="flex items-center gap-2 text-sm">
            <select
              aria-label="Change status"
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              value={task.status}
              onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}
            >
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <option key={status} value={status}>
                  {label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded-lg border border-transparent bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-200 dark:hover:bg-indigo-500/25"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="rounded-lg border border-transparent bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:bg-rose-500/15 dark:text-rose-200 dark:hover:bg-rose-500/25"
            >
              Delete
            </button>
          </footer>
        </article>
      )}
    </Draggable>
  );
}
