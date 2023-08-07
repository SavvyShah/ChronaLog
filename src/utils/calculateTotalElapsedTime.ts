import { TaskWithOptionalId, db } from "../db";

export async function calculateTotalElapsedTime(task: TaskWithOptionalId) {
  let totalTime = task.elapsedTime;
  if (task.subTasks && task.subTasks.length > 0) {
    for (const subTaskId of task.subTasks) {
      const subTask = await db.tasks.get(subTaskId);
      if (subTask) {
        totalTime += await calculateTotalElapsedTime(subTask);
      }
    }
  }

  return totalTime;
}
