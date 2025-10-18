import { Task, TaskStatus, TASK_STATUSES } from "../types/task";

const STORAGE_KEY = "task-tracker-tasks";
const NETWORK_DELAY = 250;

const initialTasks: Task[] = [
  {
    id: "seed-1",
    title: "Draft project brief",
    description: "Summarize scope, success metrics, constraints, and key milestones.",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: "pending",
  },
  {
    id: "seed-2",
    title: "Review design mocks",
    description: "Sync with design team to finalize the dashboard layout.",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    status: "inProgress",
  },
  {
    id: "seed-3",
    title: "QA automation smoke tests",
    description: "Ensure new flows have automated coverage in CI.",
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "done",
  },
];

let memoryTasks: Task[] | null = null;

const withDelay = async <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY));

const readFromStorage = (): Task[] => {
  if (typeof window === "undefined") {
    if (!memoryTasks) {
      memoryTasks = [...initialTasks];
    }
    return memoryTasks;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTasks));
    return [...initialTasks];
  }

  try {
    const parsed = JSON.parse(raw) as Task[];
    return parsed.map((task) => ({ ...task }));
  } catch (error) {
    console.error("Failed to parse tasks from storage", error);
    return [...initialTasks];
  }
};

const writeToStorage = (tasks: Task[]) => {
  if (typeof window === "undefined") {
    memoryTasks = [...tasks];
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const generateId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `task-${Math.random().toString(36).slice(2, 11)}`;
};

export const fetchTasks = async (): Promise<Task[]> => {
  const tasks = readFromStorage();
  return withDelay(tasks);
};

export const createTask = async (payload: Omit<Task, "id">): Promise<Task> => {
  const tasks = readFromStorage();
  const newTask: Task = { ...payload, id: generateId() };
  tasks.push(newTask);
  writeToStorage(tasks);
  return withDelay(newTask);
};

export const updateTask = async (
  id: string,
  updates: Partial<Omit<Task, "id">>
): Promise<Task> => {
  const tasks = readFromStorage();
  const index = tasks.findIndex((task) => task.id === id);
  if (index === -1) {
    throw new Error("Task not found");
  }
  const updated: Task = { ...tasks[index], ...updates };
  tasks[index] = updated;
  writeToStorage(tasks);
  return withDelay(updated);
};

export const deleteTask = async (id: string): Promise<void> => {
  const tasks = readFromStorage();
  const nextTasks = tasks.filter((task) => task.id !== id);
  writeToStorage(nextTasks);
  await withDelay(undefined);
};

export const moveTask = async (id: string, status: TaskStatus): Promise<Task> => {
  if (!TASK_STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }
  return updateTask(id, { status });
};
