import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Include files in the playground directory
    include: ["src/playground/**/*.ts"],
    // Exclude default patterns plus the playground directory itself if needed
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
    ],
  },
});
