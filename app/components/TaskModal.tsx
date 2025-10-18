"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Task, TaskStatus, STATUS_LABELS } from "../types/task";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  initialTask?: Task | null;
  defaultStatus?: TaskStatus;
}

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  status: TaskStatus;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const toInputDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const DEFAULT_VALUES: TaskFormValues = {
  title: "",
  description: "",
  dueDate: toInputDate(today.toISOString()),
  status: "pending",
};

export function TaskModal({ isOpen, onClose, onSubmit, initialTask, defaultStatus }: TaskModalProps) {
  const [values, setValues] = useState<TaskFormValues>(DEFAULT_VALUES);
  const [isSubmitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialTask) {
      setValues({
        title: initialTask.title,
        description: initialTask.description ?? "",
        dueDate: toInputDate(initialTask.dueDate),
        status: initialTask.status,
      });
    } else {
      setValues({
        ...DEFAULT_VALUES,
        status: defaultStatus ?? "pending",
      });
    }
  }, [isOpen, initialTask, defaultStatus]);

  const modalTitle = useMemo(() => (initialTask ? "Edit task" : "Create task"), [initialTask]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (field: keyof TaskFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        dueDate: values.dueDate,
        status: values.status,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <header className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {modalTitle}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {initialTask ? "Update details and keep momentum." : "Capture the next actionable step."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:hover:bg-slate-900"
            aria-label="Close modal"
          >
            ✕
          </button>
        </header>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="task-title">
              Title
            </label>
            <input
              id="task-title"
              required
              value={values.title}
              onChange={(event) => handleChange("title", event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Ship the onboarding flow"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="task-description">
              Description
            </label>
            <textarea
              id="task-description"
              value={values.description}
              onChange={(event) => handleChange("description", event.target.value)}
              className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Add more context, blockers, or links"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="task-due-date">
                Due date
              </label>
              <input
                id="task-due-date"
                type="date"
                required
                value={values.dueDate}
                onChange={(event) => handleChange("dueDate", event.target.value)}
                className="date-picker w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300" htmlFor="task-status">
                Status
              </label>
              <select
                id="task-status"
                value={values.status}
                onChange={(event) => handleChange("status", event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {Object.entries(STATUS_LABELS).map(([status, label]) => (
                  <option key={status} value={status}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || values.title.trim().length === 0}
              className="rounded-xl border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : initialTask ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
