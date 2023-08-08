// db.ts
import Dexie, { Table } from "dexie";
import { Log, Task } from "./types/core";

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
