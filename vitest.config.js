import { defineConfig } from 'vitest/config';

// Agent worktrees live under .claude/worktrees and carry their own copies of
// test/, which vitest would otherwise collect and run against stale sources.
export default defineConfig({
  test: { exclude: ['**/node_modules/**', '**/dist/**', '.claude/worktrees/**'] }
});
