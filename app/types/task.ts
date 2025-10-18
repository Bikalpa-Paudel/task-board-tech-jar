export type TaskStatus = "pending" | "inProgress" | "done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: TaskStatus;
}

export const TASK_STATUSES: TaskStatus[] = ["pending", "inProgress", "done"];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  inProgress: "In Progress",
  done: "Done",
};
