// db.ts
import Dexie, { Table } from "dexie";
import { Task } from "./types/core";

export type TaskWithOptionalId = Omit<Task, "id"> & { id?: number };

export class ChronaLog extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  tasks!: Table<TaskWithOptionalId>;

  constructor() {
    super("ChronaLog");
    this.version(2).stores({
      tasks: "++id, task, parentID", // Primary key and indexed props
    });
  }
}

export const db = new ChronaLog();
