"use client";

import { Droppable } from "@hello-pangea/dnd";
import { Task, TaskStatus, STATUS_LABELS } from "../types/task";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskColumn({
  status,
  tasks,
  onAdd,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskColumnProps) {
  return (
    <section className="flex h-full min-h-0 min-w-[280px] max-h-[48rem] flex-1 flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-inner backdrop-blur dark:border-slate-800 dark:bg-slate-900/40">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            {STATUS_LABELS[status]}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {tasks.length} task{tasks.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(status)}
          className="rounded-xl border border-transparent bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          + Add
        </button>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Droppable droppableId={status} type="task">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex h-full w-full flex-col gap-3 overflow-y-auto rounded-2xl border border-dashed border-transparent p-2 transition ${
                snapshot.isDraggingOver
                  ? "border-indigo-300 bg-indigo-50/60 dark:border-indigo-400/60 dark:bg-indigo-500/10"
                  : "border-transparent"
              }`}
            >
              {tasks.length === 0 ? (
                <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/40 p-6 text-center text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-500">
                  No tasks here yet.
                </div>
              ) : (
                tasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={index}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </section>
  );
}
