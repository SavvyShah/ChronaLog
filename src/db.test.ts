// @vitest-environment jsdom

import { test, beforeEach, afterAll, describe, expect } from "vitest";
import { createLog, createTask, db, updateTask } from "./db";

beforeEach(async () => {
  await db.tasks.clear();
  await db.logs.clear();
});

describe("createTask", () => {
  test("Check if tasks are added as a child of parent", async () => {
    const parentTaskID = await db.tasks.add({ name: "Degree", elapsedTime: 0 });
    await createTask(
      {
        name: "Mathematics",
        elapsedTime: 0,
      },
      Number(parentTaskID)
    );
    const parentTask = await db.tasks.get(Number(parentTaskID));
    const childTask = await db.tasks.get(Number(parentTask?.subTasks?.[0]));
    expect(childTask?.name).toBe("Mathematics");
  });
});

describe("updateTask", () => {
  test("Check if task is updated", async () => {
    const taskID = await db.tasks.add({ name: "Degree", elapsedTime: 0 });
    await updateTask(Number(taskID), { name: "Mathematics" });
    const task = await db.tasks.get(Number(taskID));
    expect(task?.name).toBe("Mathematics");
  });
  test("Check if updating a task name doesn't affect elapsedTime of parent task", async () => {
    // Setup
    const parentTaskID = await db.tasks.add({ name: "Degree", elapsedTime: 0 });
    const childTaskID = await db.tasks.add(
      {
        name: "Untitled",
        elapsedTime: 0,
      },
      Number(parentTaskID)
    );
    db.tasks.update(Number(parentTaskID), { subTasks: [Number(childTaskID)] });

    // Test
    await updateTask(Number(childTaskID), { name: "Mathematics" });
    const parentTask = await db.tasks.get(Number(parentTaskID));
    expect(parentTask?.elapsedTime).toBe(0);
  });
});

describe("createLog", () => {
  test("should be added in the logs property of parent task", async () => {
    // Setup
    const parentTaskID = await db.tasks.add({ name: "Degree", elapsedTime: 0 });

    // Test
    await createLog(
      { name: "Lecture 1", elapsedTime: 10 },
      Number(parentTaskID)
    );
    const parentTask = await db.tasks.get(Number(parentTaskID));
    expect(parentTask?.logs?.length).toBe(1);
    expect(parentTask?.logs?.[0]).toBe(1);
  });

  test("should update elapsedTime of parents", async () => {
    // Setup
    const parentTaskID = await db.tasks.add({ name: "Degree", elapsedTime: 0 });
    const childTaskID = await db.tasks.add(
      {
        name: "Untitled",
        elapsedTime: 0,
        parentID: Number(parentTaskID),
      },
      Number(parentTaskID)
    );
    await db.tasks.update(Number(parentTaskID), {
      subTasks: [Number(childTaskID)],
    });

    // Test
    await createLog(
      { name: "Lecture 1", elapsedTime: 10 },
      Number(childTaskID)
    );
    const parentTask = await db.tasks.get(Number(parentTaskID));
    const childTask = await db.tasks.get(Number(childTaskID));
    expect(parentTask?.elapsedTime).toBe(10);
    expect(childTask?.elapsedTime).toBe(10);
  });
});

afterAll(async () => {
  await db.delete();
});
