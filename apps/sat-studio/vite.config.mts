import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { fileURLToPath } from "node:url";

const studentInput = fileURLToPath(new URL("./vite-student.html", import.meta.url));
const adminInput = fileURLToPath(new URL("./vite-admin.html", import.meta.url));
const parentInput = fileURLToPath(new URL("./vite-parent.html", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [svelte()],
  build: {
    outDir: "dist/vite",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        admin: adminInput,
        parent: parentInput,
        student: studentInput,
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
