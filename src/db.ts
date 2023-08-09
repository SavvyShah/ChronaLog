// db.ts
import Dexie, { Table } from "dexie";
import { Log, Task } from "./types/core";
import { useLiveQuery } from "dexie-react-hooks";

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
    const childId = (await db.tasks.put({
      ...defaultTask,
      ...task,
      parentID: Number(parentID) || undefined,
    })) as number;

    const subTasks = parentTask?.subTasks || [];
    if (!subTasks.includes(childId) && parentTask) {
      await db.tasks.put({
        ...parentTask,
        subTasks: [...subTasks, childId],
      });
    }

    return;
  }
  await db.tasks.put({ ...defaultTask, ...task });
};
/**
 * update.elapsedTime gives the amount of time to change the task by.
 */
export const updateTask = async (id: number, update: Partial<Task>) => {
  const task = await db.tasks.get(id);
  if (update.elapsedTime && task?.parentID) {
    await updateTask(task.parentID, { elapsedTime: update.elapsedTime });
  }
  await db.tasks.update(id, {
    ...update,
    updatedAt: new Date(),
    elapsedTime: (task?.elapsedTime || 0) + (update.elapsedTime || 0),
  });
};

export const deleteTask = async (id: number) => {
  const task = await db.tasks.get(id);
  if (task?.parentID) {
    await updateTask(task.parentID, {
      subTasks: (task.subTasks || []).filter((subTask) => subTask !== id),
      elapsedTime: -(task.elapsedTime || 0),
    });
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
  await db.tasks.delete(id);
};

export const createLog = async (log: Partial<Log>, parentID?: number) => {
  const defaultLog = { name: "Untitled", elapsedTime: 0 };
  if (parentID) {
    const parentTask = await db.tasks.get(parentID);
    if (parentTask) {
      const childId = (await db.logs.put({
        ...defaultLog,
        ...log,
        parentID: Number(parentTask.id),
      })) as number;

      const logs = parentTask?.logs || [];
      if (!logs.includes(childId)) {
        await db.tasks.put({
          ...parentTask,
          logs: [...logs, childId],
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
    if (update.elapsedTime && task?.parentID) {
      await updateTask(task.parentID, { elapsedTime: update.elapsedTime });
    }
    await db.logs.update(id, {
      ...update,
      updatedAt: new Date(),
      // log is at the leaf of the tree, so we don't need to add elapsedTime
      elapsedTime: update.elapsedTime,
    });
  }
};

export const deleteLog = async (id: number) => {
  const log = await db.logs.get(id);
  if (log) {
    const task = await db.tasks.get(log.parentID);
    if (task?.logs) {
      await updateTask(id, {
        ...task,
        elapsedTime: -(log.elapsedTime || 0),
        logs: task.logs.filter((logId) => logId !== id),
      });
    }
  }
  await db.logs.delete(id);
};
