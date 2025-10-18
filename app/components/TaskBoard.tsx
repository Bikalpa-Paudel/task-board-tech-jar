"use client";

import Image from "next/image";
import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { useEffect, useMemo, useState } from "react";
import { Task, TaskStatus, TASK_STATUSES } from "../types/task";
import { TaskColumn } from "./TaskColumn";
import { TaskToolbar } from "./TaskToolbar";
import { TaskModal, TaskFormValues } from "./TaskModal";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import TechJarLogo from "../../public/tech_jar_pvt_ltd_logo.jpeg";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  moveTask,
} from "../lib/taskApi";

const toIsoDate = (date: string) => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }
  parsed.setHours(23, 59, 59, 999);
  return parsed.toISOString();
};

const sortStrategies: Record<"title" | "dueDate", (a: Task, b: Task) => number> = {
  title: (a, b) => a.title.localeCompare(b.title),
  dueDate: (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
};

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"title" | "dueDate">("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<TaskStatus | undefined>();

  const debouncedSearch = useDebouncedValue(search, 250);

  useEffect(() => {
    let isMounted = true;
    fetchTasks()
      .then((fetched) => {
        if (isMounted) {
          setTasks(fetched);
        }
      })
      .catch((fetchError: unknown) => {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load tasks");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredTasks = useMemo(() => {
    const loweredSearch = debouncedSearch.trim().toLowerCase();

    const visible = tasks.filter((task) => {
      const matchesFilter = filter === "all" ? true : task.status === filter;
      if (!matchesFilter) {
        return false;
      }
      if (!loweredSearch) {
        return true;
      }
      return (
        task.title.toLowerCase().includes(loweredSearch) ||
        (task.description?.toLowerCase().includes(loweredSearch) ?? false)
      );
    });

    const sorted = [...visible].sort(sortStrategies[sortBy]);
    if (sortOrder === "desc") {
      sorted.reverse();
    }
    return sorted;
  }, [debouncedSearch, filter, sortBy, sortOrder, tasks]);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      inProgress: [],
      done: [],
    };
    for (const task of filteredTasks) {
      grouped[task.status].push(task);
    }
    return grouped;
  }, [filteredTasks]);

  const openCreate = (status?: TaskStatus) => {
    setModalTask(null);
    setModalDefaultStatus(status);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setModalTask(task);
    setModalDefaultStatus(task.status);
    setModalOpen(true);
  };

  const handleSave = async (values: TaskFormValues) => {
    if (modalTask) {
      const updated = await updateTask(modalTask.id, {
        title: values.title,
        description: values.description,
        dueDate: toIsoDate(values.dueDate),
        status: values.status,
      });
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
    } else {
      const created = await createTask({
        title: values.title,
        description: values.description,
        dueDate: toIsoDate(values.dueDate),
        status: values.status,
      });
      setTasks((prev) => [...prev, created]);
    }
  };

  const handleDelete = async (task: Task) => {
    const shouldDelete = window.confirm(`Delete task "${task.title}"?`);
    if (!shouldDelete) {
      return;
    }
    await deleteTask(task.id);
    setTasks((prev) => prev.filter((item) => item.id !== task.id));
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    const updated = await moveTask(taskId, status);
    setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
  };

  const handleDragEnd = async ({ destination, source, draggableId }: DropResult) => {
    if (!destination) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destinationStatus = destination.droppableId as TaskStatus;

    if (!TASK_STATUSES.includes(destinationStatus) || !TASK_STATUSES.includes(sourceStatus)) {
      return;
    }

    if (destinationStatus === sourceStatus) {
      return;
    }

    const taskToMove = tasks.find((task) => task.id === draggableId);
    if (!taskToMove) {
      return;
    }

    const originalStatus = taskToMove.status;
    setTasks((prev) =>
      prev.map((task) => (task.id === draggableId ? { ...task, status: destinationStatus } : task))
    );

    try {
      const updated = await moveTask(draggableId, destinationStatus);
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
    } catch (moveError) {
      console.error("Failed to move task", moveError);
      setTasks((prev) =>
        prev.map((task) => (task.id === draggableId ? { ...task, status: originalStatus } : task))
      );
    }
  };

  const activeStatuses: TaskStatus[] = filter === "all" ? TASK_STATUSES : [filter];

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-gradient-to-br from-slate-100 via-white to-indigo-100 px-4 pb-10 pt-6 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 sm:px-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
          <Image
            src={TechJarLogo}
            alt="TechJar company logo"
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl border border-slate-200 object-cover shadow-sm dark:border-slate-700"
          />
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">TechJar Task Tracker</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                Task For Bikalpa Paudel
            </p>
          </div>
        </div>
        <TaskToolbar
          search={search}
          onSearchChange={(value) => setSearch(value)}
          filter={filter}
          onFilterChange={(value) => setFilter(value)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={(value) => setSortBy(value)}
          onSortOrderChange={(value) => setSortOrder(value)}
          onCreate={() => openCreate()}
        />
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
          Loading tasks...
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm text-rose-600 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="max-w-md rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
            <p className="mb-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
              Nothing to show yet
            </p>
            <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
              Adjust the filters or create a task to get your board moving.
            </p>
            <button
              type="button"
              onClick={() => openCreate(filter === "all" ? undefined : filter)}
              className="rounded-2xl border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Create your first task
            </button>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid flex-1 min-h-0 gap-4 md:auto-rows-[minmax(0,1fr)] md:grid-cols-3">
            {TASK_STATUSES.filter((status) => activeStatuses.includes(status)).map((status) => (
              <TaskColumn
                key={status}
                status={status}
                tasks={tasksByStatus[status]}
                onAdd={openCreate}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </DragDropContext>
      )}

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        initialTask={modalTask}
        defaultStatus={modalDefaultStatus}
      />
    </div>
  );
}
