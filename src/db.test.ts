// @vitest-environment jsdom

// sum.test.js
import { expect, test } from "vitest";

test("adds 1 + 2 to equal 3", () => {
  expect(1 + 2).toBe(3);
  expect(typeof window).not.toBe("undefined");
});
