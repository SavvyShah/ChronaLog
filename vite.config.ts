/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  // configure vitest. May give a type mismatch error in your code editor. Ignore it.
  test: {},
  plugins: [react()],
});
