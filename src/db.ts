// db.ts
import Dexie, { Table } from "dexie";
import { Task } from "./types/core";

export class Achievo extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  tasks!: Table<Task>;

  constructor() {
    super("Achievo");
    this.version(2).stores({
      tasks: "++id, task", // Primary key and indexed props
    });
  }
}

export const db = new Achievo();
