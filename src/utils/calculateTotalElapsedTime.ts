import { Task } from "../types/core";

export function calculateTotalElapsedTime(task: Task) {
  let totalTime = task.elapsedTime;

  if (task.subTasks && task.subTasks.length > 0) {
    for (const subTask of task.subTasks) {
      totalTime += calculateTotalElapsedTime(subTask);
    }
  }

  return totalTime;
}
