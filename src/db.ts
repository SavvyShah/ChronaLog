// db.ts
import Dexie, { Table } from "dexie";
import { Log, Task } from "./types/core";
import { useLiveQuery } from "dexie-react-hooks";
import { isNumber } from "./utils/isNumber";

export type TaskWithOptionalId = Omit<Task, "id"> & { id?: number };
export type LogWithOptionalId = Omit<Log, "id"> & { id?: number };

export class ChronaLog extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  tasks!: Table<TaskWithOptionalId>;
  logs!: Table<LogWithOptionalId>;

  constructor() {
    super("ChronaLog");
    this.version(1).stores({
      tasks: "++id, name, parentID, createdAt, updatedAt", // Primary key and indexed props
      logs: "++id, name, parentID, createdAt, updatedAt, tags",
    });
  }
}

export const db = new ChronaLog();

export const useTask = (id: number) => {
  return useLiveQuery(async () => {
    //
    // Query the DB using our promise based API.
    // The end result will magically become
    // observable.
    //
    if (id) {
      const subTasks = await db.tasks
        .filter((task) => task.parentID === Number(id))
        .toArray();
      const logs = await db.logs
        .filter((log) => log.parentID === Number(id))
        .toArray();
      const task = await db.tasks.get(id);

      return {
        ...task,
        id: Number(id),
        subTasks,
        logs,
      };
    }
    const subTasks = await db.tasks.filter((task) => !task.parentID).toArray();
    return {
      name: "root",
      id: undefined,
      elapsedTime: 0,
      subTasks,
      logs: [],
    };
  }, [id]);
};

export const createTask = async (task: Partial<Task>, parentID?: number) => {
  const defaultTask = { name: "Untitled", elapsedTime: 0 };
  if (parentID) {
    const parentTask = await db.tasks.get(parentID);
    // Create the task
    const childId = (await db.tasks.add({
      ...defaultTask,
      ...task,
      parentID: Number(parentID) || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    })) as number;

    const subTasks = parentTask?.subTasks || [];
    if (!subTasks.includes(childId)) {
      await db.tasks.update(parentID, {
        ...parentTask,
        updatedAt: new Date(),
        subTasks: [...subTasks, childId],
      });
    }

    return;
  }
  await db.tasks.add({
    ...defaultTask,
    ...task,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
};
/**
 * update.elapsedTime gives the replacement value for elapsedTime
 */
export const updateTask = async (id: number, update: Partial<Task>) => {
  const task = await db.tasks.get(id);
  if (task) {
    if (isNumber(update.elapsedTime) && task?.parentID) {
      const parentTask = await db.tasks.get(task.parentID);
      if (parentTask) {
        // current time + new contribution - old contribution
        await updateTask(task.parentID, {
          elapsedTime:
            parentTask.elapsedTime + update.elapsedTime - task.elapsedTime,
        });
      }
    }
    await db.tasks.update(id, {
      ...update,
      updatedAt: new Date(),
      elapsedTime: isNumber(update.elapsedTime)
        ? update.elapsedTime
        : task.elapsedTime,
    });
  }
};

export const deleteTask = async (id: number) => {
  const task = await db.tasks.get(id);
  if (task?.parentID) {
    const parentTask = await db.tasks.get(task.parentID);
    if (parentTask?.id) {
      await updateTask(parentTask.id, {
        subTasks: (task.subTasks || []).filter((subTask) => subTask !== id),
        elapsedTime: parentTask.elapsedTime - task.elapsedTime,
      });
    }
  }
  if (task?.subTasks) {
    const deleteRecursive = async (subTaskId: number) => {
      const subTask = await db.tasks.get(subTaskId);
      if (subTask && subTask.subTasks) {
        subTask.subTasks.forEach((subTaskId) => {
          deleteRecursive(subTaskId);
        });
      }
      await db.tasks.delete(subTaskId);
    };
    await Promise.all(
      task.subTasks.map(async (subTaskId) => {
        await deleteRecursive(subTaskId);
      })
    );
  }
  if (task?.logs) {
    await Promise.all(
      task.logs.map(async (logId) => {
        await db.logs.delete(logId);
      })
    );
  }
  await db.tasks.delete(id);
};

export const createLog = async (log: Partial<Log>, parentID: number) => {
  const defaultLog = { name: "Untitled", elapsedTime: 0 };
  if (parentID) {
    const parentTask = await db.tasks.get(parentID);
    if (parentTask) {
      const childId = (await db.logs.add({
        ...defaultLog,
        ...log,
        parentID,
        createdAt: new Date(),
        updatedAt: new Date(),
      })) as number;

      const logs = parentTask?.logs || [];
      if (!logs.includes(childId)) {
        await updateTask(parentID, {
          logs: [...logs, childId],
          elapsedTime:
            parentTask.elapsedTime +
            (isNumber(log.elapsedTime) ? log.elapsedTime : 0),
        });
      }
    }

    return;
  }
};

export const updateLog = async (id: number, update: Partial<Log>) => {
  const log = await db.logs.get(id);
  if (log) {
    const task = await db.tasks.get(log.parentID);
    if (isNumber(update.elapsedTime) && task) {
      await updateTask(log.parentID, {
        // current + new - old
        elapsedTime: task.elapsedTime + update.elapsedTime - log.elapsedTime,
      });
    }
    await db.logs.update(id, {
      ...update,
      updatedAt: new Date(),
      elapsedTime: isNumber(update.elapsedTime)
        ? update.elapsedTime
        : log.elapsedTime,
    });
  }
};

export const deleteLog = async (id: number) => {
  const log = await db.logs.get(id);
  if (log) {
    const task = await db.tasks.get(log.parentID);
    if (task?.logs) {
      await updateTask(log.parentID, {
        // current + new - old
        elapsedTime: task.elapsedTime - log.elapsedTime,
        logs: task.logs.filter((logId) => logId !== id),
      });
    }
  }
  await db.logs.delete(id);
};
