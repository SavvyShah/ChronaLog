// db.ts
import Dexie, { Table } from "dexie";
import { Task } from "./types/core";

export type TaskWithOptionalId = Omit<Task, "id"> & { id?: number };

export class Achievo extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  tasks!: Table<TaskWithOptionalId>;

  constructor() {
    super("Achievo");
    this.version(2).stores({
      tasks: "++id, task", // Primary key and indexed props
    });
  }
}

export const db = new Achievo();
